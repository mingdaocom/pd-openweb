import React from 'react';
import '../components/message.less';
import cx from 'classnames';
import RegisterController from 'src/api/register';
import captcha from 'src/components/captcha';
import { inputFocusFn, inputBlurFn } from '../util';
export default class Add extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFrequentLoginError: false,
      loading: false,
      warnningText: '', //验证码的提示文案
      tipDom: '', //提示的div
    };
  }

  inputOnFocus = e => {
    inputFocusFn(e);
  };

  inputOnBlur = e => {
    inputBlurFn(e);
  };

  doAddProjectCode = (res, callback) => {
    const { registerData = {}, setDataFn } = this.props;
    const { regcode = '' } = registerData;
    this.setState({
      loading: true,
    });
    let params = {
      projectCode: regcode,
    };
    if (res) {
      params.ticket = res.ticket;
      params.randStr = res.randstr;
      params.captchaType = md.staticglobal.CaptchaType();
    }
    RegisterController.checkProjectCode(params).then(
      data => {
        this.setState({
          loading: false,
        });
        if (data.joinProjectResult === 1) {
          setDataFn({
            ...registerData,
            projectId: data.userCard.user.projectId,
            userCard: data.userCard,
          });
          callback();
        } else if (data.joinProjectResult === 11) {
          //频繁登录错误，需要验证码
          this.setState({ isFrequentLoginError: true }, () => {
            $('.btnForRegister').click();
          });
        } else {
          this.setState({
            loading: false,
          });
          let str = _l('操作失败');
          if (data.joinProjectResult === 2) {
            str = _l('请等待管理员审批');
          } else if (data.joinProjectResult === 3) {
            str = _l('该用户已存在组织中');
          } else if (data.joinProjectResult === 4) {
            str = _l('该组织ID不存在');
          } else if (data.joinProjectResult === 5) {
            str = _l('你加入的组织用户额度不足，请联系该组织管理员');
          } else if (data.joinProjectResult === 6) {
            str = _l('验证码错误');
          }
          alert(str, 3);
        }
      },
      () => {},
    );
  };

  setWarnningText = warnningText => {
    this.setState(
      {
        warnningText,
      },
      () => {
        $(this.regcode)
          .closest('.mesDiv')
          .addClass('errorDiv');
        $(this.regcode).focus();
      },
    );
  };

  renderCon = () => {
    const { changeStep, step, registerData, setDataFn } = this.props;
    const { regcode } = registerData;
    const { warnningText } = this.state;
    return (
      <React.Fragment>
        <div className="messageBox mTop5">
          <div className={cx('mesDiv', { current: !!regcode })}>
            <input
              type="text"
              className="regcode"
              autoComplete="off"
              ref={regcode => (this.regcode = regcode)}
              onBlur={this.inputOnBlur}
              onFocus={this.inputOnFocus}
              onChange={e => {
                $('.errorDiv').removeClass('errorDiv');
                setDataFn({
                  ...registerData,
                  regcode: e.target.value,
                });
              }}
              value={regcode}
            />
            <div
              className="title"
              onClick={e => {
                $(this.regcode).focus();
              }}
            >
              {_l('请填写组织ID')}
            </div>
            {!!warnningText && <div className={cx('warnningTip Hidden')}>{warnningText}</div>}
          </div>
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { changeStep, step, registerData = {}, setDataFn } = this.props;
    const { regcode = '' } = registerData;
    return (
      <React.Fragment>
        {this.state.loading && <div className="loadingLine"></div>}
        {location.href.indexOf('/enterpriseRegister.htm?type=add') < 0 && (
          <span
            className="mTop40 Font15 InlineBlock Hand backspaceT"
            onClick={() => {
              changeStep('createOrAdd');
            }}
          >
            <span className="backspace"></span>
            {_l('返回')}
          </span>
        )}
        <div className="title mTop24 Font20">{_l('请输入组织ID')}</div>
        <p className="mTop10 Gray_9e Font15">{_l('组织ID可以通过管理员获取')}</p>
        {this.renderCon()}
        <span
          className="btnForRegister Hand mTop40"
          onClick={() => {
            if (this.state.loading) {
              return;
            }
            if (!regcode) {
              this.setWarnningText(_l('请输入组织ID'));
              return;
            }
            let callback = (res = {}) => {
              if (this.state.isFrequentLoginError && res.ret !== 0) {
                return;
              }
              this.setState(
                {
                  loading: true,
                },
                () => {
                  this.doAddProjectCode(
                    Object.assign({}, res, {
                      captchaType: md.staticglobal.CaptchaType(),
                    }),
                    () => {
                      changeStep('editInfo');
                    },
                  );
                },
              );
            };
            if (this.state.isFrequentLoginError) {
              if (md.staticglobal.CaptchaType() === 1) {
                new captcha(callback);
              } else {
                new TencentCaptcha(md.staticglobal.TencentAppId, callback).show();
              }
            } else {
              callback();
            }
          }}
        >
          {this.state.loading ? _l('加入...') : _l('加入')}
        </span>
      </React.Fragment>
    );
  }
}
