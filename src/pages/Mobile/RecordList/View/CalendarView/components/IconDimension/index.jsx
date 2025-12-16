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
  background: var(--color-background-primary);
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
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
