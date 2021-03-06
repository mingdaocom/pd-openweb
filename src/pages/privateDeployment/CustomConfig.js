import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Checkbox, Dialog, Input, Radio } from 'ming-ui';
import Trigger from 'rc-trigger';
import DeclareDialog from './DeclareDialog';
import privateSysSetting from 'src/api/privateSysSetting';
import privateDeclare from 'src/api/privateDeclare';
import { formatNumberFromInput } from 'src/util';

export default class CustomConfig extends Component {
  constructor(props) {
    super(props);
    const { SysSettings } = md.global;
    this.state = {
      appDialogVisible: false,
      passwordDialogVisible: false,
      firstLoginResetPasswordDialogVisible: false,
      enableDeclareDialogVisible: false,
      twoFactorAuthenticationPriorityTypeDialogVisible: false,
      declareData: {},
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
      passwordOverdueDaysVisible: !!SysSettings.passwordOverdueDays,
      enableDeclareConfirm: SysSettings.enableDeclareConfirm,
      twoFactorAuthenticationPriorityType: SysSettings.twoFactorAuthenticationPriorityType
    };
  }

  componentDidMount() {
    privateDeclare.getDeclare().then(data => {
      if (data) {
        this.setState({
          declareData: data
        });
      }
    });
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
      passwordOverdueDays,
      enableDeclareConfirm,
      twoFactorAuthenticationPriorityType
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
        passwordOverdueDays,
        enableDeclareConfirm,
        twoFactorAuthenticationPriorityType
      }
    }).then(result => {
      if (result) {
        alert(_l('????????????'), 1);
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
        md.global.SysSettings.enableDeclareConfirm = enableDeclareConfirm;
        md.global.SysSettings.twoFactorAuthenticationPriorityType = twoFactorAuthenticationPriorityType;
      }
    });
  }

  handleChangeEnableTwoFactorAuthentication = () => {
    const { enableTwoFactorAuthentication, twoFactorAuthenticationPriorityType } = this.state;
    if (!enableTwoFactorAuthentication) {
      Dialog.confirm({
        buttonType: 'danger',
        okText: _l('??????'),
        title: (
          <span className="Red Bold">{_l('???????????????????????? ?')}</span>
        ),
        description: (
          <div>
            {_l('???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????')}
          </div>
        ),
        onOk: () => {
          this.setState({
            enableTwoFactorAuthentication: !enableTwoFactorAuthentication,
            twoFactorAuthenticationPriorityType: twoFactorAuthenticationPriorityType || 1
          }, this.handleChangeCheckboxValue);
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
      firstLoginResetPasswordDialogVisible: false,
      twoFactorAuthenticationPriorityTypeDialogVisible: false
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
      passwordOverdueDaysVisible,
      enableDeclareDialogVisible,
      enableDeclareEdit,
      declareData,
      twoFactorAuthenticationPriorityTypeDialogVisible,
      twoFactorAuthenticationPriorityType
    } = this.state;
    return (
      <Fragment>
        <Dialog
          visible={appDialogVisible}
          title={_l('App ????????????')}
          okText={_l('??????')}
          onOk={this.handleSave}
          onCancel={() => this.setState({ appDialogVisible: false })}
        >
          <Input className="w100" value={downloadAppRedirectUrl} onChange={value => { this.setState({ downloadAppRedirectUrl: value }) }} placeholder={_l('?????????')}/>
        </Dialog>
        <Dialog
          visible={passwordDialogVisible}
          title={_l('??????????????????')}
          okText={_l('??????')}
          onOk={() => {
            if (_.isEmpty(passwordRegex)) {
              alert(_l('????????????????????????'), 3);
              return
            }
            if (_.isEmpty(passwordRegexTip)) {
              alert(_l('????????????????????????????????????'), 3);
              return
            }
            this.handleSave();
          }}
          onCancel={() => this.setState({ passwordDialogVisible: false })}
        >
          <div className="mTop5 mBottom20">
            <div className="mBottom5">{_l('?????????????????????????????????')}</div>
            <Input className="w100" value={passwordRegex} onChange={value => { this.setState({ passwordRegex: value }) }} placeholder={_l('??????????????????????????????')}/>
          </div>
          <div>
            <div className="mBottom5">{_l('????????????')}</div>
            <Input className="w100" value={passwordRegexTip} onChange={value => { this.setState({ passwordRegexTip: value }) }} placeholder={_l('??????????????????????????????????????????')}/>
          </div>
        </Dialog>
        <Dialog
          visible={twoFactorAuthenticationPriorityTypeDialogVisible}
          title={_l('?????????????????????')}
          okText={_l('??????')}
          onOk={this.handleSave}
          onCancel={() => this.setState({ twoFactorAuthenticationPriorityTypeDialogVisible: false })}
        >
          <div className="Gray_75">{_l('???????????????????????????????????????????????????')}</div>
          <div className="valignWrapper mTop20">
            <Radio
              text={_l('?????????')}
              checked={twoFactorAuthenticationPriorityType === 1}
              onClick={() => {
                this.setState({ twoFactorAuthenticationPriorityType: 1 });
              }}
            />
            <Radio
              text={_l('??????')}
              checked={twoFactorAuthenticationPriorityType === 2}
              onClick={() => {
                this.setState({ twoFactorAuthenticationPriorityType: 2 });
              }}
            />
          </div>
        </Dialog>
        <Dialog
          visible={firstLoginResetPasswordDialogVisible}
          title={_l('?????????????????????')}
          okText={_l('??????')}
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
              {_l('???????????????????????????')}
          </Checkbox>
          <div className="Gray_bd mLeft25 mTop5 mBottom20">{_l('???????????????????????????????????????????????????')}</div>
          <Checkbox
            className="mRight60 Gray Font13"
            checked={passwordOverdueDaysVisible}
            onClick={() => {
              this.setState({
                passwordOverdueDaysVisible: !passwordOverdueDaysVisible
              });
            }}>
              {_l('????????????????????????')}
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
                    placeholder={_l('?????????')}
                  />
                  {_l('???')}
                </div>
                <div className="Gray_bd mTop5">{_l('????????????????????????????????????????????????????????????')}</div>
              </div>
            )
          }
        </Dialog>
        <DeclareDialog
          visible={enableDeclareDialogVisible}
          declareData={declareData}
          onChangeDeclareData={(data) => {
            this.setState({
              declareData: {
                ...declareData,
                ...data,
              }
            });
          }}
          onCancel={() => {
            this.setState({
              enableDeclareDialogVisible: false
            });
          }}
        />
      </Fragment>
    );
  }

  render() {
    const { onClose } = this.props;
    const {
      declareData,
      onlyAdminCreateApp,
      hideDownloadApp,
      forbidSuites,
      downloadAppRedirectUrl,
      hideHelpTip,
      hideRegister,
      hideTemplateLibrary,
      allowBindAccountNoVerify,
      enableTwoFactorAuthentication,
      firstLoginResetPassword,
      enableDeclareConfirm,
      twoFactorAuthenticationPriorityType
    } = this.state;

    return (
      <div className="privateDeploymentWrapper card mAll15 pAll20 flexColumn">
        <div className="Font17 mBottom20">
          <Icon icon="backspace" className="Gray_9e pointer mRight10 Font20" onClick={onClose} />
          {_l('?????????????????????')}
        </div>
        <div className="customConfigItme flexRow">
          <div className="name Gray_75 Font13">{_l('??????')}</div>
          <div className="mRight40">
            <Checkbox
              className="Gray Font13"
              checked={onlyAdminCreateApp}
              onClick={value => { this.setState({ onlyAdminCreateApp: !value }, this.handleChangeCheckboxValue) }}
            >
              {_l('????????????????????????????????????')}
            </Checkbox>
          </div>
          <div>
            <Checkbox
              className="Gray Font13"
              checked={hideTemplateLibrary}
              onClick={value => { this.setState({ hideTemplateLibrary: !value }, this.handleChangeCheckboxValue) }}
            >
              {_l('???????????????')}
            </Checkbox>
          </div>
        </div>
        <div className="customConfigItme flexRow">
          <div className="name Gray_75 Font13">{_l('????????????')}</div>
          <div className="flex flexRow">
            <Checkbox className="mRight60 Gray Font13" checked={forbidSuites.includes('1')} onClick={() => { this.handleChangeForbidSuites('1') }}>{_l('????????????')}</Checkbox>
            <Checkbox className="mRight60 Gray Font13" checked={forbidSuites.includes('2')} onClick={() => { this.handleChangeForbidSuites('2') }}>{_l('????????????')}</Checkbox>
            <Checkbox className="mRight60 Gray Font13" checked={forbidSuites.includes('3')} onClick={() => { this.handleChangeForbidSuites('3') }}>{_l('????????????')}</Checkbox>
            <Checkbox className="mRight60 Gray Font13" checked={forbidSuites.includes('4')} onClick={() => { this.handleChangeForbidSuites('4') }}>{_l('????????????')}</Checkbox>
          </div>
        </div>
        <div className="customConfigItme flexRow">
          <div className="name Gray_75 Font13">{_l('??????')}</div>
          <div className="flex flexRow">
            <Checkbox
              className="mRight5 Gray Font13"
              checked={enableTwoFactorAuthentication}
              onClick={this.handleChangeEnableTwoFactorAuthentication}>
                {_l('????????????')}
            </Checkbox>
            {twoFactorAuthenticationPriorityType && (
              <div
                className="pointer mRight40"
                style={{ color: '#2196F3' }}
                onClick={() => {
                  this.setState({ twoFactorAuthenticationPriorityTypeDialogVisible: true });
                }}>
                  {_l('?????????????????????')}
              </div>
            )}
            <div
              className="pointer mRight40"
              style={{ color: '#2196F3' }}
              onClick={() => {
                this.setState({ firstLoginResetPasswordDialogVisible: true });
              }}>
                {_l('?????????????????????')}
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
              {_l('??????????????????')}
            </div>
          </div>
        </div>
        <div className="customConfigItme flexRow">
          <div className="name Gray_75 Font13">{_l('??????')}</div>
          <div className="flexColumn">
            <div className="flexRow">
              <div className="mRight40">
                <Checkbox
                  className="Gray Font13"
                  checked={hideDownloadApp}
                  onClick={value => { this.setState({ hideDownloadApp: !value }, this.handleChangeCheckboxValue) }}
                >
                  {_l('?????? App ????????????')}
                </Checkbox>
                <div className={cx('mTop10 mLeft25', { disable: hideDownloadApp })}>
                  <span className="Gray_75">{downloadAppRedirectUrl ? _l('?????????') : _l('????????? App ????????????????????????')}</span>
                  <span className="pointer mLeft10 setting" onClick={() => { !hideDownloadApp && this.setState({ appDialogVisible: true }) }}>
                    {downloadAppRedirectUrl ? _l('??????') : _l('??????')}
                  </span>
                </div>
              </div>
              <div className="flexRow mRight60">
                <Checkbox
                  className="Gray Font13"
                  checked={hideHelpTip}
                  onClick={value => { this.setState({ hideHelpTip: !value }, this.handleChangeCheckboxValue) }}
                >
                  {_l('??????????????????')}
                </Checkbox>
                <span className="mLeft10 tip-top pointer" data-tip={_l('??????????????????????????????????????????????????????????????????????????????')}>
                  <Icon icon="sidebar_help" className="Font15 Gray_9e" />
                </span>
              </div>
              <div className="flexRow mRight60">
                <Checkbox
                  className="Gray Font13"
                  checked={hideRegister}
                  onClick={value => { this.setState({ hideRegister: !value }, this.handleChangeCheckboxValue) }}
                >
                  {_l('??????????????????')}
                </Checkbox>
              </div>
              <div className="flexRow mRight60">
                <Checkbox
                  className="Gray Font13"
                  checked={allowBindAccountNoVerify}
                  onClick={value => { this.setState({ allowBindAccountNoVerify: !value }, this.handleChangeCheckboxValue) }}
                >
                  {_l('??????????????????????????????')}
                </Checkbox>
                <span className="mLeft10 tip-top pointer" data-tip={_l('????????????????????????????????????????????????????????????')}>
                  <Icon icon="sidebar_help" className="Font15 Gray_9e" />
                </span>
              </div>
            </div>
            <div className="flexColumn mTop20">
              <div className="flexRow mRight60">
                <Checkbox
                  className="Gray Font13"
                  checked={enableDeclareConfirm}
                  onClick={value => {
                    this.setState({ enableDeclareConfirm: !value }, this.handleChangeCheckboxValue);
                    if (!value && !declareData.declareId) {
                      this.setState({ enableDeclareDialogVisible: true });
                    }
                  }}
                >
                  {_l('????????? web ??????????????????????????????')}
                </Checkbox>
                <span className="mLeft10 tip-top pointer" data-tip={_l('?????????????????? web ?????????????????????????????????????????????????????????????????????????????????')}>
                  <Icon icon="sidebar_help" className="Font15 Gray_9e" />
                </span>
              </div>
              {declareData.declareId && (
                <div
                  className="pointer mTop10 mLeft25"
                  style={{ color: '#2196F3' }}
                  onClick={() => {
                    this.setState({ enableDeclareDialogVisible: true });
                  }}
                >
                  {_l('???????????????????????????')}
                </div>
              )}
            </div>
          </div>
        </div>
        {this.renderDialog()}
      </div>
    );
  }
}
