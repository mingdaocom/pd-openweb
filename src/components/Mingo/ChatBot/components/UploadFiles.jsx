import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useCallback } from 'react';
import { QiniuUpload } from 'ming-ui';

function UploadFiles(
  {
    disabled,
    tokenType,
    existingFiles = [],
    maxFilesLength = 5,
    children,
    dropElementId,
    onAdd = () => {},
    onUploaded = () => {},
    onUploadProgress = () => {},
    onError = () => {},
    removeFile = () => {},
    allowMultiSelection = true,
    allowMimeTypes = [{ title: 'image', extensions: 'jpg,jpeg,png' }],
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
    clear: handleClear,
    uploader: uploaderRef.current,
  }));
  useEffect(() => {
    cache.current.existingFiles = existingFiles;
  }, [existingFiles]);
  if (disabled) return <span className="InlineBlock">{children}</span>;
  return (
    <QiniuUpload
      ref={uploaderRef}
      options={{
        type: tokenType || 32,
        multi_selection: allowMultiSelection,
        drop_element: dropElementId,
        paste_element: dropElementId,
        filters: {
          mime_types: allowMimeTypes,
        },
        max_file_size: '10m',
        error_callback: () => {
          handleClear();
          alert(_l('有不合法的文件格式，请重新选择图片上传'), 3);
          return;
        },
        remove_files_callback: (up, files) => {
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
