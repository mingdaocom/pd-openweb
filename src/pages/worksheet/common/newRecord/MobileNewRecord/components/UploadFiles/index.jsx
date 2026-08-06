import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { QiniuUpload } from 'ming-ui';

const formatUploadFile = (file = {}, status = 'added') => ({
  id: file.id,
  size: file.size,
  type: file.type,
  name: file.name,
  url: file.url,
  status,
  file: {
    id: file.id,
    url: file.url,
  },
});

function UploadFiles(
  {
    maxFilesLength = 5,
    existingFiles = [],
    children,
    setFiles = () => {},
    onAdd = () => {},
    onUploaded = () => {},
    onError = () => {},
    removeFile = () => {},
    onUploadProgress = () => {},
    allowMultiSelection = true,
    allowMimeTypes = [{ title: 'image', extensions: 'jpg,jpeg,png,heic' }],
  },
  ref,
) {
  const uploaderRef = useRef(null);
  const cache = useRef({});
  const suppressRemoveCallbackRef = useRef(false);
  const getUploader = useCallback(() => uploaderRef.current?.uploader, []);
  const handleClear = useCallback(() => {
    try {
      getUploader()?.disableBrowse(false);
    } catch (err) {
      console.error(err);
    }
  }, [getUploader]);

  const removeUploadFile = useCallback(
    (file, options = {}) => {
      const uploader = getUploader();

      if (!uploader || !file?.id) return;

      try {
        suppressRemoveCallbackRef.current = !!options.silent;
        uploader.removeFile(file);
      } finally {
        suppressRemoveCallbackRef.current = false;
      }
    },
    [getUploader],
  );

  const clearUploadFiles = useCallback(() => {
    const uploader = getUploader();

    if (!uploader?.files?.length) return;

    try {
      suppressRemoveCallbackRef.current = true;
      uploader.files.slice().forEach(file => {
        uploader.removeFile(file);
      });
    } finally {
      suppressRemoveCallbackRef.current = false;
    }
  }, [getUploader]);

  useImperativeHandle(ref, () => ({
    uploader: uploaderRef.current,
    clearUploadFiles,
    removeUploadFile,
  }));

  useEffect(() => {
    cache.current.existingFiles = existingFiles;
  }, [existingFiles]);

  return (
    <QiniuUpload
      ref={uploaderRef}
      options={{
        multi_selection: allowMultiSelection,
        filters: {
          mime_types: allowMimeTypes,
        },
        max_file_size: '100m',
        error_callback: () => {
          handleClear();
          alert(_l('有不合法的文件格式，请重新选择图片上传'), 3);
          return;
        },
        remove_files_callback: (up, files) => {
          if (suppressRemoveCallbackRef.current) return;

          files.forEach(file => {
            up.removeFile(file);
            removeFile(file);
          });
        },
      }}
      onAdd={(up, files) => {
        if (files.length + cache.current?.existingFiles?.length > maxFilesLength) {
          alert(_l('最多上传%0个文件', maxFilesLength), 2);
          files.forEach(file => {
            up.removeFile(file);
          });
          return;
        }

        setFiles(files.map(file => formatUploadFile(file)));
        onAdd(up, files);
      }}
      onUploadProgress={(up, file) => {
        onUploadProgress(up, file);
      }}
      onUploaded={(up, file, response) => {
        onUploaded(up, file, response);
        removeUploadFile(file, { silent: true });
      }}
      onError={(up, err, errorTip) => {
        alert(errorTip || _l('上传失败'), 2);
        handleClear();
        up.disableBrowse(false);
        onError(err.file);
      }}
    >
      {children}
    </QiniuUpload>
  );
}

export default forwardRef(UploadFiles);
