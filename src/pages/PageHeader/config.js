const { SysSettings } = md.global;
export const APP_MANAGEMENT_TABS = SysSettings.hideTemplateLibrary ? [] : [
  { text: _l('我的应用'), id: 'my', href: '/app/my', urlMatch: /app\/my/ },
  { text: _l('应用库'), id: 'lib', urlMatch: /app\/lib/, href: '/app/lib' },
];

const feedRegExp = /feed/;
const taskRegExp = /apps\/task\.*/;
const calendarRegExp = /apps\/calendar\.*/;
const knowledgeRegExp = /apps\/kc\.*/;
const hrRegExp = /hr\.*/;
const NATIVE_MODULES_LIST = [
  { id: 'feed', href: '/feed', urlMatch: feedRegExp, text: _l('动态'), key: 1 },
  { id: 'task', href: '/apps/task', urlMatch: taskRegExp, text: _l('任务'), key: 2 },
  { id: 'calendar', href: '/apps/calendar/home', urlMatch: calendarRegExp, text: _l('日程'), key: 3 },
  { id: 'knowledge', href: '/apps/kc/my', urlMatch: knowledgeRegExp, text: _l('文件'), key: 4 },
  { id: 'hr', href: '/hr', urlMatch: hrRegExp, text: _l('人事'), key: 5 },
];
_.remove(NATIVE_MODULES_LIST, item => _.includes(md.global.Config.ForbidSuites || [], item.key));

export const NATIVE_MODULES = NATIVE_MODULES_LIST;
export const APP_GROUP_TYPE = {
  markedApps: {
    title: _l('星标应用'),
  },
  validProject: {},
  aloneApps: {
    title: _l('个人'),
    text: _l('免费'),
  },
  externalApps: {
    icon: '',
    text: _l('外部协作应用'),
  },
  expireProject: {
    icon: '',
    info: _l('已过期'),
  },
};
