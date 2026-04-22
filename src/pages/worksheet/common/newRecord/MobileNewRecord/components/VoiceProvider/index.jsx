import React, { createContext, useContext, useEffect, useState } from 'react';
import { get } from 'lodash';
import { getRecorderAuthConfig } from 'src/components/Mingo/ChatBot/components/Recorder/index';
import { VOICE_STEP } from '../../core/config';

const VoiceContext = createContext();

const VoiceProvider = ({ children, onGenerateRecord, onAbort }) => {
  const [step, setStep] = useState(VOICE_STEP.INIT);
  const [text, setText] = useState('');
  const [authConfig, setAuthConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 没有开启语音转文字
    if (!get(md, 'global.Account.accountId') || !md.global.SysSettings.enableVoiceToText) {
      setLoading(false);
      return;
    }

    getRecorderAuthConfig()
      .then(data => setAuthConfig(data))
      .catch(() => setError(_l('发生错误，请稍后重试')))
      .finally(() => setLoading(false));

    return () => onAbort();
  }, []);

  const onStart = () => setStep(VOICE_STEP.RECORDING);

  const onComplete = recognizedText => {
    setText(recognizedText);
    setStep(VOICE_STEP.COMPLETED);
  };

  const onReset = () => {
    setText('');
    setStep(VOICE_STEP.INIT);
  };

  const onRestart = () => {
    setText('');
    setStep(VOICE_STEP.RECORDING);
  };

  return (
    <VoiceContext.Provider
      value={{
        step,
        text,
        authConfig,
        loading,
        error,
        onStart,
        onComplete,
        onReset,
        onRestart,
        onGenerateRecord,
        onAbort,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export default VoiceProvider;

export const useVoice = () => useContext(VoiceContext);
