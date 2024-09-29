import ajaxRequest from 'src/api/appManagement';
import { Dialog } from 'antd-mobile';

export const getAppApplyInfo = ({
  appId,
}) => (dispath) => {
  dispath({
    type: 'APPLY_LIST_START',
  });
  Promise.all([
    ajaxRequest.getAppApplyInfo({
      appId,
    }).then(),
    ajaxRequest.getRolesWithUsers({
      appId,
    }).then(),
  ]).then(
    res => {
      const [applyList, roleList] = res;
      dispath({
        type: 'UPDATE_APPLY_LIST',
        data: {
          applyList,
          roleList,
        },
      });
      dispath({
        type: 'APPLY_LIST_OVER',
      });
    }
  );
};

export const editAppApplyStatus = (params) => (dispath) => {
  ajaxRequest.editAppApplyStatus(params).then(res => {
    if (res) {
      alert(_l('操作成功'));
      dispath(getAppApplyInfo({
        appId: params.appId,
      }));
    } else {
      Dialog.alert({
        content: _l('失败'),
      });
    }
  });
};
