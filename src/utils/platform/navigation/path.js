import _ from 'lodash';
import qs from 'query-string';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getAppFeaturesPath } from 'src/utils/platform/navigation/query';

/**
 * 深拷贝路由配置并为每项路径补充当前部署子路径。
 */
export function addSubPathOfRoutes(routes) {
  if (!getCurrentSubPath()) {
    return routes;
  }

  const newRoutes = _.cloneDeep(routes);

  Object.keys(newRoutes).forEach(key => {
    newRoutes[key].path = addSubPathOfRoute(newRoutes[key].path);
  });

  return newRoutes;
}

/**
 * 读取标准或自定义全局变量中的当前部署子路径。
 */
export const getCurrentSubPath = () => window.subPath || window.__customSubPath__ || '';

const hasSubPath = (route, subPath) =>
  !!subPath && (route === subPath || route.startsWith(`${subPath}/`) || route.startsWith(`${subPath}?`));

/**
 * 为站内路径补充指定或当前部署子路径，已包含子路径时保持不变。
 */
const getPathWithSubPath = (route, subPath = getCurrentSubPath()) =>
  subPath && !hasSubPath(route, subPath) ? subPath + route : route;

/**
 * 从站内地址中移除当前部署子路径，同时保留查询与哈希部分。
 */
export function getPathWithoutSubPath(url = '', subPath = getCurrentSubPath()) {
  const route = String(url).startsWith(location.origin) ? String(url).slice(location.origin.length) : String(url);
  const pathname = route.split(/(?=[?#])/)[0];

  if (hasSubPath(pathname, subPath)) {
    return (pathname.slice(subPath.length) || '/') + route.slice(pathname.length);
  }

  return route;
}

/**
 * 为单个路由或路由数组补充当前部署子路径，已补全路径保持不变。
 */
export function addSubPathOfRoute(route) {
  const subPath = getCurrentSubPath();

  if (!subPath) {
    return route;
  }

  if (_.isArray(route)) {
    return route.map(addSubPathOfRoute);
  }

  if (hasSubPath(route, subPath)) {
    return route;
  }

  return subPath + route;
}

/**
 * 为站内地址补全子路径、域名和界面参数，并保留公开应用哈希信息。
 */
export const pathCompletion = (url, parameters = { hasDomain: true, localHasDomain: false }) => {
  if (!url || url.startsWith('#') || url.startsWith('http')) return url;

  const { hasDomain, localHasDomain } = parameters;
  const hash = url.split('#')[1] || '';
  const hash2 = url.split('#')[2] || '';
  // 隐藏功能项参数
  const hideOptions = getAppFeaturesPath();
  // AI 实时预览（src/components/Agent/AppBuilder/PreviewFrame.jsx）会在 iframe URL 上挂 previewMode=ai，
  // 用于让工作表渲染层在 views 暂时为空时给出伪「全部」视图。navigateTo / pathCompletion
  // 默认会重写 query 丢掉非白名单参数（如 AppPkgHeader.completePara 跳 ?flag=Date.now()），
  // 所以这里跟 hideOptions 一样把 previewMode 透传，确保它在 iframe 路由跳转后依然保留。
  const currentPreviewMode = qs.parse(location.search.substr(1)).previewMode;
  const previewModeOption = currentPreviewMode === 'ai' ? 'previewMode=ai' : '';

  url = url.split('#')[0];

  // 外部门户自定义域名后缀：PC 用 /suffix 路径，移动端用 /app/appId 路径
  const { isPortal, addressSuffix, appId } = _.get(window.md, 'global.Account') || {};

  if (isPortal && addressSuffix) {
    const isMobile = browserIsMobile();

    if (!isMobile && url.includes('/app/') && !url.includes(`/${addressSuffix}`)) {
      url = url.replace(/\/app\/.*?(\/.*)?$/, `/${addressSuffix}$1`);
    } else if (isMobile && appId && addressSuffix && url.includes(`/${addressSuffix}`)) {
      url = url.replace(`/${addressSuffix}`, `/app/${appId}`);
    }
  }

  // 隐藏功能项补充
  if (hideOptions && url.indexOf(hideOptions) < 0) {
    url = url + (url.indexOf('?') > -1 ? '&' : '?') + hideOptions;
  }

  if (previewModeOption && url.indexOf(previewModeOption) < 0) {
    url = url + (url.indexOf('?') > -1 ? '&' : '?') + previewModeOption;
  }

  const shouldCompleteDomain = hasDomain && (!location.origin.includes('localhost:') || localHasDomain) && !isPortal;

  if (shouldCompleteDomain) {
    url = location.origin + getPathWithSubPath(url);
  } else {
    url = getPathWithSubPath(url);
  }

  // 只替换路径中多余的 //，保留协议部分的 ://
  url = url.replace(/(^|[^:])\/(?=\/)/g, '$1');

  if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
    url = url + '#publicapp' + window.publicAppAuthorization + (hash2 ? `#${hash2}` : ``);
    return url;
  }

  return url + (hash ? `#${hash}` : '');
};

/**
 * 把地址的域名换成主站域名（md.global.Config.WebUrl），路径保持原样。
 * 分享页等入口会部署在独立的分享域名上，那里没有主站登录态，需要登录态的跳转必须回主站域名。
 */
export const toMainSiteUrl = url => {
  const webUrl = _.get(md, 'global.Config.WebUrl');

  return url && webUrl ? url.replace(/^https?:\/\/[^/]+/, new URL(webUrl).origin) : url;
};

/**
 * 根据账户站点配置生成个人设置页面地址及可选查询参数。
 */
export const getAccountPersonalUrl = (query = '') => {
  // AccountWebUrl 末尾可能带 / 也可能不带，统一去尾斜杠再补 /，避免拼成 xxxpersonal
  const baseUrl = (_.get(md, 'global.Config.AccountWebUrl') || '').replace(/\/$/, '');
  const url = baseUrl ? `${baseUrl}/personal` : 'personal';

  return query ? `${url}?${query}` : url;
};
