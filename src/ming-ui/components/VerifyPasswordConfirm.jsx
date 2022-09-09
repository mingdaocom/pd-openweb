import React, { useRef } from 'react';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
import styled from 'styled-components';
import { encrypt } from 'src/util';
import captcha from 'src/components/captcha';
import { checkAccount } from 'src/api/account';
import functionWrap from 'worksheet/components/FunctionWrap';
import { func, number, string } from 'prop-types';

const Password = styled(Input.Password)`
  box-shadow: none !important;
  line-height: 28px !important;
  border-radius: 3px !important;
  border: 1px solid #ccc !important;
  margin-bottom: 10px;
  &.ant-input-affix-wrapper-focused {
    border-color: #2196f3;
  }
`;

export default function VerifyPasswordConfirm(props) {
  const { width = 480, title, description, passwordPlaceHolder = _l('请输入密码'), onOk = () => {}, onCancel } = props;
  const passwordRef = useRef();
  function handleConfirm() {
    const password = passwordRef.current.input.value;
    if (!password) {
      alert(_l('请输入密码'), 3);
      return;
    }
    let cb = function (res) {
      if (res.ret !== 0) {
        return;
      }
      checkAccount({
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.staticglobal.getCaptchaType(),
        password: encrypt(password),
      }).then(statusCode => {
        if (statusCode === 1) {
          onCancel();
          onOk();
        } else {
          alert(
            {
              6: _l('密码不正确'),
              8: _l('验证码错误'),
            }[statusCode] || _l('操作失败'),
            2,
          );
        }
      });
    };

    if (md.staticglobal.getCaptchaType() === 1) {
      new captcha(cb);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), cb).show();
    }
  }
  return (
    <Dialog
      visible
      width={width}
      overlayClosable={false}
      title={title}
      description={description}
      onOk={handleConfirm}
      onCancel={onCancel}
      confirm="danger"
    >
      <div className="Font14 mBottom12">{_l('当前用户密码')}</div>
      <Password ref={passwordRef} autoComplete="new-password" placeholder={passwordPlaceHolder} />
    </Dialog>
  );
}

VerifyPasswordConfirm.propTypes = {
  width: number,
  title: string,
  description: string,
  passwordPlaceHolder: string,
  onOk: func,
  onCancel: func,
};

VerifyPasswordConfirm.confirm = (props = {}) =>
  functionWrap(VerifyPasswordConfirm, { ...props, closeFnName: 'onCancel' });
