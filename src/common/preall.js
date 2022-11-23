import React from 'react';
import qs from 'query-string';
import global from 'src/api/global';
import project from 'src/api/project';
import redirect from './redirect';
import { LoadDiv } from 'ming-ui';
import { getPssId, setPssId } from 'src/util/pssId';

function getGlobalMeta({ allownotlogin, transfertoken } = {}, cb = () => {}) {
  const urlparams = qs.parse(unescape(unescape(window.location.search.slice(1))));
  let args = {};
  const urlObj = new URL(decodeURIComponent(location.href));
  if (/^#publicapp/.test(urlObj.hash)) {
    window.isPublicApp = true;
    window.publicAppAuthorization = urlObj.hash.slice(10);
  }
  if (transfertoken && urlparams.token) {
    args.token = urlparams.token;
  }
  if (urlparams.access_token) {
    window.access_token = urlparams.access_token;
  }
  parseShareId();
  clearLocalStorage(); // 清除 AMap 和 体积大于200k的 localStorage
  global.getGlobalMeta(args).then(data => {
    if (allownotlogin || window.isPublicApp) {
      window.config = data.config;
      if (!window.md) {
        window.md = { global: data['md.global'] };
      } else {
        window.md.global = data['md.global'];
      }
      if (window.md.global && !window.md.global.Account) {
        window.md.global.Account = {};
      }
      let SysSettings = _.get(window.md.global, ['SysSettings']);
      if (!SysSettings) {
        window.md.global.SysSettings = _.get(md.staticglobal, ['SysSettings']);
      }
      cb();
      return;
    }
    if (!data['md.global'].Account) {
      const host = location.host;
      const url = `?ReturnUrl=${encodeURIComponent(location.href)}`;
      location.href = `${window.subPath || ''}/network${url}`;
      return;
    }

    window.config = data.config;
    window.md.global = data['md.global'];
    window.md.global.Config.ServiceTel = '400-665-6655';
    let SysSettings = _.get(window.md.global, ['SysSettings']);
    if (!SysSettings) {
      window.md.global.SysSettings = _.get(md.staticglobal, ['SysSettings']);
    }
    !md.global.Account.isPortal && window.mdKF5 && window.mdKF5();

    if (md.global.SysSettings && md.global.SysSettings.forbidSuites) {
      md.global.Config.ForbidSuites = md.global.SysSettings.forbidSuites.split('|').map(item => Number(item));
    }

    const lang = getCookie('i18n_langtag') || getNavigatorLang();
    if (lang) {
      moment.locale(getMomentLocale(lang));
    }

    setPssId(getPssId());
    if (redirect(location.pathname)) {
      return;
    }
    cb();
  });
}

const wrapComponent = function(Comp, { allownotlogin, hideloading, transfertoken } = {}) {
  class Pre extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
      };
    }
    componentDidMount() {
      getGlobalMeta({ allownotlogin, transfertoken }, () => {
        this.setState({
          loading: false,
        });
      });
    }

    render() {
      const { loading } = this.state;

      if (
        navigator.userAgent.toLowerCase().indexOf('mobile') > -1 &&
        navigator.userAgent.toLowerCase().indexOf('dingtalk') > -1
      ) {
        document.title = _l('应用');
      }

      return loading ? !hideloading && <LoadDiv size="big" className="pre" /> : <Comp {...this.props} />;
    }
  }

  return Pre;
};

function getMomentLocale(lang) {
  if (lang === 'en') {
    return 'en';
  } else if (lang === 'zh-Hant') {
    return 'zh-tw';
  } else if (lang === 'ja') {
    return 'ja';
  } else {
    return 'zh-cn';
  }
}

export default function(Comp, { allownotlogin, preloadcb, hideloading, transfertoken } = {}) {
  if (_.isObject(Comp) && Comp.type === 'function') {
    getGlobalMeta({ allownotlogin, transfertoken }, preloadcb);
  } else {
    return wrapComponent(Comp, { allownotlogin, hideloading, transfertoken });
  }
}

/** 存储分发类入口 状态 和 分享id */
function parseShareId() {
  window.shareState = {};
  if (/\/worksheetshare/.test(location.pathname)) {
    window.shareState.isRecordShare = true;
    window.shareState.shareId = (location.pathname.match(/.*\/worksheetshare\/(\w{24})/) || '')[1];
  }
  if (/\/printshare/.test(location.pathname)) {
    window.shareState.isPrintShare = true;
    window.shareState.shareId = (location.pathname.match(/.*\/printshare\/(\w{24})/) || '')[1];
  }
  if (/\/public\/query/.test(location.pathname)) {
    window.shareState.isPublicQuery = true;
    window.shareState.shareId = (location.pathname.match(/.*\/public\/query\/(\w{24})/) || '')[1];
  }
  if (/\/recordshare/.test(location.pathname)) {
    window.shareState.isUpdateRecordShare = true;
    window.shareState.shareId = (location.pathname.match(/.*\/recordshare\/(\w{24})/) || '')[1];
  }
  if (/\/form/.test(location.pathname)) {
    window.shareState.isPublicQuery = true;
    window.shareState.shareId = (location.pathname.match(/.*\/form\/(\w{32})/) || '')[1];
  }
}

function clearLocalStorage() {
  try {
    Object.keys(localStorage)
      .map(key => ({ key, size: Math.floor(new Blob([localStorage[key]]).size / 1024) }))
      .filter(item => item.size > 200 || item.key.startsWith('_AMap_'))
      .forEach(item => {
        localStorage.removeItem(item.key);
      });
  } catch (err) {}
}
