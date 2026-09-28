import _ from 'lodash';
import homeAppApi from 'src/api/homeApp';
import sheetAjax from 'src/api/worksheet';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { pathCompletion } from 'src/utils/platform/navigation/path';

/** 读取字段编辑页当前查询参数并转换为普通对象。 */
export const getUrlPara = () => {
  const search = new URLSearchParams(location.search);
  const para = {};

  for (var [key, value] of search) {
    para[key] = value;
  }

  return para;
};

/** 打开字段编辑页，并保持新窗口或站内跳转的原有行为。 */
export const toEditWidgetPage = (paras, isOpenNew = true) => {
  let url = '/worksheet/field/edit';

  const searchPara = Object.keys(paras).reduce((prev, key) => {
    return (prev += `${prev ? '&' : ''}${key}=${encodeURIComponent(paras[key])}`);
  }, '');

  url = searchPara ? `${url}?${searchPara}` : url;

  if (isOpenNew) {
    window.open(pathCompletion(url));
  } else {
    navigateTo(url);
  }
};

/** 从字段编辑页返回来源页或当前工作表主页。 */
export const returnMasterPage = globalSheetInfo => {
  setTimeout(() => {
    const { fromURL } = getUrlPara();

    if (fromURL === 'newPage') {
      window.close();
      return;
    }

    if (fromURL) {
      navigateTo(decodeURIComponent(fromURL));
      return;
    }

    if (globalSheetInfo) {
      const { appId, groupId, worksheetId } = globalSheetInfo;

      if (!appId) {
        navigateTo(`/app`);
      } else {
        navigateTo(`/app/${appId}/${groupId}/${worksheetId}`);
      }
    }
  }, 300);
};

/** 查询工作表所属应用后跳转到该工作表最近使用的视图。 */
export function navigateToApp(worksheetId) {
  sheetAjax.getWorksheetInfo({ worksheetId }).then(data => {
    const storage = safeParse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${data.appId}`));
    const viewId =
      (
        _.find(
          _.get(storage, 'worksheets') || [],
          item => item.groupId === data.groupId && item.worksheetId === data.worksheetId,
        ) || {}
      ).viewId || '';

    navigateTo(`/app/${data.appId}/${data.groupId}/${data.worksheetId}/${viewId}`);
  });
}

/** 查询视图所属应用并在新窗口打开该视图。 */
export const navigateToView = (worksheetId, viewId) => {
  homeAppApi.getAppSimpleInfo({ worksheetId }).then(data => {
    const { appId, appSectionId } = data;
    window.open(pathCompletion(`/app/${appId}/${appSectionId}/${worksheetId}/${viewId}`));
  });
};
