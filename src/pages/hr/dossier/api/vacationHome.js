import ajax from './ajax';

/**
 * 假勤卡片接口
 */
function count(args) {
  return ajax.get({
    url: '/vacation/home/count',
    args,
  });
}

export default {
  count,
};
