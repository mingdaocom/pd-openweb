import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import chatbotApi from 'src/pages/workflow/apiV2/chatbot';
import { compatibleMDJS } from 'src/utils/project';
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
    color: var(--color-mingo);
  }
  &.useAppThemeColor {
    .icon {
      color: var(--app-primary-color, var(--color-mingo));
    }
  }
`;

const AppUploadWrap = styled.div`
  display: inline-block;
  padding: 1px 6px;
  font-size: 20px;
  color: var(--color-text-secondary);
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
    uploadPermission,
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
  const cache = useRef({});
  const [uploadSessionId, setUploadSessionId] = useState('');
  useImperativeHandle(ref, () => ({
    uploader: uploadFileRef.current?.uploader,
  }));
  useEffect(() => {
    cache.current.chatbotId = chatbotId;
  }, [chatbotId]);

  const onMingDaoAppChooseImage = () => {
    compatibleMDJS('chooseImage', {
      sessionId: uploadSessionId,
      knowledge: false,
      count: allowMultiSelection ? (maxFileLength > 1 ? maxFileLength : undefined) : 1,
      mediaType: uploadPermission === '01' ? 'document' : uploadPermission === 10 ? 'image' : undefined,
      format:
        uploadPermission === '01'
          ? ['pdf', 'doc', 'docx', 'xls', 'xlsx']
          : uploadPermission === 10
            ? ['jpg', 'jpeg', 'png']
            : ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      success: res => {
        const { sessionId, completed, error, uploading } = res;
        setUploadSessionId(sessionId);
        if (completed?.length) {
          completed.forEach(file => {
            file.id = file.fileID;
            file.name = file.originalFileName;
            file.type = ['.jpg', '.jpeg', '.png'].includes(file.fileExt) ? 'image' : file.type;
            const commonAttachment = formatResponseData(file, file);
            onUpdateFiles(oldFiles =>
              [
                ...oldFiles,
                ...[file].map(f =>
                  f.id === file.id
                    ? { ...f, status: needOcr ? 'ocr' : 'uploaded', file, commonAttachment, url: file.url }
                    : f,
                ),
              ].filter(f => f.id !== sessionId),
            );
            if (needOcr) {
              chatbotApi
                .ocr({
                  chatbotId,
                  media: JSON.stringify([commonAttachment]),
                })
                .then(([ocrId]) => {
                  onUpdateFiles(oldFiles => [
                    ...oldFiles
                      .filter(f => f.id !== sessionId)
                      .map(f => (f.id === file.id ? { ...f, status: 'uploaded', ocrId } : f)),
                  ]);
                })
                .catch(() => {
                  onUpdateFiles(oldFiles => [
                    ...oldFiles
                      .filter(f => f.id !== sessionId)
                      .map(f => (f.id === file.id ? { ...f, status: 'error', errorText: _l('解析失败') } : f)),
                  ]);
                });
            }
          });
        } else {
          onUpdateFiles(oldFiles => [
            ...oldFiles.filter(f => f.id !== sessionId),
            ...[{ id: sessionId, status: 'added' }],
          ]);
        }

        if (!uploading && error) {
          alert(_l('上传失败'), 2);
        }
      },
      cancel: () => {},
    });
  };

  return (
    <Con className="t-flex t-flex-row t-items-center t-space-between">
      <div className="t-flex-1">
        {window.isMingDaoApp && !isRecording && allowUpload && (
          <AppUploadWrap>
            <i className="icon icon-attachment" onClick={onMingDaoAppChooseImage} />
          </AppUploadWrap>
        )}
        {!window.isMingDaoApp && !isRecording && allowUpload && (
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
                    chatbotId: cache.current.chatbotId,
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
              backgroundColor: useAppThemeColor ? 'var(--app-primary-color, var(--color-mingo))' : 'var(--color-mingo)',
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
