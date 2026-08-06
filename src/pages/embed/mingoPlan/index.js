import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import preall from 'src/common/preall';
import PlanPage from './PlanPage';

// /public/mingo/plan：官网新标签页的匿名「生成 plan」页。免登录。
// 包 Router：AppBuilder 的 PreviewFrame / navigateTo 依赖 window.reactRouterHistory（与 /agent 一致）。
const root = createRoot(document.getElementById('app'));
const WrappedComp = preall(
  () => (
    <Router>
      <PlanPage />
    </Router>
  ),
  { allowNotLogin: true },
);

root.render(<WrappedComp />);
