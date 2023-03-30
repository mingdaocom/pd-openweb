import React, { Component } from 'react';
import FullScreenCurtain from 'src/pages/workflow/components/FullScreenCurtain/index.jsx';
import ConnectCon from './ConnectCon';
import './index.less'
// 连接详情弹层
export default class ConnectWrap extends Component {
  render() {
    return (
      <FullScreenCurtain>
        <ConnectCon {...this.props} />
      </FullScreenCurtain>
    );
  }
}
