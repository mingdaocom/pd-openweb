window.private = Object.freeze({
  dialog: {
    //弹出层升级按钮
    netState: {
      buyBtn: true,
    },
  },
  app: {
    // 侧边栏(资源模块及下级整体)
    appSide: {
      sourcemodule: false,
    },
    //头部导航栏(导航切换模块)
    appManagementHeader: {
      my: false,
      lib: false,
    },
    // 导航栏右侧(帮助)
    commonUserHandle: {
      help: true,
    },
    //添加应用操作(模版安装、解决方案、添加应用按钮)
    addAppItem: {
      installFromLib: true,
      buildService: true,
      addAppIcon: false,
    },
    //UserMenu(中间操作模块)
    userMenu: {
      usersetcenter: true,
    },
    //(复制应用、删除应用、API开发文档、如何添加到钉钉工作台、如何添加到企业微信)
    appInfo: {
      copy: false,
      del: false,
      worksheetapi: false,
      ding: false,
      weixin: false,
    },
  },
  admin: {
    //组织管理侧边栏
    adminLeftMenu: {
      billinfo: true, //账务
      workwxapp: false, //企业微信
      ding: false, //钉钉
      welink: false, //welink
      feishu: false, //飞书
      ldap: false, //其他
      structure: false, //人员与部门
      reportrelation: false, //汇报关系
      groups: false, //群组与外协
      transfer: false, //离职交接
      app: false, //应用
      workflows: false, //工作流
      announcement: false, //工具
    },
    //首页购买
    homePage: {
      installDesktop: true, //客户端安装
      installApp: true, //app安装
      upgrade: true, //升级
      computeMethod: true, //计算方法
      recharge: true, //充值
      extendWorkflow: true, //扩容
      renewBtn: true, //续费或购买
      userBuy: true, //用户包
      versionName: false, //版本名称
      delayTrial: true, //延长试用
      invitePerson: false, //首页邀请成员
      quickEntry: false, //整个快捷入口
    },
    //二级域名、工作地点、注销
    commonInfo: {
      subDomainName: false,
      subDomainTotal: false,
      workPlace: false,
      closeNet: true,
    },
  },
  personal: {
    //偏好设置(微信通知、桌面通知)
    accountChart: {
      wechartnotice: true,
    },
    //侧边栏(我的组织)
    muneLeft: {
      enterprise: false,
    },
    //安全设置(账号绑定、隐私设置、qq和微信)
    accountPassword: {
      accountBind: true,
      privacySetting: false,
      qqOrWeixin: true,
    },
    //个人信息(我的徽章)
    personalInfo: {
      personalEmblem: false,
    },
  },
});
