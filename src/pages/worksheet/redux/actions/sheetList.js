import store from 'redux/configureStore';
import sheetAjax from 'src/api/worksheet';
import homeAppAjax from 'src/api/homeApp';
import appManagementAjax from 'src/api/appManagement';
import webCache from 'src/api/webCache';
import update from 'immutability-helper';
import { pick } from 'lodash';
import { navigateTo } from 'src/router/navigateTo';
import { isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
import * as sheetActions from 'src/pages/worksheet/redux/actions/index';
import { getCustomWidgetUri } from 'src/pages/worksheet/constants/common';

let getAppSectionDetailRequest;

export function getSheetList(args) {
  return function (dispatch, getState) {
    dispatch({ type: 'SHEET_LIST_UPDATE_LOADING', loading: true });
    dispatch({ type: 'SHEET_LIST', data: [] });
    if (getAppSectionDetailRequest) {
      try {
        getAppSectionDetailRequest.abort();
      } catch (err) {}
    }
    getAppSectionDetailRequest = homeAppAjax.getAppSectionDetail(args);
    getAppSectionDetailRequest.then(data => {
      dispatch({ type: 'SHEET_LIST_UPDATE_LOADING', loading: false });
      if (_.isEmpty(data)) {
        dispatch({ type: 'WORKSHEET_APP_SECTION_FAILURE' });
        return;
      }
      const isCharge = isHaveCharge(data.appRoleType, data.isLock);
      dispatch({ type: 'SHEET_LIST_UPDATE_IS_CHARGE', isCharge });
      if (data.workSheetInfo.length) {
        dispatch({ type: 'SHEET_LIST', data: data.workSheetInfo });
      }
      const { worksheetId } = getState().sheet.base;
      const sheetInfo = _.find(data.workSheetInfo, { workSheetId: worksheetId }) || {};
      const maturityTime = moment(md.global.Account.createTime).add(7, 'days').format('YYYY-MM-DD');
      const isMaturity = moment().isBefore(maturityTime);
      if (isCharge && isMaturity && sheetInfo.type === 0) {
        dispatch(updateGuidanceVisible());
      }
    });
  };
}

export function updateSheetList(id, args) {
  return function (dispatch, getState) {
    const { data } = getState().sheetList;
    const list = data.map(item => {
      if (item.workSheetId === id) {
        return {
          ...item,
          ...args,
        };
      }
      return item;
    });
    dispatch({ type: 'SHEET_LIST', data: list });
  };
}

export function updateSheetIconColor(iconColor) {
  return function (dispatch, getState) {
    const { data } = getState().sheetList;
    const newSheetList = data.map(item => {
      item.iconColor = iconColor;
      return item;
    });
    dispatch({ type: 'SHEET_LIST', data: newSheetList });
  };
}

export function updateSheetListIsUnfold(visible) {
  return function (dispatch, getState) {
    if (visible) {
      dispatch({ type: 'SHEET_LIST_UPDATE_IS_UNFOLD', isUnfold: true });
    } else {
      dispatch({ type: 'SHEET_LIST_UPDATE_IS_UNFOLD', isUnfold: false });
    }
  };
}

export function updateWorksheetInfo(id, data) {
  return function (dispatch, getState) {
    dispatch(sheetActions.updateWorksheetInfo(data));
  };
}

export function copySheet(baseArgs, iconArgs) {
  return function (dispatch, getState) {
    const { projectId } = store.getState().appPkg;
    const args = {
      ...baseArgs,
      chargeId: md.global.Account.accountId,
      projectId,
      isCopyBtnName: true,
      isCopyDesc: true,
      isCopyMember: true,
      isCopyAdmin: true,
      type: 0,
      name: _l('%0-复制', baseArgs.name),
    };
    sheetAjax.copyWorksheet(args).then(data => {
      if (data) {
        alert(_l('复制成功'));
        const item = {
          workSheetId: data,
          workSheetName: args.name,
          type: 0,
          status: 1,
          ...iconArgs,
        };
        const sheetList = getState().sheetList.data;
        dispatch({
          type: 'SHEET_LIST',
          data: update(sheetList, { $push: [item] }),
        });
      } else {
        alert(_l('复制失败'), 2);
      }
    });
  };
}

export function moveSheet(ages) {
  return function (dispatch, getState) {
    const { data: sheetList } = getState().sheetList;
    const { workSheetId } = ages.workSheetsInfo[0];
    const newSheetList = sheetList.filter(item => item.workSheetId !== workSheetId);
    appManagementAjax.removeWorkSheetAscription(ages).then(result => {
      if (result) {
        const { worksheetId: currentSheetId } = getState().sheet.base;
        if (workSheetId === currentSheetId) {
          const { sourceAppId, sourceAppSectionId } = ages;
          if (newSheetList.length) {
            const id = newSheetList[0].workSheetId;
            navigateTo(`/app/${sourceAppId}/${sourceAppSectionId}/${id}`);
          } else {
            navigateTo(`/app/${sourceAppId}/${sourceAppSectionId}`);
          }
        }
        dispatch({ type: 'SHEET_LIST', data: newSheetList });
        alert(_l('移动成功'));
      } else {
        alert(_l('移动失败'), 2);
      }
    });
  };
}

export function deleteSheet({ appId, groupId, worksheetId, type }) {
  return function (dispatch, getState) {
    const { data: sheetList } = getState().sheetList;
    const deleteFun = function (data, type) {
      if (data) {
        const newSheetList = sheetList.filter(item => item.workSheetId !== worksheetId);
        dispatch({ type: 'SHEET_LIST', data: newSheetList });
        const { worksheetId: currentSheetId } = getState().sheet.base;
        if (worksheetId === currentSheetId) {
          if (newSheetList.length) {
            const id = newSheetList[0].workSheetId;
            navigateTo(`/app/${appId}/${groupId}/${id}`);
          } else {
            navigateTo(`/app/${appId}/${groupId}`);
          }
        }
        alert(_l('删除成功'));
      } else {
        alert(_l('操作失败，请稍后重试'), 2);
      }
    };
    appManagementAjax
      .removeWorkSheetForApp({
        appId,
        type,
        appSectionId: groupId,
        workSheetId: worksheetId,
      })
      .then(data => {
        if (data) {
          deleteFun(data, 1);
        }
      });
  };
}

export function sortSheetList(appId, appSectionId, sheetList) {
  return function (dispatch, getState) {
    dispatch({ type: 'SHEET_LIST', data: sheetList });
    homeAppAjax
      .updateSectionChildSort({
        appId,
        appSectionId,
        workSheetIds: sheetList.map(item => item.workSheetId),
      })
      .then(result => {});
  };
}

export function updateGuidanceVisible(visible) {
  return function (dispatch, getState) {
    const key = `${md.global.Account.accountId}-guidanceHide`;
    if (_.isBoolean(visible)) {
      webCache
        .add(
          {
            key,
            value: 'true',
          },
          { silent: true },
        )
        .then(result => {});
      dispatch({
        type: 'GUIDANCE_VISIBLE',
        value: visible,
      });
    } else {
      webCache
        .get({
          key,
        })
        .then(result => {
          if (!result) {
            dispatch({
              type: 'GUIDANCE_VISIBLE',
              value: true,
            });
          }
        });
    }
  };
}

export function addWorkSheet(args, cb) {
  return function (dispatch, getState) {
    const { appId, appSectionId, name, projectId, type } = args;
    appManagementAjax
      .addWorkSheet({
        ...args,
        icon: type === 0 ? '1_0_home' : 'hr_workbench',
      })
      .then(result => {
        const { pageId, workSheetId, templateId } = result;
        if (type === 1 && pageId) {
          cb(result);
          dispatch({
            type: 'ADD_LEFT_ITEM',
            data: {
              workSheetName: args.name,
              workSheetId: pageId,
              ...pick(args, ['icon', 'iconColor', 'iconUrl', 'type']),
            },
          });
          return;
        }
        if (workSheetId) {
          getCustomWidgetUri({
            sourceName: name,
            templateId,
            sourceId: workSheetId,
            projectId,
            appconfig: {
              appId,
              appSectionId,
            },
          });
        } else {
          alert(_l('创建工作表失败'));
          cb && cb(result);
        }
      })
      .fail(result => {
        cb && cb();
      });
  };
}

// 复制自定义页面
export function copyCustomPage(para) {
  return function (dispatch, getState) {
    const { sheetList } = getState();
    appManagementAjax.copyCustomPage(para).then(data => {
      if (data) {
        alert(_l('复制成功'));
        const item = {
          workSheetId: data,
          workSheetName: para.name,
          type: 1,
          status: 1,
          icon: para.icon || 'hr_workbench',
          iconColor: para.iconColor || '#616161',
          iconUrl: para.iconUrl,
        };
        dispatch({
          type: 'ADD_LEFT_ITEM',
          data: item,
        });
      } else {
        alert(_l('复制失败'));
      }
    });
  };
}

export const updateSheetListLoading = loading => ({ type: 'SHEET_LIST_UPDATE_LOADING', loading });
