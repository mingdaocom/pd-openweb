import homeAppApi from 'src/api/homeApp';
import appManagementApi from 'src/api/appManagement';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { Dialog } from 'antd-mobile';
import { getAppLangDetail, getTranslateInfo } from 'src/util';
import _ from 'lodash';

export const getAppDetail = (appId, cb) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_FETCH_START',
  });
  Promise.all([
    homeAppApi
      .getApp({
        appId,
        getSection: true,
        getLang: true,
        isMobile: true
      })
      .then(),
    homeAppApi.checkApp({ appId }, { silent: true }).then(),
    window.isPublicApp ? undefined : instanceVersion.getTodoListFilter({ type: -1 }).then(),
  ]).then(
    result => {
      let [detail, status, processTodoList] = result;
      const processData = _.find(processTodoList, { app: { id: appId } });
      const appExpandGroupInfo =
        (localStorage.getItem(`appExpandGroupInfo-${detail.id}`) &&
          JSON.parse(localStorage.getItem(`appExpandGroupInfo-${detail.id}`))) ||
        {};
      if (
        detail.appNaviDisplayType !== appExpandGroupInfo.appNaviDisplayType ||
        detail.appNaviStyle !== appExpandGroupInfo.appNaviStyle
      ) {
        localStorage.removeItem(`appExpandGroupInfo-${detail.id}`);
      }
      const { langInfo } = detail;
      const run = () => {
        dispatch({
          type: 'UPDATE_APP_DETAIL',
          data: {
            appName: getTranslateInfo(appId, null, appId).name || detail.name,
            detail: detail,
            appSection: (detail.sections || []).map(v => ({ ...v, name: v.name || _l('未命名分组') })),
            status: status,
            processCount: processData ? processData.count : 0,
          },
        });
        dispatch({
          type: 'MOBILE_FETCH_SUCCESS',
        });
      };
      getAppLangDetail(detail).then(() => {
        run();
      });
      cb && cb(detail);
      dispatch({
        type: 'DEBUG_ROLE_LIST',
        data: (detail.debugRole || {}).selectedRoles || [],
      });
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
    appManagementApi
      .addAppApply({
        appId,
        remark: '',
      })
      .then(data => {
        dispatch({
          type: 'MOBILE_ACTION_END',
        });
        if (data) {
          Dialog.alert({
            content: _l('申请已提交'),
            confirmText: _l('确定'),
            onAction: () => {}
          });
        }
      });
  };

export const updateAppMark = (appId, projectId, isMarked) => (dispatch, getState) => {
  const { mobile } = getState();
  const { appDetail } = mobile;

  homeAppApi
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
        alert(isMarked ? _l('收藏成功') : _l('已取消收藏'));
      }
    });
};

export const editAppInfo = (viewHideNavi, callback) => (dispatch, getState) => {
  const { detail } = _.get(getState(), 'mobile.appDetail');
  const params = _.pick(detail, ['projectId', 'iconColor', 'navColor', 'icon', 'description', 'name']);
  homeAppApi.editAppInfo({ ...params, appId: detail.id, viewHideNavi }).then(res => {
    if (res.data) {
      alert(_l('设置成功'));
      callback();
    } else {
      alert(_l('设置失败'), 2);
    }
  });
};
