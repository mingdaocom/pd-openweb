import React, { useRef, Fragment } from 'react';
import { Dialog, Checkbox, Tooltip } from 'ming-ui';
import { Input } from 'antd';
import styled from 'styled-components';
import { verifyPassword } from 'src/util';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { func, number, string, bool, node } from 'prop-types';

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

const User = styled.div`
  height: 36px;
  background: #f5f5f5;
  border-radius: 3px;
  border: 1px solid #ddd;
  padding: 0 10px;
`;

export default function VerifyPasswordConfirm(props) {
  const {
    confirmType = 'primary',
    width = 480,
    title,
    description,
    allowNoVerify = false,
    showAccount = true,
    passwordLabel,
    passwordPlaceholder,
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
        {showAccount && (
          <Fragment>
            <div className="Font13 Bold">{_l('账号')}</div>
            <User className="mTop10 flexRow alignItemsCenter">
              {md.global.Account.mobilePhone
                ? md.global.Account.mobilePhone.replace(/((\+86)?\d{3})\d*(\d{4})/, '$1****$3')
                : md.global.Account.email.replace(/(.{3}).*(@.*)/, '$1***$2')}
            </User>
          </Fragment>
        )}

        {passwordLabel ? (
          passwordLabel
        ) : (
          <div className="Font13 mTop20 mBottom10 Bold relative">
            <div className="Absolute" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
              *
            </div>
            {_l('密码')}
          </div>
        )}
        <div style={{ height: '0px', overflow: 'hidden' }}>
          // 用来避免浏览器将用户名塞到其它input里
          <input type="text" />
        </div>
        <Password
          autoFocus
          ref={passwordRef}
          autoComplete="new-password"
          placeholder={passwordPlaceholder || _l('请输入当前用户的密码')}
        />
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
  showAccount: bool,
  passwordLabel: node,
  passwordPlaceholder: string,
  onOk: func,
  onCancel: func,
};

VerifyPasswordConfirm.confirm = (props = {}) =>
  functionWrap(VerifyPasswordConfirm, { ...props, closeFnName: 'onCancel' });
