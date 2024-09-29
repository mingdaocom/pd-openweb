import './style.less';
import { formatFileSize } from 'src/util';
import copy from 'copy-to-clipboard';
import doT from 'dot';
import mainHtml from './tpl/main.htm';
import searchListHtml from './tpl/searchList.htm';
import searchListItemHtml from './tpl/searchListItem.htm';
import createFeed from 'src/pages/feed/components/createFeed';
import createCalendar from 'src/components/createCalendar/createCalendar';
import saveToKnowledge from 'src/components/saveToKnowledge/saveToKnowledge';
import KcController from 'src/api/kc';
import WorksheetController from 'src/api/worksheet';
import ChatController from 'src/api/chat';
import DiscussionController from 'src/api/discussion';
import AttachmentController from 'src/api/attachment';

var mainTpl = doT.template(mainHtml);
var listTpl = doT.template(searchListHtml);
var listItemTpl = doT.template(searchListItemHtml);
import { _getMyTaskList, _getChatList, _convertToOtherAttachment, createNewTask, createNewChat } from './ajax';
import { ATTACHMENT_TYPE, NODE_VISIBLE_TYPE, WORKSHEET_VISIBLE_TYPE, SEND_TO_TYPE, CHAT_CARD_TYPE } from './enum';
import folderDg from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import { getClassNameByExt } from 'src/util';
import toMobileDailog from './toMobile';
import _ from 'lodash';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Dropdown, Dialog } from 'ming-ui';
import RegExpValidator from 'src/util/expression';
// 目的地选择列表组件
var SelectSendTo = function (options, callback) {
  this.options = options;
  this.callback = callback;
  if (this.options.type === SEND_TO_TYPE.TASK) {
    this.fetch = _getMyTaskList;
    this.formatTpl = {
      value: 'taskName',
    };
    this.create = createNewTask;
    this.defaultStr = {
      footerStr: _l('创建新任务'),
      placeholderStr: _l('搜索任务'),
    };
  } else if (this.options.type === SEND_TO_TYPE.CHAT) {
    this.fetch = _getChatList;
    this.formatTpl = {
      value: 'name',
      headUrl: 'logo',
    };
    this.create = createNewChat;
    this.defaultStr = {
      footerStr: _l('创建新聊天'),
      placeholderStr: _l('搜索聊天'),
    };
  }
  this.init();
};

SelectSendTo.prototype = {
  init: function () {
    var ST = this;
    var options = ST.options;
    var $selectSendTo = $(options.el);
    var $sendTo = $(listTpl(this.defaultStr));
    $selectSendTo.after($sendTo);
    ST.elements = {};
    ST.elements.$searchListCon = $sendTo.find('.searchListCon');
    ST.elements.$searchInput = $sendTo.find('.searchInput');
    ST.elements.$selected = $sendTo.find('.selected');
    ST.elements.$listPanel = $sendTo.find('.listPanel');
    ST.elements.$searchList = $sendTo.find('.searchList');
    ST.elements.$footerBtn = $sendTo.find('.footerBtn');
    ST.bindEvent();
  },
  bindEvent: function () {
    var ST = this;
    // 点击其它关闭搜索列表
    $(document).on('click.hideShareAttSearchList', function (e) {
      if (!$(e.target).closest('.searchListCon').length) {
        ST.hideList();
      }
      e.stopPropagation();
    });
    // 按键up触发搜索
    ST.elements.$searchInput.on('keyup', function (e) {
      var keywords = _.trim($(this).val());
      if (
        e.keyCode === 37 ||
        e.keyCode === 38 ||
        e.keyCode === 39 ||
        e.keyCode === 40 ||
        ST.keywordsCache === keywords
      ) {
        return;
      }
      ST.keywordsCache = keywords;
      ST.fetchList();
    });
    // 点击搜索栏触发搜索
    ST.elements.$selected.on('click', function (e) {
      ST.elements.$listPanel.show(0, 0, function () {
        if (!ST.defaultListData) {
          ST.fetchList(true);
        }
      });
      ST.elements.$searchInput.show().focus();
      ST.elements.$selected.hide();
      e.stopPropagation();
    });
    ST.elements.$searchList.on('click', '.listItem', function (e) {
      e.stopPropagation();
      var $this = $(this);
      var key = $this.data('key');
      ST.select(key);
    });
    ST.elements.$searchList.on('wheel', function (e) {
      e = e.originalEvent;
      var target = e.currentTarget;
      var clientHeight = target.clientHeight;
      var scrollTop = target.scrollTop;
      var scrollHeight = target.scrollHeight;
      const isTop = e.deltaY < 0 && scrollTop === 0;
      const isBottom = e.deltaY > 0 && clientHeight + scrollTop >= scrollHeight;
      if (isTop || isBottom) {
        e.preventDefault();
      }
    });
    // 绑定创建
    ST.elements.$footerBtn.on('click', function () {
      ST.create()
        .then(function (result) {
          ST.listData = [result];
          ST.listTplData = ST.formatDataTplData([result]);
          ST.defaultListData = undefined;
          ST.select(0);
        })
        .catch(function (err) {
          alert(_l('创建失败'), 2);
        });
    });
  },
  fetchList: function (isFirst) {
    var ST = this;
    ST.elements.$searchList.html(
      listItemTpl({
        isLoading: true,
      }),
    );
    ST.fetch({
      keywords: _.trim(ST.elements.$searchInput.val()),
      size: 20,
      projectId: ST.options.type === SEND_TO_TYPE.CHAT ? undefined : 'all',
    })
      .then(function (listData) {
        if (isFirst) {
          ST.defaultListData = listData;
        }
        ST.listData = listData;
        ST.listTplData = ST.formatDataTplData(listData);
        ST.renderList();
      })
      .catch(function (err) {
        alert(_l('获取数据失败'), 2);
      });
  },
  renderList: function () {
    var ST = this;
    ST.elements.$searchList.html(
      listItemTpl({
        list: ST.listTplData,
      }),
    );
  },
  select: function (key) {
    var ST = this;
    var html;
    var selectedItem = ST.listTplData[key];
    ST.selectedData = ST.listData[key];
    if (ST.callback) {
      ST.callback(ST.selectedData);
    }
    if (selectedItem.headUrl) {
      html = '<img src="' + selectedItem.headUrl + '">' + selectedItem.value;
    } else {
      html = selectedItem.value;
    }
    ST.elements.$selected.html(html);
    ST.hideList();
  },
  formatDataTplData: function (data) {
    var ST = this;
    var formatTpl = ST.formatTpl;
    return data.map(function (item) {
      var result = {};
      if (formatTpl.value) {
        result.value = item[formatTpl.value];
      }
      if (formatTpl.headUrl) {
        result.headUrl = item[formatTpl.headUrl];
      }
      return result;
    });
  },
  hideList: function () {
    var ST = this;
    ST.elements.$listPanel.hide();
    ST.elements.$searchInput.hide();
    ST.elements.$selected.show();
  },
};

