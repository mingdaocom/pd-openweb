import { useCallback, useEffect, useRef, useState } from 'react';
import init from './lib.js';

init();

// 语音识别参数配置
const asrParams = {
  engine_model_type: '16k_zh', // 引擎模型类型，16k_zh为16k中文普通话通用
  voice_format: 1, // 语音格式，1表示pcm
  hotword_id: '08003a00000000000000000000000000', // 热词id
  needvad: 1, // 是否需要vad，1为需要
  filter_dirty: 1, // 是否过滤脏词
  filter_modal: 1, // 是否过滤语气词
  filter_punc: 1, // 是否过滤标点符号
  convert_num_mode: 1, // 数字转换模式
  word_info: 2, // 词信息
};

/**
 * useRecorder
 * 管理录音与识别生命周期，暴露状态与操作
 */
export default function useRecorder({ authConfig, onStop = () => {}, onError = () => {} }) {
  const [status, setStatus] = useState('ready'); // ready, connecting, recording, error
  const [recognizedText, setRecognizedText] = useState('');
  const [mediaStream, setMediaStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [volume, setVolume] = useState(0); // 音量百分比 0-100
  const [recordTime, setRecordTime] = useState(0); // 录音时间（秒）

  const recorderRef = useRef(null);
  const speechRecognizerRef = useRef(null);
  const isCanSendDataRef = useRef(false);
  const isCanStopRef = useRef(false);
  const resultTextRef = useRef('');
  const analyserRef = useRef(null);
  const volumeCheckIntervalRef = useRef(null);
  const recordTimeIntervalRef = useRef(null);
  const recordStartTimeRef = useRef(null);
  const cache = useRef({});

  const isDebug = false;

  const params = {
    secretid: authConfig.secretId,
    secretkey: authConfig.secretKey,
    token: authConfig.token,
    appid: authConfig.appId,
    // secretid: config.secretId,
    // appid: config.appId,
    // signCallback,
    ...asrParams,
  };

  // 音量检测函数
  const checkVolume = useCallback(() => {
    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // 计算平均音量
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      // 转换为百分比 (0-100)，并进行一些调整使其更敏感
      const volumePercent = Math.min(100, (average / 128) * 100 * 1.5);
      setVolume(Math.round(volumePercent));
    }
  }, []);

  // 开始音量检测
  const startVolumeCheck = useCallback(() => {
    if (volumeCheckIntervalRef.current) {
      clearInterval(volumeCheckIntervalRef.current);
    }
    volumeCheckIntervalRef.current = setInterval(checkVolume, 100); // 每100ms检测一次
  }, [checkVolume]);

  // 停止音量检测
  const stopVolumeCheck = useCallback(() => {
    if (volumeCheckIntervalRef.current) {
      clearInterval(volumeCheckIntervalRef.current);
      volumeCheckIntervalRef.current = null;
    }
    setVolume(0);
  }, []);

  // 开始录音时间计时
  const startRecordTime = useCallback(() => {
    recordStartTimeRef.current = Date.now();
    setRecordTime(0);

    if (recordTimeIntervalRef.current) {
      clearInterval(recordTimeIntervalRef.current);
    }

    recordTimeIntervalRef.current = setInterval(() => {
      if (recordStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - recordStartTimeRef.current) / 1000);
        setRecordTime(elapsed);
      }
    }, 1000); // 每秒更新一次
  }, []);

  // 停止录音时间计时
  const stopRecordTime = useCallback(() => {
    if (recordTimeIntervalRef.current) {
      clearInterval(recordTimeIntervalRef.current);
      recordTimeIntervalRef.current = null;
    }
    recordStartTimeRef.current = null;
  }, []);

  // 停止识别和录音
  const stop = useCallback(
    ({ sendAfterStop } = {}) => {
      cache.current = { sendAfterStop };
      setStatus('ready');

      // 停止音量检测和时间计时
      stopVolumeCheck();
      stopRecordTime();

      // 停止录音器
      if (recorderRef.current) {
        recorderRef.current.stop();
        // 调用WebRecorder的destroyStream方法释放流
        if (recorderRef.current.destroyStream) {
          recorderRef.current.destroyStream();
        }
      }

      // 停止语音识别
      if (isCanStopRef.current && speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }

      // 释放媒体流 - 使用函数式更新避免依赖
      setMediaStream(currentStream => {
        if (currentStream) {
          currentStream.getTracks().forEach(track => {
            track.stop();
            if (isDebug) console.log('麦克风轨道已停止:', track.label, track.readyState);
          });
        }
        return null;
      });

      // 关闭音频上下文 - 使用函数式更新避免依赖
      setAudioContext(currentContext => {
        if (currentContext && currentContext.state !== 'closed') {
          currentContext
            .close()
            .then(() => {
              if (isDebug) console.log('音频上下文已关闭');
            })
            .catch(err => {
              console.error('关闭音频上下文失败:', err);
            })
            .finally(() => {
              // onStop();
            });
        }
        return null;
      });

      // 重置状态
      isCanSendDataRef.current = false;
      isCanStopRef.current = false;

      // 清理引用
      speechRecognizerRef.current = null;
      recorderRef.current = null;
      analyserRef.current = null;

      // 重置录音时间
      setRecordTime(0);
    },
    [stopVolumeCheck, stopRecordTime],
  );

  // 开始识别和录音
  const start = useCallback(async () => {
    try {
      if (!window.WebRecorder || !window.SpeechRecognizer) {
        alert('请确保已加载腾讯云语音识别SDK');
        return;
      }
      setStatus('connecting');
      setRecognizedText('');
      setRecordTime(0); // 重置录音时间
      resultTextRef.current = '';
      speechRecognizerRef.current = null;
      isCanSendDataRef.current = false;

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(audioCtx);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        setMediaStream(stream);

        // 创建音量分析器
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        // 连接音频流到分析器
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        recorderRef.current = new window.WebRecorder();
        recorderRef.current.OnReceivedData = res => {
          if (isCanSendDataRef.current && speechRecognizerRef.current) {
            speechRecognizerRef.current.write(res);
          }
        };
        recorderRef.current.OnError = err => {
          console.error('OnError:', err);
          onError(err);
          stop();
        };
        recorderRef.current.start();

        if (!speechRecognizerRef.current) {
          speechRecognizerRef.current = new window.SpeechRecognizer(params);
        }
        speechRecognizerRef.current.OnRecognitionStart = () => {
          isCanSendDataRef.current = true;
          isCanStopRef.current = true;
          setStatus('recording');
          startVolumeCheck(); // 开始音量检测
          startRecordTime(); // 开始录音时间计时
        };
        speechRecognizerRef.current.OnSentenceBegin = res => {
          if (isDebug) console.log('OnSentenceBegin:', res);
        };
        speechRecognizerRef.current.OnRecognitionResultChange = res => {
          if (isDebug) console.log('OnRecognitionResultChange', res);
          const currentText = `${resultTextRef.current}${res.result.voice_text_str}`;
          setRecognizedText(currentText);
        };
        speechRecognizerRef.current.OnSentenceEnd = res => {
          if (isDebug) console.log('OnSentenceEnd:', res);
          resultTextRef.current += res.result.voice_text_str;
          setRecognizedText(resultTextRef.current);
        };
        speechRecognizerRef.current.OnRecognitionComplete = res => {
          if (isDebug) console.log('OnRecognitionComplete:', res);
          onStop(cache.current);
          cache.current = {};
        };
        speechRecognizerRef.current.OnError = () => {
          setStatus('error');
          stop();
        };
        speechRecognizerRef.current.start();
      } catch (error) {
        console.log(error);
        alert(_l('开启麦克风权限失败，权限设置了不允许或您的设备不支持该功能'), 3);
        setStatus('error');
      }
    } catch (err) {
      console.error('OnError:', err);
      onError(err);
    }
  }, []);
  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      // 强制停止所有录音相关资源
      stop();
    };
  }, [stop]);

  return {
    status,
    recognizedText,
    mediaStream,
    audioContext,
    volume, // 暴露音量数据
    recordTime, // 暴露录音时间
    start,
    stop,
    setRecognizedText,
  };
}
