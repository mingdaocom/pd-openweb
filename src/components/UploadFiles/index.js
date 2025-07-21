import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { QiniuUpload } from 'ming-ui';
import { addLinkFile } from 'ming-ui/functions';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import GenScanUploadQr from 'worksheet/components/GenScanUploadQr';
import { openControlAttachmentInNewTab } from 'worksheet/controllers/record';
import selectNode from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import { FROM } from 'src/components/newCustomFields/tools/config';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import * as ajax from 'src/pages/kc/common/AttachmentsPreview/ajax';
import { formatFileSize } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import FileComponent from './File';
import {
  checkAccountUploadLimit,
  checkFileAvailable,
  findIndex,
  findIsId,
  formatKcAttachmentData,
  formatResponseData,
  formatTemporaryData,
  getAttachmentTotalSize,
  getFilesSize,
  isValid,
  openMdDialog,
} from './utils';
import './index.less';

const errorCode = {
  40001: _l('鉴权失败'),
  40002: _l('非法的文件类型'),
  40003: _l('bucket 不存在'),
  40004: _l('文件大小错误'),
  50002: _l('系统错误 metadata error'),
  50003: _l('系统错误 hash error'),
  50004: _l('系统错误'),
};

export default class UploadFiles extends Component {
  static contextType = RecordInfoContext;
  static propTypes = {
    /**
     * 不限制上传的量
     */
    noTotal: PropTypes.bool,
    /**
     * 来源
     */
    from: PropTypes.number,
    /**
     * arrow 的 left 值
     */
    arrowLeft: PropTypes.number,
    /**
     * 是否显示添加链接文件
     */
    canAddLink: PropTypes.bool,
    /**
     * 是否显示添加知识文件
     */
    canAddKnowledge: PropTypes.bool,
    /**
     * 文件的最小宽度
     */
    minWidth: PropTypes.number,
    /**
     * 文件的最大宽度
     */
    maxWidth: PropTypes.number,
    /**
     * 文件的高度
     */
    height: PropTypes.number,
    /**
     * 是否能上传
     */
    isUpload: PropTypes.bool,
    /**
     * 预览层是否显示展开详情
     */
    showAttInfo: PropTypes.bool,
    /**
     * 回调函数是否在组件初始化後调用
     */
    isInitCall: PropTypes.bool,
    /**
     * 文件列表
     */
    attachmentData: PropTypes.array,
    /**
     * 文件列表的删除回调
     */
    onDeleteAttachmentData: PropTypes.func,
    /**
     * 展示状态下的文件是否需要删除 (仅任务模块使用)
     */
    isDeleteFile: PropTypes.bool,
    /**
     * 展示状态下的文件是否需要删除知识文件
     */
    isDeleteKcFile: PropTypes.bool,
    /**
     * 来自知识的文件
     */
    kcAttachmentData: PropTypes.array,
    /**
     * 更改 kcAttachmentData 数据的回调函数
     */
    onKcAttachmentDataUpdate: PropTypes.func,
    /**
     * 临时的图片列表（上传到七牛上，但是没有到站点上）
     */
    temporaryData: PropTypes.array,
    /**
     * 更改 temporaryData 数据的回调函数
     */
    onTemporaryDataUpdate: PropTypes.func,
    /**
     * 上传状态的回调
     */
    onUploadComplete: PropTypes.func,
    /**
     * 文件退拽上传的区域和黏贴的区域
     */
    dropPasteElement: PropTypes.string,
    /**
     * 文件退拽上传的区域和黏贴的区域 触发回调函数
     */
    onDropPasting: PropTypes.func,
    /**
     * 附件是否行显示，(Commenter)
     */
    rowDisplay: PropTypes.bool,
    /**
     * 预览层隐藏按钮
     */
    previewHideFunctions: PropTypes.arrayOf(PropTypes.string),
    removeDeleteFilesFn: PropTypes.bool,
  };
  static defaultProps = {
    canAddLink: false,
    canAddKnowledge: true,
    minWidth: 140,
    maxWidth: 200,
    height: 118,
    isUpload: true,
    showAttInfo: true,
    isInitCall: false,
    attachmentData: [],
    onDeleteAttachmentData: () => {},
    isDeleteFile: false,
    isDeleteKcFile: true,
    kcAttachmentData: [],
    onKcAttachmentDataUpdate: () => {},
    temporaryData: [],
    onTemporaryDataUpdate: () => {},
    onUploadComplete: () => {},
    dropPasteElement: '',
    onDropPasting: () => {},
    rowDisplay: false,
    removeDeleteFilesFn: false,
  };
  constructor(props) {
    super(props);
    const { attachmentData, temporaryData, kcAttachmentData, originCount } = this.props;
    this.state = {
      attachmentData,
      temporaryData: formatTemporaryData(temporaryData),
      kcAttachmentData: formatKcAttachmentData(kcAttachmentData),
      maxTotalSize: md.global.SysSettings.fileUploadLimitSize,
      originCount: originCount || 0,
    };
    // 当前上传的文件
    this.currentFile = null;
    this.id = `UploadFiles-${Date.now()}`;
    this.errorFiles = [];
    this.tokens = null;
  }

