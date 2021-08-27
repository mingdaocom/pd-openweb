var groupController = require('src/api/group');
import './groupValidate.less';
import { getRequest } from 'src/util';

var GroupValidate = {};

GroupValidate.options = {
  groupId: null,
};

GroupValidate.init = function () {
  var request = getRequest();
  GroupValidate.options.groupId = request.gID;
  if (!GroupValidate.options.groupId) {
    alert(_l('群组Id不能为空'), 3);
  } else {
    GroupValidate.valideUserJoinGroup();
    GroupValidate.bindEvent();
  }
};

GroupValidate.valideUserJoinGroup = function () {
  var groupModel = $('#groupModelInput').val();
  var promise;
  if (groupModel) {
    promise = $.Deferred().resolve(JSON.parse(decodeURIComponent(groupModel)));
  } else {
    promise = groupController.valideUserJoinGroup({
      groupId: GroupValidate.options.groupId,
    });
  }
  promise.then(function (result) {
    if (!result || !result.isPost) {
      return;
    }

    if (result.isMember) {
      window.location.href = '/feed?groupId=' + GroupValidate.options.groupId;
      return;
    }

    var $btnJoinGroup = $('#btnJoinGroup');
    var $tipMessage = $('.joinMsg');
    if (result.status == 2) {
      // 群组已解散
      $tipMessage.html(_l('此群组已解散'));
      $btnJoinGroup.remove();
    } else if (result.status == 0) {
      // 群组已关闭
      $tipMessage.html(_l('此群组已关闭'));
      $btnJoinGroup.remove();
    } else {
      if (result.isApply) {
        $tipMessage.html(_l('您已申请加入此群组，但群组管理员未审批'));
        // 加入中
        $btnJoinGroup.val(_l('重新申请加入此群组')).show();
      } else {
        $tipMessage.html(_l('此群组需加入后才可访问'));
        $btnJoinGroup.show();
      }
    }

    $tipMessage.show();
    $('#divTitle').html(result.name);
    $('#joinGroupAbout').html(result.about); // 群组介绍
    $('#joinGroupMemberCount').text(_l('%0人', result.groupMemberCount)); // 有效成员
    $('#joinCreateTime').text(moment(result.createTime).format('ll'));
    $('#joinCreateUser').text(result.createAccount.fullname);
    $('.groupJoin').show();
  });
};

GroupValidate.bindEvent = function () {
  $('#btnJoinGroup').on('click', function () {
    var $btnJoinGroup = $(this);

    $btnJoinGroup
      .addClass('btnBootstrap-black')
      .removeClass('btnBootstrap-primary')
      .val(_l('提交中..'))
      .attr('disabled', true);

    groupController
      .applyJoinGroup({
        groupId: GroupValidate.options.groupId,
      })
      .then(function (result) {
        if (result) {
          if (result.isMember) {
            location.href = '/feed?groupId=' + GroupValidate.options.groupId;
          } else if (result.isApply) {
            $('.joinMsg').html(_l('已经申请加入该群组，请等待群组管理员的审批'));
            $btnJoinGroup.val(_l('已申请'));
          }
        } else {
          $btnJoinGroup
            .addClass('btnBootstrap-primary')
            .removeClass('btnBootstrap-black')
            .val(_l('申请加入此群组'))
            .attr('disabled', false);
          alert(_l('操作失败'), 2);
        }
      });
  });
};

GroupValidate.init();

module.exports = GroupValidate;
