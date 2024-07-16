export const routerConfigs = [
  {
    title: _l('个人信息'),
    icon: 'icon-portrait',
    typetag: ['information'],
    component: () => import('./personalInfo'),
  },
  {
    title: _l('我的组织'),
    icon: 'icon-business',
    typetag: ['enterprise', 'reportRelation'],
    component: () => import('./enterprise'),
  },
  {
    title: _l('账户与隐私'),
    icon: 'icon-person',
    typetag: ['account', 'management'],
    component: () => import('./accountPassword'),
  },
  {
    title: _l('安全设置'),
    icon: 'icon-gpp_good',
    typetag: ['securitySetting'],
    component: () => import('./SecuritySetting'),
  },
  {
    title: _l('偏好设置'),
    icon: 'icon-settings',
    typetag: ['system'],
    component: () => import('./systemSettings'),
  },
  {
    title: _l('产品密钥'),
    icon: 'icon-key1',
    typetag: ['privatekey'],
    component: () => import('./privatekey'),
  },
];
