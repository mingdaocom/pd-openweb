import React, { Component, Fragment } from 'react';
import './index.less';
import { Input } from 'antd';
import userPassword from 'src/api/account';
import { encrypt } from 'src/util';
import RegExp from 'src/util/expression';
import _ from 'lodash';

export default class EditPassword extends Component {
  constructor(props) {
    super(props);
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    this.state = {
      originPassword: '',
      newPassword: '',
      confirmPassword: '',
      passwordRegexTip,
      passwordRegex,
    };
  }

  isPasswordRule = str => {
    return RegExp.isPasswordValid(str, this.state.passwordRegex);
  };

  handleSubmit() {
    const { isNullCredential } = this.props;
    const { originPassword, newPassword, confirmPassword } = this.state;
    if (!newPassword) {
      alert(_l('请设置新密码'), 3);
      $('#newInput').focus();
      return;
    }
    if (!this.isPasswordRule(newPassword)) {
      let msg = this.state.passwordRegexTip || _l('密码,8-20位，必须字母+数字');
      alert(msg, 3);
      $('#newInput').focus().select();
      return;
    }
    if (isNullCredential) {
      if (!confirmPassword) {
        alert(_l('请确认密码'), 3);
        $('#confirmPassword').focus();
        return;
      }
      if (!this.isPasswordRule(confirmPassword)) {
        let msg = this.state.passwordRegexTip || _l('密码,8-20位，必须字母+数字');
        alert(msg, 3);
        $('#confirmPassword').focus().select();
        return;
      }
      if (!_.isEqual(newPassword, confirmPassword)) {
        alert(_l('两次输入密码不一致'), 3);
        return;
      }
    }

    userPassword
      .editPwd({
        oldPwd: originPassword && !isNullCredential ? encrypt(originPassword) : undefined,
        newPwd: encrypt(newPassword),
        confirmPwd: isNullCredential ? encrypt(confirmPassword) : encrypt(newPassword),
      })
      .then(data => {
        window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
        if (data === 1) {
          this.forbidRefresh();
          var message =
            _l('密码修改成功，请重新登录') +
            '<div style="max-width:350px;" class="LineHeight20 Font12 Gray_a">' +
            _l('为了保障账户安全，如果您有安装APP，%0APP将自动登出，建议您重新登录确保可以正常收到推送', '<br />') +
            '</div>';
          //  保存成功
          alert(message, 1, 5000, function () {
            window.location.href = '/logout';
          });
        } else if (data === 6) {
          // /*旧密码错误*/
          alert(_l('原密码输入不正确'), 2);
          $('#originInput').focus().select();
        } else if (data === 3) {
          // /*新旧密码一样*/
          alert(_l('您输入的新密码与旧密码一样'), 2);
          $('#newInput').focus().select();
        } else if (data === 4) {
          // /*新密码和确认密码不一致!*/
          alert(_l('您输入的新密码和确认密码不一致'), 2);
          $('#newInput').focus().select();
        } else {
          //  保存失败
          alert(_l('保存失败'), 2);
        }
      })
      .catch();
  }

  forbidRefresh() {
    $("<div class='passwordModifySuccessMask'></div>").appendTo('html > body');
    this.forbidF5();
    this.forbidRightClick();
  }

  forbidF5() {
    document.onkeydown = function (e) {
      e = window.event || e;
      var keycode = e.keyCode || e.which;
      if ((keycode = 116)) {
        if (window.event) {
          try {
            e.keyCode = 0;
          } catch (e) {}
          e.returnValue = false;
        } else {
          e.preventDefault();
        }
      }
    };
  }

  forbidRightClick() {
    document.oncontextmenu = function () {
      return false;
    };
  }

  render() {
    const { isNullCredential } = this.props;
    const { originPassword, newPassword, confirmPassword } = this.state;
    return (
      <div className="clearfix">
        {!isNullCredential && (
          <Fragment>
            <div className="Gray">{_l('原有密码')}</div>
            <Input.Password
              id="originInput"
              autocomplete="new-password"
              value={originPassword}
              className="mTop10 mBottom10"
              placeholder={_l('原有密码')}
              onChange={e => this.setState({ originPassword: e.target.value })}
            />
            <div className="clearfix Block">
              <a class="NoUnderline Right ThemeColor3 Hover_49" target="_blank" href="/findPassword">
                {_l('忘记密码？')}
              </a>
            </div>
          </Fragment>
        )}
        <div className="Gray mTop24">{_l('新密码')}</div>
        <Input.Password
          id="newInput"
          autocomplete="new-password"
          value={newPassword}
          className="mTop10 mBottom10"
          placeholder={_l('新密码')}
          onChange={e => this.setState({ newPassword: e.target.value })}
        />
        <div className="Gray_9e">{this.state.passwordRegexTip || _l('密码,8-20位，必须字母+数字')}</div>

        {isNullCredential && (
          <Fragment>
            <div className="Gray mTop24">{_l('再次输入新密码')}</div>
            <Input.Password
              id="confirmPassword"
              autocomplete="new-password"
              value={confirmPassword}
              className="mTop10 mBottom10"
              placeholder={_l('再次输入新密码')}
              onChange={e => this.setState({ confirmPassword: e.target.value })}
            />
          </Fragment>
        )}

        <div className="mTop40 Right mBottom24">
          <span className="Font14 Gray_9e mRight32 Hover_49 Hand" onClick={() => this.props.closeDialog()}>
            {_l('取消')}
          </span>
          <button
            type="button"
            className="ming Button Button--primary editPasswordDialogBtn"
            onClick={() => this.handleSubmit()}
          >
            {_l('确认')}
          </button>
        </div>
      </div>
    );
  }
}
