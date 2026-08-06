import { Dialog } from 'antd-mobile';
import ajaxRequest from 'src/api/appManagement';
import { getTranslateInfo } from 'src/utils/app';

export const getAppApplyInfo =
  ({ appId }) =>
  dispath => {
    dispath({
      type: 'APPLY_LIST_START',
    });
    Promise.all([
      ajaxRequest
        .getAppApplyInfo({
          appId,
        })
        .then(),
      ajaxRequest
        .getRolesWithUsers({
          appId,
        })
        .then(),
    ]).then(res => {
      const [applyList, roleList] = res;
      const translatedRoleList = roleList.map(item => ({
        ...item,
        name: getTranslateInfo(appId, null, item.roleId).name || item.name,
      }));

      dispath({
        type: 'UPDATE_APPLY_LIST',
        data: {
          applyList,
          roleList: translatedRoleList,
        },
      });
      dispath({
        type: 'APPLY_LIST_OVER',
      });
    });
  };

export const editAppApplyStatus = params => dispath => {
  ajaxRequest.editAppApplyStatus(params).then(res => {
    if (res) {
      alert(_l('操作成功'));
      dispath(
        getAppApplyInfo({
          appId: params.appId,
        }),
      );
    } else {
      Dialog.alert({
        content: _l('失败'),
      });
    }
  });
};
