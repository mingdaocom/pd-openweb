import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import mingoAjax from 'src/api/mingo';
import Core from './Core';

const Con = styled.div`
  width: 100%;
`;

const RecorderContent = styled.div`
  height: 36px;
  border-radius: 36px;
  .recorderIcon {
    width: 36px;
    height: 36px;
    border-radius: 36px;
    color: #757575;
    font-size: 22px;
    cursor: pointer;
    &:hover {
      background: #f5f5f5;
    }
  }
  .recorderStatus {
    position: relative;
    overflow: hidden;
    width: 100%;
    padding: 0 10px;
  }
  .recordTime {
    font-size: 13px;
    color: #151515;
    margin: 0 15px 0 8px;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  .recorderClose {
    width: 28px;
    height: 28px;
    border-radius: 28px;
    font-size: 20px;
    color: #9e9e9e;
    cursor: pointer;
    margin-right: 6px;
    &:hover {
      background: #fff;
    }
  }
  .error {
    font-size: 13px;
    color: #151515;
    padding: 0 12px;
    .icon {
      font-size: 16px;
      color: #f44336;
      margin-right: 6px;
    }
  }
  &.error-status {
    background: #fff0ef;
  }
`;

function getRecorderAuthConfig() {
  const authConfig = localStorage.getItem('RECORDER_AUTH_CONFIG');
  if (authConfig) {
    const authConfigObj = safeParse(authConfig);
    if (authConfigObj.expiredTime > Date.now()) {
      return Promise.resolve(authConfigObj);
    } else {
      localStorage.removeItem('RECORDER_AUTH_CONFIG');
    }
  }
  return mingoAjax
    .getFederationToken()
    .then(data => {
      if (data.token) {
        const authConfig = {
          secretId: data.tmpSecretId,
          secretKey: data.tmpSecretKey,
          token: data.token,
          appId: data.appId,
          expiredTime: data.expiredTime * 1000,
        };
        localStorage.setItem('RECORDER_AUTH_CONFIG', JSON.stringify(authConfig));
        return authConfig;
      } else {
        if (data.code === 10004) {
          alert(_l('服务调用失败'), 2);
        }
        throw _l('发生错误，请稍后重试');
      }
    })
    .catch(() => {
      throw _l('发生错误，请稍后重试');
    });
}

const Recorder = forwardRef(({ onRecognize = () => {}, onStart = () => {}, onStop = () => {} }, ref) => {
  const [loading, setLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState({});
  const [status, setStatus] = useState('');
  const [error, setError] = useState();
  const [recognizedText, setRecognizedText] = useState('');
  const coreRef = useRef(null);
  useEffect(() => {
    onRecognize(recognizedText);
  }, [recognizedText, onRecognize]);
  useEffect(() => {
    if (status === 'recording') {
      onStart();
    } else if (status === 'error') {
      setError(_l('录音失败，请重试'));
    }
  }, [status, onStart]);
  useEffect(() => {
    if (!_.isEmpty(authConfig)) {
      return;
    }
    getRecorderAuthConfig()
      .then(data => {
        setAuthConfig(data);
        setLoading(false);
      })
      .catch(() => {
        setError(_l('发生错误，请稍后重试'));
        setLoading(false);
      });
  }, [authConfig]);
  useImperativeHandle(ref, () => ({
    start: (...args) => {
      coreRef.current?.start(...args);
    },
    stop: (...args) => {
      coreRef.current?.stop(...args);
    },
  }));
  return (
    <Con>
      <RecorderContent className={cx('t-flex t-flex-row t-items-center', { 'error-status': error })}>
        {!error && !loading && (
          <Core
            ref={coreRef}
            authConfig={authConfig}
            onStop={onStop}
            updateStatus={setStatus}
            updateRecognizedText={setRecognizedText}
          />
        )}
        {!error && loading && (
          <div className="recorderIcon t-flex t-content-center t-items-center">
            <i className="icon icon-microphone"></i>
          </div>
        )}
        {!!error && (
          <Fragment>
            <div className="error t-flex t-flex-row t-items-center t-flex-1">
              <i className="icon icon-error1"></i>
              {error}
            </div>
            <div className="recorderClose t-flex t-content-center t-items-center">
              <i className="icon icon-close" onClick={onStop}></i>
            </div>
          </Fragment>
        )}
      </RecorderContent>
    </Con>
  );
});

Recorder.displayName = 'Recorder';

export default Recorder;
