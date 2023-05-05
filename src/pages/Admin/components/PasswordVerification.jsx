import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
import { verifyPassword } from 'src/util';
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

    verifyPassword(password, () => {
      _this.props.exportUsers();
      _this.props.isShowInputPassword();
    });
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
