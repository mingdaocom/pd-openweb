import React from 'react';
import ReactDOM from 'react-dom';
import ChangeLang from 'src/components/ChangeLang';
import Twofactor from './container/twofactor';
import './login.less';
import { getRequest } from 'src/util';
import { LoadDiv } from 'ming-ui';
import cx from 'classnames';
import { sendTwofactorVerifyCode } from 'src/api/login';
import captcha from 'src/components/captcha';

let request = getRequest();
let ActionResult = {
  failed: 0, // 失败
  success: 1, // 成功
  failInvalidVerifyCode: 3, //  图形验证码错误
  userInvalid: 4, // 用户未进入两步验证流程
  sendFrequent: 8, // 发送过于频繁，需要出来图形验证码机制验证
  noEmail: 12, // 邮箱不能为空
  noTel: 17, // 手机号不能为空
};
class TwofactorContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasSend: false, //是否已发送默认的第一次验证
      hasSendTel: false, //是否发动过一次手机号验证
      verifyCode: '', // 两步验证验证码
      state: request.state,
      type: 1, //1为手机号，2为邮箱,
      isFail: false, //验证码是否发送失败
      tel: '',
      email: '',
    };
  }

  componentDidMount() {
    $('html').addClass('loginContainerCon');
    document.title = _l('两步验证');
    this.sendFn();
  }

  componentWillUnmount() {
    $('html').removeClass('loginContainerCon');
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
    sendTwofactorVerifyCode({
      state,
      type, //1为手机号，2为邮箱,
      ...info,
    }).then(data => {
      this.setState({
        needTicket: true, //除了第一次 都需要图形验证码
        hasSend: true,
      });
      const { actionResult, user = {} } = data;
      const { failed, success, failInvalidVerifyCode, userInvalid, sendFrequent, noEmail, noTel } = ActionResult;
      //图形验证码错误 //需要图形验证
      if ([failInvalidVerifyCode].includes(actionResult)) {
        this.setState({ needTicket: true, isFail: true }, () => {
          if (cb) {
            cb();
          }
        });
        return;
      } else if ([failed, noEmail, noTel, sendFrequent].includes(actionResult)) {
        //失败
        this.setState({
          isFail: true,
        });
        let msg = _l('验证码发送失败!');
        if (actionResult === noTel) {
          if (hasSendTel) {
            //未绑定手机号 除第一次外，提示未绑定
            msg = _l('手机未绑定，请切换到邮箱验证！');
          } else {
            //未绑定手机号 第一次直接进入邮箱
            this.setState({
              type: 2,
              hasSendTel: true,
            });
            return;
          }
        }
        if (actionResult === noEmail) {
          msg = _l('邮箱未绑定，请切换到手机短信验证！');
        } else if (actionResult === sendFrequent) {
          msg = _l('验证码发送过于频繁，请切换验证方式!');
        }
        alert(msg, 3);
        return;
      } else if (actionResult === userInvalid) {
        window.location.replace('/login');
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
          captchaType: md.staticglobal.CaptchaType(),
        }),
        () => {
          this.sendFn();
        },
      );
    };
    if (needTicket) {
      if (md.staticglobal.CaptchaType() === 1) {
        new captcha(callback);
      } else {
        new TencentCaptcha(md.staticglobal.TencentAppId, callback).show();
      }
    } else {
      callback();
    }
  };

  renderCon = () => {
    let pram = {
      ...this.state,
      updataState: (data, callback) => {
        this.setState(
          {
            ...data,
          },
          () => {
            if (callback) {
              callback();
            }
          },
        );
      },
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
        <span className={cx('line', {})} style={{ marginTop: 150 }}></span>
        <span
          className="btnUseOldAccount Hand"
          onClick={() => {
            this.setState({
              type: type !== 1 ? 1 : 2,
              account: '',
            });
          }}
        >
          {type !== 2 ? _l('使用邮箱验证') : _l('使用手机短信验证')}
        </span>
      </React.Fragment>
    );
  };

  showLangChang = () => {
    $('.showLangChangeBottom').removeClass('Hidden');
  };

  render() {
    if (!this.state.hasSend) {
      return <LoadDiv className="" style={{ margin: '50px auto' }} />;
    } else {
      return (
        <div className="loginBox">
          <div className="loginContainer">
            <div className="titleHeader">
            </div>
            {this.renderCon()}
            {this.renderFooter()}
            {this.showLangChang()}
          </div>
          <ChangeLang />
        </div>
      );
    }
  }
}

ReactDOM.render(<TwofactorContainer />, document.querySelector('#app'));
