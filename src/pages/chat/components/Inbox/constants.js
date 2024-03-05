// API Enums 参数，返回值枚举
/**
 * 数据加载类型
 */
export const LOADTYPES = {
  UNREAD: 1,
  ALL: 2,
};
/**
 * 消息加载类型
 * enum type => params
 */
export const TYPES = {
  All: '0',
  SystemMessage: '1',
  PostAll: '2',
  PostMentionedUser: '3',
  PostMentionedGroup: '4',
  PostReply: '5',
  TaskAll: '6',
  TaskMentioned: '7',
  TaskReply: '8',
  TaskMessage: '9',
  CalendarMessage: '10',
  FolderMention: '11',
  FolderComment: '12',
  FolderSystem: '13',
  KCMessage: '14',
  CalendarMentioned: '15',
  CalendarReply: '16',
  CalendarComment: '30',
  CalendarAll: '17',
  KCMentioned: '18',
  KCReply: '19',
  KCAll: '20',
  HrAll: '21',
  ApprovalMessage: '22',
  ApprovalMentioned: '23',
  ApprovalReply: '24',
  ApprovalAll: '25',
  AttendanceMessage: '26',
  AttendanceMentioned: '27',
  AttendanceReply: '28',
  AttendanceAll: '29',
  DossierMessage: '31',
  DossierMentioned: '32',
  DossierReply: '33',
  DossierAll: '34',
  WorkSheetMessage: '35',
  WorkSheetMentioned: '36',
  WorkSheetReply: '37',
  WorkSheetComment: '38',
  WorkSheetRowMessage: '39',
  WorkSheetRowMentioned: '40',
  WorkSheetRowReply: '41',
  WorkSheetRowComment: '42',
  WorkSheetAll: '43',
  WorkFlowAll: '44',
};

/**
 * 消息类型
 * enum inboxType
 */
export const MSGTYPES = {
  // 所有消息
  All: -1,
  // 系统消息
  SystemMessage: 1,
  // 个人消息
  UserMessage: 2,
  // 日程中心的消息
  CalendarMessage: 3,
  // 任务中心的消息
  TaskMessage: 4,
  // @我的动态，@到我本人
  PostMentionedUser: 5,
  // @我的动态，@到我所在的群组
  PostMentionedGroup: 6,
  // @我的回复，@Mectioned_Post_Group
  PostCommentMentionedUser: 7,
  // @我的回复，@到我所在的群组
  PostCommentMentionedGroup: 8,
  // 回复我的动态，或者回复我的回复
  PostReply: 9,
  // 任务普通讨论
  TaskComment: 10,
  // 任务讨论，@到我
  TaskMentioned: 11,
  // 任务讨论，回复我的讨论
  TaskReply: 12,
  // 知识中心的消息
  KCMessage: 13,
  // 项目系统消息
  FolderMessage: 14,
  // 项目讨论 @到的
  FolderMentioned: 15,
  // 项目讨论 回复我的
  FolderReply: 16,
  // 项目讨论
  FolderComment: 17,
  // 审批系统消息
  ApprovalMessage: 18,
  // 审批讨论 @到的
  ApprovalMentioned: 19,
  // 审批讨论  回复我的
  ApprovalReply: 20,
  // 审批讨论
  ApprovalComment: 21,
  // 考勤系统消息
  AttendanceMessage: 22,
  // 考勤讨论 @到的
  AttendanceMentioned: 23,
  // 考勤讨论 回复
  AttendanceReply: 24,
  // 考勤讨论
  AttendanceComment: 25,
  // 日程讨论 @到的
  CalendarMentioned: 26,
  // 日程讨论 回复
  CalendarReply: 27,
  // 日程讨论
  CalendarComment: 28,
  // 知识讨论 @到的
  KCMentioned: 29,
  // 知识讨论 回复
  KCReply: 30,
  // 知识讨论
  KCComment: 31,
  // 档案系统消息
  DossierMessage: 32,
  // 档案@到的
  DossierMentioned: 33,
  // 档案回复我的
  DossierReply: 34,
  // 档案讨论
  DossierMentioned: 35,
  // 工作表系统消息
  WorkSheetMessage: 36,
  // 工作表讨论 @到的
  WorkSheetMentioned: 37,
  // 工作表讨论 回复我的
  WorkSheetReply: 38,
  // 工作表讨论
  WorkSheetComment: 39,
  // 工作表行系统消息
  WorkSheetRowMessage: 40,
  // 工作表行讨论 @到的
  WorkSheetRowMentioned: 41,
  // 工作表行讨论 回复我的
  WorkSheetRowReply: 42,
  // 工作表行讨论
  WorkSheetRowComment: 43,
  // 工作流消息
  WorkFlowMessage: 44,
};

// Code Enums 代码枚举
/**
 * inbox type
 */
export const INBOXTYPES = {
  POST: 'post',
  CALENDAR: 'calendar',
  SYSTEM: 'system',
  TASK: 'task',
  KC: 'knowledge',
  HR: 'hr',
  WORKSHEET: 'worksheet',
  WORKFLOW: 'workflow',
};

