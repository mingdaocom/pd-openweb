import React from 'react';
import styled from 'styled-components';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';

const Badge = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 4px;
  background-color: var(--color-warning);
  z-index: 9999;

  .sign {
    position: absolute;
    left: 50%;
    top: 4px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 124px;
    height: 24px;
    border-radius: 0 0 8px 8px;
    background-color: var(--color-warning);
    color: var(--color-white);
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
    white-space: nowrap;
  }
`;

export default function EnvironmentBadge() {
  if (!isSandboxEnvironment()) return null;

  return (
    <Badge>
      <div className="sign">{_l('沙盒环境')}</div>
    </Badge>
  );
}
