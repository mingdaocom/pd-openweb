import React, { useState } from 'react';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import { compatibleMDJS } from 'src/utils/project';
import UploadFiles from './UploadFiles';

const DEFAULT_APP_UPLOAD_FORMATS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];

function getAppFileType(file = {}) {
  return ['.jpg', '.jpeg', '.png'].includes(file.fileExt) ? 'image' : file.type;
}

function normalizeAppFile(file = {}) {
  const normalizedFile = {
    ...file,
    id: file.fileID,
    size: file.fileSize,
    name: file.originalFileName,
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

export default function AttachmentUploader({
  disabled,
  files = [],
  tokenType,
  maxFilesLength = 5,
  allowMimeTypes,
  allowMultiSelection = true,
  dropElementId,
  onChange = () => {},
  onAfterAdd = () => {},
  children,
}) {
  const [uploadSessionId, setUploadSessionId] = useState('');

  const handleAppChooseFile = () => {
    if (disabled) return;

    const remainingCount = maxFilesLength - files.length;

    if (remainingCount <= 0) {
      alert(_l('最多上传%0个文件', maxFilesLength), 2);
      return;
    }

    compatibleMDJS('chooseImage', {
      sessionId: uploadSessionId,
      knowledge: false,
      count: allowMultiSelection ? remainingCount : 1,
      format: DEFAULT_APP_UPLOAD_FORMATS,
      success: res => {
        const { sessionId, completed = [], error, uploading } = res || {};

        if (sessionId) setUploadSessionId(sessionId);

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
  };

  if (window.isMingDaoApp) {
    return (
      <span className="InlineBlock" onClick={handleAppChooseFile}>
        {children}
      </span>
    );
  }

  return (
    <UploadFiles
      disabled={disabled}
      tokenType={tokenType}
      maxFilesLength={maxFilesLength}
      existingFiles={files}
      allowMimeTypes={allowMimeTypes}
      allowMultiSelection={allowMultiSelection}
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
