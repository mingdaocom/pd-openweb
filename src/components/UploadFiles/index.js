import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import previewAttachments from 'previewAttachments';
import FileComponent from './File';
import * as ajax from 'src/pages/kc/common/AttachmentsPreview/ajax';
import {
  formatResponseData,
  isValid,
  getAttachmentTotalSize,
  findIndex,
  getFilesSize,
  formatTemporaryData,
  formatKcAttachmentData,
  checkAccountUploadLimit,
  openMdDialog,
  findIsId,
  openNetStateDialog,
  checkFileAvailable,
} from './utils';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { formatFileSize, getToken } from 'src/util';
import plupload from 'plupload';

export const errorCode = {
  40001: _l('鉴权失败'),
  40002: _l('非法的文件类型'),
  40003: _l('bucket 不存在'),
  40004: _l('文件大小错误'),
  50002: _l('系统错误 metadata error'),
  50003: _l('系统错误 hash error'),
  50004: _l('系统错误')
}

export default class UploadFiles extends Component {
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
     * 文件的最小宽度
     */
    minWidth: PropTypes.number,
    /**
     * 文件的最大宽度
     */
    maxWidth: PropTypes.number,
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
    minWidth: 140,
    maxWidth: 200,
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

    if (isUpload) {
      this.initPlupload();
    }

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

