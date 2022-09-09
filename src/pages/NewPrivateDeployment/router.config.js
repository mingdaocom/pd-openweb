
const settingMenus = [{
  title: _l('通用'),
  icon: 'draft-box',
  type: 'base',
  routes: [{
    path: '/privateDeployment/base',
    component: () => import('./Setting/Base')
  }]
}, {
  title: _l('应用'),
  icon: 'widgets',
  type: 'app',
  routes: [{
    path: '/privateDeployment/app',
    component: () => import('./Setting/App')
  }]
}, {
  title: _l('登录'),
  icon: 'account_circle',
  type: 'login',
  routes: [{
    path: '/privateDeployment/login',
    component: () => import('./Setting/Login')
  }]
}, {
  title: _l('资源'),
  icon: 'link_record',
  type: 'resource',
  routes: [{
    path: '/privateDeployment/resource',
    component: () => import('./Setting/Resource')
  }]
}, {
  title: _l('协作套件'),
  icon: 'cooperation',
  type: 'cooperation',
  routes: [{
    path: '/privateDeployment/cooperation',
    component: () => import('./Setting/Cooperation')
  }]
}, {
  title: _l('集成'),
  icon: 'hub',
  type: 'hub',
  routes: [{
    path: '/privateDeployment/hub',
    component: () => import('./Setting/Hub')
  }]
}, {
  title: _l('安全'),
  icon: 'security',
  type: 'security',
  routes: [{
    path: '/privateDeployment/security',
    component: () => import('./Setting/Security')
  }]
}];

const managementMenus = [{
  title: _l('秘钥管理'),
  icon: 'key1',
  type: 'privateKey',
  routes: [{
    path: '/privateDeployment/privateKey',
    component: () => import('./Management/PrivateKey')
  }]
}, {
  title: _l('管理员'),
  icon: 'admin_panel_settings',
  type: 'admin',
  routes: [{
    path: '/privateDeployment/admin',
    component: () => import('./Management/Admin')
  }]
}, {
  title: _l('日志'),
  icon: 'event',
  type: 'logs',
  routes: [{
    path: '/privateDeployment/logs',
    component: () => import('./Management/Logs')
  }]
}];

const platformMenus = [{
  title: _l('品牌'),
  icon: 'brand',
  type: 'brand',
  routes: [{
    path: '/privateDeployment/brand',
    component: () => import('./Platform/Brand')
  }]
}, {
  title: _l('授权'),
  icon: 'how_to_reg',
  type: 'authorization',
  routes: [{
    path: '/privateDeployment/authorization',
    component: () => import('./Platform/Authorization')
  }]
}];

export const menuGroup = [{
  title: _l('设置'),
  type: 'setting',
  menus: settingMenus,
}, {
  title: _l('管理'),
  type: 'management',
  menus: managementMenus.filter(data => {
    if (data.type === 'privateKey') {
      return md.global.Config.IsPlatformLocal === false;
    }
    return true;
  }),
}, {
  title: _l('平台'),
  type: 'platform',
  menus: platformMenus.filter(data => {
    if (data.type === 'authorization') {
      return md.global.Config.IsPlatformLocal;
    }
    return true;
  }),
}];
