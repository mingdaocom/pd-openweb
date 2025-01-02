import React from 'react';
import global from 'src/api/global';
import { redirect, navigateToLogin, navigateTo, navigateToLogout } from 'src/router/navigateTo';
import { LoadDiv } from 'ming-ui';
import { getPssId, setPssId } from 'src/util/pssId';
import _ from 'lodash';
import moment from 'moment';
import accountSetting from 'src/api/accountSetting';
import { resetPortalUrl } from 'src/pages/accountLogin/portalAccount/util.js';

/** 存储分发类入口 状态 和 分享id */
const parseShareId = () => {
  window.shareState = {};
  if (/\/public\/print/.test(location.pathname)) {
    window.shareState.isPublicPrint = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/print\/(\w{24})/) || '')[1];
  }
  if (/\/public\/query/.test(location.pathname)) {
    window.shareState.isPublicQuery = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/query\/(\w{24})/) || '')[1];
  }
  if (/\/public\/form/.test(location.pathname)) {
    window.shareState.isPublicForm = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/form\/(\w{32})/) || '')[1];
  }
  if (/\/worksheet\/form\/preview/.test(location.pathname)) {
    window.shareState.isPublicFormPreview = true;
  }
  if (/\/public\/view/.test(location.pathname)) {
    window.shareState.isPublicView = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/view\/(\w{24})/) || '')[1];
  }
  if (/\/public\/record/.test(location.pathname)) {
    window.shareState.isPublicRecord = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/record\/(\w{24})/) || '')[1];
  }
  if (/\/public\/workflow/.test(location.pathname)) {
    window.shareState.isPublicWorkflowRecord = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/workflow\/(\w{24})/) || '')[1];
  }
  if (/\/public\/page/.test(location.pathname)) {
    window.shareState.isPublicPage = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/page\/(\w{24})/) || '')[1];
  }
  if (/\/public\/chart/.test(location.pathname)) {
    window.shareState.isPublicChart = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/chart\/(\w{24})/) || '')[1];
  }
};

const clearLocalStorage = () => {
  try {
    Object.keys(localStorage)
      .map(key => ({ key, size: Math.floor(new Blob([localStorage[key]]).size / 1024) }))
      .filter(item => item.size > 200 || item.key.startsWith('_AMap_'))
      .forEach(item => {
        localStorage.removeItem(item.key);
      });
  } catch (err) { }
};

const getGlobalMeta = ({ allowNotLogin, requestParams } = {}) => {
  const lang = getCurrentLang();

  // 处理location.href方法异步的问题
  window.isWaiting = false;

  // 处理各类分享id
  parseShareId();

  // 清除 AMap 和 体积大于200k的 localStorage
  clearLocalStorage();

  // 设置moment语言
  moment.locale(_.includes(['en', 'ja'], lang) ? lang : lang === 'zh-Hant' ? 'zh-tw' : 'zh-cn');

  // 设置语言
  $('body').attr('id', lang);

  const defaultGlobal = _.cloneDeep(md.global);
  const urlObj = new URL(decodeURIComponent(location.href));
  let args = requestParams || {};

  if (/^#publicapp/.test(urlObj.hash)) {
    window.isPublicApp = true;
    window.publicAppAuthorization = urlObj.hash.slice(10).replace('#isPrivateBuild', '');
  }

  if (urlObj.searchParams.get('token')) {
    args.token = urlObj.searchParams.get('token');
  }

  if (urlObj.searchParams.get('access_token')) {
    window.access_token = urlObj.searchParams.get('access_token');
  }
  args.lang = getCurrentLangCode();

  // 获取global数据
  const data = global.getGlobalMeta(args, { ajaxOptions: { sync: true } });

  window.config = data.config || {};
  window.md.global = _.merge(defaultGlobal, data['md.global']);

  if (allowNotLogin || window.isPublicApp) return;

  if (!md.global.Account.accountId) {
    navigateToLogin();
    return;
  }

  if (
    ((window.subPath || location.href.indexOf('theportal.cn') > -1) && !md.global.Account.isPortal) ||
    (!window.subPath && location.href.indexOf('theportal.cn') === -1 && md.global.Account.isPortal)
  ) {
    window.isWaiting = true;
    if (window.isWeiXin) {
      navigateToLogout();
    } else {
      location.href = '/dashboard';
    }
    return;
  }

  // 第一次进入
  if (!md.global.Account.langModified) {
    accountSetting.autoEditAccountLangSetting({ langType: getCurrentLangCode(lang) });
    !md.global.Account.isPortal && navigateTo('/app/my');
  } else if (md.global.Account.lang !== lang) {
    setCookie('i18n_langtag', md.global.Account.lang);
    window.location.reload();
    window.isWaiting = true;
    return;
  }

  // 设置网络多语言
  if (md.global.ProjectLangs && md.global.ProjectLangs.length) {
    const projectLangs = md.global.ProjectLangs.filter(o => o.langType === getCurrentLangCode(lang)).map(o => ({
      projectId: o.projectId,
      companyName: o.data[0].value || (_.find(v => v.projectId === o.projectId) || {}).companyName,
    }));
    const mergedProjects = _.merge(
      _.keyBy(md.global.Account.projects, 'projectId'),
      _.keyBy(projectLangs, 'projectId'),
    );

    md.global.Account.projects = _.values(mergedProjects);
  }

  // 加载KF5
  !md.global.Account.isPortal && window.mdKF5 && window.mdKF5();

  // 设置md_pss_id
  setPssId(getPssId());

  md.global.Account.isPortal && resetPortalUrl();

  redirect(location.pathname);
};

const wrapComponent = function (Comp, { allowNotLogin, requestParams } = {}) {
  class Pre extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
      };
    }
    componentDidMount() {
      getGlobalMeta({ allowNotLogin, requestParams });
      this.setState({ loading: false });
    }

    render() {
      const { loading } = this.state;

      if (window.isDingTalk) {
        document.title = _l('应用');
      }

      return loading || window.isWaiting ? <LoadDiv size="big" className="pre" /> : <Comp {...this.props} />;
    }
  }

  return Pre;
};

export default function (Comp, { allowNotLogin, requestParams } = {}) {
  if (_.isObject(Comp) && Comp.type === 'function') {
    getGlobalMeta({ allowNotLogin, requestParams });
  } else {
    return wrapComponent(Comp, { allowNotLogin, requestParams });
  }
}
