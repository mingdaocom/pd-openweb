import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../redux/actions';
import ChangeLang from 'src/components/ChangeLang';
import Twofactor from './twofactorCon';
import { getRequest } from 'src/util';
import { LoadDiv } from 'ming-ui';
import cx from 'classnames';
import loginAjax from 'src/api/login';
import { captcha } from 'ming-ui/functions';
import _ from 'lodash';
import { TwofactorVerifyCodeActionResult } from '../config';
import { Wrap } from 'src/pages/accountLogin/login/style.jsx';
let request = getRequest();
import DocumentTitle from 'react-document-title';
import { navigateTo } from 'src/router/navigateTo';

const mapStateToProps = ({ accountInfo }) => ({
  accountInfo: accountInfo,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions }, dispatch);
@connect(mapStateToProps, mapDispatchToProps)
export default class TwofactorContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasSend: false, //是否已发送默认的第一次验证
      hasSendTel: false, //是否发动过一次手机号验证
      state: props.accountInfo.state || request.state,
      type: _.get(md, 'global.SysSettings.twoFactorAuthenticationPriorityType') || 1, //1为手机号，2为邮箱,
      isFail: false, //验证码是否发送失败
      tel: '',
      email: '',
    };
  }

  componentDidMount() {
    this.sendFn();
  }

  componentWillUnmount() {
    this.props.reset();
  }
  //获取验证码ajaxFn
  sendTwofactorVerifyCode = (data, cb) => {
    this.setState({
      isFail: false,
    });
    const { ticket, randstr, captchaType } = data;
    const { state, type, hasSendTel } = this.state;
    let info = {};
    if (data) {
      info = {
        ticket,
        randstr,
        captchaType,
      };
    }
    loginAjax
      .sendTwofactorVerifyCode({
        state,
        type, //1为手机号，2为邮箱,
        ...info,
        regFrom: request.s,
        lang: getCurrentLangCode(),
      })
      .then(data => {
        this.setState({
          needTicket: true, //除了第一次 都需要图形验证码
          hasSend: true,
        });
        const { actionResult, user = {} } = data;
        const { failed, success, failInvalidVerifyCode, userInvalid, sendFrequent, noEmail, noTel } =
          TwofactorVerifyCodeActionResult;
        //图形验证码错误 //需要图形验证
        if ([failInvalidVerifyCode].includes(actionResult)) {
          this.setState({ needTicket: true, isFail: true }, () => {
            this.sendFn();
          });
          return;
        } else if ([failed, noEmail, noTel, sendFrequent].includes(actionResult)) {
          //失败
          this.setState({
            isFail: true,
          });
          let msg = _l('验证码发送失败!');
          if (actionResult === sendFrequent) {
            msg = _l('验证码发送过于频繁，请切换验证方式!');
          }
          if ([noEmail, noTel].includes(actionResult)) {
            //未绑定手机号 除第一次外，提示未绑定
            if (hasSendTel) {
              msg =
                actionResult === noTel ? _l('手机未绑定，请使用邮箱验证！') : _l('邮箱未绑定，请使用手机短信验证！');
              this.setState({
                type: type !== 1 ? 1 : 2,
                account: '',
              });
            } else {
              this.setState({
                type: type !== 1 ? 1 : 2,
                hasSendTel: true,
              });
              return;
            }
          }
          alert(msg, 3);
          return;
        } else if (actionResult === userInvalid) {
          navigateTo('/login');
        } else if (actionResult === success) {
          let parm = {};
          if (type === 1) {
            parm = { telTime: new Date(), tel: user.account };
          } else {
            parm = { emailTime: new Date(), email: user.account };
          }
          this.setState({
            ...parm,
            account: user.account,
            isFail: false,
          });
        }
      });
  };
  //获取验证码
  sendFn = (data = {}) => {
    const { needTicket } = this.state;
    let callback = (res = {}) => {
      if (needTicket && res.ret !== 0) {
        return;
      }
      if (data.btnCb) {
        data.btnCb();
      }
      this.sendTwofactorVerifyCode(
        Object.assign({}, res, {
          captchaType: md.global.getCaptchaType(),
        }),
      );
    };
    if (needTicket) {
      if (md.global.getCaptchaType() === 1) {
        new captcha(callback);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
      }
    } else {
      callback();
    }
  };

  renderCon = () => {
    let pram = {
      ...this.state,
      sendFn: this.sendFn,
    };

    return <Twofactor {...pram} />;
  };

  renderFooter = () => {
    let { type } = this.state;

    return (
      <React.Fragment>
        <div className="tpLogin TxtCenter">
          <div className="Clear"></div>
        </div>
        <span className="line" style={{ marginTop: 150 }}></span>
        <div className="flexRow alignItemsCenter justifyContentCenter footerCon">
          <span
            className="changeBtn Hand TxtRight"
            onClick={() => {
              this.setState({
                type: type !== 1 ? 1 : 2,
                account: '',
              });
            }}
          >
            {type !== 2 ? _l('使用邮箱验证') : _l('使用手机短信验证')}
          </span>
          <span className="lineCenter mLeft24"></span>
          <div className="mLeft16 TxtLeft">
            <ChangeLang className="justifyContentLeft" />
          </div>
        </div>
      </React.Fragment>
    );
  };

  render() {
    return (
      <Wrap>
        <DocumentTitle title={_l('两步验证')} />
        {!this.state.hasSend ? (
          <LoadDiv className="" style={{ margin: '50px auto' }} />
        ) : (
          <React.Fragment>
            {this.renderCon()}
            {this.renderFooter()}
          </React.Fragment>
        )}
      </Wrap>
    );
  }
}
