import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { getRequest } from 'src/utils/common';

const Content = styled.div`
  display: flex;
  color: #1677ff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #fff;
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 99;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
  &.low {
    bottom: 20px;
  }
  .icon {
    font-size: 22px;
    margin-top: -2px;
  }
  &.backBtn {
    padding-bottom: calc(constant(safe-area-inset-bottom) - 20px);
    padding-bottom: calc(env(safe-area-inset-bottom) - 20px);
  }
`;

export default class Back extends Component {
  constructor(props) {
    super(props);
  }
  renderContent() {
    const { onClick, className, style, icon } = this.props;

    return (
      <Content
        className={cx('flexRow alignItemsCenter justifyContentCenter card', className)}
        style={style}
        onClick={onClick}
      >
        <Icon icon={icon ? icon : 'back'} />
      </Content>
    );
  }
  render() {
    const { pc_slide = '' } = getRequest();
    // 钉钉、企微、飞书客户端内在侧边栏打开记录详情时，显示返回按钮
    if (
      (window.isDingTalk || window.isWxWork || window.isFeiShu) &&
      (pc_slide.includes('true') || sessionStorage.getItem('dingtalk_pc_slide'))
    ) {
      return this.renderContent();
    }
    return null;
  }
}
