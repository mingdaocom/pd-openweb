import { dialogSelectUser } from 'ming-ui/functions';
import { existAccountHint } from 'src/utils/common';
import * as ajax from './ajax';
import Constant from './constant';

const showInviteBox = options => {
  let param = {
    sourceId: options.sourceId,
    fromType: options.fromType,
    isChat: true,
    SelectUserSettings: {
      filterAccountIds: options.filterList || [md.global.Account.accountId],
      callback(data) {
        if (typeof options.callback === 'function') {
          options.callback(data);
        }
      },
    },
  };

  dialogSelectUser(param);
};

export const addGroupMembers = session => {
  const current = md.global.Account;
  const { id, type } = session;
  const userArr = [];

  const callback = userlist => {
    const accountIds = [];
    const users = [];
    for (let i = 0; i < userlist.length; i++) {
      const accountId = userlist[i].accountId;
      // 过滤自己和当前用户
      if (accountId !== current.accountId || accountId !== id) {
        // id数组，ajax请求的参数
        accountIds.push(userlist[i].accountId);
        // Object，插入DOM
        users.push({
          id: userlist[i].accountId,
          name: userlist[i].fullname,
          avatar: userlist[i].avatar,
          job: userlist[i].job,
          department: userlist[i].department,
          egroup: userlist[i].egroup,
        });
      }
    }

    if (type == Constant.SESSIONTYPE_GROUP) {
      // 添加群组成员
      ajax
        .addMembers({
          groupId: id,
          accountIds,
        })
        .then(data => {
          existAccountHint(data);
        });
    } else if (type === Constant.SESSIONTYPE_USER) {
      accountIds.push(sessionTarget.id); // 将当前聊天人加入群组会话
      ajax
        .createGroup({
          groupname: '',
          accountIds,
        })
        .then(group => {
          // console.log('createGroup', group);
          // // 聊天不添加到群组列表
          // ChatPubSubHelper.publish(ACTIONS.OPEN_CHAT_WINDOW, {
          //   id: group.groupId,
          //   type: Constant.USERTYPE_GROUP,
          // });
        });
    }
  };

  if (type == Constant.SESSIONTYPE_GROUP) {
    showInviteBox({
      sourceId: id,
      fromType: 1,
      callback,
    });
  } else {
    // 个人聊天中创建聊天
    showInviteBox({
      sourceId: current.accountId,
      fromType: 0,
      callback,
      filterUserIDs: [id, current.accountId],
    });
  }
};

/**
 * 创建讨论组
 * @param {*} accountid
 */
export const createDiscussion = (accountid, cb) => {
  const current = md.global.Account;
  const filterList = [current.accountId];
  if (accountid) {
    filterList.push(accountid);
  }
  showInviteBox({
    sourceId: current.accountId,
    fromType: 0,
    filterList,
    callback(accounts) {
      if (accounts.length === 1 && !accountid) {
        cb && cb(accounts, false);
        return false;
      }
      const accountIds = [];
      accounts.map((account, i) => {
        if (account.accountId !== md.global.Account.accountId || account.accountId !== accountid) {
          accountIds.push(account.accountId);
        }
      });
      if (accountid) {
        accountIds.push(accountid);
      }

      ajax
        .createDiscussion({
          accountIds,
        })
        .then(data => {
          cb && cb(data, true);
        });
    },
  });
};
