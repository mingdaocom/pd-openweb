import roleAjax from 'src/api/role.js';
import workwxAjax from 'src/api/workWeiXin';

const ONTERGRATION_INFO = {
  1: _l('钉钉'),
  3: _l('企业微信'),
  4: 'Welink',
  6: _l('飞书'),
};

// 开启|关闭集成状态失败时action
export const integrationFailed = projectId => {
  roleAjax
    .getProjectPermissionsByUser({
      projectId,
    })
    .then(({ projectIntergrationType }) => {
      if (_.includes([1, 3, 4, 6], projectIntergrationType)) {
        alert(_l('操作失败，已启用“%0”集成', ONTERGRATION_INFO[projectIntergrationType]), 2);
      } else {
        alert(_l('操作失败'), 2);
      }
    });
};

export const checkClearIntergrationData = projectId => {
  return workwxAjax.checkClearIntergrationData({
    projectId,
  });
};
