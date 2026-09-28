import React from 'react';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import Inbox from './components/Inbox';

export { Inbox };

export function index(options) {
  const { container, ...others } = options;
  const root = createRoot(container[0]);

  root.render(<Inbox {...others} />);
}
