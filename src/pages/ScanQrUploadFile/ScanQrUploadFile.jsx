import React, { useCallback, useEffect, useRef, useState } from 'react';
import { get, isUndefined } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import attachmentAjax from 'src/api/attachment';
import { UPLOAD_TYPE } from 'worksheet/constants/enum';
import Attachments from './Attachments';
import Signature from './Signature';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  &.center {
    align-items: center;
    justify-content: center;
  }
  .errorIcon {
    color: #d2d2d2;
    font-size: 130px;
  }
  .successIcon {
    color: #4caf50;
    font-size: 100px;
    margin-bottom: 10px;
  }
  .error {
    font-size: 14px;
    color: #9e9e9e;
  }
`;

const StatusBar = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e8f5e9;
  color: #333;
  flex-shrink: 0;
  .icon {
    font-size: 16px;
    color: #4caf50;
    margin-right: 6px;
  }
  &.offline {
    color: #fff;
    background-color: #bdbdbd;
    .icon {
      color: #fff;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
`;

const STATUS = {
  ONLINE: 1,
  OFFLINE: 2,
  EXPIRED: 3,
  ERROR: 99,
  SUCCESS: 100,
};

const scanId = (location.pathname.match(/(\w{16})$/) || '')[0];

const UPDATE_STATUS_INTERVAL = 1000;

const ScanQrUploadFile = () => {
  const cache = useRef({});
  const [status, setStatus] = useState(STATUS.ONLINE);
  const [type, setType] = useState(UPLOAD_TYPE.SIGNATURE);
  const [loading, setLoading] = useState(true);
  const [scanInfo, setScanInfo] = useState({});
  const [defaultAttachments, setDefaultAttachments] = useState([]);
  const checkStatus = useCallback(() => {
    attachmentAjax.getScanAttachments({ scanId }).then(res => {
      setStatus(res.status === 1 ? STATUS.ONLINE : STATUS.OFFLINE);
      if (res.status !== 1) {
        clearInterval(cache.current.timer);
      }
    });
  }, [scanId]);
  useEffect(() => {
    if (!scanId) {
      return;
    }
    attachmentAjax
      .getScanAttachmentInfo({
        scanId,
      })
      .then(res => {
        if (isUndefined(res.fileType)) {
          setStatus(STATUS.ERROR);
          return;
        }
        const controlName = get(res, 'control.controlName');
        if (res.fileType === UPLOAD_TYPE.ATTACHMENT) {
          document.title = _l('%0扫码上传', controlName ? `${controlName} ` : '');
        } else {
          document.title = _l('%0扫码签名', controlName ? `${controlName} ` : '');
        }
        if (res.status !== STATUS.ONLINE) {
          setStatus(STATUS.EXPIRED);
          setLoading(false);
          return;
        }
        setType(res.fileType);
        setLoading(false);
        setScanInfo({
          ...res,
          controlId: get(res, 'control.controlId'),
        });
        cache.current.timer = setInterval(checkStatus, UPDATE_STATUS_INTERVAL);
      });
    return () => {
      clearInterval(cache.current.timer);
    };
  }, [scanId]);
  if (!scanId || status === STATUS.ERROR || status === STATUS.EXPIRED) {
    return (
      <Con className="center">
        <i className="errorIcon icon-network_disconnection"></i>
        <div className="error">{_l('此二维码已失效，请重新点击扫码上传')}</div>
      </Con>
    );
  }
  if (status === STATUS.SUCCESS) {
    return (
      <Con className="center">
        <i className="successIcon icon-plus-interest"></i>
        <div className="error">{_l('签名已经上传成功')}</div>
      </Con>
    );
  }
  if (loading) {
    return (
      <Con className="center">
        <LoadDiv size="middle" />
      </Con>
    );
  }
  return (
    <Con>
      <StatusBar className={status === STATUS.OFFLINE ? 'offline' : ''}>
        <i className={`icon icon-${status === STATUS.OFFLINE ? 'network_disconnection' : 'Finish'}`}></i>
        <span>{status === STATUS.OFFLINE ? _l('已断开') : _l('已连接')}</span>
      </StatusBar>
      <Content>
        {type === UPLOAD_TYPE.ATTACHMENT && (
          <Attachments
            scanId={scanId}
            scanInfo={scanInfo}
            defaultAttachments={defaultAttachments}
            disabled={status === STATUS.OFFLINE}
          />
        )}
        {type === UPLOAD_TYPE.SIGNATURE && (
          <Signature
            scanId={scanId}
            scanInfo={scanInfo}
            disabled={status === STATUS.OFFLINE}
            onComplete={() => {
              setStatus(STATUS.SUCCESS);
              clearInterval(cache.current.timer);
            }}
          />
        )}
      </Content>
    </Con>
  );
};

export default ScanQrUploadFile;
