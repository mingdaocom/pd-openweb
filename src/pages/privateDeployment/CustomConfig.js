import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Checkbox, Dialog, Input } from 'ming-ui';
import Trigger from 'rc-trigger';
import privateSysSetting from 'src/api/privateSysSetting';
import { formatNumberFromInput } from 'src/util';

export default class CustomConfig extends Component {
  constructor(props) {
    super(props);
    const { SysSettings } = md.global;
    this.state = {
      appDialogVisible: false,
      passwordDialogVisible: false,
      firstLoginResetPasswordDialogVisible: false,
      downloadAppRedirectUrl: SysSettings.downloadAppRedirectUrl,
      hideDownloadApp: SysSettings.hideDownloadApp,
      onlyAdminCreateApp: SysSettings.onlyAdminCreateApp,
      hideHelpTip: SysSettings.hideHelpTip,
      forbidSuites: _.uniq(SysSettings.forbidSuites.split('|')).filter(item => item !== '5'),
      hideRegister: SysSettings.hideRegister,
      hideTemplateLibrary: SysSettings.hideTemplateLibrary,
      allowBindAccountNoVerify: SysSettings.allowBindAccountNoVerify,
      enableTwoFactorAuthentication: SysSettings.enableTwoFactorAuthentication,
      passwordRegex: SysSettings.passwordRegex,
      passwordRegexTip: SysSettings.passwordRegexTip,
      firstLoginResetPassword: SysSettings.firstLoginResetPassword,
      passwordOverdueDays: SysSettings.passwordOverdueDays,
      passwordOverdueDaysVisible: !!SysSettings.passwordOverdueDays
    };
  }

  handleChangeCheckboxValue = () => {
    const {
      onlyAdminCreateApp,
      hideDownloadApp,
      hideHelpTip,
      forbidSuites,
      downloadAppRedirectUrl,
      hideRegister,
      hideTemplateLibrary,
      allowBindAccountNoVerify,
      enableTwoFactorAuthentication,
      passwordRegex,
      passwordRegexTip,
      firstLoginResetPassword,
      passwordOverdueDays
    } = this.state;
    privateSysSetting.editSysSettings({
      settings: {
        downloadAppRedirectUrl,
        onlyAdminCreateApp,
        hideHelpTip,
        hideDownloadApp,
        forbidSuites: forbidSuites.join('|'),
        hideRegister,
        hideTemplateLibrary,
        allowBindAccountNoVerify,
        enableTwoFactorAuthentication,
        passwordRegex,
        passwordRegexTip,
        firstLoginResetPassword,
        passwordOverdueDays
      }
    }).then(result => {
      if (result) {
        alert(_l('修改成功'), 1);
        md.global.SysSettings.downloadAppRedirectUrl = downloadAppRedirectUrl;
        md.global.SysSettings.onlyAdminCreateApp = onlyAdminCreateApp;
        md.global.SysSettings.hideHelpTip = hideHelpTip;
        md.global.SysSettings.hideDownloadApp = hideDownloadApp;
        md.global.SysSettings.forbidSuites = forbidSuites.join('|');
        md.global.SysSettings.hideRegister = hideRegister;
        md.global.SysSettings.hideTemplateLibrary = hideTemplateLibrary;
        md.global.SysSettings.allowBindAccountNoVerify = allowBindAccountNoVerify;
        md.global.SysSettings.enableTwoFactorAuthentication = enableTwoFactorAuthentication;
        md.global.SysSettings.passwordRegex = passwordRegex;
        md.global.SysSettings.passwordRegexTip = passwordRegexTip;
        md.global.SysSettings.firstLoginResetPassword = firstLoginResetPassword;
        md.global.SysSettings.passwordOverdueDays = passwordOverdueDays;
      }
    });
  }

  handleChangeEnableTwoFactorAuthentication = () => {
    const { enableTwoFactorAuthentication } = this.state;
    if (!enableTwoFactorAuthentication) {
      Dialog.confirm({
        buttonType: 'danger',
        okText: _l('开启'),
        title: (
          <span className="Red Bold">{_l('是否开启两步验证 ?')}</span>
        ),
        description: (
          <div>
            {_l('开启后，除了基于账号密码的登录认证，还需要通过手机号或邮箱接收验证码进行二次认证，所以请确保组织成员的手机号、邮箱的合法性，同时确保系统内的短信服务、邮件服务已正常启用。')}
          </div>
        ),
        onOk: () => {
          this.setState({ enableTwoFactorAuthentication: !enableTwoFactorAuthentication }, this.handleChangeCheckboxValue);
        },
      });
    } else {
      this.setState({ enableTwoFactorAuthentication: !enableTwoFactorAuthentication }, this.handleChangeCheckboxValue);
    }
  }

  handleChangeForbidSuites = value => {
    const { forbidSuites } = this.state;
    const isExist = forbidSuites.filter(item => item === value).length;
    this.setState({
      forbidSuites: isExist ? forbidSuites.filter(item => item !== value) : forbidSuites.concat(value).sort((a, b) => a - b),
    }, this.handleChangeCheckboxValue);
  }

