import moment from 'moment';

const DESTROYED_COMPUTING_INSTANCE_STATUS = 8;

export const canViewComputingInstanceHistory = status => status === DESTROYED_COMPUTING_INSTANCE_STATUS;

export const canManageComputingInstance = status => status !== DESTROYED_COMPUTING_INSTANCE_STATUS;

export const canShowComputingInstanceHistory = (isHistoryMode, instance) => isHistoryMode && !!instance;

// 算力在到期日当天仍然有效，到期日结束后才进入过期状态。
export const isComputingInstanceExpired = expirationDatetime =>
  !!expirationDatetime && moment(expirationDatetime).add(1, 'd').isBefore();

export const shouldShowComputingInstanceWorkflowCount = remainingDays => !(remainingDays < 1);

export const isLatestComputingInstanceRequest = (requestId, latestRequestId) => requestId === latestRequestId;

export const getComputingHistoryPath = ({ projectId, id }) => `/admin/computing/${projectId}/${id}?mode=history`;

export const isHistoryComputingRoute = search => new URLSearchParams(search || '').get('mode') === 'history';

export const getHistoryWorkflowRequestParams = ({ projectId, id, filters = {}, pageSize }) => ({
  projectId,
  id,
  appId: filters.apkId || '',
  processListType: filters.workflowType || 0,
  keyword: filters.search || '',
  pageIndex: filters.pageIndex || 1,
  pageSize,
});

export const normalizeHistoryWorkflowResult = result => {
  const data = result || {};

  return {
    instance: data.instance,
    list: Array.isArray(data.workflows) ? data.workflows : [],
    count: data.totalCount || 0,
    pageIndex: data.pageIndex || 1,
    pageSize: data.pageSize || 0,
  };
};

// 历史工作流接口有分页限制，迁移前需要加载全部页面并对工作流 ID 去重。
export const getAllHistoryWorkflowIds = async ({ request, projectId, id, pageSize = 100 }) => {
  const getPage = pageIndex =>
    request(
      getHistoryWorkflowRequestParams({
        projectId,
        id,
        filters: { pageIndex },
        pageSize,
      }),
    ).then(normalizeHistoryWorkflowResult);
  const firstPage = await getPage(1);
  const pageCount = Math.ceil(firstPage.count / pageSize);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) => getPage(index + 2)),
  );

  return Array.from(
    new Set(
      [firstPage]
        .concat(remainingPages)
        .flatMap(page => page.list.filter(item => item && item.id).map(item => item.id)),
    ),
  );
};

// 检查接口返回扁平的工作流字段，这里转换为共享冲突弹层使用的 process/name 结构。
export const checkHistoryWorkflowConflicts = ({ request, projectId, id, targetResourceId, workflowIds }) =>
  request({
    projectId,
    id,
    targetResourceId,
    workflowIds,
  }).then(result => {
    if (!Array.isArray(result)) {
      throw new TypeError('Invalid history workflow conflict response');
    }

    return result.map(item => ({
      ...item,
      name: item.resourceName || item.resourceId,
      process: {
        name: item.name,
        startAppType: item.startAppType,
        child: item.child,
      },
    }));
  });

// 未冲突的工作流默认迁移；发生冲突的工作流仅迁移用户在确认层中勾选的部分。
export const getHistoryWorkflowMoveIds = ({ workflowIds = [], conflictIds = [], checkedConflictIds = [] }) => {
  const conflictIdSet = new Set(conflictIds);
  const checkedConflictIdSet = new Set(checkedConflictIds);

  return workflowIds.filter(id => !conflictIdSet.has(id) || checkedConflictIdSet.has(id));
};
