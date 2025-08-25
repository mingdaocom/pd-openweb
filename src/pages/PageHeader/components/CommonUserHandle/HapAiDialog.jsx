import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';

const DialogWrap = styled(Dialog)`
  position: fixed !important;
  bottom: 10px;
  right: 60px;
  height: 667px !important;
  z-index: 1000;
  border-radius: 12px !important;
  .mui-dialog-header {
    display: none !important;
  }
  .mask {
    position: absolute;
    right: 0;
    top: 0;
    width: 45px;
    height: 45px;
    background-color: #fbfbfc;
  }
  .mui-dialog-close-btn {
    top: 10px !important;
    margin-right: 6px;
    .Icon {
      color: #757575 !important;
      &:hover {
        color: #1677ff !important;
      }
    }
  }
  .mui-dialog-body {
    padding: 0 !important;
    overflow: hidden !important;
    /* background-color: #fbfbfc !important; */
  }
  .aiWrap {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export default function HapAiDialog({ visible, onCancel = () => {} }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', () => setIframeLoaded(true));
      return () => {
        if (iframeRef.current) {
          iframeRef.current.src = '';
        }
        iframe.removeEventListener('load', () => setIframeLoaded(false));
      };
    }
  }, [visible]);

  return (
    <DialogWrap
      dialogClasses="hapAiDialog"
      width={375}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      title=""
      overlayClosable={false}
    >
      {iframeLoaded && <div className="mask"></div>}
      <iframe ref={iframeRef} className="aiWrap" src={`${md.global.Config.WebUrl}hapai`}></iframe>
    </DialogWrap>
  );
}
