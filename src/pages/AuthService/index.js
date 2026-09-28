import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import AntdThemeProvider from 'src/common/providers/theme/AntdThemeProvider';
import App from './App';

const root = createRoot(document.getElementById('app'));

root.render(
  <AntdThemeProvider>
    <Router>
      <App />
    </Router>
  </AntdThemeProvider>,
);
