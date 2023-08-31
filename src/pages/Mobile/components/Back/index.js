import React, { Component } from 'react';
import cx from 'classnames';
import { Flex } from 'antd-mobile';
import { Icon } from 'ming-ui';
import styled from 'styled-components';

const Content = styled(Flex)`
  display: flex;
  color: #2196f3;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #fff;
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 99;
  &.low {
    bottom: 20px;
  }
  .icon {
    font-size: 22px;
    margin-top: -2px;
  }
`;

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');

export default class Back extends Component {
  constructor(props) {
    super(props);
  }
  renderContent() {
    const { onClick, className, style, icon } = this.props;
    return (
      <Content justify="center" align="center" className={cx('card', className)} style={style} onClick={onClick}>
        <Icon icon={icon ? icon : 'back'} />
      </Content>
    );
  }
  render() {
    return isWxWork ? null : this.renderContent();
  }
}
