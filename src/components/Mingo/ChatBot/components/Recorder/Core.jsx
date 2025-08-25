import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef } from 'react';
import cx from 'classnames';
import { Tooltip } from 'ming-ui';
import useRecorder from './useRecorder';
import VolumeBar from './VolumeBar';

function secondToMMSS(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const AUTO_STOP_TIME = 60 * 1000;

const Core = forwardRef(
  ({ authConfig, updateStatus = () => {}, onStop = () => {}, updateRecognizedText = () => {} }, ref) => {
    const { status, recognizedText, volume, recordTime, start, stop } = useRecorder({
      onStop,
      authConfig,
    });
    const cache = useRef({});
    useEffect(() => {
      updateStatus(status);
    }, [status, updateStatus]);
    useEffect(() => {
      if (cache.current.autoStopTimer) {
        clearTimeout(cache.current.autoStopTimer);
      }
      if (cache.current.didMount) {
        return;
      }
      cache.current.didMount = true;
      start();
      cache.current.autoStopTimer = setTimeout(() => {
        stop();
      }, AUTO_STOP_TIME);
    }, []);
    useEffect(() => {
      updateRecognizedText(recognizedText);
    }, [recognizedText, updateRecognizedText]);
    useImperativeHandle(ref, () => ({
      start,
      stop,
    }));
    return (
      <Fragment>
        <Tooltip text={_l('结束语音输入')} popupPlacement="top" offset={[0, -3]}>
          <div className="recorderIcon t-flex t-content-center t-items-center" onClick={stop}>
            <i className="icon icon-microphone"></i>
          </div>
        </Tooltip>
        <div className="recorderStatus t-flex-1">
          <VolumeBar progress={status === 'recording' ? volume : 0} />
        </div>
        <div
          className={cx('recordTime', {
            warning: recordTime >= 30 && recordTime < 60,
            danger: recordTime >= 60,
          })}
        >
          {secondToMMSS(recordTime)}
        </div>
      </Fragment>
    );
  },
);

Core.displayName = 'RecorderCore';

export default Core;
