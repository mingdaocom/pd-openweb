var Common = {};
import qs from 'query-string';

Common.url = function(params) {
  return location.pathname + '?' + qs.stringify(params);
};

Common.MENULEFT = [
  {
    title: _l('个人信息'),
    icon: 'icon-person',
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
    title: _l('账户与安全'),
    icon: 'icon-lock',
    typetag: ['account', 'management'],
    component: () => import('./accountPassword'),
  },
  {
    title: _l('偏好设置'),
    icon: 'icon-settings',
    typetag: ['system'],
    component: () => import('./systemSettings'),
  },
];

Common.PROJECT_STATUS_TYPES_LABLE = {
  // 免费
  0: _l('待开通'),
  // 试用
  1: _l('试用中'),
  // 代付费
  2: _l('待开通'),
  // 使用中
  3: _l('使用中'),
  // 待续费
  4: _l('待续费'),
};

Common.PROJECT_STATUS_TYPES = {
  // 免费
  FREE: 0,
  // 试用
  TRIAL: 1,
  // 代付费
  TOPAID: 2,
  // 使用中
  PAID: 3,
  // 待续费
  REPAID: 4,
};

Common.USER_STATUS = {
  // / 辅助使用
  DEFAULT: 0,
  // / 正常
  NORMAL: 1,
  // / 拒绝申请加入
  REFUSED: 2,
  // / 未审核
  UNAUDITED: 3,
  // / 已删除
  REMOVED: 4,
};

Common.guideType = {
  accountMobilePhone: 4, //手机号帐号
  accountEmail: 5, //邮箱帐号
  mdDaShi: 6, // 大使
  createCompany: 7, //创建企业网络
  postFeed: 8, // 探索动态
  postTopic: 9, // 探索动态话题
  taskManagement: 10, // 探索任务
  taskFolder: 11, // 探索项目
  calendarOthers: 12, // 探索日程 邀请别人加入
  calendarToApp: 13, // 日程安排到iPhone或Outlook等日历
  calendarRepeat: 14, // 重复日程
  kcUpload: 15, // 探索知识
  kcSharedFolder: 16, // 探索共享文件夹
  showGuide: 19, //显示guide
  showGuideCourseList: 20, // 课程
};

export default Common;
