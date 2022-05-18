import { AT_ALL_TEXT } from 'src/components/comment/config';
import { upgradeVersionDialog, htmlEncodeReg } from 'src/util';
var Emotion = require('emotion');

var MDFunction = {
  replaceMessageCustomTag: function(message, tagName, replaceHtmlFunc, filterCustom) {
    var startTag, endTag, customReplaceStr;
    if (!message) return message;
    if (typeof tagName === 'string') {
      startTag = '[' + tagName + ']';
      endTag = '[/' + tagName + ']';
    } else if (Array.isArray(tagName)) {
      startTag = tagName[0];
      endTag = tagName[1];
    } else {
      return message;
    }
    if (message.indexOf(startTag) > -1) {
      var customRegExp = new RegExp(
        '(' +
          startTag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') +
          ')([0-9a-zA-Z-]*\\|?.*?)' +
          endTag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'),
        'gi',
      );
      if (filterCustom) {
        message = message.replace(customRegExp, '');
      } else {
        message = message.replace(customRegExp, function($0, $1, $2) {
          var customStr = $2;
          var splitterIndex = customStr.indexOf('|');
          if (splitterIndex === -1) {
            return replaceHtmlFunc ? replaceHtmlFunc(customStr, '无法解析' + tagName) : '';
          }
          var customId = customStr.substr(0, splitterIndex);
          var customName = customStr.substr(splitterIndex + 1);
          return replaceHtmlFunc ? replaceHtmlFunc(customId, customName) : customName;
        });
      }
    }
    return message;
  },
  /**
   * 替换动态/任务等内容中的链接
   * @param  {string} args.message        替换前的 html
   * @param  {object[]} args.rUserList      @ 到的帐号列表
   * @param  {object[]} args.rGroupList     @ 到的群组列表
   * @param  {object[]} args.categories     打的话题
   * @param  {boolean} args.noLink     只生成文本，不生成链接
   * @param  {boolean} args.filterFace     不显示表情
   * @return {string}                替换后的 html
   */
  createLinksForMessage: function(args) {
    var message = args.message.replace(/\n/g, '<br>');
    var rUserList = args.rUserList;
    var rGroupList = args.rGroupList;
    var categories = args.categories;
    var noLink = args.noLink;
    var filterFace = args.filterFace;
    var sourceType = args.sourceType;
    var replaceStr = '';
    var j;

    message = message.replace(/\[all\]atAll\[\/all\]/gi, '<a>@' + AT_ALL_TEXT[sourceType] + '</a>');

    if (rUserList && rUserList.length > 0) {
      for (j = 0; j < rUserList.length; j++) {
        var rUser = rUserList[j];
        replaceStr = '';
        var name = htmlEncodeReg(rUser.name || rUser.fullname);
        var aid = rUser.aid || rUser.accountId;
        if (name) {
          if (noLink) {
            replaceStr += ' @' + name + ' ';
          } else {
            if (md.global.Account.isPortal || (aid || '').indexOf('a#') > -1) {
              // 外部门户
              replaceStr += ' <a>@' + name + '</a> ';
            } else {
              replaceStr += ' <a data-accountid="' + aid + '" href="/user_' + aid + '">@' + name + '</a> ';
            }
          }
        }
        var userRegExp = new RegExp('\\[aid]' + aid + '\\[/aid]', 'gi');
        message = message.replace(userRegExp, replaceStr);
      }
    }
    if (rGroupList && rGroupList.length > 0) {
      for (j = 0; j < rGroupList.length; j++) {
        var rGroup = rGroupList[j];
        replaceStr = '';
        if (rGroup.groupName) {
          if (noLink) {
            replaceStr += '@' + htmlEncodeReg(rGroup.groupName);
          } else {
            if (rGroup.isDelete) {
              replaceStr +=
                ' <span class="DisabledColor" title="群组已删除">@' + htmlEncodeReg(rGroup.groupName) + '</span> ';
            } else {
              replaceStr +=
                ' <a data-groupid="' +
                rGroup.groupID +
                '" href="/group/groupValidate?gID=' +
                rGroup.groupID +
                '">@' +
                htmlEncodeReg(rGroup.groupName) +
                '</a> ';
            }
          }
        }
        var groupRegExp = new RegExp('\\[gid]' + rGroup.groupID + '\\[/gid]', 'gi');
        message = message.replace(groupRegExp, replaceStr);
      }
    }

    var getReplaceHtmlFunc = function(getLink, getPlain) {
      return function(customId, customName) {
        if (noLink) {
          return getPlain ? getPlain(customId) : customName;
        }
        return getLink(customId, customName);
      };
    };

    // TODO: 了解此处各字符串是否已由后台encode
    // 话题
    var findCategory = function(id) {
      if (categories) {
        for (var i = 0, l = categories.length; i < l; i++) {
          if (categories[i].catID === id) {
            return categories[i];
          }
        }
      }
    };
    message = MDFunction.replaceMessageCustomTag(
      message,
      'cid',
      getReplaceHtmlFunc(
        function(id, name) {
          var category = findCategory(id);
          name = category ? category.catName : '未知话题';
          return '<a target="_blank" href="/feed?catId=' + id + '">#' + htmlEncodeReg(name) + '#</a>';
        },
        function(id, name) {
          var category = findCategory(id);
          name = category ? category.catName : '未知话题';
          return '#' + htmlEncodeReg(name) + '#';
        },
      ),
    );
    // 任务
    message = MDFunction.replaceMessageCustomTag(
      message,
      'tid',
      getReplaceHtmlFunc(function(id, name) {
        return '<a target="_blank" href="/apps/task/task_' + id + '">' + htmlEncodeReg(name) + '</a>';
      }),
    );
    // 项目
    message = MDFunction.replaceMessageCustomTag(
      message,
      'fid',
      getReplaceHtmlFunc(function(id, name) {
        return '<a target="_blank" href="/apps/task/folder_' + id + '">' + htmlEncodeReg(name) + '</a>';
      }),
    );
    // 日程
    message = MDFunction.replaceMessageCustomTag(
      message,
      ['[CALENDAR]', '[CALENDAR]'],
      getReplaceHtmlFunc(function(id, name) {
        return '<a target="_blank" href="/apps/calendar/detail_' + id + '">' + htmlEncodeReg(name) + '</a>';
      }),
    );
    // 问答中心
    message = MDFunction.replaceMessageCustomTag(
      message,
      ['[STARTANSWER]', '[ENDANSWER]'],
      getReplaceHtmlFunc(function(id, name) {
        return '<a target="_blank" href="/feeddetail?itemID=' + id + '">' + htmlEncodeReg(name) + '</a>';
      }),
    );
    // 文档版本
    message = MDFunction.replaceMessageCustomTag(
      message,
      ['[docversion]', '[docversion]'],
      getReplaceHtmlFunc(function(id, name) {
        return (
          '<a href="/feeddetail?itemID=' +
          id +
          '" target="_blank">' +
          (htmlEncodeReg(name.split('|')[0]) || '文件') +
          '</a>'
        );
      }),
    );

    if ((typeof filterFace === 'undefined' || !filterFace) && !noLink) {
      message = Emotion.parse(message);
    }

    message = message.replace(/<br( \/)?>/g, '\n'); // .replace(/<[^>]+>/g, '');

    if (!noLink) {
      message = message.replace(/\n/g, '<br>');
      var urlReg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=])?[^ <>\[\]*(){},\u4E00-\u9FA5]+/gi;

      message = message.replace(urlReg, function(m) {
        return '<a target="_blank" href="' + m + '">' + m + '</a>';
      });
    }

    // 外部用户
    if ((args.accountId || '').indexOf('a#') > -1) {
      message = message.replace(new RegExp(`\\[aid\\]${args.accountId}\\[\\/aid\\]`, 'g'), args.accountName);
    }

    return message;
  },
  // 发送提醒通知 未填写手机号码
  sendNoticeInvite: function(id, object, projectId, type) {
    var userController = require('src/api/user');
    if (object) {
      object
        .removeAttr('onclick')
        .css('cursor', 'none')
        .text(_l('已发送提醒'));
    }
    if ($.isArray(id) ? id.length <= 0 : !id) {
      alert(_l('没有要提醒的人'));
    }
    if (!$.isArray(id)) {
      id = [id];
    }

    userController
      .sendNotice({
        accountIds: id,
        projectId: projectId,
        type: type,
      })
      .done(function(result) {
        alert('已成功发送提醒', 1);
      });
  },

  showFollowWeixinDialog: function() {
    var html = `
    <div class='pAll10 mLeft30 pBottom30'>
    <div class='followWeixinQrCode Left'>
    ${LoadDiv()}
    </div>
    <div class='left mTop20 mLeft15'>
    <span class='InlineBlock LineHeight30 Font14'>${_l('用微信【扫一扫】二维码')}</span>
    </div>
    <div class='Clear'></div>
    </div>
    `;

    require(['src/api/weixin', 'mdDialog'], function(weixin, mdDialog) {
      mdDialog.index({
        dialogBoxID: 'followWeixinDialog',
        container: {
          header: _l('关注服务号'),
          content: html,
          yesText: null,
          noText: null,
        },
        width: 398,
      });
      weixin.getWeiXinServiceNumberQRCode().then(function(data) {
        var content = '加载失败';
        if (data) {
          content = "<img src='" + data + "' width='98' height='98'/>";
        }
        $('#followWeixinDialog .followWeixinQrCode').html(content);
      });
    });
  },

  // 验证网络是否到期异步
  expireDialogAsync: function(projectId, text) {
    var def = $.Deferred();
    def.resolve();
    return def.promise();
  },

  // 提示邀请结果
  existAccountHint: function(result, chooseInviteCallback, limitHint, failedHint) {
    var SendMessageResult = {
      Failed: 0,
      Success: 1,
      Limit: 2,
    };

    if ($.isFunction(chooseInviteCallback)) {
      chooseInviteCallback({
        status: result.sendMessageResult === SendMessageResult.Success ? 1 : 0,
      });
    }
    if (result.sendMessageResult === SendMessageResult.Failed) {
      alert(failedHint || _l('邀请失败'), 2);
      return;
    }

    var accountInfos = []; // 成功
    var existAccountInfos = []; // 已存在
    var failedAccountInfos = []; // 失败
    var limitAccountInfos = []; // 邀请限制
    var forbidAccountInfos = []; // 账号来源类型受限

    // result type array
    $.each(result.results, function(index, singleResult) {
      // 成功
      if (singleResult.accountInfos) {
        accountInfos = accountInfos.concat(singleResult.accountInfos);
      }

      // 已存在
      if (singleResult.existAccountInfos) {
        existAccountInfos = existAccountInfos.concat(singleResult.existAccountInfos);
      }

      // 失败
      if (singleResult.failedAccountInfos) {
        failedAccountInfos = failedAccountInfos.concat(singleResult.failedAccountInfos);
      }

      // 限制
      if (singleResult.limitAccountInfos) {
        limitAccountInfos = limitAccountInfos.concat(singleResult.limitAccountInfos);
      }

      // 账号来源类型受限
      if (singleResult.forbidAccountInfos) {
        forbidAccountInfos = forbidAccountInfos.concat(singleResult.forbidAccountInfos);
      }
    });

    var message = _l('邀请成功');
    var isNotice =
      existAccountInfos.length || // 详细提醒
      failedAccountInfos.length ||
      limitAccountInfos.length ||
      forbidAccountInfos.length;

    if (isNotice) {
      message = this.inviteNoticeMessage(_l('以下用户邀请成功'), accountInfos);
      message += this.inviteNoticeMessage(_l('以下用户已存在，不能重复邀请'), existAccountInfos);
      message += this.inviteNoticeMessage(_l('以下用户超过邀请数量限制，无法邀请'), limitAccountInfos);
      message += this.inviteNoticeMessage(_l('以下用户邀请失败'), failedAccountInfos);
      message += this.inviteNoticeMessage(_l('以下用户账号来源类型受限'), forbidAccountInfos);
    }
    if (isNotice) {
      alert(message, 3);
    } else {
      alert(message);
    }
    return {
      accountInfos: accountInfos,
      existAccountInfos: existAccountInfos,
    };
  },
  inviteNoticeMessage: function(title, accounts) {
    if (!accounts.length) return '';
    var noticeMessage = title + '：<br/>';
    $.each(accounts, function(i, item) {
      var message = '';
      if (item.account) {
        // 不存在的用户
        message = item.account;
      } else {
        // 已存在的用户
        var accountArr = [];
        if (item.email) {
          accountArr.push(item.email);
        }
        if (item.mobilePhone) {
          accountArr.push(item.mobilePhone);
        }
        var desc = accountArr.join(' / ') + MDFunction.getUserStatus(item.user);
        message = item.fullname + (desc.length ? '：' + desc : '');
      }
      noticeMessage += '<div class="Font12 Gray_c LineHeight25">' + message + '</div>';
    });
    return noticeMessage;
  },
  getUserStatus: function(user) {
    if (user) {
      switch (user.status) {
        case 2:
          return _l('（被拒绝加入，需从后台恢复权限）');
          break;
        case 3:
          return _l('（待审批）');
          break;
        case 4:
          return _l('（被暂停权限，需从后台恢复权限）');
          break;
      }
    }
    return '';
  },
};
module.exports = MDFunction;
