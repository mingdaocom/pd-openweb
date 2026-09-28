import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { defaultTitleStyles } from 'src/pages/customPage/components/ConfigSideWrap/util';
import { sanitizeIframeHtml } from 'src/utils/core/sanitizeHtml';
import { handleCondition } from 'src/utils/domain/control/conditions';
import { enumWidgetType, getEnumType } from 'src/utils/domain/customPage/model';
import { MAX_COMPONENT_COUNT } from './config';
import { containerWidgets, widgets } from './enum';

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
`;

export const CUSTOM_PAGE_IFRAME_ALLOW_LIST = [
  'geolocation',
  'microphone',
  'camera',
  'fullscreen',
  'clipboard-read',
  'clipboard-write',
];

export const CUSTOM_PAGE_IFRAME_ALLOW = `${CUSTOM_PAGE_IFRAME_ALLOW_LIST.join('; ')};`;

export const getMergedIframeAllow = allow => {
  const permissions = (allow || '')
    .split(';')
    .map(permission => permission.trim())
    .filter(Boolean);

  CUSTOM_PAGE_IFRAME_ALLOW_LIST.forEach(permission => {
    if (!permissions.includes(permission)) {
      permissions.push(permission);
    }
  });

  return `${permissions.join('; ')};`;
};

export const addIframePermissions = html => {
  const safeHtml = sanitizeIframeHtml(html);
  if (!safeHtml || typeof document === 'undefined') return safeHtml;

  const wrap = document.createElement('div');
  wrap.innerHTML = safeHtml;

  wrap.querySelectorAll('iframe').forEach(iframe => {
    iframe.setAttribute('allow', getMergedIframeAllow(iframe.getAttribute('allow')));
    iframe.setAttribute('allowfullscreen', 'true');
  });

  return sanitizeIframeHtml(wrap.innerHTML);
};

export const getIndexById = ({ component, components }) => {
  const id = component.id || component.uuid;
  return _.findIndex(components, item => item.id === id || item.uuid === id);
};

// export const formatComponents = components => components.map(item => ({ ...item, layout: JSON.parse(item.layout || '{}') }));

export const componentCountLimit = (components = []) => {
  if (window.platformENV.isHap && components.length >= MAX_COMPONENT_COUNT) {
    alert(_l('自定义页面最多只能添加%0个组件', MAX_COMPONENT_COUNT), 3);
    return false;
  }

  return true;
};

export const getIconByType = type => {
  return _.get({ ...widgets, ...containerWidgets }[getEnumType(type)], 'icon');
};

function filterHTML(input) {
  const div = document.createElement('div');
  div.innerHTML = input;
  const text = div.textContent || div.innerText || '';
  return text.replace(/\u00A0/g, ' ').trim();
}

export const getComponentTitleText = component => {
  const { value = '', type, name, button, config = {}, componentConfig = {} } = component;
  const enumType = getEnumType(type);
  if (enumType === 'analysis') return name || _l('未命名图表');
  if (enumType === 'richText') return filterHTML(value) || _l('文本');
  if (enumType === 'button') return _.get(button, ['buttonList', '0', 'name']);
  if (enumType === 'view') return config.name;
  if (enumType === 'filter') return _l('筛选组件');
  if (enumType === 'carousel') return _l('轮播图');
  if (enumType === 'tabs') return _.get(componentConfig, 'name') || _l('标签页');
  if (enumType === 'card') return _.get(componentConfig, 'name') || _l('卡片');
  if (enumType === 'image') return _.get(componentConfig, 'name') || _l('图片');
  if (enumType === 'subsection') return _l('分段');
  if (_.includes(['embedUrl'], enumType)) return value;
  return value;
};

//  获取layout布局, 如果没有设置好的layout,则生成一个默认的
export const computeWidth = ({ count, margin = 20 }) => {
  return { width: `calc(${100 / count}% - ${margin}px)` };
};

export const genUrl = (url, para, info) => {
  para = para || [];

  if (!url) return url;
  if (para.length < 1) return url;
  const getData = value => {
    const { type, data } = value;
    if (type === 'static') return data;
    const { mobilePhone, accountId, email } = _.get(md, ['global', 'Account']);

    switch (data) {
      case 'userId':
        return accountId;
      case 'phone':
        return mobilePhone;
      case 'email':
        return email;
      case 'language':
        return window.getCurrentLang();
      // case 'workId':
      // return 'a';
      case 'ua':
        return navigator.userAgent;
      case 'timestamp':
        return Date.now();
      default:
        return info[data] || '';
    }
  };

  const paraStr = para.reduce((p, c) => {
    const { key, value } = c;
    const data = encodeURIComponent(getData(value));
    if (!data) return p;
    const searchPara = p ? `&${encodeURIComponent(key)}=${data}` : `${encodeURIComponent(key)}=${data}`;
    if (url.includes(searchPara)) return p;
    return (p += searchPara);
  }, '');
  if (!paraStr) return url;
  return url.includes('?') ? `${url}&${paraStr}` : `${url}?${paraStr}`;
};

export const parseLink = (link, param) => {
  const url = genUrl(link, param);
  if (!/^https?:\/\//.test(url)) return `https://${url}`;
  return url;
};

