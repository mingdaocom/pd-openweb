import { existAccountHint } from 'src/components/common/function';
import InviteController from 'src/api/invitation';
import { encrypt } from 'src/util';
var Invite = {};

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
    param[encrypt(user.account)] = user.fullname;
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
      existAccountHint(result, cb);
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
    param[encrypt(user.account)] = user.fullname;
  });
  InviteController.inviteUser({
    accounts: param,
    fromType: 0,
    sourceId: md.global.Account.accountId,
  })
    .done(function(result) {
      existAccountHint(result, cb(result));
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

export default Invite;
