import React, { useRef } from 'react';
import { Dialog, Checkbox, Tooltip } from 'ming-ui';
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
    allowNoVerify = false,
    inputName = _l('当前用户密码'),
    passwordPlaceHolder = _l('请输入密码'),
    onOk = () => {},
    onCancel,
  } = props;
  const passwordRef = useRef();
  function handleConfirm() {
    const password = passwordRef.current.input.value;
    let isNoneVerification;
    try {
      isNoneVerification =
        allowNoVerify && !!passwordRef.current.input.closest('.con').querySelector('.verifyCheckbox .icon-ok');
    } catch (err) {}
    verifyPassword({
      password,
      isNoneVerification,
      closeImageValidation: allowNoVerify,
      success: () => {
        onCancel();
        onOk();
      },
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
      <div className="con">
        <div className="Font13 mBottom10 Bold">{inputName}</div>
        <div style={{ height: '0px', overflow: 'hidden' }}>
          // 用来避免浏览器将用户名塞到其它input里
          <input type="text" />
        </div>
        <Password autoFocus ref={passwordRef} autoComplete="new-password" placeholder={passwordPlaceHolder} />
        {allowNoVerify && (
          <Tooltip popupPlacement="bottom" text={_l('此后1小时内在当前设备上应用和审批操作无需再次验证')}>
            <div className="InlineBlock">
              <Checkbox className="verifyCheckbox" text={_l('1小时内免验证')} />
            </div>
          </Tooltip>
        )}
      </div>
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
