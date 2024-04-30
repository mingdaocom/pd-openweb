import React, { Component } from 'react';
import cx from 'classnames';
import { Flex, Toast } from 'antd-mobile';
import { QiniuUpload, Icon, Progress } from 'ming-ui';
import './index.less';
import { generateRandomPassword, getClassNameByExt, getToken, formatFileSize } from 'src/util';
import { checkFileAvailable } from 'src/components/UploadFiles/utils.js';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import moment from 'moment';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import _ from 'lodash';

export class UploadFileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: props.files,
    };
    this.currentFile = null;
    this.id = `uploadFiles-${generateRandomPassword(10)}`;
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.files.length !== this.props.files.length) {
      this.setState({
        files: nextProps.files,
      });
    }
  }
  getMethod() {
    const self = this;
    const { advancedSetting = {}, projectId, appId, worksheetId } = self.props;
    const method = {
      onAdd(uploader, files) {
        if (_.isEmpty(files)) {
          self.props.onChange([]);
          return;
        }
        self.uploading = true;
        const watermark = JSON.parse(advancedSetting.watermark || null) || [];
        const start = () => {
          if (advancedSetting) {
            let isAvailable;
            let tempCount = self.props.originCount || 0;
            isAvailable = checkFileAvailable(advancedSetting, files, tempCount);
            if (!isAvailable) {
              self.onRemoveAll(uploader);
              return;
            }
          }
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
              self.props.onChange(newFiles);
            });
        };
        start();
      },
      onBeforeUpload(uploader, file) {
        self.currentFile = uploader;
      },
      onUploadProgress(uploader, file) {
        const loaded = file.loaded || 0;
        const size = file.size || 0;
        const uploadPercent = ((loaded / size) * 100).toFixed(1);
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
      onUploaded(uploader, file, response) {
        // 上传完成，取消进度条
        const newFiles = self.state.files.map(item => {
          if (file.id === item.id && 'progress' in item) {
            item = formatResponseData(file, response);
            item.originalFileName = decodeURIComponent(item.originalFileName);
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
      onUploadComplete() {
        self.uploading = false;
      },
      onError(uploader, error) {
        if (error.code === window.plupload.FILE_SIZE_ERROR) {
          Toast.info(_l('单个文件大小超过%0MB，无法支持上传', 1024 * 4));
        } else {
          Toast.info(_l('上传失败，请稍后再试。'));
        }
      },
      onInit() {
        const ele = self.uploadContainer && self.uploadContainer.querySelector('input');
        const { inputType, advancedSetting = {}, customUploadType } = self.props;
        const { filetype } = advancedSetting;
        let type = filetype && JSON.parse(filetype).type;

        // inputType: 0->不限制，1->拍照，2->拍视频
        // disabledGallery: true->禁用相册
        // type: '1'->图片, '2'->文档 ,‘3’-> 音频 ,‘4’->视频 ,  '0'->自定义

        // 上传附件
        const accept = { 0: '*', 1: 'image/*', 2: 'video/*' };
        const fileTypeObj = { 1: 'image/*', 2: 'application/*', 3: 'audio/*', 4: 'video/*' };

        if (ele) {
          // 拍照 or 拍摄
          if (customUploadType) {
            ele.setAttribute('accept', customUploadType === 'camara' ? 'image/*' : 'video/*');
            ele.setAttribute('capture', 'environment');
          } else {
            ele.setAttribute('accept', type ? fileTypeObj[type] : inputType ? accept[inputType] : '*');
          }
        }
      },
    };
    return method;
  }
  onRemoveAll(uploader) {
    uploader.files.forEach(item => {
      setTimeout(() => {
        uploader.removeFile({ id: item.id });
      }, 0);
    });
  }
  render() {
    const { advancedSetting = {}, appId, worksheetId, projectId } = this.props;
    const { children, className, style } = this.props;
    return (
      <div className="Relative" style={style} ref={el => (this.uploadContainer = el)}>
        <QiniuUpload
          options={{
            url: md.global.FileStoreConfig.uploadHost,
            file_data_name: 'file',
            multi_selection: true,
            max_file_size: `${1024 * 4}m`,
            // resize:
            //   _.get(advancedSetting, 'webcompress') !== '0'
            //     ? {
            //         quality: 60,
            //         preserve_headers: true,
            //       }
            //     : undefined,
            autoUpload: false,
            getTokenParam: {
              appId,
              worksheetId,
              projectId,
            },
          }}
          {...this.getMethod()}
        >
          <span ref={el => (this.uploadFileEl = el)} id={this.id} className={className}>
            {children}
          </span>
        </QiniuUpload>
      </div>
    );
  }
}

export default class AttachmentList extends Component {
  static defaultProps = {
    width: 120,
  };
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
    const path = item.previewUrl || item.viewUrl || item.url || '';
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
