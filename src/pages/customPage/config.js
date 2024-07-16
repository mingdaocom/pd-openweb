export const MAX_REPORT_COUNT = 30;

export const COLUMN_HEIGHT = 40;

export const LINK_PARA_FIELDS = [
  {
    title: _l('当前用户信息'),
    type: 'user',
    fields: [
      { text: _l('用户ID'), value: 'userId' },
      { text: _l('手机号'), value: 'phone' },
      { text: _l('邮箱'), value: 'email' },
      { text: _l('语言'), value: 'language' },
      // { text: _l('工号'), value: 'workId' },
    ],
  },
  {
    title: _l('系统信息'),
    type: 'sys',
    fields: [
      { text: _l('组织门牌号'), value: 'projectId' },
      { text: _l('应用ID'), value: 'appId' },
      { text: _l('分组ID'), value: 'groupId' },
      { text: _l('应用项ID'), value: 'itemId' },
      { text: _l('UserAgent'), value: 'ua' },
      { text: _l('时间戳'), value: 'timestamp' },
    ],
  },
];
