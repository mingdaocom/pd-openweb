/**
 */
export const typeOf = obj => {
  const toString = Object.prototype.toString;
  const map = new Map([
    ['[object Function]', 'function'],
    ['[object Undefined]', 'undefined'],
    ['[object Boolean]', 'boolean'],
    ['[object Number]', 'number'],
    ['[object String]', 'string'],
    ['[object Array]', 'array'],
    ['[object Date]', 'date'],
    ['[object RegExp]', 'regExp'],
    ['[object Null]', 'null'],
    ['[object Object]', 'object'],
    ['[object Symbol]', 'symbol']
  ]);
  return map.get(toString.call(obj));
};

export const get = key => {
  const value = localStorage.getItem(key);
  if (value) {
    try {
      const valueJson = JSON.parse(value);
      return valueJson;
    } catch (e) {
      return value;
    }
  } else {
    return false;
  }
};

export const set = (key, value) => {
  if (['array', 'object'].includes(typeOf(value))) {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  localStorage.setItem(key, value);
};
