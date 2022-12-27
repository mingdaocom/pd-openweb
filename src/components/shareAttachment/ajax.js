import chatController from 'src/api/chat';
import taskCenterController from 'src/api/taskCenter';
import groupController from 'src/api/group';
import 'src/components/createTask/createTask';

export function _getMyTaskList(params) {
  var promise = $.Deferred();
  taskCenterController.getMyTaskList(params)
    .then(function (res) {
      if (!res.status) {
        promise.reject(_l('获取数据失败'));
      } else {
        var data = res.data;
        promise.resolve(data);
      }
    })
    .fail(function (err) {
      promise.reject(err);
    });
  return promise;
}

export function _getChatList(params) {
  var promise = $.Deferred();
  chatController.getChatList(params)
    .then(function (res) {
      promise.resolve(res);
    })
    .fail(function (err) {
      promise.reject(_l('获取数据失败'));
    });
  return promise;
}

export function _convertToOtherAttachment(params) {
  var promise = $.Deferred();
  if (params.qiniuUrl && params.qiniuUrl.indexOf(md.global.FileStoreConfig.pictureHost) > -1) {
    promise.resolve({
      data: params.qiniuUrl,
    });
    return promise;
  }

  chatController.convertToOtherAttachment(params)
    .then(function (res) {
      promise.resolve({ data: res });
    })
    .fail(function (err) {
      promise.reject(_l('获取数据失败'));
    });

  return promise;
}

export function createNewTask() {
  var promise = $.Deferred();
  $.CreateTask({
    relationCallback: function (result) {
      promise.resolve({
        taskID: result.taskID,
        taskName: result.taskName,
      });
    },
  });
  return promise;
}

export function createNewChat() {
  var promise = $.Deferred();
  import('src/components/dialogSelectUser/dialogSelectUser').then(function () {
    $('body').dialogSelectUser({
      sourceId: 0,
      fromType: 0,
      showMoreInvite: false,
      SelectUserSettings: {
        filterAccountIds: [md.global.Account.accountId],
        callback: function (data) {
          if (data.length > 1) {
            groupController.addDiscussionGroup({
              accountIds: data.map(function (account) {
                return account.accountId;
              }),
            })
              .then(function (result) {
                promise.resolve({
                  type: 2,
                  logo: result.avatar,
                  name: result.name,
                  value: result.groupId,
                });
              })
              .fail(function () {
                promise.reject(_l('创建新聊天失败'));
              });
          } else {
            promise.resolve({
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
  return promise;
}
