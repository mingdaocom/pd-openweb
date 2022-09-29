import React, { Component } from 'react';
import account from 'src/api/account';
import { Dialog } from 'ming-ui';
import { encrypt } from 'src/util';
import captcha from 'src/components/captcha';
import { navigateTo } from 'router/navigateTo';
import cx from 'classnames';
import './index.less';

export default class ValidPassWord extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      disabled: false,
    };
  }

  handleSubmit() {
    if (!this.state.password) {
      alert(_l('请输入密码'), 2);
    } else {
      this.setState({ disabled: true });
      const { projectId, companyName } = this.props;

      var throttled = _.throttle(
        res => {
          if (res.ret === 0) {
            account
              .validateExitProject({
                password: encrypt(this.state.password),
                projectId,
                ticket: res.ticket,
                randStr: res.randstr,
                captchaType: md.staticglobal.getCaptchaType(),
              })
              .done(result => {
                if (result === 2) {
                  alert(_l('密码错误'), 3);
                  $('inputBox').val('').focus();
                } else if (result === 4) {
                  // 需要 注销网络 [即 他是最后一个成员 也是 最后的 管理员]
                  Dialog.confirm({
                    title: <spam className="Font15 Bold">{_l('您是组织【%0】超级管理员', companyName)}</spam>,
                    description: <span className="Font13 Gray">{_l('请先注销组织或交接后方可注销。')}</span>,
                    okText: _l('前往注销'),
                    showCancel: false,
                    onOk: () => {
                      navigateTo('/admin/sysinfo/' + projectId);
                    },
                  });
                } else {
                  // result
                  // 1 success
                  // 2 password error
                  // 3 need transfter admin
                  this.props.closeDialog();
                  this.props.transferAdminProject(projectId, companyName, this.state.password, result);
                }
              })
              .always(() => {
                this.setState({ disabled: false });
              });
          }
        },
        10000,
        { leading: true },
      );

      if (md.staticglobal.getCaptchaType() === 1) {
        new captcha(throttled);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled).show();
      }
    }
  }

  render() {
    const { password, disabled } = this.state;
    return (
      <div className="pTop15 pBottom15 TxtCenter">
        <div className="mBottom15">
          <input
            type="password"
            className="inputBox"
            value={password}
            autocomplete="new-password"
            placeholder={_l('请输入登录密码')}
            onChange={e => {
              this.setState({ password: e.target.value });
            }}
          />
        </div>
        <div>
          <button
            type="button"
            disabled={disabled}
            className={cx('btn ming Button Button--primary', { 'Button--disabled': disabled })}
            onClick={() => {
              if (!disabled) {
                this.handleSubmit();
              }
            }}
          >
            {_l('确认')}
          </button>
        </div>
      </div>
    );
  }
}
