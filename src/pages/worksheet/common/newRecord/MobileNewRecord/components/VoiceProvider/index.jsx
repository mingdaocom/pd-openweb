import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { get } from 'lodash';
import { getRecorderAuthConfig } from 'src/components/Mingo/ChatBot/components/Recorder/index';
import { VOICE_STEP } from '../../core/config';

const VoiceContext = createContext();

const VoiceProvider = ({ children, onGenerateRecord, onAbort }) => {
  const [step, setStep] = useState(VOICE_STEP.INIT);
  const [text, setText] = useState('');
  const [authConfig, setAuthConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(null);
  const onAbortRef = useRef(onAbort);

  useEffect(() => {
    onAbortRef.current = onAbort;
  }, [onAbort]);

  useEffect(() => {
    return () => {
      requestRef.current = null;
      onAbortRef.current?.();
    };
  }, []);

  const onStart = async () => {
    // 没有开启语音转文字
    if (!get(md, 'global.Account.accountId') || !md.global.SysSettings.enableVoiceToText) return;
    if (requestRef.current) return;

    const request = {};
    requestRef.current = request;
    setLoading(true);
    setError('');
    try {
      // 实际开始录音时才获取凭证，由公共 helper 复用有效缓存并刷新过期凭证。
      const data = await getRecorderAuthConfig();
      if (requestRef.current !== request) return;
      setAuthConfig(data);
      setStep(VOICE_STEP.RECORDING);
    } catch {
      if (requestRef.current !== request) return;
      const message = _l('发生错误，请稍后重试');
      setError(message);
      alert(message, 2);
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };

  const onComplete = recognizedText => {
    setText(recognizedText);
    setStep(VOICE_STEP.COMPLETED);
  };

  const onReset = () => {
    requestRef.current = null;
    setLoading(false);
    setError('');
    setText('');
    setStep(VOICE_STEP.INIT);
  };

  const onRestart = () => {
    setText('');
    return onStart();
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
