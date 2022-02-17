import React, { Component } from 'react';
import { handleMessageFilePreview } from '../MessageToolbar';
import previewAttachments from 'previewAttachments';
import Constant from '../../../utils/constant';
import './index.less';
import { formatFileSize, getClassNameByExt } from 'src/util';

export default class FileMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      cancel: false,
      cancelShow: false,
    };
    const { files } = this.props.message.msg;
    this.iconClassName = getClassNameByExt(File.GetExt((files || {}).name));
    this.uploader = null;
  }
  componentDidMount() {
    const { message } = this.props;
    const { files } = message.msg;
    const { aid } = files;

    if (aid) return;

    window[`chatBeforeUpload${files.id}`] = uploader => {
      // 上传文件对象
      this.uploader = uploader;
    };
    window[`chatUploadProgress${files.id}`] = progress => {
      this.setState({
        progress: Number(progress),
        cancelShow: true,
      });
    };
  }
  handleStopFile() {
    const { files } = this.props.message.msg;
    if (this.uploader) {
      this.uploader.stop();
      this.uploader.removeFile({ id: files.id });
      this.uploader.start();
    }
    this.setState(
      {
        cancel: true,
      },
      () => {
        delete window[`chatBeforeUpload${files.id}`];
        delete window[`chatUploadProgress${files.id}`];
      },
    );
  }
  handleMessageFilePreview() {
    const { message } = this.props;
    const { type } = message;
    if (type === Constant.SESSIONTYPE_CALENDAR) {
      if (message.kcFile) {
        previewAttachments(
          {
            attachments: [message.kcFile],
            callFrom: 'kc',
            hideFunctions: ['editFileName'],
          },
          {},
        );
      } else {
        alert('权限不足或文件不存在，请联系文件夹管理员或文件上传者', 3);
      }
    } else {
      if (message.isPrepare) return;
      handleMessageFilePreview.call(this);
    }
  }
  render() {
    const { message } = this.props;
    const { files = {} } = message.msg;
    const { progress, cancel, cancelShow } = this.state;
    const isKc = message.card ? message.card.md === 'kcfile' : false;
    const size = formatFileSize(files.fsize || files.size);
    return (
      <div className="Message-file" onClick={this.handleMessageFilePreview.bind(this)}>
        <div className="Message-fileIcon">
          <i className={this.iconClassName} />
        </div>
        <div className="Message-fileInfo">
          <div className="Message-fileName">{files.name}</div>
          {message.isPrepare && !cancel ? (
            <div className="Message-fileProgress">
              <div className="Message-fileProgressBar" style={{ width: `${progress}%` }} />
            </div>
          ) : cancel ? (
            <div className="Message-fileError">{_l('您已取消发送')}</div>
          ) : (
            <div className="Message-fileSize">{`${isKc ? _l('来自知识中心') : ''} ${size}`}</div>
          )}
        </div>
        {message.isPrepare && !cancel && cancelShow ? (
          <div className="Message-fileAction" onClick={this.handleStopFile.bind(this)}>
            <span className="btn btnCancel" title={_l('取消')}>
              <i className="icon-closeelement-bg-circle" />
            </span>
          </div>
        ) : undefined}
      </div>
    );
  }
}
