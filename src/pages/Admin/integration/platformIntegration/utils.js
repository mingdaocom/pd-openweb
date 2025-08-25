import _ from 'lodash';
import roleAjax from 'src/api/role.js';
import workwxAjax from 'src/api/workWeiXin';
import { checkClearIntegrationDialog } from './components/ClearISaventergrationModal';

const ONTERGRATION_INFO = {
  1: _l('钉钉'),
  3: _l('企业微信'),
  4: 'Welink',
  6: _l('飞书'),
  lark: _l('Lark'),
};

// 开启|关闭集成状态失败时action
export const integrationFailed = projectId => {
  roleAjax
    .getProjectPermissionsByUser({
      projectId,
    })
    .then(({ projectIntergrationType, isLark }) => {
      if (_.includes([1, 3, 4, 6], projectIntergrationType)) {
        alert(_l('操作失败，已启用“%0”集成', ONTERGRATION_INFO[isLark ? 'lark' : projectIntergrationType]), 2);
      } else {
        alert(_l('操作失败'), 2);
      }
    });
};

// 判断是否需要清理集成关系
export const checkClearIntergrationData = ({ projectId, onSave = () => {} }) => {
  return workwxAjax
    .checkClearIntergrationData({
      projectId,
    })
    .then(res => {
      if (res) {
        checkClearIntegrationDialog({
          projectId,
          onSave,
        });
      } else {
        onSave();
      }
    });
};