  handleSave = () => {
    this.setState({
      appDialogVisible: false,
      passwordDialogVisible: false,
      firstLoginResetPasswordDialogVisible: false
    });
    this.handleChangeCheckboxValue();
  }

  renderDialog() {
    const {
      appDialogVisible,
      passwordDialogVisible,
      firstLoginResetPasswordDialogVisible,
      downloadAppRedirectUrl,
      passwordRegex,
      passwordRegexTip,
      firstLoginResetPassword,
      passwordOverdueDays,
      passwordOverdueDaysVisible
    } = this.state;
    return (
      <Fragment>
        <Dialog
          visible={appDialogVisible}
          title={_l('App 下载地址')}
          okText={_l('保存')}
          onOk={this.handleSave}
          onCancel={() => this.setState({ appDialogVisible: false })}
        >
          <Input className="w100" value={downloadAppRedirectUrl} onChange={value => { this.setState({ downloadAppRedirectUrl: value }) }} placeholder={_l('请输入')}/>
        </Dialog>
        <Dialog
          visible={passwordDialogVisible}
          title={_l('密码规则设置')}
          okText={_l('保存')}
          onOk={() => {
            if (_.isEmpty(passwordRegex)) {
              alert(_l('密码规则不能为空'), 3);
              return
            }
            if (_.isEmpty(passwordRegexTip)) {
              alert(_l('密码规则提示说明不能为空'), 3);
              return
            }
            this.handleSave();
          }}
          onCancel={() => this.setState({ passwordDialogVisible: false })}
        >
          <div className="mTop5 mBottom20">
            <div className="mBottom5">{_l('密码规则（正则表达式）')}</div>
            <Input className="w100" value={passwordRegex} onChange={value => { this.setState({ passwordRegex: value }) }} placeholder={_l('请输入密码正则表达式')}/>
          </div>
          <div>
            <div className="mBottom5">{_l('提示说明')}</div>
            <Input className="w100" value={passwordRegexTip} onChange={value => { this.setState({ passwordRegexTip: value }) }} placeholder={_l('请输入密码正则表达式说明文字')}/>
          </div>
        </Dialog>
        <Dialog
          visible={firstLoginResetPasswordDialogVisible}
          title={_l('密码有效期设置')}
          okText={_l('保存')}
          onOk={() => {
            const { passwordOverdueDaysVisible } = this.state;
            if (passwordOverdueDaysVisible) {
              this.handleSave();
            } else {
              this.setState({
                passwordOverdueDays: 0
              }, this.handleSave);
            }
          }}
          onCancel={() => this.setState({ firstLoginResetPasswordDialogVisible: false })}
        >
          <Checkbox
            className="mRight60 Gray Font13"
            checked={firstLoginResetPassword}
            onClick={() => {
              this.setState({ firstLoginResetPassword: !firstLoginResetPassword });
            }}>
              {_l('首次登录需修改密码')}
          </Checkbox>
          <div className="Gray_bd mLeft25 mTop5 mBottom20">{_l('此设置仅对自主创建或导入的账号生效')}</div>
          <Checkbox
            className="mRight60 Gray Font13"
            checked={passwordOverdueDaysVisible}
            onClick={() => {
              this.setState({
                passwordOverdueDaysVisible: !passwordOverdueDaysVisible
              });
            }}>
              {_l('设置密码过期天数')}
          </Checkbox>
          {
            passwordOverdueDaysVisible && (
              <div className="mLeft25 mTop5">
                <div className="flexRow valignWrapper">
                  <Input
                    valueFilter={formatNumberFromInput}
                    className="mRight10"
                    style={{ width: 100 }}
                    value={passwordOverdueDays}
                    onChange={value => { this.setState({ passwordOverdueDays: Number(value.replace(/[^\w]/ig,'')) }) }}
                    placeholder={_l('请输入')}
                  />
                  {_l('天')}
                </div>
                <div className="Gray_bd mTop5">{_l('密码过期后，用户需设置新密码才能使用系统')}</div>
              </div>
            )
          }
        </Dialog>
      </Fragment>
    );
  }