export const NAMES = {
  [INBOXTYPES.POST]: _l('动态'),
  [INBOXTYPES.CALENDAR]: _l('日程'),
  [INBOXTYPES.SYSTEM]: _l('系统'),
  [INBOXTYPES.TASK]: _l('任务'),
  [INBOXTYPES.KC]: _l('知识'),
  [INBOXTYPES.HR]: _l('人事'),
  [INBOXTYPES.WORKSHEET]: _l('工作表'),
  [INBOXTYPES.WORKFLOW]: _l('工作流'),
};
/**
 * title name
 */
export const TYPENAMES = {
  [INBOXTYPES.POST]: _l('动态消息'),
  [INBOXTYPES.CALENDAR]: _l('日程消息'),
  [INBOXTYPES.SYSTEM]: _l('系统消息'),
  [INBOXTYPES.TASK]: _l('任务消息'),
  [INBOXTYPES.KC]: _l('知识消息'),
  [INBOXTYPES.HR]: _l('人事消息'),
  [INBOXTYPES.WORKSHEET]: _l('应用消息'),
  [INBOXTYPES.WORKFLOW]: _l('工作流消息'),
};

export const TYPE_GROUP = {
  [INBOXTYPES.POST]: {
    [TYPES.PostAll]: _l('全部消息'),
    [TYPES.PostReply]: _l('回复我的'),
    [TYPES.PostMentionedUser]: _l('提到我的'),
    [TYPES.PostMentionedGroup]: _l('提到我的群组'),
  },
  [INBOXTYPES.TASK]: {
    [TYPES.TaskAll]: _l('全部消息'),
    [TYPES.TaskReply]: _l('回复我的'),
    [TYPES.TaskMentioned]: _l('提到我的'),
    [TYPES.TaskMessage]: _l('系统消息'),
  },
  [INBOXTYPES.CALENDAR]: {
    [TYPES.CalendarAll]: _l('全部消息'),
    [TYPES.CalendarMentioned]: _l('提到我的'),
    [TYPES.CalendarReply]: _l('回复我的'),
    [TYPES.CalendarMessage]: _l('系统消息'),
    [TYPES.CalendarComment]: _l('普通讨论'),
  },
  [INBOXTYPES.HR]: {
    [TYPES.HrAll]: _l('全部消息'),
    [TYPES.ApprovalMessage]: _l('审批系统消息'),
    [TYPES.ApprovalReply]: _l('审批回复我的'),
    [TYPES.ApprovalMentioned]: _l('审批提到我的'),
    [TYPES.AttendanceMessage]: _l('考勤系统消息'),
    [TYPES.DossierMessage]: _l('人事系统消息'),
  },
  [INBOXTYPES.SYSTEM]: {
    [TYPES.SystemMessage]: _l('全部消息'),
  },
  [INBOXTYPES.KC]: {
    [TYPES.KCAll]: _l('全部消息'),
  },
  [INBOXTYPES.WORKSHEET]: {
    [TYPES.WorkSheetAll]: _l('全部消息'),
    [TYPES.WorkSheetMentioned]: _l('提到我的'),
    [TYPES.WorkSheetReply]: _l('回复我的'),
    [TYPES.WorkSheetMessage]: _l('系统消息'),
    [TYPES.WorkSheetComment]: _l('普通讨论'),
  },
  [INBOXTYPES.WORKFLOW]: {
    [TYPES.WorkFlowAll]: _l('全部消息'),
  },
};

export const DROPDOWN_GROUPLIST = {
  [INBOXTYPES.POST]: [TYPES.PostAll, TYPES.PostReply, TYPES.PostMentionedUser, TYPES.PostMentionedGroup],
  [INBOXTYPES.TASK]: [TYPES.TaskAll, TYPES.TaskReply, TYPES.TaskMentioned, TYPES.TaskMessage],
  [INBOXTYPES.CALENDAR]: [TYPES.CalendarAll, TYPES.CalendarMentioned, TYPES.CalendarReply, TYPES.CalendarMessage, TYPES.CalendarComment],
  [INBOXTYPES.HR]: [TYPES.HrAll, TYPES.ApprovalMessage, TYPES.ApprovalReply, TYPES.ApprovalMentioned, TYPES.AttendanceMessage, TYPES.DossierMessage],
  [INBOXTYPES.SYSTEM]: [TYPES.SystemMessage],
  [INBOXTYPES.KC]: [TYPES.KCAll],
  [INBOXTYPES.WORKSHEET]: [TYPES.WorkSheetAll, TYPES.WorkSheetMentioned, TYPES.WorkSheetReply, TYPES.WorkSheetMessage],
  [INBOXTYPES.WORKFLOW]: [TYPES.WorkFlowAll],
};

export const APPID = {
  SCORE: '493cfed8-de7b-413d-b14c-bf7c235925d5',
};

export { SOURCE_TYPE } from 'src/components/comment/config';
