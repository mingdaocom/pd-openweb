import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';

const BetaWrapper = styled.div`
  display: inline-block;
  padding: 2px;
  margin: 0 2px;
  transform: scale(0.9);
  height: 16px;
  line-height: 12px;
  font-size: 12px;
  background: var(--color-success);
  border-radius: 2px;
  span {
    display: inline-block;
    padding: 0 2px;
  }
  .betaTitle {
    color: var(--color-white);
  }
  .betaSign {
    color: var(--color-success);
    background: var(--color-background-primary);
  }
`;

const Beta = () => {
  return (
    <Tooltip title="beta">
      <BetaWrapper>
        <span className="betaTitle">{_l('AI友好')}</span>
      </BetaWrapper>
    </Tooltip>
  );
};

export default Beta;
