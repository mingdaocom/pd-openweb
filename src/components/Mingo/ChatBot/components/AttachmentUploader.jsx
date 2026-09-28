import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { formatResponseData } from 'src/utils/platform/file/attachment';
import { compatibleMDJS } from 'src/utils/services/project';
import UploadFiles from './UploadFiles';

const DEFAULT_APP_UPLOAD_FORMATS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
const APP_IMAGE_MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
};
const SHOW_FILES_AND_APPS = 1;

export function getAppUploadFormats(allowMimeTypes = []) {
  const formats = allowMimeTypes
    .reduce((result, item) => result.concat(String(item.extensions || '').split(',')), [])
    .map(extension => extension.trim().replace(/^\./, '').toLowerCase())
    .filter(Boolean);

  return formats.length ? [...new Set(formats)] : DEFAULT_APP_UPLOAD_FORMATS;
}

function getAppFileExtension(file = {}) {
  return String(file.fileExt || '')
    .trim()
    .replace(/^\./, '')
    .toLowerCase();
}

function getAppFileName(file = {}) {
  const name = String(file.originalFileName || file.fileName || '');
  const extension = getAppFileExtension(file);

  if (!extension || name.toLowerCase().endsWith(`.${extension}`)) return name;
  return `${name}.${extension}`;
}

function getAppFileType(file = {}) {
  const extension = getAppFileExtension(file);

  return APP_IMAGE_MIME_TYPES[extension] || file.type;
}

function normalizeAppFile(file = {}) {
  const normalizedFile = {
    ...file,
    id: file.fileID,
    size: file.fileSize,
    name: getAppFileName(file),
    type: getAppFileType(file),
  };

  return {
    id: normalizedFile.id,
    size: normalizedFile.fileSize,
    type: normalizedFile.type,
    name: normalizedFile.name,
    status: 'uploaded',
    file: normalizedFile,
    commonAttachment: formatResponseData(normalizedFile, normalizedFile),
    url: normalizedFile.url,
  };
}

function updateUploadedFiles(files, sessionId, completed = []) {
  const nextFiles = files.filter(file => file.id !== sessionId);

  completed.forEach(file => {
    const nextFile = normalizeAppFile(file);
    const index = nextFiles.findIndex(item => item.id === nextFile.id);

    if (index >= 0) {
      nextFiles[index] = nextFile;
    } else {
      nextFiles.push(nextFile);
    }
  });

  return nextFiles;
}

function AttachmentUploader(
  {
    disabled,
    files = [],
    tokenType,
    maxFilesLength = 5,
    allowMimeTypes,
    allowMultiSelection = true,
    cameraOnly = false,
    dropElementId,
    onChange = () => {},
    onAfterAdd = () => {},
    onChooseApp,
    children,
  },
  ref,
) {
  const uploaderRef = useRef(null);
  const [uploadSessionId, setUploadSessionId] = useState('');
  const canChooseApp = window.isMingDaoApp && !cameraOnly && typeof onChooseApp === 'function';

  const handleAppChooseFile = useCallback(() => {
    if (disabled) return;

    const remainingCount = maxFilesLength - files.length;

    if (remainingCount <= 0 && !canChooseApp) {
      alert(_l('最多上传%0个文件', maxFilesLength), 2);
      return;
    }

    compatibleMDJS('chooseImage', {
      sessionId: uploadSessionId,
      knowledge: false,
      showAppList: canChooseApp ? SHOW_FILES_AND_APPS : 0,
      count: cameraOnly || !allowMultiSelection ? 1 : Math.max(remainingCount, 1),
      format: getAppUploadFormats(allowMimeTypes),
      sourceType: cameraOnly ? ['camera'] : undefined,
      success: res => {
        const { sessionId, completed = [], error, uploading, app } = res || {};

        if (sessionId) setUploadSessionId(sessionId);
        if (app && canChooseApp) {
          onChooseApp(app);
          onAfterAdd();
          return;
        }

        if ((completed.length || sessionId) && remainingCount <= 0) {
          alert(_l('最多上传%0个文件', maxFilesLength), 2);
          return;
        }

        if (completed.length) {
          onChange(prev => updateUploadedFiles(prev, sessionId, completed));
        } else if (sessionId) {
          onChange(prev => {
            const nextFiles = prev.filter(file => file.id !== sessionId);

            return nextFiles.concat({ id: sessionId, status: 'added' });
          });
        }

        if (!uploading && error) {
          alert(_l('上传失败'), 2);
          if (sessionId) {
            onChange(prev => prev.map(file => (file.id === sessionId ? { ...file, status: 'error' } : file)));
          }
        }

        onAfterAdd();
      },
      cancel: () => {},
    });
  }, [
    allowMimeTypes,
    allowMultiSelection,
    canChooseApp,
    cameraOnly,
    disabled,
    files.length,
    maxFilesLength,
    onAfterAdd,
    onChooseApp,
    onChange,
    uploadSessionId,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => (window.isMingDaoApp ? handleAppChooseFile() : uploaderRef.current?.open()),
    }),
    [handleAppChooseFile],
  );

  if (window.isMingDaoApp) {
    return (
      <span className="InlineBlock" onClick={handleAppChooseFile}>
        {children}
      </span>
    );
  }

  return (
    <UploadFiles
      ref={uploaderRef}
      disabled={disabled}
      tokenType={tokenType}
      maxFilesLength={maxFilesLength}
      existingFiles={files}
      allowMimeTypes={allowMimeTypes}
      allowMultiSelection={cameraOnly ? false : allowMultiSelection}
      capture={cameraOnly}
      dropElementId={dropElementId}
      onAdd={(_up, added) => {
        onChange(prev => [
          ...prev,
          ...added.map(file => ({
            id: file.id,
            size: file.size,
            type: file.type,
            name: file.name,
            status: 'added',
            file,
          })),
        ]);
        onAfterAdd();
      }}
      onUploadProgress={(_up, file) => {
        const progress = ((file.loaded / file.size) * 100).toFixed(0);

        onChange(prev =>
          prev.map(item => (item.id === file.id ? { ...item, status: 'uploading', file, progress } : item)),
        );
      }}
      onUploaded={(_up, file, response) => {
        const commonAttachment = formatResponseData(file, response);

        onChange(prev =>
          prev.map(item =>
            item.id === file.id ? { ...item, status: 'uploaded', file, commonAttachment, url: file.url } : item,
          ),
        );
      }}
      onError={file => onChange(prev => prev.map(item => (item.id === file?.id ? { ...item, status: 'error' } : item)))}
      removeFile={file => onChange(prev => prev.filter(item => item.id !== file.id))}
    >
      {children}
    </UploadFiles>
  );
}

export default forwardRef(AttachmentUploader);
