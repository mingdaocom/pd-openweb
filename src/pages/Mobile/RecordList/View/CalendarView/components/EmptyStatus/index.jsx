import React, { memo } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  .emptyIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 130px;
    height: 130px;
    color: var(--color-text-disabled);
    font-size: 65px;
    background-color: var(--color-background-primary);
    border-radius: 50%;
  }
  .emptyTitle {
    margin-top: 16px;
    font-size: 18px;
    color: var(--color-text-tertiary);
  }
`;

const EmptyDaily = props => {
  const { title = _l('今日无日程') } = props;
  return (
    <EmptyContainer>
      <div className="emptyIcon">
        <Icon icon="event" />
      </div>
      <div className="emptyTitle">{title}</div>
    </EmptyContainer>
  );
};

export default memo(EmptyDaily);
