import React, { forwardRef, Fragment, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { compatibleMDJS } from 'src/utils/project';
import UploadFiles from '../UploadFiles';

const PhotoRecognition = forwardRef((props, ref) => {
  const {
    children,
    setAiToastVisible,
    setAiToastType,
    onGenerateRecord = () => {},
    onAbort = () => {},
    closeMingoCreationImmediate = () => {},
  } = props;
  const propsRef = useRef(props);
  const uploadFilesRef = useRef(null);
  const [uploadSessionId, setUploadSessionId] = useState('');
  // 已文件列表
  const existingFilesRef = useRef([]);

  const setFiles = files => {
    existingFilesRef.current = files;
  };

  const handleAppUpload = () => {
    compatibleMDJS('chooseImage', {
      sessionId: uploadSessionId,
      count: 5,
      mediaType: 'image',
      format: ['jpg', 'jpeg', 'png', 'heic'],
      knowledge: false,
      success: res => {
        const { sessionId, completed, error, uploading } = res;
        setUploadSessionId(sessionId);
        if (completed?.length) {
          closeMingoCreationImmediate();
          onGenerateRecord({ filesList: completed });
        }

        if (!uploading && error) {
          alert(_l('上传失败'), 2);
        }
      },
      cancel: () => {},
    });
  };

  const handleUploaded = (up, file) => {
    up.disableBrowse(false);
    // 更新 ref 中的文件列表
    existingFilesRef.current = existingFilesRef.current.map(f =>
      f.id === file.id ? { ...f, status: 'uploaded', file, url: file.url } : f,
    );

    const allHaveUrl = existingFilesRef.current.every(f => !!f.url);
    if (existingFilesRef.current.length && allHaveUrl) {
      onGenerateRecord({ filesList: existingFilesRef.current });
    }
  };

  const getFileInput = () => {
    const uploader = uploadFilesRef.current?.uploader;
    if (uploader) {
      return uploader.upload?.nextElementSibling?.firstElementChild;
    }
    return null;
  };

  const openCamera = () => {
    const fileInput = getFileInput();
    if (!fileInput) return;

    if (!fileInput.hasAttribute('capture')) {
      fileInput.setAttribute('capture', 'environment');
    }

    fileInput.click();
  };

  useEffect(() => {
    return () => {
      onAbort();
    };
  }, []);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useImperativeHandle(ref, () => ({
    handleAppUpload,
    openCamera,
  }));

  return (
    <Fragment>
      {window.isMingDaoApp ? (
        <div onClick={handleAppUpload}>{children}</div>
      ) : (
        <UploadFiles
          ref={uploadFilesRef}
          setFiles={setFiles}
          onAdd={up => {
            closeMingoCreationImmediate();
            setAiToastType('uploading');
            setAiToastVisible(true);
            up.disableBrowse();
          }}
          onUploaded={handleUploaded}
          onError={() => {
            setAiToastVisible(false);
          }}
        >
          {children}
        </UploadFiles>
      )}
    </Fragment>
  );
});

export default memo(PhotoRecognition);
