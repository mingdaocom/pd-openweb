import React from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { TEST_STATUS } from '../../constant';

const TestButton = styled.div`
  display: inline-block;
  vertical-align: middle;
  border: 1px solid var(--color-primary);
  border-radius: 3px;
  color: var(--color-primary);
  background-color: var(--color-background-primary);
  font-size: 14px;
  line-height: 18px;
  height: 36px;
  padding: 8px 30px;
  cursor: pointer;

  &.lightHover {
    &.default {
      &:hover {
        color: var(--color-primary);
        background: var(--color-background-secondary);
      }
    }
  }

  &.default {
    &:hover {
      color: var(--color-white);
      background-color: var(--color-primary);
    }
  }

  &.testing {
    display: inline-flex;
    align-items: center;
  }

  &.testSuccess {
    color: var(--color-success);
    border-color: var(--color-success);
    i {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-right: 5px;
      background: var(--color-success);
      color: var(--color-white);
    }
  }

  &.testFailed {
    color: var(--color-error);
    border-color: var(--color-error);
    i {
      color: var(--color-error);
      margin-right: 5px;
    }
  }
`;

export default function TestConnectButton(props) {
  const { testStatus, onTestConnect, className } = props;

  return (
    <TestButton className={`${testStatus.className} ${className || ''}`} onClick={onTestConnect}>
      {testStatus === TEST_STATUS.TESTING && <LoadDiv size="small" style={{ marginRight: 5 }} />}
      {testStatus === TEST_STATUS.SUCCESS && <Icon icon="done" />}
      {testStatus === TEST_STATUS.FAILED && <Icon icon="info" />}
      {testStatus.text}
    </TestButton>
  );
}
