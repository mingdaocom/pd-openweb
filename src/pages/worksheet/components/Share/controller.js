import _ from 'lodash';
import appManagementAjax from 'src/api/appManagement';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import worksheetAjax from 'src/api/worksheet';
import { getNewRecordPageUrl } from 'src/utils/domain/worksheet/record';
import { pathCompletion, toMainSiteUrl } from 'src/utils/platform/navigation/path';
import { getRecordLandUrl } from 'src/utils/services/worksheet/record';

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
  aiAction: 72,
  mingoHelp: 73,
  // New Mingo 会话分享：复用应用实体分享（MingoHistory=73），sourceId 为 agent 侧返回的 shareId
  mingoHistory: 73,
};

// 分享可见范围（主站 appentityshare.scope）：0 = 全部（获得链接的所有人），1 = 本网络（仅组织内成员登录后可访问）。
// 支持范围选择的分享（见 Share 的 supportProjectScope）在开启 / 切换时把它连同 shareProjectId 一起提交。
export const SHARE_SCOPE = { PUBLIC: 0, PROJECT: 1 };

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
      url = pathCompletion(`/embed/view/${args.appId}/${args.worksheetId}/${args.viewId}`);
      break;
    case 'customPage':
      url = pathCompletion(`/embed/page/${args.appId}/${args.sourceId}`);
      break;
    case 'report':
      url = pathCompletion(`/embed/chart/${args.appId}/${args.sourceId}?pageId=${args.pageId || ''}`);
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

  // 锚点不固定的分享（如 Mingo 会话勾选若干条消息的选择性分享）每次都是新的一条，
  // 没有「这个来源分享过没」可查，调用方置 disableShareQuery 直接按未分享处理
  if (args.disableShareQuery) {
    return {};
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
    case 'aiAction':
    case 'mingoHelp':
    case 'mingoHistory':
      res = await appManagementAjax.getEntityShare({
        appId: args.appId,
        sourceId: args.sourceId,
        sourceType: SHARE_SOURCE_TYPE[from],
      });
      // 组织内分享靠主站登录态 + 组织成员身份过闸，而后端下发的链接在独立的分享域名上（那里没有登录态），
      // 这里只把域名换成主站的，路径保持原样
      res.shareLink = res.scope === SHARE_SCOPE.PROJECT ? toMainSiteUrl(res.url) : res.url;
      break;
  }

  if (from === 'mingoHelp') {
    res.shareLink = res.shareLink ? `${res.shareLink}&help=true` : undefined;
  }

  return res;
}

export async function updatePublicShareStatus(args) {
  const { from, isPublic, onUpdate, validTime, password, pageTitle } = args;
  let res;

  // 有的分享（如 Mingo 会话）要先在业务侧创建分享实体，再把它返回的 id 当 SourceId 登记进主站换链接，
  // 两步顺序不能反。调用方通过 params.createShareSource 提供第一步，这里只负责在开启时调用它。
  // 已开启的分享改标题 / 有效期 / 密码时锚点不变，调用方置 reuseShareSource 沿用当前 sourceId；
  // 否则每改一次都会新建一条分享实体（选择性分享的 shareId 是随机串，链接会随之变化，配置也落到了新实体上）。
  const sourceId =
    isPublic && !args.reuseShareSource && _.isFunction(args.createShareSource)
      ? await args.createShareSource({ scope: args.scope, projectId: args.projectId })
      : args.sourceId;
  // 支持可见范围的分享额外提交 scope + shareProjectId（仅本网络范围需要目标组织）
  const scopeArgs = _.isUndefined(args.scope)
    ? {}
    : { scope: args.scope, shareProjectId: args.scope === SHARE_SCOPE.PROJECT ? args.projectId : undefined };

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
    case 'aiAction':
    case 'mingoHelp':
    case 'mingoHistory':
      res = await appManagementAjax.editEntityShareStatus({
        appId: args.appId,
        sourceId,
        sourceType: SHARE_SOURCE_TYPE[from],
        status: isPublic ? 1 : 0,
        validTime,
        password,
        pageTitle,
        ...scopeArgs,
      });
      if (isPublic) {
        const url = res.appEntityShare.url;

        // 与 getPublicShare 同一口径：本次提交的就是组织内分享时，链接改挂主站域名
        res.shareLink = args.scope === SHARE_SCOPE.PROJECT ? toMainSiteUrl(url) : url;
        // 本次登记用的锚点：业务侧生成来源 id 时它与 params.sourceId 不同，回传给调用方，
        // 后续改标题 / 有效期 / 密码复用它
        res.shareSourceId = sourceId;
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
