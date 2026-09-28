import _ from 'lodash';
import { compatibleWorksheetRoute } from 'src/pages/Portal/navigation';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { emitter } from 'src/utils/platform/browser/dom';
import { getDefaultThemeMode, setBodyThemeMode } from 'src/utils/platform/theme/theme';

// Esc 关闭最上层浮层：Modal / Dialog 挂载时把自身关闭函数注册进 window.closeFns，这里只触发 index 最大的一个。
// 单独导出，供 /mingo 这类不挂主 app router 的独立入口只接入 Esc 关闭能力，而不接管站内 a 标签点击。
// 幂等：重复调用不再重复绑定 keydown，也不清空已注册的浮层。
let escCloseInited = false;

export const initEscClose = () => {
  if (escCloseInited) return;

  escCloseInited = true;
  window.closeindex = 0;
  window.closeFns = {};

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      // 弹窗内存在正在编辑单元格时不触发esc关闭弹窗
      if (e.target?.classList?.contains('stopPropagation')) {
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
          /(workSheetNewRecord|createRecordSideMask|workSheetRecordInfo|fillRecordControls)/.test(fnitem.className) &&
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

export default () => {
  initEscClose();

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
    const clientOpenList = safeParse(localStorage.getItem('clientOpenList'), 'array');
    let isContain = false;

    if (url.indexOf('hr') > -1 || url.indexOf('dossier') > -1 || url.indexOf('public') > -1) return true;

    clientOpenList.forEach(item => {
      if (url.indexOf(item) > -1) {
        isContain = true;
      }
    });

    return isContain;
  };

  $('body')
    .off('click.globalNavigation', 'a')
    .on('click.globalNavigation', 'a', function (e) {
      if (e.which !== 1) return;
      if (e.ctrlKey || e.shiftKey || e.metaKey) return;
      if ($(e.target).closest('.mdEditorContent').length) return;
      if ($(e.target).closest('.stopPropagation').length) return;
      const $a = $(this);

      if ($a.attr('download') || $a.attr('rel') === 'external' || (!window.isMDClient && $a.attr('target'))) {
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

      if (window.isMDClient && checkClientOpenWindow(url)) {
        window.open(url);
      } else {
        navigateTo(url);
      }
    });
};

export const initThemeMode = () => {
  if (window.self !== window.top && document.referrer.includes(md.global.Config.HDPUrl)) {
    window.themeModeVisible = false;
    return;
  }

  window.themeModeVisible = true;
  // 主题颜色变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const onChangeThemeMode = e => {
    if (!localStorage.getItem('themeMode')) {
      localStorage.setItem('themeMode', getDefaultThemeMode());
    }

    if (['dark', 'light'].includes(localStorage.getItem('themeMode'))) {
      window.themeMode = localStorage.getItem('themeMode');
      setBodyThemeMode(window.themeMode);
    } else {
      window.themeMode = e.matches ? 'dark' : 'light';
      setBodyThemeMode(window.themeMode);
      emitter.emit('CHANGE_THEME_MODE', window.themeMode);
    }
  };

  mediaQuery.addEventListener('change', onChangeThemeMode);
  window.onChangeThemeMode = value => {
    if (['dark', 'light'].includes(value)) {
      localStorage.setItem('themeMode', value);
      onChangeThemeMode({});
    } else {
      localStorage.setItem('themeMode', 'system');
      onChangeThemeMode(window.matchMedia('(prefers-color-scheme: dark)'));
    }
  };

  onChangeThemeMode(mediaQuery);
};
