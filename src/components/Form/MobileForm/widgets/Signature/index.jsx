import React, { Fragment, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Popup } from 'antd-mobile';
import axios from 'axios';
import _ from 'lodash';
import * as SignaturePad from 'signature_pad/dist/signature_pad';
import styled from 'styled-components';
import { Button, Icon } from 'ming-ui';
import accountSettingAjax from 'src/api/accountSetting';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { getToken } from 'src/utils/common';
import { compatibleMDJS } from 'src/utils/project';
import 'rc-trigger/assets/index.css';

const Footer = styled.div`
  display: flex;
  justify-content: ${props => (props.canUseLast ? 'space-between;' : 'flex-end;')};
  align-items: center;
  padding: 11px 20px;
  border-top: 1px solid var(--color-border-primary);

  .clearSignature {
    margin-right: 20px;
    color: var(--color-text-tertiary);
    cursor: pointer;
  }
  .lastSignature {
    color: var(--color-primary);
  }
`;

const SignaturePopup = styled(Popup)`
  &.mobileSignatureModal {
    .adm-popup-body-position-bottom {
      width: 100vw;
      max-width: 100vw;
    }
    .signatureHeader {
      flex-shrink: 0;
    }
    .signatureCanvasWrap {
      width: 100%;
      overflow: hidden;
      touch-action: none;
    }
    .signatureCanvas {
      display: block;
      width: 100%;
      height: 100%;
      background: var(--color-background-card);
      touch-action: none;
    }
    .lastSignatureImg {
      display: block;
      object-fit: contain;
    }
    ${Footer} {
      flex-shrink: 0;
    }
  }
  &.mobileSignatureModal:not(.landscapeSignatureModal) {
    .signatureCanvasWrap {
      flex: 0 0 200px;
      height: 200px;
    }
  }
  &.landscapeSignatureModal {
    .adm-popup-body-position-left {
      width: 100vw;
      height: 100vh;
      max-width: 100dvw;
      max-height: 100dvh;
      overflow: hidden;
      background: var(--color-background-card);
    }
    .adm-popup-body-position-bottom {
      height: 100vh;
      max-height: 100dvh;
      padding-bottom: 0 !important;
      border-radius: 0 !important;
    }
    .signaturePopupBody {
      width: 100%;
      height: 100%;
      min-height: 0;
      max-height: none;
      overflow: hidden;
    }
    .signatureHeader {
      position: relative;
      z-index: 1;
      flex-shrink: 0;
      background: var(--color-background-card);
    }
    .signatureCanvasWrap {
      flex: 1 1 auto;
      width: 100%;
      min-height: 0;
    }
    ${Footer} {
      position: relative;
      z-index: 1;
      flex-shrink: 0;
      background: var(--color-background-card);
    }
  }
`;

const HorizontalSignatureContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  transform: rotate(90deg);
  transform-origin: top left;
  height: ${props => `${props.height}px`};
  width: ${props => `${props.width}px`};
  left: ${props => `${props.height}px`};
  background: var(--color-background-card);
