import React from 'react';
import { createRoot } from 'react-dom/client';
import NodeShare from '../common/NodeShare';
import '../main.css';

export default function () {
  const root = createRoot(document.getElementById('app'));

  root.render(<NodeShare />);
}
