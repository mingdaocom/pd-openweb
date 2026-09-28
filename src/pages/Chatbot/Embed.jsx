import React, { Component, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LoadDiv } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import UnNormal from 'worksheet/views/components/UnNormal';
import preall from 'src/common/entries/preall';
import store from 'src/redux/configureStore';
import { navigateTo } from 'src/router/navigation/navigateTo';
import socketInit from 'src/socket';
import { addSubPathOfRoute, getPathWithoutSubPath } from 'src/utils/platform/navigation/path';
import Chatbot from './index';

const ChatbotWrap = withRouter(props => {
  const { match, history } = props;
  const { appId, chatbotId, conversationId } = match.params;
  const [state, setState] = useState(false);
  const [loading, setLoading] = useState(true);

  // 「新页面打开」是独立入口，不经过 src/router/layouts/MainLayout，需要自己初始化 socket。
  // 左侧会话列表靠 workflow_chatbot 推送在 AI 回复途中就插入新会话（见 ConversationList 的
  // CHATBOT_SOCKET_UPDATE_CONVERSATION 监听），缺了它新对话要等流式下发 conversationId 后才补拉出来。
  // 单独成一个只跑一次的 effect：socketInit 会注册一批全局监听，重复调用会让同一事件被广播多次。
  useEffect(() => {
    !window.isPublicApp && socketInit();
  }, []);

  useEffect(() => {
    homeAppApi
      .getPageInfo({
        appId,
        id: chatbotId,
      })
      .then(data => {
        if (data.resultCode === 1) {
          setState(true);
        }

        setLoading(false);
      });
    window.reactRouterHistory = history;
  }, []);

  if (loading) {
    return (
      <div className="h100 flexRow alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    );
  }

  if (!state) {
    return <UnNormal type="sheet" resultCode={-10000} />;
  }

  return (
    <Provider store={store}>
      <Chatbot
        data={{ appId, chatbotId, conversationId }}
        isEmbed={true}
        navigateToConversation={(conversationId, isReplace = false) => {
          const pathname = getPathWithoutSubPath(location.pathname);
          const basePathName = pathname.startsWith('/embed/chatbot/s') ? '/embed/chatbot/s' : '/embed/chatbot';
          navigateTo(`${basePathName}/${appId}/${chatbotId}/${conversationId || ''}`, isReplace);
        }}
      />
    </Provider>
  );
});

class LandChatbot extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Router>
        <Switch>
          <Route
            path={addSubPathOfRoute('/embed/chatbot/:appId/:chatbotId/:conversationId?')}
            component={ChatbotWrap}
          />
          <Route
            path={addSubPathOfRoute('/embed/chatbot/s/:appId/:chatbotId/:conversationId?')}
            component={ChatbotWrap}
          />
          <Route component={null} />
        </Switch>
      </Router>
    );
  }
}

const Comp = preall(LandChatbot);
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
