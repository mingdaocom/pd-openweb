export const LINK_PARA_FIELDS = [
  {
    title: _l('当前用户信息'),
    type: 'user',
    fields: [
      { text: _l('用户ID'), value: 'userId' },
      { text: _l('手机号'), value: 'phone' },
      { text: _l('邮箱'), value: 'email' },
    ],
  },
  {
    title: _l('系统信息'),
    type: 'sys',
    fields: [
      { text: _l('组织门牌号'), value: 'projectId' },
      { text: _l('应用ID'), value: 'appId' },
      { text: _l('UserAgent'), value: 'ua' },
      { text: _l('时间戳'), value: 'timestamp' },
    ],
  },
];

export const PUBLISH_CONFIG_OPTIONS = [
  { key: 'pcDisplay', text: _l('PC端') },
  { key: 'webMobileDisplay', text: _l('Web移动端') },
  { key: 'appDisplay', text: _l('APP') },
];
