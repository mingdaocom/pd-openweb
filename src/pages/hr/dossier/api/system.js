import ajax from './ajax';

/**
 * 获取档案权限 (现在暂时只需要 验证返回值中的 admin(是否是管理员就行了))
 */
function getPayAuthorize(args) {
  return ajax.get({
    url: '/system/authorize/getPayAuthorize',
    args,
  });
}

export default {
  getPayAuthorize,
};
