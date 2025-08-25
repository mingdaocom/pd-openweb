import AddressListController from 'src/api/addressBook';
import DepartmentController from 'src/api/department';
import GroupController from 'src/api/group';
import UserController from 'src/api/user';
import { GROUP_STATUS, SEARCH_GROUP_TYPES } from './constants';

const RANGES = {
  ALL: 0,
  FRIENDS: 1,
  PROJECT: 2,
  OTHERS: 3,
};

const fetchContacts = function ({
  projectId = '',
  range = RANGES.ALL,
  pageIndex = 1,
  pageSize = 100,
  isFilterOther = false,
  keywords = '',
} = {}) {
  /**
   * 获取我的所有联系人
   * @param {Object} args 请求参数
   * @param {String} args.keywords 关键词
   * @param {String} args.projectId 网络Id
   * @param {CooperationRange} [args.range=0] 范围 0：所有的协作人 1：好友 2：网络同时 3：其他协作关系用户
   * @param {Int32} [args.pageIndex=1] 页码
   * @param {Int32} [args.pageSize=20] 每页多少个
   * @param {Boolean} [args.isFilterOther=False] 通讯录使用，全部联系人中是否过滤其它协作关系，true：过滤其它协作关系 即好友+同事，false：不过滤， 好友+同事+其它协作
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<ListModel<AccountInfoModel>, ErrorModel>}
   */
  return AddressListController.getAllAddressbook({
    projectId,
    keywords,
    range,
    pageIndex,
    pageSize,
    isFilterOther,
  });
};

const fetchGroups = function ({
  projectId = '',
  keywords = '',
  pageIndex = 1,
  pageSize = 20,
  searchGroupType = SEARCH_GROUP_TYPES.ALL,
  groupStatus = GROUP_STATUS.ALL,
} = {}) {
  return GroupController.getGroups({
    keywords,
    searchGroupType,
    status: groupStatus,
    pageIndex,
    pageSize,
    sortFiled: 4,
    sortType: 1,
    projectId,
  });
};

export default {
  /**
   * Contacts
   */
  fetchAllContacts: ({ pageIndex, pageSize, keywords, isFilterOther }) => {
    const params = {
      pageIndex,
      pageSize,
      keywords,
      isFilterOther,
    };
    params.range = RANGES.ALL;
    return fetchContacts(params);
  },

  fetchFriends: ({ keywords, pageIndex, pageSize }) => {
    const params = {
      pageIndex,
      pageSize,
      keywords,
    };
    params.range = RANGES.FRIENDS;
    return fetchContacts(params);
  },

  fetchOthers: ({ keywords, pageIndex, pageSize }) => {
    const params = {
      pageIndex,
      pageSize,
      keywords,
    };
    params.range = RANGES.OTHERS;
    return fetchContacts(params);
  },

  fetchProjectContacts: ({ keywords, pageIndex, pageSize, projectId }) => {
    const params = {
      pageIndex,
      pageSize,
      keywords,
      projectId,
    };
    params.range = RANGES.PROJECT;
    return fetchContacts(params);
  },

  fetchDepartments: ({ projectId, pageIndex, pageSize }) => {
    const params = {
      projectId,
      pageIndex,
      pageSize,
    };
    return DepartmentController.getProjectDepartmentByPage(params);
  },

  fetchDepartmentUsers: ({ projectId, departmentId }) => {
    const params = {
      projectId,
      departmentId,
    };
    return DepartmentController.getDepartmentUsers(params);
  },

  fetchNewFriends: ({ pageIndex, pageSize = 10 }) => {
    const params = {
      pageIndex,
      pageSize,
    };
    return AddressListController.getNewFriends(params);
  },

  fetchRecommends: ({ pageIndex, pageSize = 5 }) => {
    const params = {
      pageIndex,
      pageSize,
    };
    return AddressListController.getMobileAddressRecommend(params);
  },

  /**
   * Groups
   */
  fetchAllGroups: ({
    pageIndex,
    pageSize,
    keywords = '',
    projectId = '',
    searchGroupType = SEARCH_GROUP_TYPES.JOINED,
    groupStatus = GROUP_STATUS.ALL,
  } = {}) => {
    const params = {
      projectId,
      pageIndex,
      pageSize,
      searchGroupType,
      groupStatus,
      keywords,
      sortFiled: 4,
      sortType: 1,
    };

    return fetchGroups(params);
  },

  /**
   * Users
   */
  fetchUserDetail: accountId => {
    return new Promise((resolve, reject) => {
      UserController.getAccountDetail({
        accountId,
      }).then(data => {
        if (data) {
          resolve(data);
        } else {
          reject();
        }
      });
    });
  },

  searchAddressbookAndDepartment: ({ projectId, keywords, range, pageIndex, pageSize, isFilterOther }) => {
    return AddressListController.searchAddressbookAndDepartment({
      projectId,
      keywords,
      range,
      pageIndex,
      pageSize,
      isFilterOther,
    });
  },
};

export const editAgreeFriend = accountId => {
  return AddressListController.editAgreeFriend({
    accountId,
  });
};

export const editRefuseFriend = accountId => {
  return AddressListController.editRefuseFriend({
    accountId,
  });
};

export const editIgnoreFriend = accountId => {
  return AddressListController.editIgnoreFriend({
    accountId,
  });
};

export const editIgnoreRecommends = recomendId => {
  return AddressListController.addIgnoreMobileAddress({
    recomendId,
  });
};

export const removeFriend = accountId => {
  return AddressListController.removeFriend({
    accountId,
  });
};

export const openGroup = groupId => {
  return GroupController.openGroup({
    groupIds: [groupId],
  }).then(result => {
    if (result) {
      return result;
    } else {
      alert(_l('操作失败，请重新尝试'), 2);
    }
  });
};

export const closeGroup = groupId => {
  return GroupController.closeGroup({
    groupIds: [groupId],
  }).then(result => {
    if (result) {
      return result;
    } else {
      alert(_l('操作失败，请重新尝试'), 2);
    }
  });
};

export const joinGroup = groupId => {
  return GroupController.applyJoinGroup({
    groupId,
  }).then(result => {
    if (result.isApply) {
      alert(_l('该群组需要管理员审批才能加入，已向管理员发出提醒'), 3);
    } else if (result.isMember) {
      alert(_l('加入成功'));
    } else {
      alert(_l('操作失败，请重新尝试'), 3);
    }
  });
};
