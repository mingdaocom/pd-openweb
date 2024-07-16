import _ from 'lodash';
import {
  specialTelVerify,
  initIntlTelInput,
  isTel,
  getEmailOrTel,
  getDialCode,
  registerSuc,
  checkReturnUrl,
} from 'src/pages/accountLogin/util.js';
import registerApi from 'src/api/register';
import accountApi from 'src/api/account';
import { encrypt, mdAppResponse, getRequest } from 'src/util';
import { setPssId } from 'src/util/pssId';
import { ActionResult, AccountNextActions } from 'src/pages/accountLogin/config.js';
import { LoginResult } from 'src/pages/accountLogin/login/config.js';
import { getDataByFilterXSS } from 'src/pages/accountLogin/util.js';
import moment from 'moment';
import { navigateTo } from 'src/router/navigateTo';
import RegExpValidator from 'src/util/expression';

let request = getRequest();

export const setLoading = data => {
  return { type: 'UPDATE_LOADING', data };
};

export const updateCreateLoading = data => {
  return { type: 'UPDATE_CREATEACCOUNTLOADING', data };
};

export const updateIsFrequentLoginError = data => {
  return { type: 'UPDATE_ISFREQUENTLOGINERROR', data };
};

export const setData = data => {
  return { type: 'UPDATE_INFO', data };
};

export const setStep = data => {
  return { type: 'UPDATE_STEP', data };
};

export const setNext = data => {
  return { type: 'UPDATE_DEFAULTACCOUNTVERIFYNEXTACTION', data };
};

export const updateWarn = data => {
  return { type: 'UPDATE_WARN', data };
};

export const updateUseCard = data => {
  return { type: 'UPDATE_USERCARD', data };
};

export const updateCompany = data => {
  return { type: 'UPDATE_COMPANY', data };
};

export const updateState = data => {
  return { type: 'UPDATE_STATE', data };
};

export const reset = () => {
  return (dispatch, getState) => {
    dispatch({ type: 'RESET' });
    dispatch(updateWarn([]));
    dispatch(updateUseCard());
    dispatch({ type: 'CLEAR_COMPANY' });
    dispatch({ type: 'CLEAR_STATE' });
    dispatch({ type: 'CLEAR_USERCARD' });
    dispatch(setNext());
    dispatch(setStep());
  };
};

export const clearInfoByUrl = () => {
  return (dispatch, getState) => {
    dispatch(
      setData({
        confirmation: '',
        isLink: false,
        projectId: '',
        TPParams: {
          unionId: '',
          state: '',
          tpType: 0,
        },
        state: '',
      }),
    );
    dispatch(setNext(AccountNextActions.createProject));
    dispatch(
      updateCompany({
        code: '',
      }),
    );
  };
};

const isPasswordRule = str => {
  const { md = {} } = window;
  const { global = {} } = md;
  const { SysSettings = {} } = global;
  const { passwordRegexTip, passwordRegex } = SysSettings;
  return RegExpValidator.isPasswordValid(str, passwordRegex);
};

