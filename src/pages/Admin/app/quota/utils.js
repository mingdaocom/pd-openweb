import _ from 'lodash';

/** 计算单选、取消选择及 Shift 连续选择后的实体 ID 列表。 */
export const getNextSelectedIds = ({ limits = [], selectedIds = [], entityId, lastSelectedId, shiftKey }) => {
  const entityIds = limits.map(item => item.entityId);
  const selectedSet = new Set(selectedIds);
  const currentIndex = entityIds.indexOf(entityId);
  const lastIndex = entityIds.indexOf(lastSelectedId);

  if (shiftKey && currentIndex > -1 && lastIndex > -1) {
    const rangeIds = entityIds.slice(Math.min(currentIndex, lastIndex), Math.max(currentIndex, lastIndex) + 1);
    const shouldRemove = selectedSet.has(entityId);

    rangeIds.forEach(id => (shouldRemove ? selectedSet.delete(id) : selectedSet.add(id)));
  } else if (selectedSet.has(entityId)) {
    selectedSet.delete(entityId);
  } else {
    selectedSet.add(entityId);
  }

  return entityIds.filter(id => selectedSet.has(id));
};

/** 批量更新选中实体的额度，并保持未选中行及原数组不变。 */
export const updateSelectedLimitSize = (limits = [], selectedIds = [], size) => {
  const selectedSet = new Set(selectedIds);
  return limits.map(item => (selectedSet.has(item.entityId) ? { ...item, size } : item));
};

/** 将新增的未保存额度行置顶，避免滚动加载列表过长时新行不可见。 */
export const prependAddedLimits = ({ limits = [], addedLimits = [] }) => addedLimits.concat(limits);

/** 给新增的本地额度行打草稿标记，保存成功或重新拉取接口后会移除。 */
export const markDraftLimits = (limits = []) => limits.map(item => ({ ...item, _isDraft: true }));

/** 移除仅用于前端展示的草稿标记，避免污染保存快照和接口参数。 */
export const stripDraftMeta = (limits = []) => limits.map(item => _.omit(item, '_isDraft'));

/** 只统计接口已返回或已保存的额度行，未保存草稿不进入列表计数。 */
export const getPersistedLimitCount = (limits = []) => limits.filter(item => !item._isDraft).length;

/** 新增本地草稿行时只更新可见列表，不改变后端总数语义。 */
export const getAddDraftLimitsPatch = ({ limits = [], addedLimits = [], total = 0 }) => ({
  limits: prependAddedLimits({ limits, addedLimits: markDraftLimits(addedLimits) }),
  total,
});

const mergeByEntityId = (base = [], next = []) => {
  const entityIds = new Set(base.map(item => item.entityId));

  return base.concat(
    next.filter(item => {
      if (entityIds.has(item.entityId)) return false;
      entityIds.add(item.entityId);
      return true;
    }),
  );
};

/** 从当前额度列表中移除所有选中实体。 */
export const removeSelectedLimits = (limits = [], selectedIds = []) => {
  const selectedSet = new Set(selectedIds);
  return limits.filter(item => !selectedSet.has(item.entityId));
};

/** 统计被移除的已保存行数量，未保存草稿不影响后端总数。 */
export const getRemovedPersistedLimitCount = (limits = [], selectedIds = []) => {
  const selectedSet = new Set(selectedIds);
  return limits.filter(item => selectedSet.has(item.entityId) && !item._isDraft).length;
};

/** 只有包含应用信息的已保存行才可通过应用 ID 重置用量。 */
export const getResettableLimits = (limits = []) =>
  limits.filter(item => _.get(item, 'app.appName') && item.createTime && !item._isDraft);

/** 在升序和降序之间切换，接口约定 1 为升序、0 为降序。 */
export const getNextSortType = sortType => (sortType === 1 ? 0 : 1);

/** 计算表头点击后的排序字段与方向；切换字段时默认降序。 */
export const getNextSorter = ({ sortField, sortType }, nextSortField) => ({
  sortField: nextSortField,
  sortType: sortField === nextSortField ? getNextSortType(sortType) : 0,
});

/** GetUageLimits 的 sortType 枚举：createTime 0/1（降/升），size 2/3（降/升）；type 1/2/3 共用同一接口。 */
const SORT_TYPE_MAP = {
  createTime: { 0: 0, 1: 1 },
  size: { 0: 2, 1: 3 },
};

