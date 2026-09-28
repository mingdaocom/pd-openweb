import React, { useEffect, useRef, useState } from 'react';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'ming-ui/antd-components';
import attachmentAjax from 'src/api/attachment';
import Signature from 'src/components/Signature';
import { browserIsMobile } from 'src/utils/platform/browser/device';

const SignatureWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 15px;
  .tip {
    font-size: 14px;
    color: var(--color-text-title);
    font-weight: bold;
    margin-bottom: 10px;
  }
`;

const Content = styled.div`
  flex: 1;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const SignatureComp = ({ disabled, scanId, scanInfo, onComplete = () => {} }) => {
  const signatureRef = useRef();
  const wrapRef = useRef();
  const uploadingRef = useRef(false);
  const mountedRef = useRef(true);
  const [isUploading, setIsUploading] = useState(false);
  const [started, setStarted] = useState(false);
  const [hideCanvas, setHideCanvas] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 阻止整个签名区域（含 padding）左滑触发 iOS 浏览器返回手势（仅 H5 环境）
  useEffect(() => {
    if (!browserIsMobile()) return;

    const el = wrapRef.current;
    if (!el) return;

    const blockSwipeBack = e => {
      if (e.target.closest('button, a, [role="button"]')) return;
      e.stopPropagation();
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    ['touchstart', 'touchmove', 'touchend'].forEach(eventName => {
      el.addEventListener(eventName, blockSwipeBack, { passive: false });
    });

    return () => {
      ['touchstart', 'touchmove', 'touchend'].forEach(eventName => {
        el.removeEventListener(eventName, blockSwipeBack);
      });
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setHideCanvas(true);
      setTimeout(() => {
        setHideCanvas(false);
      }, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <SignatureWrap ref={wrapRef}>
      <div className="tip">{_l('请在下方空白区域横向书写签名')}</div>
      <Content>
        {!hideCanvas && (
          <Signature
            ref={signatureRef}
            showButton={false}
            canvasStyle={
              isLandscape
                ? {
                    height: window.innerHeight - 32 - 24 - 36 - 31 - 10,
                  }
                : {}
            }
            onBegin={() => {
              setStarted(true);
            }}
          />
        )}
      </Content>
      <Footer>
        <Button
          className="flex"
          disabled={disabled || !started || isUploading}
          onClick={() => {
            signatureRef.current.clear();
            setStarted(false);
          }}
        >
          {_l('重写')}
        </Button>
        <Button
          type="primary"
          className="flex"
          loading={isUploading}
          disabled={disabled || !started}
          onClick={() => {
            signatureRef.current.saveSignature(
              ({ url }) => {
                if (uploadingRef.current) return;

                uploadingRef.current = true;
                setIsUploading(true);
                attachmentAjax
                  .addScanAttachments({
                    attachmentScanSimpleDetail: [
                      {
                        fileUrl: url,
                        fileName: 'Sign',
                      },
                    ],
                    scanId,
                    ...omit(scanInfo, ['control']),
                  })
                  .then(res => {
                    return res.excuteResult;
                  })
                  .finally(() => {
                    uploadingRef.current = false;
                    if (mountedRef.current) setIsUploading(false);
                  })
                  .then(isSuccess => {
                    if (!isSuccess) return;

                    onComplete();
                    alert(_l('上传成功'));
                  });
              },
              {
                getTokenFn: files => {
                  return attachmentAjax.getScanUploadToken({
                    files,
                    scanId,
                    ...omit(scanInfo, ['control']),
                  });
                },
              },
            );
          }}
        >
          {_l('确定')}
        </Button>
      </Footer>
    </SignatureWrap>
  );
};

export default SignatureComp;

SignatureComp.propTypes = {
  disabled: PropTypes.bool,
  scanId: PropTypes.string.isRequired,
  scanInfo: PropTypes.shape({}),
  onComplete: PropTypes.func,
};
