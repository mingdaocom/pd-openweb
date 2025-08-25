import React from 'react';
import { createRoot } from 'react-dom/client';

export { default as Inbox } from './components/Inbox';

export function index(options) {
  const { container, ...others } = options;
  const root = createRoot(container[0]);

  root.render(<Inbox {...others} />);
}
