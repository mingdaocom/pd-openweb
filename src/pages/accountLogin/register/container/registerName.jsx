import React from 'react';
import 'src/pages/accountLogin/components/message.less';
import cx from 'classnames';
import RegisterController from 'src/api/register';
import { AccountNextActions } from 'src/pages/accountLogin/config.js';
import { getRequest } from 'src/util';
import { setWarnningData, warnningTipFn, registerSuc } from 'src/pages/accountLogin/util.js';
import fixedDataAjax from 'src/api/fixedData.js';
import _ from 'lodash';
import RegExpValidator from 'src/util/expression';
import styled from 'styled-components';

let request = getRequest();
const Wrap = styled.div`
  min-height: 460px;
`;
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

      const { registerData = {}, nextAction, setStep = () => {} } = this.props;
      let { isLink, loginForAdd, fullName = '', email = '', emailOrTel = '' } = registerData;
      email = emailOrTel && RegExpValidator.isEmail(emailOrTel) ? emailOrTel : email;

      if (location.href.indexOf('join') >= 0 && nextAction == AccountNextActions.userCardInfo && !loginForAdd) {
        this.props.setData({
          email: email,
        });
        setStep('editInfo');
      } else {
        this.setState({ createAccountLoading: true });

        RegisterController.setAccountInfo({
          fullname: fullName,
          email: email,
        }).then(data => {
          if (data) {
            if (isLink) {
              if (nextAction == AccountNextActions.createProject) {
                setStep('create');
              } else if (nextAction == AccountNextActions.userCardInfo) {
                setStep('editInfo');
              } else if (nextAction == AccountNextActions.login) {
                registerSuc(this.props.registerData);
              } else {
                callback && callback();
              }
            } else {
              if ((request.ReturnUrl || '').indexOf('type=privatekey') > -1) {
                registerSuc(this.props.registerData);
              } else {
                callback && callback();
              }
            }
          } else {
            this.setState({ createAccountLoading: false });
            alert(_l('操作失败'), 3);
          }
        });
      }
    });
  };

  inputOnFocus = e => {
    this.setState({ focusDiv: e });
  };

  inputOnBlur = e => {
    this.setState({ focusDiv: '' });
  };

  // 企业网络基本信息 字段验证
  validateCompanyInfoRequiredField = async () => {
    this.setState({ warnningText: '', tipDom: null });

    const { registerData } = this.props;
    const { fullName, email, emailOrTel } = registerData;
    // 企业网络名称
    let isRight = true;
    let warnningData = [];

    if (!fullName.trim()) {
      warnningData.push({ tipDom: '.fullName', warnningText: _l('请填写姓名') });
      isRight = false;
    } else {
      await fixedDataAjax.checkSensitive({ content: fullName }).then(res => {
        if (res) {
          warnningData.push({ tipDom: '.fullName', warnningText: _l('输入内容包含敏感词，请重新填写') });
          isRight = false;
        }
      });
    }

    if (!(emailOrTel && RegExpValidator.isEmail(emailOrTel))) {
      // // 邮箱
      // if (!email) {
      //   warnningData.push({ tipDom: '.email', warnningText: _l('请填写邮箱') });
      //   isRight = false;
      // }

      if (!RegExpValidator.isEmail(email) && !!email) {
        warnningData.push({ tipDom: '.email', warnningText: _l('邮箱格式错误') });
        isRight = false;
      }
    }

    this.setState({ warnningData });

    if (warnningData.length > 0) {
      $(warnningData[0].tipDom).focus();
    }

    return isRight;
  };

  render() {
    const { registerData = {}, setData = () => {}, setStep = () => {} } = this.props;
    const { warnningData = [], focusDiv, createAccountLoading } = this.state;
    let { fullName = '', onlyReadName, email, emailOrTel } = registerData;
    email = emailOrTel && RegExpValidator.isEmail(emailOrTel) ? emailOrTel : email;

    return (
      <Wrap>
        {createAccountLoading && <div className="loadingLine"></div>}
        <div className="title mTop40 Font20 Gray Bold">{_l('完善个人信息')}</div>
        <p className="Gray_75 Font14 mTop16">{_l('请填写真实信息，方便大家与您联系')}</p>
        <div className="messageBox mTop5">
          <div
            className={cx('mesDiv', {
              ...setWarnningData(warnningData, ['.fullName'], focusDiv, fullName),
            })}
          >
            <input
              type="text"
              maxLength={'60'}
              autoComplete="off"
              className={cx('fullName', { onlyRead: !!onlyReadName })}
              disabled={onlyReadName ? 'disabled' : ''}
              ref={fullName => (this.fullName = fullName)}
              onBlur={() => {
                setData({ fullName: fullName.trim() });
                this.inputOnBlur();
              }}
              onFocus={() => this.inputOnFocus('.fullName')}
              onChange={e => {
                setData({ fullName: e.target.value });
              }}
              value={fullName}
            />
            <div className="title" onClick={e => this.inputOnFocus('.fullName')}>
              {_l('姓名')}
            </div>
            {warnningTipFn(warnningData, ['.fullName'], focusDiv)}
          </div>

          {!(emailOrTel && RegExpValidator.isEmail(emailOrTel)) && (
            <div
              className={cx('mesDiv', {
                ...setWarnningData(warnningData, ['.email'], focusDiv, email),
              })}
            >
              <input
                type="text"
                className={cx('email', { onlyRead: emailOrTel && RegExpValidator.isEmail(emailOrTel) })}
                maxLength={'60'}
                autoComplete="off"
                ref={email => (this.email = email)}
                readOnly={emailOrTel && RegExpValidator.isEmail(emailOrTel)}
                onBlur={this.inputOnBlur}
                onFocus={() => this.inputOnFocus('.email')}
                onChange={e => {
                  this.setState({ warnningData: _.filter(warnningData, it => it.tipDom !== '.email') });
                  setData({ email: e.target.value });
                }}
                value={email}
              />
              <div className="title" onClick={e => this.inputOnFocus('.email')}>
                {_l('邮箱(选填)')}
              </div>
              {warnningTipFn(warnningData, ['.email'], focusDiv)}
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
              setStep('createOrAdd');
            });
          }}
        >
          {createAccountLoading ? _l('提交中...') : _l('下一步')}
        </span>
      </Wrap>
    );
  }
}
