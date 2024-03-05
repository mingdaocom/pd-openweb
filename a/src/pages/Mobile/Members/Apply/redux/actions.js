import ajaxRequest from 'src/api/appManagement';
import { Modal, Toast } from 'antd-mobile';

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
      Toast.info(_l('操作成功'));
      dispath(getAppApplyInfo({
        appId: params.appId,
      }));
    } else {
      Modal.alert(
        _l('失败'),
        '',
        [{
          text: _l('确定'),
          onPress: () => {},
        }]);
    }
  });
};
