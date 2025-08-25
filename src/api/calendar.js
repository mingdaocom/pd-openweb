export default {
  /**
   * 获取受邀日程数
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserInvitedCalendarsCount: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetUserInvitedCalendarsCount', args, options);
  },
  /**
   * 获取用户信息
   * @param {Object} args 请求参数
   * @param {string} args.accountIDs 用户accountID,英文逗号拼接
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserInfo: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetUserInfo', args, options);
  },
  /**
   * 获取IcsUrl
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getIcsUrl: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetIcsUrl', args, options);
  },
  /**
   * 获取冲突日程(查看忙碌状态不管网络只要有但是不包含就是忙碌)
   * @param {Object} args 请求参数
   * @param {string} args.accountID 账号id
   * @param {string} args.startDate 开始时间
   * @param {string} args.endDate 截止时间
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserBusyStatus: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetUserBusyStatus', args, options);
  },
  /**
   * 待确定日程
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  invitedCalendars: function (args, options = {}) {
    return mdyAPI('Calendar', 'InvitedCalendars', args, options);
  },
  /**
   * 获取左侧列表:今天:Today;明天:Tomorrow;本周:Week;本月:Month;更晚:Later
   * @param {Object} args 请求参数
   * @param {string} args.startDate 开始时间
   * @param {string} args.endDate 截止时间
   * @param {string} args.memberIDs 成员accountID 英文逗号拼接
   * @param {boolean} args.isWorkCalendar 是否包含工作日程
   * @param {boolean} args.isTaskCalendar 是否包含任务日程
   * @param {string} args.categoryIDs 标签ID，英文逗号拼接
   * @param {} args.filterTaskType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCalendarList2: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetCalendarList2', args, options);
  },
  /**
   * 获取日程列表
   * @param {Object} args 请求参数
   * @param {string} args.startDate 开始时间
   * @param {string} args.endDate 截止时间
   * @param {string} args.memberIDs 查看accountID,英文逗号拼接
   * @param {string} args.categoryIDs 查看标签ID，英文逗号拼接
   * @param {boolean} args.isWorkCalendar 是否查看工作日程
   * @param {boolean} args.isTaskCalendar 是否查看任务日程
   * @param {} args.filterTaskType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCalendars: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetCalendars', args, options);
  },
  /**
   * 获取日程详情
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.recurTime 复发时间
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCalendarDetail: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetCalendarDetail', args, options);
  },
  /**
   * 获取日程详情
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.recurTime 复发时间
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCalendarDetail2: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetCalendarDetail2', args, options);
  },
  /**
   * 获取日程分享详情（日程详情）
   * @param {Object} args 请求参数
   * @param {string} args.token 第三方ID
   * @param {string} args.thirdID 路由token
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCalendarShareDetail: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetCalendarShareDetail', args, options);
  },
  /**
   * 修改日程分享状态或KEY
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.recurTime 复发时间
   * @param {boolean} args.keyStatus 状态
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateCalednarShare: function (args, options = {}) {
    return mdyAPI('Calendar', 'UpdateCalednarShare', args, options);
  },
  /**
   * 新增日程微信成员
   * @param {Object} args 请求参数
   * @param {string} args.token 路由token
   * @param {string} args.thirdID 第三方ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  insertCalendarWeChatMember: function (args, options = {}) {
    return mdyAPI('Calendar', 'InsertCalendarWeChatMember', args, options);
  },
  /**
   * 移除日程中的微信成员
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.thirdID 第三方ID
   * @param {string} args.recurTime 子日程复发时间
   * @param {boolean} args.isAllCalendar 是否整个日程
   * @param {boolean} args.removeOwnWeChat 是否来自微信
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeCalendarWeChatMember: function (args, options = {}) {
    return mdyAPI('Calendar', 'RemoveCalendarWeChatMember', args, options);
  },
  /**
   * 获取日程分享微信配置信息
   * @param {Object} args 请求参数
   * @param {string} args.url 地址
   * @param {string} args.jsapi_ticket ticke
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getShareConfig: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetShareConfig', args, options);
  },
  /**
   * 新增日程
   * @param {Object} args 请求参数
   * @param {string} args.name 日程名称
   * @param {string} args.address 地址
   * @param {string} args.desc 描述
   * @param {string} args.startDate 开始时间
   * @param {string} args.endDate 截止时间
   * @param {boolean} args.isAll 是否全天日程
   * @param {string} args.membersIDs 成员accountID 英文逗号拼接
   * @param {object} args.specialAccounts {&#34;key&#34;:&#34;value&#34;,&#34;key1&#34;:&#34;value1&#34;}
   * @param {boolean} args.isPrivate 是否私有日程
   * @param {string} args.categoryID 日程分类ID
   * @param {boolean} args.isRecur 是否复发
   * @param {string} args.attachments 附件
   * @param {string} args.knowledgeAtt 知识中心附件
   * @param {integer} args.remindTime 提醒时间
   * @param {integer} args.remindType 提醒时间分类
   * @param {} args.frequency
   * @param {integer} args.interval 重复间隔
   * @param {integer} args.recurCount 重复次数
   * @param {string} args.untilDate 结束日期
   * @param {} args.weekDay
   * @param {string} args.appId 应用id
   * @param {boolean} args.voiceRemind 是否语音提醒
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  insertCalendar: function (args, options = {}) {
    return mdyAPI('Calendar', 'InsertCalendar', args, options);
  },
  /**
   * 删除日程
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.recurTime 复发时间
   * @param {boolean} args.isAllCalendar 是否全部日程
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteCalendar: function (args, options = {}) {
    return mdyAPI('Calendar', 'DeleteCalendar', args, options);
  },
  /**
   * 修改日程私密状态
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {boolean} args.isPrivate 是否私密
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateCalendarIsPrivate: function (args, options = {}) {
    return mdyAPI('Calendar', 'UpdateCalendarIsPrivate', args, options);
  },
  /**
   * 修改日程颜色分类
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.catID 分类id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateCalendarCatId: function (args, options = {}) {
    return mdyAPI('Calendar', 'UpdateCalendarCatId', args, options);
  },
  /**
   * 修改日程提醒
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {integer} args.remindTime 提醒时间
   * @param {} args.remindType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateMemberRemind: function (args, options = {}) {
    return mdyAPI('Calendar', 'UpdateMemberRemind', args, options);
  },
  /**
   * 修改日程语音提醒
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {boolean} args.voiceRemind 是否开启语音提醒
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateVoiceRemind: function (args, options = {}) {
    return mdyAPI('Calendar', 'UpdateVoiceRemind', args, options);
  },
  /**
   * 编辑日程
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.name 日程名称
   * @param {string} args.address 地址
   * @param {string} args.desc 描述
   * @param {string} args.startDate 开始时间
   * @param {string} args.endDate 截止时间
   * @param {boolean} args.isAll 是否全天日程
   * @param {boolean} args.isRecur 是否复发
   * @param {boolean} args.isLock 是否锁
   * @param {string} args.attachments 附件
   * @param {string} args.knowledgeAtt 知识中心附件
   * @param {} args.frequency
   * @param {integer} args.interval 重复间隔
   * @param {integer} args.recurCount 重复次数
   * @param {string} args.untilDate 结束日期
   * @param {} args.weekDay
   * @param {string} args.recurTime 复发时间
   * @param {boolean} args.isAllCalendar 是否全部日程
   * @param {boolean} args.reConfirm 重新确认
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editCalendar: function (args, options = {}) {
    return mdyAPI('Calendar', 'EditCalendar', args, options);
  },
  /**
   * 编辑日程时间
   * @param {Object} args 请求参数
   * @param {string} args.recurTime 复发日程
   * @param {string} args.calendarID 日程ID
   * @param {boolean} args.isAllCalendar 是否整个日程
   * @param {integer} args.dayDelta 日偏移量
   * @param {integer} args.minuteDelta 分钟偏移量
   * @param {boolean} args.isAll 全天事件
   * @param {boolean} args.reType 是否重新邀请
   * @param {boolean} args.isResize 是不是横着托
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editCalendarTime: function (args, options = {}) {
    return mdyAPI('Calendar', 'EditCalendarTime', args, options);
  },
  /**
   * 添加日程成员
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.memberIDs 已注册日程成员accountID,英文逗号拼接
   * @param {object} args.specialAccounts 未注册用户，{&#34;key&#34;:&#34;value&#34;,&#34;key1&#34;:&#34;value1&#34;}
   * @param {boolean} args.isAllCalendar 是否整个日程
   * @param {string} args.recurTime 复发日程
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addMembers: function (args, options = {}) {
    return mdyAPI('Calendar', 'AddMembers', args, options);
  },
  /**
   * 重新邀请（未定）
   * @param {Object} args 请求参数
   * @param {string} args.accountID 邀请accountID
   * @param {string} args.calendarID 日程ID
   * @param {string} args.recurTime 复发日程
   * @param {boolean} args.isAllCalendar 是否整个日程
   * @param {string} args.memberFlag 无accountID状态下的phone或者email
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  reInvite: function (args, options = {}) {
    return mdyAPI('Calendar', 'ReInvite', args, options);
  },
  /**
   * 编辑日程成员状态(同意加入或拒绝)
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.recurTime 复发日程
   * @param {} args.newStatus
   * @param {string} args.remark 描述
   * @param {string} args.catID 日程分类ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  changeMember: function (args, options = {}) {
    return mdyAPI('Calendar', 'ChangeMember', args, options);
  },
  /**
   * 移除日程成员
   * @param {Object} args 请求参数
   * @param {string} args.calendarID 日程ID
   * @param {string} args.accountID 被移除成员accountID
   * @param {string} args.recurTime 复发日程
   * @param {boolean} args.isAllCalendar 是否整个日程
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeMember: function (args, options = {}) {
    return mdyAPI('Calendar', 'RemoveMember', args, options);
  },
  /**
   * 转换日程到任务
   * @param {Object} args 请求参数
   * @param {string} args.calendarId 日程Id
   * @param {string} args.recurTime 复发时间
   * @param {string} args.projectId 网络Id
   * @param {string} args.folderId 项目
   * @param {string} args.folderName 项目名
   * @param {string} args.stageId 看板ID（有folder选中的情况下否则为空）
   * @param {string} args.chargeAccountId 负责人
   * @param {string} args.members 普通成员
   * @param {object} args.specialAccounts 特殊邀请字典
   * @param {string} args.taskName 任务名称
   * @param {string} args.summary 任务描述
   * @param {string} args.startTime 开始时间
   * @param {string} args.deadline 截止时间
   * @param {string} args.attachments 附件，会以讨论形式添加
   * @param {string} args.knowledgeAtt 知识中心附件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  convertCalendarToTask: function (args, options = {}) {
    return mdyAPI('Calendar', 'ConvertCalendarToTask', args, options);
  },
  /**
   * 删除日程分类
   * @param {Object} args 请求参数
   * @param {string} args.catID 日程分类id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteUserCalCategory: function (args, options = {}) {
    return mdyAPI('Calendar', 'DeleteUserCalCategory', args, options);
  },
  /**
   * 修改日程分类
   * @param {Object} args 请求参数
   * @param {string} args.newCalCategory 日程分类信息（json）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateUserCalCategoryInfo: function (args, options = {}) {
    return mdyAPI('Calendar', 'UpdateUserCalCategoryInfo', args, options);
  },
  /**
   * 查找用户所有分类
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserAllCalCategories: function (args, options = {}) {
    return mdyAPI('Calendar', 'GetUserAllCalCategories', args, options);
  },
};
