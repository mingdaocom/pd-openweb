import React from 'react';
import _ from 'lodash';
import { Modal } from 'ming-ui/antd-components';
import AttachmentController from 'src/api/attachment';
import ChatController from 'src/api/chat';
import DiscussionController from 'src/api/discussion';
import KcController from 'src/api/kc';
import WorksheetController from 'src/api/worksheet';
import folderDg from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import saveToKnowledge from 'src/components/kc/saveToKnowledge/saveToKnowledge';
import createFeed from 'src/pages/feed/components/createFeed/load';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { _convertToOtherAttachment } from './ajax';
import { ATTACHMENT_TYPE, CHAT_CARD_TYPE, NODE_VISIBLE_TYPE, SEND_TO_TYPE, WORKSHEET_VISIBLE_TYPE } from './enum';
import { ShareAttachmentContent } from './ShareAttachmentContent';
import openMobileShareDialog from './toMobile';

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
    var showChangeDownload = !(
      RegExpValidator.fileIsPicture(SA.options.ext) ||
      SA.options.attachmentType === ATTACHMENT_TYPE.KC ||
      SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET ||
      SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW
    );
    var showChangeShare =
      SA.options.attachmentType === ATTACHMENT_TYPE.KC ||
      SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET ||
      SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW;
    SA.showChangeDownload = showChangeDownload;
    SA.selectTargetInited = false;
    SA.sendToOtherInited = false;
    SA.copyLinkInited = false;
    SA.contentRef = React.createRef();

    SA.handleContentMount = () => SA.mountContent();
    SA.handleCancel = () => SA.modal?.destroy();
    SA.handleDestinationChange = (type, data) => SA.selectDestination(type, data);
    SA.handleKnowledgePathClick = () => SA.openKnowledgePath();
    SA.handlePermissionChange = value => SA.changePermission(value);
    SA.handleShare = () => SA.share();
    SA.handleSendToTypeChange = type => SA.activeSendToOther(type);
    SA.handleDestroy = () => {
      SA.destroyed = true;
    };

    SA.modal = Modal.confirm({
      afterClose: SA.handleDestroy,
      onCancel: SA.handleDestroy,
      wrapClassName: 'shareAttachmentDialog',
      width: 540,
      title: SA.options.dialogTitle || _l('分享'),
      styles: {
        body: { overflow: 'visible' },
      },
      content: (
        <ShareAttachmentContent
          ref={SA.contentRef}
          attachmentType={options.attachmentType}
          defaultSendToType={options.sendToTargetType}
          file={SA.file}
          forbidSuites={md.global.SysSettings.forbidSuites}
          initialNode={options.node && typeof options.node === 'object' ? options.node : undefined}
          isKcFolder={options.isKcFolder}
          onCancel={SA.handleCancel}
          onDestinationChange={SA.handleDestinationChange}
          onKnowledgePathClick={SA.handleKnowledgePathClick}
          onMount={SA.handleContentMount}
          onPermissionChange={SA.handlePermissionChange}
          onShare={SA.handleShare}
          onSendToTypeChange={SA.handleSendToTypeChange}
          showChangeDownload={showChangeDownload}
          showChangeShare={showChangeShare}
        />
      ),
      footer: null,
    });
  },
  mountContent: function () {
    var SA = this;
    if (SA.destroyed) return;

    var options = SA.options;
    if (options.attachmentType === ATTACHMENT_TYPE.KC && options.node) {
      SA.initModules();
    } else {
      SA.fetchBaseData(SA.initModules.bind(SA));
    }
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
    if (SA.destroyed) return;

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
  initSelectTargetList: function () {
    var SA = this;
    SA.selectTargetInited = true;
    SA.contentRef.current?.updateUiState({ targetListVisible: true });
  },
  initSelectPermission: function () {
    var SA = this;
    var rootInfo = SA.options.rootInfo || SA.options.node.rootInfo || {};
    var shareVisibleArea = _l('允许所有联系人查看');
    var permissionList;
    SA.contentRef.current?.updateUiState({ shareSettingsVisible: true });
    SA.contentRef.current?.setShareUrl(SA.options.node.shareUrl);
    SA.contentRef.current?.setFolderShared(Boolean(SA.options.node.isOpenShare));
    if (SA.options.node.visibleType !== NODE_VISIBLE_TYPE.CLOSE) {
      SA.initCopyLinkBtn();
    } else {
      SA.contentRef.current?.updateUiState({ closedTipVisible: true });
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
                label: _l('关闭文件夹分享'),
              },
              {
                value: NODE_VISIBLE_TYPE.PUBLIC,
                label: _l('允许任何人查看'),
              },
            ]
          : [
              {
                value: NODE_VISIBLE_TYPE.CLOSE,
                label: _l('关闭文件分享'),
              },
              {
                value: NODE_VISIBLE_TYPE.PROJECT,
                label: shareVisibleArea,
              },
              {
                value: NODE_VISIBLE_TYPE.PUBLIC,
                label: _l('允许任何人查看'),
              },
            ];
    } else if (
      SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET ||
      SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW
    ) {
      permissionList = [
        {
          value: 1,
          label: _l('关闭分享'),
        },
        {
          value: 2,
          label: _l('允许任何人查看'),
        },
      ];
    }

    SA.contentRef.current?.setPermissionConfig({
      disabled: !SA.options.node.canChangeSharable,
      options: permissionList,
      value: SA.options.node.visibleType,
    });
  },
  changePermission: function (value) {
    var SA = this;
    SA.updateShareType(value, function (visibleType) {
      // 当知识分享权限变动，切换模块显示
      SA.options.node.visibleType = visibleType;
      function handleActivTarget() {
        if (SA.sendToOtherInited) {
          SA.contentRef.current?.updateUiState({ footerVisible: true, sendToOtherVisible: true });
        } else if (!SA.selectTargetInited) {
          if (SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEETROW) {
            SA.activeSendToOther(SEND_TO_TYPE.CHAT);
          } else {
            SA.initSelectTargetList();
          }
        } else {
          SA.contentRef.current?.updateUiState({ targetListVisible: true });
        }

        if (SA.copyLinkInited) {
          SA.contentRef.current?.setCopyLinkVisible(true);
        } else {
          SA.initCopyLinkBtn();
        }

        SA.contentRef.current?.updateUiState({ closedTipVisible: false });
      }

      if (SA.checkClose(visibleType)) {
        if (SA.sendToOtherInited) {
          SA.contentRef.current?.updateUiState({ footerVisible: false, sendToOtherVisible: false });
        } else {
          SA.contentRef.current?.updateUiState({ targetListVisible: false });
        }

        SA.contentRef.current?.setCopyLinkVisible(false);
        SA.contentRef.current?.updateUiState({ closedTipVisible: true });
      } else if (SA.options.attachmentType === ATTACHMENT_TYPE.WORKSHEET) {
        SA.copyLinkInited = false;
        SA.contentRef.current?.setCopyLinkVisible(false);
        SA.updateWorkshhetShareUrl(1, handleActivTarget);
      } else {
        handleActivTarget();
      }
    });
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
    SA.copyLinkInited = true;
    SA.contentRef.current?.setShareUrl(SA.options.node.shareUrl);
    SA.contentRef.current?.setCopyLinkVisible(true);
  },
  selectDestination: function (type, data) {
    if (this.sendToTargetType !== type) return;

    if (type === SEND_TO_TYPE.CHAT) {
      this.selectedChat = data;
    } else if (type === SEND_TO_TYPE.TASK) {
      this.selectedTask = data;
    }
  },
  openKnowledgePath: function () {
    var SA = this;
    SA.selectKcPath(function (result, pathParts) {
      if (SA.destroyed || SA.sendToTargetType !== SEND_TO_TYPE.KC) return;

      SA.kcPath = result;
      SA.contentRef.current?.setKnowledgePath(pathParts);
    });
  },
  getFormData: function () {
    const formData = this.contentRef.current?.getFormData() || {
      allowDownload: true,
      description: '',
      fileName: this.file.name,
    };
    this.newFileName = formData.fileName === this.file.name ? undefined : formData.fileName;
    return formData;
  },
  activeSendToOther: function (type) {
    var SA = this;
    if (!SA.options.node) return;
    const formData = SA.getFormData();
    SA.sendToTargetType = type;
    SA.contentRef.current?.setSendToType(type);
    SA.options.node.allowDown = true;
    var shareDesc = formData.description;

    // 删除消息和任务已选择的数据
    delete SA.selectedChat;
    delete SA.selectedTask;

    if (SA.showChangeDownload) {
      SA.options.node.allowDown = formData.allowDownload;
    }

    // 将允许下载switch设为可更改
    SA.contentRef.current?.setAllowDownloadDisabled(false);
    switch (type) {
      case SEND_TO_TYPE.CHAT: {
        SA.contentRef.current?.setAllowDownloadDisabled(true);
        if (!formData.allowDownload) {
          alert(_l('分享到消息文件不可设为不允许下载，已更改为允许下载'), 4);
          SA.contentRef.current?.setAllowDownload(true);
          SA.options.node.allowDown = true;
        }

        SA.showFooter();
        SA.sendToOtherInited = true;
        SA.contentRef.current?.updateUiState({ sendToOtherVisible: true, targetListVisible: false });
        break;
      }

      case SEND_TO_TYPE.FEED: {
        var sObj = {
          callback: function () {
            SA.modal?.destroy();
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
        SA.sendToOtherInited = true;
        SA.contentRef.current?.updateUiState({ sendToOtherVisible: true, targetListVisible: false });
        break;
      }

      case SEND_TO_TYPE.QR: {
        SA.sendToMobile(type);
        console.log('QR');
        break;
      }

      case SEND_TO_TYPE.CALENDAR: {
        var cObj = {
          callback: function (source) {
            source && SA.modal?.destroy();
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

        SA.contentRef.current?.openCalendar(cObj);
        break;
      }

      case SEND_TO_TYPE.KC: {
        if (SA.options.attachmentType === ATTACHMENT_TYPE.KC && !SA.options.node.canDownload) {
          alert(_l('您权限不足，无法下载或保存，请联系管理员或文件上传者'), 3);
          return;
        }

        SA.showFooter();
        SA.sendToOtherInited = true;
        SA.contentRef.current?.updateUiState({ sendToOtherVisible: true, targetListVisible: false });
        SA.kcPath = undefined;
        SA.contentRef.current?.setKnowledgePath(undefined);
        SA.openKnowledgePath();
        break;
      }

      default: {
        break;
      }
    }
  },
  showFooter: function () {
    this.contentRef.current?.updateUiState({ footerVisible: true });
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

        callback(result, path.split('/'));
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
          }).then(function () {
            alert(_l('已将链接设为“任何人可预览”，可直接打开'), 4);
            SA.options.node.visibleType = NODE_VISIBLE_TYPE.PUBLIC;
            SA.contentRef.current?.setPermissionValue(NODE_VISIBLE_TYPE.PUBLIC);
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

    SA.sendToMobileDialog = openMobileShareDialog({
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
    const formData = SA.getFormData();
    var shareDesc = formData.description;
    var params = {};
    var files;
    if (SA.showChangeDownload) {
      allowDown = formData.allowDownload;
      node.allowDown = formData.allowDownload;
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
          .then(function () {
            alert(_l('发送成功'));
            SA.modal?.destroy();
          })
          .catch(function (err) {
            alertIfNotUnauthorized(err, _l('发送失败'), 2);
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
          return;
        }

        params = {
          sourceId: SA.selectedTask.taskID,
          appId: md.global.APPInfo.taskAppID,
          sourceType: 1,
          message: shareDesc || (attachmentType === ATTACHMENT_TYPE.KC ? _l('分享了知识下的文件') : _l('添加了文件：')),
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
            SA.modal?.destroy();
          })
          .catch(function (err) {
            alertIfNotUnauthorized(err, _l('分享失败'), 2);
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
          .then(function () {
            SA.modal?.destroy();
          })
          .catch(function (message) {
            alertIfNotUnauthorized(message, message || _l('保存失败'), 3);
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
      url: qiniuUrl,
      previewUrl: SA.options.node.previewUrl,
      fileName: RegExpValidator.getNameOfFileName(fullName),
      fileExt: `.${RegExpValidator.getExtOfFileName(fullName)}`,
      fileSize: SA.options.node.size,
      filePath: key.replace(fullName, ''),
    };
  },
  parseUrl: function (url) {
    const parsedUrl = new URL(url, window.location.href);
    return {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      pathname: ('/' + parsedUrl.pathname).replace('//', '/'),
      search: parsedUrl.search,
      hash: parsedUrl.hash,
      origin: parsedUrl.origin,
    };
  },
  validate: function (str) {
    var illegalChars = /[/\\:*?"<>|]/g;
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
      .then(function () {
        if (SA.options.isKcFolder) {
          SA.options.node.visibleType = visibleType;
          SA.options.node.isOpenShare = visibleType === NODE_VISIBLE_TYPE.PUBLIC;
          SA.contentRef.current?.setFolderShared(SA.options.node.isOpenShare);
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
        console.error(err);
        alertIfNotUnauthorized(err, _l('修改失败'), 3);
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
      .then(function () {
        alert(_l('修改成功'));
        callback(visibleType);
        if (SA.callbacks.updateView) {
          SA.callbacks.updateView({ shareRange: visibleType });
        }
      })
      .catch(function (err) {
        console.error(err);
        alertIfNotUnauthorized(err, _l('修改失败'), 3);
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
      .then(function () {
        alert(_l('修改成功'));
        callback(visibleType);
        if (SA.callbacks.updateShareRangeOfRecord) {
          SA.callbacks.updateShareRangeOfRecord(visibleType);
        }
      })
      .catch(function (err) {
        console.error(err);
        alertIfNotUnauthorized(err, _l('修改失败'), 3);
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
