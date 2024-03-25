import React, { Fragment } from 'react';
import { Checkbox, Tooltip } from 'ming-ui';
import { Input } from 'antd';
import styled from 'styled-components';
import { browserIsMobile } from 'src/util';

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

const RequiredBox = styled.div`
  margin: 1px 0 0 -8px;
  color: #f44336;
`;

const NoPassword = styled.div`
  color: #9e9e9e;
  cursor: pointer;
  &:hover {
    color: #757575;
  }
`;

export default function VerifyPasswordInput(props) {
  const { className, showSubTitle, isRequired, autoFocus, allowNoVerify, onChange = () => {} } = props;

  const settingBtns = () => {
    return (
      <span
        className="ThemeColor Hand"
        onClick={() => {
          window.open('/personal?type=account');
        }}
      >
        {_l('前往设置')}
      </span>
    );
  };

  const vertifyCheckBox = () => {
    return (
      <span className="mTop5 InlineBlock">
        <Checkbox
          className="InlineBlock TxtTop Gray"
          text={_l('一小时内免验证')}
          onClick={checked => onChange({ isNoneVerification: checked })}
        />
      </span>
    );
  };

  return (
    <div className={className}>
      {showSubTitle && <div className="Font17 bold mBottom10 verifyPasswordTitle">{_l('安全验证')}</div>}

      <div className="Font13 Gray label">{_l('账号')}</div>
      <User className="mTop10 flexRow alignItemsCenter">
        {md.global.Account.mobilePhone
          ? md.global.Account.mobilePhone.replace(/((\+86)?\d{3})\d*(\d{4})/, '$1****$3')
          : md.global.Account.email.replace(/(.{3}).*(@.*)/, '$1***$2')}
      </User>

      <div className="Font13 mTop20 mBottom10 relative flexRow alignItemsCenter">
        {isRequired && <RequiredBox className="Absolute">*</RequiredBox>}
        <span className="flex Gray label">{_l('密码')}</span>
        <Tooltip
          action="hover"
          tooltipStyle={{ maxWidth: 360 }}
          text={
            <Fragment>
              {isRequired ? (
                <div>
                  <div>{_l('此操作必须验证用户密码。')}</div>
                  <div>{_l('如果你是集成帐号，还没有设置过当前平台密码，请先在个人中心设置密码')}</div>
                  {settingBtns()}
                </div>
              ) : (
                <div>
                  <div>{_l('如果你是集成帐号，还没有设置过当前平台密码：')}</div>
                  <div>{_l('- 不需要输入，不进行安全验证')}</div>
                  <div>
                    {_l('- 如果你希望提高安全性，可在个人中心设置密码。设置后将必须输入密码进行安全验证')}
                    {settingBtns()}
                  </div>
                </div>
              )}
            </Fragment>
          }
        >
          <NoPassword className="flexRow alignItemsCenter">
            <i className="icon icon-workflow_help mRight5 Font16" />
            <span>{_l('没有密码')}</span>
          </NoPassword>
        </Tooltip>
      </div>

      <div style={{ height: 0, overflow: 'hidden' }}>
        // 用来避免浏览器将用户名塞到其它input里
        <input type="text" />
      </div>
      <Password
        autoFocus={autoFocus}
        autoComplete="new-password"
        placeholder={_l('请输入当前用户的密码')}
        onChange={e => onChange({ password: e.target.value })}
      />

      {/* 一小时免验证 */}
      {allowNoVerify ? (
        browserIsMobile() ? (
          vertifyCheckBox()
        ) : (
          <Tooltip popupPlacement="bottom" text={_l('此后1小时内在当前设备上应用和审批操作无需再次验证')}>
            {vertifyCheckBox()}
          </Tooltip>
        )
      ) : (
        ''
      )}
    </div>
  );
}
