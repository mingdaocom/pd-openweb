import { getWorksheetShareUrl, updateWorksheetRowShareRange, updateWorksheetShareRange } from 'src/api/worksheet';
import { getNewRecordPageUrl } from 'worksheet/util';
import { updatePublicWorksheetState } from 'src/api/publicWorksheet';
import { getEntityShare, editEntityShareStatus } from 'src/api/appManagement';
import { getRecordLandUrl } from 'src/pages/worksheet/common/recordInfo/crtl';

/**
 * 记录详情 recordInfo [ok]
 * 新建记录 newRecord [ok]
 * 视图 view [OK]
 * 自定义页面 customPage [OK]
 * 统计图 report [OK]
 */

// TODO 更新回调

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
  }
  return url;
}

export async function getPublicShare(args) {
  const { from } = args;
  let url, res;
  if (args.isPublic === false) {
    return;
  }
  switch (from) {
    case 'recordInfo':
      url = await getWorksheetShareUrl({
        appId: args.appId,
        worksheetId: args.worksheetId,
        viewId: args.viewId,
        rowId: args.rowId,
        objectType: 2,
      });
      break;
    case 'view':
      url = await getWorksheetShareUrl({
        appId: args.appId,
        worksheetId: args.worksheetId,
        viewId: args.viewId,
        objectType: 1,
      });
      break;
    case 'customPage':
    case 'report':
      res = await getEntityShare({
        sourceId: args.sourceId,
        sourceType: from === 'report' ? 31 : 21,
      });
      url = res.url;
      break;
  }
  return url;
}

export async function updatePublicShareStatus(args) {
  const { from, isPublic, onUpdate } = args;
  let url, res;
  switch (from) {
    case 'recordInfo':
      await updateWorksheetRowShareRange({
        worksheetId: args.worksheetId,
        rowId: args.rowId,
        shareRange: isPublic ? 2 : 1,
      });
      if (isPublic) {
        url = await getWorksheetShareUrl({
          worksheetId: args.worksheetId,
          rowId: args.rowId,
          objectType: 2,
        });
      }
      break;
    case 'newRecord':
      res = await updatePublicWorksheetState({
        worksheetId: args.worksheetId,
        visibleType: isPublic ? 2 : 1,
      });
      if (isPublic) {
        url = res.url;
      }
      break;
    case 'view':
      res = await updateWorksheetShareRange({
        worksheetId: args.worksheetId,
        viewId: args.viewId,
        shareRange: isPublic ? 2 : 1,
      });
      if (isPublic) {
        url = await getWorksheetShareUrl({
          appId: args.appId,
          worksheetId: args.worksheetId,
          viewId: args.viewId,
          objectType: 1,
        });
      }
      onUpdate({ shareRange: isPublic ? 2 : 1 });
      break;
    case 'customPage':
    case 'report':
      res = await editEntityShareStatus({
        sourceId: args.sourceId,
        sourceType: from === 'report' ? 31 : 21,
        status: isPublic ? 1 : 0,
      });
      if (isPublic) {
        url = res.appEntityShare.url;
      }
      break;
  }
  return url;
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
