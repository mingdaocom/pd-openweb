import React from 'react';
import { createRoot } from 'react-dom/client';
import AntdConfigProvider from 'src/common/providers/theme/AntdConfigProvider';

export default function createRootWithAntdConfig(container) {
  const root = createRoot(container);

  return {
    render(children) {
      root.render(<AntdConfigProvider>{children}</AntdConfigProvider>);
    },
    unmount() {
      root.unmount();
    },
  };
}
