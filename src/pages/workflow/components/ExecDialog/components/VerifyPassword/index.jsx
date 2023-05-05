import React, { Fragment } from 'react';
import { Input } from 'antd';
import styled from 'styled-components';

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

export default ({ onChange = () => {} }) => {
  return (
    <Fragment>
      <div className="Gray_75 mBottom10 relative">
        <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
          *
        </div>
        {_l('登录密码验证')}
      </div>
      <div style={{ height: '0px', overflow: 'hidden' }}>
        // 用来避免浏览器将用户名塞到其它input里
        <input type="text" />
      </div>
      <Password
        autoComplete="new-password"
        placeholder={_l('输入当前用户（%0）的登录密码', md.global.Account.fullname)}
        onChange={e => onChange(e.target.value)}
      />
    </Fragment>
  );
};
