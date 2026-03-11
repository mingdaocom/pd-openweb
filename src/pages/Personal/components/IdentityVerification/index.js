import React, { useEffect, useState } from 'react';
import { Button, Dialog, VerifyPasswordInput } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import accountAjax from 'src/api/account';
import verifyPassword from 'src/components/verifyPassword';

export default function IdentityVerification(props) {
  const { btnText, verificationSuccess = () => {} } = props;
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const onCancel = () => {
    setVisible(false);
    props.onCancel();
  };

  const handleClick = () => {
    verifyPassword({
      checkNeedAuth: false,
      ignoreAlert: false,
      customActionName: 'checkAccount',
      password,
      success: () => {
        setDisabled(false);
        verificationSuccess();
        onCancel();
      },
      fail: () => {
        setDisabled(false);
      },
    });
  };

  useEffect(() => {
    accountAjax.checkAccount({}).then(res => {
      if (res === 1) {
        verificationSuccess();
        return;
      }
      setVisible(res !== 1);
    });
  }, []);

  return (
    <Dialog visible={visible} title={_l('身份验证')} onCancel={onCancel} showFooter={false}>
      <div className="textPrimary mBottom15">{_l('请先输入密码验证您的身份')}</div>
      <VerifyPasswordInput
        autoFocus
        className="mBottom10"
        showSubTitle={false}
        onChange={({ password }) => setPassword(password)}
      />
      <Button className="w100 InlineBlock" disabled={disabled} onClick={handleClick}>
        {btnText || _l('下一步')}
      </Button>
    </Dialog>
  );
}

export const identityVerificationFunc = props => FunctionWrap(IdentityVerification, props);
