import React, { useRef } from 'react';
import _ from 'lodash';
import { Icon, ScrollView } from 'ming-ui';
import BatchActions from './components/BatchActions';
import ExtraSettingsToolbar from './components/ExtraSettingsToolbar';
import GlobalSetting from './components/GlobalSetting';
import QuotaTable from './components/QuotaTable';
import useQuotaActions from './hooks/useQuotaActions';
import useQuotaData from './hooks/useQuotaData';
import useQuotaSave from './hooks/useQuotaSave';
import { ContentWrap } from './styled';
import {
  getCancelPatch,
  getPersistedLimitCount,
  getResetAppFilterState,
  getResettableLimits,
  hasQuotaUnsavedChanges,
} from './utils';
import { getBatchMax, getLimitSizeInfo, getResetDescription } from './viewUtils';

export default function LimitAttachmentUpload({
  projectId,
  title,
  columns = [],
  globalDesc,
  globalUnit,
  globalSize,
  businessType = 1,
  updateData = () => {},
  onClose = () => {},
}) {
  const loadingMoreRef = useRef(false);
  const { state, setState, loadLimits, loadAppList, loadWorksheetList } = useQuotaData({
    projectId,
    businessType,
    globalSize,
  });
  const actions = useQuotaActions({
    projectId,
    businessType,
    globalUnit,
    state,
    setState,
    loadLimits,
    loadAppList,
  });
  const onSave = useQuotaSave({ projectId, businessType, updateData, state, setState, loadLimits });
  const {
    size,
    limits,
    initialLimits,
    initialSize,
    loading,
    loadingMore,
    loadingApp,
    saveLoading,
    appList,
    appIds,
    worksheetList,
    worksheetIds,
    isMoreApp,
    pageIndex,
    total,
    initialTotal,
    appPageIndex,
    selectedIds,
    sortField,
    sortType,
    batchEditVisible,
    batchSize,
    resetLoading,
    resetVisible,
    resetRows = [],
    resetSelectedCount = resetRows.length,
    limitRowTotal,
    limitSize,
    clickSubmit,
  } = state;

  const hasUnsavedChanges = hasQuotaUnsavedChanges({ initialLimits, limits, initialSize, size });
  const disabled = !hasUnsavedChanges;
  const selectedRows = limits.filter(item => selectedIds.includes(item.entityId));
  const resettableRows = getResettableLimits(selectedRows);
  const batchMax = getBatchMax({ businessType, limitRowTotal });
  const persistedLimitCount = getPersistedLimitCount(limits);
  const hasMore = persistedLimitCount < total;

  const loadFirstPage = (overrides = {}) => {
    setState({ pageIndex: 1, selectedIds: [], lastSelectedId: undefined, ...overrides });
    loadLimits({ pageIndex: 1, ...overrides });
  };

  const loadMore = () => {
    if (loading || loadingMore || loadingMoreRef.current || !hasMore) return;
    const nextPageIndex = pageIndex + 1;

    loadingMoreRef.current = true;
    setState({ pageIndex: nextPageIndex });
    loadLimits({ pageIndex: nextPageIndex, append: true }).finally(() => {
      loadingMoreRef.current = false;
    });
  };

  const clearApps = () => {
    actions.searchApps.cancel();
    const resetAppFilterState = getResetAppFilterState();
    setState(resetAppFilterState);
    loadAppList({ appPageIndex: 1, keyword: '' });
    if (businessType === 2) {
      loadWorksheetList([]);
      return;
    }

    loadLimits({ appIds: [], worksheetIds: [], pageIndex: 1 });
  };

  const changeApps = value => {
    actions.searchApps.cancel();
    setState({ appIds: value, appPageIndex: 1, keyword: '' });
    loadAppList({ appPageIndex: 1, keyword: '' });
    if (businessType === 2) loadWorksheetList(value);
  };

  const queryLimits = () => {
    if (_.isEmpty(worksheetIds)) return alert(_l('请选择查询的工作表'), 3);
    loadFirstPage();
  };

  const resetFilters = () => {
    clearApps();
    loadFirstPage({ appIds: [], worksheetIds: [] });
  };

  return (
    <div className="orgManagementWrap">
      <div className="orgManagementHeader">
        <div className="flexRow alignItemsCenter">
          <Icon icon="backspace" className="Font22 hoverColorPrimary pointer" onClick={onClose} />
          <div className="Font17 bold flex mLeft10">{title}</div>
        </div>
      </div>
      <ContentWrap className="orgManagementContent Raletive pRight0">
        <ScrollView className="quotaContentScroll" onScrollEnd={loadMore}>
          <div className="limitWrap">{getLimitSizeInfo({ businessType, limitRowTotal })}</div>
          <div className="Font15 bold mBottom12">{_l('全局配置')}</div>
          <GlobalSetting
            globalDesc={globalDesc}
            globalUnit={globalUnit}
            businessType={businessType}
            size={size}
            clickSubmit={clickSubmit}
            limitRowTotal={limitRowTotal}
            hapLimitSize={limitSize}
            onChange={value => setState({ size: value })}
            onBlur={actions.onBlur}
          />
          <div className="Font15 bold mBottom12">{_l('额外配置')}</div>
          <ExtraSettingsToolbar
            businessType={businessType}
            appIds={appIds}
            appList={appList}
            worksheetIds={worksheetIds}
            worksheetList={worksheetList}
            isMoreApp={isMoreApp}
            appPageIndex={appPageIndex}
            loadingApp={loadingApp}
            selectedIds={selectedIds}
            resetLoading={resetLoading}
            resettableRows={resettableRows}
            onSearchApps={actions.searchApps}
            onClearApps={clearApps}
            onLoadMoreApps={loadAppList}
            onCloseApps={loadFirstPage}
            onChangeApps={changeApps}
            onChangeWorksheets={value => setState({ worksheetIds: value })}
            onQuery={queryLimits}
            onResetFilters={resetFilters}
            onResetUsage={actions.handleReset}
            onBatchEdit={actions.showBatchEdit}
            onBatchRemove={actions.batchRemove}
            onAdd={actions.showAddList}
          />
          <QuotaTable
            columns={columns}
            limits={limits}
            selectedIds={selectedIds}
            sortField={sortField}
            sortType={sortType}
            loading={loading}
            pageIndex={pageIndex}
            loadingMore={loadingMore}
            projectId={projectId}
            businessType={businessType}
            clickSubmit={clickSubmit}
            limitRowTotal={limitRowTotal}
            onToggleSelectAll={actions.toggleSelectAll}
            onToggleSelect={actions.toggleSelect}
            onSort={actions.handleSort}
            onChangeItemSize={actions.changeItemSize}
            onBlur={actions.onBlur}
            onReset={actions.handleReset}
            onRemove={actions.remove}
          />
        </ScrollView>
        <BatchActions
          loading={loading}
          saveLoading={saveLoading}
          disabled={disabled}
          onSave={onSave}
          onCancel={() => setState(getCancelPatch({ initialLimits, initialSize, initialTotal }))}
          businessType={businessType}
          resetLoading={resetLoading}
          batchEditVisible={batchEditVisible}
          batchSize={batchSize}
          batchMax={batchMax}
          globalUnit={globalUnit}
          onBatchSizeChange={value => setState({ batchSize: value })}
          onApplyBatchEdit={actions.applyBatchEdit}
          onCloseBatchEdit={() => setState({ batchEditVisible: false })}
          resetVisible={resetVisible}
          resetDescription={getResetDescription({ businessType, resetRows, selectedCount: resetSelectedCount })}
          selectedCount={resetSelectedCount}
          resetRows={resetRows}
          loadedCount={persistedLimitCount}
          total={total}
          onConfirmReset={actions.confirmReset}
          onCloseReset={() => !resetLoading && setState({ resetVisible: false, resetRows: [], resetSelectedCount: 0 })}
        />
      </ContentWrap>
    </div>
  );
}
