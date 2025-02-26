import { MSGTYPES, APPID, SOURCE_TYPE } from './constants';
import { browserIsMobile } from 'src/util';
import { replacePorTalUrl } from 'src/pages/AuthService/portalAccount/util';
import moment from 'moment';
export const formatInboxItem = function (inboxItem) {
  const createUser = inboxItem.CreateUser || {};
  const { accountId, fullname, avatar } = createUser;
  const { discussion } = inboxItem;

  let typeName = '',
    isReply = false;
  const inboxType = parseInt(inboxItem.inboxType, 10);

  switch (inboxType) {
    // 私信 deprecated
    case MSGTYPES.UserMessage:
      typeName = "<span class='Gray_9'>" + _l('对你说') + '</span>';
      break;
    // 各种系统消息
    case MSGTYPES.SystemMessage:
    case MSGTYPES.CalendarMessage:
    case MSGTYPES.TaskMessage:
    case MSGTYPES.FolderMessage:
    case MSGTYPES.KCMessage:
    case MSGTYPES.ApprovalMessage:
    case MSGTYPES.WorkSheetMessage:
    // 工作流消息
    case MSGTYPES.WorkFlowMessage:
    case MSGTYPES.WorkFlowTaskMessage:
    case MSGTYPES.WorkFlowUserTaskMessage:
    case MSGTYPES.WorkFlowSendTaskMessage:
      typeName = '';
      break;
    case MSGTYPES.AttendanceMessage:
      typeName = "<span class='Gray_9'>" + _l('考勤消息') + '</span>';
      break;
    case MSGTYPES.DossierMessage:
      typeName = "<span class='Gray_9'>" + _l('人事消息') + '</span>';
      break;
    // 动态消息
    case MSGTYPES.PostMentionedUser:
      typeName = _l('提到了你');
      break;
    case MSGTYPES.PostMentionedGroup:
      typeName = _l('提到了你所在的群组');
      break;
    case MSGTYPES.PostCommentMentionedUser:
      typeName = _l('在回复中提到了你');
      break;
    case MSGTYPES.PostCommentMentionedGroup:
      typeName = _l('在回复中提到了你所在的群组');
      break;
    case MSGTYPES.PostReply:
      typeName = _l('回复了你');
      break;
    // 任务中心
    case MSGTYPES.TaskComment:
      typeName = _l('发表了任务讨论');
      break;
    case MSGTYPES.TaskMentioned:
      typeName = _l('在任务讨论中提到了你');
      break;
    case MSGTYPES.TaskReply:
      typeName = _l('在任务讨论中回复了你');
      break;
    case MSGTYPES.FolderMentioned:
      typeName = _l('在项目讨论中提到了你');
      break;
    case MSGTYPES.FolderReply:
      typeName = _l('在项目讨论中回复了你');
      break;
    // 日程
    case MSGTYPES.CalendarComment:
      typeName = _l('发表了日程讨论');
      break;
    case MSGTYPES.CalendarMentioned:
      typeName = _l('在日程讨论中提到了你');
      break;
    case MSGTYPES.CalendarReply:
      typeName = _l('在日程讨论中回复了你');
      break;
    // 审批
    case MSGTYPES.ApprovalMentioned:
      typeName = _l('在审批讨论中提到了你');
      break;
    case MSGTYPES.ApprovalReply:
      typeName = _l('在审批讨论中回复了你');
      break;
    case MSGTYPES.ApprovalComment:
      typeName = _l('发表了审批讨论');
      break;
    // 考勤
    case MSGTYPES.CheckMentioned:
      typeName = _l('在考勤讨论中提到了你');
      break;
    case MSGTYPES.CheckReply:
      typeName = _l('在考勤讨论中回复了你');
      break;
    case MSGTYPES.CheckComment:
      typeName = _l('发表了考勤讨论');
      break;
    // 工作表
    case MSGTYPES.WorkSheetReply:
      typeName = _l('在%0讨论中回复了你', discussion.entityName);
      break;
    case MSGTYPES.WorkSheetMentioned:
      typeName = _l('在%0讨论中提到了你', discussion.entityName);
      break;
    case MSGTYPES.WorkSheetComment:
      typeName = _l('发表了%0讨论', discussion.entityName);
      break;
    // 工作表记录
    case MSGTYPES.WorkSheetRowReply:
      typeName = _l('在%0讨论中回复了你', discussion.entityName);
      break;
    case MSGTYPES.WorkSheetRowMentioned:
      typeName = _l('在%0讨论中提到了你', discussion.entityName);
      break;
    case MSGTYPES.WorkSheetRowComment:
      typeName = _l('发表了%0讨论', discussion.entityName);
      break;

    default:
      break;
  }

  return {
    isFavorite: inboxItem.isFavorite,
    typeName: typeName,
    /**
     * user data
     */
    accountId,
    fullname,
    avatar,

    /**
     * avatar data
     */
    inboxType,
    inboxId: inboxItem.inboxId,
  };
};

