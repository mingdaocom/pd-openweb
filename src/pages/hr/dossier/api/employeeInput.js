import ajax from './ajax';

/**
 * 下载hr模板
 */

function download(args) {
  return ajax.open('/employee/input/down');
}

/**
 * 獲取模板字段
 */
function getShowFields(args) {
  return ajax.get({
    url: '/employee/input/getShowFields',
    args,
  });
}

export default {
  download,
  getShowFields,
};
