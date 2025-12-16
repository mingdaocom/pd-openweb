import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import chatbotApi from 'src/pages/workflow/apiV2/chatbot';
import Recorder from './Recorder';
import UploadFiles from './UploadFiles';

const Con = styled.div`
  height: 48px;
  padding: 0 8px;
  > div {
    gap: 12px;
  }
  .sendButton.disabled {
    opacity: 0.3;
  }
`;

const AbortButton = styled.div`
  cursor: pointer;
  .icon {
    font-size: 32px;
    color: var(--ai-primary-color);
  }
  &.useAppThemeColor {
    .icon {
      color: var(--app-primary-color, var(--ai-primary-color));
    }
  }
`;

function SendButtons(
  {
    disabled,
    maxFileLength = 5,
    isRecording,
    sendDisabled,
    loading,
    chatbotId,
    needOcr,
    useAppThemeColor,
    tokenType,
    dropFileElementId,
    allowMultiSelection = true,
    allowMimeTypes,
    existingFiles = [],
    onUpdateFiles = () => {},
    abortRequest = () => {},
    onBeginRecord = () => {},
    onSend = () => {},
    focusSendTextArea = () => {},
    onRecognize = () => {},
    onStop = () => {},
    setAutoPlay = () => {},
    rightButtons = null,
    allowUpload = false,
    uploadFileToolTip,
  },
  ref,
) {
  const recorderRef = useRef(null);
  const uploadFileRef = useRef(null);
  useImperativeHandle(ref, () => ({
    uploader: uploadFileRef.current?.uploader,
  }));
  return (
    <Con className="t-flex t-flex-row t-items-center t-space-between">
      <div className="t-flex-1">
        {!isRecording && allowUpload && (
          <UploadFiles
            disabled={disabled}
            ref={uploadFileRef}
            maxFileLength={maxFileLength}
            tokenType={tokenType}
            existingFiles={existingFiles}
            allowMimeTypes={allowMimeTypes}
            allowMultiSelection={allowMultiSelection}
            dropElementId={dropFileElementId}
            onAdd={(uploader, files) => {
              focusSendTextArea();
              onUpdateFiles(oldFiles => [
                ...oldFiles,
                ...files.map(f => ({
                  id: f.id,
                  size: f.size,
                  type: f.type,
                  name: f.name,
                  status: 'added',
                  file: f,
                })),
              ]);
            }}
            onUploadProgress={(uploader, file) => {
              const progress = ((file.loaded / file.size) * 100).toFixed(0);
              onUpdateFiles(oldFiles => [
                ...oldFiles.map(f => (f.id === file.id ? { ...f, status: 'uploading', file, progress } : f)),
              ]);
            }}
            onUploaded={(uploader, file, response) => {
              const commonAttachment = formatResponseData(file, response);
              onUpdateFiles(oldFiles => [
                ...oldFiles.map(f =>
                  f.id === file.id
                    ? { ...f, status: needOcr ? 'ocr' : 'uploaded', file, commonAttachment, url: file.url }
                    : f,
                ),
              ]);
              if (needOcr) {
                chatbotApi
                  .ocr({
                    chatbotId,
                    media: JSON.stringify([commonAttachment]),
                  })
                  .then(([ocrId]) => {
                    onUpdateFiles(oldFiles => [
                      ...oldFiles.map(f => (f.id === file.id ? { ...f, status: 'uploaded', ocrId } : f)),
                    ]);
                  })
                  .catch(() => {
                    onUpdateFiles(oldFiles => [
                      ...oldFiles.map(f =>
                        f.id === file.id ? { ...f, status: 'error', errorText: _l('解析失败') } : f,
                      ),
                    ]);
                  });
              }
            }}
            onError={file => {
              onUpdateFiles(oldFiles => [...oldFiles.map(f => (f.id === file?.id ? { ...f, status: 'error' } : f))]);
            }}
            removeFile={file => {
              onUpdateFiles(oldFiles => oldFiles.filter(f => f.id !== file.id));
            }}
          >
            <BgIconButton
              disabled={disabled}
              style={{ borderRadius: '8px', padding: '6px' }}
              icon="attachment"
              tooltip={uploadFileToolTip || _l('仅支持上传图片，一次消息最多上传 %0 个附件', maxFileLength)}
              popupPlacement="top"
              onClick={() => {}}
            />
          </UploadFiles>
        )}
        {isRecording && <Recorder ref={recorderRef} onRecognize={onRecognize} onStop={onStop} />}
      </div>
      <div className="b-right t-flex t-items-center">
        {rightButtons}
        {!isRecording && !!get(md, 'global.Account.accountId') && md.global.SysSettings.enableVoiceToText && (
          <div className="b-left t-flex t-items-center">
            {/* <BgIconButton icon="icon-ic_attachment_black" /> */}
            <BgIconButton
              disabled={disabled}
              style={{ borderRadius: '8px', padding: '6px' }}
              icon="microphone"
              tooltip={_l('语音输入')}
              popupPlacement="top"
              onClick={onBeginRecord}
            />
          </div>
        )}
        {loading ? (
          <Tooltip title={_l('停止')} placement="top">
            <AbortButton
              className={cx({ useAppThemeColor })}
              onClick={() => {
                abortRequest();
                focusSendTextArea();
              }}
            >
              <i className="icon icon-pause"></i>
            </AbortButton>
          </Tooltip>
        ) : (
          <BgIconButton
            className="sendButton"
            disabled={sendDisabled || disabled}
            style={{
              backgroundColor: useAppThemeColor
                ? 'var(--app-primary-color, var(--ai-primary-color))'
                : 'var(--ai-primary-color)',
              borderRadius: '8px',
              padding: '6px',
            }}
            iconStyle={{ color: 'white' }}
            icon="send"
            tooltip={_l('发送(↵)')}
            onClick={() => {
              if (sendDisabled) return;
              if (isRecording) {
                recorderRef.current?.stop({ sendAfterStop: true });
                setAutoPlay(true);
                return;
              }
              onSend();
            }}
          />
        )}
      </div>
    </Con>
  );
}

SendButtons.propTypes = {
  isRecording: PropTypes.bool,
  sendDisabled: PropTypes.bool,
  loading: PropTypes.bool,
  abortRequest: PropTypes.func,
  onBeginRecord: PropTypes.func,
  onSend: PropTypes.func,
  focusSendTextArea: PropTypes.func,
  uploadFileToolTip: PropTypes.string,
};

export default forwardRef(SendButtons);
