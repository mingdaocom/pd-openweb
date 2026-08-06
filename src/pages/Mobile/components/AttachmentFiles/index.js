import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Icon, Progress, QiniuUpload } from 'ming-ui';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import {
  checkAccountUploadLimit,
  checkFileAvailable,
  formatResponseData,
  getFilesSize,
} from 'src/components/UploadFiles/utils';
import { generateRandomPassword } from 'src/utils/common';
import { getClassNameByExt } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { processImageFile } from './imageProcessor';
import './index.less';

export class UploadFileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: props.files,
    };
    this.currentFile = null;
    this.id = `uploadFiles-${generateRandomPassword(10)}`;
    this.uploading = false;
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.files.length !== prevProps.files.length) {
        this.setState({
          files: this.props.files,
        });
      }
    }
  }

  getMethod() {
    const self = this;
    const {
      advancedSetting = {},
      customUploadType,
      checkValueByFilterRegex,
      formData,
      projectId,
      appId,
      currentLocation,
    } = self.props;
    const method = {
      async onAdd(uploader, files, nextStart) {
        if (_.isEmpty(files)) {
          self.props.onChange([]);
          return;
        }

        if (self.uploading) {
          self.removeFiles(uploader, files);
          return;
        }

        self.setUploadLock(uploader, true);

        //判断应用上传量是否达到上限
        const isPublicWorkflow = _.get(window, 'shareState.isPublicWorkflowRecord');

        if (projectId && !window.isPublicApp && !window.isPublicWorksheet && !isPublicWorkflow) {
          const filesSize = getFilesSize(files);
          const params = { projectId, appId, fromType: 9 };
          let available;

          try {
            available = await checkAccountUploadLimit(filesSize, params);
          } catch (error) {
            console.error(error);
            self.setUploadLock(uploader, false);
            return;
          }

          if (!available) {
            alert(_l('应用附件上传量已到最大值'), 3);
            self.onRemoveAll(uploader);
            self.props.onChange([], true);
            self.setUploadLock(uploader, false);
            return;
          }
        }

        const start = () => {
          if (advancedSetting) {
            let isAvailable;
            let tempCount = self.props.originCount || 0;
            isAvailable = checkFileAvailable(advancedSetting, files, tempCount);
            if (!isAvailable) {
              self.onRemoveAll(uploader);
              self.setUploadLock(uploader, false);
              return;
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
                self.onRemoveAll(uploader);
                self.setUploadLock(uploader, false);
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

          const addFiles = [];
          files
            .filter(item => item.name || item.type)
            .forEach(item => {
              const fileExt = `.${RegExpValidator.getExtOfFileName(item.name)}`;
              const fileName = RegExpValidator.getNameOfFileName(item.name);
              const isPic = RegExpValidator.fileIsPicture(fileExt);
              const id = item.id;
              const base = {
                isPic,
                fileExt,
                fileName,
                id,
              };
              addFiles.push({ id: item.id, progress: 0, base });
            });
          const newFiles = self.state.files.concat(addFiles);
          self.setState({
            files: newFiles,
          });
          self.props.onChange(newFiles);
          if (nextStart) {
            nextStart();
          } else {
            self.setUploadLock(uploader, false);
          }
        };

        const watermark = _.get(advancedSetting, 'h5watermark') || _.get(advancedSetting, 'watermark');
        const isWatermark = customUploadType === 'camara' && watermark;
        const isWebcompress = _.get(advancedSetting, 'webcompress') !== '0';

        if (isWatermark || isWebcompress) {
          const pictureFiles = files.filter(file => {
            const ext = RegExpValidator.getExtOfFileName(file.name);
            return RegExpValidator.fileIsPicture(`.${ext}`);
          });

          const getDynamicControls = () => {
            const dynamicControlIds = _.get(advancedSetting, 'h5watermark')
              ? _.get(advancedSetting, 'h5watermark').split('$')
              : safeParse(advancedSetting.watermark || null, 'array').filter(
                  v => !!v && !_.includes(['user', 'time', 'address', 'xy'], v),
                );
            const { formattedAddress, position } = currentLocation || {};

            return _.map(dynamicControlIds, item => {
              if (item === 'user' && md.global.Account.fullname) {
                return { controlId: 'user', type: 2, value: md.global.Account.fullname };
              }

              if (item === 'time') {
                return { controlId: 'time', type: 2, value: moment().format('YYYY-MM-DD HH:mm:ss') };
              }

              if (item === 'address' && formattedAddress) {
                return { controlId: 'address', type: 2, value: formattedAddress };
              }

              if (item === 'xy' && position) {
                return {
                  controlId: 'xy',
                  type: 2,
                  value: `${_l('经度')}：${position.lng}  ${_l('纬度')}：${position.lat}`,
                };
              }

              return _.find(formData, v => v.controlId === item);
            })
              .filter(_.identity)
              .filter(v => _.includes([2, 3, 4, 5, 6, 8, 15, 16, 46], v.type)); // 文本、数值、金额、邮箱、日期、时间、电话、座机
          };

          for (const file of pictureFiles) {
            try {
              const nativeFile = file.getNative();
              const newFile = await processImageFile(nativeFile, {
                needWatermark: !!isWatermark,
                watermark,
                dynamicControls: isWatermark ? getDynamicControls() : [],
                advancedSetting,
                currentLocation,
                needCompress: isWebcompress,
                quality: 0.3,
              });

              file.size = newFile.size;
              file.setSource({ size: newFile.size });
              file.getSource().setSource(newFile);
            } catch (error) {
              console.error(error);
            }
          }

          start();
        } else {
          start();
        }
      },
      onBeforeUpload(uploader) {
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
        self.props.onChange(newFiles, !newFiles.filter(n => 'progress' in n).length);
        self.removeFile(uploader, file);
      },
      onUploadComplete() {
        self.setUploadLock(self.currentFile, false);
      },
      onError(uploader, error) {
        if (error.code === window.plupload.FILE_SIZE_ERROR) {
          alert(_l('单个文件大小超过%0MB，无法支持上传', 1024 * 4), 3);
        } else {
          alert(_l('上传失败，请稍后再试。'), 3);
        }

        self.setUploadLock(uploader, false);
        self.removeFile(uploader, error.file);
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
  setUploadLock(uploader, locked) {
    this.uploading = locked;
    this.setBrowseDisabled(uploader, locked);
  }
  setBrowseDisabled(uploader, disabled) {
    const target = uploader || this.currentFile;

    if (target && target.disableBrowse) {
      target.disableBrowse(disabled);
    }
  }
  removeFile(uploader, file) {
    if (!uploader || !file) return;

    const id = file.id || file;

    setTimeout(() => {
      if (!uploader.files || _.find(uploader.files, { id })) {
        uploader.removeFile({ id });
      }
    }, 0);
  }
  removeFiles(uploader, files = []) {
    if (!uploader || !files.length) return;

    files.forEach(item => this.removeFile(uploader, item));
  }
  onRemoveAll(uploader) {
    this.removeFiles(uploader, uploader.files);
  }
  render() {
    const { appId, worksheetId, projectId } = this.props;
    const { children, qiniuUploadClassName, className, style } = this.props;
    return (
      <div className="Relative mobileUploadTriggerWrap" style={style} ref={el => (this.uploadContainer = el)}>
        <QiniuUpload
          className={qiniuUploadClassName}
          options={{
            url: md.global.FileStoreConfig.uploadHost,
            file_data_name: 'file',
            multi_selection: true,
            max_file_size: `${1024 * 4}m`,
            autoUpload: false,
            source: 'h5',
            getTokenParam: {
              appId,
              worksheetId,
              projectId,
            },
            error_callback: () => {
              alert(_l('含有不支持格式的文件'), 3);
              return;
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
      <div
        key={item.fileID}
        className="fileWrapper flexRow"
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
      </div>
    );
  }
  renderFile(item, index) {
    const fileExt = getClassNameByExt((item.fileExt || item.ext).replace('.', ''));
    return (
      <div
        key={item.fileID}
        className="fileWrapper flexColumn"
        style={this.style}
        onClick={e => {
          this.previewAttachment(index);
          e.stopPropagation();
        }}
      >
        <div className="filePanel flexRow alignItemsCenter justifyContentCenter">
          <div className={cx(fileExt, 'fileIcon')}></div>
        </div>
        <div className="flexRow fileText">
          <span>{`${item.originalFileName || item.originalFilename}${item.fileExt || item.ext}`}</span>
        </div>
        {this.props.isRemove ? (
          <Icon icon="close" className="closeIcon" onClick={this.handleRemove.bind(this, item)} />
        ) : null}
      </div>
    );
  }
  renderProgress(item) {
    const { progress, base } = item;
    const { diameter } = this.props;
    return (
      <div key={item.id} className="fileWrapper flexColumn" style={this.style}>
        <div className="filePanel flexRow alignItemsCenter justifyContentCenter">
          <Progress.Circle
            key="text"
            isAnimation={false}
            isRound={false}
            strokeWidth={3}
            diameter={diameter || 47}
            foregroundColor="var(--color-text-disabled)"
            backgroundColor="var(--color-background-primary)"
            format={() => ''}
            percent={parseInt(progress)}
          />
        </div>
        <div className="flexRow fileText">
          <span>{`${base.fileName}${base.fileExt || item.ext}`}</span>
        </div>
      </div>
    );
  }
  render() {
    const { attachments } = this.props;
    const emptys = Array.from({ length: 6 });
    return (
      <div className="attachmentFiles flexRow">
        {attachments.map((item, index) =>
          'progress' in item
            ? this.renderProgress(item)
            : RegExpValidator.fileIsPicture(item.fileExt || item.ext)
              ? this.renderImage(item, index)
              : this.renderFile(item, index),
        )}
        {emptys.map((item, index) => (
          <div key={index} className="fileWrapper fileEmpty"></div>
        ))}
      </div>
    );
  }
}
