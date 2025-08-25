import { dialogSelectUser } from 'ming-ui/functions';
import chatController from 'src/api/chat';
import groupController from 'src/api/group';
import taskCenterController from 'src/api/taskCenter';
import 'src/components/createTask/createTask';

export function _getMyTaskList(params) {
  return new Promise((resolve, reject) => {
    taskCenterController
      .getMyTaskList(params)
      .then(function (res) {
        if (!res.status) {
          reject(_l('获取数据失败'));
        } else {
          var data = res.data;
          resolve(data);
        }
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

export function _getChatList(params) {
  return new Promise((resolve, reject) => {
    chatController
      .getChatList(params)
      .then(function (res) {
        resolve(res);
      })
      .catch(function (err) {
        console.log(err);
        reject(_l('获取数据失败'));
      });
  });
}

export function _convertToOtherAttachment(params) {
  return new Promise((resolve, reject) => {
    if (params.qiniuUrl && params.qiniuUrl.indexOf(md.global.FileStoreConfig.pictureHost) > -1) {
      resolve({
        data: params.qiniuUrl,
      });
      return;
    }

    chatController
      .convertToOtherAttachment(params)
      .then(function (res) {
        resolve({ data: res });
      })
      .catch(function (err) {
        console.log(err);
        reject(_l('获取数据失败'));
      });
  });
}

export function createNewTask() {
  return new Promise(resolve => {
    $.CreateTask({
      relationCallback: function (result) {
        resolve({
          taskID: result.taskID,
          taskName: result.taskName,
        });
      },
    });
  });
}

export function createNewChat() {
  return new Promise((resolve, reject) => {
    dialogSelectUser({
      sourceId: 0,
      fromType: 0,
      showMoreInvite: false,
      SelectUserSettings: {
        filterAccountIds: [md.global.Account.accountId],
        callback: function (data) {
          if (data.length > 1) {
            groupController
              .addDiscussionGroup({
                accountIds: data.map(function (account) {
                  return account.accountId;
                }),
              })
              .then(function (result) {
                resolve({
                  type: 2,
                  logo: result.avatar,
                  name: result.name,
                  value: result.groupId,
                });
              })
              .catch(function () {
                reject(_l('创建新聊天失败'));
              });
          } else {
            resolve({
              type: 1,
              logo: data[0].avatar,
              name: data[0].fullname,
              value: data[0].accountId,
            });
          }
        },
      },
    });
  });
}
