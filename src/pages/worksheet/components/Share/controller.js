import _ from 'lodash';
import appManagementAjax from 'src/api/appManagement';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import worksheetAjax from 'src/api/worksheet';
import { getNewRecordPageUrl, getRecordLandUrl } from 'src/utils/record';

/**
 * 记录详情 recordInfo [ok]
 * 新建记录 newRecord [ok]
 * 视图 view [OK]
 * 自定义页面 customPage [OK]
 * 统计图 report [OK]
 */

const SHARE_SOURCE_TYPE = {
  worksheetApi: 45,
  customPage: 21,
  report: 31,
  chatbot: 71,
};

export async function getUrl(args) {
  const { from } = args;
  let url;
  switch (from) {
    case 'recordInfo':
      url = await getRecordLandUrl({
        appId: args.appId,
        recordId: args.rowId,
        viewId: args.viewId,
        worksheetId: args.worksheetId,
      });
      break;
    case 'newRecord':
      url = getNewRecordPageUrl(_.pick(args, ['appId', 'worksheetId', 'viewId']));
      break;
    case 'view':
      url = `${location.origin}/embed/view/${args.appId}/${args.worksheetId}/${args.viewId}`;
      break;
    case 'customPage':
      url = `${location.origin}/embed/page/${args.appId}/${args.sourceId}`;
      break;
    case 'report':
      url = `${location.origin}/embed/chart/${args.appId}/${args.sourceId}?pageId=${args.pageId || ''}`;
      break;
  }
  return url;
}

export async function getPublicShare(args) {
  const { from, validTime, password, pageTitle, isEdit } = args;
  let res;
  if (args.isPublic === false) {
    return;
  }
  switch (from) {
    case 'recordInfo':
      res = await worksheetAjax.getWorksheetShareUrl({
        appId: args.appId,
        worksheetId: args.worksheetId,
        viewId: args.viewId,
        rowId: args.rowId,
        objectType: 2,
        validTime,
        password,
        isEdit,
      });
      break;
    case 'view':
      res = await worksheetAjax.getWorksheetShareUrl({
        appId: args.appId,
        worksheetId: args.worksheetId,
        viewId: args.viewId,
        objectType: 1,
        validTime,
        password,
        isEdit,
        pageTitle,
      });
      break;
    case 'worksheetApi':
    case 'customPage':
    case 'report':
    case 'chatbot':
      res = await appManagementAjax.getEntityShare({
        appId: args.appId,
        sourceId: args.sourceId,
        sourceType: SHARE_SOURCE_TYPE[from],
      });
      res.shareLink = res.url;
      break;
  }
  return res;
}

export async function updatePublicShareStatus(args) {
  const { from, isPublic, onUpdate, validTime, password, pageTitle } = args;
  let res;
  switch (from) {
    case 'recordInfo':
      res = await worksheetAjax.updateWorksheetRowShareRange({
        appId: args.appId,
        worksheetId: args.worksheetId,
        rowId: args.rowId,
        viewId: args.viewId,
        shareRange: isPublic ? 2 : 1,
        objectType: 2,
      });
      res = {
        shareLink: isPublic ? ' ' : undefined,
      };
      break;
    case 'newRecord':
      res = await publicWorksheetAjax.updatePublicWorksheetState({
        worksheetId: args.worksheetId,
        visibleType: isPublic ? 2 : 1,
      });
      if (isPublic) {
        res.shareLink = res.url;
      }
      onUpdate({ visibleType: isPublic ? 2 : 1 });
      break;
    case 'view':
      res = await worksheetAjax.updateWorksheetShareRange({
        appId: args.appId,
        worksheetId: args.worksheetId,
        viewId: args.viewId,
        shareRange: isPublic ? 2 : 1,
        objectType: 1,
      });
      onUpdate({ shareRange: isPublic ? 2 : 1 });
      res = {
        shareLink: isPublic ? ' ' : undefined,
      };
      break;
    case 'worksheetApi':
    case 'customPage':
    case 'report':
    case 'chatbot':
      res = await appManagementAjax.editEntityShareStatus({
        appId: args.appId,
        sourceId: args.sourceId,
        sourceType: SHARE_SOURCE_TYPE[from],
        status: isPublic ? 1 : 0,
        validTime,
        password,
        pageTitle,
      });
      if (isPublic) {
        res.shareLink = res.appEntityShare.url;
      }
      break;
  }
  return res;
}

/**
  分享记录：
  内部分享 参数拼接
  GetWorksheetShareUrl 获取分享链接
  UpdateWorksheetRowShareRange 开启分享

  新建记录分享：
  内部分享 参数拼接
  UpdatePublicWorksheetState 公开发布

  分享视图：
  UpdateWorksheetShareRange 开启分享
  GetWorksheetShareUrl 获取分享链接

  分享自定义页面：
  GetEntityShare 获取嵌入链接
  EditEntityShareStatus 编辑分享状态 获取分享链接

  分享统计图：
  EditEntityShareStatus 编辑分享状态 获取分享链接

 */
