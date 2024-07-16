import React, { Component } from 'react';
import Ajax from 'src/api/workWeiXin';
import Config from '../config';
import { Switch } from 'ming-ui';
import { Button, Input } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import RegExpValidator from 'src/util/expression';
import { encrypt } from 'src/util';
import _ from 'lodash';

const SetInitialPassword = styled.div`
  padding: 20px 0;
  margin: 0 25px;
  border-bottom: 1px solid #eaeaea;
  .syncBox {
    max-width: 637px;
  }
  .initialPasswordInfo {
    margin: 24px 0 20px 0;
    position: relative;
    .passwordlabel {
      font-size: 13px;
      color: #333;
    }
    .password {
      width: 320px;
      height: 36px;
      margin: 0 24px 0 28px;
      border: 1px solid #2196f3;
    }
    .passwordError {
      border: 1px solid #ff4d4f;
    }
    .passwordErrorTxt {
      color: #ff4d4f;
      padding-left: 80px;
    }
    .ant-btn-primary {
      height: 36px;
      position: absolute;
      top: 0;
      bottom: 0;
    }
  }
`;

export default class IntegrationSetPssword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: props.password,
      isSetPassword: props.isSetPassword,
    };
  }

  componentWillReceiveProps(nextPorops) {
    if (!_.isEqual(this.props.isSetPassword, nextPorops.isSetPassword)) {
      this.setState({ isSetPassword: nextPorops.isSetPassword });
    }
    if (!_.isEqual(this.props.password, nextPorops.password)) {
      this.setState({ password: nextPorops.password });
    }
  }

  // 改变初始密码值
  changeInitialPassword = password => {
    Ajax.editIntergrationAccountInitializeInfo({
      projectId: Config.projectId,
      password: password ? encrypt(password) : '',
    }).then(res => {
      if (this.state.isSetPassword) {
        if (res) {
          alert(_l('保存成功'));
        } else {
          alert(_l('保存失败'), 2);
        }
      }
    });
  };

  // 开始未同步账号设置初始密码
  changeSetInitialPassword = checked => {
    this.setState({ isSetPassword: !checked });
    if (checked) {
      this.changeInitialPassword('');
    } else {
      this.setState({ password: '' });
    }
  };
  // 保存密码
  savePassword = () => {
    let { password } = this.state;
    const { passwordRegex } = md.global.SysSettings;

    if (RegExpValidator.isPasswordValid(password, passwordRegex)) {
      this.setState({ passwordError: false });
      this.changeInitialPassword(password);
    } else {
      this.setState({ passwordError: true });
    }
  };
  render() {
    let { disabled } = this.props;
    const { passwordRegexTip, passwordRegex } = md.global.SysSettings;

    return (
      <SetInitialPassword>
        <div className="flex">
          <h3 className="stepTitle Font16 Gray mBottom24">{_l('为同步账号设置初始密码')}</h3>
          <Switch disabled={disabled} checked={this.state.isSetPassword} onClick={this.changeSetInitialPassword} />
          <div className="mTop16 syncBox">
            <span className="Font13 Gray_75 info">
              {_l('开启后，为同步到系统的账号设置初始密码，用户可以使用系统创建的账号和密码（初始密码）进行登录')}
            </span>
          </div>
          <div className="mTop10 syncBox">
            <span className="Font13 Gray_75 info">{_l('注：为保证账号安全，首次使用账号登录需修改密码')}</span>
          </div>
          {this.state.isSetPassword && (
            <div className="initialPasswordInfo">
              <span className="passwordlabel">{_l('初始密码')}</span>
              <Input.Password
                className={cx('password', { passwordError: this.state.passwordError })}
                value={this.state.password}
                placeholder={passwordRegexTip}
                autoComplete="new-password"
                onChange={e => {
                  let value = e.target.value;
                  this.setState({
                    password: value,
                  });
                }}
              />
              <Button type="primary" onClick={this.savePassword}>
                {_l('保存')}
              </Button>
              {this.state.passwordError && (
                <div className="passwordErrorTxt">{passwordRegexTip || _l('8-20位，需包含字母和数字')}</div>
              )}
            </div>
          )}
        </div>
      </SetInitialPassword>
    );
  }
}
