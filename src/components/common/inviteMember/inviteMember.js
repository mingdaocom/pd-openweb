var InviteController = require('src/api/invitation');
var Invite = {};
Invite.inviteMembers = function(projectId, accountId, cb, opt) {
  if (accountId) {
    Invite.inviteByAccountIds(projectId, [{ accountId }]);
    cb && cb();
    return;
  }
  require(['dialogSelectUser'], function() {
    $({}).dialogSelectUser({
      title: _l('邀请新同事'),
      zIndex: 11,
      sourceId: projectId,
      fromType: 4,
      SelectUserSettings: {
        filterAccountIds: [md.global.Account.accountId],
        filterProjectId: projectId,
        callback: function(users) {
          Invite.inviteByAccountIds(projectId, users);
        },
      },
      ChooseInviteSettings: {
        projectId: projectId,
        callback: function(data, callbackInviteResult) {
          Invite.inviteByAccounts(projectId, data, callbackInviteResult);
        },
      },
      ...opt,
    });
  });
};
// invite by accountIds
Invite.inviteByAccountIds = function(projectId, users) {
  var accountIds = $.map(users, function(u) {
    return u.accountId;
  });
  Invite.inviteToProject({
    sourceId: projectId,
    accountIds: accountIds,
    fromType: 4,
  });
};

Invite.inviteByAccounts = function(projectId, users, cb) {
  var param = {};
  // format data
  $.map(users, function(user) {
    param[user.account] = user.fullname;
  });
  Invite.inviteToProject(
    {
      sourceId: projectId,
      accounts: param,
      fromType: 4,
    },
    cb
  );
};

/**
 * 邀请用户至网络
 * @param postData
 */
Invite.inviteToProject = function(params, cb) {
  InviteController.inviteUser(params)
    .done(function(result) {
      require(['mdFunction'], function(mdFunction) {
        mdFunction.existAccountHint(result, cb);
      });
    })
    .fail(function() {
      alert('邀请失败', 2);
      if ($.isFunction(cb)) {
        cb({
          status: 0,
        });
      }
    });
};

// 邀请加好友
Invite.inviteToFriend = function(users, cb) {
  var param = {};
  // format data
  $.map(users, function(user) {
    param[user.account] = user.fullname;
  });
  InviteController.inviteUser({
    accounts: param,
    fromType: 0,
    sourceId: md.global.Account.accountId,
  })
    .done(function(result) {
      require(['mdFunction'], function(mdFunction) {
        mdFunction.existAccountHint(result, cb(result));
      });
    })
    .fail(function() {
      alert('邀请失败', 2);
      if ($.isFunction(cb)) {
        cb({
          status: 0,
        });
      }
    });
};

module.exports = Invite;