// 验证input内容 手机 验证码 密码
export const isValid = (isForSendCode, keys = []) => {
  return (dispatch, getState) => {
    const { accountInfo = {}, stateList = {} } = getState();
    const { emailOrTel = '', verifyCode = '', password = '', fullName = '', hasCheckPrivacy } = accountInfo;
    let isRight = true;
    let warnningData = [];

    if (keys.includes('emailOrTel') || keys.includes('tel') || keys.includes('email')) {
      if (!!emailOrTel.replace(/\s*/g, '')) {
        //手机号或者邮箱 不为空
        const iti = initIntlTelInput();
        iti.setNumber(emailOrTel);
        //邮箱验证
        const isEmailRule = emailOrTel => {
          const emailReg =
            /^[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*@[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*\.[\u4e00-\u9fa5\w-]+$/i;
          if (!emailReg.test(emailOrTel.trim())) {
            warnningData.push({ tipDom: '#txtMobilePhone', warnningText: _l('邮箱格式错误') });
            isRight = false;
          }
        };
        //手机号验证
        const isTelRule = () => {
          if (!iti.isValidNumber() && !specialTelVerify(iti.getNumber())) {
            warnningData.push({ tipDom: '#txtMobilePhone', warnningText: _l('手机号格式错误') });
            isRight = false;
          }
        };
        if (keys.includes('tel')) {
          isTelRule();
        } else if (keys.includes('email')) {
          isEmailRule(emailOrTel);
        } else {
          if (isTel(emailOrTel)) {
            isTelRule();
          } else {
            //邮箱验证规则
            isEmailRule(emailOrTel);
          }
        }
      } else {
        //手机号或者邮箱 为空
        if (keys.includes('tel')) {
          warnningData.push({ tipDom: '#txtMobilePhone', warnningText: _l('手机号不能为空') });
          isRight = false;
        } else if (keys.includes('email')) {
          warnningData.push({ tipDom: '#txtMobilePhone', warnningText: _l('邮箱不能为空') });
          isRight = false;
        } else {
          warnningData.push({ tipDom: '#txtMobilePhone', warnningText: _l('手机号或邮箱不能为空') });
          isRight = false;
        }
      }
    }

    if (keys.includes('fullName')) {
      if (!_.trim(fullName)) {
        warnningData.push({ tipDom: '#fullName', warnningText: _l('用户名不能为空') });
        isRight = false;
      }
    }

    if (!isForSendCode) {
      //获取验证码时，不需要校验验证码 以及 密码
      if (
        keys.includes('code') &&
        (!verifyCode || verifyCode.length < 4 || verifyCode.length > 8) //登录地方验证码必须4-8位才合法
      ) {
        warnningData.push({
          tipDom: '.txtLoginCode',
          warnningText: !verifyCode ? _l('请输入验证码') : _l('验证码不合法'),
          isError: true,
        });
        isRight = false;
      }

      if (keys.includes('password') || keys.includes('setPassword')) {
        if (!password) {
          warnningData.push({ tipDom: '.passwordIcon', warnningText: _l('密码不能为空') });
          isRight = false;
        } else {
          if (keys.includes('setPassword')) {
            //登录时，不需要验证密码的合法性
            if (!isPasswordRule(password)) {
              warnningData.push({ tipDom: '.passwordIcon', warnningText: _l('密码格式错误') });
              isRight = false;
            }
          }
        }
      }
      //注册 需要勾选 使用条款 与 隐私条款
      if (!hasCheckPrivacy && keys.includes('privacy')) {
        warnningData.push({ tipDom: '.privacyText', warnningText: _l('请勾选同意后注册'), isError: true });
        isRight = false;
      }
    }

    dispatch(updateWarn(warnningData));
    dispatch(
      setData({
        focusDiv: '',
      }),
    );

    return isRight;
  };
};

//注册相关数据处理
export const initRegisterData = param => {
  return (dispatch, getState) => {
    let accountInfo = param;
    // 如果 url 带 mobile 参数
    let { mobile } = request;

    if (mobile) {
      let dialCode = '';

      if (isTel(mobile)) {
        mobile = getEmailOrTel(mobile);
        dialCode = getDialCode();
      }

      accountInfo = {
        ...accountInfo,
        emailOrTel: mobile,
        dialCode,
      };
    }

    dispatch(setData(accountInfo));
    dispatch(setStep(request.type));
    dispatch(setLoading(false));
  };
};

// (加入 ｜ 创建)组织
export const enterpriseRegister = () => {
  return async (dispatch, getState) => {
    let { accountInfo } = getState();

    switch (request.type) {
      case 'create':
        const accountData = await registerApi.checkExistAccountByCurrentAccount();

        if (accountData.actionResult == ActionResult.success) {
          dispatch(
            updateCompany({
              email: _.get(accountData, 'user.email'), // 邮箱
            }),
          );
        }
        break;
      case 'editInfo':
        const data = await accountApi.checkJoinProjectByTokenWithCard({
          projectId: request.projectId,
          token: request.token,
        });

        if (data.joinProjectResult === 1) {
          // 验证通过
          dispatch(
            updateCompany({
              companyName: _.get(data, 'userCard.user.companyName'), // 邮箱
            }),
          );
          dispatch(updateUseCard(data.userCard));
          accountInfo.tokenProjectCode = data.token;
        }
        break;
    }
    dispatch(initRegisterData(accountInfo));
  };
};

//注册相关 错误提示
export const registerFailCb = actionResult => {
  return (dispatch, getState) => {
    let { accountInfo } = getState();

    switch (actionResult) {
      case ActionResult.failed:
        alert(_l('操作失败'), 3); //0
        break;
      case ActionResult.failInvalidVerifyCode:
        alert(_l('验证码错误'), 3); //3
        break;
      case ActionResult.userInvalid:
        alert(_l('用户名或密码不正确'), 3); //4
        break;
      case ActionResult.inviteLinkExpirate:
        dispatch(setStep('inviteLinkExpirate')); //7 // 邀请链接失效
        break;
      case ActionResult.projectUserExists: //10 您已经是该组织的成员
        setTimeout(() => {
          registerSuc(accountInfo);
        }, 1000);
        alert(_l('您已经是该组织的成员'), 3);
        break;
      case ActionResult.userFromError:
        alert(_l('账号来源类型受限'), 3); //14
        break;
      case ActionResult.accountFrequentLoginError:
        //需要图形验证 15
        dispatch(updateIsFrequentLoginError(true));
        break;
      case ActionResult.isLock:
        alert(_l('密码错误次数过多被锁定，请 20 分钟后再试，或 重置密码'), 3); //频繁用户被锁定20分钟 21
        break;
      default:
        alert(_l('操作失败'), 3);
        break;
    }
  };
};

//注册后 创建账号相关处理
export const doCreateAccount = callback => {
  return (dispatch, getState) => {
    const { accountInfo, nextAction } = getState();
    const { password, emailOrTel, verifyCode, confirmation, isLink, TPParams, dialCode } = accountInfo;

    registerApi
      .createAccount({
        account: encrypt(dialCode + emailOrTel),
        password: encrypt(password),
        fullname: '',
        verifyCode,
        confirmation,
        isLink: location.href.indexOf('linkInvite') >= 0,
        unionId: TPParams.unionId,
        state: TPParams.state,
        tpType: TPParams.tpType,
        setSession: nextAction == AccountNextActions.login,
        regFrom: window.localStorage.getItem('RegFrom'),
        referrer: window.localStorage.getItem('Referrer'),
      })
      .then(data => {
        data.token && dispatch(setData({ tokenProjectCode: data.token }));
        // 接口调用成功后需要删除 cookie RegFrom 和  Referrer
        delCookie('RegFrom');
        window.localStorage.removeItem('Referrer');
        dispatch(updateCreateLoading(false));

        if (data.actionResult == ActionResult.success) {
          setPssId(data.sessionId);
          const { tpType } = TPParams;

          if ([7, 8].includes(tpType)) {
            //url 中的 tpType 参数为 7 或 8 ，则直接进
            location.href = '/app';

            if (window.isMingDaoApp) {
              mdAppResponse({
                sessionId: 'register',
                type: 'native',
                settings: { action: 'registerSuccess', account: dialCode + emailOrTel, password },
              });
            }
            return;
          }

          if (isLink) {
            if (!(nextAction == AccountNextActions.createProject || nextAction == AccountNextActions.userCardInfo)) {
              const { user = {} } = data;
              const { encrypeAccount, encrypePassword } = user;

              dispatch(setData({ encrypeAccount, encrypePassword }));
            }
          }

          callback && callback();
        } else if (data.actionResult == ActionResult.userAccountExists) {
          dispatch(setData({ focusDiv: '' }));
          dispatch(updateWarn([{ tipDom: '#txtMobilePhone', warnningText: _l('账号已注册') }]));
        } else if (data.actionResult == ActionResult.inviteLinkExpirate) {
          dispatch(setStep('inviteLinkExpirate'));
        } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
          dispatch(updateWarn([{ tipDom: '.txtLoginCode', warnningText: _l('验证码错误'), isError: true }]));
          dispatch(setData({ focusDiv: '' }));
        } else if (data.actionResult == ActionResult.noEfficacyVerifyCode) {
          dispatch(
            updateWarn([{ tipDom: '.txtLoginCode', warnningText: _l('验证码已经失效，请重新发送'), isError: true }]),
          );
          dispatch(setData({ focusDiv: '' }));
        } else {
          alert(_l('操作失败'), 3);
        }
      });
  };
};

// 注册
export const registerAction = res => {
  return (dispatch, getState) => {
    const { accountInfo, nextAction } = getState();
    const { password, emailOrTel, confirmation, isLink, loginForAdd, dialCode } = accountInfo;
    let { callback, ticket, randstr, captchaType } = res;
    let params = {};

    if (ticket || randstr || captchaType) {
      params.ticket = ticket;
      params.randStr = randstr;
      params.captchaType = captchaType;
    }

    dispatch(updateCreateLoading(true));

    if (!isLink) {
      dispatch(doCreateAccount(callback));
    } else {
      if (loginForAdd) {
        // 登录当前已有账户
        if (nextAction == AccountNextActions.login) {
          registerApi
            .joinByExistAccount({
              // 如果已有账号加入某个邀请模块(不含加入公司)
              account: encrypt(dialCode + emailOrTel),
              password: encrypt(password),
              confirmation: confirmation,
              isLink: location.href.indexOf('linkInvite') >= 0,
              ...params,
            })
            .then(data => {
              dispatch(updateCreateLoading(false));
              if (data.actionResult == ActionResult.success) {
                setPssId(data.sessionId);
                registerSuc(accountInfo);
              } else {
                //failed
                dispatch(registerFailCb(data.actionResult));
              }
            });
        } else if (nextAction == AccountNextActions.userCardInfo) {
          if (location.href.indexOf('join') >= 0) {
            registerApi
              .checkExistAccountByConfirmation({
                // 检验已存在用户
                confirmation: confirmation,
                password: encrypt(password),
                ...params,
              })
              .then(data => {
                dispatch(updateCreateLoading(false));
                data.token && dispatch(setData({ tokenProjectCode: data.token }));

                if (data.actionResult == ActionResult.success) {
                  dispatch(setStep('editInfo'));
                } else {
                  //failed
                  dispatch(registerFailCb(data.actionResult));
                }
              });
          } else {
            registerApi
              .checkExistAccount({
                // 已有账号检测
                account: encrypt(dialCode + emailOrTel),
                password: encrypt(password),
                ...params,
              })
              .then(data => {
                dispatch(updateCreateLoading(false));
                data.token && dispatch(setData({ tokenProjectCode: data.token }));

                if (data.actionResult == ActionResult.success) {
                  setPssId(data.sessionId);

                  if (nextAction == AccountNextActions.createProject) {
                    dispatch(setStep('create'));
                  } else if (nextAction == AccountNextActions.userCardInfo) {
                    dispatch(setStep('editInfo'));
                  } else {
                    dispatch(setStep('editInfo'));
                  }
                } else if (data.actionResult == ActionResult.isLock) {
                  alert(_l('账号已被锁定，请稍后再试'), 3);
                } else if (
                  data.actionResult == ActionResult.firstLoginResetPassword ||
                  data.actionResult == ActionResult.passwordOverdue
                ) {
                  alert(_l('密码已过期，请重置后重新操作'), 3);
                } else {
                  //failed
                  dispatch(registerFailCb(data.actionResult));
                }
              });
          }
        }
      } else {
        // 创建新账号
        if (location.href.indexOf('join') >= 0) {
          if (nextAction == AccountNextActions.userCardInfo) {
            callback && callback();
          } else if (nextAction == AccountNextActions.login) {
            dispatch(doCreateAccount(callback));
          }
        } else {
          dispatch(doCreateAccount(callback));
        }
      }
    }
  };
};

//登录相关的回调处理
export const loginCallback = data => {
  return (dispatch, getState) => {
    const { projectId, loginMode, isNetwork } = data;
    const { accountInfo } = getState();
    const { emailOrTel, fullName, isCheck } = accountInfo;
    const { loginGotoAppId } = md.global.SysSettings;

    //缓存这次登录的账号
    if (loginMode === 1) {
      safeLocalStorageSetItem('LoginName', emailOrTel);
    } else {
      safeLocalStorageSetItem('LoginLDAPName', fullName);
    }

    //缓存loginStatus 注销
    safeLocalStorageSetItem(
      'loginStatus',
      JSON.stringify({ state: data.state, createStateTime: moment().format('YYYY-MM-DD HH:mm:ss') }),
    );

    if ([LoginResult.accountSuccess, LoginResult.needTwofactorVerifyCode].includes(data.accountResult)) {
      //登录来源 登出后的跳转地址
      if (isNetwork) {
        safeLocalStorageSetItem('loginFrom', '2');
      } else {
        safeLocalStorageSetItem('loginFrom', '1');
      }

      // LoginCheckList 下次自动登录
      if (isCheck) {
        let account = loginMode === 1 ? emailOrTel : fullName;
        safeLocalStorageSetItem(
          'LoginCheckList',
          JSON.stringify({
            accountId: data.accountId,
            encryptPassword: data.encryptPassword,
            loginType: data.loginType,
            account,
            projectId,
            time: new Date(),
          }),
        );
      }
    }

    if (data.accountResult === LoginResult.accountSuccess) {
      setPssId(data.sessionId);

      if (request.ReturnUrl) {
        checkReturnUrl(request.ReturnUrl);
        location.replace(getDataByFilterXSS(request.ReturnUrl));
      } else if (loginGotoAppId) {
        window.location.replace(`/app/${loginGotoAppId}`);
      } else {
        window.location.replace('/dashboard');
      }
    } else {
      //开启了两步验证
      if (data.accountResult === LoginResult.needTwofactorVerifyCode) {
        dispatch(setData({ state: data.state }));
        dispatch(updateWarn([]));

        if (request.ReturnUrl) {
          navigateTo(`/twofactor?state=${data.state}&ReturnUrl=${encodeURIComponent(request.ReturnUrl)}`);
        } else {
          navigateTo(`/twofactor?state=${data.state}`);
        }

        return;
      }
      if (
        [
          LoginResult.passwordOverdue, // 密码过期需要重新设置密码
          LoginResult.firstLoginResetPassword, //首次登录需修改密码
        ].includes(data.accountResult)
      ) {
        let type = LoginResult.firstLoginResetPassword === data.accountResult ? 1 : 2;
        //需要重置密码
        if (request.ReturnUrl) {
          location.href = `/resetPassword?state=${data.state}&type=${type}&ReturnUrl=${encodeURIComponent(
            request.ReturnUrl,
          )}`;
        } else {
          location.href = `/resetPassword?state=${data.state}&type=${type}`;
        }
        return;
      }

      // 如果登录失败，需要把本地保存的 accountId 和 encryptPassword 清理掉
      window.localStorage.removeItem('LoginCheckList');

      // 注销
      if (data.accountResult === LoginResult.cancellation) {
        location.href = '/cancellation';
      }

      dispatch(setLoading(false));

      if (data.accountResult === LoginResult.accountNotExist) {
        dispatch(updateWarn([{ tipDom: '#txtMobilePhone', warnningText: _l('账号未注册') }]));
        return;
      }

      if (data.accountResult === LoginResult.accountFrequentLoginError) {
        dispatch(setData({ frequentLogin: true }));
        return;
      }

      if (data.accountResult === LoginResult.isLock) {
        let t = data.state ? Math.ceil(data.state / 60) : 20;

        dispatch(
          updateWarn([
            {
              tipDom: '.warnningDiv',
              warnningText: _l(
                '错误次数过多，出于安全考虑，暂时锁定您的账户，请 %0 分钟后尝试，或%1重置密码%2解除锁定',
                t,
                '<a href="/findPassword" target="_blank">',
                '</a>',
              ),
            },
          ]),
        );

        return;
      }

      let msg = '';

      if (data.accountResult === LoginResult.userFromError) {
        msg = _l('账号来源类型受限');
      } else if (data.accountResult === LoginResult.accountDisabled) {
        msg = _l('账号被禁用，请联系系统管理员进行恢复');
      } else {
        //密码错误
        if (!(loginMode === 2) && data.accountResult === LoginResult.passwordError) {
          const { state } = data;
          const t = (state || '').split('|');

          if (t.length > 1) {
            dispatch(
              updateWarn([
                { tipDom: '.warnningDiv', warnningText: _l('您输入错误%0次，还可尝试%1次', t[1], t[0] - t[1]) },
              ]),
            );
            return;
          }

          msg = _l('用户名或密码不正确');
        } else {
          msg = data.accountResult === LoginResult.verifyCodeError ? _l('验证码输入错误') : _l('用户名或密码不正确');
        }
      }

      alert(msg, 3);
    }
  };
};
