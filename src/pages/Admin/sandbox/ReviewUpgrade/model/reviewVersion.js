import { VERSION_ACTION, VERSION_STATUS } from 'src/components/AppSandbox/version/constants';

const SELECTABLE_VERSION_STATUSES = new Set([VERSION_STATUS.PENDING_APPROVAL, VERSION_STATUS.PENDING_UPDATE]);

const isReviewVersionSelectable = version => SELECTABLE_VERSION_STATUSES.has(version?.status);

/**
 * 兼容 API 封装的嵌套响应和直接返回分页数据两种形态，页面层只消费统一结构。
 */
const normalizeReviewVersionResponse = result => {
  const response = Array.isArray(result?.data) ? result : result?.data || result || {};

  return {
    items: Array.isArray(response.data) ? response.data : [],
    total: response.total || 0,
  };
};

const getPageIndexAfterAction = ({ action, status, total, affectedCount, pageIndex, pageSize }) => {
  // 仅当操作会让数据离开当前状态筛选结果时，才需要重新计算当前页是否仍然存在。
  const removesFromCurrentFilter =
    (status === VERSION_STATUS.PENDING_APPROVAL && [VERSION_ACTION.APPROVE, VERSION_ACTION.REJECT].includes(action)) ||
    (status === VERSION_STATUS.PENDING_UPDATE && action === VERSION_ACTION.UPGRADE);

  if (!removesFromCurrentFilter) return pageIndex;

  const nextTotal = Math.max(0, total - affectedCount);
  const maxPageIndex = Math.max(1, Math.ceil(nextTotal / pageSize));

  // 保持用户所在页；只有最后一页被清空时才回退，避免操作后直接跳到末页。
  return Math.min(pageIndex, maxPageIndex);
};

export { getPageIndexAfterAction, isReviewVersionSelectable, normalizeReviewVersionResponse };
