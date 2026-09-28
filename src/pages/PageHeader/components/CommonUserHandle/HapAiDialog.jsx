import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';
import { pathCompletion } from 'src/utils/platform/navigation/path';

const ModalWrap = styled(Modal)`
  position: fixed !important;
  bottom: 10px;
  right: 60px;
  height: 667px !important;
  z-index: 1000;
  border-radius: 12px !important;
  .mask {
    position: absolute;
    right: 0;
    top: 0;
    width: 45px;
    height: 45px;
    background-color: var(--color-background-secondary);
  }
  .hap-modal-close {
    top: 10px !important;
    margin-right: 6px;
    .Icon {
      color: var(--color-text-secondary) !important;
      &:hover {
        color: var(--color-primary) !important;
      }
    }
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
      const handleLoad = () => setIframeLoaded(true);
      iframe.addEventListener('load', handleLoad);
      return () => {
        iframe.src = '';

        iframe.removeEventListener('load', handleLoad);
      };
    }
  }, [visible]);

  return (
    <ModalWrap
      rootClassName="hapAiDialog"
      width={375}
      open={visible}
      onCancel={onCancel}
      footer={null}
      title={null}
      mask={{ closable: false }}
      keyboard
      styles={{ header: { display: 'none' }, body: { padding: 0, overflow: 'hidden' }, container: { padding: 0 } }}
    >
      {iframeLoaded && <div className="mask"></div>}
      {window.platformENV.isOverseas ? (
        <iframe
          ref={iframeRef}
          className="aiWrap"
          src="https://share.fastgpt.in/chat/share?shareId=gzldqge7rdzwiopvdnrzqx75"
        ></iframe>
      ) : (
        <iframe ref={iframeRef} className="aiWrap" src={pathCompletion('/hapai')}></iframe>
      )}
    </ModalWrap>
  );
}
