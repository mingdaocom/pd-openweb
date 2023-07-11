import store from 'redux/configureStore';
import sheetApi from 'src/api/worksheet';
import homeAppApi from 'src/api/homeApp';
import appManagementApi from 'src/api/appManagement';
import webCache from 'src/api/webCache';
import update from 'immutability-helper';
import { pick } from 'lodash';
import { navigateTo } from 'src/router/navigateTo';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import { updateIsCharge, updateAppPkgData } from 'worksheet/redux/actions';
import { updateAppGroup } from 'src/pages/PageHeader/redux/action';
import { updateWorksheetInfo } from 'src/pages/worksheet/redux/actions/index';
import { updatePageInfo, updateEditPageVisible } from 'src/pages/customPage/redux/action';
import { getCustomWidgetUri } from 'src/pages/worksheet/constants/common';
import { getSheetListFirstId, moveSheetCache } from 'worksheet/util';
import { getAppSectionData } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import moment from 'moment';

export const formatLeftSectionDetail = data => {
  return data.workSheetInfo.map(s => {
    const result = { ...s };
    if (s.type === 2) {
      const { workSheetInfo = [], appSectionId } = _.find(data.childSections, { appSectionId: s.workSheetId }) || {};
      result.items = workSheetInfo.map(item => {
        item.parentGroupId = appSectionId;
        return item;
      });
    }
    return result;
  });
};

let getAppSectionDetailRequest;

export function getSheetList(args) {
  return function (dispatch, getState) {
    dispatch({ type: 'SHEET_LIST_UPDATE_LOADING', loading: true });
    dispatch({ type: 'SHEET_LIST', data: [] });
    if (getAppSectionDetailRequest) {
      try {
        getAppSectionDetailRequest.abort();
      } catch (err) { }
    }
    getAppSectionDetailRequest = homeAppApi.getAppSectionDetail(args);
    getAppSectionDetailRequest.then(data => {
      dispatch({ type: 'SHEET_LIST_UPDATE_LOADING', loading: false });
      if (_.isEmpty(data)) {
        dispatch({ type: 'WORKSHEET_APP_SECTION_FAILURE' });
        return;
      }
      const isCharge = canEditApp(data.appRoleType, data.isLock);
      const list = formatLeftSectionDetail(data);
      if (data.workSheetInfo.length) {
        dispatch({
          type: 'SHEET_LIST',
          data: list,
        });
      }
      const { worksheetId } = getState().sheet.base;
      const { currentPcNaviStyle } = store.getState().appPkg;
      const sheetInfo = _.find(data.workSheetInfo, { workSheetId: worksheetId }) || {};
      const maturityTime = moment(md.global.Account.createTime).add(7, 'days').format('YYYY-MM-DD');
      const isMaturity = moment().isBefore(maturityTime);
      if (isCharge && isMaturity && sheetInfo.type === 0 && currentPcNaviStyle === 0) {
        dispatch(updateGuidanceVisible());
      }
      if (currentPcNaviStyle === 1) {
        const { appSectionDetail } = store.getState().sheetList;
        const { appSectionId } = data;
        const res = appSectionDetail.map(data => {
          if (data.workSheetId === appSectionId) {
            return {
              ...data,
              items: list,
            };
          } else {
            return data;
          }
        });
        store.dispatch(updateALLSheetList(res));
      }
    });
  };
}

export function refreshSheetList() {
  return function (dispatch, getState) {
    const { appId, groupId } = getState().sheet.base;
    homeAppApi
      .getAppSectionDetail({
        appId,
        appSectionId: groupId,
      })
      .then(data => {
        if (data.workSheetInfo.length) {
          dispatch({
            type: 'SHEET_LIST',
            data: formatLeftSectionDetail(data),
          });
        }
      });
  };
}

