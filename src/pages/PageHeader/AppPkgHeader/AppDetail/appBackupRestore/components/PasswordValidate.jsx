import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
import AccountController from 'src/api/account';
import { encrypt } from 'src/util';
import styled from 'styled-components';
import captcha from 'src/components/captcha';
import appManagementAjax from 'src/api/appManagement.js';
import cx from 'classnames';

const Footer = styled.div`
  font-size: 14px;
  line-height: 36px;
  min-height: 36px;
  span {
    font-size: 14px;
    line-height: 36px;
    min-height: 36px;
    display: inline-block;
    box-sizing: border-box;
    text-shadow: none;
    border: none;
    outline: none;
    border-radius: 3px;
    color: #fff;
    vertical-align: middle;
    cursor: pointer;
    width: 92px;
    text-align: center;
  }
  .cancelBtn {
    color: #9e9e9e;
  }
  .cancelBtn:hover {
    color: #1e88e5;
  }
  .confirmBtn {
    background: #2196f3;
    cursor: pointer;
  }
  .confirmBtn:hover {
    background-color: #1565c0;
  }
  .disabledConfirmBtn {
    color: #fff;
    background: #bdbdbd;
    cursor: not-allowed;
  }
  .disabledConfirmBtn:hover {
    background: #bdbdbd;
  }
`;

const PasswordValidateCon = styled.div``;
const errorMsg = {
  6: _l('密码不正确'),
  8: _l('验证码错误'),
};

export default class PasswordValidate extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  confirmPassword = () => {
    const {
      projectId,
      appId,
      actCurrentFileInfo,
      isEndFixed,
      isBackupCurrentVersion,
      token,
      getList = () => {},
      getBackupCount = () => {},
      setIsEndFixed = () => {},
      setIsBackupCurrentVersion = () => {},
    } = this.props;

    let { password } = this.state;
    if (!password) return;
    let _this = this;
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
          _this.props.setShowInputPassword(false);
          let params = {
            projectId,
            appId,
            id: actCurrentFileInfo.id,
            autoEndMaintain: isEndFixed,
            backupCurrentVersion: isBackupCurrentVersion,
            isRestoreNew: false,
          };

          appManagementAjax.restore(params).then(res => {
            if (res) {
              getBackupCount();
              getList(1);
              setIsEndFixed(false);
              setIsBackupCurrentVersion(false);
            }
          });
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

  inputPassword = e => {
    this.setState({ password: e.target.value });
  };
  render() {
    let { password } = this.state;
    const { showInputPassword } = this.props;

    return (
      <Dialog
        visible={showInputPassword}
        title={_l('请进行身份验证')}
        onCancel={() => {
          this.props.setShowInputPassword(false);
        }}
        overlayClosable={false}
        footer={
          <Footer>
            <span className="cancel Gray_9e" onClick={() => this.props.setShowInputPassword(false)}>
              <span className="cancelBtn">{_l('取消')}</span>
            </span>
            <span className={cx('confirmBtn', { disabledConfirmBtn: !password })} onClick={this.confirmPassword}>
              {_l('确认')}
            </span>
          </Footer>
        }
      >
        <PasswordValidateCon>
          <div className="Gray_75 Font14 mBottom20">{_l('还原应用为敏感操作，需要验证身份')}</div>
          <div className="Font13 mBottom10">{_l('当前用户密码')}</div>
          <Input.Password
            value={password}
            autoComplete="new-password"
            onChange={this.inputPassword}
            placeholder={_l('请输入密码确认授权')}
          />
        </PasswordValidateCon>
      </Dialog>
    );
  }
}
