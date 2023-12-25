import React, { Fragment } from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import { Checkbox, Tooltip } from 'ming-ui';

const User = styled.div`
  height: 36px;
  background: #f5f5f5;
  border-radius: 3px;
  border: 1px solid #ddd;
  padding: 0 10px;
`;

const Password = styled(Input.Password)`
  box-shadow: none !important;
  line-height: 28px !important;
  border-radius: 3px !important;
  border: 1px solid #ccc !important;
  padding: 3px 10px !important;
  &.ant-input-affix-wrapper-focused {
    border-color: #2196f3 !important;
  }
`;

export default ({ autoFocus = false, removeNoneVerification = false, onChange = () => {} }) => {
  return (
    <Fragment>
      <div className="Font13 bold Gray">{_l('账号')}</div>
      <User className="mTop10 flexRow alignItemsCenter">
        {md.global.Account.mobilePhone
          ? md.global.Account.mobilePhone.replace(/((\+86)?\d{3})\d*(\d{4})/, '$1****$3')
          : md.global.Account.email.replace(/(.{3}).*(@.*)/, '$1***$2')}
      </User>

      <div className="mTop20 mBottom10 relative Font13 bold Gray">
        <div className="Absolute" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
          *
        </div>
        {_l('密码')}
      </div>
      <div style={{ height: '0px', overflow: 'hidden' }}>
        // 用来避免浏览器将用户名塞到其它input里
        <input type="text" />
      </div>
      <Password
        autoComplete="new-password"
        autoFocus={autoFocus}
        placeholder={_l('输入当前用户的密码')}
        onChange={e => onChange({ password: e.target.value })}
      />
      {!removeNoneVerification && (
        <Tooltip popupPlacement="bottom" text={_l('此后1小时内在当前设备上应用和审批操作无需再次验证')}>
          <span>
            <Checkbox
              className="mTop15 InlineBlock TxtTop"
              text={_l('一小时内免验证')}
              onClick={checked => onChange({ isNoneVerification: checked })}
            />
          </span>
        </Tooltip>
      )}
    </Fragment>
  );
};