export function getAllAppSectionDetail(appId, callBack) {
  return function (dispatch, getState) {
    homeAppApi.getAppInfo({ appId }).then(result => {
      const { appRoleType, isLock, appSectionDetail = [] } = result;
      const isCharge = canEditApp(appRoleType, isLock);
      dispatch(updateIsCharge(isCharge));
      dispatch(updateAppGroup(appSectionDetail));
      dispatch(updateAppPkgData({appRoleType, isLock}))
      dispatch(
        updateALLSheetList(
          appSectionDetail.map(data => {
            return {
              ...data,
              workSheetId: data.appSectionId,
              workSheetName: data.name,
              type: 2,
              layerIndex: 0,
              items: formatLeftSectionDetail(data),
            };
          }),
        ),
      );
      dispatch(updateSheetListLoading(false));
      callBack && callBack();
    });
  };
}

export function updateSheetListAppItem(id, args) {
  return function (dispatch, getState) {
    const { data } = getState().sheetList;
    const { currentPcNaviStyle } = store.getState().appPkg;
    const update = list => {
      return list.map(item => {
        if (item.workSheetId === id) {
          return {
            ...item,
            ...args,
          };
        } else {
          return {
            ...item,
            items: update(item.items || []),
          };
        }
      });
    };
    const list = update(data);
    dispatch({ type: 'SHEET_LIST', data: list });
  };
}

export function updateSheetList(data) {
  return { type: 'SHEET_LIST', data };
}

export function updateALLSheetList(data) {
  return { type: 'SHEET_ALL_LIST', data };
}

export function addFirstAppSection() {
  return function (dispatch, getState) {
    const { appPkg, sheetList } = getState();
    const appSectionDetail = sheetList.appSectionDetail.map(data => {
      return {
        ...data,
        items: getAppSectionData(data.workSheetId),
      };
    });
    const name = _l('未命名分组');
    if (appSectionDetail.length === 1 && _.isEmpty(appSectionDetail[0].name)) {
      dispatch(updateALLSheetList(appSectionDetail.map(data => Object.assign(data, { edit: true, name }))));
      return;
    }
    homeAppApi
      .addAppSection({
        appId: appPkg.id,
        name,
      })
      .then(result => {
        if (result.data) {
          const res = appSectionDetail.concat({
            name,
            workSheetId: result.data,
            edit: true,
            items: [],
          });
          dispatch(updateALLSheetList(res));
        }
      });
  };
}

export function clearSheetList() {
  return { type: 'SHEET_LIST', data: [] };
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

export function updateAppItemInfo(id, type, name) {
  return function (dispatch, getState) {
    if (type) {
      dispatch(updatePageInfo({ pageName: name }));
    } else {
      dispatch(updateWorksheetInfo({ name }));
    }
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
    const { parentGroupId } = iconArgs;
    if (parentGroupId) {
      args.appSectionId = parentGroupId;
      delete iconArgs.parentGroupId;
    }
    sheetApi.copyWorksheet(args).then(data => {
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
        if (parentGroupId) {
          item.parentGroupId = parentGroupId;
          dispatch({
            type: 'ADD_LEFT_SUB_ITEM',
            data: {
              id: parentGroupId,
              data: item,
            },
          });
        } else {
          dispatch({
            type: 'SHEET_LIST',
            data: update(sheetList, { $push: [item] }),
          });
        }
      } else {
        alert(_l('复制失败'), 2);
      }
    });
  };
}

