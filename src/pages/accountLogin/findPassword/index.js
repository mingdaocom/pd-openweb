import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import ChangeLang from 'src/components/ChangeLang';
import MessageCon from 'src/pages/accountLogin/components/message';
import RegisterController from 'src/api/register';
import { ActionResult } from 'src/pages/accountLogin/config.js';
import { encrypt } from 'src/util';
import { getRequest } from 'src/util';
import { hasCaptcha, getAccountTypes, clickErrInput } from 'src/pages/accountLogin/util.js';
import { captcha } from 'ming-ui/functions';
import { LoadDiv } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import { Wrap } from 'src/pages/accountLogin/login/style.jsx';
import _ from 'lodash';
import { navigateTo } from 'src/router/navigateTo';

const keys = [getAccountTypes(true), 'code', 'setPassword'];
const mapStateToProps = ({ accountInfo, warnningData, stateList }) => ({
  loginData: accountInfo,
  loading: stateList.loading,
  warnningData,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions }, dispatch);
@connect(mapStateToProps, mapDispatchToProps)
export default class FindPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginDisabled: false,
    };
  }

  componentDidMount() {
    this.props.clearInfoByUrl();
    document.addEventListener('keypress', this.handleEnterKey);
    this.props.setLoading(false);
  }
  componentWillReceiveProps(nextProps) {
    if (
      _.get(nextProps, 'warnningData') !== _.get(this.props, 'warnningData') &&
      (_.get(nextProps, 'warnningData') || []).length > 0
    ) {
      clickErrInput(_.get(nextProps, 'warnningData'), _.get(nextProps, 'loginData.focusDiv'));
    }
  }
  componentWillUmount() {
    document.removeEventListener('keypress', this.handleEnterKey);
    this.props.reset();
  }
  handleEnterKey = e => {
    if (e.keyCode === 13 && !hasCaptcha()) {
      this.onBtn();
    }
  };
  submitAccountVerify = () => {
    const { loginData = {} } = this.props;
    const { emailOrTel, password, verifyCode, dialCode } = loginData;
    const _this = this;
    const cb = function (res) {
      if (res.ret !== 0) {
        _this.setState({
          loginDisabled: false,
        });
        return;
      }
      RegisterController.updatePassword({
        account: encrypt(dialCode + emailOrTel),
        password: encrypt(password),
        verifyCode: verifyCode,
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.global.getCaptchaType(),
      }).then(data => {
        window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
        if (data) {
          _this.setState({
            loginDisabled: false,
          });
          let actionResult = ActionResult;
          if (data.actionResult == actionResult.success) {
            alert(_l('密码重置成功！'), '1', 3000, () => {
              _this.props.updateWarn([]);
              navigateTo('/login');
            });
          } else {
            if (data.accountResult === actionResult.userInfoNotFound) {
              _this.props.updateWarn([
                {
                  tipDom: '#txtMobilePhone',
                  warnningText: _l('账号未注册'),
                },
              ]);
              return;
            }
            if (data.actionResult == actionResult.failInvalidVerifyCode) {
              _this.props.updateWarn([{ tipDom: '.txtLoginCode', warnningText: _l('验证码错误'), isError: true }]);
            } else if (data.actionResult == actionResult.noEfficacyVerifyCode) {
              let str = _l('验证码已经失效，请重新发送');
              _this.props.updateWarn([{ tipDom: '.txtLoginCode', warnningText: str, isError: true }]);
              alert(str, 3);
            } else if (data.actionResult == actionResult.userInfoNotFound) {
              _this.props.updateWarn([{ tipDom: '#txtMobilePhone', warnningText: _l('账号不存在') }]);
            } else if (data.actionResult == actionResult.samePassword) {
              return alert('新密码不可与旧密码一样', 3);
            } else if (data.actionResult === actionResult.accountFrequentLoginError) {
              //需要前端图形验证码
              captchaFuc();
            } else if (data.actionResult === actionResult.fieldRequired) {
              //前端图形验证码校验失败
              return alert('图形验证码校验失败', 3);
            } else {
              let msg = '';
              msg = _l('操作失败');
              alert(msg, 3);
            }
          }
        }
      });
    };
    const onCancel = isOk => {
      if (isOk) return;
      _this.setState({
        loginDisabled: false,
      });
    };
    const captchaFuc = () => {
      if (md.global.getCaptchaType() === 1) {
        new captcha(cb, onCancel);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), cb, { needFeedBack: false }).show();
      }
    };
    // 前3次关闭图像验证
    cb({ ret: 0 });
  };

  onBtn = async () => {
    if (this.state.loginDisabled) {
      return;
    }
    let isV = await this.props.isValid(false, keys);
    if (isV) {
      this.setState(
        {
          loginDisabled: true,
        },
        () => {
          this.submitAccountVerify();
        },
      );
    }
  };

  renderCon = () => {
    if (this.props.loading) {
      return <LoadDiv className="" style={{ margin: '50px auto' }} />;
    }
    const { loginDisabled } = this.state;
    return (
      <React.Fragment>
        <div className="titleHeader">
          <div className="title mTop40 Bold">{_l('重置密码')}</div>
        </div>
        <MessageCon type="findPassword" keys={keys} maxLength="6" />
        <React.Fragment>
          {loginDisabled && <div className="loadingLine"></div>}
          <span
            className="btnForLogin Hand"
            onClick={() => {
              this.onBtn();
            }}
          >
            {_l('确认')}
          </span>
        </React.Fragment>
        {!isMingDaoApp ? (
          <React.Fragment>
            <div className="flexRow alignItemsCenter justifyContentCenter footerCon" style={{ marginTop: '125px' }}>
              <span
                className="changeBtn Hand TxtRight"
                onClick={() => {
                  let request = getRequest();
                  let returnUrl = request.ReturnUrl;
                  this.props.updateWarn([]);
                  if (returnUrl) {
                    navigateTo('/login?ReturnUrl=' + encodeURIComponent(returnUrl));
                  } else {
                    navigateTo('/login');
                  }
                }}
              >
                {_l('返回登录页面')}
              </span>
              <span className="lineCenter mLeft24"></span>
              <div className="mLeft16 TxtLeft">
                <ChangeLang className="justifyContentLeft" />
              </div>
            </div>
          </React.Fragment>
        ) : (
          <div style={{ marginTop: '125px' }}></div>
        )}
      </React.Fragment>
    );
  };

  render() {
    return (
      <Wrap>
        <DocumentTitle title={_l('找回密码')} />
        {this.renderCon()}
      </Wrap>
    );
  }
}
