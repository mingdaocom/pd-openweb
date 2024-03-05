import React from 'react';
import ReactDom from 'react-dom';
import NodeShare from '../common/NodeShare';

import '../main.css';

const app = <NodeShare />;

export default function () {
  ReactDom.render(app, document.getElementById('app'));
}
