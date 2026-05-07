import React, { memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button, Icon } from 'ming-ui';

const iconRotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const DialogFooterWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .icon-agent_loading {
    display: inline-block;
    animation: ${iconRotate} 0.8s linear infinite;
    font-size: 16px;
    color: var(--color-text-inverse);
  }
`;

const DialogFooter = props => {
  const {
    okLoading = false,
    okDisabled = false,
    onCancel = () => {},
    onOk = () => {},
    cancelText = _l('取消'),
    okText = _l('确认'),
    okType = 'primary',
  } = props;

  return (
    <DialogFooterWrap>
      <Button type="link" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button disabled={okDisabled || okLoading} type={okType} onClick={onOk}>
        {okLoading ? <Icon icon="agent_loading" /> : okText}
      </Button>
    </DialogFooterWrap>
  );
};

export default memo(DialogFooter);
