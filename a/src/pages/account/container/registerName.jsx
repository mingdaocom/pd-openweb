import React from 'react';
import '../components/message.less';
import cx from 'classnames';
import RegisterController from 'src/api/register';
import Config from '../config';
import { getRequest } from 'src/util';
let request = getRequest();
import { inputFocusFn, inputBlurFn, setWarnningData } from '../util';
import fixedDataAjax from 'src/api/fixedData.js';
import _ from 'lodash';

export default class RegisterName extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createAccountLoading: false,
      warnningText: '',
      warnningData: [],
      focusDiv: '',
    };
  }

  componentDidMount() {
    this.fullName && $(this.fullName).focus();
  }

  doSetAccountInfo = callback => {
    this.validateCompanyInfoRequiredField().then(res => {
      if (!res) {
        return;
      }
      const { registerData = {}, defaultAccountVerifyNextAction, loginSuc, changeStep, onChangeData } = this.props;
      let {
        isLink,
        loginForAdd,
        fullName = '',
        email = '',
        encrypeAccount = '',
        encrypePassword = '',
        emailOrTel = '',
      } = registerData;
      email = emailOrTel && RegExp.isEmail(emailOrTel) ? emailOrTel : email;
      if (
        location.href.indexOf('join') >= 0 &&
        defaultAccountVerifyNextAction == Config.ExistAccountNextActions.userCardInfo &&
        !loginForAdd
      ) {
        onChangeData({
          ...registerData,
          email: email,
        });
        changeStep('editInfo');
      } else {
        this.setState({
          createAccountLoading: true,
        });
        RegisterController.setAccountInfo({
          fullname: fullName,
          email: email,
        }).then(
          data => {
            if (data) {
              if (isLink) {
                if (defaultAccountVerifyNextAction == Config.AccountVerifyNextActions.createProject) {
                  changeStep('create');
                } else if (defaultAccountVerifyNextAction == Config.AccountVerifyNextActions.userCardInfo) {
                  changeStep('editInfo');
                } else if (defaultAccountVerifyNextAction == Config.ExistAccountNextActions.login) {
                  loginSuc(encrypeAccount, encrypePassword);
                } else {
                  if (callback) {
                    callback();
                  }
                }
              } else {
                if ((request.ReturnUrl || '').indexOf('type=privatekey') > -1) {
                  loginSuc(encrypeAccount, encrypePassword);
                } else {
                  if (callback) {
                    callback();
                  }
                }
              }
            } else {
              this.setState({
                createAccountLoading: false,
              });
              alert(_l('操作失败'), 3);
            }
          },
          () => {},
        );
      }
    });
  };

  inputOnFocus = e => {
    inputFocusFn(e, () => {
      this.setState({
        focusDiv: e.target,
      });
    });
  };

  inputOnBlur = e => {
    inputBlurFn(e, () => {
      this.setState({
        focusDiv: '',
      });
    });
  };

  // 企业网络基本信息 字段验证
  validateCompanyInfoRequiredField = async () => {
    this.setState({
      warnningText: '',
      tipDom: null,
    });
    const { registerData } = this.props;
    const { fullName, email, emailOrTel } = registerData;
    // 企业网络名称
    let isRight = true;
    let warnningData = [];
    if (!fullName) {
      warnningData.push({ tipDom: this.fullName, warnningText: _l('请填写姓名') });
      isRight = false;
    } else {
      await fixedDataAjax.checkSensitive({ content: fullName }).then(res => {
        if (res) {
          warnningData.push({ tipDom: this.fullName, warnningText: _l('输入内容包含敏感词，请重新填写') });
          isRight = false;
        }
      });
    }
    if (!(emailOrTel && RegExp.isEmail(emailOrTel))) {
      // 邮箱
      if (!email) {
        warnningData.push({ tipDom: this.email, warnningText: _l('请填写邮箱') });
        isRight = false;
      }
      if (!RegExp.isEmail(email)) {
        warnningData.push({ tipDom: this.email, warnningText: _l('邮箱格式错误') });
        isRight = false;
      }
    }
    this.setState({
      warnningData,
    });
    if (warnningData.length > 0) {
      $(warnningData[0].tipDom).focus();
    }
    return isRight;
  };

  render() {
    const { changeStep, step, registerData = {}, onChangeData } = this.props;
    const { warnningData = [], focusDiv } = this.state;
    let { fullName = '', onlyReadName, company = {}, email, emailOrTel } = registerData;
    email = emailOrTel && RegExp.isEmail(emailOrTel) ? emailOrTel : email;
    const { createAccountLoading, warnningText } = this.state;
    return (
      <React.Fragment>
        {createAccountLoading && <div className="loadingLine"></div>}
        <div className="title mTop40 Font20 Gray">{_l('请填写姓名和邮箱')}</div>
        <p className="Gray_75 Font15 mTop16">{_l('请填写真实姓名和邮箱，方便大家与您联系')}</p>
        <div className="messageBox mTop5">
          <div
            className={cx('mesDiv', {
              ...setWarnningData(warnningData, [this.fullName, '.fullName'], focusDiv, fullName),
            })}
          >
            <input
              type="text"
              maxLength={'60'}
              autoComplete="off"
              className={cx('fullName', { onlyRead: !!onlyReadName })}
              disabled={onlyReadName ? 'disabled' : ''}
              ref={fullName => (this.fullName = fullName)}
              onBlur={e => {
                this.inputOnBlur(e);
              }}
              onFocus={this.inputOnFocus}
              onChange={e => {
                onChangeData({
                  ...registerData,
                  fullName: e.target.value,
                });
              }}
              value={fullName}
            />
            <div
              className="title"
              onClick={e => {
                $(this.fullName).focus();
              }}
            >
              {_l('姓名')}
            </div>
            {_.find(warnningData, it => it.tipDom === this.fullName || it.tipDom === '.fullName') && (
              <div
                className={cx('warnningTip', {
                  Hidden:
                    (!!warnningData[0] && !_.includes([this.fullName, '.fullName'], warnningData[0].tipDom)) ||
                    warnningData[0].tipDom !== focusDiv,
                })}
              >
                {_.find(warnningData, it => it.tipDom === this.fullName || it.tipDom === '.fullName').warnningText}
              </div>
            )}
          </div>
          <div
            className={cx('mesDiv', {
              ...setWarnningData(warnningData, [this.email, '.email'], focusDiv, email),
            })}
          >
            <input
              type="text"
              className={cx('email', { onlyRead: emailOrTel && RegExp.isEmail(emailOrTel) })}
              maxLength={'60'}
              autoComplete="off"
              ref={email => (this.email = email)}
              readOnly={emailOrTel && RegExp.isEmail(emailOrTel)}
              onBlur={this.inputOnBlur}
              onFocus={this.inputOnFocus}
              onChange={e => {
                this.setState({
                  warnningData: _.filter(warnningData, it => it.tipDom !== this.email),
                });
                onChangeData({
                  ...registerData,
                  email: e.target.value,
                });
              }}
              value={email}
            />
            <div
              className="title"
              onClick={e => {
                $(this.email).focus();
              }}
            >
              {_l('邮箱')}
            </div>
            {_.find(warnningData, it => it.tipDom === this.email || it.tipDom === '.email') && (
              <div
                className={cx('warnningTip', {
                  Hidden:
                    (!!warnningData[0] && !_.includes([this.email, '.email'], warnningData[0].tipDom)) ||
                    warnningData[0].tipDom !== focusDiv,
                })}
              >
                {_.find(warnningData, it => it.tipDom === this.email || it.tipDom === '.email').warnningText}
              </div>
            )}
          </div>
          <span
            className="btnForRegister Hand"
            onClick={() => {
              if (createAccountLoading) {
                return;
              }
              this.doSetAccountInfo(() => {
                changeStep('createOrAdd');
              });
            }}
          >
            {createAccountLoading ? _l('提交中...') : _l('下一步')}
          </span>
        </div>
      </React.Fragment>
    );
  }
}
