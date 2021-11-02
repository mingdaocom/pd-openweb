import styled from 'styled-components';
import { MAX_REPORT_COUNT, COLUMN_HEIGHT } from './config';
import maxBy from 'lodash/maxBy';
import { widgets } from './enum';
import { get } from 'lodash';

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
`;

const enumObj = obj => {
  _.keys(obj).forEach(key => (obj[obj[key]] = key));
  return obj;
};

export const enumWidgetType = enumObj({ analysis: 1, richText: 2, embedUrl: 3, button: 4 });

export const getEnumType = type => (typeof type === 'number' ? enumWidgetType[type] : type);
export const getIndexById = ({ component, components }) => {
  const id = component.id || component.uuid;
  return _.findIndex(components, item => item.id === id || item.uuid === id);
};
export const getDefaultLayout = ({ components = [], index = components.length, layoutType = 'web', titleVisible }) => {
  if (layoutType === 'web') return { x: (components.length * 6) % 12, y: Infinity, w: 6, h: 6, minW: 2, minH: 2 };
  if (layoutType === 'mobile') {
    const { type } = _.pick(components[index], 'type');
    const { y = 0, h = 6 } = maxBy(components, item => get(item, ['mobile', 'layout', 'y'])) || {};
    const enumType = getEnumType(type);
    const minW = _.includes(['button'], enumType) ? 2 : 1;
    return { x: 0, y: y + h, w: 2, h: titleVisible ? 7 : 6, minW, minH: 2 };
  }
};

// export const formatComponents = components => components.map(item => ({ ...item, layout: JSON.parse(item.layout || '{}') }));

export const reportCount = (components = []) => components.filter(item => item.type === 1 || item.type === 'analysis').length;

export const reportCountLimit = components => {
  // if (reportCount(components) >= MAX_REPORT_COUNT) {
  //   alert(_l('自定义页面最多只能添加%0个统计报表', MAX_REPORT_COUNT));
  //   return false;
  // }
  return true;
};

export const getIconByType = type => {
  return _.get(widgets[getEnumType(type)], 'icon');
};

const htmlReg = /<.+?>/g;
export const getComponentTitleText = component => {
  const { value, type, name, button } = component;
  const enumType = getEnumType(type);
  if (enumType === 'analysis') return name || _l('未命名图表');
  if (enumType === 'richText') return value.replace(htmlReg, '');
  if (enumType === 'button') return _.get(button, ['buttonList', '0', 'name']);
  if (_.includes(['embedUrl'], enumType)) return value;
  return value;
};

export const reorderComponents = components => {
  if (_.every(components, item => _.get(item, ['mobile', 'layout']))) return false;

  // 先按y的从小到大排序 再按x的从小到大排序
  const groups = _.groupBy(components, item => _.get(item, ['web', 'layout', 'y']));

  return _.flattenDeep(
    _.sortBy(_.keys(groups), item => +item).map(key => {
      const group = groups[key];
      return _.sortBy(group, item => _.get(item, ['web', 'layout', 'x']));
    }),
  );
};

export const computeWidth = ({ width, count, margin = 20 }) => {
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
