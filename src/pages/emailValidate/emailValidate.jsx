import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import accountController from 'src/api/account';
import { getRequest } from 'src/utils/common';
import './style.css';

var ACTIONRESULTS = {
  BindSuccessfully: 1, // 邮箱绑定已经成功
  LinkAuthInvalid: 2, // 邮箱验证链接失效
  BoundEmail: 3, // 已经验证过邮箱
};

function Comp(props) {
  const [result, setState] = useState(ACTIONRESULTS.LinkAuthInvalid);
  const getEmailValidate = () => {
    let token = getRequest()['token'];
    if (!token) {
      return;
    }
    accountController
      .emailValidate({
        token,
      })
      .then(res => {
        setState(res || ACTIONRESULTS.LinkAuthInvalid);
      });
  };

  useEffect(() => {
    getEmailValidate();
  }, []);

  const renderCon = () => {
    switch (result) {
      case ACTIONRESULTS.BindSuccessfully:
        return (
          <div>
            <div class="Font17 mTop40 mBottom40">{_l('邮箱绑定成功')}</div>
          </div>
        );
      case ACTIONRESULTS.LinkAuthInvalid:
        return (
          <div>
            <div class="Font17 mTop40 mBottom40">{_l('此链接已失效')}</div>
            <div class="Font12 Gray_9e mBottom40">
              {_l('链接已过期或邮箱邮箱已被其他账号绑定，请进入个人账户安全设置')}
            </div>
          </div>
        );
      case ACTIONRESULTS.BoundEmail:
        <div>
          <div class="Font17 mTop40 mBottom40">{_l('绑定失败，该邮箱已被其他账号绑定')}</div>
        </div>;
      default:
        return (
          <div>
            <div class="Font17 mTop40 mBottom40">{_l('邮箱绑定失败')}</div>
          </div>
        );
    }
  };

  return (
    <div class="staticPageForm">
      <div class="header">
        <div class="content">
          <div class="logoContainer"></div>
        </div>
      </div>
      <div class="main">
        {renderCon()}
        <a href="/login" class="btn btnEnabled Font14 mBottom20">
          {_l('登录')}
        </a>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
