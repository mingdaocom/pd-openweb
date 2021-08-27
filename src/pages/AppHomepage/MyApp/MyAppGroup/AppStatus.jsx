import React, { Component } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import { getAppStatusText } from 'src/pages/PageHeader/util';

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
`;
export default class AppStatusComp extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {};
  render() {
    const { isGoodsStatus, isNew } = this.props;
    const text = getAppStatusText({ isGoodsStatus, isNew });
    if (!text) return null;
    return <AppStatus className={cx({ isOverdue: !isGoodsStatus })}>{text} </AppStatus>;
  }
}
