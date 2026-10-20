export const SOURCE_TYPE = {
  POST: undefined, // 预留动态
  TASK: 1,
  FOLDER: 2,
  CALENDAR: 3,
  KNOWLEDGE: 4,
  APPROVAL: 5,
  ATTENDANCE: 6,
  WORKSHEET: 7,
  WORKSHEETROW: 8,
  CHAT: 9,
};

/** 正文格式：动态 / 评论的 msgFormat 字段，缺省按纯文本处理 */
export const MSG_FORMAT = {
  TEXT: 0,
  MARKDOWN: 1,
};

export const MARKDOWN_PREFERENCE_KEY = 'feedMarkdownMode';

/** 发布框默认使用 Markdown 编辑器，只有用户主动切回纯文本才记住偏好 */
export function readMarkdownPreference() {
  try {
    return localStorage.getItem(MARKDOWN_PREFERENCE_KEY) !== '0';
  } catch {
    return true;
  }
}

export const AT_ALL_TEXT = {
  [SOURCE_TYPE.POST]: _l('动态参与者'),
  [SOURCE_TYPE.TASK]: _l('任务全体成员'),
  [SOURCE_TYPE.FOLDER]: _l('项目全体成员'),
  [SOURCE_TYPE.CALENDAR]: _l('日程全体成员'),
  [SOURCE_TYPE.KNOWLEDGE]: _l('知识全体成员'),
  [SOURCE_TYPE.ATTENDANCE]: _l('审批全体成员'),
  [SOURCE_TYPE.WORKSHEET]: _l('工作表全体成员'),
  [SOURCE_TYPE.WORKSHEETROW]: _l('全体参与者'),
  [SOURCE_TYPE.CHAT]: _l('全体成员'),
};
