import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import _ from 'lodash';

const EmptyWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .iconWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: #f5f5f5;
    margin-bottom: 20px;
  }
`;

const AddBtn = styled.div`
  padding: 8px 24px;
  min-width: 92px;
  background: #2196f3;
  border-radius: 18px;
  color: #fff;
  display: inline-block;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background: #1764c0;
  }
`;

export default function EmptyContent(props) {
  const { icon, emptyText, showAddIcon, onAdd, addText } = props;
  return (
    <EmptyWrapper>
      <div className="iconWrapper">
        <Icon icon={icon} className="Font48 Gray_bd" />
      </div>
      <div className="mBottom20 Font17 Gray_bd">{emptyText}</div>
      {showAddIcon && (
        <AddBtn onClick={onAdd}>
          <Icon icon="add" className="Font13" />
          <span className="mLeft5 bold LineHeight20">{addText}</span>
        </AddBtn>
      )}
    </EmptyWrapper>
  );
}
