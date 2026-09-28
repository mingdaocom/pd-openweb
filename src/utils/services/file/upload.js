import kcCtrl from 'src/api/kc';

/**
 * 查询账号存储用量，判断剩余空间是否足以容纳本次上传。
 */
export const checkAccountUploadLimit = (size, params = {}) =>
  kcCtrl.getUsage(params).then(usage => usage.used + size < usage.total);
