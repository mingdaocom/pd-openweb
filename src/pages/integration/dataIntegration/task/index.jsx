import React, { useState } from 'react';
import styled from 'styled-components';
import { ExecNumber, Statistic, TaskList } from './components';

const SyncTaskWrapper = styled.div`
  background: var(--color-background-primary);
  padding: 32px 32px 0;

  .flexRowBetween {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .filterContent {
    margin-top: 24px;
    position: relative;

    .taskListText {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .searchInput {
      width: 360px;
      min-width: 360px;
      height: 36px;
    }
    .filterIcon {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin-left: 24px;
      color: var(--color-text-tertiary);
      cursor: pointer;

      &:hover {
        color: var(--color-primary);
        background: var(--color-background-secondary);
      }
      &.isActive {
        color: var(--color-primary);
        background: rgba(33, 150, 243, 0.07);
      }
    }
    .addTaskButton {
      padding: 8px 24px;
      background: var(--color-primary);
      border-radius: 18px;
      color: var(--color-white);
      display: inline-block;
      cursor: pointer;

      &:hover {
        background: var(--color-link-hover);
      }
    }
  }

  .leftMove22 {
    margin-left: -22px;
  }
`;

export default function SyncTask(props) {
  const [flag, refreshComponents] = useState(+new Date());

  return (
    <SyncTaskWrapper className="flexColumn h100">
      <div className="flexRowBetween">
        <h3 className="Bold Font24 mBottom0">{_l('数据同步任务')}</h3>
        <ExecNumber projectId={props.currentProjectId} />
      </div>
      <Statistic projectId={props.currentProjectId} flag={flag} />

      <TaskList projectId={props.currentProjectId} onRefreshComponents={refreshComponents} />
    </SyncTaskWrapper>
  );
}
