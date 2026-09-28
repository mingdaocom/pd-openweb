import _ from 'lodash';
import { SHARE_SCOPE } from 'src/pages/worksheet/components/Share/controller';
import { createSessionShare, SESSION_SHARE_SCOPE } from './agentService';

function getSessionShareScope(scope) {
  return scope === SHARE_SCOPE.PROJECT ? SESSION_SHARE_SCOPE.ORG : SESSION_SHARE_SCOPE.PUBLIC;
}

// New Mingo 会话分享（MingoHistory=73）统一入口：把「两步创建 + 可见范围」的差异收在这里，
// Share 组件只吃通用参数（supportProjectScope / autoEnable / params.createShareSource）。
//
// 两步流程且顺序不能反：先在 agent 侧建分享实体拿 shareId，再把 shareId 当 SourceId 登记进主站换分享链接。
// 双锚点：整会话分享的 shareId 恒等于 sessionId（凭 sessionId 即可反查分享状态）；
// 选择性分享（勾了消息）每次返回随机串，不参与反查。
export function buildSessionShareProps({ sessionId, title, projectId, messageIds, groupCount } = {}) {
  const isSelective = !_.isEmpty(messageIds);
  // 标题里的「组」是对话组（一条提问 + 其后的回复算一组），由调用方按分组结果传入；
  // messageIds 是组内的消息条数，一问一答就是 2 条，不能拿来当组数。缺省时只能退回条数。
  const selectedGroupCount = groupCount || (messageIds || []).length;

  return {
    from: 'mingoHistory',
    isCustomShare: true,
    // 分享入口只出现在自己的会话上，操作者即会话拥有者
    isCharge: true,
    privateShare: false,
    supportProjectScope: true,
    // 默认关闭，由用户显式开启
    autoEnable: false,
    title: isSelective
      ? _l('分享所选内容（%0 组）', selectedGroupCount)
      : title
        ? _l('分享对话: %0', title)
        : _l('分享对话'),
    params: {
      sourceId: sessionId,
      title: title || _l('Mingo 对话'),
      projectId,
      // 选择性分享每次都是新的一条，没有「这个会话分享过没」可查
      disableShareQuery: isSelective,
      createShareSource: ({ scope, projectId: targetProjectId }) =>
        createSessionShare({
          sessionId,
          scope: getSessionShareScope(scope),
          projectId: targetProjectId,
          messageIds,
        }),
    },
  };
}
