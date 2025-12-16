import _ from 'lodash';

export const getValue = value => (_.isUndefined(value) || _.isNaN(value) ? '-' : value);

export const formatValue = num => {
  return _.isNumber(num) ? (num + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,') : '-';
};

const pow1024 = num => Math.pow(1024, num);

const roundFun = (value, n) => {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
};

export const formatFileSize = size => {
  if (!size) return 0 + ' MB';
  if (size < pow1024(3)) return roundFun(size / pow1024(2), 3) + ' MB';
  if (size < pow1024(4)) return roundFun(size / pow1024(3), 3) + ' GB';
  return roundFun(size / pow1024(4), 3) + ' TB';
};
