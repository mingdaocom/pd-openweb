/** 聊天与协作入口使用的应用类型图标。 */
export const APPLICATION_ICON = {
  system: 'chat_system',
  post: 'chat_post',
  task: 'chat_task',
  calendar: 'chat_calendar',
  knowledge: 'chat_knowledge',
  uploadhelper: 'chat_uploadhelper',
  mail: 'chat_mail',
  approval: 'chat_approval',
  check: 'chat_check',
  hr: 'chat_hr',
  dossier: 'chat_dossier',
  score: 'chat_score',
  worksheet: 'chat_worksheet',
  applist: 'chat_worksheet',
  workflow: 'chat_workflow',
};

const CUSTOM_ICON_BASE_URL = 'https://fp1.mingdaoyun.cn/customIcon/';

/** 根据图标文件名生成 HAP 自定义图标地址。 */
export const getCustomIconUrl = iconName => (iconName ? `${CUSTOM_ICON_BASE_URL}${iconName}.svg` : undefined);
