import React, { Fragment } from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import { Checkbox, Tooltip } from 'ming-ui';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';

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

export default ({ autoFocus = false, onChange = () => {} }) => {
  const isMobile = browserIsMobile();
  return (
    <Fragment>
      <div className={cx('mBottom10 relative', isMobile ? 'Gray Font13 bold' : 'Gray_75')}>
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
        autoFocus={autoFocus}
        placeholder={_l('输入当前用户（%0）的登录密码', md.global.Account.fullname)}
        onChange={e => onChange({ password: e.target.value })}
      />
      <Tooltip popupPlacement="bottom" text={_l('此后1小时内在当前设备上应用和审批操作无需再次验证')}>
        <span>
          <Checkbox
            className={cx('mTop15 InlineBlock', { Gray: isMobile })}
            text={_l('一小时内免验证')}
            onClick={checked => onChange({ isNoneVerification: checked })}
          />
        </span>
      </Tooltip>
    </Fragment>
  );
};
