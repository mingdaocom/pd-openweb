import React from 'react';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';

const ErrorDialogWrap = styled.div`
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
    <Modal
      width={1000}
      open={visible}
      title={_l('错误详情')}
      cancelText={_l('全部忽略')}
      okText={_l('全部重试')}
      keyboard
      onCancel={onCancel}
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
    </Modal>
  );
};

export default ErrorDialog;
