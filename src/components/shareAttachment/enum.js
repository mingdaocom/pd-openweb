export const ATTACHMENT_TYPE = {
  QINIU: 0,
  COMMON: 1,
  KC: 2,
  WORKSHEET: 3,
  WORKSHEETROW: 4,
};

export const NODE_VISIBLE_TYPE = {
  CLOSE: 1, // 关闭分享
  PROJECT: 2, // 本网络可见
  MDUSER: 3, // 登录后可见
  PUBLIC: 4, // 允许任何人查看
};

export const WORKSHEET_VISIBLE_TYPE = {
  CLOSE: 1, // 关闭分享
  ALL: 2, // 允许任何人查看
};

export const SEND_TO_TYPE = {
  CHAT: 0, // 消息
  FEED: 1, // 动态
  TASK: 2, // 任务
  CALENDAR: 4, // 日程
  KC: 5, // 知识
  QR: 7, // 二维码
};

export const CHAT_CARD_TYPE = {
  ALL: -1, // 全部
  TASK: 1, // 任务
  CALENDAR: 2, // 日程
  POST: 3, // 动态
  VOTE: 4, // 投票
  KCFILE: 5, // 知识文件
  KCFOLDER: 6, // 知识文件夹
  WORKSHEET: 7, // 工作表
  WORKSHEETROW: 8, // 工作表行
  LINK: 100, // 链接
};
