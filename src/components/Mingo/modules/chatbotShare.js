import copy from 'copy-to-clipboard';
import _ from 'lodash';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';
import { getPublicShare, updatePublicShareStatus } from 'src/pages/worksheet/components/Share/controller';
import { compatibleMDJS } from 'src/utils/services/project';

// 对话机器人会话分享（sourceType=71）统一入口：把「整会话 / 选择性」与「可见范围」的差异收在这里，
// Share 组件只吃通用参数（supportProjectScope / autoEnable / params.createShareSource）。
//
// 两种锚点：
// - 整会话分享：sourceId 恒为 `chatbotId|conversationId`，可反查这个会话分享过没，弹窗能回显已开启状态；
// - 选择性分享：每次都要先 addShareConversation 建一条只含所选提问的新会话，锚点是随机的，
//   因此置 disableShareQuery 直接按未分享处理，并把「建会话」延后到用户真正开启分享时执行
//   （createShareSource），避免默认关闭态下点开弹窗就产生一条没人用的分享会话。
export function buildChatbotShareProps({
  from = 'chatbot',
  appId,
  chatbotId,
  conversationId,
  title,
  projectId,
  isCharge,
  messageIds,
} = {}) {
  const isSelective = !_.isEmpty(messageIds);
  // 可见范围（组织内 / 公开）目前只对对话机器人开放；AI 操作（aiAction=72）沿用旧的「打开即公开」行为
  const supportProjectScope = from === 'chatbot';

  return {
    from,
    isCustomShare: true,
    isCharge,
    privateShare: false,
    supportProjectScope,
    // 默认关闭，由用户显式开启；aiAction 不传，沿用 Share 组件对该来源的既有行为（打开弹窗即开启）
    autoEnable: supportProjectScope ? false : undefined,
    title: title ? _l('分享对话: %0', title) : _l('分享对话'),
    params: {
      appId,
      worksheetId: chatbotId,
      sourceId: `${chatbotId}|${conversationId}`,
      title,
      projectId,
      disableShareQuery: isSelective,
      ...(isSelective
        ? {
            createShareSource: async () => {
              const data = await chatbotAjax.addShareConversation({
                chatbotId,
                conversationId,
                userMessageIds: messageIds,
              });

              return `${chatbotId}|${data.conversationId}`;
            },
          }
        : {}),
    },
  };
}

// 移动端分享：h5 上没有承载完整分享配置弹窗的位置，历史对话与选择性分享统一走
// 「取到（必要时开启）对外公开链接 → 底部确认 → 复制」这条轻量路径，不再落到 PC 的 Share 弹层。
// 锚点规则与 buildChatbotShareProps 保持一致：选择性分享先建一条只含所选提问的新会话。
export async function getChatbotShareLink({
  from = 'chatbot',
  appId,
  chatbotId,
  conversationId,
  selective = false,
  messageIds = [],
}) {
  let finalConversationId = conversationId;

  // 由调用方显式声明是否选择性分享：勾选态下即便筛不出合法 messageId 也仍要建新会话，
  // 不能按 messageIds 是否为空反推，否则会退化成分享整个会话。
  if (selective) {
    const data = await chatbotAjax.addShareConversation({
      chatbotId,
      conversationId,
      userMessageIds: messageIds,
    });

    finalConversationId = data && data.conversationId;
  }

  if (!finalConversationId) return '';

  const sourceId = `${chatbotId}|${finalConversationId}`;
  const { shareLink } = await getPublicShare({ from, appId, sourceId });

  if (shareLink) return shareLink;

  // 未开启过分享：按移动端「点分享即公开」的既有行为直接开启
  const res = await updatePublicShareStatus({ from, appId, sourceId, isPublic: true });

  return (res && res.shareLink) || '';
}

export function copyChatbotShareLink(shareLink) {
  if (window.isMingDaoApp) {
    compatibleMDJS('shareContent', {
      type: 1,
      title: _l('链接已复制'),
      url: shareLink,
    });
    return;
  }

  copy(shareLink);
  alert(_l('链接已复制'));
}
