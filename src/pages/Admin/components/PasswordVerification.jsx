import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
import AccountController from 'src/api/account';
import { encrypt } from 'src/util';
import { getPssId } from 'src/util/pssId';
import './passwordVerification.less';

const errorMsg = {
  6: _l('密码错误'),
  8: _l('验证码错误'),
};
export default class PasswordVerification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
    };
  }
  confirmPassword = () => {
    let { password } = this.state;
    let _this = this;
    if (!password) {
      alert(_l('请输入登录密码'), 3);
      return;
    }
    let throttled = function (res) {
      if (res.ret !== 0) {
        return;
      }
      AccountController.checkAccount({
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.staticglobal.getCaptchaType(),
        password: encrypt(password),
      }).then(res => {
        if (res === 1) {
          _this.props.exportUsers();
          _this.props.isShowInputPassword();
          // _this.exportUsers(
          //   projectId,
          //   orgnazation.map(item => item.departmentId),
          // );
          // _this.setState({ showInputPassword: false });
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
    const { showInputPassword } = this.props;
    let { password } = this.state;
    return (
      <Dialog
        className="dialogInputPassword"
        visible={showInputPassword}
        title={_l('请输入登录密码，以验证管理员身份')}
        footer={
          <div className="Hand" onClick={this.confirmPassword}>
            {_l('确认')}
          </div>
        }
        onCancel={() => {
          this.props.isShowInputPassword();
        }}
      >
        <div>{_l('登录密码')}</div>
        <Input.Password
          value={password}
          autocomplete="new-password"
          onChange={e => this.setState({ password: e.target.value })}
        />
      </Dialog>
    );
  }
}

PasswordVerification.propTypes = {
  showInputPassword: PropTypes.bool,
  exportUsers: PropTypes.func,
};
