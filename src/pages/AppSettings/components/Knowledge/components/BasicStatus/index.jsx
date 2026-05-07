import React, { Fragment, memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Icon } from 'ming-ui';
import { KNOWLEDGE_STATUS, STATUS_FROM } from '../../core/config';

const iconRotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StatusWrapper = styled.div`
  display: flex;
  gap: 20px;
  ${props => props.from === STATUS_FROM.COLLECTION && 'color: var(--color-text-secondary);'}
  .statusItemBox {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    white-space: nowrap;
    &.failed {
      color: var(--color-error);
    }
    .icon-agent_loading,
    .icon-clock {
      font-size: 16px;
      color: var(--color-primary);
    }
    .icon-Finish,
    .icon-done {
      font-size: 16px;
      color: var(--color-success);
    }
    .icon-cancel,
    .icon-cancel_line {
      font-size: 16px;
      color: var(--color-error);
    }
    .icon-info {
      font-size: 16px;
      color: var(--color-warning);
    }
    .icon-agent_loading {
      display: inline-block;
      animation: ${iconRotate} 0.8s linear infinite;
    }
    .circlePoint {
      margin-right: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-success);
      &.failed {
        background: var(--color-error);
      }
    }
  }
  .statusBtn {
    font-weight: 700;
    color: var(--color-primary);
    cursor: pointer;
    white-space: nowrap;
    &:hover {
      color: var(--color-primary-light);
    }
    &:active {
      color: var(--color-primary-dark);
    }
  }
`;

const BasicStatus = props => {
  const { from, item } = props;
  const { taskStatus, modelStatus } = item;

  // 知识库
  const renderContent = () => {
    switch (taskStatus) {
      // 失败状态
      case KNOWLEDGE_STATUS.INIT_FAILED:
      case KNOWLEDGE_STATUS.CHUNK_FAILED:
      case KNOWLEDGE_STATUS.VECTOR_FAILED:
        return null;

      case KNOWLEDGE_STATUS.INIT_QUEUED:
      case KNOWLEDGE_STATUS.INITIALIZING:
      case KNOWLEDGE_STATUS.INIT_SUCCESS:
      case KNOWLEDGE_STATUS.CHUNK_QUEUED:
      case KNOWLEDGE_STATUS.CHUNKING:
        return (
          <div className="statusItemBox">
            <Icon icon="agent_loading" />
            {_l('分块计算中...')}
          </div>
        );

      case KNOWLEDGE_STATUS.CHUNK_SUCCESS:
        return (
          <Fragment>
            <div className="statusItemBox">
              <Icon icon="Finish" />
              {_l('分块计算完成')}
            </div>
            <div className="statusBtn">{_l('前往完成向量化')}</div>
          </Fragment>
        );

      case KNOWLEDGE_STATUS.VECTOR_QUEUED:
      case KNOWLEDGE_STATUS.VECTORIZING:
        return (
          <div className="statusItemBox">
            <Icon icon="agent_loading" />
            {_l('向量化入库中...')}
          </div>
        );

      case KNOWLEDGE_STATUS.VECTOR_SUCCESS:
      default:
        return null;
    }
  };

  // 知识源
  const renderCollectionContent = () => {
    switch (taskStatus) {
      case KNOWLEDGE_STATUS.INIT_QUEUED:
      case KNOWLEDGE_STATUS.INITIALIZING:
        return (
          <div className="statusItemBox">
            <Icon icon="agent_loading" />
            {_l('获取数据中...')}
          </div>
        );
      case KNOWLEDGE_STATUS.INIT_FAILED:
        return (
          <div className="statusItemBox failed">
            <Icon icon="cancel_line" />
            {_l('获取数据失败')}
          </div>
        );
      case KNOWLEDGE_STATUS.INIT_SUCCESS:
      case KNOWLEDGE_STATUS.CHUNK_QUEUED:
        return (
          <div className="statusItemBox">
            <Icon icon="clock" />
            {_l('等待分块')}
          </div>
        );
      case KNOWLEDGE_STATUS.CHUNKING:
        return (
          <div className="statusItemBox">
            <Icon icon="agent_loading" />
            {_l('分块中...')}
          </div>
        );
      case KNOWLEDGE_STATUS.CHUNK_SUCCESS:
        return (
          <div className="statusItemBox">
            <Icon icon="done" />
            {_l('分块完成')}
          </div>
        );
      case KNOWLEDGE_STATUS.VECTOR_QUEUED:
        return (
          <div className="statusItemBox">
            <Icon icon="clock" />
            {_l('等待向量化')}
          </div>
        );
      case KNOWLEDGE_STATUS.VECTORIZING:
        return (
          <div className="statusItemBox">
            <Icon icon="agent_loading" />
            {_l('向量化中...')}
          </div>
        );
      case KNOWLEDGE_STATUS.VECTOR_SUCCESS:
        return (
          <div className="statusItemBox">
            <div className="circlePoint"></div>
            {_l('正常')}
          </div>
        );
      case KNOWLEDGE_STATUS.CHUNK_FAILED:
      case KNOWLEDGE_STATUS.VECTOR_FAILED:
        return (
          <div className="statusItemBox">
            <div className="circlePoint"></div>
            {_l('完成 存在部分异常')}
          </div>
        );
      default:
        return null;
    }
  };

  const renderModelContent = () => {
    switch (modelStatus) {
      case 'error':
        return (
          <div className="statusItemBox failed">
            <Icon icon="cancel" />
            {_l('模型不可用')}
          </div>
        );
      case 'test':
        return (
          <Fragment>
            <div className="statusItemBox">
              <Icon icon="info" />
              {_l('未启用')}
            </div>
            <div className="statusBtn">{_l('查看')}</div>
          </Fragment>
        );
    }
  };

  return (
    <StatusWrapper from={from}>
      {from === STATUS_FROM.KNOWLEDGE ? renderContent() : renderCollectionContent()}
      {modelStatus && renderModelContent()}
    </StatusWrapper>
  );
};

export default memo(BasicStatus);
