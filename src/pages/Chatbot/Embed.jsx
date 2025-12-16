import React, { Component, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LoadDiv } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import UnNormal from 'worksheet/views/components/UnNormal';
import preall from 'src/common/preall';
import store from 'src/redux/configureStore';
import { navigateTo } from 'src/router/navigateTo';
import Chatbot from './index';

const ChatbotWrap = withRouter(props => {
  const { match, history } = props;
  const { appId, chatbotId, conversationId } = match.params;
  const [state, setState] = useState(false);
  const [loading, setLoading] = useState(true);

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
          const basePathName = location.pathname.startsWith('/embed/chatbot/s') ? '/embed/chatbot/s' : '/embed/chatbot';
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
            path={`${window.subPath || ''}/embed/chatbot/:appId/:chatbotId/:conversationId?`}
            component={ChatbotWrap}
          />
          <Route
            path={`${window.subPath || ''}/embed/chatbot/s/:appId/:chatbotId/:conversationId?`}
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
