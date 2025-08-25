import React from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { TEST_STATUS } from '../../constant';

const TestButton = styled.div`
  display: inline-block;
  vertical-align: middle;
  border: 1px solid #1677ff;
  border-radius: 3px;
  color: #1677ff;
  background-color: #fff;
  font-size: 14px;
  line-height: 18px;
  height: 36px;
  padding: 8px 30px;
  cursor: pointer;

  &.lightHover {
    &.default {
      &:hover {
        color: #1677ff;
        background: #f4f8fb;
      }
    }
  }

  &.default {
    &:hover {
      color: #fff;
      background-color: #1677ff;
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
      {testStatus === TEST_STATUS.FAILED && <Icon icon="info" />}
      {testStatus.text}
    </TestButton>
  );
}
