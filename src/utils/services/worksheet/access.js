import _ from 'lodash';

/**
 * 根据记录入口与公开访问状态计算行详情请求类型。
 */
export function getRowGetType(from, { discussId } = {}) {
  let isInbox;

  if (typeof discussId !== 'undefined') {
    isInbox = from === 2 && !!discussId;
  } else {
    isInbox = from === 2 && location.search && location.search.indexOf('inboxId') > -1;
  }

  if (from == 21) {
    return 21;
  } else if (
    isInbox ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    _.get(window, 'shareState.isPublicWorkflowRecord') ||
    _.get(window, 'shareState.isPublicRecord') ||
    _.get(window, 'shareState.isPublicPrint')
  ) {
    return 3;
  } else {
    return 1;
  }
}