  componentDidMount() {
    const { temporaryData, kcAttachmentData } = this.state;
    const { isInitCall, isUpload } = this.props;

    if (isInitCall) {
      this.props.onTemporaryDataUpdate(temporaryData);
      this.props.onKcAttachmentDataUpdate(kcAttachmentData);
    }
  }

  componentWillReceiveProps(nextProps) {
    if ('attachmentData' in nextProps && !this._uploading) {
      this.setState({
        attachmentData: nextProps.attachmentData,
      });
    }
    if ('temporaryData' in nextProps && !this._uploading) {
      this.setState({
        temporaryData: formatTemporaryData(nextProps.temporaryData),
      });
    }
    if ('kcAttachmentData' in nextProps && !this._uploading) {
      this.setState({
        kcAttachmentData: formatKcAttachmentData(nextProps.kcAttachmentData),
      });
    }
    if (nextProps.originCount !== this.props.originCount) {
      this.setState({
        originCount: nextProps.originCount,
      });
    }
  }

  handleOpenControlAttachmentInNewTab(fileID, options = {}) {
    const { controlId } = this.props;
    const recordBaseInfo = _.get(this, 'context.recordBaseInfo');
    if (!recordBaseInfo) {
      return;
    }
    openControlAttachmentInNewTab(
      _.assign(
        _.pick(recordBaseInfo, ['appId', 'recordId', 'viewId', 'worksheetId']),
        {
          controlId,
          fileId: fileID,
        },
        options,
      ),
    );
  }

