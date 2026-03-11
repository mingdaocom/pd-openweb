import React from 'react';
import styled from 'styled-components';

const ErrorIconWrap = styled.div`
  width: 90px;
  height: 90px;
  background: var(--color-background-primary);
  border-radius: 45px;
  border: 2px solid var(--color-background-secondary);
  text-align: center;
  .icon {
    line-height: 90px;
  }
`;

export default ({ className }) => {
  return (
    <ErrorIconWrap className={className}>
      <i className="icon icon-account_balance_wallet Font50 textDisabled" />
    </ErrorIconWrap>
  );
};