export function moveSheet(ages) {
  return function (dispatch, getState) {
    const { data: sheetList } = getState().sheetList;
    const { sourceAppId, sourceAppSectionId, ResultAppSectionId } = ages;
    const appItem = ages.workSheetsInfo[0];
    const { workSheetId, parentGroupId } = appItem;
    let newSheetList = null;
    let groupChildren = [];
    if (parentGroupId) {
      ages.sourceAppSectionId = parentGroupId;
      newSheetList = sheetList.map(item => {
        if (item.workSheetId === parentGroupId) {
          item.items = item.items.filter(item => item.workSheetId !== workSheetId);
        }
        return item;
      });
    } else {
      groupChildren = _.get(_.find(sheetList, { workSheetId }), 'items') || [];
      newSheetList = sheetList.filter(item => item.workSheetId !== workSheetId);
    }
    appManagementApi.removeWorkSheetAscription(ages).then(result => {
      if (result) {
        const { sheet, appPkg } = store.getState();
        const { appId, worksheetId: currentSheetId, groupId } = sheet.base;
        const resultAppSection = _.find(newSheetList, { workSheetId: ResultAppSectionId });
        if (resultAppSection) {
          appItem.parentGroupId = resultAppSection.workSheetId;
          resultAppSection.items = resultAppSection.items.concat(appItem);
        }
        if (groupId === ResultAppSectionId) {
          appItem.parentGroupId = undefined;
          newSheetList.push(appItem);
        }
        dispatch({ type: 'SHEET_LIST', data: newSheetList });
        if (workSheetId === currentSheetId || _.find(groupChildren, { workSheetId: currentSheetId })) {
          if (newSheetList.length) {
            const id = getSheetListFirstId(newSheetList);
            navigateTo(`/app/${sourceAppId}/${sourceAppSectionId}/${id || ''}`);
          } else {
            navigateTo(`/app/${sourceAppId}/${sourceAppSectionId}`);
          }
        }
        if (!ResultAppSectionId || appPkg.currentPcNaviStyle === 1) {
          window.updateAppGroups();
        }
        moveSheetCache(appId, sourceAppSectionId);
        alert(_l('移动成功'));
      } else {
        alert(_l('移动失败'), 2);
      }
    });
  };
}

export function deleteSheet({ appId, groupId, worksheetId, projectId, type, parentGroupId }) {
  return function (dispatch, getState) {
    const { data: sheetList } = getState().sheetList;
    const deleteFun = function (data) {
      if (data) {
        let newSheetList = null;
        if (parentGroupId) {
          newSheetList = sheetList.map(item => {
            if (item.workSheetId === parentGroupId) {
              item.items = item.items.filter(item => item.workSheetId !== worksheetId);
            }
            return item;
          });
        } else {
          const items = type === 2 ? _.find(sheetList, { workSheetId: worksheetId }).items || [] : [];
          newSheetList = sheetList.filter(item => item.workSheetId !== worksheetId);
          newSheetList = newSheetList.concat(items.map(data => ({ ...data, parentGroupId: undefined })));
        }
        dispatch({ type: 'SHEET_LIST', data: newSheetList });
        const { worksheetId: currentSheetId } = store.getState().sheet.base;
        if (worksheetId === currentSheetId) {
          if (newSheetList.length) {
            const id = getSheetListFirstId(newSheetList);
            navigateTo(`/app/${appId}/${groupId}/${id || ''}`);
          } else {
            navigateTo(`/app/${appId}/${groupId}`);
          }
        }
        alert(_l('删除成功'));
      } else {
        alert(_l('操作失败，请稍后重试'), 2);
      }
    };
    if (type === 2) {
      homeAppApi
        .deleteAppSection({
          appId,
          appSectionId: worksheetId,
        })
        .then(data => {
          if (data.code === 1) {
            deleteFun(data);
          }
        });
    } else {
      appManagementApi
        .removeWorkSheetForApp({
          appId,
          projectId,
          type,
          isPermanentlyDelete: false,
          appSectionId: parentGroupId || groupId,
          workSheetId: worksheetId,
        })
        .then(data => {
          if (data) {
            moveSheetCache(appId, groupId);
            deleteFun(data);
          }
        });
    }
  };
}

