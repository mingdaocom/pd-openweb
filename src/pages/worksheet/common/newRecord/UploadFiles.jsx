import React, { useCallback, useRef } from 'react';
import { QiniuUpload } from 'ming-ui';

function UploadFiles({
  children,
  onAdd = () => {},
  onUploaded = () => {},
  onError = () => {},
  allowMimeTypes = [{ title: 'image', extensions: 'jpg,jpeg,png' }],
}) {
  const uploaderRef = useRef(null);
  const handleClear = useCallback(() => {
    try {
      uploaderRef.current.uploader.disableBrowse(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <QiniuUpload
      ref={uploaderRef}
      options={{
        multi_selection: false,
        filters: {
          mime_types: allowMimeTypes,
        },
        max_file_size: '100m',
        error_callback: () => {
          handleClear();
          alert(_l('有不合法的文件格式，请重新选择图片上传'), 3);
          return;
        },
      }}
      onAdd={(up, files) => {
        onAdd(up, files);
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

export default UploadFiles;
