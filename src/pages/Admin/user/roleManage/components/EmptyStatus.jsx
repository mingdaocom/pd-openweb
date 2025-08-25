import React, { Component } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const EmptyWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .iconWrap {
    width: 132px;
    height: 132px;
    border-radius: 50%;
    background-color: #f5f5f5;
    margin-bottom: 32px;
    position: relative;
    .icon {
      font-size: 50px;
      color: #c2c3c3;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
    }
  }
  .tipTxt {
    max-width: 312px;
    margin: 0 auto;
    text-align: center;
    line-height: 20px;
  }
`;

export default class EmptyStatus extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { icon, tipTxt } = this.props;
    return (
      <EmptyWrap>
        <div className="iconWrap">
          <Icon icon={icon} />
        </div>
        <div className="tipTxt Gray_75 Font14">{tipTxt || _l('数据空')}</div>
      </EmptyWrap>
    );
  }
}
