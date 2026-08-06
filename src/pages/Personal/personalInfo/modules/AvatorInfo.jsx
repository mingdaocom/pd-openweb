import React, { Component, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { Button, LoadDiv } from 'ming-ui';
import accountAjax from 'src/api/account';
import { browserIsMobile, getToken } from 'src/utils/common';

const MAX_FILE_SIZE = 1024 * 1024 * 10;
const DESKTOP_EDITOR_SIZE = 500;
const MOBILE_EDITOR_SIZE = 200;
const DEFAULT_CROP_RADIUS = 200;
const DESKTOP_PREVIEW_SIZE = 400;
const MOBILE_PREVIEW_SIZE = 80;

const LoadableAvatar = lazy(() => import('react-avatar-edit'));

const Wrap = styled.div`
  position: fixed;
  bottom: 0;
  height: 50px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 6px 20px;
  display: flex;
  width: 100%;
  background: var(--color-background-primary);
  left: 0;
  .cancle,
  .save {
    flex: 1;
    height: 36px;
    background: var(--color-background-primary);
    border-radius: 22px;
    opacity: 1;
    border: 1px solid var(--color-border-primary);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-primary);
    line-height: 36px;
    &.save {
      background: var(--color-primary);
      color: var(--color-white);
      border: 1px solid var(--color-primary);
    }
  }
`;

export default class AvatarEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatar: this.props.avatar,
      preview: null,
      src: '',
      editorImageWidth: browserIsMobile() ? MOBILE_EDITOR_SIZE : DESKTOP_EDITOR_SIZE,
      editorCropRadius: browserIsMobile() ? undefined : DEFAULT_CROP_RADIUS,
      minCropRadius: browserIsMobile() ? undefined : DEFAULT_CROP_RADIUS,
    };
    this.onCrop = this.onCrop.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onBeforeFileLoad = this.onBeforeFileLoad.bind(this);
  }

  static isUploading = false;

  componentWillUnmount() {
    this.isUnmounted = true;
    this.avatarLoadKey = '';
    this.revokeAvatarObjectUrl();
  }

  guid() {
    function S4() {
      return Math.trunc((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
  }

  onClose() {
    this.avatarLoadKey = '';
    this.revokeAvatarObjectUrl();
    this.setState({
      preview: null,
      src: '',
      editorImageWidth: this.getEditorSize(),
      editorCropRadius: this.getDefaultCropRadius(),
      minCropRadius: this.getDefaultMinCropRadius(),
    });
  }

  onCrop(preview) {
    this.setState({ preview });
  }

  onBeforeFileLoad(elem) {
    const file = elem.target.files[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(_l('图片过大'), 2);
      elem.target.value = '';
      return;
    }

    elem.target.value = '';
    this.loadAvatarFile(file);
  }

  getEditorSize = () => (browserIsMobile() ? MOBILE_EDITOR_SIZE : DESKTOP_EDITOR_SIZE);

  getDefaultCropRadius = () => {
    const { cropRadius } = this.props;

    return cropRadius || (browserIsMobile() ? undefined : DEFAULT_CROP_RADIUS);
  };

  getDefaultMinCropRadius = () => (browserIsMobile() ? undefined : this.getDefaultCropRadius());

  getAvatarEditorConfig = () => {
    const editorSize = this.getEditorSize();
    const cropRadius = this.getDefaultCropRadius();
    const minCropRadius = this.getDefaultMinCropRadius();

    return {
      editorImageWidth: editorSize,
      editorCropRadius: cropRadius,
      minCropRadius,
    };
  };

  getAvatarImageSrc = image => {
    const editorSize = this.getEditorSize();
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = editorSize;
    canvas.height = editorSize;

    if (!imageWidth || !imageHeight || !context) {
      return image.src;
    }

    const scale = Math.min(1, editorSize / imageWidth, editorSize / imageHeight);
    const drawWidth = Math.round(imageWidth * scale);
    const drawHeight = Math.round(imageHeight * scale);
    const drawLeft = Math.round((editorSize - drawWidth) / 2);
    const drawTop = Math.round((editorSize - drawHeight) / 2);

    context.clearRect(0, 0, editorSize, editorSize);
    context.drawImage(image, drawLeft, drawTop, drawWidth, drawHeight);

    return canvas.toDataURL('image/png');
  };

  revokeAvatarObjectUrl = () => {
    if (this.avatarObjectUrl) {
      URL.revokeObjectURL(this.avatarObjectUrl);
      this.avatarObjectUrl = '';
    }
  };

  loadAvatarFile = file => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    const avatarLoadKey = `${Date.now()}-${file.name}`;

    this.revokeAvatarObjectUrl();
    this.avatarObjectUrl = objectUrl;
    this.avatarLoadKey = avatarLoadKey;

    image.onload = () => {
      if (this.isUnmounted || this.avatarLoadKey !== avatarLoadKey) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      this.revokeAvatarObjectUrl();

      this.setState({
        src: this.getAvatarImageSrc(image),
        preview: null,
        ...this.getAvatarEditorConfig(),
      });
    };

    image.onerror = () => {
      this.revokeAvatarObjectUrl();

      if (this.isUnmounted || this.avatarLoadKey !== avatarLoadKey) {
        return;
      }

      alert(_l('图片加载失败'), 2);
    };

    image.src = objectUrl;
  };

  onSave = () => {
    const { preview } = this.state;

    if (!preview) {
      this.props.closeDialog();
      return;
    }

    //1= 用户头像
    getToken([{ bucket: 4, ext: '.png' }], this.props.defaultType ? 0 : 1).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${btoa(res[0].key)}`;
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
          if (xhr.readyState == 4) {
            const { key } = safeParse(xhr.responseText);

            if (!key) {
              return;
            }

            if (this.props.editAvatar) {
              this.props.editAvatar(res[0]);
              this.props.closeDialog();
            } else {
              accountAjax.editAccountAvatar({ fileName: key.replace('UserAvatar/', '') }).then(() => {
                this.props.updateAvator();
                this.props.closeDialog();
              });
            }
          }
        };

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('Authorization', 'UpToken ' + res[0].uptoken);
        xhr.send(preview.replace('data:image/png;base64,', ''));
      }
    });
  };

  render() {
    const { from, label } = this.props;
    const { avatar, preview, src, editorImageWidth, editorCropRadius, minCropRadius } = this.state;
    const isMobile = browserIsMobile();
    const editorSize = this.getEditorSize();

    if (!avatar) {
      return null;
    }

    const avatarUrl =
      avatar.indexOf('imageView2') > -1
        ? avatar.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/w/400')
        : avatar + `${avatar.includes('?') ? '&' : '?'}imageView2/2/w/400`;

    return (
      <div className="mTop25">
        <div className="flexRow" style={{ minHeight: editorSize }}>
          <Suspense
            fallback={
              <div style={{ width: editorSize, height: editorSize }} className="flexRow alignItemsCenter">
                <LoadDiv />
              </div>
            }
          >
            <LoadableAvatar
              key={`${src || 'empty'}-${editorImageWidth}-${editorCropRadius}-${minCropRadius}`}
              label={label || _l('上传图片')}
              labelStyle={{ display: 'block', cursor: 'pointer', fontWeight: 700, fontSize: '16px' }}
              width={src ? editorImageWidth : editorSize}
              height={editorSize}
              imageWidth={src ? editorImageWidth : editorSize}
              exportAsSquare
              exportSize={isMobile ? undefined : 400}
              cropRadius={editorCropRadius}
              minCropRadius={minCropRadius}
              onCrop={this.onCrop}
              onClose={this.onClose}
              onBeforeFileLoad={this.onBeforeFileLoad}
              src={src}
            />
          </Suspense>
          {!(from === 'integration' && !preview) && (
            <div className="reviewBox">
              <span className="Block textTertiary mBottom16">{_l('预览')}</span>
              <img
                src={preview || avatarUrl}
                alt=""
                style={{
                  width: isMobile ? MOBILE_PREVIEW_SIZE : DESKTOP_PREVIEW_SIZE,
                  height: isMobile ? MOBILE_PREVIEW_SIZE : DESKTOP_PREVIEW_SIZE,
                  objectFit: 'cover',
                  borderRadius: 0,
                  display: 'block',
                }}
              />
            </div>
          )}
        </div>
        {!isMobile ? (
          <div className="flexEnd">
            <Button type="button" className="ming Button Button--primary mTop20 saveBtn" onClick={this.onSave}>
              {_l('完成')}
            </Button>
          </div>
        ) : (
          <Wrap className="actionBox">
            <div
              className="cancle Font14 Bold mRight5 TxtCenter"
              onClick={() => {
                this.props.closeDialog();
              }}
            >
              {_l('取消')}
            </div>
            <div
              className="save Hand Font14 Bold mLeft5 TxtCenter"
              onClick={() => {
                this.onSave();
              }}
            >
              {_l('确认')}
            </div>
          </Wrap>
        )}
      </div>
    );
  }
}
