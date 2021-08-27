import React, { Component,Fragment } from 'react';
import { createPortal } from 'react-dom';
import DocumentTitle from 'react-document-title';
import './index.less';

export default class FullScreenCurtain extends Component {
  constructor(props) {
    super(props);
    this.container = document.createElement('div');
    this.container.classList.add('fullScreenCurtain');
    document.body.appendChild(this.container);
  }
  componentWillUnmount() {
    this.container.parentNode && this.container.parentNode.removeChild(this.container);
  }
  render() {
    const { children, documentTitle } = this.props;
    const Curtain = documentTitle ? <DocumentTitle title={documentTitle}>{children}</DocumentTitle> :<Fragment>{ children }</Fragment> ;
    return createPortal(Curtain, this.container);
  }
}
