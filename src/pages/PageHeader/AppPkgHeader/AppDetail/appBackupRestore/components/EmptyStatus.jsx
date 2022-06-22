import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const EmptyStatusWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .con {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #f5f5f5;
    text-align: center;
    .icon {
      font-size: 36px;
      color: #bdbdbd;
      line-height: 100px;
    }
    .emptyTxt {
      margin-top: 12px;
      font-size: 15px;
      color: #bdbdbd;
    }
  }
`;

export default function EmptyStatus(props) {
  const { emptyTxt } = props;
  return (
    <EmptyStatusWrap>
      <div className="con">
        <Icon icon="sp_assignment_white" />
      </div>
      <div className="emptyTxt mTop12">{emptyTxt || _l('暂无信息')}</div>
    </EmptyStatusWrap>
  );
}
