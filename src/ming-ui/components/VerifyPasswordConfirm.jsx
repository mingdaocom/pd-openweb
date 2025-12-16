import React, { useCallback, useEffect, useState } from 'react';
import { bool, func, number, string } from 'prop-types';
import { Dialog, VerifyPasswordInput } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import verifyPassword from 'src/components/verifyPassword';

export default function VerifyPasswordConfirm(props) {
  const {
    confirmType = 'primary',
    width = 480,
    title,
    description,
    isRequired,
    allowNoVerify = false,
    closeImageValidation,
    onOk = () => {},
    onCancel,
  } = props;
  const [password, setPassword] = useState('');
  const [isNoneVerification, setIsNoneVerification] = useState(false);

  const handleConfirm = useCallback(() => {
    if (isRequired && (!password || !password.trim())) {
      alert(_l('请输入密码'), 3);
      return;
    }

    verifyPassword({
      password,
      isNoneVerification,
      closeImageValidation,
      success: () => {
        onCancel();
        onOk(password);
      },
    });
  }, [isRequired, password, isNoneVerification, closeImageValidation]);

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
  }, [isRequired, password, isNoneVerification, closeImageValidation]);

  return (
    <Dialog
      visible
      className="verifyPasswordConfirm"
      width={width}
      overlayClosable={false}
      title={title || _l('安全验证')}
      description={description}
      onOk={handleConfirm}
      onCancel={onCancel}
      confirm={confirmType}
    >
      <VerifyPasswordInput
        showSubTitle={false}
        autoFocus={true}
        isRequired={isRequired}
        allowNoVerify={allowNoVerify}
        onChange={({ password, isNoneVerification }) => {
          setPassword(password);
          setIsNoneVerification(isNoneVerification);
        }}
      />
    </Dialog>
  );
}

VerifyPasswordConfirm.propTypes = {
  width: number,
  title: string,
  description: string,
  isRequired: bool,
  closeImageValidation: bool,
  onOk: func,
  onCancel: func,
};

VerifyPasswordConfirm.confirm = (props = {}) =>
  functionWrap(VerifyPasswordConfirm, { ...props, closeFnName: 'onCancel' });
