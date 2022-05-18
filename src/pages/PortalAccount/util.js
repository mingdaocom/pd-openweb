import { setPssId } from 'src/util/pssId';
import { getRequest, browserIsMobile } from 'src/util';

export const urlList = [
  'app/',
  'mobile/recordList/',
  'mobile/customPage/',
  'mobile/record/',
  'mobile/addRecord/',
  'mobile/searchRecord/',
  'mobile/groupFilterDetail/',
  'mobile/discuss/',
  'mobile/addDiscuss/',
  'printForm/',
];

export const goApp = (sessionId, appId) => {
  setPssId(sessionId);
  const request = getRequest();
  const { ReturnUrl = '' } = request;
  const toApp = () => {
    //手机端来源
    if (browserIsMobile()) {
      window.location.replace(`${window.subPath || ''}/mobile/app/${appId}`);
    } else {
      window.location.replace(`${window.subPath || ''}/app/${appId}`); //进入应用
    }
  };
  if (ReturnUrl) {
    let domainName = '';
    let href = decodeURIComponent(ReturnUrl);
    urlList.map(o => {
      if (href.indexOf(o) >= 0) {
        domainName = href.substr(href.indexOf(o) + o.length, 36);
      }
    });
    if (domainName) {
      window.location.replace(ReturnUrl);
    } else {
      toApp();
    }
  } else {
    toApp();
  }
};

export const accountResultAction = res => {
  const { accountResult, sessionId, appId, state } = res;
  let msg = '';
  switch (accountResult) {
    case 1:
      return goApp(sessionId, appId);
    // break;
    case -1:
      msg = _l('该帐号不存在');
      break;
    case 0:
      msg = _l('登录失败');
      break;
    case 2:
      msg = _l('该帐号已停用');
      break;
    case 3:
      msg = _l('该帐号待审核');
      break;
    case 4:
      msg = _l('该帐号审核未通过');
      break;
    case 5:
      msg = _l('该账号已删除');
      break;
    case 6:
      msg = _l('该账号未激活');
      break;
    case 10:
      msg = _l('应用不存在');
      break;
    case 11:
      msg = _l('外部门户已关闭');
      break;
    case 12:
      msg = _l('应用授权达到用户数量限制');
      break;
    case 13:
      msg = _l('应用授权不用');
      break;
    case 14:
      msg = _l('应用维护中');
      break;
    case 15:
      msg = _l('您不在运营方的邀请范围内');
      break;
    case 20:
      msg = _l('手机号或者验证码错误');
      break;
    case 21:
      msg = _l('验证码错误');
      break;
    case 22:
      msg = _l('请输入验证码');
      break;
    case 23:
      msg = _l('验证码已过期');
      break;
    case 24:
      // msg = _l('频繁登录，已被锁定');
      let t = state ? Math.ceil(state / 60) : 20;
      msg = _l('登录次数过多被锁定，请 %0 分钟后再试', t);
      break;
    default:
      msg = _l('登录失败');
      break;
  }
  alert(msg, 3);
  return;
};
export const statusList = [2, 3, 4, 9, 10, 11, 12, 13, 14, 10000, 20000]; //需要呈现相对落地页的状态码
