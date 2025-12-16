import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { LoadDiv } from 'ming-ui';
import accountSetting from 'src/api/accountSetting';
import global from 'src/api/global';
import { resetPortalUrl } from 'src/pages/AuthService/portalAccount/util.js';
import { navigateTo, navigateToLogin, navigateToLogout, redirect } from 'src/router/navigateTo';
import { getPssId, setPssId } from 'src/utils/pssId';

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
  if (/\/public\/chatbot/.test(location.pathname)) {
    window.shareState.isPublicChatbot = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/chatbot\/(\w{24})/) || '')[1];
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
  } catch (err) {
    console.log(err);
  }
};

// 格式化url末尾的斜杠
const normalizeUrls = obj => {
  for (const key in obj) {
    const value = obj[key];
    // AppFileServer、PluginRuntimeUrl、WebUrl、PlatformUrl 不处理
    // AjaxApiUrl 应用库引用的library中没有斜杠，所以不处理
    if (['AppFileServer', 'PluginRuntimeUrl', 'WebUrl', 'PlatformUrl', 'AjaxApiUrl'].includes(key)) {
      continue;
    }
    // 是字符串、以http或https开头、斜杠结尾
    if (typeof value === 'string' && /^https?:\/\/.*?\/$/i.test(value)) {
      obj[key] = value.trim().replace(/\/$/, '');
    }
  }
  return obj;
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

  args.lang = getCurrentLangCode();

  // 获取global数据
  const data = global.getGlobalMeta(args, { ajaxOptions: { sync: true } });

  window.config = data.config || {};
  const formatUrlEnum = ['Config', 'FileStoreConfig'];
  const globalData = _.merge(defaultGlobal, data['md.global']);
  const formatGlobalData = {
    ...globalData,
    ...formatUrlEnum.reduce((acc, key) => {
      const config = globalData[key];
      acc[key] = normalizeUrls(config);
      return acc;
    }, {}),
  };
  window.md.global = formatGlobalData;

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
      if (
        md.global.Account.isPortal &&
        location.href.indexOf('theportal.cn') === -1 &&
        location.href.indexOf('/portal/') === -1 &&
        md.global.Account.appId
      ) {
        location.href = `${window.subPath || ''}/portal/${md.global.Account.appId}`;
        return;
      }
      location.href = `${md.global.Config.WebUrl}dashboard`;
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

  // HAP显示人事
  if (!md.global.Config.IsLocal) {
    md.global.SysSettings.forbidSuites = md.global.SysSettings.forbidSuites.replace('5', '');
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

if (location.href.indexOf('?debug') > -1) {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/vconsole/dist/vconsole.min.js';
  document.head.appendChild(script);
  script.onload = () => {
    new VConsole();
  };
}
