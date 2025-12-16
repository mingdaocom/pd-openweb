import React, { useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import { Popup, SpinLoading } from 'antd-mobile';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import processApi from 'src/pages/workflow/api/process';
import WorkflowChatBot from 'src/components/Mingo/modules/WorkflowChatBot';
import ConversationList from 'src/components/Mingo/modules/WorkflowChatBot/ConversationList';
import { getRequest } from 'src/utils/common';
import AppPermissions from '../components/AppPermissions';

const Wrap = styled.div`
  background: #fff;
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
  }, []);

  if (loading) {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter w100 h100">
        <SpinLoading color="primary" />
      </div>
    );
  }

  if (_.isEmpty(chatbot)) {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter Font18 Gray_9e w100 h100">
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
          className="Font24 Gray_9e pRight16"
          onClick={() => {
            setHistoryVisible(true);
          }}
        />
        <div
          onClick={() => {
            navigateToConversation('');
          }}
        >
          <Icon icon="newchat" className="Font24 ThemeColor" />
        </div>
      </div>
      <div className="flex minHeight0">
        <WorkflowChatBot
          isMobile
          maxWidth={800}
          chatbotId={chatbotId}
          conversationId={conversationId}
          chatbotConfig={chatbotConfig}
          onGenerateConversation={navigateToConversation}
        />
      </div>
      <Popup
        visible={historyVisible}
        closeOnMaskClick={true}
        className="mobileModal midFull topRadius"
        onClose={() => setHistoryVisible(false)}
      >
        <div className="flexColumn h100">
          <div className="flexRow alignItemsCenter header" style={{ padding: '15px 15px 12px' }}>
            <div className="Font13">{_l('历史记录')}</div>
            <div
              className="closeIcon TxtCenter"
              style={{ height: 24 }}
              onClick={() => {
                setHistoryVisible(false);
              }}
            >
              <Icon icon="close" />
            </div>
          </div>
          <div className="flex" style={{ overflowY: 'auto' }}>
            <ConversationList
              isMobile
              isDark={false}
              allowShareChat={chatbotConfig.allowShare}
              chatbotId={chatbotId}
              currentConversationId={conversationId}
              appId={appId}
              onSelect={navigateToConversation}
            />
          </div>
        </div>
      </Popup>
    </Wrap>
  );
};

export default AppPermissions(Chatbot);
