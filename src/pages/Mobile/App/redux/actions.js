import { Dialog } from 'antd-mobile';
import _ from 'lodash';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { getAppLangDetail, getTranslateInfo } from 'src/utils/app';

export const getAppDetail =
  (appId, cb, isPullRefresh = false) =>
  dispatch => {
    if (!isPullRefresh) {
      dispatch({ type: 'MOBILE_FETCH_START' });
    }

    homeAppApi
      .checkApp({ appId }, { silent: true })
      .then(res => {
        if (res === 1) {
          dispatch({ type: 'UPDATE_APP_DETAIL', data: { status: res } });
          dispatch(getApp(appId, cb));
          dispatch(getTodoCount(appId));
        } else {
          dispatch({ type: 'UPDATE_APP_DETAIL', data: { status: res } });
          dispatch({ type: 'MOBILE_FETCH_SUCCESS' });
        }
      })
      .catch(err => {
        dispatch({ type: 'MOBILE_FETCH_SUCCESS' });
      });
  };

const getApp = (appId, cb) => dispatch => {
  homeAppApi
    .getApp({ appId, getSection: true, getLang: true, isMobile: true })
    .then(detail => {
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
      const run = () => {
        dispatch({
          type: 'UPDATE_APP_DETAIL',
          data: {
            appName: getTranslateInfo(appId, null, appId).name || detail.name,
            detail: detail,
            appSection: detail.sections,
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
    })
    .catch(err => {
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
    });
};

const getTodoCount = appId => dispatch => {
  if (window.isPublicApp) return;
  instanceVersion.getTodoListFilter({ type: -1 }).then(processTodoList => {
    const processData = _.find(processTodoList, { app: { id: appId } });
    dispatch({ type: 'UPDATE_APP_DETAIL', data: { processCount: processData ? processData.count : 0 } });
  });
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
            onAction: () => {},
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

export const updateAppScrollY = scrollY => dispatch => {
  dispatch({
    type: 'APP_SCROLL_Y',
    data: scrollY,
  });
};
