import ajax from './ajax';

/**
 * 获取字段值的统计
 */
function getFieldsStatistics(args) {
  return ajax.get({
    url: '/employee/statistics/getFieldsStatistics',
    args,
  });
}

export default {
  getFieldsStatistics,
};
