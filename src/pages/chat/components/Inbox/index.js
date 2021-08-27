import React from 'react';
import ReactDOM from 'react-dom';
import './style.less';
export { default as Inbox } from './components/Inbox';

export function index(options) {
  const { container, ...others } = options;
  ReactDOM.render(<Inbox {...others} />, container[0]);
}
