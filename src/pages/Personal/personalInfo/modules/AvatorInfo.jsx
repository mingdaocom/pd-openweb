import React, { Component } from 'react';
import Avatar from 'react-avatar-edit';
import { Button } from 'ming-ui';
import qiniuAjax from 'src/api/qiniu';
import { Base64 } from 'js-base64';
import { editAccountAvatar } from 'src/api/account';

export default class AvatarEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatar: this.props.avatar,
      preview: null,
      src: '',
    };
    this.onCrop = this.onCrop.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onBeforeFileLoad = this.onBeforeFileLoad.bind(this);
  }

  static isUploading = false;

  guid() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
  }

  onClose() {
    this.setState({ preview: null });
  }

  onCrop(preview) {
    this.setState({ preview });
  }

  onBeforeFileLoad(elem) {
    if (elem.target.files[0].size > 1024 * 1024 * 10) {
      alert(_l('图片过大'));
      elem.target.value = '';
    }
  }

  onSave = () => {
    const { preview } = this.state;
    console.log(11)
    if(!preview) {
      this.props.closeDialog()
      return
    }

    qiniuAjax.getUploadToken({ bucket: 4 }).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        const key = Base64.encode(`UserAvatar/${this.guid()}.png`);
        const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${key}`;
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
          if (xhr.readyState == 4 && JSON.parse(xhr.responseText).key) {
            editAccountAvatar({ fileName: JSON.parse(xhr.responseText).key.replace('UserAvatar/', '') }).then(() => {
              this.props.updateAvator()
              this.props.closeDialog()
            });
          }
        };
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('Authorization', 'UpToken ' + res.uptoken);
        xhr.send(preview.replace('data:image/png;base64,', ''));
      }
    });
  };

  render() {
    const { avatar, preview } = this.state;

    if (!avatar) {
      return null;
    }

    return (
      <div className="mTop25">
        <div className="flexRow">
          <Avatar
            label={_l('上传图片')}
            width={200}
            height={200}
            imageWidth={200}
            onCrop={this.onCrop}
            onClose={this.onClose}
            onBeforeFileLoad={this.onBeforeFileLoad}
            src={this.state.src}
          />
          <div className="reviewBox">
            <span className="Block Gray_9e mBottom16">{_l('预览')}</span>
            <img src={preview || avatar} style={{ width: 80, height: 80, borderRadius: '50%' }} />
          </div>
        </div>
        <div className="flexEnd">
          <button type="button" className="ming Button Button--primary mTop20 saveBtn" onClick={this.onSave}>
            {_l('完成')}
          </button>
        </div>
      </div>
    );
  }
}
