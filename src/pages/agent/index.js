import React from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import preall from 'src/common/preall';
import { addSubPathOfRoute } from 'src/utils/common';
import AgentLand from './AgentLand';

const root = createRoot(document.getElementById('app'));
// /mingo 独立页：左侧会话历史 + 右侧新版 Agent 对话。/mingo/chat/:sessionId 还原指定会话。
const WrappedComp = preall(() => (
  <Router>
    <Switch>
      <Route path={addSubPathOfRoute('/mingo/chat/:sessionId')} component={AgentLand} />
      <Route component={AgentLand} />
    </Switch>
  </Router>
));

root.render(<WrappedComp />);
