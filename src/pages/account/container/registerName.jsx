import React from 'react';
import '../components/message.less';
import cx from 'classnames';
import RegisterController from 'src/api/register';
import Config from '../config';
import { getRequest } from 'src/util';
let request = getRequest();
import { inputFocusFn, inputBlurFn } from '../util';

export default class RegisterName extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createAccountLoading: false,
      warnningText: '',
    };
  }

  setWarnningText = warnningText => {
    this.setState(
      {
        warnningText,
      },
      () => {
        $(this.fullName)
          .closest('.mesDiv')
          .addClass('errorDiv');
        $(this.fullName).focus();
      },
    );
  };

  doSetAccountInfo = callback => {
    const { registerData = {}, defaultAccountVerifyNextAction, loginSuc, changeStep } = this.props;
    const { isLink, loginForAdd, fullName = '', encrypeAccount = '', encrypePassword = '' } = registerData;
    if (
      location.href.indexOf('join') >= 0 &&
      defaultAccountVerifyNextAction == Config.ExistAccountNextActions.userCardInfo &&
      !loginForAdd
    ) {
      changeStep('editInfo');
    } else {
      this.setState({
        createAccountLoading: true,
      });
      RegisterController.setAccountInfo({
        fullname: fullName,
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
  };

  inputOnFocus = e => {
    inputFocusFn(e);
  };

  inputOnBlur = e => {
    inputBlurFn(e);
  };

  render() {
    const { changeStep, step, registerData = {}, setDataFn } = this.props;
    const { fullName = '', onlyReadName } = registerData;
    const { createAccountLoading, warnningText } = this.state;
    return (
      <React.Fragment>
        {createAccountLoading && <div className="loadingLine"></div>}
        <div className="title mTop40 Font20 Gray">{_l('请填写姓名')}</div>
        <p className="Gray_75 Font15 mTop16">{_l('请填写真实姓名，方便大家与您联系')}</p>
        <div className="messageBox mTop5">
          <div className={cx('mesDiv', { current: !!fullName })}>
            <input
              type="text"
              maxLength={'60'}
              autoComplete="off"
              className={cx('fullName', { onlyRead: !!onlyReadName })}
              disabled={onlyReadName ? 'disabled' : ''}
              ref={fullName => (this.fullName = fullName)}
              onBlur={this.inputOnBlur}
              onFocus={this.inputOnFocus}
              onChange={e => {
                setDataFn({
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
              }}>
              {_l('请填写真实姓名')}
            </div>
            {!!warnningText && <div className={cx('warnningTip Hidden')}>{warnningText}</div>}
          </div>
          <span
            className="btnForRegister Hand"
            onClick={() => {
              if (createAccountLoading) {
                return;
              }
              if (!fullName) {
                this.setWarnningText(_l('请填写真实姓名'));
                return;
              }
              this.doSetAccountInfo(() => {
                changeStep('createOrAdd');
              });
            }}>
            {createAccountLoading ? _l('提交中...') : _l('下一步')}
          </span>
        </div>
      </React.Fragment>
    );
  }
}
