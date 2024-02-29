import { navigateTo } from './navigateTo';
import { compatibleWorksheetRoute } from 'src/pages/Portal/util.js';
import _ from 'lodash';

export default () => {
  window.closeindex = 0;
  window.closeFns = {};
  const isMDClient = window.navigator.userAgent.indexOf('MDClient') > -1;

  const parseUrl = url => {
    var a = document.createElement('a');
    a.href = url;
    return {
      protocol: a.protocol,
      hostname: a.hostname,
      port: a.port,
      pathname: ('/' + a.pathname).replace('//', '/'),
      search: a.search,
      hash: a.hash,
      origin: a.origin,
    };
  };

  // 验证客户端是否新开窗口
  const checkClientOpenWindow = url => {
    const clientOpenList = localStorage.getItem('clientOpenList')
      ? JSON.parse(localStorage.getItem('clientOpenList'))
      : [];
    let isContain = false;

    if (url.indexOf('hr') > -1 || url.indexOf('dossier') > -1 || url.indexOf('public') > -1) return true;

    clientOpenList.forEach(item => {
      if (url.indexOf(item) > -1) {
        isContain = true;
      }
    });

    return isContain;
  };

  $('body').on('click', 'a', function(e) {
    if (e.which !== 1) return;
    if (e.ctrlKey || e.shiftKey || e.metaKey) return;
    if ($(e.target).closest('.mdEditorContent').length) return;
    if ($(e.target).closest('.stopPropagation').length) return;
    const $a = $(this);
    if ($a.attr('download') || $a.attr('rel') === 'external' || (!isMDClient && $a.attr('target'))) {
      return;
    }
    const link = $a.attr('href');
    if (!link && link !== '') return;
    const parsedLink = parseUrl(link);
    const currentLink = window.location;
    if (
      parsedLink.protocol !== currentLink.protocol ||
      parsedLink.hostname !== currentLink.hostname ||
      parsedLink.port !== currentLink.port
    ) {
      return;
    }
    if (/\/form|worksheetshare\/\w*/.test(parsedLink.pathname)) {
      return;
    }
    e.preventDefault();

    // 系统消息 有的带protocol和hostname有的不带
    // 从parsedLink里取出pathname, search和hash
    const { pathname, search, hash } = parsedLink;
    let url = `${pathname}${search}${hash}`;
    //外部门户 worksheet老地址兼容处理
    if (md.global.Account.isPortal && url.startsWith('/worksheet/')) {
      compatibleWorksheetRoute(
        url
          .split(/\/worksheet\/(.*)/)
          .filter(o => o)[0]
          .split(/\/(.*)/)[0],
        url.split(/\/row\/(.*)/).filter(o => o)[1],
      );
      return;
    }

    if (isMDClient && checkClientOpenWindow(url)) {
      window.open(url);
    } else {
      navigateTo(url);
    }
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      // 弹窗内存在正在编辑单元格时不触发esc关闭弹窗
      if (e.target.classList.contains('stopPropagation')) {
        return;
      }
      const activeElement = document.activeElement;
      const activeElementTagName = activeElement && activeElement.tagName && activeElement.tagName.toLowerCase();
      if (
        (activeElementTagName === 'input' || activeElementTagName === 'textarea') &&
        activeElement &&
        (activeElement.getAttribute('class') || '').indexOf('escclose') > -1
      ) {
        activeElement.blur();
      } else {
        const fnitem = _.maxBy(
          Object.keys(window.closeFns).map(k => window.closeFns[k]),
          'index',
        );
        if (
          fnitem &&
          /(workSheetNewRecord|workSheetRecordInfo|fillRecordControls)/.test(fnitem.className) &&
          window.hasEditingCell
        ) {
          return;
        }
        if (fnitem && typeof fnitem.fn === 'function') {
          fnitem.fn(e);
          if (Object.keys(window.closeFns).length === 0) {
            window.closeindex = 0;
          }
        }
      }
    }
  });
};
