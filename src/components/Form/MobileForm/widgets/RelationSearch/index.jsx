import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _, { identity } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Skeleton } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import { RecordInfoModal } from 'mobile/Record';
import { openAddRecord } from 'mobile/Record/addRecord';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import { RELATION_SEARCH_SHOW_TYPE } from 'src/utils/domain/control/formEnum';
import { controlState } from 'src/utils/domain/control/state';
import { RECORD_INFO_FROM } from 'src/utils/domain/worksheet/constants';
import { getFilter } from 'src/utils/domain/worksheet/filterDynamic';
import { emitter } from 'src/utils/platform/browser/dom';
import { addBehaviorLog } from 'src/utils/services/project';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';
import ChildTableFlatComp from '../../components/ChildTable/ChildTableFlatComp';
import MobileTable from '../../components/ChildTable/MobileTable';
import SearchInput from '../../components/ChildTable/SearchInput';
import { TableComponent } from '../../components/ChildTable/TableComponent';
import { LoadingButton } from '../../components/RelateRecordCards';
import { getViewportSize } from '../../tools/viewport';
import Cards from './Cards';
import Texts from './Text';

const PAGE_SIZE = 50;
const LIST_LOAD_PAGE_SIZE = 200;
const LIST_MAX_LOAD_COUNT = 1000;
const TABLE_PAGE_SIZE = 20;

const isMultipleListControl = control =>
  control.sourceControlType === 2 &&
  control.enumDefault === 2 &&
  String(_.get(control, 'advancedSetting.h5showtype') || '2') === '1';

const MultiRecordLoading = () => (
  <div style={{ padding: 10 }}>
    <Skeleton
      className="pAll20"
      active
      paragraph={{
        rows: 4,
        width: ['30%', '40%', '90%', '60%'],
      }}
    />
  </div>
);

const OperateWrap = styled.div`
  justify-content: flex-end;
  align-items: center;
  height: 40px;
  ${({ $separate }) =>
    $separate
      ? 'margin: 6px 0;'
      : `
        margin-top: -6px;
        position: absolute;
        top: -34px;
      `}

  .addRecordButton {
    margin-right: auto;
  }

  .operateBtnBox {
    display: flex;
    align-items: center;

    .icon {
      font-size: 20px;
      color: var(--color-text-tertiary);
    }
    .themeIcon {
      color: var(--color-primary);
    }
  }
`;

const ConfiguredTableRoot = styled.div`
  position: relative;
`;

const WithoutRowsWrap = styled.div`
  position: absolute;
  inset: 0;
  background-color: var(--color-background-secondary);
`;

const HorizontalConfiguredContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: ${props => (props.$height ? `${props.$height}px` : '100%')};
  width: ${props => (props.$width ? `${props.$width}px` : '100%')};
  overflow: hidden;
  box-sizing: border-box;
  background: var(--color-background-primary);
  ${props =>
    props.$isHorizontalPortrait &&
    `
      transform: rotate(90deg);
      transform-origin: top left;
      left: ${props.$height}px;
    `}
  ${props =>
    props.$isHorizontal &&
    !props.$isHorizontalPortrait &&
    `
      padding-left: constant(safe-area-inset-left);
      padding-left: env(safe-area-inset-left);
      padding-right: constant(safe-area-inset-right);
      padding-right: env(safe-area-inset-right);
      max-height: 100dvh;
      max-width: 100dvw;
    `}

  .expandChildTableHeader {
    padding: 16px 16px 0;
    align-items: center;

    .mobileSearchInputComp.inputBlur {
      background-color: transparent !important;
    }
  }

  .horizontalScrollContent {
    flex: 1;
    min-height: 0;
    padding: 0 16px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--color-text-disabled) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--color-text-disabled);
      border-radius: 6px;
    }
  }

  .horizontalTableContent {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    > .mobileChildTableCon {
      flex: 1;
      min-height: 0 !important;
      margin-bottom: 0;
    }
  }

  .expandChildTableCon {
    overflow-x: hidden;
    overflow-y: auto;
  }