  initPlupload() {
    const _this = this;
    let { maxTotalSize } = this.state;
    const { nativeFile } = this;
    let { noTotal, dropPasteElement, from, projectId, advancedSetting } = this.props;
    const isPublic = from === FROM.PUBLIC || from === FROM.WORKFLOW || window.isPublicWorksheet;

    $(nativeFile).plupload({
      drop_element: dropPasteElement,
      paste_element: dropPasteElement,
      url: md.global.FileStoreConfig.uploadHost,
      file_data_name: 'file',
      multi_selection: true,
      max_file_size: maxTotalSize + 'm',
      filters: undefined,
      autoUpload: false,
      method: {
        FilesAdded(uploader, files) {
          _this.props.onDropPasting();
          let { temporaryData } = _this.state;

          _this._uploading = true;
          _this.props.onUploadComplete(false);

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

          // 判断上传文件的格式
          if (isValid(files)) {
            alert(_l('含有不支持格式的文件'), 3);
            _this.onRemoveAll(uploader);
            return false;
          }

          const temporaryDataLength = _this.state.temporaryData.filter(
            attachment => attachment.fileExt !== '.url',
          ).length;
          const filesLength = files.filter(attachment => attachment.fileExt !== '.url').length;
          const currentFileLength = temporaryDataLength + filesLength;

          // 限制文件数量
          if (temporaryDataLength > 20) {
            alert(_l('附件数量超过限制，一次上传不得超过20个附件'), 3);
            return false;
          } else if (currentFileLength > 20) {
            alert(_l('附件数量超过限制，一次上传不得超过20个附件'), 3);
            const num = currentFileLength - 20;
            files.splice(files.length - num, num);
          }

          const tokenFiles = [];

          // 渲染图片列表
          files.forEach(item => {
            let { temporaryData } = _this.state;
            let fileExt = `.${File.GetExt(item.name)}`;
            let fileName = File.GetName(item.name);
            let isPic = File.isPicture(fileExt);
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
            _this.setState({
              temporaryData: temporaryData.concat({ id: item.id, progress: 0.1, base }),
            });

            tokenFiles.push({ bucket: isPic ? 4 : 3, ext: fileExt });
          });

          getToken(tokenFiles).then(res => {
            files.forEach((item, i) => {
              item.token = res[i].uptoken;
              item.key = res[i].key;
              item.serverName = res[i].serverName;
              item.fileName = res[i].fileName;
              item.url = res[i].url;
            });

            uploader.start();
          });
        },
        BeforeUpload(uploader, file) {
          _this.currentFile = uploader;
          const fileExt = `.${File.GetExt(file.name)}`;

          uploader.settings.multipart_params = {
            token: file.token,
          };

          uploader.settings.multipart_params.key = file.key;
          uploader.settings.multipart_params['x:serverName'] = file.serverName;
          uploader.settings.multipart_params['x:filePath'] = (file.key || '').replace(file.fileName, '');
          uploader.settings.multipart_params['x:fileName'] = (file.fileName || '').replace(/\.[^\.]*$/, '');
          uploader.settings.multipart_params['x:originalFileName'] = encodeURIComponent(
            file.name.indexOf('.') > -1 ? file.name.split('.').slice(0, -1).join('.') : file.name,
          );
          uploader.settings.multipart_params['x:fileExt'] = fileExt;
        },
        UploadProgress(uploader, file) {
          const uploadPercent = ((file.loaded / file.size) * 100).toFixed(1);

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
        },
        FileUploaded(uploader, file, response) {
          // 上传完成，取消进度条
          const newTemporaryData = _this.state.temporaryData.map(item => {
            if (file.id == item.id && 'progress' in item) {
              item = formatResponseData(file, decodeURIComponent(response.response));
              delete item.progress;
              delete item.base;
            }
            return item;
          });

          _this.setState({
            temporaryData: newTemporaryData,
          });

          _this.props.onTemporaryDataUpdate(newTemporaryData);
        },
        UploadComplete() {
          _this._uploading = false;
          _this.props.onUploadComplete(true);
        },
        Error(uploader, error) {
          if (error.response) {
            try {
              const res = JSON.parse(error.response);
              if (res.code === 50001) {
                alert(res.message, 2);
                return;
              } else if (errorCode[res.code]) {
                alert(errorCode[res.code], 2);
                return;
              }
            } catch (error) { }
          }
          if (error.code === window.plupload.FILE_SIZE_ERROR) {
            alert(_l('单个文件大小超过%0mb，无法支持上传', maxTotalSize), 2);
          } else {
            alert(_l('上传失败，请稍后再试。'), 2);
          }
        },
      },
    });
  }
  onRemoveAll(uploader) {
    uploader.files.forEach(item => {
      setTimeout(() => {
        uploader.removeFile({ id: item.id });
      }, 0);
    });
  }
  onOpenFolderSelectDialog() {
    require(['src/components/kc/folderSelectDialog/folderSelectDialog'], selectNode => {
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
            viewUrl: File.isPicture('.' + node.ext) ? node.viewUrl : null,
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
        if (newKcAttachmentData.length > 20) {
          alert(_l('附件数量超过限制，一次上传不得超过20个附件'), 3);
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
    });
  }
  removeUploadingFile(id) {
    if (this.currentFile) {
      this.currentFile.stop();
      this.currentFile.removeFile({ id });
    }
    const newTemporaryData = this.state.temporaryData.filter(item => item.id !== id);
    this.setState(
      {
        temporaryData: newTemporaryData,
      },
      () => {
        this.props.onTemporaryDataUpdate(newTemporaryData);
      },
    );
  }
  openLinkDialog(item) {
    const _this = this;
    require(['src/components/addLinkFile/addLinkFile'], addLinkFile => {
      const hanele = new addLinkFile({
        showTitleTip: false,
        callback: link => {
          const { linkName, linkContent } = link;
          const { temporaryData } = this.state;
          if (
            temporaryData.filter(attachment => attachment.fileExt === '.url' && attachment.originLinkUrl).length >= 20
          ) {
            alert(_l('附件数量超过限制，一次上传不得超过20个附件'), 3);
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
        .fail(() => {
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
      previewAttachments({
        attachments: mdData.map(item => item.twice),
        index: mdIndex,
        callFrom: 'player',
        hideFunctions: hideFunctions,
      });
    } else if (quIndex >= 0) {
      let hideFunctions = ['editFileName'];
      previewAttachments({
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
      });
    }
  }
  onKcPreview(id, index) {
    const { kcAttachmentData } = this.state;
    let res = kcAttachmentData.filter(item => item.node);
    previewAttachments({
      attachments: res.map(item => item.node),
      index: findIndex(res, id),
      callFrom: 'kc',
      hideFunctions: ['editFileName'],
    });
  }
  onKcTwicePreview(id, index, event) {
    let { kcAttachmentData } = this.state;
    let attachments = kcAttachmentData.filter(item => !!(item.twice && item.twice.attachmentType !== 5));
    let preview = attachments.map(item => item.twice);

    if (preview[0].updater) {
      // 知识中心
      previewAttachments({
        attachments: preview,
        index: findIndex(attachments, id),
        callFrom: 'kc',
      });
    } else {
      previewAttachments({
        attachments: preview,
        index: findIndex(attachments, id),
        callFrom: 'player',
      });
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
  render() {
    let { isUpload, arrowLeft, minWidth, maxWidth, canAddLink } = this.props;
    let { temporaryData, kcAttachmentData, attachmentData } = this.state;
    let { totalSize, currentPrograss } = getAttachmentTotalSize(temporaryData);
    let length = temporaryData.length + kcAttachmentData.length + attachmentData.length;
    let emptys = Array.from({ length: 15 });
    let style = {
      minWidth: minWidth,
      maxWidth: maxWidth,
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
              {!md.global.Account.isPortal && !md.global.SysSettings.forbidSuites.includes('4') && (
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
            </div>
            <div className="UploadFiles-ramSize">
              <div className="UploadFiles-attachmentProgress">
                <div style={{ width: `${currentPrograss}%` }} className="UploadFiles-currentProgress ThemeBGColor3" />
              </div>
              <div className="UploadFiles-info">
                {totalSize}
                /{md.global.SysSettings.fileUploadLimitSize}M(
                {canAddLink ? _l('至多本地,链接各20个') : _l('至多本地文件各20个')})
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
