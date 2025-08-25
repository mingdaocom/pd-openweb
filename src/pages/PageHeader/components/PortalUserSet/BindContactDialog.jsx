import React, { useState } from 'react';
import { Modal } from 'antd';
import { Button } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import { ActionResult } from 'src/pages/AuthService/config';
import AccountCon from './AccountCon';

export default function (props) {
  const { appId, type = '', onOk = () => {} } = props;
  const [newAccount, setNewAccount] = useState('');
  const [code, setCode] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [country, setCountry] = useState('');

  const handleSubmit = () => {
    const account = type === 'phone' && newAccount.indexOf('+') === -1 ? country + newAccount : newAccount;
    externalPortalAjax
      .bindExAccount({
        appId,
        verifyCode: code,
        account,
        doubleBinding: true,
      })
      .then(data => {
        if (data.actionResult === 1) {
          onOk();
        } else {
          if (data.actionResult == ActionResult.noEfficacyVerifyCode) {
            alert(_l('验证码已经失效，请重新发送'), 3);
          } else if (data.actionResult == ActionResult.accountFrequentLoginError) {
            alert(_l('操作过于频繁，请稍后再试'), 3);
          } else {
            alert(_l('验证码错误'), 3);
          }
          return;
        }
      });
  };

  return (
    <Modal
      title={type === 'phone' ? _l('绑定手机号') : _l('绑定邮箱')}
      visible={true}
      centered={true}
      onCancel={() => {}} // 禁用所有默认关闭方式
      closable={false} // 隐藏关闭按钮
      maskClosable={false} // 禁用遮罩层点击关闭
      keyboard={false} // 禁用ESC关闭
      footer={[
        <Button type={'primary'} disabled={!isValidNumber || !code} onClick={handleSubmit}>
          {_l('绑定')}
        </Button>,
      ]}
      bodyClass="telDialogCon"
      width={560}
    >
      <AccountCon
        isBind={true}
        hidTel={type !== 'phone'}
        inputType={type}
        code={code}
        newAccount={newAccount}
        setCode={data => setCode(data)}
        setNewAccount={data => setNewAccount(data)}
        account={''}
        appId={appId}
        type={3}
        setIsValidNumber={setIsValidNumber}
        setCountry={setCountry}
      />
    </Modal>
  );
}
