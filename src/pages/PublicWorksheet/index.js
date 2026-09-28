import React from 'react';
import { createRoot } from 'react-dom/client';
import AntdThemeProvider from 'src/common/providers/theme/AntdThemeProvider';
import PublicWorksheet from './PublicWorksheet';

const root = createRoot(document.querySelector('#app'));

root.render(
  <AntdThemeProvider>
    <PublicWorksheet />
  </AntdThemeProvider>,
);
