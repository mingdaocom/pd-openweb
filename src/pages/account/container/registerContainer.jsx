import React from 'react';
import Message from '../components/message';
import RegisterController from 'src/api/register';
import cx from 'classnames';
import Config from '../config';
import { hasCaptcha } from '../util';
import captcha from 'src/components/captcha';
import { encrypt } from 'src/util';
import { setPssId } from 'src/util/pssId';
import { getRequest, htmlDecodeReg } from 'src/util';

export default class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createAccountLoading: false,
      warnningText: '',
      tipDom: '',
      isError: false,
      isFrequentLoginError: false,
    };
  }

  componentDidMount() {
    document.addEventListener('keypress', this.handleEnterKey);
  }
  componentWillUmount() {
    document.removeEventListener('keypress', this.handleEnterKey);
  }

  handleEnterKey = e => {
    if (e.keyCode === 13 && !hasCaptcha()) {
      $('.btnForRegister').click();
    }
  };

  doAction = res => {
    const { changeStep, step, registerData, setDataFn, defaultAccountVerifyNextAction } = this.props;
    const {
      password,
      emailOrTel,
      verifyCode,
      confirmation,
      isLink,
      inviteFromType,
      TPParams,
      loginForAdd,
      dialCode,
      inviteInfo,
    } = registerData;
    let { callback, ticket, randstr, captchaType } = res;
    let params = {};
    if (ticket || randstr || captchaType) {
      params.ticket = ticket;
      params.randStr = randstr;
      params.captchaType = captchaType;
    }
    this.setState({
      createAccountLoading: true,
    });
    if (!isLink) {
      this.doCreateAccount(callback);
    } else {
      if (loginForAdd) {
        // 登录当前已有账户
        if (defaultAccountVerifyNextAction == Config.ExistAccountNextActions.login) {
          this.joinAccount(params);
        } else if (defaultAccountVerifyNextAction == Config.AccountVerifyNextActions.userCardInfo) {
          if (location.href.indexOf('join') >= 0) {
            RegisterController.checkExistAccountByConfirmation({
              // 检验已存在用户
              confirmation: confirmation,
              password: encrypt(password),
              ...params,
            }).then(data => {
              this.setState({
                createAccountLoading: false,
              });
              var actionResult = Config.ActionResult;
              if (data.actionResult == actionResult.success) {
                changeStep('editInfo');
              } else {
                //failed
                this.doFailCb(data.actionResult);
              }
            });
          } else {
            RegisterController.checkExistAccount({
              // 已有账号检测
              account: dialCode + emailOrTel,
              password: encrypt(password),
              ...params,
            }).then(data => {
              this.setState({
                createAccountLoading: false,
              });
              var actionResult = Config.ActionResult;
              if (data.actionResult == actionResult.success) {
                setPssId(data.sessionId);
                if (defaultAccountVerifyNextAction == Config.ExistAccountNextActions.createProject) {
                  changeStep('create');
                } else if (defaultAccountVerifyNextAction == Config.ExistAccountNextActions.userCardInfo) {
                  changeStep('editInfo');
                } else {
                  changeStep('editInfo');
                }
              } else if (data.actionResult == actionResult.accountFrequentLoginError) {
                alert(_l('账号已被锁定，请稍后再试'), 3);
              } else if (data.actionResult == actionResult.firstLoginResetPassword || data.actionResult == actionResult.passwordOverdue) {
                alert(_l('密码已过期，请重置后重新操作'), 3);
              } else {
                //failed
                this.doFailCb(data.actionResult);
              }
            });
          }
        }
      } else {
        // 创建新账号
        if (location.href.indexOf('join') >= 0) {
          if (defaultAccountVerifyNextAction == Config.ExistAccountNextActions.userCardInfo) {
            if (callback) {
              callback();
            }
          } else if (defaultAccountVerifyNextAction == Config.ExistAccountNextActions.login) {
            this.doCreateAccount(callback);
          }
        } else {
          this.doCreateAccount(callback);
        }
      }
    }
  };
  //失败的错误提示
  doFailCb = actionResult => {
    const { changeStep, loginSuc } = this.props;
    let result = Config.ActionResult;
    switch (actionResult) {
      case result.failed:
        alert(_l('操作失败'), 3); //0
        break;
      case result.failInvalidVerifyCode:
        alert(_l('验证码错误'), 3); //3
        break;
      case result.userInvalid:
        alert(_l('用户名或密码不正确'), 3); //4
        break;
      case result.inviteLinkExpirate:
        changeStep('inviteLinkExpirate'); //7 // 邀请链接失效
        break;
      case result.projectUserExists: //10 您已经是该组织的成员
        setTimeout(() => {
          loginSuc();
        }, 1000);
        alert(_l('您已经是该组织的成员'), 3);
        break;
      case result.userFromError:
        alert(_l('账号来源类型受限'), 3); //14
        break;
      case result.accountFrequentLoginError:
        this.doCaptchaState(); //需要图形验证 15
        break;
      case result.isLock:
        alert(_l('密码错误次数过多被锁定，请 20 分钟后再试，或 重置密码'), 3); //频繁用户被锁定20分钟 21
        break;
      default:
        alert(_l('操作失败'), 3);
        break;
    }
  };

  doCaptchaFn = () => {
    const { isFrequentLoginError, createAccountLoading } = this.state;
    if (createAccountLoading) {
      return;
    }
    let callback = (res = {}) => {
      if (isFrequentLoginError && res.ret !== 0) {
        return;
      }
      this.setState(
        {
          createAccountLoading: true,
        },
        () => {
          this.doAction(
            Object.assign({}, res, {
              captchaType: md.staticglobal.getCaptchaType(),
            }),
          );
        },
      );
    };
    if (isFrequentLoginError) {
      if (md.staticglobal.getCaptchaType() === 1) {
        new captcha(callback);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
      }
    } else {
      callback();
    }
  };

  joinAccount = params => {
    const { changeStep, step, registerData, loginSuc } = this.props;
    const { password, emailOrTel, confirmation, isLink, dialCode } = registerData;
    RegisterController.joinByExistAccount({
      // 如果已有账号加入某个邀请模块(不含加入公司)
      account: dialCode + emailOrTel,
      password: encrypt(password),
      confirmation: confirmation,
      isLink: location.href.indexOf('linkInvite') >= 0,
      ...params,
    }).then(data => {
      this.setState({
        createAccountLoading: false,
      });
      var actionResult = Config.ActionResult;
      if (data.actionResult == actionResult.success) {
        setPssId(data.sessionId);
        loginSuc(data.user.encrypeAccount, data.user.encrypePassword);
      } else if (data.actionResult == actionResult.accountFrequentLoginError) {
        alert(_l('账号已被锁定，请稍后再试'), 3);
      } else if (data.actionResult == actionResult.firstLoginResetPassword || data.actionResult == actionResult.passwordOverdue) {
        alert(_l('密码已过期，请重置后重新操作'), 3);
      } else {
        //failed
        this.doFailCb(data.actionResult);
      }
    });
  };

  doCaptchaState = () => {
    //需要图形验证
    this.setState(
      {
        isFrequentLoginError: true,
      },
      () => {
        this.doCaptchaFn();
      },
    );
  };

  doCreateAccount = callback => {
    const { changeStep, step, registerData, setDataFn, defaultAccountVerifyNextAction } = this.props;
    const { password, emailOrTel, verifyCode, confirmation, isLink, inviteFromType, TPParams, loginForAdd, dialCode } =
      registerData;
    RegisterController.createAccount({
      account: dialCode + emailOrTel,
      password: encrypt(password),
      fullname: '',
      verifyCode,
      confirmation,
      isLink: location.href.indexOf('linkInvite') >= 0,
      unionId: TPParams.unionId,
      state: TPParams.state,
      tpType: TPParams.tpType,
      setSession: defaultAccountVerifyNextAction == Config.AccountVerifyNextActions.login,
      regFrom: window.localStorage.getItem('RegFrom'),
      referrer: window.localStorage.getItem('Referrer'),
    }).then(
      data => {
        // 接口调用成功后需要删除 cookie RegFrom 和  Referrer
        delCookie('RegFrom');
        window.localStorage.removeItem('Referrer');
        const { ActionResult } = Config;
        this.setState({
          createAccountLoading: false,
        });
        if (data.actionResult == ActionResult.success) {
          setPssId(data.sessionId);
          const { tpType } = TPParams;
          if ([7, 8].includes(tpType)) {
            //url 中的 tpType 参数为 7 或 8 ，则直接进
            location.href = '/app';
            return;
          }
          if (isLink) {
            if (
              !(
                defaultAccountVerifyNextAction == Config.AccountVerifyNextActions.createProject ||
                defaultAccountVerifyNextAction == Config.AccountVerifyNextActions.userCardInfo
              )
            ) {
              const { user = {} } = data;
              const { encrypeAccount, encrypePassword } = user;
              setDataFn({
                ...registerData,
                encrypeAccount,
                encrypePassword,
              });
            }
          }
          if (callback) {
            callback();
          }
        } else if (data.actionResult == ActionResult.userAccountExists) {
          setDataFn({
            ...registerData,
            warnningData: [{ tipDom: '#txtMobilePhone', warnningText: _l('该号码已注册，您可以使用已有账号登录') }],
          });
        } else if (data.actionResult == ActionResult.inviteLinkExpirate) {
          changeStep('inviteLinkExpirate');
        } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
          setDataFn({
            ...registerData,
            warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('验证码错误'), isError: true }],
          });
        } else if (data.actionResult == ActionResult.noEfficacyVerifyCode) {
          setDataFn({
            ...registerData,
            warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('验证码已经失效，请重新发送'), isError: true }],
          });
        } else {
          alert(_l('操作失败'), 3);
        }
      },
      () => { },
    );
  };

  useOldAccountFn = () => {
    const { registerData, setDataFn } = this.props;
    const { isLink, loginForAdd } = registerData;
    let request = getRequest();
    let returnUrl = request.ReturnUrl;
    if (isLink) {
      setDataFn({
        ...registerData,
        loginForAdd: !loginForAdd,
        warnningData: [],
      });
    } else {
      if (returnUrl) {
        location.href = '/login?ReturnUrl=' + encodeURIComponent(returnUrl);
      } else {
        location.href = '/login';
      }
    }
  };

  render() {
    const { changeStep, step, registerData, setDataFn, defaultAccountVerifyNextAction } = this.props;
    const { inviteInfo = {}, confirmation, isLink, company = {}, loginForAdd, onlyRead } = registerData;
    const { companyName = '', titleStr } = company;
    const { createUserName = '' } = inviteInfo;
    const { createAccountLoading } = this.state;
    return (
      <React.Fragment>
        <div className="titleHeader">
          {!isLink ? (
            <div className="title mTop40">{_l('注册')}</div>
          ) : (
            <div className="title mTop40">
              {!createUserName ? _l('您正在加入') : _l('%0邀请您加入', createUserName)}
              <p>{htmlDecodeReg(titleStr)}</p>
            </div>
          )}
        </div>
        <Message
          type={isLink ? (loginForAdd ? 'login' : 'invite') : 'register'}
          dataList={_.cloneDeep(registerData)}
          setDataFn={setDataFn}
          nextHtml={isValid => {
            return (
              <React.Fragment>
                {createAccountLoading && <div className="loadingLine"></div>}
                <p className="termsText Gray_75">
                  {isLink && loginForAdd ? (
                    <a target="_blank" href="/findPassword.htm">
                      {_l('忘记密码？')}
                    </a>
                  ) : (
                    <span></span>
                  )}
                </p>
                <span
                  className={cx('btnForRegister Hand', { loading: createAccountLoading })}
                  onClick={() => {
                    if (createAccountLoading) {
                      return;
                    }
                    if (isValid()) {
                      this.doAction({
                        callback: () => {
                          changeStep('registerName');
                        },
                      });
                    }
                  }}
                >
                  {!isLink ? _l('注册') : !loginForAdd ? _l('注册并加入') : _l('登录并加入')}
                  {createAccountLoading && '...'}
                </span>
              </React.Fragment>
            );
          }}
        />
        {/* 已有账号只能登录并加入 */}
        {!inviteInfo.account && (
          <React.Fragment>
            <span className={cx('line', { mTopH: loginForAdd })}></span>
            <span className="btnUseOldAccount">
              {isLink ? (
                loginForAdd ? (
                  <span
                    className="Hand"
                    onClick={() => {
                      this.useOldAccountFn();
                    }}
                  >
                    {_l('注册并加入')}
                  </span>
                ) : (
                  <React.Fragment>
                    <span className="textG">{_l('已经有账号')} , </span>
                    <span
                      className="textB Hand"
                      onClick={() => {
                        this.useOldAccountFn();
                      }}
                    >
                      {_l('登录')}
                    </span>
                  </React.Fragment>
                )
              ) : (
                <span
                  className="Hand"
                  onClick={() => {
                    this.useOldAccountFn();
                  }}
                >
                  {_l('登录已有账号')}
                </span>
              )}
            </span>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
