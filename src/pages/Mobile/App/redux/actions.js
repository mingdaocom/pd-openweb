import homeAppAjax from 'src/api/homeApp';
import AppManagement from 'src/api/appManagement';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { Modal, Toast } from 'antd-mobile';
import _ from 'lodash';

export const getAppDetail = (appId, cb) => (dispatch, getState) => {
  const params = {
    appId,
  };
  dispatch({
    type: 'MOBILE_FETCH_START',
  });
  Promise.all([
    homeAppAjax.getAppDetail(params).then(),
    homeAppAjax.getAppInfo(params).then(),
    homeAppAjax.checkApp({ appId }, { silent: true }).then(),
    window.isPublicApp ? undefined : instanceVersion.getTodoListFilter({ type: -1 }).then(),
  ]).then(
    result => {
      const [detail, info, status, processTodoList] = result;
      const processData = _.find(processTodoList, { app: { id: appId } });
      dispatch({
        type: 'UPDATE_APP_DETAIL',
        data: {
          appName: detail.name,
          detail: detail,
          appSection: info.appSectionDetail,
          status: status,
          processCount: processData ? processData.count : 0,
        },
      });
      dispatch({
        type: 'MOBILE_FETCH_SUCCESS',
      });
      cb && cb(info);
    },
    () => {
      dispatch({
        type: 'UPDATE_APP_DETAIL',
        data: {
          appName: '',
          detail: [],
          appSection: [],
          status: null,
        },
      });
      dispatch({
        type: 'MOBILE_FETCH_SUCCESS',
      });
    },
  );
};

export const addAppApply =
  ({ appId, projectId }) =>
  (dispatch, getState) => {
    dispatch({
      type: 'MOBILE_ACTION_ING',
    });
    AppManagement.addAppApply({
      appId,
      remark: '',
    }).then(data => {
      dispatch({
        type: 'MOBILE_ACTION_END',
      });
      if (data) {
        Modal.alert(_l('申请已提交'), '', [
          {
            text: _l('确定'),
            onPress: () => {},
          },
        ]);
      }
    });
  };

export const updateAppMark = (appId, projectId, isMarked) => (dispatch, getState) => {
  const { mobile } = getState();
  const { appDetail } = mobile;

  homeAppAjax
    .markApp({
      appId,
      isMark: isMarked,
      projectId,
    })
    .then(result => {
      if (result.data) {
        dispatch({
          type: 'UPDATE_APP_DETAIL',
          data: {
            ...appDetail,
            detail: Object.assign(appDetail.detail, { isMarked }),
          },
        });
        Toast.info(isMarked ? _l('星标成功') : _l('取消星标成功'), 1);
      }
    });
};

export const editAppInfo = (viewHideNavi, callback) => (dispatch, getState) => {
  const { detail } = _.get(getState(), 'mobile.appDetail');
  const params = _.pick(detail, ['projectId', 'iconColor', 'navColor', 'icon', 'description', 'name']);
  homeAppAjax.editAppInfo({ ...params, appId: detail.id, viewHideNavi }).then(res => {
    if (res.data) {
      alert(_l('设置成功'));
      callback();
    } else {
      alert(_l('设置失败'), 2);
    }
  });
};
