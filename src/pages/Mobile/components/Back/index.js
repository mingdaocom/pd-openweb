import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

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
    return null;

    // return (window.isWxWork && !this.props.filterWxWork) || window.isMingDaoApp ? null : this.renderContent();
  }
}
