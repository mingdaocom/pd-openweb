import React from 'react';
import styled from 'styled-components';
import { TEST_STATUS } from '../../constant';
import { Icon, LoadDiv } from 'ming-ui';

const TestButton = styled.div`
  display: inline-block;
  vertical-align: middle;
  border: 1px solid #2196f3;
  border-radius: 3px;
  color: #2196f3;
  background-color: #fff;
  font-size: 14px;
  line-height: 18px;
  height: 36px;
  padding: 8px 30px;
  cursor: pointer;

  &.lightHover {
    &.default {
      &:hover {
        color: #2196f3;
        background: #f4f8fb;
      }
    }
  }

  &.default {
    &:hover {
      color: #fff;
      background-color: #2196f3;
    }
  }

  &.testing {
    display: inline-flex;
    align-items: center;
  }

  &.testSuccess {
    color: #4caf50;
    border-color: #4caf50;
    i {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-right: 5px;
      background: #4caf50;
      color: #fff;
    }
  }

  &.testFailed {
    color: #f44336;
    border-color: #f44336;
    i {
      color: #f44336;
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
      {testStatus === TEST_STATUS.FAILED && <Icon icon="info1" />}
      {testStatus.text}
    </TestButton>
  );
}