var ShareAttachment = function (options, callbacks) {
  this.options = _.assign(
    {},
    {
      sendToTargetType: SEND_TO_TYPE.CHAT,
      isKcFolder: false,
    },
    options,
  );
  this.callbacks = callbacks || {};
  this.file = {
    ext: options.ext[0] === '.' ? options.ext.slice(1) : options.ext,
    name: options.name,
    size: options.size,
    imgSrc: options.imgSrc,
  };
  this.init();
};

ShareAttachment.prototype = {
  init: function () {
    var SA = this;
    var options = SA.options;
    var html = mainTpl({
      showChangeDownload: !(
        RegExpValidator.fileIsPicture(SA.options.ext) ||
        SA.options.attachmentType === ATTACHMENT_TYPE.KC ||
        SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET ||
        SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW
      ),
      showChangeShare:
        SA.options.attachmentType === ATTACHMENT_TYPE.KC ||
        SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET ||
        SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW,
      SEND_TO_TYPE: SEND_TO_TYPE,
      attachmentType: SA.options.attachmentType,
    });
    var dialogBoxID = 'shareAttachmentDialog';
    Dialog.confirm({
      dialogClasses: `${dialogBoxID} shareAttachmentDialog darkHeader`,
      width: 540,
      title: SA.options.dialogTitle || _l('分享'),
      children: <div dangerouslySetInnerHTML={{ __html: html }}></div>,
      noFooter: true,
    });

    setTimeout(() => {
      SA.$dialog = $('.' + dialogBoxID);
      SA.dialogEle = {};
      SA.dialogEle.$fileName = SA.$dialog.find('#fileName');
      SA.dialogEle.$fileNameText = SA.$dialog.find('.fileNameText');
      SA.dialogEle.$canDownloadSwitch = SA.$dialog.find('#canDownload');
      if (
        options.attachmentType === ATTACHMENT_TYPE.KC ||
        options.attachmentType === ATTACHMENT_TYPE.WORKSHEET ||
        options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW
      ) {
        SA.dialogEle.$fileName.hide();
        SA.dialogEle.$fileNameText.text(SA.file.name).removeClass('hide');
      } else {
        SA.dialogEle.$fileName.val(SA.file.name);
      }
      if (options.attachmentType === ATTACHMENT_TYPE.WORKSHEET) {
        SA.$dialog.find('.shareAttachmentDialogContainer').addClass('isWorksheet');
      }
      if (options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW) {
        SA.$dialog.find('.shareAttachmentDialogContainer').addClass('isWorksheetRow');
      }
      SA.bindEvent();
      SA.previewFile();
      if (options.attachmentType === ATTACHMENT_TYPE.KC && options.node) {
        SA.initModules();
      } else {
        SA.fetchBaseData(SA.initModules.bind(SA));
      }
    }, 200);
  },
  bindEvent: function () {
    var SA = this;
    SA.$dialog.on('change', '#fileName', function () {
      SA.newFileName = $(this).val();
    });
    SA.$dialog.on('click', '.shareAttachmentFooter .yes', function () {
      SA.share();
    });
    SA.$dialog.on('click', '.shareAttachmentFooter .no', function () {
      if ($('.shareAttachmentDialog')[0]) {
        $('.shareAttachmentDialog').parent().remove();
      }
    });
    SA.$dialog.on('click', '.addDescBtn', function () {
      SA.$dialog.find('.addDescBtn').hide();
      SA.$dialog.find('.descCon').removeClass('hide');
      $('#shareDesc').focus();
    });
  },
  checkClose(type) {
    var SA = this;
    var options = SA.options;
    const visibleType = type || options.node.visibleType;
    if (options.attachmentType === ATTACHMENT_TYPE.KC) {
      return visibleType === NODE_VISIBLE_TYPE.CLOSE;
    } else if (
      options.attachmentType === ATTACHMENT_TYPE.WORKSHEET ||
      options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW
    ) {
      return visibleType === WORKSHEET_VISIBLE_TYPE.CLOSE;
    }
    return true;
  },
  initModules: function () {
    var SA = this;
    var options = SA.options;
    if (
      options.attachmentType === ATTACHMENT_TYPE.KC ||
      options.attachmentType === ATTACHMENT_TYPE.WORKSHEET ||
      options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW
    ) {
      SA.initSelectPermission();
      if (!this.checkClose()) {
        SA.initSelectTargetList();
      }
    } else {
      SA.initSelectTargetList();
    }
  },
  updateWorkshhetShareUrl(type = 1, callback) {
    var SA = this;
    const args = {
      worksheetId: SA.options.id,
      appId: SA.options.appId,
      viewId: SA.options.viewId,
      objectType: 1,
    };
    if (type === 2) {
      args.objectType = 2;
      args.rowId = SA.options.rowId;
    }
    WorksheetController.getWorksheetShareUrl(args).then(shareUrl => {
      SA.options.node = Object.assign({}, SA.options.node, {
        shareUrl,
      });
      callback();
    });
  },
  fetchBaseData: function (callback) {
    var SA = this;
    switch (SA.options.attachmentType) {
      case ATTACHMENT_TYPE.COMMON:
        AttachmentController.shareAttachmentByPost({
          fileId: SA.options.id,
        })
          .then(function (data) {
            SA.options.node = data;
            if (callback && typeof callback === 'function') {
              callback(data);
            }
          })
          .catch(function (err) {
            console.log(err);
          });
        break;
      case ATTACHMENT_TYPE.KC:
        KcController.getNodeDetail({
          id: SA.options.id,
        }).then(function (data) {
          if (!data) {
            alert(_l('您权限不足，无法分享，请联系管理员或文件上传者'), 3);
            return;
          }
          SA.options.node = data;
          if (callback && typeof callback === 'function') {
            callback(data);
          }
        });
        break;
      case ATTACHMENT_TYPE.QINIU:
        _convertToOtherAttachment({
          qiniuUrl: SA.options.qiniuPath,
        })
          .then(function (data) {
            SA.options.priviteBucketUrl = data.data;
            SA.options.node = SA.formatQiniuPath(data.data);
            if (callback && typeof callback === 'function') {
              callback(data);
            }
          })
          .catch(function (err) {
            console.log(err);
          });
        break;
      case ATTACHMENT_TYPE.WORKSHEET:
        SA.options.node = Object.assign({}, SA.options.node, {
          visibleType: SA.options.shareRange,
        });
        if (SA.options.shareRange === WORKSHEET_VISIBLE_TYPE.CLOSE && SA.options.canChangeSharable) {
          SA.options.node.visibleType = WORKSHEET_VISIBLE_TYPE.ALL;
          SA.updateShareType(WORKSHEET_VISIBLE_TYPE.ALL, () => {
            alert(_l('开启分享'), 4);
            SA.updateWorkshhetShareUrl(1, callback);
          });
        } else {
          SA.updateWorkshhetShareUrl(1, callback);
        }
        break;
      case ATTACHMENT_TYPE.WORKSHEETROW:
        SA.options.node = Object.assign({}, SA.options.node, {
          canChangeSharable: SA.options.canChangeSharable,
          visibleType: SA.options.visibleType,
        });
        if (SA.options.visibleType === WORKSHEET_VISIBLE_TYPE.CLOSE) {
          SA.options.node.visibleType = WORKSHEET_VISIBLE_TYPE.ALL;
          SA.updateShareType(WORKSHEET_VISIBLE_TYPE.ALL, () => {
            alert(_l('开启分享'), 4);
            SA.updateWorkshhetShareUrl(2, callback);
          });
        } else {
          SA.updateWorkshhetShareUrl(2, callback);
        }
        break;
      default:
        break;
    }
  },
  initSendToTarget: function () {
    var SA = this;
    var dataArr;
    if (SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET) {
      dataArr = [
        {
          value: SEND_TO_TYPE.CHAT,
          text: _l('消息'),
        },
      ];
    } else if (SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW) {
      dataArr = [
        {
          value: SEND_TO_TYPE.CHAT,
          text: _l('消息'),
        },
      ];
    } else {
      dataArr = [
        {
          value: SEND_TO_TYPE.CHAT,
          text: _l('消息'),
        },
        {
          value: SEND_TO_TYPE.FEED,
          text: _l('动态'),
        },
        {
          value: SEND_TO_TYPE.TASK,
          text: _l('任务'),
        },
        {
          value: SEND_TO_TYPE.CALENDAR,
          text: _l('日程'),
        },
        {
          value: SEND_TO_TYPE.KC,
          text: _l('知识'),
        },
      ];
    }

    const root = createRoot(document.getElementById('sendToTargetBox'));

    root.render(
      <Dropdown
        className="sendToTargetDropdown w100"
        data={dataArr}
        defaultValue={SA.sendToTargetType}
        isAppendToBody
        menuStyle={{ width: 110 }}
        onChange={value => {
          SA.activeSendToOther(parseInt(value, 10));
        }}
      />,
    );
  },
  initSelectTargetList: function () {
    var SA = this;
    var left = 10;
    var targetBtnWidth = 50 + 36;
    var targetBtnNums = 4;
    var $targetBtnList = SA.$dialog.find('.selectTargetBtnList');
    var $listBox = $targetBtnList.find('.listBox');
    var $listCon = $targetBtnList.find('.listCon');
    SA.$dialog.find('.selectTargetCon').addClass('inited').removeClass('hide');
    var listConWidth = $listCon.find('.contentCon')[0].clientWidth;
    $listCon.width(listConWidth + 2);
    var listBoxWidth = $listBox[0].clientWidth;
    if (listConWidth < listBoxWidth) {
      $listBox[0].style.justifyContent = 'center';
    }
    showControlBtn();
    $targetBtnList.on('click', '.prev, .next', function () {
      left += listBoxWidth * ($(this).hasClass('prev') ? 1 : -1);
      showControlBtn();
      $listCon.animate({
        left: left,
      });
    });
    $targetBtnList.on('click', '.targetBtn', function () {
      var type = $(this).data('type');
      SA.activeSendToOther(type);
    });
    // if (SA.dialog) {
    //   SA.dialog.dialogCenter();
    // }
    function showControlBtn() {
      $targetBtnList.find('.prev, .next').hide();
      if (left < 0) {
        $targetBtnList.find('.prev').show();
      }
      if (-1 * left + listBoxWidth <= $listCon[0].clientWidth) {
        $targetBtnList.find('.next').show();
      }
    }
  },
  initSelectPermission: function () {
    var SA = this;
    var $changeShare = SA.$dialog.find('.changeShare');
    var $closedTip = SA.$dialog.find('.closedTip');
    var $linkContent = SA.$dialog.find('#linkContent');
    var rootInfo = SA.options.rootInfo || SA.options.node.rootInfo || {};
    var shareVisibleArea = _l('允许所有联系人查看');
    var permissionList;
    $changeShare.removeClass('hide');
    $linkContent.val(SA.options.node.shareUrl);
    if (SA.options.node.visibleType !== NODE_VISIBLE_TYPE.CLOSE) {
      SA.initCopyLinkBtn();
    } else {
      $closedTip.removeClass('hide');
    }
    if (rootInfo.project) {
      shareVisibleArea = _l('%0 成员可预览', rootInfo.project.companyDisplayName);
    } else if (rootInfo.owner) {
      shareVisibleArea = _l('%0 的联系人可预览', rootInfo.owner.fullname);
    }
    if (SA.options.attachmentType === ATTACHMENT_TYPE.KC) {
      permissionList =
        SA.options.node.type === 1
          ? [
              {
                value: NODE_VISIBLE_TYPE.CLOSE,
                text: _l('关闭文件夹分享'),
              },
              {
                value: NODE_VISIBLE_TYPE.PUBLIC,
                text: _l('允许任何人查看'),
              },
            ]
          : [
              {
                value: NODE_VISIBLE_TYPE.CLOSE,
                text: _l('关闭文件分享'),
              },
              {
                value: NODE_VISIBLE_TYPE.PROJECT,
                text: shareVisibleArea,
              },
              {
                value: NODE_VISIBLE_TYPE.PUBLIC,
                text: _l('允许任何人查看'),
              },
            ];
    } else if (
      SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET ||
      SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW
    ) {
      permissionList = [
        {
          value: 1,
          text: _l('关闭分享'),
        },
        {
          value: 2,
          text: _l('允许任何人查看'),
        },
      ];
    }

    const root = createRoot(document.getElementById('selectSharePermissionBox'));

    root.render(
      <Dropdown
        className="selectSharePermissionDropdown w100"
        data={permissionList}
        defaultValue={SA.options.node.visibleType}
        isAppendToBody
        menuStyle={{ width: 170 }}
        onChange={value => {
          SA.updateShareType(value, function (visibleType) {
            // 当知识分享权限变动，切换模块显示
            var $selectTargetCon = SA.$dialog.find('.selectTargetCon');
            var $copyLinkCon = SA.$dialog.find('.copyLinkCon');
            var $sendToOther = SA.$dialog.find('.sendToOther');
            var $shareAttachmentFooter = SA.$dialog.find('.shareAttachmentFooter');
            var selectTargetInited = $selectTargetCon.hasClass('inited');
            var sendToOtherInited = $sendToOther.hasClass('inited');
            SA.options.node.visibleType = visibleType;
            function handleActivTarget() {
              if (sendToOtherInited) {
                $sendToOther.removeClass('hide');
                $shareAttachmentFooter.removeClass('hide');
              } else if (!selectTargetInited) {
                if (SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW) {
                  SA.activeSendToOther(SEND_TO_TYPE.CHAT);
                } else {
                  SA.initSelectTargetList();
                }
              } else {
                $selectTargetCon.removeClass('hide');
              }
              if ($copyLinkCon.hasClass('inited')) {
                $copyLinkCon.removeClass('hide');
              } else {
                SA.initCopyLinkBtn();
              }
              $closedTip.addClass('hide');
            }
            if (SA.checkClose(visibleType)) {
              if (sendToOtherInited) {
                $sendToOther.addClass('hide');
                $shareAttachmentFooter.addClass('hide');
              } else {
                $selectTargetCon.addClass('hide');
              }
              SA.$dialog.find('.copyLinkCon').addClass('hide');
              $closedTip.removeClass('hide');
            } else {
              if (SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET) {
                $copyLinkCon.removeClass('inited');
                SA.updateWorkshhetShareUrl(1, handleActivTarget);
              } else {
                handleActivTarget();
              }
            }
          });
        }}
      />,
    );

    if (!SA.options.node.canChangeSharable) {
      SA.$dialog
        .find('.selectSharePermission')
        .addClass('noPermission')
        .on('click', function (e) {
          alert(_l('无权修改，请联系管理员'), 3);
        });
    }
  },
  updateShareType: function (value, cb) {
    var SA = this;
    let updateFunc;
    switch (SA.options.attachmentType) {
      case ATTACHMENT_TYPE.KC:
        updateFunc = SA.updateVisibleType.bind(SA);
        break;
      case ATTACHMENT_TYPE.WORKSHEET:
        updateFunc = SA.updateWorkSheetVisibleType.bind(SA);
        break;
      case ATTACHMENT_TYPE.WORKSHEETROW:
        updateFunc = SA.updateWorksheetRowShareRange.bind(SA);
        break;
      default:
        updateFunc = () => {};
    }
    updateFunc(value, cb);
  },
  initCopyLinkBtn: function () {
    var SA = this;
    SA.$dialog.find('#linkContent').val(SA.options.node.shareUrl);
    SA.$dialog.find('.copyLinkCon').removeClass('hide').addClass('inited');

    SA.$dialog
      .find('#copyLinkBtn')
      .off()
      .on('click', function () {
        copy(SA.options.node.shareUrl);
        alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方'));
      });
  },
  initSelectSendTo: function (type, callback) {
    var SA = this;
    window.selectSendTo = new SelectSendTo(
      {
        el: '#selectSendTo',
        type: type,
      },
      callback,
    );
  },
  activeSendToOther: function (type) {
    var SA = this;
    var $sendToOther = SA.$dialog.find('.sendToOther');
    var $sendToContent = SA.$dialog.find('.sendToContent');
    SA.sendToTargetType = type;
    SA.options.node.allowDown = true;
    var shareDesc;
    if (SA.$dialog.find('#shareDesc').is(':visible')) {
      shareDesc = SA.$dialog.find('#shareDesc').val().trim();
    }
    // 删除消息和任务已选择的数据
    delete SA.selectedChat;
    delete SA.selectedTask;
    if ([SEND_TO_TYPE.FEED, SEND_TO_TYPE.CALENDAR].indexOf(type) < 0) {
      SA.initSendToTarget();
    }
    if (SA.options.attachmentType !== ATTACHMENT_TYPE.KC && SA.dialogEle.$canDownloadSwitch.length) {
      SA.options.node.allowDown = SA.dialogEle.$canDownloadSwitch.prop('checked');
    }
    // 将允许下载switch设为可更改
    SA.dialogEle.$canDownloadSwitch.attr('disabled', false);
    switch (type) {
      case SEND_TO_TYPE.CHAT: {
        SA.dialogEle.$canDownloadSwitch.attr('disabled', true);
        if (SA.dialogEle.$canDownloadSwitch.prop('checked') === false) {
          alert(_l('分享到消息文件不可设为不允许下载，已更改为允许下载'), 4);
          SA.dialogEle.$canDownloadSwitch.prop('checked', true);
        }
        SA.showFooter();
        $sendToOther.addClass('inited').removeClass('hide');
        $sendToContent.empty().append($('<input type="hidden" id="selectSendTo">'));
        $sendToContent.show();
        SA.$dialog.find('.selectTargetCon').addClass('hide');
        SA.initSelectSendTo(SEND_TO_TYPE.CHAT, function (data) {
          SA.selectedChat = data;
        });
        break;
      }
      case SEND_TO_TYPE.FEED: {
        $sendToContent.empty();
        var sObj = {
          callback: function (postItem) {
            if ($('.shareAttachmentDialog')[0]) {
              $('.shareAttachmentDialog').parent().remove();
            }
          },
        };
        if (SA.options.attachmentType === ATTACHMENT_TYPE.COMMON) {
          if (SA.newFileName) {
            SA.options.node.originalFileName = SA.newFileName;
          }
          sObj.defaultAttachmentData = [SA.options.node];
        } else if (SA.options.attachmentType === ATTACHMENT_TYPE.KC) {
          sObj.defaultKcAttachmentData = [SA.options.node];
        } else if (SA.options.attachmentType === ATTACHMENT_TYPE.QINIU) {
          SA.options.node.originalFileName = SA.options.name;
          SA.options.node.fileSize = SA.options.size;
          if (SA.newFileName) {
            SA.options.node.originalFileName = SA.newFileName;
          }
          sObj.defaultAttachmentData = [SA.options.node];
        }
        if (shareDesc) {
          sObj.postMsg = shareDesc;
        }
        createFeed(sObj);
        break;
      }
      case SEND_TO_TYPE.TASK: {
        SA.showFooter();
        $sendToOther.addClass('inited').removeClass('hide');
        $sendToContent.empty().append($('<input type="hidden" id="selectSendTo">'));
        $sendToContent.show();
        SA.$dialog.find('.selectTargetCon').addClass('hide');
        SA.initSelectSendTo(SEND_TO_TYPE.TASK, function (data) {
          SA.selectedTask = data;
        });
        console.log('TASK');
        break;
      }
      case SEND_TO_TYPE.QR: {
        SA.sendToMobile(type);
        console.log('QR');
        break;
      }
      case SEND_TO_TYPE.CALENDAR: {
        $sendToContent.empty();
        var cObj = {
          callback: function (source) {
            if (source && $('.shareAttachmentDialog')[0]) {
              $('.shareAttachmentDialog').parent().remove();
            }
          },
        };
        if (SA.options.attachmentType === ATTACHMENT_TYPE.COMMON) {
          if (SA.newFileName) {
            SA.options.node.originalFileName = SA.newFileName;
          }
          cObj.defaultAttachmentData = [SA.options.node];
        } else if (SA.options.attachmentType === ATTACHMENT_TYPE.KC) {
          cObj.defaultKcAttachmentData = [SA.options.node];
        } else if (SA.options.attachmentType === ATTACHMENT_TYPE.QINIU) {
          SA.options.node.originalFileName = SA.options.name;
          SA.options.node.fileSize = SA.options.size;
          if (SA.newFileName) {
            SA.options.node.originalFileName = SA.newFileName;
          }
          cObj.defaultAttachmentData = [SA.options.node];
        }
        if (shareDesc) {
          cObj.Message = shareDesc;
        }
        createCalendar(cObj);
        break;
      }
      case SEND_TO_TYPE.KC: {
        if (SA.options.attachmentType === ATTACHMENT_TYPE.KC && !SA.options.node.canDownload) {
          alert(_l('您权限不足，无法下载或保存，请联系管理员或文件上传者'), 3);
          return;
        }
        SA.showFooter();
        $sendToOther.addClass('inited').removeClass('hide');
        $sendToContent.empty();
        SA.$dialog.find('.selectTargetCon').addClass('hide');
        $sendToContent.html('<span class="kcPath ThemeColor3">' + _l('请选择文件夹') + '</span>');
        $sendToContent.on('click', '.kcPath', function () {
          SA.selectKcPath(function (result, path) {
            SA.kcPath = result;
            $sendToContent.html('<span class="kcPath ThemeColor3">' + path + '</span>');
          });
        });
        $sendToContent.find('.kcPath').trigger('click');
        break;
      }
      default: {
        break;
      }
    }
    // if (SA.dialog) {
    //   SA.dialog.dialogCenter();
    // }
  },
  showFooter: function () {
    var SA = this;
    var $shareAttachmentFooter = SA.$dialog.find('.shareAttachmentFooter');
    $shareAttachmentFooter.removeClass('hide');
  },
  selectKcPath: function (callback) {
    folderDg({
      dialogTitle: _l('选择路径'),
      isFolderNode: 1,
      reRootName: true,
    })
      .then(result => {
        // 路径处理逻辑直接拷贝的动态的存入知识处理逻辑
        var path = result.type === 3 ? result.rootName || '' : result.node.name;
        path += '/';
        if (result.type == 3) {
          var position = result.node.position;
          var positionArr = position.split('/');
          var isOmit = false;
          positionArr.forEach(function (part, i) {
            if (i > 1) {
              if (i > positionArr.length - 4) {
                var partStr = part;
                path += partStr + '/';
              } else {
                if (!isOmit) {
                  path += '.../';
                  isOmit = true;
                }
              }
            }
          });
        }
        path = path
          .split('/')
          .map(function (str) {
            return '<span class="pathStr ellipsis">' + str + '</span>';
          })
          .join('/');
        callback(result, path);
      })
      .catch(() => {
        // alert('保存失败，未能成功调出知识文件选择层');
      });
  },
  sendToMobile: function (sendToType) {
    var SA = this;
    var options = SA.options;
    var attachmentType = options.attachmentType;
    var file = {};
    var ext = options.ext.replace(/^\./, '');
    file.fullName = options.name + (ext ? '.' + ext : '');
    switch (attachmentType) {
      case ATTACHMENT_TYPE.COMMON:
        file.fileID = options.id;
        break;
      case ATTACHMENT_TYPE.KC:
        file.shareUrl = options.node.shareUrl + '#';
        if (options.node.canChangeEditable && SA.options.node.visibleType !== NODE_VISIBLE_TYPE.PUBLIC) {
          KcController.updateNode({
            id: options.node.id,
            visibleType: NODE_VISIBLE_TYPE.PUBLIC,
          }).then(function (data) {
            alert(_l('已将链接设为“任何人可预览”，可直接打开'), 4);
            SA.options.node.visibleType = NODE_VISIBLE_TYPE.PUBLIC;
            SA.$dialog
              .find('#selectSharePermission')
              .data()
              .select.setValue(NODE_VISIBLE_TYPE.PUBLIC, _l('允许任何人查看'));
            if (SA.callbacks.performUpdateItem) {
              SA.callbacks.performUpdateItem(parseInt(NODE_VISIBLE_TYPE.PUBLIC, 10));
            }
          });
        }
        break;
      case ATTACHMENT_TYPE.QINIU:
        file.qiniuPath = options.qiniuPath;
        file.name = options.name;
        file.ext = options.ext.replace(/^\./, '');
        file.size = options.size;
        break;
      case ATTACHMENT_TYPE.WORKSHEET:
        file.name = options.name;
        file.shareUrl = options.node.shareUrl;
        break;
      case ATTACHMENT_TYPE.WORKSHEETROW:
        file.name = options.name;
        file.shareUrl = options.node.shareUrl;
        break;
      default:
        break;
    }
    SA.sendToMobileDialog = toMobileDailog({
      attachmentType: attachmentType,
      sendToType: sendToType,
      file: file,
    });
  },
  share: function () {
    var SA = this;
    var node = SA.options.node;
    var allowDown = true;
    var attachmentType = SA.options.attachmentType;
    var shareDesc = SA.$dialog.find('#shareDesc').val().trim();
    var params = {};
    var files;
    if (SA.options.attachmentType !== ATTACHMENT_TYPE.KC && SA.dialogEle.$canDownloadSwitch.length) {
      allowDown = SA.dialogEle.$canDownloadSwitch.prop('checked');
      node.allowDown = SA.dialogEle.$canDownloadSwitch.prop('checked');
    }
    switch (SA.sendToTargetType) {
      case SEND_TO_TYPE.CHAT: {
        if (!SA.selectedChat) {
          alert(_l('请选择要发送到的聊天'), 3);
          return;
        }
        var CHAT_TYPE = {
          PERSON: 1,
          GROUP: 2,
        };
        var selectedChatType = (SA.selectedChat || {}).type;
        var sendPromise;
        if (attachmentType === ATTACHMENT_TYPE.COMMON) {
          if (SA.newFileName) {
            node.originalFileName = SA.newFileName;
          }
          var key = node.filePath + node.fileName + node.fileExt;
          files = [
            {
              fileName: node.originalFileName + node.fileExt,
              serverName: node.serverName,
              key: key,
              fileSize: node.fileSize,
              fileID: node.fileID,
            },
          ];
          params = {
            files: files,
            message: shareDesc,
            toAccountId: '',
            toGroupId: '',
          };
          params[selectedChatType === CHAT_TYPE.PERSON ? 'toAccountId' : 'toGroupId'] = (SA.selectedChat || {}).value;
          sendPromise = ChatController.sendFileToChat(params);
        } else if (attachmentType === ATTACHMENT_TYPE.KC) {
          var cards = [
            {
              entityId: node.id,
              cardType: node.type === 1 ? CHAT_CARD_TYPE.KCFOLDER : CHAT_CARD_TYPE.KCFILE,
              title: node.name + (node.ext ? '.' + node.ext : ''),
              url: node.type === 1 ? node.shareUrl : undefined,
            },
          ];
          params = {
            cards: cards,
            message: shareDesc,
            toAccountId: '',
            toGroupId: '',
          };
          params[selectedChatType === CHAT_TYPE.PERSON ? 'toAccountId' : 'toGroupId'] = (SA.selectedChat || {}).value;
          sendPromise = ChatController.sendCardToChat(params);
        } else if (attachmentType === ATTACHMENT_TYPE.QINIU) {
          var originalFileName = SA.options.name;
          if (SA.newFileName) {
            originalFileName = SA.newFileName;
          }
          files = [
            {
              fileName: originalFileName + node.fileExt,
              serverName: node.serverName,
              key: node.key,
              fileSize: node.fileSize,
            },
          ];
          params = {
            files: files,
            message: shareDesc,
            toAccountId: '',
            toGroupId: '',
          };
          params[selectedChatType === CHAT_TYPE.PERSON ? 'toAccountId' : 'toGroupId'] = (SA.selectedChat || {}).value;
          sendPromise = ChatController.sendFileToChat(params);
        } else if (attachmentType === ATTACHMENT_TYPE.WORKSHEET || attachmentType === ATTACHMENT_TYPE.WORKSHEETROW) {
          params = {
            cards:
              attachmentType === ATTACHMENT_TYPE.WORKSHEET
                ? [
                    {
                      entityId: SA.options.id,
                      extra: {
                        appId: SA.options.appId,
                        viewId: SA.options.viewId,
                      },
                      cardType: CHAT_CARD_TYPE.WORKSHEET,
                      title: SA.options.name,
                      url: node.shareUrl,
                    },
                  ]
                : [
                    {
                      entityId: SA.options.id,
                      cardType: CHAT_CARD_TYPE.WORKSHEETROW,
                      title: SA.options.name,
                      extra: {
                        rowId: SA.options.rowId,
                        viewId: SA.options.viewId,
                        appId: SA.options.appId,
                      },
                    },
                  ],
            message: shareDesc,
            toAccountId: '',
            toGroupId: '',
          };
          params[selectedChatType === CHAT_TYPE.PERSON ? 'toAccountId' : 'toGroupId'] = (SA.selectedChat || {}).value;
          sendPromise = ChatController.sendCardToChat(params);
        }
        sendPromise
          .then(function (data) {
            alert(_l('发送成功'));
            if ($('.shareAttachmentDialog')[0]) {
              $('.shareAttachmentDialog').parent().remove();
            }
          })
          .catch(function (err) {
            alert(_l('发送失败'), err);
          });
        break;
      }
      case SEND_TO_TYPE.FEED: {
        SA.activeSendToOther(SEND_TO_TYPE.FEED);
        break;
      }
      case SEND_TO_TYPE.TASK: {
        if (!SA.selectedTask) {
          alert(_l('请选择要发送到的任务'), 3);
        }
        params = {
          sourceId: SA.selectedTask.taskID,
          appId: md.global.APPInfo.taskAppID,
          sourceType: 1,
          message: shareDesc || (attachmentType === ATTACHMENT_TYPE.KC ? '分享了知识下的文件' : '添加了文件：'),
          attachments: JSON.stringify([]),
        };
        if (attachmentType === ATTACHMENT_TYPE.COMMON) {
          if (SA.newFileName) {
            node.originalFileName = SA.newFileName;
          }
          params.attachments = JSON.stringify([node]);
        } else if (attachmentType === ATTACHMENT_TYPE.KC) {
          params.knowledgeAtts = JSON.stringify([
            {
              refId: node.id,
              fileExt: '.' + node.ext,
              fileSize: node.size,
              originalFileName: node.name,
              viewUrl: RegExpValidator.fileIsPicture('.' + node.ext) ? node.viewUrl : null,
              type: node.type === 1 ? 1 : undefined,
            },
          ]);
        } else if (attachmentType === ATTACHMENT_TYPE.QINIU) {
          // 七牛原始文件
          node.originalFileName = SA.options.name;
          if (SA.newFileName) {
            node.originalFileName = SA.newFileName;
          }
          params.attachments = JSON.stringify([node]);
        }
        DiscussionController.addDiscussion(params)
          .then(function (data) {
            if (data.error) {
              alert(_l('分享失败'), 2);
              return;
            }
            alert(_l('分享成功'));
            if ($('.shareAttachmentDialog')[0]) {
              $('.shareAttachmentDialog').parent().remove();
            }
          })
          .catch(function (err) {
            alert(_l('分享失败'), err);
          });
        break;
      }
      case SEND_TO_TYPE.CALENDAR: {
        SA.activeSendToOther(SEND_TO_TYPE.CALENDAR);
        break;
      }
      case SEND_TO_TYPE.KC: {
        if (!SA.kcPath) {
          alert(_l('请先选择文件夹'), 3);
          return;
        }
        var sourceData = {};
        sourceData.des = shareDesc;
        sourceData.allowDown = allowDown;
        if (attachmentType === ATTACHMENT_TYPE.COMMON) {
          sourceData.fileID = SA.options.id;
          if (SA.newFileName) {
            sourceData.originalFileName = SA.newFileName;
          }
        } else if (attachmentType === ATTACHMENT_TYPE.KC) {
          sourceData.nodeId = SA.options.id;
        } else if (attachmentType === ATTACHMENT_TYPE.QINIU) {
          sourceData.name = SA.options.name + (SA.options.ext[0] === '.' ? SA.options.ext : '.' + SA.options.ext);
          sourceData.filePath = SA.options.qiniuPath;
          if (SA.newFileName) {
            sourceData.name = SA.newFileName;
          }
        }
        saveToKnowledge(attachmentType, sourceData)
          .save(SA.kcPath)
          .then(function (message) {
            // alert(message || '保存成功');
            if ($('.shareAttachmentDialog')[0]) {
              $('.shareAttachmentDialog').parent().remove();
            }
          })
          .catch(function (message) {
            alert(message || _l('保存失败'), 3);
          });
        break;
      }
      default: {
        break;
      }
    }
  },
  formatQiniuPath: function (qiniuUrl) {
    var SA = this;
    var url = SA.parseUrl(qiniuUrl);
    var key = url.pathname.slice(1);
    var fullName = key.slice(key.lastIndexOf('/') + 1);
    return {
      serverName: `${url.origin}/`,
      key,
      fileName: RegExpValidator.getNameOfFileName(fullName),
      fileExt: `.${RegExpValidator.getExtOfFileName(fullName)}`,
      fileSize: SA.options.node.size,
      filePath: key.replace(fullName, ''),
    };
  },
  parseUrl: function (url) {
    var a = document.createElement('a');
    a.href = url;
    return {
      protocol: a.protocol,
      hostname: a.hostname,
      port: a.port,
      pathname: ('/' + a.pathname).replace('//', '/'),
      search: a.search,
      hash: a.hash,
      origin: a.origin,
    };
  },
  previewFile: function () {
    var SA = this;
    SA.dialogEle.$fileIcon = SA.$dialog.find('.fileIcon');
    SA.dialogEle.$fileSize = SA.$dialog.find('.fileSize');
    SA.dialogEle.$thumbnailCon = SA.$dialog.find('.thumbnailCon');
    SA.dialogEle.$thumbnail = SA.$dialog.find('.thumbnail');
    if (RegExpValidator.fileIsPicture('.' + SA.file.ext) && SA.file.imgSrc) {
      SA.loadPicture();
    } else {
      SA.loadDocIcon();
    }
  },
  loadDocIcon: function () {
    var SA = this;
    var fileIconClass = SA.options.isKcFolder
      ? SA.options.node && SA.options.node.isOpenShare
        ? 'fileIcon-folderShared'
        : 'fileIcon-folder'
      : getClassNameByExt('.' + SA.file.ext);
    if (SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET) {
      fileIconClass = 'worksheetIcon';
    } else if (SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW) {
      fileIconClass = 'worksheetRecordIcon';
    }
    SA.dialogEle.$fileIcon.removeClass().addClass('fileIcon ' + fileIconClass);
    SA.dialogEle.$fileSize.text(formatFileSize(SA.file.size).replace(/ /g, ''));
  },
  loadPicture: function () {
    var SA = this;
    SA.dialogEle.$thumbnailCon.removeClass('hide');
    var reader = new FileReader();
    var img = document.createElement('img');
    img.addEventListener(
      'error',
      function () {
        SA.dialogEle.$thumbnail.hide();
        SA.loadDocIcon();
      },
      false,
    );
    img.src = SA.file.imgSrc;
    SA.dialogEle.$thumbnail.append(img).show();
  },
  getFullFileName: function () {
    var SA = this;
    return SA.dialogEle.$fileName.val() + (SA.file.ext ? '.' + SA.file.ext : '');
  },
  validate: function (str) {
    var illegalChars = /[\/\\\:\*\?\"\<\>\|]/g;
    var valid = illegalChars.test(str);
    if (valid) {
      alert(_l('名称不能包含以下字符：') + '\\ / : * ? " < > |', 3);
      return false;
    }
    return true;
  },
  updateVisibleType(visibleType, callback) {
    var SA = this;
    visibleType = parseInt(visibleType, 10);
    KcController.updateNode({
      id: SA.options.id,
      visibleType: visibleType,
    })
      .then(function (data) {
        if (SA.options.isKcFolder) {
          SA.options.node.visibleType = visibleType;
          SA.options.node.isOpenShare = visibleType === NODE_VISIBLE_TYPE.PUBLIC;
          SA.loadDocIcon();
        }
        alert(_l('修改成功'));
        if (callback) {
          callback(parseInt(visibleType, 10));
        }
        if (SA.callbacks.performUpdateItem) {
          SA.callbacks.performUpdateItem(parseInt(visibleType, 10));
        }
      })
      .catch(function (err) {
        alert(_l('修改失败'), 3);
      });
  },
  updateWorkSheetVisibleType(visibleType, callback) {
    var SA = this;
    visibleType = parseInt(visibleType, 10);
    WorksheetController.updateWorksheetShareRange({
      worksheetId: SA.options.id,
      viewId: SA.options.viewId,
      shareRange: visibleType,
    })
      .then(function (data) {
        alert(_l('修改成功'));
        callback(visibleType);
        if (SA.callbacks.updateView) {
          SA.callbacks.updateView({ shareRange: visibleType });
        }
      })
      .catch(function (err) {
        alert(_l('修改失败'), 3);
      });
  },
  updateWorksheetRowShareRange(visibleType, callback) {
    var SA = this;
    visibleType = parseInt(visibleType, 10);
    WorksheetController.updateWorksheetRowShareRange({
      worksheetId: SA.options.id,
      rowId: SA.options.rowId,
      shareRange: visibleType,
    })
      .then(function (data) {
        alert(_l('修改成功'));
        callback(visibleType);
        if (SA.callbacks.updateShareRangeOfRecord) {
          SA.callbacks.updateShareRangeOfRecord(visibleType);
        }
      })
      .catch(function (err) {
        alert(_l('修改失败'), 3);
      });
  },
  cutString(str, length, suffix) {
    if (str.length > length) {
      str = str.substr(0, length) + (suffix || '...');
    }
    return str;
  },
  getExt: function (ext) {
    return !ext ? '' : ext[0] === '.' ? ext.slice(1) : ext;
  },
};

export default function (options, callbacks) {
  return new ShareAttachment(options, callbacks);
}
