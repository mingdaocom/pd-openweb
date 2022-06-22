export const NATIVE_APP_ITEM = [
  { id: 'feed', icon: 'dynamic-empty', text: _l('动态'), color: '#2196f3', href: '/feed', key: 1 },
  { id: 'task', icon: 'task_basic_application', text: _l('任务'), color: '#3cca8f', href: '/apps/task', key: 2 },
  { id: 'calendar', icon: 'sidebar_calendar', text: _l('日程'), color: '#ff6d6c', href: '/apps/calendar/home', key: 3 },
  { id: 'knowledge', icon: 'sidebar_knowledge', text: _l('文件'), color: '#F89803', href: '/apps/kc', key: 4 },
  { id: 'hr', icon: 'hr_home', text: _l('人事'), color: '#607D8B', href: '/hr', key: 5, openInNew: true },
];
_.remove(NATIVE_APP_ITEM, item => _.includes(md.global.Config.ForbidSuites || [], item.key));

const NATIVE_SOURCE_ITEM = [
  // { id: 'videoCourse', icon: 'sidebar_video_tutorial', text: _l('视频教程'), color: '#7D57C2', href: 'https://learn.mingdao.net' },
  // { id: 'blog', icon: 'custom_book', text: _l('博客'), color: '#4CAF50', href: 'https://blog.mingdao.com' },
  // { id: 'help', icon: 'help', text: _l('使用帮助'), color: '#5F7D8B', href: '' },
  // { id: 'thirdApp', icon: 'sidebar_connection_application', text: _l('第三方应用'), color: '#E91D63' },
  // { id: 'MAP_Platform', icon: 'sidebar_map', text: _l('应用伙伴'), color: '#F89803', href: 'https://map.mingdao.com' },
];

export const MY_APP_SIDE_DATA = [{ id: 'appmodule', title: _l('协作套件'), data: NATIVE_APP_ITEM }, { id: 'educate', title: _l('资源'), data: NATIVE_SOURCE_ITEM }];

export const SORT_TYPE = {
  markedApps: 1,
  validProject: 2,
  aloneApps: 3,
  externalApps: 4,
  expireProject: 5,
};