`;

const RowHeightPopupContent = styled.div`
  padding: 0 16px 12px;

  .header {
    width: 100%;
    line-height: 24px;
    padding: 16px 0 10px;
    justify-content: space-between;
  }

  .closeIcon {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    background: var(--color-border-secondary);
  }

  .rowHeightItem {
    min-height: 44px;
  }
`;

export default function RelationSearch(props) {
  const {
    isDialog,
    from,
    disabled,
    projectId,
    recordId,
    worksheetId,
    viewId,
    isCharge,
    advancedSetting,
    enumDefault,
    enumDefault2,
    formDisabled,
    showRelateRecordEmpty,
  } = props;

  const control = { ...props };
  const controlPermission = controlState(control, from);
  const cache = useRef({});
  const [state, setState] = useState({
    showAll: isDialog,
    showExpand: false,
    expandShowType: 'current',
    showRowHeightModal: false,
    h5height: advancedSetting.h5height || '0',
    keywords: '',
    isMobileSearchFocus: false,
    viewportSize: { width: 0, height: 0 },
    tablePageIndex: 1,
  });
  const [recordInfoVisible, setRecordInfoVisible] = useState(false);
  const [worksheetAllowAdd, setWorksheetAllowAdd] = useState(true);
  const [openRecordId, setOpenRecordId] = useState('');
  const {
    loading = true,
    entityName,
    showAll,
    records = [],
    controls = [],
    showLoadMore,
    pageIndex,
    isLoadingMore,
    count,
    showExpand,
    expandShowType,
    showRowHeightModal,
    h5height,
    keywords,
    isMobileSearchFocus,
    viewportSize,
    tablePageIndex,
  } = state;
  const allowOpenRecord = _.get(advancedSetting, 'allowlink') === '1' && !_.get(window, 'shareState.shareId');
  const allowNewRecord =
    worksheetAllowAdd &&
    !disabled &&
    recordId &&
    controlPermission.editable &&
    enumDefault2 !== 1 &&
    enumDefault2 !== 11 &&
    !window.isPublicWorksheet;

  useEffect(() => {
    if (!loading) {
      emitter.emit(`relationSearchCount:${control.controlId}`, count);
    }
  }, [control.controlId, count, loading]);

  const loadRecords = async (pageIndex = 1, keywords = '', loadedRelationControls, loadedCount = 0, batchRequestId) => {
    const isListStyle = isMultipleListControl(control);
    const pageSize = isListStyle ? LIST_LOAD_PAGE_SIZE : PAGE_SIZE;
    const requestId = batchRequestId || (cache.current.loadRequestId || 0) + 1;
    let relationControls = loadedRelationControls || [...controls];

    if (!batchRequestId) {
      cache.current.loadRequestId = requestId;
    }

    setState(oldState => ({ ...oldState, isLoadingMore: true, loading: isListStyle || pageIndex === 1 }));
    if (_.isEmpty(relationControls)) {
      relationControls = await sheetAjax
        .getWorksheetInfo({
          worksheetId: control.dataSource,
          getTemplate: true,
          relationWorksheetId: worksheetId,
        })
        .then(res => {
          setWorksheetAllowAdd(res.allowAdd);
          return _.get(res, 'template.controls') || [];
        });
      setState(oldState => ({ ...oldState, controls: relationControls }));
    }

    if (requestId !== cache.current.loadRequestId) return;

    const filterControls = getFilter({
      control: { ...control, relationControls, recordId },
      formData: control.formData,
      filterKey: 'resultfilters',
      appId: control.appId,
    });
    cache.current.filter = filterControls;
    if (filterControls === false) {
      setState(oldState => ({ ...oldState, isLoadingMore: false, loading: false }));
      return;
    }

    const args = {
      worksheetId,
      viewId,
      searchType: 1,
      status: 1,
      isGetWorksheet: true,
      getType: control.from === RECORD_INFO_FROM.DRAFT ? 21 : 7,
      filterControls: filterControls || [],
      rowId: recordId,
      controlId: control.controlId,
      pageIndex,
      pageSize: control.enumDefault === 1 ? 1 : pageSize,
      getWorksheet: pageIndex === 1,
      getRules: pageIndex === 1,
      keywords,
    };
    return sheetAjax.getRowRelationRows(args).then(res => {
      if (requestId !== cache.current.loadRequestId) return;

      if (res.resultCode === 7) {
        // 无权限响应不含工作表结构，保留已加载的 controls，避免动态筛选变化触发循环查询。
        setWorksheetAllowAdd(false);
        setState(oldState => ({
          ...oldState,
          loading: false,
          isLoadingMore: false,
          records: [],
          count: 0,
          showLoadMore: false,
        }));
        return;
      }

      const responseRecords = _.isArray(_.get(res, 'data')) ? res.data : [];
      const responseCount = Number.isFinite(_.get(res, 'count')) ? res.count : responseRecords.length;

      setWorksheetAllowAdd(_.get(res, 'worksheet.allowAdd'));
      if (_.get(res, 'worksheet.template.controls')) {
        res.worksheet.template.controls = replaceControlsTranslateInfo(
          res.worksheet.appId,
          res.worksheet.worksheetId,
          _.get(res, 'worksheet.template.controls'),
        );
      }

      setState(oldState => {
        const mergedRecords = pageIndex === 1 ? responseRecords : [...(oldState.records || []), ...responseRecords];
        const uniqueRecords = _.uniqBy(mergedRecords, 'rowid');
        const newRecords = isListStyle ? uniqueRecords.slice(0, LIST_MAX_LOAD_COUNT) : uniqueRecords;
        const nextLoadedCount = loadedCount + responseRecords.length;
        const shouldContinueLoading = isListStyle && responseRecords.length > 0 && nextLoadedCount < responseCount;

        return {
          ...oldState,
          loading: shouldContinueLoading,
          records: newRecords,
          pageIndex,
          isLoadingMore: shouldContinueLoading,
          controls: pageIndex === 1 ? _.get(res, 'worksheet.template.controls') : oldState.controls,
          count: responseCount,
          entityName: _.get(res, 'worksheet.entityName'),
          showAll,
          showLoadMore:
            newRecords.length < Math.min(responseCount, isListStyle ? LIST_MAX_LOAD_COUNT : responseCount) &&
            responseRecords.length > 0,
          ...(pageIndex === 1 ? { tablePageIndex: 1 } : {}),
        };
      });

      const nextLoadedCount = loadedCount + responseRecords.length;

      if (isListStyle && responseRecords.length > 0 && nextLoadedCount < responseCount) {
        return loadRecords(pageIndex + 1, keywords, relationControls, nextLoadedCount, requestId);
      }
    });
  };

  const loadAllRecords = async () => {
    if (isMultipleListControl(control) || isLoadingMore || records.length >= count) return;

    const totalPage = Math.ceil(count / PAGE_SIZE);

    for (let nextPageIndex = pageIndex + 1; nextPageIndex <= totalPage; nextPageIndex++) {
      await loadRecords(nextPageIndex, keywords);
    }
  };

  const debounceClearAndLoad = useCallback(
    _.debounce(() => {
      setState(oldState => ({ ...oldState, records: [] }));
      loadRecords();
    }, 400),
    [control.formData, state],
  );
  const handleAddRecord = useCallback(() => {
    openAddRecord({
      className: 'full',
      isDraft: control.from === RECORD_INFO_FROM.DRAFT,
      worksheetId: control.dataSource,
      showDraftsEntry: true,
      entityName,
      onAdd: record => {
        if (record) {
          setState(oldState => ({
            ...oldState,
            records: [record, ...(oldState.records || [])],
            count: (oldState.count || (oldState.records || []).length) + 1,
          }));
        }
      },
    });
  });
  const handleOpenRecord = useCallback(needOpenRecordId => {
    addBehaviorLog('worksheetRecord', control.dataSource, { rowId: needOpenRecordId }); // 埋点
    setRecordInfoVisible(true);
    setOpenRecordId(needOpenRecordId);
  });

  useEffect(() => {
    loadRecords();
    if (_.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(`relation_search_${control.controlId}`, () => {
        setState({ ...state, records: [] });
        loadRecords();
      });
    }
  }, []);
  useEffect(() => {
    const newFilter = getFilter({
      control: { ...control, relationControls: controls, recordId },
      formData: control.formData,
      filterKey: 'resultfilters',
      appId: control.appId,
    });

    if (!_.isUndefined(cache.current.filter) && newFilter && !_.isEqual(cache.current.filter, newFilter)) {
      cache.current.filter = newFilter;
      debounceClearAndLoad();
    } else if (!_.isEqual(cache.current.filter, newFilter) && newFilter === false) {
      cache.current.filter = newFilter;
      setState(oldState => ({ ...oldState, loading: false, records: [] }));
    }
  });
  useEffect(() => {
    if (!showExpand) return undefined;

    let viewportResizeTimer;

    const updateViewportSize = () => {
      clearTimeout(viewportResizeTimer);
      viewportResizeTimer = setTimeout(() => {
        setState(oldState => ({ ...oldState, viewportSize: getViewportSize() }));
      }, 100);
    };

    window.addEventListener('resize', updateViewportSize);
    window.addEventListener('orientationchange', updateViewportSize);
    window.visualViewport && window.visualViewport.addEventListener('resize', updateViewportSize);

    return () => {
      clearTimeout(viewportResizeTimer);
      window.removeEventListener('resize', updateViewportSize);
      window.removeEventListener('orientationchange', updateViewportSize);
      window.visualViewport && window.visualViewport.removeEventListener('resize', updateViewportSize);
    };
  }, [showExpand]);

  const relationSearchShowType = _.get(advancedSetting, 'showtype');
  const isConfiguredTable = control.sourceControlType === 2;
  const isMultipleCard =
    !isConfiguredTable && enumDefault === 2 && relationSearchShowType === String(RELATION_SEARCH_SHOW_TYPE.CARD);
  const isMultipleCardStyle =
    isMultipleCard || (isConfiguredTable && enumDefault === 2 && String(advancedSetting.h5showtype || '2') === '2');
  const isMultipleListStyle = isMultipleListControl(control);
  const isMultipleTableStyle =
    isConfiguredTable && enumDefault === 2 && String(advancedSetting.h5showtype || '2') === '3';
  const useConfiguredRenderer = isConfiguredTable || isMultipleCard;
  const useConfiguredTableLoadingPosition = !isDialog && isConfiguredTable && enumDefault === 2;
  const showControlIds = control.showControls || [];
  const titleControl =
    _.find(controls, { controlId: advancedSetting.showtitleid }) || _.find(controls, { attribute: 1 });
  const displayControls = _.uniqBy(
    showControlIds
      .map(controlId => _.find(controls, { controlId }))
      .concat(titleControl)
      .filter(identity),
    'controlId',
  );
  const h5abstractids = safeParse(advancedSetting.h5abstractids, 'array');
  const mobileIsEdit = !disabled && !formDisabled;
  const showConfiguredSearch = enumDefault === 2;

  const getConfiguredH5ShowType = ({ expanded = false, displayType = 'current' } = {}) => {
    if (expanded && displayType === 'table') return '3';
    if (isMultipleCard) return '2';

    return String(advancedSetting.h5showtype || '2');
  };

  const expandH5ShowType = getConfiguredH5ShowType({ expanded: true, displayType: expandShowType });
  const isExpandTable = showExpand && expandH5ShowType === '3';
  const isHorizontalPortrait = isExpandTable && viewportSize.width <= viewportSize.height;
  const isInitialEmptyTableControl = !keywords && _.isEmpty(records) && isConfiguredTable && enumDefault === 2;

  const renderConfiguredContent = ({ expanded = false, displayType = 'current' } = {}) => {
    const h5showtype = getConfiguredH5ShowType({ expanded, displayType });
    const useMultipleCardStyle = !expanded && h5showtype === '2' && enumDefault === 2;
    const useMultipleListStyle = !expanded && h5showtype === '1' && enumDefault === 2;
    const useTablePagination = h5showtype === '3' && enumDefault === 2;
    const showRecords =
      useMultipleCardStyle || useMultipleListStyle || useTablePagination || expanded || showAll || records.length <= 3
        ? records
        : records.slice(0, 3);
    const commonProps = {
      appId: control.appId,
      cellErrors: {},
      control: {
        ...control,
        relationControls: controls,
        advancedSetting: {
          ...advancedSetting,
          showtitleid: advancedSetting.showtitleid || _.get(titleControl, 'controlId'),
        },
      },
      controlPermission: { ...controlPermission, editable: false },
      controls: displayControls,
      disabled: true,
      h5abstractids,
      isEdit: false,
      onOpen: index => {
        const record = showRecords[index];

        if (record && allowOpenRecord) {
          handleOpenRecord(record.rowid);
        }
      },
      projectId,
      rows: showRecords,
      showControls: showControlIds,
      showExpand: expanded,
      showNumber: false,
      worksheetId: control.dataSource,
    };

    if (h5showtype === '3') {
      const isExpandedFromList = expanded && displayType === 'table';

      return (
        <TableComponent
          {...commonProps}
          h5height={h5height}
          showHeader={!!keywords || !_.isEmpty(showRecords)}
          pagination={
            isExpandedFromList
              ? { pageIndex: 1, count: showRecords.length, pageSize: Math.max(showRecords.length, 1) }
              : { pageIndex: tablePageIndex, count, pageSize: TABLE_PAGE_SIZE }
          }
          updatePagination={
            isExpandedFromList
              ? undefined
              : ({ pageIndex: nextPageIndex }) => {
                  setState(oldState => ({ ...oldState, tablePageIndex: nextPageIndex }));

                  if (nextPageIndex * TABLE_PAGE_SIZE > records.length && records.length < count && !isLoadingMore) {
                    loadRecords(pageIndex + 1, keywords);
                  }
                }
          }
        />
      );
    }

    if (h5showtype === '2') {
      return (
        <ChildTableFlatComp
          {...commonProps}
          filterControlsByPermission={false}
          from={from}
          hideExpandAll={enumDefault === 1 || (useMultipleCardStyle && mobileIsEdit)}
          inheritCardStyle
          openRecordOnClick={(enumDefault === 1 || useMultipleCardStyle) && allowOpenRecord}
        />
      );
    }

    return <MobileTable {...commonProps} />;
  };

  const renderConfiguredOperations = expanded => {
    const currentH5ShowType = getConfiguredH5ShowType({ expanded, displayType: expandShowType });

    return (
      <OperateWrap className="w100 flexRow" $separate>
        {!expanded && !isMobileSearchFocus && allowNewRecord && (
          <div className="addRecordButton customFormControlBox customFormButton" onClick={handleAddRecord}>
            <i className="icon icon-plus Font16 mRight6" />
            <span>{entityName || _l('记录')}</span>
          </div>
        )}
        {showConfiguredSearch && (
          <SearchInput
            inputWidth={100}
            searchIcon={
              <div className="operateBtnBox">
                <i className="icon icon-search" />
              </div>
            }
            keywords={keywords}
            focusedClass={cx({ mRight10: !isMobileSearchFocus })}
            onOk={value => {
              setState(oldState => ({ ...oldState, keywords: value }));
              loadRecords(1, value);
            }}
            onClear={() => {
              setState(oldState => ({ ...oldState, keywords: '', isMobileSearchFocus: false }));
              loadRecords(1, '');
            }}
            onFocus={() => setState(oldState => ({ ...oldState, isMobileSearchFocus: true }))}
            onBlur={() => setState(oldState => ({ ...oldState, isMobileSearchFocus: false }))}
          />
        )}
        {!isMobileSearchFocus && recordId && (
          <span className="mLeft12 Hand" onClick={() => loadRecords(1, keywords)}>
            <div className="operateBtnBox">
              <i className="icon icon-task-later" />
            </div>
          </span>
        )}
        {!isMobileSearchFocus && !mobileIsEdit && currentH5ShowType === '3' && (
          <span
            className="mLeft12 Hand"
            onClick={() => setState(oldState => ({ ...oldState, showRowHeightModal: true }))}
          >
            <div className="operateBtnBox">
              <i
                className={cx('icon icon-row_height', {
                  colorPrimary: h5height !== (advancedSetting.h5height || '0'),
                })}
              />
            </div>
          </span>
        )}
        {!isMobileSearchFocus && !mobileIsEdit && !keywords && (
          <Fragment>
            {!expanded && currentH5ShowType !== '3' && (
              <span
                className="mLeft12 Hand"
                onClick={() => {
                  setState(oldState => ({
                    ...oldState,
                    showExpand: true,
                    expandShowType: 'table',
                    viewportSize: getViewportSize(),
                  }));
                  if (currentH5ShowType === '1') {
                    loadAllRecords();
                  }
                }}
              >
                <div className="operateBtnBox">
                  <i className="icon icon-table" />
                </div>
              </span>
            )}
            <span
              className="mLeft12 Hand"
              onClick={() =>
                setState(oldState => ({
                  ...oldState,
                  showExpand: !expanded,
                  expandShowType: 'current',
                  viewportSize: getViewportSize(),
                }))
              }
            >
              <div className="operateBtnBox">
                <i className={cx('icon', expanded ? 'themeIcon icon-zoom_out2' : 'icon-enlarge1')} />
              </div>
            </span>
          </Fragment>
        )}
      </OperateWrap>
    );
  };

  const isInitialEmpty = !loading && !keywords && _.isEmpty(records);

  if (loading && !keywords && enumDefault === 2 && showRelateRecordEmpty && _.isEmpty(records)) {
    return <MultiRecordLoading />;
  }

  if (isInitialEmpty && (!isConfiguredTable || !showRelateRecordEmpty)) {
    return <div className="customFormNull" />;
  }

  if (isInitialEmpty && enumDefault === 2 && isConfiguredTable && showRelateRecordEmpty) {
    return (
      <WithoutRowsWrap className="withoutRowsWrapper flexColumn valignWrapper h100">
        <WithoutRows text={_l('暂无记录')} />
      </WithoutRowsWrap>
    );
  }

  if (!loading && control.type === 51 && control.enumDefault === 1 && showControlIds.length === 0) {
    return <div className="customFormNull" />;
  }

  return (
    <Fragment>
      {loading &&
        !useConfiguredTableLoadingPosition &&
        (enumDefault === 2 && useConfiguredRenderer ? (
          <MultiRecordLoading />
        ) : (
          <div
            style={
              isDialog
                ? {
                    paddingTop: 'calc(50% - 50px)',
                  }
                : {
                    display: 'inline-block',
                    marginBottom: 6,
                  }
            }
          >
            <LoadDiv size={isDialog ? 'big' : 'small'} />
          </div>
        ))}

      {useConfiguredRenderer ? (
        <ConfiguredTableRoot>
          {!isInitialEmptyTableControl && renderConfiguredOperations(false)}
          {loading && useConfiguredTableLoadingPosition && <MultiRecordLoading />}
          {!loading && renderConfiguredContent()}
          {!isMultipleCardStyle && !isMultipleListStyle && !isMultipleTableStyle && records.length > 3 && (
            <div className="mBottom10">
              {showLoadMore && showAll && (
                <LoadingButton
                  onClick={() => {
                    if (!isLoadingMore) {
                      loadRecords(pageIndex + 1, keywords);
                    }
                  }}
                >
                  {isLoadingMore && (
                    <span className="loading">
                      <i className="icon icon-loading_button" />
                    </span>
                  )}
                  {_l('加载更多')}
                </LoadingButton>
              )}
              <LoadingButton onClick={() => setState(oldState => ({ ...oldState, showAll: !showAll }))}>
                {showAll ? _l('收起') : _l('展开更多')}
              </LoadingButton>
            </div>
          )}
          {showExpand && (
            <Popup
              className="mobileModal full expandChildTable"
              position="left"
              visible
              bodyStyle={{ width: '100%', height: '100%' }}
              onMaskClick={() => setState(oldState => ({ ...oldState, showExpand: false, expandShowType: 'current' }))}
            >
              <HorizontalConfiguredContent
                $isHorizontal={isExpandTable}
                $isHorizontalPortrait={isHorizontalPortrait}
                $height={isExpandTable ? (isHorizontalPortrait ? viewportSize.width : viewportSize.height) : undefined}
                $width={isExpandTable ? (isHorizontalPortrait ? viewportSize.height : viewportSize.width) : undefined}
              >
                <div
                  className={cx('Relative w100 h100 flexColumn', {
                    expandChildTableCon: expandH5ShowType !== '3',
                  })}
                >
                  <div className="expandChildTableHeader">
                    <div className="controlLabelName flex ellipsis">
                      {control.controlName}
                      {`(${count || records.length})`}
                    </div>
                    {renderConfiguredOperations(true)}
                  </div>
                  <div
                    className={cx('horizontalScrollContent', {
                      horizontalTableContent: expandH5ShowType === '3',
                    })}
                  >
                    <div
                      className={cx('mobileChildTableCon', {
                        'flex flexColumn': expandH5ShowType === '3',
                      })}
                    >
                      {renderConfiguredContent({ expanded: true, displayType: expandShowType })}
                    </div>
                  </div>
                </div>
              </HorizontalConfiguredContent>
            </Popup>
          )}
          {showRowHeightModal && (
            <Popup
              className="mobileModal"
              visible
              bodyStyle={{ borderRadius: 8 }}
              onMaskClick={() => setState(oldState => ({ ...oldState, showRowHeightModal: false }))}
            >
              <RowHeightPopupContent>
                <div className="flexRow header">
                  <div className="Font13 textTertiary flex">{_l('表格行高')}</div>
                  <div
                    className="closeIcon Hand"
                    onClick={() => setState(oldState => ({ ...oldState, showRowHeightModal: false }))}
                  >
                    <i className="icon icon-close Font17 textTertiary bold" />
                  </div>
                </div>
                {[
                  { value: '0', text: _l('紧凑') },
                  { value: '1', text: _l('中等') },
                  { value: '2', text: _l('高') },
                  { value: '3', text: _l('自适应') },
                ].map(item => (
                  <div
                    key={item.value}
                    className="rowHeightItem flexRow alignItemsCenter Hand"
                    onClick={() =>
                      setState(oldState => ({
                        ...oldState,
                        h5height: item.value,
                        showRowHeightModal: false,
                      }))
                    }
                  >
                    <div className="flex">{item.text}</div>
                    {h5height === item.value && <i className="icon icon-done colorPrimary Font20" />}
                  </div>
                ))}
              </RowHeightPopupContent>
            </Popup>
          )}
        </ConfiguredTableRoot>
      ) : _.get(advancedSetting, 'showtype') === String(RELATION_SEARCH_SHOW_TYPE.CARD) ||
        _.get(advancedSetting, 'showtype') === String(RELATION_SEARCH_SHOW_TYPE.LIST) ? (
        <Fragment>
          {disabled && formDisabled && enumDefault === 2 && (
            <OperateWrap className="w100 flexRow">
              <SearchInput
                inputWidth={100}
                searchIcon={<i className="icon icon-search" />}
                onOk={value => loadRecords(1, value)}
                onClear={() => {
                  loadRecords(1, '');
                }}
              />
            </OperateWrap>
          )}
          <Cards
            {...{
              loading,
              entityName,
              allowOpenRecord,
              allowNewRecord,
              records,
              showAll,
              projectId,
              viewId,
              isCharge,
              controls,
              advancedSetting,
              control,
              showLoadMore,
              isLoadingMore,
              setState,
              loadRecords,
              pageIndex,
              onAdd: handleAddRecord,
              onOpen: handleOpenRecord,
              disabled,
              mobileIsEdit,
            }}
          />
        </Fragment>
      ) : (
        <Texts
          allowOpenRecord={allowOpenRecord}
          allowNewRecord={allowNewRecord}
          entityName={entityName}
          records={records}
          control={{ ...control, relationControls: controls }}
          onAdd={handleAddRecord}
          onOpen={handleOpenRecord}
          disabled={disabled}
        />
      )}

      {recordInfoVisible && (
        <RecordInfoModal
          className="full"
          visible
          appId={control.appId}
          worksheetId={control.dataSource}
          viewId={_.get(control, 'advancedSetting.openview') || control.viewId}
          rowId={openRecordId}
          onClose={() => {
            setRecordInfoVisible(false);
          }}
        />
      )}
    </Fragment>
  );
}
