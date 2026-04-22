import React, { forwardRef, Fragment, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { compatibleMDJS } from 'src/utils/project';
import { COMPOSITE_INPUT_TYPE, VOICE_STEP } from '../../core/config';
import UploadFiles from '../UploadFiles';
import { useVoice } from '../VoiceProvider';
import VoiceToText from '../VoiceToText';
import ConfirmAction from './ConfirmAction';
import ImageCard from './ImageCard';

const Content = styled.div`
  .attachmentBox {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    overflow-x: auto;
    &::-webkit-scrollbar {
      display: none;
      scrollbar-width: none;
    }
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .operationBox {
    display: flex;
    align-items: center;
    gap: 10px;
    .iconBox {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 20px;
      color: var(--color-text-secondary);
      background-color: var(--color-background-secondary);
    }
  }
  .basicBtn {
    width: 100px;
  }
`;

const CompositeInput = forwardRef((props, ref) => {
  const { step, text, loading, error, onStart, onReset, onGenerateRecord } = useVoice();

  const uploadFileRef = useRef(null);
  const attachmentBoxRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState('');
  const [existingFiles, setExistingFiles] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [uploadSessionId, setUploadSessionId] = useState('');

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
  }));

  useEffect(() => {
    if (!text || !visible) return;
    setValue(prev => `${prev}${text}`);
  }, [text]);

  const setFiles = files => {
    setExistingFiles(prev => [...prev, ...files]);
  };

  const onUploadProgress = (up, file) => {
    const progress = ((file.loaded / file.size) * 100).toFixed(0);
    setExistingFiles(oldFiles => [
      ...oldFiles.map(f => (f.id === file.id ? { ...f, status: 'uploading', file, progress } : f)),
    ]);
  };

  const onUploaded = (up, file) => {
    setExistingFiles(oldFiles => [
      ...oldFiles.map(f => (f.id === file.id ? { ...f, status: 'uploaded', file, url: file.url } : f)),
    ]);
  };

  const removeFile = ({ id }) => {
    setExistingFiles(existingFiles.filter(f => f.id !== id));
    if (!window.isMingDaoApp) {
      uploadFileRef.current?.uploader?.uploader?.removeFile({ id });
    }
  };

  const manualChangeText = e => {
    setValue(e.target.value);
  };

  const isEmpty = () => {
    return !value.trim() && !existingFiles.length;
  };

  const handleSubmit = () => {
    if (isEmpty()) return;

    const hasUploading = attachmentBoxRef.current?.querySelector('.uploadingProgress') !== null;
    if (hasUploading) {
      alert(_l('附件正在上传，请稍后'), 3);
      return;
    }
    onGenerateRecord({ text: value, filesList: existingFiles });
    onReset();
    setVisible(false);
    setExistingFiles([]);
    setValue('');
  };

  const onCancel = () => {
    if (isEmpty()) {
      onReset();
      setVisible(false);
    } else {
      setConfirmVisible(true);
    }
  };

  const onMingDaoAppChooseImage = () => {
    const count = 5 - existingFiles.length;
    compatibleMDJS('chooseImage', {
      sessionId: uploadSessionId,
      count,
      mediaType: 'image',
      format: ['jpg', 'jpeg', 'png'],
      knowledge: false,
      success: res => {
        const { sessionId, completed, error, uploading } = res;
        setUploadSessionId(sessionId);
        if (completed?.length) {
          setExistingFiles(prev => [...prev, ...completed.map(item => ({ ...item, id: item.fileID }))]);
        }

        if (!uploading && error) {
          alert(_l('上传失败'), 2);
        }
      },
      cancel: () => {},
    });
  };

  if (!visible || loading) return null;

  return (
    <div className="compositeInputWrapper toastWrapper">
      <div className="toastMask"></div>
      <div className="compositeInputContentBox inputContentBox">
        <ConfirmAction
          visible={confirmVisible}
          content={_l('您有未提交的内容，确定要离开此页吗？')}
          onCancel={() => setConfirmVisible(false)}
          onConfirm={() => {
            onReset();
            setVisible(false);
            setExistingFiles([]);
            setValue('');
            setConfirmVisible(false);
          }}
        />
        {step === VOICE_STEP.RECORDING ? (
          <VoiceToText from={COMPOSITE_INPUT_TYPE.COMPOSITE} lastText={value} />
        ) : (
          <Fragment>
            <Content className="content">
              {existingFiles.length > 0 && (
                <div ref={attachmentBoxRef} className="attachmentBox">
                  {existingFiles.map(file => (
                    <ImageCard key={file.id} data={file} removeFile={removeFile} />
                  ))}
                </div>
              )}
              <div className="recordingContent">
                <textarea placeholder={_l('简单描述你希望识别的内容')} value={value} onChange={manualChangeText} />
              </div>
            </Content>
            <Footer className="footer">
              <div className="operationBox">
                <div className="iconBox">
                  {window.isMingDaoApp ? (
                    <Icon icon="attachment" onClick={onMingDaoAppChooseImage} />
                  ) : (
                    <UploadFiles
                      ref={uploadFileRef}
                      setFiles={setFiles}
                      existingFiles={existingFiles}
                      onUploadProgress={onUploadProgress}
                      onUploaded={onUploaded}
                      removeFile={file => setFiles(oldFiles => oldFiles.filter(f => f.id !== file.id))}
                    >
                      <Icon icon="attachment" />
                    </UploadFiles>
                  )}
                </div>
                {!error && !!get(md, 'global.Account.accountId') && md.global.SysSettings.enableVoiceToText && (
                  <div className="iconBox" onClick={onStart}>
                    <Icon icon="microphone" />
                  </div>
                )}
              </div>
              <div className="basicBtnBox">
                <div className="basicBtn common" onClick={onCancel}>
                  {_l('取消')}
                </div>
                <div className={cx('basicBtn primary', { disabled: isEmpty() })} onClick={handleSubmit}>
                  {_l('识别')}
                </div>
              </div>
            </Footer>
          </Fragment>
        )}
      </div>
    </div>
  );
});

export default memo(CompositeInput);
