import React, { Component } from 'react';
import cx from 'classnames';
import { Flex, Toast } from 'antd-mobile';
import { Icon, Progress } from 'ming-ui';
import './index.less';
import { getRandomString, getClassNameByExt, getToken } from 'src/util';
import { checkFileAvailable } from 'src/components/UploadFiles/utils.js';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';

const formatResponseData = (file, response) => {
  const item = {};
  const data = JSON.parse(response);
  item.fileID = file.id;
  item.fileSize = file.size || 0;
  item.url = file.url;
  item.serverName = data.serverName;
  item.filePath = data.filePath;
  item.fileName = data.fileName;
  item.fileExt = data.fileExt;
  // item.ext = data.fileExt;
  item.originalFileName = data.originalFileName;
  item.key = data.key;
  item.oldOriginalFileName = item.originalFileName;
  if (!File.isPicture(item.fileExt)) {
    item.allowDown = true;
    item.docVersionID = '';
  }
  return item;
};

export class UploadFileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: props.files,
    };
    this.currentFile = null;
    this.id = `uploadFiles-${getRandomString()}`;
  }
  componentDidMount() {
    this.uploadFile();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.files.length !== this.props.files.length) {
      this.setState({
        files: nextProps.files,
      });
    }
  }
  uploadFile() {
    const self = this;
    const { advancedSetting } = self.props;
    const method = {
      FilesAdded(uploader, files) {
        if (parseFloat(files.reduce((total, file) => total + (file.size || 0), 0) / 1024 / 1024) > md.global.SysSettings.fileUploadLimitSize) {
          Toast.info('附件总大小超过 ' + utils.formatFileSize(md.global.SysSettings.fileUploadLimitSize * 1024 * 1024) + '，请您分批次上传');
          uploader.stop();
          uploader.splice(uploader.files.length - files.length, uploader.files.length);
          return false;
        }

        self.uploading = true;

        if (advancedSetting) {
          let isAvailable;
          let tempCount = self.props.originCount || 0;
          isAvailable = checkFileAvailable(advancedSetting, files, tempCount);
          if (!isAvailable) {
            self.onRemoveAll(uploader);
            return;
          }
        }
        const tokenFiles = [];
        files
          .filter(item => item.name || item.type)
          .forEach(item => {
            const { files: fileList } = self.state;
            const fileExt = `.${File.GetExt(item.name)}`;
            const fileName = File.GetName(item.name);
            const isPic = File.isPicture(fileExt);
            const id = item.id;
            const base = {
              isPic,
              fileExt,
              fileName,
              id,
            };
            const newFiles = fileList.concat({ id: item.id, progress: 0, base });
            self.setState({
              files: newFiles,
            });
            tokenFiles.push({ bucket: isPic ? 4 : 3, ext: fileExt });
            self.props.onChange(newFiles);
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
        self.currentFile = uploader;
        const fileExt = `.${File.GetExt(file.name)}`;

        // token
        uploader.settings.multipart_params = {
          token: file.token,
        };

        uploader.settings.multipart_params.key = file.key;
        uploader.settings.multipart_params['x:serverName'] = file.serverName;
        uploader.settings.multipart_params['x:filePath'] = file.key.replace(file.fileName, '');
        uploader.settings.multipart_params['x:fileName'] = file.fileName.replace(/\.[^\.]*$/, '');
        uploader.settings.multipart_params['x:originalFileName'] = encodeURIComponent(
          file.name.indexOf('.') > -1 ? file.name.split('.').slice(0, -1).join('.') : file.name,
        );
        uploader.settings.multipart_params['x:fileExt'] = fileExt;
      },
      UploadProgress(uploader, file) {
        const uploadPercent = ((file.loaded / file.size) * 100).toFixed(1);
        // 给当前正在上传的文件设置进度
        const newFiles = self.state.files.map(item => {
          if (file.id === item.id && 'progress' in item) {
            item.progress = uploadPercent;
          }
          return item;
        });
        self.setState({
          files: newFiles,
        });
        self.props.onChange(newFiles);
      },
      FileUploaded(uploader, file, response) {
        // 上传完成，取消进度条
        const newFiles = self.state.files.map(item => {
          if (file.id === item.id && 'progress' in item) {
            item = formatResponseData(file, decodeURIComponent(response.response));
            delete item.progress;
            delete item.base;
          }
          return item;
        });
        self.setState({
          files: newFiles,
        });
        self.props.onChange(newFiles, true);
      },
      UploadComplete() {
        self.uploading = false;
      },
      Error(uploader, error) {
        if (error.code === window.plupload.FILE_SIZE_ERROR) {
          Toast.info(_l('单个文件大小超过%0，无法支持上传', utils.formatFileSize(md.global.SysSettings.fileUploadLimitSize * 1024 * 1024)));
        } else {
          Toast.info(_l('上传失败，请稍后再试。'));
        }
      },
      Init() {
        const ele = self.uploadContainer && self.uploadContainer.querySelector('input');
        const { inputType, disabledGallery, advancedSetting = {} } = self.props;
        const { filetype } = advancedSetting;
        let type = filetype && JSON.parse(filetype).type;
        const accept = { 1: 'image/*', 2: 'video/*', 0: 'image/*,video/*' };
        const fileTypeObj = { 1: 'image/*', 2: 'image/*,video/*', 3: 'video/*', 4: 'video/*' };
        const ua = window.navigator.userAgent.toLowerCase();
        const isAndroid = ua.includes('android');
        const isMiniprogram = ua.includes('miniprogram');
        const isFeishu = ua.includes('feishu');
        const equipment = type === 3 ? 'microphone' : type === 4 ? 'camcorder' : 'camera';
        if (ele) {
          if (isAndroid && isMiniprogram) {
            ele.removeAttribute('multiple');
            if (disabledGallery) {
              ele.setAttribute('accept', accept[inputType]);
              ele.setAttribute('capture', 'camera');
            } else if (type || inputType) {
              ele.setAttribute('accept', accept[inputType]);
              ele.setAttribute('capture', equipment);
            } else {
              ele.setAttribute('accept', 'image/*');
            }
            return;
          }
          if (inputType || disabledGallery) {
            ele.setAttribute('accept', accept[inputType]);
            ele.setAttribute('capture', 'camera');
          } else if (type) {
            ele.setAttribute('accept', fileTypeObj[type]);
          } else if (!(isFeishu && isAndroid)) {
            ele.setAttribute('accept', accept[inputType]);
          }
        }
      },
    };
    $(this.uploadFileEl).plupload({
      url: md.global.FileStoreConfig.uploadHost,
      file_data_name: 'file',
      multi_selection: true,
      method,
      autoUpload: false,
    });
  }
  onRemoveAll(uploader) {
    uploader.files.forEach(item => {
      setTimeout(() => {
        uploader.removeFile({ id: item.id });
      }, 0);
    });
  }
  render() {
    const { children, className } = this.props;
    return (
      <div className="Relative" ref={el => (this.uploadContainer = el)}>
        <span ref={el => (this.uploadFileEl = el)} id={this.id} className={className}>
          {children}
        </span>
      </div>
    );
  }
}

export default class AttachmentList extends Component {
  static defaultProps = {
    width: 120,
  };
  style: null;
  constructor(props) {
    super(props);
    this.style = { width: props.width };
  }
  handleRemove(item, event) {
    event.stopPropagation();
    const { fileID } = item;
    const { attachments } = this.props;
    const newFiles = attachments.filter(item => item.fileID !== fileID);
    this.props.onChange(newFiles, true);
  }
  previewAttachment(index) {
    const { attachments, hideDownload } = this.props;
    const { updateTime } = attachments[index];
    const hideFunctions = ['editFileName'];
    if (hideDownload) {
      /* 是否不可下载 且 不可保存到知识和分享 */
      hideFunctions.push('download', 'share', 'saveToKnowlege');
    }
    previewAttachments({
      index: index || 0,
      attachments: updateTime
        ? attachments
        : attachments.map(item => {
            return {
              name: `${item.originalFileName || _l('未命名')}${item.fileExt}`,
              path: `${item.previewUrl || item.url}`,
              previewAttachmentType: 'QINIU',
              size: item.fileSize,
              fileid: item.fileID,
            };
          }),
      callFrom: updateTime ? 'player' : 'chat',
      showThumbnail: true,
      hideFunctions,
    });
  }
  renderImage(item, index) {
    const isKc = item.refId ? true : false;
    const path = item.previewUrl || item.url;
    const url = isKc
      ? `${item.middlePath + item.middleName}`
      : path.indexOf('imageView2') > -1
      ? path.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
      : `${path}&imageView2/1/w/200/h/140`;
    return (
      <Flex
        key={item.fileID}
        className="fileWrapper"
        style={this.style}
        onClick={e => {
          this.previewAttachment(index);
          e.stopPropagation();
        }}
      >
        <div className="image" style={{ backgroundImage: `url(${url})` }}></div>
        {this.props.isRemove ? (
          <Icon icon="close" className="closeIcon" onClick={this.handleRemove.bind(this, item)} />
        ) : null}
      </Flex>
    );
  }
  renderFile(item, index) {
    const fileExt = getClassNameByExt((item.fileExt || item.ext).replace('.', ''));
    return (
      <Flex
        key={item.fileID}
        direction="column"
        className="fileWrapper"
        style={this.style}
        onClick={e => {
          this.previewAttachment(index);
          e.stopPropagation();
        }}
      >
        <Flex className="filePanel" justify="center" align="center">
          <div className={cx(fileExt, 'fileIcon')}></div>
        </Flex>
        <Flex className="fileText">
          <span>{`${item.originalFileName || item.originalFilename}${item.fileExt || item.ext}`}</span>
        </Flex>
        {this.props.isRemove ? (
          <Icon icon="close" className="closeIcon" onClick={this.handleRemove.bind(this, item)} />
        ) : null}
      </Flex>
    );
  }
  renderProgress(item) {
    const { progress, base } = item;
    return (
      <Flex key={item.id} direction="column" className="fileWrapper" style={this.style}>
        <Flex className="filePanel" justify="center" align="center">
          <Progress.Circle
            key="text"
            isAnimation={false}
            isRound={false}
            strokeWidth={3}
            diameter={47}
            foregroundColor="#BDBDBD"
            backgroundColor="#fff"
            format={percent => ''}
            percent={parseInt(progress)}
          />
        </Flex>
        <Flex className="fileText">
          <span>{`${base.fileName}${base.fileExt || item.ext}`}</span>
        </Flex>
      </Flex>
    );
  }
  render() {
    const { attachments } = this.props;
    const emptys = Array.from({ length: 6 });
    return (
      <Flex className="attachmentFiles">
        {attachments.map((item, index) =>
          'progress' in item
            ? this.renderProgress(item)
            : File.isPicture(item.fileExt || item.ext)
            ? this.renderImage(item, index)
            : this.renderFile(item, index),
        )}
        {emptys.map((item, index) => (
          <div key={index} className="fileWrapper fileEmpty"></div>
        ))}
      </Flex>
    );
  }
}
