import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { QiniuUpload } from 'ming-ui';

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
  const handleClear = useCallback(() => {
    try {
      uploaderRef.current.uploader.disableBrowse(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    uploader: uploaderRef.current,
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
          console.log('执行了 callback');
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
        setFiles([
          ...files.map(f => ({
            id: f.id,
            size: f.size,
            type: f.type,
            name: f.name,
            status: 'added',
            file: f,
          })),
        ]);
        onAdd(up, files);
      }}
      onUploadProgress={(up, file) => {
        onUploadProgress(up, file);
      }}
      onUploaded={(up, file, response) => {
        onUploaded(up, file, response);
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
