import React, { useEffect, useState } from 'react';
import { SpinLoading } from 'antd-mobile';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { PopupWrapper } from 'ming-ui/antd-mobile-components';
import homeAppApi from 'src/api/homeApp';
import processApi from 'src/pages/workflow/api/process';
import DocumentTitle from 'mobile/components/DocumentTitle';
import WorkflowChatBot from 'src/components/Mingo/modules/WorkflowChatBot';
import ConversationList from 'src/components/Mingo/modules/WorkflowChatBot/ConversationList';
import { canEditApp } from 'src/utils/domain/permission/app';
import { getRequest } from 'src/utils/platform/browser/device';
import { emitter } from 'src/utils/platform/browser/dom';
import AppPermissions from '../components/AppPermissions';

const Wrap = styled.div`
  background: var(--color-background-primary);
  .header {
    padding: 8px 10px;
  }
`;

export const Chatbot = props => {
  const { match } = props;
  const { page } = getRequest();
  const { appId, chatbotId, conversationId } = match.params;
  const [chatbot, setChatbot] = useState({});
  const [chatbotConfig, setChatbotConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [historyVisible, setHistoryVisible] = useState(page === 'chatbotHistory');
  // 读取失败（已删除 / 无权访问）的会话 id：存 id 而不是布尔值，切到别的会话时判断自然失效
  const [unavailableConversationId, setUnavailableConversationId] = useState('');
  const conversationUnavailable = !!conversationId && unavailableConversationId === conversationId;
  const isCharge = canEditApp(_.get(window, 'appInfo.permissionType'), _.get(window, 'appInfo.isLock'));
  // 分享会话的可见范围要按应用所属组织提交，移动端没有 appPkg，从应用详情里取
  const projectId = _.get(window, 'appInfo.projectId');

  const navigateToConversation = newConversationId => {
    const { appId, groupId } = match.params;
    window.mobileNavigateTo(`/mobile/chatbot/${appId}/${groupId}/${chatbotId}/${newConversationId || ''}`, true);
    setHistoryVisible(false);
  };

  useEffect(() => {
    Promise.all([
      homeAppApi.getItemDetailByAppId({
        appId,
        itemIds: [chatbotId],
      }),
      processApi.getChatbotConfig({ chatbotId }),
    ]).then(data => {
      const [appItme, config] = data;
      setChatbot(appItme[0]);
      setChatbotConfig(config);
      setLoading(false);
    });
  }, [appId, chatbotId]);

  if (loading) {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter w100 h100">
        <SpinLoading color="primary" />
      </div>
    );
  }

  if (_.isEmpty(chatbot)) {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter Font18 textTertiary w100 h100">
        {_l('对话机器人不存在或者被删除')}
      </div>
    );
  }

  return (
    <Wrap className="w100 h100 flexColumn">
      {chatbot.workSheetName && <DocumentTitle title={chatbot.workSheetName} />}
      <div className="flexRow alignItemsCenter justifyContentBetween header">
        <Icon
          icon="access_time"
          className="Font24 textTertiary pRight16"
          onClick={() => {
            setHistoryVisible(true);
          }}
        />
        <div
          onClick={() => {
            // AI 思考阶段会话 id 可能尚未同步到 URL，单纯跳转到空会话地址不会触发路由更新。
            // 主动通知对话区中断当前流并重置，确保「新对话」立即生效。
            emitter.emit('CHATBOT_NEW_CONVERSATION', { chatbotId });
            navigateToConversation('');
          }}
        >
          <Icon icon="newchat" className="Font24 colorPrimary" />
        </div>
      </div>
      <div className="flex minHeight0">
        {conversationUnavailable ? (
          // 会话读不出来时不渲染聊天区：既不给一个「像新对话」的空会话，也不留下能继续提问的输入框
          <div className="flexRow justifyContentCenter alignItemsCenter Font17 textTertiary w100 h100">
            {_l('会话不存在或已被删除')}
          </div>
        ) : (
          <WorkflowChatBot
            isMobile
            maxWidth={800}
            appId={appId}
            projectId={projectId}
            isCharge={isCharge}
            chatbotId={chatbotId}
            conversationId={conversationId}
            chatbotConfig={chatbotConfig}
            onGenerateConversation={navigateToConversation}
            onConversationUnavailable={(unavailableId = '') => setUnavailableConversationId(unavailableId)}
          />
        )}
      </div>
      {historyVisible && (
        <PopupWrapper
          visible
          title={_l('历史记录')}
          headerType="withIcon"
          headerTitleAlign="left"
          bodyClassName="heightPopupBody40"
          onClose={() => setHistoryVisible(false)}
        >
          <ConversationList
            isMobile
            isDark={false}
            allowShareChat={chatbotConfig.allowShare}
            chatbotId={chatbotId}
            currentConversationId={conversationId}
            appId={appId}
            projectId={projectId}
            onSelect={navigateToConversation}
          />
        </PopupWrapper>
      )}
    </Wrap>
  );
};

export default AppPermissions(Chatbot);
