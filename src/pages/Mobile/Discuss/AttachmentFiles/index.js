import React, { Component } from 'react';
import cx from 'classnames';
import { Flex, Toast } from 'antd-mobile';
import { Icon, Progress } from 'ming-ui';
import './index.less';
import { getRandomString, getClassNameByExt, getToken, formatFileSize } from 'src/util';
import { checkFileAvailable } from 'src/components/UploadFiles/utils.js';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import moment from 'moment';
import MapLoader from 'src/ming-ui/components/amap/MapLoader';
import MapHandler from 'src/ming-ui/components/amap/MapHandler';

/**
 * 添加水印
 * @param {file} 上传的图片文件
 */
async function addWaterMarker(file, textLayouts) {
  let img = await blobToImg(file)
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const fontSize = Math.min(canvas.width, canvas.height) * 0.03;
    const lineSpacing = 6;

    // 绘制背景
    const bgColoryOffset = (fontSize * textLayouts.length) + (lineSpacing * textLayouts.length);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, (canvas.height - bgColoryOffset) - fontSize, canvas.width, bgColoryOffset + fontSize);

    // 绘制文字
    ctx.font = `${fontSize}px 'Fira Sans'`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.backgroundColor = '#ccc';

    textLayouts.forEach((text, index) => {
      const i = textLayouts.length - index;
      const xOffset = 20;
      const yOffset = canvas.height - (fontSize * i) - (lineSpacing * i);
      ctx.fillText(text, xOffset, yOffset + 10);
    });

    canvas.toBlob(blob => resolve(blob));
  })
}

/**
* blob转img标签
*/
function blobToImg(blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      let img = new Image();
      img.src = reader.result;
      img.addEventListener('load', () => resolve(img));
    });
    reader.readAsDataURL(blob);
  });
}

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

let currentLocation = null;

export class UploadFileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: props.files
    };
    this.currentFile = null;
    this.id = `uploadFiles-${getRandomString()}`;
  }
  componentDidMount() {
    this.uploadFile();
    const { advancedSetting = {} } = this.props;
    const watermark = JSON.parse(advancedSetting.watermark || null) || [];
    if (!currentLocation && watermark.length) {
      currentLocation = {};
      new MapLoader().loadJs().then(() => {
        this._maphHandler = new MapHandler();
        this._maphHandler.getCurrentPos((status, result) => {
          if (status === 'complete') {
            const { formattedAddress, position } = result;
            currentLocation = {
              formattedAddress,
              position
            }
          }
        });
      });
    }
  }
  componentWillUnmount() {
    if (this._maphHandler) {
      this._maphHandler.destroyMap();
      this._maphHandler = null;
    }
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
    const { advancedSetting = {}, projectId, appId, worksheetId } = self.props;

    const method = {
      FilesAdded(uploader, files) {
        if (parseFloat(files.reduce((total, file) => total + (file.size || 0), 0) / 1024 / 1024) > md.global.SysSettings.fileUploadLimitSize) {
          Toast.info('附件总大小超过 ' + formatFileSize(md.global.SysSettings.fileUploadLimitSize * 1024 * 1024) + '，请您分批次上传');
          uploader.stop();
          uploader.splice(uploader.files.length - files.length, uploader.files.length);
          return false;
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
          getToken(tokenFiles, 0, {
            projectId, appId, worksheetId
          }).then(res => {
            files.forEach((item, i) => {
              item.token = res[i].uptoken;
              item.key = res[i].key;
              item.serverName = res[i].serverName;
              item.fileName = res[i].fileName;
              item.url = res[i].url;
            });
            uploader.start();
          });
        };

        if (watermark.length) {
          // 添加水印
          Promise.all(
            files.filter(file => {
              const ext = File.GetExt(file.name);
              return File.isPicture(`.${ext}`);
            }).map(file => {
              return new Promise((resolve, reject) => {
                const nativeFile = file.getNative();
                const { formattedAddress, position } = currentLocation || {};
                const textLayouts = [];
                if (md.global.Account.fullname && watermark.includes('user')) {
                  textLayouts.push(md.global.Account.fullname);
                }
                if (watermark.includes('time')) {
                  textLayouts.push(moment().format('YYYY-MM-DD HH:mm:ss'));
                }
                if (formattedAddress && watermark.includes('address')) {
                  textLayouts.push(formattedAddress);
                }
                if (position && watermark.includes('xy')) {
                  textLayouts.push(`${_l('经度')}：${position.lng}  ${_l('纬度')}：${position.lat}`);
                }
                addWaterMarker(nativeFile, textLayouts).then(blob => {
                  const newFile = new File([blob], file.name, { type: blob.type });
                  file.getSource().setSource(newFile);
                  resolve();
                });
              });
            })
          ).then(() => {
            start();
          });
        } else {
          start();
        }
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
          Toast.info(_l('单个文件大小超过%0，无法支持上传', formatFileSize(md.global.SysSettings.fileUploadLimitSize * 1024 * 1024)));
        } else {
          Toast.info(_l('上传失败，请稍后再试。'));
        }
      },
      Init() {
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
        const ua = window.navigator.userAgent.toLowerCase();
        const isMiniprogram = ua.includes('miniprogram');

        if (ele) {
          // if (isMiniprogram) {
          //   ele.removeAttribute('multiple');
          // }

          // 拍照 or 拍摄
          if (customUploadType) {
            ele.setAttribute('accept', customUploadType === 'camara' ? 'image/*' : 'video/*');
            ele.setAttribute('capture', customUploadType);
          } else {
            ele.setAttribute('accept', type ? fileTypeObj[type] : inputType ? accept[inputType] : '*');
          }
        }
      },
    };
    $(this.uploadFileEl).plupload({
      url: md.global.FileStoreConfig.uploadHost,
      file_data_name: 'file',
      multi_selection: true,
      method,
      resize: _.get(advancedSetting, 'webcompress') !== '0' ? {
        quality: 60,
        preserve_headers: true
      } : undefined,
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
    const path = item.previewUrl || item.viewUrl || '';
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
