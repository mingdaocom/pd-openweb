import GroupController from 'src/api/group';
import UserController from 'src/api/user';
import ChatController from 'src/api/chat';
import CommonAjax from 'src/api/addressBook';
import Constant from './constant';
import chatConfig from './config';
import CommonAjaxInvitation from 'src/api/invitation';
import PostController from 'src/api/post';
import { getPssId } from 'src/util/pssId';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 获取会话列表
 * @param {*} param
 */
export const chatSessionList = (param) => {
  return window.mdyAPI('', '', param, {
    customParseResponse: true,
    ajaxOptions: {
      type: 'GET',
      url: _.get(window, 'config.HTTP_SERVER') + '/chat_list'
    }
  });
};

/**
 * 获取当前的会话信息，包含个人和群组
 * @param {*} param
 */
export const chatSessionItem = (param) => {
  const timeout = 3000;
  const ajaxOptions = {
    timeout,
  };
  if (param.type == Constant.SESSIONTYPE_GROUP) {
    return ChatController.getGroupInfo({
      groupId: param.value,
    }, {
      ajaxOptions,
    });
  } else if (param.type == Constant.SESSIONTYPE_USER) {
    return UserController.getAccountBaseInfo({
      accountId: param.value,
    }, {
      ajaxOptions,
    });
  }
};

/**
 * 获取消息
 * @param {*} conf
 */
export const getMessage = (conf) => {
  const param = {};
  param.sincetime = conf.sincetime || '';
  param.page = conf.page || 1;
  // param.num = (conf.num ? conf.num : ) || chatConfig.MSG_LENGTH_MORE;
  param.num = conf.num ? conf.num + chatConfig.MSG_LENGTH_MORE : chatConfig.MSG_LENGTH_MORE;
  param.keyword = conf.keyword || '';
  param.direction = conf.direction || '';
  if (isDevelopment) {
    param.pss_id = getPssId();
  }
  if (conf.type === Constant.SESSIONTYPE_GROUP) {
    param.groupid = conf.id;
    return window.mdyAPI('', '', param, {
      customParseResponse: true,
      ajaxOptions: {
        type: 'GET',
        url: _.get(window, 'config.HTTP_SERVER') + '/group_messages'
      }
    });
  } else if (conf.type === Constant.SESSIONTYPE_USER) {
    param.accountid = conf.id;
    return window.mdyAPI('', '', param, {
      customParseResponse: true,
      ajaxOptions: {
        type: 'GET',
        url: _.get(window, 'config.HTTP_SERVER') + '/messages'
      }
    });
  }
};

/**
 * 获取某一个消息的上下文
 * @param {*} conf
 */
export const getMessageById = (conf) => {
  const param = {};
  let url = '';
  if (conf.type === Constant.SESSIONTYPE_GROUP) {
    param.groupid = conf.id || '';
    url = '/group_messages_byid';
  } else if (conf.type === Constant.SESSIONTYPE_USER) {
    param.accountId = conf.id || '';
    url = '/messages_byid';
  }
  if (isDevelopment) {
    param.pss_id = getPssId();
  }
  param.msgid = conf.msgid || '';
  param.size = conf.size || 21;
  return window.mdyAPI('', '', param, {
    customParseResponse: true,
    ajaxOptions: {
      type: 'GET',
      url: _.get(window, 'config.HTTP_SERVER') + url
    }
  });
};

/**
 * 获取消息流中的文件
 * @param {*} conf
 */
export const getImageContext = (conf) => {
  const param = {};
  let url = '';
  if (conf.isGroup) {
    param.groupid = conf.id || 0;
    url = '/group_files_byid';
  } else {
    param.accountid = conf.id || 0;
    url = '/user_files_byid';
  }
  if (isDevelopment) {
    param.pss_id = getPssId();
  }
  param.msgid = conf.msgid || '';
  param.size = conf.size || 20;
  param.type = conf.type || 0; // 0：表示全部上下文图片消息；1：表示上文图片消息；2：表示下文图片消息
  return window.mdyAPI('', '', param, {
    customParseResponse: true,
    ajaxOptions: {
      type: 'GET',
      url: _.get(window, 'config.HTTP_SERVER') + url
    }
  }).then((res) => {
    if (!$.isArray(res)) {
      res = [];
    }
    return res;
  });
};

/**
 * 获取动态列表
 * @param {*} param
 */
export const getFeed = (param) => {
  param.postType = -1;
  param.fType = param.fType ? param.fType : 'feed';
  param.lType = param.lType ? param.lType : 'group';
  param._ = new Date().getTime();

  return PostController.getPostListByLegacyPara(param);
};

/**
 * 获取文件列表
 * @param {*} param
 */
export const getFileList = (param) => {
  param.fileType = param.fileType || -1;
  if (param.groupId) {
    return ChatController.getGroupFileList(param);
  } else {
    return ChatController.getUserFileList(param);
  }
};

/**
 * 获取搜索数
 * @param {*} param
 */
export const getCountByTabName = (param) => {
  if (param.groupId) {
    param.loadTabType = 7;
    return ChatController.getGroupCountByTabName(param);
  } else {
    param.loadTabType = 6;
    return ChatController.getUserCountByTabName(param);
  }
};

export const getAllAddressbookByKeywords = (keyword) => {
  return CommonAjax.getAllChatAddressbookByKeywords({
    keywords: keyword,
  });
};

/**
 * 获取群组的详细信息
 * @param {*} groupid
 */
export const fetchDetail = (groupid) => {
  return new Promise((resolve, reject) => {
    GroupController.getGroupInfo({
      groupId: groupid,
    }).then((res) => {
      const users = [];
      for (let i = 0; i < res.groupUsers.length; i++) {
        const user = res.groupUsers[i];
        if (user !== null) {
          users.push(user);
        }
      }
      res.users = users;
      resolve(res);
    });
  });
};

/**
 * 添加群组成员
 * @param {*} param
 */
export const addMembers = (param) => {
  return new Promise((resolve, reject) => {
    const obj = {
      sourceId: param.groupId,
      fromType: 1,
    };
    if (param.accountIds) {
      obj.accountIds = param.accountIds;
    }
    if (param.accounts) {
      obj.accounts = param.accounts;
    }
    CommonAjaxInvitation.inviteUser(obj)
      .then((data) => {
        resolve(data);
      })
      .catch((xhr) => {
        reject(xhr);
      });
  });
};

/**
 * 创建群组
 * @param {*} param
 */
export const createGroup = (param) => {
  return new Promise((resolve, reject) => {
    GroupController.addGroup({
      groupName: param.groupname,
      accountIds: JSON.stringify(param.useridlist),
    })
      .then((res) => {
        if (res.msg == 1) {
          resolve(res.data);
        } else {
          reject(res.msg);
        }
      })
      .catch((xhr) => {
        reject(xhr);
      });
  });
};

/**
 * 创建讨论组
 * @param {*} param
 */
export const createDiscussion = (param) => {
  return new Promise((resolve, reject) => {
    GroupController.addDiscussionGroup({
      accountIds: param.accountIds,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((xhr) => {
        reject(xhr);
      });
  });
};

/**
 * 获取视频信息
 * @param {*} url
 */
export const getVideoInfo = (url) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
    }).then(result => {
      resolve(result);
    });
  });
}