export const formatTopic = function (item, type) {
  var formatedData = {};
  var User;
  var ReplyUser;
  var isReply;
  var canDelete;
  if (type === SOURCE_TYPE.POST) {
    User = item.user;
    isReply = item.replyID;
    ReplyUser = null;
    if (isReply && item.replyUser) {
      ReplyUser = {
        accountId: item.replyUser.accountId,
        fullname: item.replyUser.userName,
      };
    } else if (isReply && !item.replyUser) {
      ReplyUser = {
        accountId: item.replyAccountId,
        fullname: item.replyUserName,
      };
    }
    canDelete = item.allowOperate === '1' || md.global.Account.accountId === User.accountId;
    formatedData = {
      createAccount: {
        accountId: User.accountId,
        avatar: User.userMiddleHead,
        fullname: User.userName,
        status: item.Secretary ? 2 : 1,
      },
      attachment: item.attachments || [],
      canDelete: canDelete,
      isDeleteAttachment: canDelete && item.askDeleteAttachment === '1',
      isReply: isReply,
      replyAccount: ReplyUser,
      sourceId: item.postID,
      discussionId: item.commentID,
      replyId: item.replyID ? item.replyID : null,
      message: item.message,
      accountsInMessage: item.rUserList,
      groupsInMessage: item.rGroupList,
      createTime: item.createTime,
    };
  } else {
    var topic = item;
    var attachments = topic.attachments;
    User = topic.createAccount;
    isReply = !!topic.replyId;
    canDelete = User.accountId === md.global.Account.accountId;
    formatedData = {
      canDelete: canDelete,
      isDeleteAttachment: canDelete && attachments.length,
      sourceId: item.sourceId,
      name: item.name,
      message: topic.message,
      attachment: attachments,
      createAccount: User,
      replyId: topic.replyId,
      discussionId: topic.discussionId,
      createTime: topic.createTime,
      isReply: isReply,
      replyAccount: isReply ? topic.replyAccount : null,
      accountsInMessage: topic.accountsInMessage,
    };
  }
  return { ...formatedData, sourceType: type };
};

export const splitSourceId = sourceId => {
  let [_sourceId, childId] = sourceId.split('|');
  return {
    sourceId: _sourceId,
    childId,
  };
};

export const buildSourceLink = function (type, _sourceId, _extendsId) {
  var linkUrl = '';
  const { sourceId, childId } = splitSourceId(_sourceId);
  switch (type) {
    case SOURCE_TYPE.POST:
      linkUrl = '/feeddetail?itemID=' + sourceId;
      break;
    case SOURCE_TYPE.TASK:
      linkUrl = '/apps/task/task_' + sourceId;
      break;
    case SOURCE_TYPE.FOLDER:
      linkUrl = '/apps/task/folder_' + sourceId + '#detail';
      break;
    case SOURCE_TYPE.CALENDAR:
      linkUrl =
        '/apps/calendar/detail_' + (childId ? sourceId + '_' + moment(childId).format('YYYYMMDDHHmmss') : sourceId);
      break;
    case SOURCE_TYPE.WORKSHEET:
      linkUrl = '/worksheet/' + sourceId;
      break;
    case SOURCE_TYPE.WORKSHEETROW:
      if (_extendsId && _extendsId.indexOf('undefined') < 0 && _extendsId.indexOf('null') < 0) {
        const [appId, viewId] = _extendsId.split('|');
        if (!appId || !viewId) {
          linkUrl = ' /worksheet/' + sourceId + '/row/' + childId + '?share';
        } else {
          linkUrl = !browserIsMobile()
            ? replacePorTalUrl(`/app/${appId}/${sourceId}/${viewId}/row/${childId}?share`)
            : `/mobile/record/${appId}/${sourceId}/${viewId}/${childId}?share`; //h5跳到记录详情
        }
      } else {
        linkUrl = ' /worksheet/' + sourceId + '/row/' + childId + '?share';
      }
      break;
    default:
      break;
  }
  return `${window.subPath || ''}${linkUrl}`;
};

export function isWithinOneHour(timestamp) {
  const currentTime = Date.now();
  const oneHour = 60 * 60 * 1000;
  return Math.abs(currentTime - timestamp) <= oneHour;
}
