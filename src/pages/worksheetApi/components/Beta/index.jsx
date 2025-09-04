import React from 'react';
import { Tooltip } from 'antd';
import styled from 'styled-components';

const BetaWrapper = styled.div`
  display: inline-block;
  padding: 2px;
  margin-left: 2px;
  margin-top: 2px;
  transform: scale(0.9);
  height: 16px;
  line-height: 12px;
  font-size: 12px;
  background: #67ad5b;
  border-radius: 2px;
  span {
    display: inline-block;
    padding: 0 2px;
  }
  .betaTitle {
    color: #fff;
  }
  .betaSign {
    color: #67ad5b;
    background: #fff;
  }
`;

const Beta = () => {
  return (
    <Tooltip title="beta">
      <BetaWrapper>
        <span className="betaTitle">{_l('AI友好')}</span>
        {/* <span className="betaSign">beta</span> */}
      </BetaWrapper>
    </Tooltip>
  );
};

export default Beta;
