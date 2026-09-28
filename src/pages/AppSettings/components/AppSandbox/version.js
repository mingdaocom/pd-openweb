import { VERSION_STATUS } from 'src/components/AppSandbox/version/constants';
import { getReleaseVersionDefaults } from 'src/components/AppSandbox/version/versionNumber';
import { REVIEW_MODE } from './constants';

/** 未配置或接口返回未知值时，按产品规则回退为管理员审核。 */
export const normalizeReviewMode = result => {
  const reviewMode = result?.data?.reviewMode;

  return Object.values(REVIEW_MODE).includes(reviewMode) ? reviewMode : REVIEW_MODE.ADMIN;
};

/**
 * 创建发布表单需要的最小草稿。
 * 有历史版本时以列表最新版本作为不可相等的下限，并默认将修订号加 1；无数据时需大于 0.0.0，默认为 0.0.1。
 */
export const createReleaseDraft = ({ contrastId = '', changes = {}, minimumVersion = '' } = {}) => {
  const versionDefaults = getReleaseVersionDefaults(minimumVersion);

  return {
    contrastId,
    ...versionDefaults,
    status: VERSION_STATUS.PENDING_APPROVAL,
    description: '',
    changes,
  };
};