`;

const getViewportSize = () => {
  const viewport = window.visualViewport;

  return {
    width: Math.round((viewport && viewport.width) || window.innerWidth || document.documentElement.clientWidth),
    height: Math.round((viewport && viewport.height) || window.innerHeight || document.documentElement.clientHeight),
    offsetTop: Math.round((viewport && viewport.offsetTop) || 0),
    offsetLeft: Math.round((viewport && viewport.offsetLeft) || 0),
  };
};

const getIsViewportLandscape = () => {
  const { width, height } = getViewportSize();

  return width > height;
};

const getOffsetToParent = (element, parent) => {
  let left = 0;
  let top = 0;
  let current = element;

  while (current && current !== parent) {
    left += current.offsetLeft || 0;
    top += current.offsetTop || 0;
    current = current.offsetParent;
  }

  return { left, top };
};

const Signature = props => {
  const {
    flag,
    value,
    advancedSetting: { uselast } = {},
    onlySignature,
    controlId,
    formData,
    projectId,
    appId,
    worksheetId,
    disabled,
  } = props;
  const signatureRef = useRef(null);
  const signatureContentRef = useRef(null);
  const signaturePad = useRef(null);
  const removeCanvasTouchBlockRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const keepSignatureOnInitRef = useRef(false);
  const signatureDataUrlRef = useRef('');
  const restoringSignatureRef = useRef(false);
  const initCanvasRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isLandscape, setIsLandscape] = useState(
    typeof window === 'undefined' ? false : window.innerWidth > window.innerHeight,
  );
  const [lastInfo, setLastInfo] = useState(null);
  const [viewportSize, setViewportSize] = useState(getViewportSize);
  const isAutoLandscape = isLandscape && viewportSize.width > viewportSize.height;
  const isRotateLandscape = isLandscape && !isAutoLandscape;
  const signaturePopupBodyStyle = isLandscape
    ? {
        width: viewportSize.width,
        height: viewportSize.height,
        maxWidth: '100dvw',
        maxHeight: '100dvh',
        top: viewportSize.offsetTop,
        left: viewportSize.offsetLeft,
        bottom: isAutoLandscape ? 'auto' : undefined,
      }
    : undefined;

  const resetSignaturePopupState = () => {
    setIsEdit(false);
    setIsLandscape(false);
    setLastInfo(null);
    signaturePad.current && signaturePad.current.clear();
    keepSignatureOnInitRef.current = false;
    signatureDataUrlRef.current = '';
    restoringSignatureRef.current = false;
  };

  const closePopup = () => {
    setPopupVisible(false);
    resetSignaturePopupState();
    props.onClose && props.onClose();
  };

  const cacheCurrentSignature = useCallback(() => {
    if (restoringSignatureRef.current) {
      return signatureDataUrlRef.current;
    }

    if (signaturePad.current && !signaturePad.current.isEmpty()) {
      signatureDataUrlRef.current = signaturePad.current.toDataURL('image/png');
    }

    return signatureDataUrlRef.current;
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = signatureRef.current;

    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    if (!width || !height) {
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        initCanvasRef.current && initCanvasRef.current();
      }, 100);
      return;
    }

    const previousSignature = keepSignatureOnInitRef.current ? cacheCurrentSignature() : '';
    keepSignatureOnInitRef.current = false;
    restoringSignatureRef.current = false;

    removeCanvasTouchBlockRef.current && removeCanvasTouchBlockRef.current();
    if (signaturePad.current) {
      signaturePad.current.off();
      signaturePad.current = null;
    }

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.getContext('2d').scale(ratio, ratio);

    signaturePad.current = new SignaturePad.default(canvas, {
      penColor: '#151515',
      throttle: 8,
      minDistance: 3,
      onBegin: () => {
        requestAnimationFrame(() => setIsEdit(true));
      },
      onEnd: () => {
        requestAnimationFrame(cacheCurrentSignature);
      },
    });

    if (previousSignature) {
      restoringSignatureRef.current = true;
      signaturePad.current.fromDataURL(previousSignature, { width, height, ratio: 1 }, () => {
        restoringSignatureRef.current = false;
        signatureDataUrlRef.current = previousSignature;
      });
    }

    if (isRotateLandscape) {
      const createPoint = signaturePad.current._createPoint.bind(signaturePad.current);

      signaturePad.current._createPoint = (clientX, clientY) => {
        const content = signatureContentRef.current;

        if (!content) {
          return createPoint(clientX, clientY);
        }

        const contentRect = content.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const canvasOffset = getOffsetToParent(canvas, content);
        const canvasX = clientY - contentRect.top - canvasOffset.left;
        const canvasY = contentRect.right - clientX - canvasOffset.top;

        return createPoint(
          canvasRect.left + Math.max(0, Math.min(width, canvasX)),
          canvasRect.top + Math.max(0, Math.min(height, canvasY)),
        );
      };
    }

    // 阻止签名时点到手机左侧触发浏览器返回
    const blockSwipeBack = e => {
      e.stopPropagation();
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    ['touchstart', 'touchmove', 'touchend'].forEach(eventName => {
      canvas.addEventListener(eventName, blockSwipeBack, { passive: false });
    });

    removeCanvasTouchBlockRef.current = () => {
      ['touchstart', 'touchmove', 'touchend'].forEach(eventName => {
        canvas.removeEventListener(eventName, blockSwipeBack);
      });
    };
  }, [cacheCurrentSignature, isRotateLandscape]);

  initCanvasRef.current = initCanvas;

  const resizeCanvas = useCallback(() => {
    clearTimeout(resizeTimerRef.current);
    resizeTimerRef.current = setTimeout(() => {
      const nextIsLandscape = getIsViewportLandscape();

      setViewportSize(getViewportSize());

      if (!lastInfo) {
        cacheCurrentSignature();
      }

      if (nextIsLandscape !== isLandscape) {
        setIsLandscape(nextIsLandscape);
        if (!lastInfo) {
          keepSignatureOnInitRef.current = true;
        }

        return;
      }

      if (lastInfo) return;
      keepSignatureOnInitRef.current = true;

      requestAnimationFrame(() => {
        requestAnimationFrame(initCanvas);
      });
    }, 100);
  }, [initCanvas, isLandscape, lastInfo]);

  const switchSignatureDirection = event => {
    event.stopPropagation();
    if (getIsViewportLandscape()) return;
    if (!lastInfo) {
      cacheCurrentSignature();
    }

    keepSignatureOnInitRef.current = true;
    setIsLandscape(!isLandscape);
    setViewportSize(getViewportSize());
  };

  const saveSignature = event => {
    if (event) {
      event.stopPropagation();
    }

    if (lastInfo) {
      setPopupVisible(false);
      resetSignaturePopupState();
      props.onChange(lastInfo.url);
      return;
    }

    if ((!signaturePad.current || signaturePad.current.isEmpty()) && !signatureDataUrlRef.current) {
      return alert(_l('请先完成签名'), 2);
    }

    const data = cacheCurrentSignature();

    if (!data) {
      return alert(_l('请先完成签名'), 2);
    }

    getToken([{ bucket: 4, ext: '.png' }], 10, {
      projectId,
      appId,
      worksheetId,
    }).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${btoa(res[0].key)}`;
        axios
          .post(url, data.split(',')[1], {
            headers: {
              'Content-Type': 'application/octet-stream',
              Authorization: `UpToken ${res[0].uptoken}`,
            },
          })
          .then(() => {
            setPopupVisible(false);
            resetSignaturePopupState();

            if (window.isPublicWorksheet || _.get(window, 'shareState.isPublicWorkflowRecord')) {
              props.onChange(res[0].url);
            } else {
              accountSettingAjax.editSign({ url: res[0].url }).then(result => {
                if (result) {
                  props.onChange(res[0].url);
                }
              });
            }
          })
          .catch(error => {
            console.log(error);
            alert(_l('保存失败!'), 2);
          });
      }
    });
  };

  const useLastSignature = () => {
    accountSettingAjax.getSign().then(res => {
      if (!res.url) return alert(_l('暂无签名记录'), 3);
      setIsEdit(true);
      signatureDataUrlRef.current = '';
      restoringSignatureRef.current = false;
      setLastInfo(res);
    });
  };

  const clear = () => {
    const hadLastInfo = !!lastInfo;

    signaturePad.current && signaturePad.current.clear();
    signatureDataUrlRef.current = '';
    restoringSignatureRef.current = false;
    setIsEdit(false);
    setLastInfo(null);

    if (hadLastInfo) {
      setTimeout(initCanvas, 100);
    }
  };

  const removeSignature = e => {
    e.stopPropagation();
    props.onChange('');
    signatureDataUrlRef.current = '';
    restoringSignatureRef.current = false;
    setIsEdit(false);
    setLastInfo(null);
  };

  const preview = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    compatibleMDJS('previewSignature', { url: value }, () => {
      previewAttachments({
        attachments: [
          {
            previewType: 1,
            ext: 'png',
            name: 'signature.png',
            previewAttachmentType: 'QINIU',
            path: value,
          },
        ],
        index: 0,
        callFrom: 'player',
        hideFunctions: location.href.indexOf('/public/') > -1 ? ['editFileName', 'download'] : ['editFileName'],
      });
    });
  };

  const openSignature = () => {
    const control = _.find(formData, { controlId }) || {};
    if (!window.MDJS || !window.MDJS.signature) return;
    window.MDJS.signature({
      control,
      success: res => {
        var { url } = res.signature;
        props.onChange(url);
      },
      cancel: res => {
        const { errMsg } = res;

        if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
          window.nativeAlert(JSON.stringify(res));
        }
      },
    });
  };

  const renderFooter = () => {
    const canUseLast =
      uselast === '1' && !(window.isPublicWorksheet || _.get(window, 'shareState.isPublicWorkflowRecord'));

    return (
      <Footer canUseLast={canUseLast}>
        {canUseLast && (
          <div className="lastSignature" onClick={useLastSignature}>
            {_l('使用上次签名')}
          </div>
        )}
        <div className="flexCenter">
          {isEdit && (
            <div className="clearSignature" onClick={clear}>
              {_l('清除')}
            </div>
          )}
          <Button disabled={!isEdit} onClick={saveSignature} size="small">
            {_l('确认')}
          </Button>
        </div>
      </Footer>
    );
  };

  const renderSignature = () => {
    const signatureContent = (
      <div className="signaturePopupBody flexColumn leftAlign">
        <div className="signatureHeader flexRow pTop15 pLeft20 pRight20 pBottom8">
          <div className="Font18 textPrimary flex bold ellipsis">{_l('请在下方空白区域横向书写签名')}</div>
          {!isAutoLandscape && (
            <Icon
              className="Font20 textTertiary mRight12"
              icon={isLandscape ? 'close_fullscreen' : 'task-new-fullscreen'}
              onClick={switchSignatureDirection}
            />
          )}
          <i className="icon-close textTertiary Font20" onClick={closePopup}></i>
        </div>
        {lastInfo ? (
          <div className="signatureCanvasWrap flex">
            <img src={lastInfo.url} className="lastSignatureImg w100 h100" />
          </div>
        ) : (
          <div className="signatureCanvasWrap flex">
            <canvas ref={signatureRef} id="signatureCanvas" className="signatureCanvas"></canvas>
          </div>
        )}
        {renderFooter()}
      </div>
    );

    return (
      <Fragment>
        <div
          className="customFormControlBox customFormButton"
          onClick={e => {
            if (window.isMingDaoApp) {
              openSignature();
            } else {
              resetSignaturePopupState();

              setPopupVisible(true);
              setViewportSize(getViewportSize());
              setIsLandscape(getIsViewportLandscape());
              e.nativeEvent.stopImmediatePropagation();
            }
          }}
        >
          <Icon icon="e-signature" />
          <span>{_l('添加签名')}</span>
        </div>

        <SignaturePopup
          visible={popupVisible}
          position={isRotateLandscape ? 'left' : 'bottom'}
          bodyStyle={signaturePopupBodyStyle}
          className={`mobileModal topRadius mobileSignatureModal ${isLandscape ? 'landscapeSignatureModal' : ''}`}
        >
          {isRotateLandscape ? (
            <HorizontalSignatureContent
              ref={signatureContentRef}
              height={viewportSize.width}
              width={viewportSize.height}
            >
              {signatureContent}
            </HorizontalSignatureContent>
          ) : (
            signatureContent
          )}
        </SignaturePopup>
      </Fragment>
    );
  };

  useEffect(() => {
    if (!value) {
      setIsEdit(false);
      setLastInfo(null);
      signatureDataUrlRef.current = '';
      restoringSignatureRef.current = false;
    }
  }, [flag, value]);

  useEffect(() => {
    return () => {
      removeCanvasTouchBlockRef.current && removeCanvasTouchBlockRef.current();
      signaturePad.current && signaturePad.current.off();
      clearTimeout(resizeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!popupVisible) return;

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    window.visualViewport && window.visualViewport.addEventListener('resize', resizeCanvas);
    window.visualViewport && window.visualViewport.addEventListener('scroll', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
      window.visualViewport && window.visualViewport.removeEventListener('resize', resizeCanvas);
      window.visualViewport && window.visualViewport.removeEventListener('scroll', resizeCanvas);
      clearTimeout(resizeTimerRef.current);
    };
  }, [lastInfo, popupVisible, resizeCanvas]);

  useEffect(() => {
    if (!popupVisible || lastInfo) return;

    const timer = setTimeout(initCanvas, 300);

    return () => clearTimeout(timer);
  }, [initCanvas, isLandscape, lastInfo, popupVisible]);

  // 只读
  if (disabled) {
    return (
      <div
        className="cardWrap signatureCard"
        onClick={preview}
        style={{ height: '130px', backgroundImage: `url(${value})` }}
      />
    );
  }

  if (onlySignature) {
    return renderSignature();
  }

  return (
    <Fragment>
      {value ? (
        <div
          className="cardWrap signatureCard"
          onClick={e => {
            value && preview(e);
            e.nativeEvent.stopImmediatePropagation();
          }}
          style={{ height: '130px', backgroundImage: `url(${value})` }}
        >
          <i className="icon icon-cancel removeBtn" onClick={removeSignature} />
        </div>
      ) : (
        renderSignature()
      )}
    </Fragment>
  );
};

export default memo(Signature);
