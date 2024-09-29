import React, { Component } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import styled from 'styled-components';

const Content = styled.div`
  display: flex;
  color: #2196f3;
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
    padding-bottom: calc('constant(safe-area-inset-bottom) - 20px') !important;
    padding-bottom: calc('env(safe-area-inset-bottom) - 20px') !important;
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
    return window.isWxWork || window.isMingDaoApp ? null : this.renderContent();
  }
}
