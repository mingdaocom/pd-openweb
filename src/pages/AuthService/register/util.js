import { InviteFromType } from '../config';
import { setPssId } from 'src/util/pssId';
import { getRequest, encrypt } from 'src/util';
import { ActionResult, AccountNextActions } from 'src/pages/AuthService/config';
import registerApi from 'src/api/register';
import { getDataByFilterXSS, toMDPage } from 'src/pages/AuthService/util'

export const getTitle = () => {
  const { type } = getRequest();
  let str = _l('注册');
  switch (type) {
    case 'create':
      str = _l('创建组织');
      break;
    case 'add':
    case 'editInfo':
      str = _l('加入组织');
      break;
    default:
      break;
  }
  return str;
};

export const getDes = authInfo => {
  let titleDesc = '';
  switch (authInfo.fromType) {
    case InviteFromType.friend:
      titleDesc = _l('成为协作好友');
      break;
    case InviteFromType.group:
      let groupDesc = authInfo.isPost ? _l('群组') : _l('聊天');
      titleDesc = groupDesc;
      break;
    case InviteFromType.task:
      titleDesc = _l('任务');
      break;
    case InviteFromType.kc:
      titleDesc = _l('共享文件夹');
      break;
    case InviteFromType.calendar:
      titleDesc = _l('日程');
      break;
    case InviteFromType.tFolder:
      titleDesc = _l('项目');
      break;
  }
  return titleDesc;
};

export const getDepartmentInfo = props => {
  const { userCard = [] } = props;
  const { departments = [], workSites = [], jobs = [] } = userCard;
  let departmentsN = departments.length <= 0 ? [{ value: 'null', text: _l('暂无部门') }] : _.map(departments, item => { return { value: item.departmentId, text: item.departmentName } });
  let workSitesN = workSites.length <= 0 ? [{ value: 'null', text: _l('暂无工作地点') }] : _.map(workSites, item => { return { value: item.workSiteId, text: item.workSiteName } });
  let jobsN = jobs.length <= 0 ? [{ value: 'null', text: _l('暂无职位') }] : _.map(jobs, item => { return { value: item.jobId, text: item.jobName } });
  return { departmentsArr: departmentsN, workSitesArr: workSitesN, jobsArr: jobsN };
};

//注册相关 错误提示
export const registerFailCb = ({ actionResult, accountInfo, onChange }) => {
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
      onChange({ step: 'inviteLinkExpirate' }); //7 // 邀请链接失效
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
      onChange({ isFrequentLoginError: true });
      break;
    case ActionResult.isLock:
      alert(_l('密码错误次数过多被锁定，请 20 分钟后再试，或 重置密码'), 3); //频繁用户被锁定20分钟 21
      break;
    default:
      alert(_l('操作失败'), 3);
      break;
  }
};

//注册后 创建账号相关处理
export const doCreateAccount = ({ accountInfo, callback, onChange }) => {
  const { password, emailOrTel, verifyCode, confirmation, isLink, TPParams = {}, dialCode, nextAction } = accountInfo;
  registerApi.createAccount({
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
  }).then(data => {
    data.token && onChange({ tokenProjectCode: data.token });
    // 接口调用成功后需要删除 cookie RegFrom 和  Referrer
    delCookie('RegFrom');
    window.localStorage.removeItem('Referrer');
    onChange({ createAccountLoading: false });
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
      callback && callback();
    } else if (data.actionResult == ActionResult.userAccountExists) {
      onChange({ focusDiv: '', warnList: [{ tipDom: 'inputAccount', warnTxt: _l('账号已注册') }] });
    } else if (data.actionResult == ActionResult.inviteLinkExpirate) {
      onChange({ step: 'inviteLinkExpirate' });
    } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
      onChange({ focusDiv: '', warnList: [{ tipDom: 'inputCode', warnTxt: _l('验证码错误'), isError: true }] });
    } else if (data.actionResult == ActionResult.noEfficacyVerifyCode) {
      onChange({
        focusDiv: '',
        warnList: [{ tipDom: 'inputCode', warnTxt: _l('验证码已经失效，请重新发送'), isError: true }],
      });
    } else {
      alert(_l('操作失败'), 3);
    }
  });
};

