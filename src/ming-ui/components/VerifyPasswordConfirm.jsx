import React, { useRef } from 'react';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
import styled from 'styled-components';
import { verifyPassword } from 'src/util';
import functionWrap from 'ming-ui/components/FunctionWrap';
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
  const {
    confirmType = 'primary',
    width = 480,
    title,
    description,
    inputName = _l('当前用户密码'),
    passwordPlaceHolder = _l('请输入密码'),
    onOk = () => {},
    onCancel,
  } = props;
  const passwordRef = useRef();
  function handleConfirm() {
    const password = passwordRef.current.input.value;

    verifyPassword(password, () => {
      onCancel();
      onOk();
    });
  }
  return (
    <Dialog
      visible
      className="verifyPasswordConfirm"
      width={width}
      overlayClosable={false}
      title={title}
      description={description}
      onOk={handleConfirm}
      onCancel={onCancel}
      confirm={confirmType}
    >
      <div className="Font13 mBottom10 Bold">{inputName}</div>
      <div style={{ height: '0px', overflow: 'hidden' }}>
        // 用来避免浏览器将用户名塞到其它input里
        <input type="text" />
      </div>
      <Password ref={passwordRef} autoComplete="new-password" placeholder={passwordPlaceHolder} />
    </Dialog>
  );
}

VerifyPasswordConfirm.propTypes = {
  width: number,
  title: string,
  description: string,
  inputName: string,
  passwordPlaceHolder: string,
  onOk: func,
  onCancel: func,
};

VerifyPasswordConfirm.confirm = (props = {}) =>
  functionWrap(VerifyPasswordConfirm, { ...props, closeFnName: 'onCancel' });