/** 生成额度列表查询参数；工作流仅支持 sorter.createTime，其他业务沿用 sortType 枚举。 */
export const getLimitListRequestParams = ({ projectId, businessType, pageIndex, entityIds, sortField, sortType }) => {
  const params = { projectId, pageIndex, pageSize: 50, entityIds };

  if (businessType === 4) {
    return {
      ...params,
      ...(sortField === 'createTime' ? { sorter: { createTime: sortType === 1 ? 'ascend' : 'descend' } } : {}),
    };
  }

  const supportSort = [1, 2, 3].includes(businessType);
  const nextSortType = supportSort ? SORT_TYPE_MAP[sortField] && SORT_TYPE_MAP[sortField][sortType] : undefined;

  return {
    ...params,
    businessType,
    ...(typeof nextSortType === 'number' ? { sortType: nextSortType } : {}),
  };
};

/** 附件上传总量与工作流执行数均支持重置当天已用量。 */
export const isUsageResetSupported = businessType => [3, 4].includes(businessType);

/** 获取业务允许的最小额度，附件上传总量允许配置为 0。 */
export const getMinLimit = businessType => (businessType === 3 ? 0 : 1);

/** 将接口中的 -1 转换成列表使用的不限/限量模式。 */
export const getLimitMode = size => (size === -1 ? 'unlimited' : 'limited');

/** 根据限额模式生成接口额度，切回限量时补齐业务最小值。 */
export const getSizeByLimitMode = ({ mode, size, businessType }) => {
  if (mode === 'unlimited') return -1;
  return size === -1 ? getMinLimit(businessType) : size;
};

/** 判断是否存在未保存的全局额度或额外配置改动。 */
export const hasQuotaUnsavedChanges = ({ initialLimits = [], limits = [], initialSize, size }) =>
  !(_.isEqual(initialLimits, limits) && _.isEqual(initialSize, size));

/** 额度列表接口返回后，首屏替换、滚动加载追加，并保持已有选择态。 */
export const getLimitResultPatch = ({ list = [], total = 0, append = false, previous = {} }) => ({
  loading: false,
  loadingMore: false,
  limits: append ? mergeByEntityId(previous.limits || [], list) : list,
  initialLimits: append ? mergeByEntityId(previous.initialLimits || [], stripDraftMeta(list)) : stripDraftMeta(list),
  total,
  initialTotal: total,
  selectedIds: append ? previous.selectedIds || [] : [],
  lastSelectedId: append ? previous.lastSelectedId : undefined,
});

/** 重置应用筛选时需要同步清空应用、工作表和分页选择状态。 */
export const getResetAppFilterState = () => ({
  appIds: [],
  worksheetIds: [],
  appPageIndex: 1,
  keyword: '',
  pageIndex: 1,
  selectedIds: [],
  lastSelectedId: undefined,
});

/** 保存成功后刷新快照并退出批量选择态；保存失败时不使用该状态，保留用户选择。 */
export const getSaveSuccessPatch = ({ limits = [], size, total }) => ({
  limits: stripDraftMeta(limits),
  initialLimits: stripDraftMeta(limits),
  initialSize: size,
  total,
  initialTotal: total,
  pageIndex: 1,
  selectedIds: [],
  lastSelectedId: undefined,
  batchEditVisible: false,
});

/** 取消编辑时回到最近一次保存快照，并清理批量选择与重置弹层状态。 */
export const getCancelPatch = ({ initialLimits = [], initialSize, initialTotal }) => ({
  limits: initialLimits,
  size: initialSize,
  total: initialTotal,
  selectedIds: [],
  lastSelectedId: undefined,
  batchEditVisible: false,
  resetVisible: false,
  resetRows: [],
  resetSelectedCount: 0,
});

/** 只允许最新一次额度列表请求回写页面状态，避免旧滚动请求污染新筛选/排序结果。 */
export const shouldApplyLimitResult = ({ requestId, latestRequestId }) => requestId === latestRequestId;

/** 按实体 ID 提取保存接口所需的最小额度结构。 */
const pickLimitSizes = (ids, limits) =>
  ids.map(entityId => {
    const { size } = limits.find(item => item.entityId === entityId) || {};
    return { entityId, size };
  });

/** 比较初始快照和当前列表，生成额度保存接口的新增、修改和删除参数。 */
export const getLimitParams = ({ initialLimits = [], limits = [] }) => {
  const initialIds = initialLimits.map(item => item.entityId);
  const currentIds = limits.map(item => item.entityId);
  const addIds = currentIds.filter(entityId => !initialIds.includes(entityId));
  const deleteIds = initialIds.filter(entityId => !currentIds.includes(entityId));
  const editIds = currentIds.filter(entityId => !addIds.includes(entityId));
  const edits = pickLimitSizes(editIds, limits).filter(item => {
    const initialLimit = initialLimits.find(limit => limit.entityId === item.entityId) || {};
    return item.size !== initialLimit.size;
  });

  return {
    adds: pickLimitSizes(addIds, limits),
    edits,
    dels: pickLimitSizes(deleteIds, initialLimits),
  };
};
