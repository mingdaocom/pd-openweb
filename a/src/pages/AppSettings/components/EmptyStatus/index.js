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
    width: ${props => (props.radiusSize ? props.radiusSize + 'px' : '100px')};
    height: ${props => (props.radiusSize ? props.radiusSize + 'px' : '100px')};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #f5f5f5;
    text-align: center;
    .icon {
      font-size: 36px;
      color: #bdbdbd;
    }
    .emptyTxt {
      margin-top: 12px;
      font-size: 15px;
      color: #bdbdbd;
    }
  }
`;

export default function EmptyStatus(props) {
  const { emptyTxt, icon, radiusSize, emptyTxtClassName, iconClassName } = props;
  return (
    <EmptyStatusWrap radiusSize={radiusSize}>
      <div className={`con`}>
        <Icon icon={icon || 'sp_assignment_white'} className={iconClassName} />
      </div>
      <div className={`${emptyTxtClassName}`}>{emptyTxt || _l('暂无信息')}</div>
    </EmptyStatusWrap>
  );
}
