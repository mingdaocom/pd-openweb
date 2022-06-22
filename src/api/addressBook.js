module.exports = {
  /**
  * 根据账号查找用户
  * @param {Object} args 请求参数
  * @param {string} args.account 邮箱或手机号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountByAccount: function (args, options = {}) {
     
     return $.api('AddressBook', 'GetAccountByAccount', args, options);
   },
  /**
  * 获取加我为好友，我还没有同意的人的列表
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页多少个
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getNewFriends: function (args, options = {}) {
     
     return $.api('AddressBook', 'GetNewFriends', args, options);
   },
  /**
  * 获取根据手机通讯录推荐的明道云联系人
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMobileAddressRecommend: function (args, options = {}) {
     
     return $.api('AddressBook', 'GetMobileAddressRecommend', args, options);
   },
  /**
  * 获取我的所有联系人
通讯录（所有联系人/好友/其它协作对象）
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.projectId 网络Id
  * @param {} args.range 范围
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页多少个
  * @param {boolean} args.isFilterOther 通讯录使用，全部联系人中是否过滤其它协作关系，true：过滤其它协作关系 即好友+同事，false：不过滤， 好友+同事+其它协作
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAllAddressbook: function (args, options = {}) {
     
     return $.api('AddressBook', 'GetAllAddressbook', args, options);
   },
  /**
  * 查询通讯录联系人以及部门
通讯录（所有联系人/好友/其它协作对象）
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.projectId 网络Id
  * @param {} args.range 范围
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页多少个
  * @param {boolean} args.isFilterOther 通讯录使用，全部联系人中是否过滤其它协作关系，true：过滤其它协作关系 即好友+同事，false：不过滤， 好友+同事+其它协作
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchAddressbookAndDepartment: function (args, options = {}) {
     
     return $.api('AddressBook', 'SearchAddressbookAndDepartment', args, options);
   },
  /**
  * 搜索聊天联系人以及群组，需要过滤自己
聊天右侧/右上角Smart快速搜索
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAllChatAddressbookByKeywords: function (args, options = {}) {
     
     return $.api('AddressBook', 'GetAllChatAddressbookByKeywords', args, options);
   },
  /**
  * 关键词搜索通讯录
任务 协作用户快速搜索
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.projectId 要搜索组织的网络Id
  * @param {string} args.currentProjectId 当前组织的网络Id
匹配到则返回当前组织的账户部门职位信息
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {array} args.filterAccountIds 过来哪些账号Id， 数组：[accountId1,accountId2]
  * @param {} args.dataRange 范围 0：所有联系人 1：好友 2：网络同事
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserAddressbookByKeywords: function (args, options = {}) {
     
     return $.api('AddressBook', 'GetUserAddressbookByKeywords', args, options);
   },
  /**
  * 忽略推荐好友
  * @param {Object} args 请求参数
  * @param {string} args.recomendId 忽略者的accountId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addIgnoreMobileAddress: function (args, options = {}) {
     
     return $.api('AddressBook', 'AddIgnoreMobileAddress', args, options);
   },
  /**
  * 请求添加好友
  * @param {Object} args 请求参数
  * @param {string} args.accountId 要添加的人
  * @param {string} args.message 备注信息
  * @param {string} args.companyName 个人的公司名称
  * @param {string} args.profession 个人的职位
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addFriend: function (args, options = {}) {
     
     return $.api('AddressBook', 'AddFriend', args, options);
   },
  /**
  * 移除好友
  * @param {Object} args 请求参数
  * @param {string} args.accountId 要移除的人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeFriend: function (args, options = {}) {
     
     return $.api('AddressBook', 'RemoveFriend', args, options);
   },
  /**
  * 同意请求添加好友
  * @param {Object} args 请求参数
  * @param {string} args.accountId 请求加我为好友的人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAgreeFriend: function (args, options = {}) {
     
     return $.api('AddressBook', 'EditAgreeFriend', args, options);
   },
  /**
  * 拒绝请求添加好友
  * @param {Object} args 请求参数
  * @param {string} args.accountId 请求加我为好友的人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editRefuseFriend: function (args, options = {}) {
     
     return $.api('AddressBook', 'EditRefuseFriend', args, options);
   },
  /**
  * 忽略请求加为好友
  * @param {Object} args 请求参数
  * @param {string} args.accountId 请求加我为好友的人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editIgnoreFriend: function (args, options = {}) {
     
     return $.api('AddressBook', 'EditIgnoreFriend', args, options);
   },
};