  render() {
    const { onClose } = this.props;
    const {
      onlyAdminCreateApp,
      hideDownloadApp,
      forbidSuites,
      downloadAppRedirectUrl,
      hideHelpTip,
      hideRegister,
      hideTemplateLibrary,
      allowBindAccountNoVerify,
      enableTwoFactorAuthentication,
      firstLoginResetPassword
    } = this.state;

    return (
      <div className="privateDeploymentWrapper card mAll15 pAll20 flexColumn">
        <div className="Font17 mBottom20">
          <Icon icon="backspace" className="Gray_9e pointer mRight10 Font20" onClick={onClose} />
          {_l('自定义功能设置')}
        </div>
        <div className="customConfigItme flexRow">
          <div className="name Gray_75 Font13">{_l('应用')}</div>
          <div className="mRight40">
            <Checkbox
              className="Gray Font13"
              checked={onlyAdminCreateApp}
              onClick={value => { this.setState({ onlyAdminCreateApp: !value }, this.handleChangeCheckboxValue) }}
            >
              {_l('隐藏非管理员添加应用入口')}
            </Checkbox>
          </div>
          <div>
            <Checkbox
              className="Gray Font13"
              checked={hideTemplateLibrary}
              onClick={value => { this.setState({ hideTemplateLibrary: !value }, this.handleChangeCheckboxValue) }}
            >
              {_l('隐藏应用库')}
            </Checkbox>
          </div>
        </div>
        <div className="customConfigItme flexRow">
          <div className="name Gray_75 Font13">{_l('协作套件')}</div>
          <div className="flex flexRow">
            <Checkbox className="mRight60 Gray Font13" checked={forbidSuites.includes('1')} onClick={() => { this.handleChangeForbidSuites('1') }}>{_l('隐藏动态')}</Checkbox>
            <Checkbox className="mRight60 Gray Font13" checked={forbidSuites.includes('2')} onClick={() => { this.handleChangeForbidSuites('2') }}>{_l('隐藏任务')}</Checkbox>
            <Checkbox className="mRight60 Gray Font13" checked={forbidSuites.includes('3')} onClick={() => { this.handleChangeForbidSuites('3') }}>{_l('隐藏日程')}</Checkbox>
            <Checkbox className="mRight60 Gray Font13" checked={forbidSuites.includes('4')} onClick={() => { this.handleChangeForbidSuites('4') }}>{_l('隐藏文件')}</Checkbox>
          </div>
        </div>
        <div className="customConfigItme flexRow">
          <div className="name Gray_75 Font13">{_l('安全')}</div>
          <div className="flex flexRow">
            <Checkbox
              className="mRight60 Gray Font13"
              checked={enableTwoFactorAuthentication}
              onClick={this.handleChangeEnableTwoFactorAuthentication}>
                {_l('两步验证')}
            </Checkbox>
            <div
              className="pointer mRight40"
              style={{ color: '#2196F3' }}
              onClick={() => {
                this.setState({ firstLoginResetPasswordDialogVisible: true });
              }}>
                {_l('密码有效期设置')}
            </div>
            <div
              className="pointer"
              style={{ color: '#2196F3' }}
              onClick={() => {
                this.setState({
                  passwordDialogVisible: true
                });
              }}
            >
              {_l('密码规则设置')}
            </div>
          </div>
        </div>
        <div className="customConfigItme flexRow">
          <div className="name Gray_75 Font13">{_l('其他')}</div>
          <div className="mRight40">
            <Checkbox
              className="Gray Font13"
              checked={hideDownloadApp}
              onClick={value => { this.setState({ hideDownloadApp: !value }, this.handleChangeCheckboxValue) }}
            >
              {_l('隐藏 App 下载入口')}
            </Checkbox>
            <div className={cx('mTop10 mLeft25', { disable: hideDownloadApp })}>
              <span className="Gray_75">{downloadAppRedirectUrl ? _l('已设置') : _l('定制版 App 用户下载地址设置')}</span>
              <span className="pointer mLeft10 setting" onClick={() => { !hideDownloadApp && this.setState({ appDialogVisible: true }) }}>
                {downloadAppRedirectUrl ? _l('修改') : _l('设置')}
              </span>
            </div>
          </div>
          <div className="flexRow mRight60">
            <Checkbox
              className="Gray Font13"
              checked={hideHelpTip}
              onClick={value => { this.setState({ hideHelpTip: !value }, this.handleChangeCheckboxValue) }}
            >
              {_l('隐藏帮助提示')}
            </Checkbox>
            <span className="mLeft10 tip-top pointer" data-tip={_l('隐藏后，系统内跳转到帮助中心的『帮助提示』都会被隐藏')}>
              <Icon icon="sidebar_help" className="Font15 Gray_9e" />
            </span>
          </div>
          <div className="flexRow mRight60">
            <Checkbox
              className="Gray Font13"
              checked={hideRegister}
              onClick={value => { this.setState({ hideRegister: !value }, this.handleChangeCheckboxValue) }}
            >
              {_l('隐藏注册入口')}
            </Checkbox>
          </div>
          <div className="flexRow mRight60">
            <Checkbox
              className="Gray Font13"
              checked={allowBindAccountNoVerify}
              onClick={value => { this.setState({ allowBindAccountNoVerify: !value }, this.handleChangeCheckboxValue) }}
            >
              {_l('关闭邮箱和手机号验证')}
            </Checkbox>
            <span className="mLeft10 tip-top pointer" data-tip={_l('关闭后，绑定手机或邮箱则不需要合法性验证')}>
              <Icon icon="sidebar_help" className="Font15 Gray_9e" />
            </span>
          </div>
        </div>
        {this.renderDialog()}
      </div>
    );
  }
}