// 图表和视图组件补充 objectId，便于搜索组件搜索
export const fillObjectId = components => {
  return components.map(c => {
    if ([enumWidgetType.analysis, enumWidgetType.view].includes(c.type)) {
      const config = _.get(c, 'config') || {};

      if (config.objectId) {
        return c;
      } else {
        return {
          ...c,
          config: {
            ...config,
            objectId: uuidv4(),
          },
        };
      }
    }

    return c;
  });
};

export const formatNavfilters = data => {
  const { advancedSetting } = data;
  const { navshow, navfilters, showNavfilters } = advancedSetting;

  if (['2'].includes(navshow) && navfilters && !showNavfilters) {
    const res = JSON.parse(navfilters);
    const { values } = handleCondition({
      ...data,
      values: res,
    });
    return JSON.stringify(values);
  }

  if (['3'].includes(navshow) && navfilters && !showNavfilters) {
    const res = JSON.parse(navfilters);
    return JSON.stringify(res.map(handleCondition));
  }

  return navfilters;
};

export const updateLayout = (components, config) => {
  const oldCols = 12;
  const newCols = 48;

  if (_.get(config, 'webNewCols') === 48) {
    return components;
  }

  return components.map(c => {
    const { web = {} } = c;
    const { layout } = web;
    return {
      ...c,
      web: {
        ...web,
        layout: layout
          ? {
              ...layout,
              w: Math.round((layout.w / oldCols) * newCols),
              x: Math.round((layout.x / oldCols) * newCols),
              h: Math.round((layout.h / oldCols) * 24),
              y: Math.round((layout.y / oldCols) * 24),
            }
          : layout,
      },
    };
  });
};

export const insertPortal = url => {
  const theportal = 'www.theportal.cn';

  if (md.global.Account.isPortal && url.includes('embed/')) {
    if (location.hostname === theportal) {
      const parsed = new URL(url);
      parsed.host = theportal;
      parsed.port = location.port;
      parsed.protocol = location.protocol;
      return parsed.toString();
    } else {
      return url.replace(/(\/)embed\//, '$1portal/embed/');
    }
  }

  return url;
};

export const syncThemeConfig = (config, themeMode = window.themeMode || 'light') => {
  if (config.pageStyleType === themeMode) {
    return config;
  } else {
    const { pivoTableColorIndex = 1, titleStyles = defaultTitleStyles } = config;

    if (themeMode === 'light') {
      return {
        ...config,
        pageStyleType: themeMode,
        pageBgColor: config.lightPageBgColor || 'lightColor',
        pivoTableColor: 'lightColor',
        pivoTableColorIndex: pivoTableColorIndex + 1,
        numberChartColor: 'iconColor',
        // numberChartColorIndex: numberChartColorIndex + 1,
        titleStyles: {
          ...titleStyles,
          color: '#151515',
          index: Date.now(),
        },
      };
    }

    if (themeMode === 'dark') {
      return {
        ...config,
        pageStyleType: themeMode,
        pageBgColor: config.darkPageBgColor || 'iconColor10',
        pivoTableColor: 'iconColor',
        pivoTableColorIndex: pivoTableColorIndex + 1,
        numberChartColor: 'lightColor',
        // numberChartColorIndex: numberChartColorIndex + 1,
        titleStyles: {
          ...titleStyles,
          color: '#f2f2f2',
          isInitial: true,
          index: Date.now(),
        },
      };
    }

    return config;
  }
};
