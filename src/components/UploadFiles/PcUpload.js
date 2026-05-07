import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Modal } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';

const PcUploadModalWrap = styled(Modal)`
  .bgCloseIcon {
    font-size: 24px;
    color: #fff !important;
  }

  .pcUploadDialogContent {
    min-height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .previewHeader {
      position: absolute;
      top: 10px;
      left: 24px;
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .emptyIcon {
      font-size: 80px;
      color: var(--color-text-secondary);
    }
    .emptyTitle {
      font-size: 16px;
      font-weight: 500;
      margin: 10px 0;
      color: var(--color-text-primary);
    }
    .emptyDesc {
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    video {
      position: absolute;
      top: 0;
      width: 100%;
      left: 0;
      right: 0;
      height: 360px;
      object-fit: contain;
    }

    .photoList {
      cursor: pointer;
      width: 66px;
      height: 43px;
      position: relative;
      .photoCount {
        position: absolute;
        right: -10px;
        top: -10px;
        color: #fff;
        line-height: 20px;
        text-align: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--color-text-secondary);
      }
    }

    .cameraFooter {
      flex: 1;
      display: flex;
      align-items: center;
      position: absolute;
      bottom: 0;
      left: 0;
      height: 100px;
      right: 0;
      padding: 0 25px;
      .cameraButton {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        margin-left: calc(50% - 132px);
        i {
          font-size: 24px;
          margin-right: 8px;
        }
      }
    }

    .imagePreviewWrap {
      position: relative;
      width: 100%;
      margin-top: 30px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      .previewImage {
        display: flex;
        flex-direction: column;
        img {
          max-height: 300px;
          object-fit: contain;
        }
      }
      .previewArrow {
        height: inherit;
        display: flex;
        align-items: center;
        cursor: pointer;
        color: var(--color-text-secondary);
        &.disabled {
          cursor: not-allowed;
          color: var(--color-text-disabled);
        }
        &:hover:not(.disabled) {
          opacity: 0.8;
        }
        i {
          font-size: 26px;
          &:first-child {
            margin-right: 12px;
          }
          &:last-child {
            margin-left: 12px;
          }
        }
      }
    }
    .previewInfo {
      width: 100%;
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      span:first-child {
        color: var(--color-text-primary);

        & > span {
          color: var(--color-text-secondary);
        }
      }
      .icon {
        font-size: 18px;
        color: var(--color-error);
        cursor: pointer;
        &:hover {
          color: var(--color-error-hover);
        }
      }
    }

    .previewFooter {
      width: 100%;
      margin-top: 24px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      button:first-child {
        margin-right: 16px;
      }
    }
  }
`;

const CAMERA_STATUS = {
  CAMERA_PERMISSION: 0,
  CAMERA_OPENED: 1,
  CAMERA_PREVIEW: 2,
};

const MAX_PHOTO_COUNT = 10;

