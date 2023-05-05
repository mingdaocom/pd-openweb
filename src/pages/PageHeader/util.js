import _ from 'lodash';
// 获取应用id、分组id、工作表id
export const getIds = props => _.get(props, ['match', 'params']);

// 格式化后端传入的数据
export const formatData = data =>
  _.flatten(
    Object.keys(data).map(type => {
      const items = data[type];
      if (_.includes(['validProject'], type)) return items.map(item => ({ type, ...item }));
      if (_.includes(['aloneApps'], type)) return { type, projectApps: items };
      return items.length ? { type, projectApps: items } : null;
    }),
  ).filter(item => !!item);

const isPlainObject = obj => {
  if (typeof obj !== 'object' || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
};

/**
 * 用于shouldComponentUpdate中对象属性比较,以优化性能
 * @param {*} current
 * @param {*} next
 * @param {array} props 要比较的属性值，以数组方式传入,支持递归比较，但须酌情使用，以防比较时间超过重新渲染时间得不偿失
 */
export const compareProps = (current = {}, next = {}, props = Object.keys(current)) => {
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const currentVal = current[prop];
    const nextVal = next[prop];
    if (isPlainObject(currentVal) && isPlainObject(nextVal)) {
      return compareProps(currentVal, nextVal, Object.keys(currentVal));
    }
    if (!Object.is(currentVal, nextVal)) return true;
  }
  return false;
};

export const getItem = key => JSON.parse(localStorage.getItem(key));
export const setItem = (key, value) => safeLocalStorageSetItem(key, JSON.stringify(value));

// 应用的状态
export const getAppStatusText = ({ isGoodsStatus, isNew, fixed }) => {
  if (!isGoodsStatus) return _l('过期');
  if (fixed) return _l('维护中');
  if (isNew) return _l('新 !');
  return null;
};

