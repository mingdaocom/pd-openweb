import React, { forwardRef, Fragment, memo, useEffect, useImperativeHandle, useState } from 'react';
import cx from 'classnames';
import { VOICE_STEP } from '../../core/config';
import ConfirmAction from '../CompositeInput/ConfirmAction';
import { useVoice } from '../VoiceProvider';
import VoiceToText from '../VoiceToText';

const VoiceInput = forwardRef((props, ref) => {
  const { step, text, loading, onStart, onReset, onGenerateRecord } = useVoice();

  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
  }));

  useEffect(() => {
    if (!text || !visible) return;
    setValue(text);
  }, [text]);

  const manualChangeText = e => {
    setValue(e.target.value);
  };

  const handleSubmit = () => {
    const _value = value?.trim();
    if (!_value) return;
    onGenerateRecord({ text: _value });
    onReset();
    setValue('');
    setVisible(false);
  };

  const onCancel = () => {
    if (!value.trim()) {
      onReset();
      setVisible(false);
    } else {
      setConfirmVisible(true);
    }
  };

  const renderContent = () => {
    if (step === VOICE_STEP.INIT) return <div className="placeholder">{_l('点击下方按钮进行语音识别录入')}</div>;
    return (
      <div className="recordingContent">
        <textarea value={value} onChange={manualChangeText} />
      </div>
    );
  };

  const renderFooter = () => {
    switch (step) {
      case VOICE_STEP.INIT:
        return (
          <div className="basicBtnBox">
            <div
              className="basicBtn common flex"
              onClick={() => {
                onReset();
                setValue('');
                setVisible(false);
              }}
            >
              {_l('取消')}
            </div>
            <div className="basicBtn primary flex" onClick={onStart}>
              {_l('开始语音识别')}
            </div>
          </div>
        );

      case VOICE_STEP.COMPLETED:
        return (
          <div className="basicBtnBox">
            <div className="basicBtn common flex" onClick={onCancel}>
              {_l('取消')}
            </div>
            <div className={cx('basicBtn primary flex', { disabled: !value.trim() })} onClick={handleSubmit}>
              {_l('识别提交')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!visible || loading) return null;

  return (
    <div className="voiceInputWrapper toastWrapper">
      <div className="toastMask"></div>
      <div className="voiceInputContentBox inputContentBox">
        {step === VOICE_STEP.RECORDING ? (
          <VoiceToText />
        ) : (
          <Fragment>
            <div className="content">{renderContent()}</div>
            <div className="footer">{renderFooter()}</div>
          </Fragment>
        )}
      </div>
      <ConfirmAction
        visible={confirmVisible}
        content={_l('您有未提交的内容，确定要离开此页吗？')}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          onReset();
          setVisible(false);
          setValue('');
          setConfirmVisible(false);
        }}
      />
    </div>
  );
});

export default memo(VoiceInput);