// 注册
export const registerAction = ({ res = {}, info = {}, onChange = () => { }, callback }) => {
  const { password, emailOrTel, confirmation, isLink, loginForAdd, dialCode, nextAction } = info;
  let { ticket, randstr, captchaType } = res;
  let params = {};

  if (ticket || randstr || captchaType) {
    params.ticket = ticket;
    params.randStr = randstr;
    params.captchaType = captchaType;
  }

  onChange({ createAccountLoading: true });

  if (!isLink) {
    doCreateAccount({ accountInfo: info, callback, onChange });
  } else {
    if (loginForAdd) {
      // 登录当前已有账户
      if (nextAction == AccountNextActions.login) {
        registerApi.joinByExistAccount({
          // 如果已有账号加入某个邀请模块(不含加入公司)
          account: encrypt(dialCode + emailOrTel),
          password: encrypt(password),
          confirmation: confirmation,
          isLink: location.href.indexOf('linkInvite') >= 0,
          ...params,
        }).then(data => {
          onChange({ createAccountLoading: false });
          if (data.actionResult == ActionResult.success) {
            setPssId(data.sessionId);
            registerSuc(info);
          } else {
            registerFailCb({ actionResult: data.actionResult, accountInfo: info, onChange });
          }
        });
      } else if (nextAction == AccountNextActions.userCardInfo) {
        if (location.href.indexOf('join') >= 0) {
          registerApi.checkExistAccountByConfirmation({
            // 检验已存在用户
            confirmation: confirmation,
            password: encrypt(password),
            ...params,
          }).then(data => {
            onChange({ createAccountLoading: false });
            data.token && onChange({ tokenProjectCode: data.token });
            if (data.actionResult == ActionResult.success) {
              onChange({ step: 'editInfo' });
            } else {
              registerFailCb({ actionResult: data.actionResult, accountInfo: info, onChange });
            }
          });
        } else {
          registerApi.checkExistAccount({
            // 已有账号检测
            account: encrypt(dialCode + emailOrTel),
            password: encrypt(password),
            ...params,
          }).then(data => {
            onChange({ createAccountLoading: false });
            data.token && onChange({ tokenProjectCode: data.token });
            if (data.actionResult == ActionResult.success) {
              setPssId(data.sessionId);
              if (nextAction == AccountNextActions.createProject) {
                onChange({ step: 'create' });
              } else if (nextAction == AccountNextActions.userCardInfo) {
                onChange({ step: 'editInfo' });
              } else {
                onChange({ step: 'editInfo' });
              }
            } else if (data.actionResult == ActionResult.isLock) {
              alert(_l('账号已被锁定，请稍后再试'), 3);
            } else if (
              data.actionResult == ActionResult.firstLoginResetPassword ||
              data.actionResult == ActionResult.passwordOverdue
            ) {
              alert(_l('密码已过期，请重置后重新操作'), 3);
            } else {
              registerFailCb({ actionResult: data.actionResult, accountInfo: info, onChange });
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
          doCreateAccount({ accountInfo: info, callback, onChange });
        }
      } else {
        doCreateAccount({ accountInfo: info, callback, onChange });
      }
    }
  }
};

//  注册流程后登录成功跳转
export const registerSuc = ({ emailOrTel, dialCode, password }, action) => {
  let request = getRequest();
  let returnUrl = getDataByFilterXSS(request.ReturnUrl || '');
  if (returnUrl.indexOf('type=privatekey') > -1) {
    location.href = returnUrl;
  } else {
    toMDPage()
  }

  if (window.isMingDaoApp) {
    mdAppResponse({
      sessionId: 'register',
      type: 'native',
      settings: { action: action ? action : 'registerSuccess', account: dialCode + emailOrTel, password },
    });
  }
};
