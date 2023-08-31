import React from 'react';
import { MSGTYPES } from '../constants';
import * as Components from './wrappedComp';
import _ from 'lodash';

const { SystemMessage, PostReply, PostMention, CommonTopic } = Components;

export default function InboxMessage(_props) {
  const { inboxItem } = _props;
  const inboxType = parseInt(inboxItem.inboxType, 10);
  let props = _.extend({}, inboxItem, {
    inboxType,
  });

  switch (props.inboxType) {
    // 各种系统消息
    case MSGTYPES.SystemMessage:
    case MSGTYPES.TaskMessage:
    case MSGTYPES.FolderMessage:
    case MSGTYPES.CalendarMessage:
    case MSGTYPES.KCMessage:
    case MSGTYPES.ApprovalMessage:
    case MSGTYPES.AttendanceMessage:
    case MSGTYPES.DossierMessage:
    case MSGTYPES.WorkSheetMessage:
    case MSGTYPES.WorkFlowMessage:
      return <SystemMessage {...props} />;
    // 各种动态 回复我的 或者 回复我的回复
    case MSGTYPES.PostReply:
      return <PostReply {...props} />;
    // 各种动态 提到我的 或者 提到我的群组
    case MSGTYPES.PostMentionedUser:
    case MSGTYPES.PostMentionedGroup:
    case MSGTYPES.PostCommentMentionedUser:
    case MSGTYPES.PostCommentMentionedGroup:
      return <PostMention {...props} />;
    // 任务普通讨论 或 回复我的讨论 或 提到我的评论
    case MSGTYPES.TaskComment:
    case MSGTYPES.TaskReply:
    case MSGTYPES.TaskMentioned:
    // 项目提到我的讨论 或 回复我的讨论
    case MSGTYPES.FolderComment:
    case MSGTYPES.FolderReply:
    case MSGTYPES.FolderMentioned:
    // 日程普通讨论 或 回复我的讨论 或 提到我的评论
    case MSGTYPES.CalendarComment:
    case MSGTYPES.CalendarReply:
    case MSGTYPES.CalendarMentioned:
    // 工作表回复我的讨论 或 提到我的讨论
    case MSGTYPES.WorkSheetComment:
    case MSGTYPES.WorkSheetMentioned:
    case MSGTYPES.WorkSheetReply:
    case MSGTYPES.WorkSheetRowReply:
    case MSGTYPES.WorkSheetRowMentioned:
    case MSGTYPES.WorkSheetRowComment:
      return <CommonTopic {...props} />;
    default:
      return null;
      break;
  }
};
