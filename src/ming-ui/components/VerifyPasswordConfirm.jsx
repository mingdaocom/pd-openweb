import React, { useCallback, useEffect, useState } from 'react';
import { bool, func, node, number, string } from 'prop-types';
import styled from 'styled-components';
import { VerifyPasswordInput } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import functionWrap from 'ming-ui/components/FunctionWrap';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import { getVerifyValueError } from 'src/utils/domain/security/verification';

const noop = () => {};

const Description = styled.div`
  margin-bottom: 16px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 20px;
  word-break: break-word;
`;

export default function VerifyPasswordConfirm(props) {
  const {
    confirmType = 'primary',
    width = 480,
    title,
    description,
    isRequired,
    showVerifyType = false,
    allowNoVerify = false,
    closeImageValidation,
    projectId,
    checkNeedAuth,
    customActionName,
    ignoreAlert,
    okText = _l('确定'),
    cancelText = _l('取消'),
    onOk = noop,
    onCancel = noop,
  } = props;
  const [verifyInfo, setVerifyInfo] = useState({});
  const [focusReady, setFocusReady] = useState(false);

  const handleConfirm = useCallback(() => {
    const error = showVerifyType || isRequired ? getVerifyValueError(verifyInfo) : '';

    if (error) {
      alert(error, 3);
      return;
    }

    verifyPassword({
      projectId,
      ...verifyInfo,
      showVerifyType,
      closeImageValidation,
      checkNeedAuth,
      customActionName,
      ignoreAlert,
      success: () => {
        onCancel();
        onOk(verifyInfo.password);
      },
    });
  }, [
    showVerifyType,
    isRequired,
    projectId,
    verifyInfo,
    closeImageValidation,
    checkNeedAuth,
    customActionName,
    ignoreAlert,
    onCancel,
    onOk,
  ]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleConfirm();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleConfirm]);

  return (
    <Modal
      open
      className="verifyPasswordConfirm"
      width={width}
      mask={{ closable: false }}
      title={title || _l('安全验证')}
      onCancel={onCancel}
      afterOpenChange={setFocusReady}
      footer={
        <div>
          <Button color="primary" variant="link" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            {...(confirmType === 'danger' ? { color: 'danger', variant: 'solid' } : { type: 'primary' })}
            onClick={handleConfirm}
            data-id="confirmBtn"
          >
            {okText}
          </Button>
        </div>
      }
    >
      {description && <Description>{description}</Description>}
      <VerifyPasswordInput
        showSubTitle={false}
        autoFocus={focusReady}
        isRequired={isRequired}
        showVerifyType={showVerifyType}
        allowNoVerify={allowNoVerify}
        onChange={setVerifyInfo}
      />
    </Modal>
  );
}

VerifyPasswordConfirm.propTypes = {
  width: number,
  title: node,
  description: node,
  isRequired: bool,
  showVerifyType: bool,
  allowNoVerify: bool,
  closeImageValidation: bool,
  projectId: string,
  checkNeedAuth: bool,
  customActionName: string,
  ignoreAlert: bool,
  confirmType: string,
  okText: node,
  cancelText: node,
  onOk: func,
  onCancel: func,
};

VerifyPasswordConfirm.confirm = (props = {}) =>
  functionWrap(VerifyPasswordConfirm, { ...props, closeFnName: 'onCancel' });
