import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import useRecorder from './useRecorder';
import VolumeBar from './VolumeBar';

const isMobile = browserIsMobile();

function secondToMMSS(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const AUTO_STOP_TIME = 60 * 1000;
const MOBILE_VOLUME_SEGMENT_COUNT = 16;

const MobileVolumeBarWrap = styled.div`
  display: flex;
  width: 139px;
  height: 14px;
  align-items: center;
  gap: 5px;

  .volumeSegment {
    width: 4px;
    height: 14px;
    flex: none;
    border-radius: 4px;
    background: var(--color-text-secondary);

    &.active {
      background: var(--color-primary);
    }
  }
`;

function MobileVolumeBar({ progress }) {
  const activeCount = Math.round((Math.max(0, Math.min(100, progress)) / 100) * MOBILE_VOLUME_SEGMENT_COUNT);

  return (
    <MobileVolumeBarWrap>
      {Array.from({ length: MOBILE_VOLUME_SEGMENT_COUNT }, (_, index) => (
        <span key={index} className={cx('volumeSegment', { active: index < activeCount })} />
      ))}
    </MobileVolumeBarWrap>
  );
}

const Core = forwardRef(
  ({ authConfig, updateStatus = () => {}, onStop = () => {}, updateRecognizedText = () => {} }, ref) => {
    const { status, recognizedText, volume, recordTime, start, stop } = useRecorder({
      onStop,
      authConfig,
      onError: () => {
        alert(_l('暂不支持当前设备'), 3);
        onStop();
      },
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
    }, [start, stop]);
    useEffect(() => {
      updateRecognizedText(recognizedText);
    }, [recognizedText, updateRecognizedText]);
    useImperativeHandle(ref, () => ({
      start,
      stop,
    }));
    return (
      <Fragment>
        {isMobile ? (
          <div className="recorderIcon t-flex t-content-center t-items-center" onClick={stop}>
            <i className="icon icon-close"></i>
          </div>
        ) : (
          <Tooltip title={_l('结束语音输入')} placement="top" align={{ offset: [0, -3] }}>
            <div className="recorderIcon t-flex t-content-center t-items-center" onClick={stop}>
              <i className="icon icon-close"></i>
            </div>
          </Tooltip>
        )}
        <div className="recorderStatus t-flex-1">
          {isMobile ? (
            <MobileVolumeBar progress={status === 'recording' ? volume : 0} />
          ) : (
            <VolumeBar progress={status === 'recording' ? volume : 0} />
          )}
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
