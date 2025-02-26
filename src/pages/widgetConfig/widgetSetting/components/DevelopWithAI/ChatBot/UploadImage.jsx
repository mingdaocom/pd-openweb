import React, { useState, Fragment, useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { QiniuUpload } from 'ming-ui';
import { humanFileSize } from 'src/pages/kc/utils';
import { useCallback } from 'react';
import { drop, set } from 'lodash';

const Con = styled.div`
  position: relative;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  .icon {
    color: #757575;
    font-size: 16px;
  }
  .hint {
    font-size: 12px;
    color: #9e9e9e;
    margin-left: 6px;
  }
  .delete {
    margin-left: 10px;
    visibility: hidden;
  }
  &.init {
    .hint {
      visibility: hidden;
    }
  }
  &.uploaded {
    .hint {
      color: #333;
    }
  }
  &.uploading {
    .loading {
      animation: rotate 0.6s linear infinite;
    }
  }
  &:hover {
    .imagePreview,
    .delete,
    .hint {
      visibility: visible;
    }
  }
`;

const ImagePreview = styled.div`
  position: absolute;
  left: 22px;
  bottom: 22px;
  background: #fff;
  border-radius: 4px 4px 4px 4px;
  border: 2px solid #e1e1e1;
  display: flex;
  justify-content: center;
  align-items: center;
  visibility: hidden;
  img {
    max-width: 240px;
    max-height: 90px;
    object-fit: contain;
  }
`;

function UploadImage(
  { dropElementId, dropElement, onUploaded = () => {}, onBegin = () => {}, onError = () => {} },
  ref,
) {
  const uploaderRef = useRef(null);
  const [status, setStatus] = useState('init'); // init, uploading, uploaded
  const [file, setFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const handleClear = useCallback(() => {
    setFile(null);
    setStatus('init');
    setImagePreviewUrl('');
    try {
      uploaderRef.current.uploader.disableBrowse(false);
    } catch (err) {
      console.error(err);
    }
  }, []);
  useImperativeHandle(ref, () => ({
    clear: handleClear,
  }));
  return (
    dropElement && (
      <QiniuUpload
        ref={uploaderRef}
        options={{
          type: 32,
          multi_selection: false,
          drop_element: dropElementId,
          paste_element: dropElementId,
          filters: {
            mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
          },
          max_file_size: '5m',
          error_callback: () => {
            handleClear();
            alert(_l('有不合法的文件格式，请重新选择图片上传'), 3);
            return;
          },
        }}
        bucket={4}
        onUploaded={(up, files, res) => {
          setStatus('uploaded');
          onUploaded(res.serverName + res.key);
        }}
        onAdd={(up, files) => {
          setStatus('uploading');
          setFile(files[0]);
          setImagePreviewUrl(window.URL.createObjectURL(files[0].getNative()));
          up.disableBrowse();
          onBegin();
        }}
        onError={(up, err) => {
          alert(_l('上传失败'), 2);
          handleClear();
          up.disableBrowse(false);
          onError();
        }}
      >
        <Con className={status}>
          {status === 'init' && (
            <Fragment>
              <i className="icon icon-upload_pictures"></i>
              <span className="hint">{_l('上传图片，不超过3MB')}</span>
            </Fragment>
          )}
          {status === 'uploading' && (
            <Fragment>
              <i className="icon icon-loading_button loading"></i>
              <span className="hint">{_l('正在上传 %0', `${file.name} (${humanFileSize(file.size)})`)}</span>
            </Fragment>
          )}
          {status === 'uploaded' && (
            <Fragment>
              {imagePreviewUrl && (
                <ImagePreview className="imagePreview">
                  <img src={imagePreviewUrl} alt={file.name} />
                </ImagePreview>
              )}
              <i className="icon icon-custom_insert_photo"></i>
              <span className="hint">{`${file.name} (${humanFileSize(file.size)})`}</span>
              <i className="icon icon-trash delete" onClick={handleClear}></i>
            </Fragment>
          )}
        </Con>
      </QiniuUpload>
    )
  );
}

export default forwardRef(UploadImage);
