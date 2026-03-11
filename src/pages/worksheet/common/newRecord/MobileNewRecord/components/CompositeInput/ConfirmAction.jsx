import React, { Fragment, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideDown = keyframes`
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
`;

const Mask = styled.div`
  position: fixed;
  inset: 0;
  background-color: var(--color-background-overlay);
  z-index: 1000;
`;

const ActionWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--color-background-primary);
  border-radius: 0 0 10px 10px;
  z-index: 1001;
  animation: ${props => (props.closing ? slideUp : slideDown)} 0.25s ease-out forwards;
  box-shadow: 0px 2px 4px 1px rgba(0, 0, 0, 0.16);
`;

const Content = styled.div`
  padding: 24px 20px 30px;
  font-size: 17px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const Footer = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  .basicBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 36px;
    font-size: 13px;
    border-radius: 36px;
    font-weight: bold;
  }
  .cancel {
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-primary);
  }
  .confirm {
    color: var(--color-white);
    background-color: var(--color-error);
  }
`;

const ConfirmAction = ({ visible, content, onCancel, onConfirm }) => {
  const [closing, setClosing] = useState(false);

  if (!visible) return null;

  const handleClose = cb => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      cb?.();
    }, 250);
  };

  return (
    <Fragment>
      <Mask onClick={() => handleClose(onCancel)} />
      <ActionWrapper closing={closing}>
        <Content>{content}</Content>
        <Footer>
          <div className="basicBtn cancel" onClick={() => handleClose(onCancel)}>
            {_l('取消')}
          </div>
          <div className="basicBtn confirm" onClick={() => handleClose(onConfirm)}>
            {_l('离开')}
          </div>
        </Footer>
      </ActionWrapper>
    </Fragment>
  );
};

export default ConfirmAction;
