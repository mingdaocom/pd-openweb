import React, { Component } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import { getAppStatusText } from 'src/pages/PageHeader/util';
import { browserIsMobile } from 'src/util';

const AppStatus = styled.div`
  position: absolute;
  left: 50%;
  bottom: 0;
  border: 2px solid #fff;
  background-color: #333;
  border-radius: 13px;
  color: #fff;
  line-height: 22px;
  box-sizing: border-box;
  white-space: nowrap;
  padding: 0 10px;
  font-size: 12px;
  &.isOverdue {
    background: #bdbdbd;
  }
  &.fixed {
    background: #fd7558;
  }
  &.mobilePadding {
    padding: 0 8px;
  }
  &.isRecent {
    left: unset;
    bottom: -10px;
    padding: 0 6px;
  }
`;
export default class AppStatusComp extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {};
  render() {
    const { isGoodsStatus, isNew, fixed, isRecent } = this.props;
    const isMobile = browserIsMobile();
    const text = getAppStatusText({ isGoodsStatus, isNew, fixed });
    if (!text) return null;
    return (
      <AppStatus className={cx({ isOverdue: !isGoodsStatus, fixed, mobilePadding: fixed && isMobile, isRecent })}>
        {text}
      </AppStatus>
    );
  }
}