export function sortSheetList(appId, appSectionId, sheetList) {
  return function (dispatch, getState) {
    dispatch({ type: 'SHEET_LIST', data: sheetList });
    homeAppApi
      .updateSectionChildSort({
        appId,
        appSectionId,
        workSheetIds: sheetList.filter(_.identity).map(item => item.workSheetId),
      })
      .then(result => { });
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
        .then(result => { });
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
    const { appId, appSectionId, firstGroupId, name, projectId, type } = args;
    appManagementApi
      .addWorkSheet({
        ...args,
        icon: type === 0 ? 'table' : 'dashboard',
      })
      .then(result => {
        const { pageId, workSheetId, templateId } = result;
        if (type === 1 && pageId) {
          cb(result);
          const data = {
            workSheetName: args.name,
            workSheetId: pageId,
            navigateHide: false,
            status: 1,
            ...pick(args, ['icon', 'iconColor', 'iconUrl', 'type', 'configuration', 'urlTemplate', 'createType']),
          };
          if (firstGroupId) {
            data.parentGroupId = args.appSectionId;
            dispatch({
              type: 'ADD_LEFT_SUB_ITEM',
              data: {
                id: appSectionId,
                data,
              },
            });
          } else {
            dispatch({
              type: 'ADD_LEFT_ITEM',
              data: data,
            });
          }
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
              appSectionId: firstGroupId || appSectionId, // 二级分组创建应用项时，回跳还是用一级分组id
            },
          });
        } else {
          alert(_l('创建工作表失败'), 2);
          cb && cb(result);
        }
      })
      .fail(result => {
        cb && cb();
      });
  };
}

export function addAppSection(args, cb) {
  return function (dispatch, getState) {
    const { appId, groupId } = args;
    const name = _l('未命名分组');
    const icon = '8_4_folder';
    const iconUrl = `${md.global.FileStoreConfig.pubHost}customIcon/${icon}.svg`;
    homeAppApi
      .addAppSection({
        appId,
        name,
        icon,
        parentId: groupId,
        rootId: groupId,
      })
      .then(result => {
        if (result.data) {
          dispatch({
            type: 'ADD_LEFT_ITEM',
            data: {
              workSheetName: name,
              workSheetId: result.data,
              navigateHide: false,
              status: 1,
              type: 2,
              icon,
              iconUrl,
              items: [],
              edit: true,
            },
          });
        }
      });
  };
}

let pending = false;
export function createAppItem(args) {
  return function (dispatch, getState) {
    let { appId, firstGroupId, groupId, type, name, configuration, urlTemplate } = args;

    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }

    const { iconColor, projectId } = store.getState().appPkg;
    const enumType = type === 'worksheet' ? 0 : 1;
    const icon = type === 'customPage' ? 'dashboard' : 'table';
    const iconUrl = `${md.global.FileStoreConfig.pubHost}customIcon/${icon}.svg`;
    const createArgs = {
      appId,
      appSectionId: groupId,
      firstGroupId,
      name,
      iconColor,
      projectId,
      icon,
      iconUrl,
      type: enumType,
      configuration,
      urlTemplate,
      createType: enumType === 1 ? (urlTemplate ? 1 : 0) : undefined
    };
    const callBack = res => {
      pending = false;
      const { pageId } = res;
      if (type === 'customPage') {
        navigateTo(`/app/${appId}/${firstGroupId || groupId}/${pageId}`);
        store.dispatch(updatePageInfo({ pageName: name, pageId }));
        if (!urlTemplate) {
          store.dispatch(updateEditPageVisible(true));
        }
      }
    };
    pending = true;
    dispatch(addWorkSheet(createArgs, callBack));
  };
}

// 复制自定义页面
export function copyCustomPage(para, externalLink) {
  return function (dispatch, getState) {
    const { sheetList } = getState();
    const { parentGroupId } = para;
    if (parentGroupId) {
      para.appSectionId = parentGroupId;
      delete para.parentGroupId;
    }
    appManagementApi.copyCustomPage(para).then(data => {
      if (data) {
        alert(_l('复制成功'));
        const item = {
          workSheetId: data,
          workSheetName: para.name,
          type: 1,
          status: 1,
          icon: para.icon || '1_0_home',
          iconColor: para.iconColor || '#616161',
          iconUrl: para.iconUrl,
          ...externalLink
        };
        if (parentGroupId) {
          item.parentGroupId = parentGroupId;
          dispatch({
            type: 'ADD_LEFT_SUB_ITEM',
            data: {
              id: parentGroupId,
              data: item,
            },
          });
        } else {
          dispatch({
            type: 'ADD_LEFT_ITEM',
            data: item,
          });
        }
      } else {
        alert(_l('复制失败'), 2);
      }
    });
  };
}

export const updateSheetListLoading = loading => ({ type: 'SHEET_LIST_UPDATE_LOADING', loading });
