import React from 'react';
var qs = require('query-string');
import global from 'src/api/global';
import project from 'src/api/project';
import { LoadDiv } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import { getPssId, setPssId } from 'src/util/pssId';
if (/theportal\.cn$/.test(location.host) && window.__api_server__ && window.__api_server__.main) {
  window.__api_server__.main = '/api/';
}

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
  parseShareId();
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

    const ua = window.navigator.userAgent.toLowerCase();
    if (
      ua.match(/MicroMessenger/i) == 'micromessenger' &&
      (((window.subPath || location.href.indexOf('theportal.cn') > -1) && !data['md.global'].Account.isPortal) ||
        (!window.subPath && location.href.indexOf('theportal.cn') === -1 && data['md.global'].Account.isPortal))
    ) {
      location.href = `${
        data['md.global'].Account.isPortal ? '' : window.subPath
      }/logout?ReturnUrl=${encodeURIComponent(location.href)}`;
      return;
    }

    window.config = data.config;
    window.md.global = data['md.global'];
    window.md.global.Config.ServiceTel = '010-53153053';
    let SysSettings = _.get(window.md.global, ['SysSettings']);
    if (!SysSettings) {
      window.md.global.SysSettings = _.get(md.staticglobal, ['SysSettings']);
    }
    !md.global.Account.isPortal && window.mdKF5 && window.mdKF5();

    if (md.global.SysSettings && md.global.SysSettings.forbidSuites) {
      md.global.Config.ForbidSuites = md.global.SysSettings.forbidSuites.split('|').map(item => Number(item));
    }

    setTimeout(() => {
      fetch('/docpreview/fonts/213');
      fetch('/docpreview/fonts/196');
      fetch('/docpreview/fonts/036');

      fetch('/docpreview/fonts/082');
      fetch('/docpreview/fonts/054');
      fetch('/docpreview/fonts/210');
      fetch('/docpreview/fonts/212');
      fetch('/docpreview/fonts/229');
    }, 10000);

    const lang = getCookie('i18n_langtag') || getNavigatorLang();
    if (lang) {
      moment.locale(getMomentLocale(lang));
    }

    setPssId(getPssId());
    cb();
  });
}

const wrapComponent = function (Comp, { allownotlogin, hideloading, transfertoken } = {}) {
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

      if (navigator.userAgent.toLowerCase().indexOf('mobile') > -1 && navigator.userAgent.toLowerCase().indexOf('dingtalk') > -1) {
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
  } else {
    return 'zh-cn';
  }
}

export default function (Comp, { allownotlogin, preloadcb, hideloading, transfertoken } = {}) {
  if (_.isObject(Comp) && Comp.type === 'function') {
    getGlobalMeta({ allownotlogin, transfertoken }, preloadcb);
  } else {
    return wrapComponent(Comp, { allownotlogin, hideloading, transfertoken });
  }
}

(function (arr) {
  arr.forEach(function (item) {
    item.prepend =
      item.prepend ||
      function () {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.insertBefore(docFrag, this.firstChild);
      };
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

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
}
