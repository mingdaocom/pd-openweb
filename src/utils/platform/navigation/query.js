import _ from 'lodash';
import qs from 'query-string';
import { getRequest } from 'src/utils/platform/browser/device';

/**
 * 将当前地址查询参数合并进请求参数，并保留调用方默认值。
 */
export const getFilledRequestParams = (params, defaultRequestParams = {}) => {
  const request = getRequest();
  const requestParams = _.isObject(params.requestParams) ? { ...params.requestParams } : {};

  if (_.isEmpty(request)) {
    return params;
  }

  Object.keys(request).forEach(key => {
    if (_.isArray(request[key])) {
      requestParams[key.trim()] = request[key][request[key].length - 1];
    } else if (request[key] !== null) {
      requestParams[key.trim()] = request[key];
    }
  });

  return { ...params, requestParams: { ...defaultRequestParams, ...requestParams } };
};

/**
 * 将地址栏的功能隐藏参数解析为各应用界面模块的可见状态。
 */
export const getAppFeaturesVisible = () => {
  const { s, tb, tr, ln, rp, td, ss, ac, ch } = qs.parse(location.search.substr(1));

  return {
    s: s !== 'no', // 回首页按钮
    tb: tb !== 'no', // 应用分组
    tr: tr !== 'no', // 导航右侧内容（应用扩展信息）
    ln: ln !== 'no', // 左侧导航
    rp: rp !== 'no', // chart
    td: td !== 'no', // 待办
    ss: ss !== 'no', // 超级搜索
    ac: ac !== 'no', // 账户
    ch: ch !== 'no', // 消息侧边栏
  };
};

/**
 * 将当前应用界面隐藏状态序列化为可透传的查询参数。
 */
export const getAppFeaturesPath = () => {
  const { s, tb, tr, ln, rp, td, ss, ac, ch } = getAppFeaturesVisible();

  return [
    s ? '' : 's=no',
    tb ? '' : 'tb=no',
    tr ? '' : 'tr=no',
    ln ? '' : 'ln=no',
    rp ? '' : 'rp=no',
    td ? '' : 'td=no',
    ss ? '' : 'ss=no',
    ac ? '' : 'ac=no',
    ch ? '' : 'ch=no',
  ]
    .filter(o => o)
    .join('&');
};
