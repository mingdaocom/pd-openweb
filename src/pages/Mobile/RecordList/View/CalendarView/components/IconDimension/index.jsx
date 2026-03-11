import React, { memo } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const IconDimensionWrapper = styled.div`
  position: fixed;
  right: 28px;
  bottom: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-background-card);
  box-shadow: var(--shadow-md);
  z-index: 999;
  .icon {
    color: var(--color-text-tertiary);
    font-size: 24px;
  }
`;

const IconDimension = ({ dimension, changeDimension }) => {
  return (
    <IconDimensionWrapper onClick={() => changeDimension()}>
      <Icon icon={dimension === 'month' ? 'week' : 'month'} />
    </IconDimensionWrapper>
  );
};

export default memo(IconDimension);
