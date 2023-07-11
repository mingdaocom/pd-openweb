export const ADD_GROUP_ID = '@ADD/GROUP';

export const APP_GROUP_CONFIG = [
  {
    type: 'rename',
    icon: 'edit',
    text: _l('重命名%02011'),
  },
  {
    type: 'addAfter',
    icon: 'add',
    text: _l('在此后添加分组%02010'),
  },
  {
    type: 'del',
    icon: 'delete2',
    text: _l('删除分组%02009'),
    className: 'delApp',
  },
];

const navigationConfig = {
  type: 'editNavigation', icon: 'custom_navigation', action: 'navigationConfigVisible', text: _l('导航设置%02051')
}
const adminAction = [
  {
    type: 'modify',
    icon: 'edit',
    text: _l('名称和外观%02052'),
    action: 'modifyAppIconAndNameVisible',
  },
  navigationConfig,
  {
    type: 'editIntro',
    icon: 'info',
    text: _l('编辑应用说明%02050'),
    action: 'editAppIntroVisible',
  },
  {
    type: 'appAnalytics',
    icon: 'poll',
    text: _l('使用分析%02049'),
    action: 'appAnalyticsVisible',
    featureId: 17,
  },
  {
    type: 'appLogs',
    icon: 'wysiwyg',
    text: _l('日志'),
    featureId: 31,
  },
  {
    type: 'modifyAppLockPassword',
    icon: 'lock',
    text: _l('解锁应用%02048'),
    action: 'modifyAppLockPasswordVisible',
  },
  { type: 'optionList', icon: 'dropdown', action: 'optionListVisible', text: _l('选项集%02047') },
  { type: 'appItemTrash', icon: 'knowledge-recycle', text: _l('应用项回收站%02046'), featureId: 16 },
  {
    type: 'appManageMenu',
    icon: 'custom_widgets',
    text: _l('管理应用%02045'),
    subMenuList: [
      { type: 'copy', icon: 'content-copy', text: _l('复制应用%02042'), action: 'copyAppVisible' },
      { type: 'lockApp', icon: 'lock', text: _l('锁定应用%02041'), action: 'lockAppVisisble' },
      { type: 'unlockApp', icon: 'lock', text: _l('恢复锁定'), action: 'unlockAppVisisble' },
      { type: 'export', icon: 'cloud_download', text: _l('导出应用%02040'), action: 'exportAppVisible', featureId: 2 },
      // { type: 'importAppUpgrade', icon: 'cloud_upload', text: _l('导入应用升级') },
      { type: 'createBackup', icon: 'knowledgeMessage', text: _l('创建应用备份%02039'), action: 'createBackupVisisble', featureId: 1 },
      { type: 'restore', icon: 'turnLeft', text: _l('从备份文件还原%02038'), action: 'manageBackupFilesVisible', featureId: 1 },
    ],
  },
  {
    type: 'publishSettings',
    icon: 'send',
    text: _l('发布设置%02044'),
    action: 'publishSettings',
  },
  {
    type: 'worksheetapi',
    icon: 'worksheet_API',
    text: _l('API开发文档%02043'),
    action: 'goWorksheetapi',
    featureId: 21,
  },
]
//没有 导航设置 选项集 应用项回收站 发布设置 API开发文档 管理应用(复制应用,导出应用,创建应用备份,从备份文件还原)
const runnerAction = adminAction.filter(o => !['editNavigation', 'optionList', 'appItemTrash', 'publishSettings', 'worksheetapi', 'appManageMenu'].includes(o.type))
//没有 使用分析 日志
const developerAction = adminAction.filter(o => !['appAnalytics','appLogs'].includes(o.type)).map(o => {
  if (o.type === 'appManageMenu') {
    return {
      //没有复制应用、导出应用
      ...o, subMenuList: o.subMenuList.filter(it => !['copy', 'export'].includes(it.type))
    }
  } else {
    return o
  }
})
export const APP_CONFIG = {
  0: [],
  //  {
  //   type: 'quit',
  //   icon: 'exit',
  //   text: _l('退出应用'),
  //   action: 'quitAppConfirmVisible',
  // }],
  // // 成员
  50: [
    {
      type: 'ding',
      icon: 'feishu',
      text: _l('添加到钉钉'),
      action: 'goDingCourse',
    },
    {
      type: 'weixin',
      icon: 'enterprise_wechat',
      text: _l('添加到企业微信'),
      action: 'goWeixinCourse',
    },
    //  {
    //     type: 'quit',
    //     icon: 'exit',
    //     text: _l('退出应用'),
    //     action: 'quitAppConfirmVisible',
    //   },
  ],
  // ADMIN
  1: developerAction,
  2: runnerAction,
  3: adminAction.map(o => {
    if (o.type === 'appManageMenu') {
      return {
        //没有复制应用、导出应用
        ...o, subMenuList: o.subMenuList.filter(it => !['copy', 'export'].includes(it.type))
      }
    } else {
      return o
    }
  }),
  100: adminAction,
  // OWNER
  200: [
    {
      type: 'modify',
      icon: 'edit',
      text: _l('名称和外观%02052'),
      action: 'modifyAppIconAndNameVisible',
    },
    navigationConfig,
    {
      type: 'editIntro',
      icon: 'info',
      text: _l('编辑应用说明%02050'),
      action: 'editAppIntroVisible',
    },
    {
      type: 'appAnalytics',
      icon: 'poll',
      text: _l('使用分析%02049'),
      action: 'appAnalyticsVisible',
      featureId: 17,
    },
    {
      type: 'appLogs',
      icon: 'wysiwyg',
      text: _l('日志'),
      featureId: 31,
    },
    {
      type: 'modifyAppLockPassword',
      icon: 'lock',
      text: _l('解锁应用%02048'),
      action: 'modifyAppLockPasswordVisible',
    },
    { type: 'optionList', icon: 'dropdown', action: 'optionListVisible', text: _l('选项集') },
    { type: 'appItemTrash', icon: 'knowledge-recycle', text: _l('应用项回收站'), featureId: 16 },
    {
      type: 'appManageMenu',
      icon: 'custom_widgets',
      text: _l('管理应用%02045'),
      subMenuList: [
        { type: 'copy', icon: 'content-copy', text: _l('复制应用%02042'), action: 'copyAppVisible' },
        { type: 'lockApp', icon: 'lock', text: _l('锁定应用%02041'), action: 'lockAppVisisble' }, // 普通应用加锁，仅拥有者可操作
        { type: 'unlockApp', icon: 'lock', text: _l('恢复锁定'), action: 'unlockAppVisisble' },
        { type: 'export', icon: 'cloud_download', text: _l('导出应用%02040'), action: 'exportAppVisible', featureId: 2 },
        // { type: 'importAppUpgrade', icon: 'cloud_upload', text: _l('导入应用升级') },
        { type: 'createBackup', icon: 'knowledgeMessage', text: _l('创建应用备份%02039'), action: 'createBackupVisisble', featureId: 1 },
        { type: 'restore', icon: 'turnLeft', text: _l('从备份文件还原%02038'), action: 'manageBackupFilesVisible', featureId: 1 },
        {
          type: 'del',
          icon: 'delete2',
          text: _l('删除应用%02037'),
          action: 'delAppConfirmVisible',
          className: 'delApp',
        },
      ],
    },
    {
      type: 'publishSettings',
      icon: 'send',
      text: _l('发布设置%02044'),
      action: 'publishSettings',
    },
    {
      type: 'worksheetapi',
      icon: 'worksheet_API',
      text: _l('API开发文档%02043'),
      action: 'goWorksheetapi',
      featureId: 21,
    },
  ],
  300: [
    {
      type: 'modify',
      icon: 'edit',
      text: _l('名称和外观%02052'),
      action: 'modifyAppIconAndNameVisible',
    },
    navigationConfig,
    {
      type: 'editIntro',
      icon: 'info',
      text: _l('编辑应用说明%02050'),
      action: 'editAppIntroVisible',
    },
    {
      type: 'appAnalytics',
      icon: 'poll',
      text: _l('使用分析%02049'),
      action: 'appAnalyticsVisible',
      featureId: 17,
    },
    {
      type: 'appLogs',
      icon: 'wysiwyg',
      text: _l('日志'),
      featureId: 31,
    },
    { type: 'optionList', icon: 'dropdown', action: 'optionListVisible', text: _l('选项集') },
    { type: 'appItemTrash', icon: 'knowledge-recycle', text: _l('应用项回收站'), featureId: 16 },
    {
      type: 'appManageMenu',
      icon: 'custom_widgets',
      text: _l('管理应用%02045'),
      subMenuList: [
        { type: 'copy', icon: 'content-copy', text: _l('复制应用%02042'), action: 'copyAppVisible' },
        { type: 'lockApp', icon: 'lock', text: _l('锁定应用%02041'), action: 'lockAppVisisble' },
        { type: 'unlockApp', icon: 'lock', text: _l('恢复锁定'), action: 'unlockAppVisisble' },
        { type: 'export', icon: 'cloud_download', text: _l('导出应用%02040'), action: 'exportAppVisible', featureId: 2 },
        // { type: 'importAppUpgrade', icon: 'cloud_upload', text: _l('导入应用升级') },
        { type: 'createBackup', icon: 'knowledgeMessage', text: _l('创建应用备份%02039'), action: 'createBackupVisisble', featureId: 1 },
        { type: 'restore', icon: 'turnLeft', text: _l('从备份文件还原%02038'), action: 'manageBackupFilesVisible', featureId: 1 },
      ],
    },
    {
      type: 'publishSettings',
      icon: 'send',
      text: _l('发布设置%02044'),
      action: 'publishSettings',
    },
    {
      type: 'worksheetapi',
      icon: 'worksheet_API',
      text: _l('API开发文档%02043'),
      action: 'goWorksheetapi',
      featureId: 21,
    },
  ],
};

export const DEFAULT_CREATE = '@DEFAULT/CREATE';
export const DEFAULT_GROUP_NAME = _l('未命名分组');

// 高级权限,可以更改应用相关信息
export const ADVANCE_AUTHORITY = 100;