function PcUpload(props) {
  const [cameraStatus, setCameraStatus] = useState(null);
  const [photoList, setPhotoList] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasContextRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraStatus(CAMERA_STATUS.CAMERA_PERMISSION);
          return;
        }

        // 请求摄像头权限
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        // 权限获取成功，设置状态和视频流
        streamRef.current = mediaStream;
        setCameraStatus(CAMERA_STATUS.CAMERA_OPENED);
      } catch (error) {
        console.log('获取摄像头权限失败:', error);
        setCameraStatus(CAMERA_STATUS.CAMERA_PERMISSION);
      }
    };

    initCamera();

    // 清理函数：组件卸载时停止视频流
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!(cameraStatus === CAMERA_STATUS.CAMERA_OPENED && streamRef.current && videoRef.current)) {
      return;
    }

    const video = videoRef.current;

    video.srcObject = streamRef.current;
    video.setAttribute('playsinline', true);
    video.disablePictureInPicture = true;
    video.play().catch(error => {
      console.log('播放视频失败:', error);
    });

    const handleLoadedMetadata = () => {
      if (!canvasRef.current || canvasContextRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      canvas.width = w;
      canvas.height = h;
      canvasContextRef.current = canvas.getContext('2d');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [cameraStatus]);

  // 拍照功能
  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (photoList.length >= MAX_PHOTO_COUNT) {
      alert(_l('拍照数量超出限制，一次最多拍摄%0张照片', MAX_PHOTO_COUNT), 3);
      return;
    }

    const ctx = canvasContextRef.current || canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      const fileName = `Cam_${moment().format('yyyyMMDDHHmmss')}.jpg`;
      var file = new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });
      setPhotoList([...photoList, file]);
    });
  };

  const handleComplete = () => {
    if (photoList.length) {
      props.onOk(photoList);
    }

    props.onClose && props.onClose();
  };

  const handleDelete = () => {
    const newPhotoList = photoList.filter((i, index) => index !== previewIndex);
    setPhotoList(newPhotoList);
  };

  const renderContent = () => {
    if (cameraStatus === CAMERA_STATUS.CAMERA_PERMISSION) {
      return (
        <Fragment>
          <i className="icon icon-switch_camera emptyIcon" />
          <span className="emptyTitle">{_l('请允许使用摄像头')}</span>
          <span className="emptyDesc">{_l('为了使用摄像头拍照，请允许本网站获取摄像头权限。')}</span>
        </Fragment>
      );
    }

    if (cameraStatus === CAMERA_STATUS.CAMERA_OPENED) {
      return (
        <Fragment>
          <video ref={videoRef} autoPlay playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="cameraFooter">
            <div
              className="photoList"
              onClick={() => {
                if (photoList.length > 0) {
                  canvasContextRef.current = null;
                  setCameraStatus(CAMERA_STATUS.CAMERA_PREVIEW);
                  setPreviewIndex(0);
                }
              }}
            >
              {photoList.length > 0 && (
                <Fragment>
                  <img src={URL.createObjectURL(_.last(photoList))} alt="photo" width="100%" height="100%" />
                  <div className="photoCount">{photoList.length}</div>
                </Fragment>
              )}
            </div>
            <Button className="cameraButton" onClick={handleTakePhoto} icon="switch_camera" size="large">
              {_l('拍照')}
            </Button>
          </div>
        </Fragment>
      );
    }

    if (cameraStatus === CAMERA_STATUS.CAMERA_PREVIEW) {
      const currentFile = photoList[previewIndex];
      const hasPrev = previewIndex > 0;
      const hasNext = previewIndex < photoList.length - 1;
      const goPrev = () => setPreviewIndex(i => (i > 0 ? i - 1 : i));
      const goNext = () => setPreviewIndex(i => (i < photoList.length - 1 ? i + 1 : i));

      return (
        <Fragment>
          <div className="previewHeader">{_l('预览')}</div>
          <div className="imagePreviewWrap">
            <div className={cx('previewArrow', { disabled: !hasPrev })} onClick={goPrev}>
              <i className="icon icon-arrow-left-border" />
            </div>
            {currentFile && (
              <div className="previewImage">
                <img src={URL.createObjectURL(currentFile)} alt={currentFile.name} />
                <div className="previewInfo">
                  <span>
                    {currentFile.name} <span>{(currentFile.size / 1024).toFixed(0)}KB</span>
                  </span>
                  <i className="icon icon-delete1" onClick={handleDelete} />
                </div>
              </div>
            )}
            <div className={cx('previewArrow', { disabled: !hasNext })} onClick={goNext}>
              <i className="icon icon-arrow-right-border" />
            </div>
          </div>

          <div className="previewFooter">
            <Button
              className="ghost"
              onClick={() => setCameraStatus(CAMERA_STATUS.CAMERA_OPENED)}
              disabled={photoList.length >= MAX_PHOTO_COUNT}
            >
              {_l('继续拍照')}
            </Button>
            <Button className="primary" onClick={handleComplete}>
              {_l('完成')}
            </Button>
          </div>
        </Fragment>
      );
    }

    return null;
  };

  return (
    <PcUploadModalWrap
      visible
      width={640}
      title={null}
      footer={null}
      centered={true}
      destroyOnClose={true}
      className="pcUploadModal"
      onCancel={() => {
        props.onClose && props.onClose();
      }}
      closeIcon={
        cameraStatus === CAMERA_STATUS.CAMERA_OPENED ? (
          <i className="bgCloseIcon icon-delete_out" data-tip={_l('退出')} />
        ) : undefined
      }
    >
      <div className="pcUploadDialogContent">{renderContent()}</div>
    </PcUploadModalWrap>
  );
}

export default function openPcCamera(props) {
  return functionWrap(PcUpload, props);
}
