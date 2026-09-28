import React, { useEffect, useMemo, useRef } from 'react';
import _ from 'lodash';
import { dialogSelectApp, dialogSelectWorksheet } from 'ming-ui/functions';
import dataLimitAjax from 'src/api/dataLimit';
import workflowDataLimitAjax from 'src/pages/workflow/apiV2/DataLimit';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import QuickLimitSetting from '../components/QuickLimitSetting';
import {
  getAddDraftLimitsPatch,
  getMinLimit,
  getNextSelectedIds,
  getNextSorter,
  getRemovedPersistedLimitCount,
  getResettableLimits,
  isUsageResetSupported,
  removeSelectedLimits,
  updateSelectedLimitSize,
} from '../utils';

/** 新增实体时优先使用弹层快捷额度，否则回退到全局额度或业务最小值。 */
const getDefaultLimit = ({ quickAddSize, size, businessType }) =>
  _.isNumber(quickAddSize) ? quickAddSize : size === -1 ? (_.includes([1, 2, 4], businessType) ? 1 : 0) : size;

/**
 * 管理额度页的用户操作，包括新增、排序、选择、批量编辑和用量重置。
 * 数据请求由 useQuotaData 注入，避免操作 Hook 重复维护页面数据。
 */
export default function useQuotaActions({
  projectId,
  businessType,
  globalUnit,
  state,
  setState,
  loadLimits,
  loadAppList,
}) {
  const quickAddSize = useRef();
  // 延迟请求应用候选项，减少连续输入产生的无效接口调用。
  const searchApps = useMemo(
    () =>
      _.debounce(value => {
        setState({ keyword: value, appPageIndex: 1 });
        loadAppList({ keyword: value, appPageIndex: 1 });
      }, 500),
    [loadAppList, setState],
  );

  useEffect(() => () => searchApps.cancel(), [searchApps]);

  /** 切换排序字段或方向，并从第一页重新查询。 */
  const handleSort = nextSortField => {
    const sorter = getNextSorter(state, nextSortField);
    setState({ ...sorter, pageIndex: 1, selectedIds: [], lastSelectedId: undefined });
    loadLimits({ ...sorter, pageIndex: 1 });
  };

  /** 将应用选择结果转换成额度行，并过滤当前页已有应用。 */
  const addApps = data => {
    const { accountId, fullname, avatar } = _.get(md, 'global.Account') || {};
    const currentIds = state.limits.map(item => item.entityId);
    const limits = data
      .filter(item => !currentIds.includes(item.appId))
      .map(item => ({
        app: { ...item, appIconColor: item.iconColor, appIconUrl: item.iconUrl },
        entityId: item.appId,
        size: getDefaultLimit({ quickAddSize: quickAddSize.current, ...state, businessType }),
        user: { accountId, fullname, avatar },
      }));
    setState(getAddDraftLimitsPatch({ limits: state.limits, addedLimits: limits, total: state.total }));
  };

  /** 将工作表选择结果转换成额度行，并保留所属应用信息。 */
  const addWorksheets = data => {
    const { accountId, fullname, avatar } = _.get(md, 'global.Account') || {};
    const currentIds = state.limits.map(item => item.entityId);
    const limits = data
      .filter(item => !currentIds.includes(item.workSheetId))
      .map(item => ({
        app: { ...item.app, appIconColor: _.get(item, 'app.iconColor'), appIconUrl: _.get(item, 'app.iconUrl') },
        appItem: {
          color: item.iconColor,
          iconUrl: item.iconUrl,
          id: item.workSheetId,
          name: item.workSheetName,
        },
        entityId: item.workSheetId,
        size: getDefaultLimit({ quickAddSize: quickAddSize.current, ...state, businessType }),
        user: { accountId, fullname, avatar },
      }));
    setState(getAddDraftLimitsPatch({ limits: state.limits, addedLimits: limits, total: state.total }));
  };

  /** 打开应用或工作表选择弹层，并注入快捷额度设置区域。 */
  const showAddList = () => {
    const min = getMinLimit(businessType);
    const max =
      businessType === 1
        ? md.global.SysSettings.fileUploadLimitSize || 4 * 1024
        : businessType === 2
          ? (window.platformENV.isLocal || window.platformENV.isOverseas) && state.limitRowTotal
            ? state.limitRowTotal * 10
            : 1000
          : undefined;
    const defaultValue = state.size === -1 ? min : state.size;
    quickAddSize.current = defaultValue;
    const options = {
      projectId,
      extraFooter: (
        <QuickLimitSetting
          businessType={businessType}
          defaultValue={defaultValue}
          min={min}
          max={max}
          unit={globalUnit}
          onChange={value => (quickAddSize.current = value)}
        />
      ),
    };

    businessType === 2
      ? dialogSelectWorksheet({ ...options, title: _l('添加工作表'), onOk: addWorksheets })
      : dialogSelectApp({ ...options, title: _l('添加应用'), onOk: addApps });
  };

  /** 更新单行额度，不修改原始列表引用。 */
  const changeItemSize = (size, item) => {
    setState({
      limits: state.limits.map(limit => (limit.entityId === item.entityId ? { ...limit, size } : limit)),
    });
  };

  /** 切换单行选择状态；按住 Shift 时计算连续选择范围。 */
  const toggleSelect = (entityId, shiftKey) => {
    setState({
      selectedIds: getNextSelectedIds({ ...state, entityId, shiftKey }),
      lastSelectedId: entityId,
    });
  };

  /** 在当前已加载列表范围内执行全选或取消全选。 */
  const toggleSelectAll = () => {
    setState({
      selectedIds: state.selectedIds.length === state.limits.length ? [] : state.limits.map(item => item.entityId),
      lastSelectedId: undefined,
    });
  };

  /** 打开批量修改弹层，并以首个选中项额度作为默认值。 */
  const showBatchEdit = () => {
    if (!state.selectedIds.length) return;
    const selectedLimit = state.limits.find(item => item.entityId === state.selectedIds[0]);
    setState({
      batchEditVisible: true,
      batchSize: _.isNumber(selectedLimit && selectedLimit.size) ? selectedLimit.size : getMinLimit(businessType),
    });
  };

  /** 将批量额度应用到所有选中行。 */
  const applyBatchEdit = () => {
    if (!_.isNumber(state.batchSize)) return;
    setState({
      limits: updateSelectedLimitSize(state.limits, state.selectedIds, state.batchSize),
      batchEditVisible: false,
    });
  };

  /** 从待保存列表中移除选中行，实际接口删除发生在保存时。 */
  const batchRemove = () => {
    if (!state.selectedIds.length) return;
    setState({
      limits: removeSelectedLimits(state.limits, state.selectedIds),
      total: state.total - getRemovedPersistedLimitCount(state.limits, state.selectedIds),
      selectedIds: [],
      lastSelectedId: undefined,
    });
  };

  /** 只允许包含应用信息的已保存行进入用量重置流程。 */
  const handleReset = (rows, selectedCount = rows.length) => {
    if (!isUsageResetSupported(businessType)) return;
    const resetRows = getResettableLimits(rows);
    if (_.isEmpty(resetRows)) return;
    setState({ resetRows, resetSelectedCount: selectedCount, resetVisible: true });
  };

  /** 批量重置选中的已保存应用，并在请求前再次过滤无效行。 */
  const confirmReset = () => {
    const resetRows = getResettableLimits(state.resetRows || []);

    setState({ resetLoading: true });
    if (_.isEmpty(resetRows)) {
      setState({ resetLoading: false, resetVisible: false, resetRows: [], resetSelectedCount: 0 });
      return;
    }

    const entityIds = resetRows.map(item => item.entityId);
    const resetRequest =
      businessType === 4
        ? workflowDataLimitAjax.resetUageLimit({ projectId, entityIds })
        : dataLimitAjax.resetUsage({ projectId, appIds: entityIds });

    resetRequest
      .then(res => {
        if (res) {
          setState({
            selectedIds: [],
            lastSelectedId: undefined,
            resetVisible: false,
            resetRows: [],
            resetSelectedCount: 0,
          });
          alert(_l('重置成功'));
        } else {
          alert(_l('重置失败'), 2);
        }
      })
      .catch(_requestError => alertIfNotUnauthorized(_requestError, _l('重置失败'), 2))
      .finally(() => setState({ resetLoading: false }));
  };

  /** 清洗额度输入：移除前导零，并按业务类型补齐合法最小值。 */
  const onBlur = (event, callback) => {
    let value = event.target.value.replace(/^[0]+/, '');
    if (!value && _.includes([1, 2, 4], businessType)) return callback(1);
    if (!_.trim(value) || value < 0) value = 0;
    callback(+value);
  };

  /** 移除单行额外配置，接口删除统一延迟到页面保存时执行。 */
  const remove = entityId => {
    setState({
      limits: state.limits.filter(item => item.entityId !== entityId),
      total: state.total - getRemovedPersistedLimitCount(state.limits, [entityId]),
    });
  };

  return {
    searchApps,
    handleSort,
    showAddList,
    changeItemSize,
    toggleSelect,
    toggleSelectAll,
    showBatchEdit,
    applyBatchEdit,
    batchRemove,
    handleReset,
    confirmReset,
    onBlur,
    remove,
  };
}