  onRemoveAll(uploader) {
    uploader.files.forEach(item => {
      setTimeout(() => {
        uploader.removeFile({ id: item.id });
      }, 0);
    });
    this._uploading = false;
    this.props.onUploadComplete(true);
  }
  onOpenFolderSelectDialog() {
    selectNode({
      isFolderNode: 2,
    }).then(result => {
      let { kcAttachmentData, temporaryData, originCount } = this.state;
      let { advancedSetting } = this.props;
      let newKcAttachmentData = result.node.map(node => {
        // 在添加之前，找出重复的文件
        if (kcAttachmentData.filter(n => n.refId == node.id).length) {
          alert(_l('已引用该文件'), 3);
          return false;
        }

        return {
          isUpload: true,
          fileID: node.id,
          refId: node.id,
          originalFileName: node.name,
          fileExt: node.ext ? '.' + node.ext : '',
          fileSize: node.size,
          allowDown: node.isDownloadable,
          viewUrl: RegExpValidator.fileIsPicture('.' + node.ext) ? node.viewUrl : null,
          node,
        };
      });

      // 可能会有重复的文件，用 false 表示的，这里需要过滤一下
      newKcAttachmentData = kcAttachmentData.concat(newKcAttachmentData.filter(n => n));
      let isAvailable = true;
      // 附件配置控制（包含数量、单个文件大小、类型）
      if (advancedSetting) {
        isAvailable = checkFileAvailable(advancedSetting, newKcAttachmentData, temporaryData.length + originCount);
      }
      if (!isAvailable) return;

      // 最多只能上传20个知识文件
      if (newKcAttachmentData.length > 100) {
        alert(_l('附件数量超过限制，一次上传不得超过100个附件'), 3);
        return false;
      }

      this.setState(
        {
          kcAttachmentData: newKcAttachmentData,
        },
        () => {
          this.props.onKcAttachmentDataUpdate(newKcAttachmentData);
          if (this._uploading) return;
          // 必须等待 onKcAttachmentDataUpdate 把调用方当前的 state 更改后才能执行 onUploadComplete
          setTimeout(() => {
            this.props.onUploadComplete(true);
          }, 0);
        },
      );
    });
  }
  removeUploadingFile = id => {
    if (this.currentFile) {
      this.currentFile.stop();
      this.currentFile.removeFile({ id });
      this.currentFile.start();
    }
    const newTemporaryData = this.state.temporaryData.filter(item => item.id !== id);
    this.setState(
      {
        temporaryData: newTemporaryData,
      },
      () => {
        this.props.onTemporaryDataUpdate(newTemporaryData);
        if (!newTemporaryData.length) {
          this.props.onUploadComplete(true);
        }
      },
    );
  };
  openLinkDialog(item) {
    const _this = this;

    addLinkFile({
      showTitleTip: false,
      callback: link => {
        const { linkName, linkContent } = link;
        const { temporaryData } = this.state;
        if (
          temporaryData.filter(attachment => attachment.fileExt === '.url' && attachment.originLinkUrl).length >= 100
        ) {
          alert(_l('附件数量超过限制，一次上传不得超过100个附件'), 3);
          return;
        }
        const newTemporaryData = temporaryData.concat({
          fileID: Math.random().toString(),
          fileExt: '.url',
          originalFileName: linkName,
          oldOriginalFileName: linkName,
          originLinkUrl: linkContent,
          allowDown: true,
        });
        _this.setState({
          temporaryData: newTemporaryData,
        });
        _this.props.onTemporaryDataUpdate(newTemporaryData);
        _this.props.onUploadComplete(true);
      },
    });
  }
  onDeleteMDFile(attachment, event) {
    event.stopPropagation();
    const newAttachmentData = this.state.attachmentData.filter(item => item.fileID !== attachment.fileID);
    const { docVersionID, fileID, sourceID, commentID, fromType } = attachment;
    this.setState({
      attachmentData: newAttachmentData,
    });

    if (!this.props.removeDeleteFilesFn) {
      ajax
        .deleteAttachment(
          docVersionID,
          fileID,
          sourceID,
          commentID,
          fromType,
          undefined,
          attachment.originalFilename + attachment.ext,
        )
        .then(result => {
          alert(_l('删除成功'));
        })
        .catch(() => {
          alert(_l('删除文件失败'), 3);
        });
    }

    this.props.onDeleteAttachmentData(newAttachmentData);
  }
  onDeleteFile(id, event) {
    event.stopPropagation();
    const newTemporaryData = this.state.temporaryData.filter(item => item.fileID !== id);
    this.setState(
      {
        temporaryData: newTemporaryData,
      },
      () => {
        this.props.onTemporaryDataUpdate(newTemporaryData);
      },
    );
  }
  onDeleteKcFile(id, event) {
    event.stopPropagation();
    const newKcAttachmentData = this.state.kcAttachmentData.filter(item => item.refId !== id);
    this.setState(
      {
        kcAttachmentData: newKcAttachmentData,
      },
      () => {
        this.props.onKcAttachmentDataUpdate(newKcAttachmentData);
      },
    );
  }
  resetFileName(id, newName) {
    const { checkValueByFilterRegex } = this.props;
    newName = newName.trim();

    if (/[\/\\:\*\?"<>\|]/g.test(newName)) {
      alert(_l('名称不能包含以下字符：') + '\\ / : * ? " < > |', 3);
      return;
    }
    if (_.isEmpty(newName)) {
      alert(_l('名称不能为空'), 2);
      return;
    }
    if (checkValueByFilterRegex) {
      const error = checkValueByFilterRegex(newName);
      if (error) {
        alert(error, 2);
        return;
      }
    }
    const newTemporaryData = this.state.temporaryData.map(item => {
      if (item.fileID === id) {
        item.originalFileName = newName;
      }
      return item;
    });
    this.setState(
      {
        temporaryData: newTemporaryData,
      },
      () => {
        this.props.onTemporaryDataUpdate(newTemporaryData);
      },
    );
  }
  onMDPreview(id, index) {
    const currentFile = this.state.attachmentData[index];

    // 如果是文件夹就跳转
    if (currentFile.attachmentType === 5) {
      window.open(currentFile.shareUrl);
      return;
    }

    // 过滤文件夹 & 关闭分享链接的
    const attachments = this.state.attachmentData.filter(item => {
      if (item.refId && !item.shareUrl) {
        return false;
      }
      if (item.attachmentType == 5) {
        return false;
      }
      return true;
    });
    const { hideDownload = false } = this.props;
    let hideFunctions = (this.props.previewHideFunctions || []).concat(['editFileName']);
    if (hideDownload) {
      /* 是否不可下载 且 不可保存到知识和分享 */
      hideFunctions.push('download', 'share', 'saveToKnowlege');
    }
    previewAttachments(
      {
        attachments,
        index: findIndex(attachments, currentFile.fileID),
        callFrom: 'player',
        sourceID: currentFile.sourceID,
        commentID: currentFile.commentID,
        fromType: currentFile.fromType,
        docversionid: currentFile.docVersionID,
        showThumbnail: true,
        showAttInfo: this.props.showAttInfo,
        hideFunctions: hideFunctions,
      },
      {
        deleteCallback: (docversionid, fileId) => {
          const newAttachmentData = this.state.attachmentData.filter(item => item.fileID !== fileId);
          this.setState({
            attachmentData: newAttachmentData,
          });
          this.props.onDeleteAttachmentData(newAttachmentData);
        },
        mdReplaceAttachment: newAttachment => {
          let { attachmentData } = this.state;
          const newAttachmentData = attachmentData.slice();
          if (newAttachment && newAttachment.docVersionID) {
            const attachmentIndex = _.findIndex(attachmentData, d => d.docVersionID === newAttachment.docVersionID);
            if (attachmentIndex > -1) {
              newAttachmentData[attachmentIndex] = newAttachment;
              this.setState({
                attachmentData: newAttachmentData,
              });
            }
          }
        },
        openControlAttachmentInNewTab: this.props.controlId && this.handleOpenControlAttachmentInNewTab.bind(this),
      },
    );
  }
  onPreview(id, index, event) {
    if (event.target.classList.contains('UploadFiles-editInput')) {
      return;
    }
    const { temporaryData } = this.state;
    // 数据预览
    const mdData = temporaryData.filter(item => item.twice);
    // 七牛数据预览
    const quData = temporaryData.filter(item => !item.twice);

    // 查找索引
    const mdIndex = findIndex(mdData, id);
    const quIndex = findIndex(quData, id);

    if (mdIndex >= 0) {
      let hideFunctions = ['editFileName'];
      previewAttachments(
        {
          attachments: mdData.map(item => item.twice),
          index: mdIndex,
          callFrom: 'player',
          hideFunctions: hideFunctions,
        },
        {
          openControlAttachmentInNewTab: this.props.controlId && this.handleOpenControlAttachmentInNewTab.bind(this),
        },
      );
    } else if (quIndex >= 0) {
      let hideFunctions = ['editFileName', 'share', 'saveToKnowlege'];
      previewAttachments(
        {
          attachments: quData.map(item => {
            const twice = item.twice || {};
            const result = {
              name: `${item.originalFileName || '未命名'}${item.fileExt}`,
              path: item.previewUrl
                ? `${item.previewUrl}`
                : item.url
                  ? `${item.url}&imageView2/1/w/200/h/140`
                  : `${item.serverName}${item.key}`,
              previewAttachmentType: 'QINIU',
              size: item.fileSize,
              fileid: item.fileID,
            };
            if (item.fileExt === '.url') {
              result.linkUrl = item.originLinkUrl;
            }
            return result;
          }),
          index: quIndex,
          callFrom: 'chat',
          hideFunctions: hideFunctions,
        },
        {
          openControlAttachmentInNewTab: this.props.controlId && this.handleOpenControlAttachmentInNewTab.bind(this),
        },
      );
    }
  }
  onKcPreview(id, index) {
    const { kcAttachmentData } = this.state;
    let res = kcAttachmentData.filter(item => item.node);
    previewAttachments(
      {
        attachments: res.map(item => item.node),
        index: findIndex(res, id),
        callFrom: 'kc',
        hideFunctions: ['editFileName', 'share', 'saveToKnowlege'],
      },
      {
        openControlAttachmentInNewTab: this.props.controlId && this.handleOpenControlAttachmentInNewTab.bind(this),
      },
    );
  }
  onKcTwicePreview(id, index, event) {
    let { kcAttachmentData } = this.state;
    let attachments = kcAttachmentData.filter(item => !!(item.twice && item.twice.attachmentType !== 5));
    let preview = attachments.map(item => item.twice);

    if (preview[0].updater) {
      // 知识中心
      previewAttachments(
        {
          attachments: preview,
          index: findIndex(attachments, id),
          callFrom: 'kc',
        },
        {
          openControlAttachmentInNewTab: this.props.controlId && this.handleOpenControlAttachmentInNewTab.bind(this),
        },
      );
    } else {
      // 明道云
      previewAttachments(
        {
          attachments: preview,
          index: findIndex(attachments, id),
          callFrom: 'player',
        },
        {
          openControlAttachmentInNewTab: this.props.controlId && this.handleOpenControlAttachmentInNewTab.bind(this),
        },
      );
    }
  }
  onReplaceAttachment(newAttachment) {
    let { attachmentData } = this.state;
    const newAttachmentData = attachmentData.slice();
    if (newAttachment && newAttachment.fileID) {
      const index = _.findIndex(attachmentData, d => d.fileID === newAttachment.fileID);
      if (index > -1) {
        newAttachmentData[index] = newAttachment;
        this.setState({
          attachmentData: newAttachmentData,
        });
      }
    }
  }
  renderQiniuUpload() {
    const _this = this;
    const { maxTotalSize } = this.state;
    const { noTotal, dropPasteElement, from, projectId, appId, worksheetId, advancedSetting, checkValueByFilterRegex } =
      this.props;
    const isPublicWorkflow = _.get(window, 'shareState.isPublicWorkflowRecord');
    const isPublic = from === FROM.PUBLIC_ADD || from === FROM.WORKFLOW || window.isPublicWorksheet || isPublicWorkflow;
    const { licenseType } = _.find(md.global.Account.projects, item => item.projectId === projectId) || {};
    const getTokenParam = {
      projectId,
      appId,
      worksheetId,
    };

    return (
      <div onClick={e => e.stopPropagation()}>
        <QiniuUpload
          options={{
            drop_element: dropPasteElement,
            paste_element: dropPasteElement,
            url: md.global.FileStoreConfig.uploadHost,
            ext_blacklist: ['exe', 'bat', 'vbs', 'cmd', 'com', 'url'],
            file_data_name: 'file',
            multi_selection: true,
            max_file_size: maxTotalSize + 'm',
            autoUpload: false,
            getTokenParam,
            error_callback: () => {
              alert(_l('含有不支持格式的文件'), 3);
              return;
            },
            remove_files_callback: uploader => {
              this.onRemoveAll(uploader);
            },
          }}
          onAdd={(uploader, files) => {
            _this.props.onDropPasting();
            let { temporaryData } = _this.state;

            if (files.length) {
              _this._uploading = true;
              _this.props.onUploadComplete(false);
            } else {
              return;
            }

            // 附件配置控制（包含数量、单个文件大小、类型）
            if (advancedSetting) {
              const { temporaryData = [], originCount = 0, kcAttachmentData = [] } = _this.state;
              const tempCount = originCount + temporaryData.length + kcAttachmentData.length;
              const isAvailable = checkFileAvailable(advancedSetting, files, tempCount);
              !isAvailable && _this.onRemoveAll(uploader);
            }

            // 判断已上传的总大小是否超出限制
            let filesSize = getFilesSize(files);
            let currentTotalSize = temporaryData.length
              ? temporaryData.map(item => item.fileSize).reduce((item, count) => count + item)
              : 0;
            let totalSize = parseFloat(currentTotalSize / 1024 / 1024) + parseFloat(filesSize / 1024 / 1024);
            if (totalSize > maxTotalSize) {
              alert('附件总大小超过 ' + formatFileSize(maxTotalSize * 1024 * 1024) + '，请您分批次上传', 3);
              _this.onRemoveAll(uploader);
              return false;
            }

            //判断应用上传量是否达到上限
            if (projectId && !window.isPublicApp && !window.isPublicWorksheet && !isPublicWorkflow) {
              const params = { projectId, fromType: 9 };
              checkAccountUploadLimit(filesSize, params).then(available => {
                if (!available) {
                  upgradeVersionDialog({
                    projectId,
                    isFree: licenseType === 0,
                    hint: _l('应用附件上传量已到最大值'),
                    okText: _l('购买上传量扩展包'),
                    onOk: () => window.open(`/admin/expansionservice/${projectId}/storage`),
                  });
                  // 这里是异步的，等这个 available 值拿到后 files 可能已经上传完毕渲染完了，也可能正在上传，这个时候需要把 temporaryData 里面的文件（本次上传的文件）清除掉
                  _this.setState({
                    temporaryData: _this.state.temporaryData.filter(item => !findIsId(item.fileID || item.id, files)),
                  });
                  _this.onRemoveAll(uploader);
                  return false;
                }
              });
            } else if (!isPublic && !noTotal && !window.isPublicApp) {
              // 判断个人上传流量是否达到上限
              checkAccountUploadLimit(filesSize).then(available => {
                if (!available) {
                  openMdDialog();
                  // 这里是异步的，等这个 available 值拿到后 files 可能已经上传完毕渲染完了，也可能正在上传，这个时候需要把 temporaryData 里面的文件（本次上传的文件）清除掉
                  _this.setState({
                    temporaryData: _this.state.temporaryData.filter(item => !findIsId(item.fileID || item.id, files)),
                  });
                  _this.onRemoveAll(uploader);
                  return false;
                }
              });
            }

            // 判断上传文件的格式
            if (isValid(files)) {
              alert(_l('含有不支持格式的文件'), 3);
              _this.onRemoveAll(uploader);
              return false;
            }

            // 验证拦截空文件
            for (let i = 0, length = files.length; i < length; i++) {
              const file = files[i].getNative();
              if (file.size === 0) {
                alert(_l('不支持上传空文件'), 3);
                _this.onRemoveAll(uploader);
                return false;
              }
            }

            // 验证名称
            if (checkValueByFilterRegex) {
              const removeFiles = [];
              const result = files.map(file => {
                const n = checkValueByFilterRegex(file.name);
                n && removeFiles.push(file);
                return n;
              });
              const errors = result.filter(n => n);
              if (errors.length) {
                errors.forEach(n => {
                  alert(n, 2);
                });
                if (errors.length === files.length) {
                  _this.onRemoveAll(uploader);
                  return;
                } else {
                  files.forEach(item => {
                    if (_.find(removeFiles, { id: item.id })) {
                      setTimeout(() => {
                        uploader.removeFile({ id: item.id });
                      }, 0);
                    }
                  });
                  files = files.filter(n => !_.find(removeFiles, { id: n.id }));
                }
              }
            }

            const temporaryDataLength = _this.state.temporaryData.filter(
              attachment => attachment.fileExt !== '.url',
            ).length;
            const filesLength = files.filter(attachment => attachment.fileExt !== '.url').length;
            const currentFileLength = temporaryDataLength + filesLength;

            // 限制文件数量
            if (temporaryDataLength > 100) {
              alert(_l('附件数量超过限制，一次上传不得超过100个附件'), 3);
              return false;
            } else if (currentFileLength > 100) {
              alert(_l('附件数量超过限制，一次上传不得超过100个附件'), 3);
              const num = currentFileLength - 100;
              files.splice(files.length - num, num).map(file => {
                uploader.removeFile({ id: file.id });
              });
            }

            const addFiles = [];
            // 渲染图片列表
            files.forEach(item => {
              let fileExt = `.${RegExpValidator.getExtOfFileName(item.name)}`;
              let fileName = RegExpValidator.getNameOfFileName(item.name);
              let isPic = RegExpValidator.fileIsPicture(fileExt);
              let id = item.id;
              let base = {
                isPic,
                fileExt,
                fileName,
                id,
              };
              _this.errorFiles.push({
                id: item.id,
                info: item.getNative(),
              });
              addFiles.push({ id: item.id, progress: 0.1, base });
            });

            _this.setState({
              temporaryData: _this.state.temporaryData.concat(addFiles),
            });
          }}
          onBeforeUpload={uploader => {
            _this.currentFile = uploader;
          }}
          onUploadProgress={(uploader, file) => {
            const loaded = file.loaded || 0;
            const size = file.size || 0;
            const uploadPercent = ((loaded / size) * 100).toFixed(1);

            // 给当前正在上传的文件设置进度
            const newTemporaryData = _this.state.temporaryData.map(item => {
              if (file.id === item.id && 'progress' in item) {
                item.progress = uploadPercent;
              }
              return item;
            });

            _this.setState({
              temporaryData: newTemporaryData,
            });
          }}
          onUploaded={(uploader, file, response) => {
            // 上传完成，取消进度条
            const newTemporaryData = _this.state.temporaryData.map(item => {
              if (file.id == item.id && 'progress' in item) {
                item = formatResponseData(file, response);
                item.originalFileName = decodeURIComponent(item.originalFileName);
                delete item.progress;
                delete item.base;
              }
              return item;
            });

            _this.setState({
              temporaryData: newTemporaryData,
            });

            // 分片上传顺序有问题， onUploaded 早于 onUploadComplete ，这里代替 onUploadComplete
            if (!newTemporaryData.filter(n => n.progress).length) {
              _this.props.onTemporaryDataUpdate(newTemporaryData);
              setTimeout(() => {
                _this.props.onUploadComplete(true);
              }, 0);
            }
          }}
          onUploadComplete={(up, files) => {
            _this._uploading = false;
          }}
          onError={(uploader, error) => {
            _this.onRemoveAll(uploader);
            if (md.global.Config.IsLocal && error.response) {
              try {
                const res = JSON.parse(error.response);
                if (res.code === 50001) {
                  alert(res.message, 2);
                  return;
                } else if (errorCode[res.code]) {
                  alert(errorCode[res.code], 2);
                  return;
                }
              } catch (error) {
                console.error(error);
              }
            }
            if (error.code === window.plupload.FILE_SIZE_ERROR) {
              alert(_l('单个文件大小超过%0MB，无法支持上传', maxTotalSize), 2);
            } else {
              alert(_l('上传失败，请稍后再试。'), 2);
            }
          }}
        >
          <div
            className="flexRow valignWrapper"
            id={this.id}
            ref={nativeFile => {
              this.nativeFile = nativeFile;
            }}
          >
            <i className="icon icon-knowledge-upload Gray_9e Font19" />
            <span>{_l('本地')}</span>
          </div>
        </QiniuUpload>
      </div>
    );
  }
  render() {
    let {
      advancedSetting,
      controlId,
      worksheetId,
      viewId,
      isUpload,
      arrowLeft,
      minWidth,
      maxWidth,
      height,
      allowUploadFileFromMobile,
      canAddLink,
      canAddKnowledge,
      callFrom,
    } = this.props;
    let { temporaryData, kcAttachmentData, attachmentData } = this.state;
    let { totalSize, currentPrograss } = getAttachmentTotalSize(temporaryData);
    let length = temporaryData.length + kcAttachmentData.length + attachmentData.length;
    let emptys = Array.from({ length: 15 });
    let style = {
      minWidth: minWidth,
      maxWidth: maxWidth,
      height,
    };
    let { hideDownload = false } = this.props;
    return (
      <div
        className={cx('UploadFiles-wrapper', this.props.className)}
        ref={uploadFilesWrapper => {
          this.uploadFilesWrapper = uploadFilesWrapper;
        }}
        style={{ paddingTop: arrowLeft ? 10 : 0 }}
      >
        {!!arrowLeft && <div style={{ left: arrowLeft }} className="UploadFiles-arrow" />}
        {isUpload && (
          <div className="UploadFiles-header">
            <div className="UploadFiles-entrys">
              {this.renderQiniuUpload()}
              {canAddKnowledge &&
                !md.global.SysSettings.forbidSuites.includes('4') &&
                md.global.Account.accountId &&
                md.global.Account.accountId.length === 36 &&
                !_.get(window, 'shareState.isPublicForm') &&
                !_.get(window, 'shareState.isPublicFormPreview') &&
                !_.get(window, 'shareState.isPublicWorkflowRecord') && (
                  <div className="flexRow valignWrapper" onClick={this.onOpenFolderSelectDialog.bind(this)}>
                    <i className="icon icon-folder Gray_9e Font18" />
                    <span>{_l('知识')}</span>
                  </div>
                )}
              {canAddLink && (
                <div className="flexRow valignWrapper" onClick={this.openLinkDialog.bind(this)}>
                  <i className="icon icon-link2 Gray_9e Font19" />
                  <span>{_l('链接文件')}</span>
                </div>
              )}
              {allowUploadFileFromMobile && (
                <GenScanUploadQr
                  worksheetId={worksheetId}
                  viewId={viewId}
                  from={callFrom}
                  controlId={controlId}
                  rowId={this.props.recordId || _.get(this, 'context.recordBaseInfo.recordId')}
                  onScanResultUpdate={files => {
                    const { temporaryData } = this.state;

                    // 附件数量
                    if (
                      advancedSetting &&
                      advancedSetting.maxcount &&
                      this.state.originCount + temporaryData.length + files.length > Number(advancedSetting.maxcount)
                    ) {
                      alert(_l('最多上传%0个文件', advancedSetting.maxcount), 2);
                      return;
                    }
                    const newTemporaryData = [...temporaryData, ...files];
                    this.setState({
                      temporaryData: newTemporaryData,
                    });
                    this.props.onTemporaryDataUpdate(newTemporaryData);
                    this.props.onUploadComplete(true);
                  }}
                >
                  <div className="flexRow valignWrapper">
                    <i className="icon icon-zendeskHelp-qrcode Gray_9e Font19" />
                    <span>{_l('扫码上传')}</span>
                  </div>
                </GenScanUploadQr>
              )}
            </div>
            <div className="UploadFiles-ramSize">
              <div className="UploadFiles-attachmentProgress">
                <div style={{ width: `${currentPrograss}%` }} className="UploadFiles-currentProgress ThemeBGColor3" />
              </div>
              <div className="UploadFiles-info">
                {totalSize}/{md.global.SysSettings.fileUploadLimitSize}M(
                {canAddLink ? _l('至多本地,链接各100个') : _l('至多本地文件各100个')})
              </div>
            </div>
          </div>
        )}
        <div
          ref={filesWrapper => {
            this.filesWrapper = filesWrapper;
          }}
          className={cx('UploadFiles-filesWrapper', { rowDisplay: this.props.rowDisplay })}
          style={{ display: length ? '' : 'none' }}
        >
          {attachmentData.map((item, index) => (
            <FileComponent
              isUpload={isUpload}
              hideDownload={hideDownload}
              style={style}
              key={item.fileID || Date.now()}
              index={index}
              data={item}
              onDeleteMDFile={this.onDeleteMDFile.bind(this)}
              onReplaceAttachment={this.onReplaceAttachment.bind(this)}
              onPreview={this.onMDPreview.bind(this)}
              isDeleteFile={this.props.isDeleteFile}
              {...(controlId
                ? { handleOpenControlAttachmentInNewTab: () => this.handleOpenControlAttachmentInNewTab(item.fileID) }
                : {})}
            />
          ))}
          {temporaryData.map((item, index) => (
            <FileComponent
              isUpload={isUpload}
              hideDownload={hideDownload}
              style={style}
              key={index}
              index={index}
              data={item}
              resetFileName={this.resetFileName.bind(this)}
              onDeleteFile={this.onDeleteFile.bind(this)}
              removeUploadingFile={this.removeUploadingFile.bind(this)}
              onPreview={this.onPreview.bind(this)}
              {...(controlId
                ? { handleOpenControlAttachmentInNewTab: () => this.handleOpenControlAttachmentInNewTab(item.fileID) }
                : {})}
            />
          ))}
          {kcAttachmentData.map((item, index) => (
            <FileComponent
              isUpload={isUpload}
              hideDownload={hideDownload}
              style={style}
              key={index}
              index={index}
              data={item}
              isDeleteKcFile={this.props.isDeleteKcFile}
              onDeleteKcFile={this.onDeleteKcFile.bind(this)}
              onPreview={this.onKcPreview.bind(this)}
              onKcTwicePreview={this.onKcTwicePreview.bind(this)}
              {...(controlId
                ? { handleOpenControlAttachmentInNewTab: () => this.handleOpenControlAttachmentInNewTab(item.fileID) }
                : {})}
            />
          ))}
          {emptys.map((item, index) => (
            <div style={style} key={index} className="UploadFiles-file-wrapper UploadFiles-fileEmpty" />
          ))}
        </div>
      </div>
    );
  }
}
