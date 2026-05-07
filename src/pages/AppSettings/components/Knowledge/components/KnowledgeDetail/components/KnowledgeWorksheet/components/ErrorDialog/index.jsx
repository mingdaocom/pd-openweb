import React from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';

const ErrorDialogTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  .buttonBox {
    display: flex;
    align-items: center;
    gap: 20px;
    padding-right: 10px;
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 85px;
      height: 36px;
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text-primary);
      border: 1px solid var(--color-border-primary);
      border-radius: 3px;
      cursor: pointer;
    }
  }
`;

const ErrorDialogWrap = styled.div`
  padding: 10px;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
    padding: 5px 0;
    border-bottom: 1px solid var(--color-border-secondary);
    font-size: 13px;
    .name {
      flex: 1;
      padding-left: 10px;
    }
    .type {
      width: 100px;
    }
    .source {
      width: 200px;
    }
    .description {
      width: 150px;
    }
    .reason {
      flex: 1;
    }
    .operation {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100px;
      .btn {
        color: var(--color-primary);
        font-weight: 700;
        cursor: pointer;
        &:hover {
          color: var(--color-primary-light);
        }
        &:active {
          color: var(--color-primary-dark);
        }
      }
    }
  }
  .content {
    padding: 10px 0;
    height: 400px;
  }
`;

const ErrorDialog = props => {
  const { visible, onCancel } = props;

  if (!visible) return null;

  return (
    <Dialog
      width={1000}
      visible={visible}
      title={
        <ErrorDialogTitle>
          {_l('错误详情')}
          <div className="buttonBox">
            <div className="btn">{_l('全部忽略')}</div>
            <div className="btn">{_l('全部重试')}</div>
          </div>
        </ErrorDialogTitle>
      }
      onCancel={onCancel}
      footer={null}
    >
      <ErrorDialogWrap>
        <div className="header">
          <div className="name">{_l('名称')}</div>
          <div className="type">{_l('类型')}</div>
          <div className="source">{_l('来源')}</div>
          <div className="description">{_l('失败详情')}</div>
          <div className="reason">{_l('错误原因')}</div>
          <div className="operation"></div>
        </div>
        <div className="content"></div>
      </ErrorDialogWrap>
    </Dialog>
  );
};

export default ErrorDialog;
