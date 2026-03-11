import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { MINGO_TASK_STATUS } from 'src/components/Mingo/ChatBot/enum';

const Con = styled.div`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border-primary);
  background: var(--color-background-tertiary);
  margin-bottom: 10px;
  white-space: break-spaces;
`;

const CreateWorksheetButton = styled.div`
  background: var(--color-mingo);
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  border-radius: 18px;
  color: var(--color-white);
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  &.disabled,
  &.create-worksheet-begin,
  &.create-worksheet-success {
    color: var(--color-text-title);
    background: var(--color-background-primary);
    font-weight: normal;
    cursor: not-allowed;
    .icon {
      color: var(--color-success);
      font-size: 18px;
      margin-right: 5px;
    }
  }

  &.disabled,
  &.create-worksheet-success {
    color: var(--color-text-secondary);
  }
`;

const Icon = styled.i`
  color: var(--color-success);
  font-size: 18px;
  margin-right: 5px;
`;

export default function MingoCreateWorksheet({ taskStatus, content, disabled, onClick, isStreaming }) {
  let className = cx('create-worksheet', {
    disabled,
    'create-worksheet-begin': taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_BEGIN_CREATE_WORKSHEET,
    'create-worksheet-success': taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_SUCCESS,
  });

  let button = null;

  if (taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_PREPARING_WORKSHEET_DESCRIPTION) {
    button = (
      <CreateWorksheetButton className={className} onClick={onClick}>
        {_l('开始创建')}
      </CreateWorksheetButton>
    );
  } else if (taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_BEGIN_CREATE_WORKSHEET) {
    button = (
      <CreateWorksheetButton className={className}>
        <Icon className="icon icon-ok" />
        {_l('已确认')}
      </CreateWorksheetButton>
    );
  } else if (taskStatus >= 12) {
    button = (
      <CreateWorksheetButton className={className}>
        <Icon className="icon icon-ok" />
        {_l('已使用')}
      </CreateWorksheetButton>
    );
  }

  return (
    <Con>
      {content}
      {!isStreaming && button}
    </Con>
  );
}
