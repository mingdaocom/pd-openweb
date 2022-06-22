import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
import styled from 'styled-components';
import AccountController from 'src/api/account';
import { encrypt } from 'src/util';

const PasswordConfirmWWrap = styled.div``;
const errorMsg = {
  6: _l('密码不正确'),
  8: _l('验证码错误'),
};

export default class PasswordConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  inputPassword = e => {
    this.setState({ password: e.target.value });
  };
  onOk = () => {
    let { password } = this.state;
    if (!password) return;
    let throttled = function (res) {
      if (res.ret !== 0) {
        return;
      }
      AccountController.checkAccount({
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.staticglobal.getCaptchaType(),
        password: encrypt(password),
      }).then(result => {
        console.log(result, 'result');
        if (result === 1) {
          this.props.cancelPasswordComfirm();
        } else {
          alert(errorMsg[res] || _l('操作失败'), 2);
        }
      });
    };

    if (md.staticglobal.getCaptchaType() === 1) {
      new captcha(throttled);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled).show();
    }
  };
  render() {
    const { actType, visible } = this.props;
    let { password } = this.state;
    return (
      <Dialog
        width={500}
        visible={visible}
        title={actType === 'delete' ? <span className="Red">{_l('删除密钥')}</span> : _l('查看密钥')}
        onCancel={this.props.cancelPasswordComfirm}
        onOk={this.onOk}
        overlayClosable={false}
      >
        <PasswordConfirmWWrap>
          <div className="Gray_75 mBottom24">
            {actType === 'delete'
              ? _l('删除密钥后，之前所有使用此密钥的服务都将停止，请谨慎操作')
              : _l('组织密钥是极为重要的凭证，需要你输入密码确认后才能查看')}
          </div>
          <div className="mBottom10">{_l('当前用户密码')}</div>
          <Input.Password
            value={password}
            autoComplete="new-password"
            onChange={this.inputPassword}
            placeholder={_l('请输入密码确认授权')}
          />
        </PasswordConfirmWWrap>
      </Dialog>
    );
  }
}
