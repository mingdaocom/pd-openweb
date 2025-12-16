import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import cx from 'classnames';
import _, { get } from 'lodash';
import Trigger from 'rc-trigger';
import * as SignaturePad from 'signature_pad/dist/signature_pad';
import styled from 'styled-components';
import { Button } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import accountSettingAjax from 'src/api/accountSetting';
import GenScanUploadQr from 'worksheet/components/GenScanUploadQr';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { CardButton } from 'src/pages/worksheet/components/Basics.jsx';
import { getToken } from 'src/utils/common';
import { compatibleMDJS } from 'src/utils/project';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import 'rc-trigger/assets/index.css';

const ClickAwayable = createDecoratedComponent(withClickAway);

const SignatureBox = styled.div`
  cursor: pointer;
  height: ${props => props.autoHeight && 'auto !important'};
  .addSignature {
    color: var(--color-text-secondary);
    line-height: 36px;
    &:hover {
      color: var(--color-primary);
    }
  }
`;

const SignaturePopup = styled.div`
  width: 480px;
  min-width: 200px;
  background-color: var(--color-background-primary);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    span {
      font-size: 15px;
    }
    i {
      cursor: pointer;
      color: var(--color-text-secondary);
      &:hover {
        color: var(--color-primary);
      }
    }
  }
  .signatureCanvas {
    width: 100%;
    height: 200px;
    display: block;
  }
`;
const SignatureWrap = styled.div`
  position: relative;
  height: 130px;
  background-color: var(--color-background-primary);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.12),
    0 0 2px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  &:hover {
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 0 2px rgba(0, 0, 0, 0.12);
    .remove {
      visibility: visible;
    }
  }
  .remove {
    position: absolute;
    right: -12px;
    top: -12px;
    visibility: hidden;
  }
`;
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid var(--color-border-primary);
  padding: 11px 20px;
  .clearSignature {
    margin-right: 20px;
    color: var(--color-text-tertiary);
    cursor: pointer;
  }
  .signatureFromMobile {
    font-size: 12px;
    color: var(--color-text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-right: 10px;
    cursor: pointer;
    &.showLast {
      margin-left: 10px;
    }
    &:hover {
      color: var(--color-text-secondary);
    }
    .icon {
      font-size: 16px;
      margin-right: 6px;
    }
  }
`;

const ButtonsCon = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const GrayButton = styled.div`
  height: 36px;
  padding: 0 16px;
  border: 1px solid var(--color-border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-weight: bold;
  &:hover {
    background-color: var(--color-background-tertiary);
  }
  &.iconButton {
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Signature = props => {
  const {
    flag,
    value,
    onChange,
    onClose,
    onlySignature,
    visible,
    disabled,
    children,
    projectId,
    appId,
    worksheetId,
    controlId,
    recordId,
    viewIdForPermit,
    advancedSetting = {},
    popupContainer,
    destroyPopupOnHide,
    popupAlign,
    formItemId,
  } = props;

  const [isEdit, setIsEdit] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [lastInfo, setLastInfo] = useState('');
  const [popupDirection, setPopupDirection] = useState('bottom');
  const allowappupload = (advancedSetting.allowappupload || '1') === '1';

  const $ref = useRef(null);
  const signatureRef = useRef(null);
  const signaturePadRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!value) {
      setIsEdit(false);
      setLastInfo('');
    }
  }, [flag, value]);

  useEffect(() => {
    if (onlySignature && visible) {
      setTimeout(initCanvas, 100);
    }
  }, [visible]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'Enter':
          if (valueRef.current) return;
          setPopupVisible(true);
          setTimeout(initCanvas, 100);
          break;
        case 'trigger_tab_leave':
          setPopupVisible(false);
          break;
        default:
          break;
      }
    }, []),
  );

  const getPopupDirection = useCallback(() => {
    const { current } = $ref;
    if (!current) return;
    const $newRecordWrap = document.querySelector('.workSheetNewRecord .mui-dialog-body');
    if (!$newRecordWrap) return;
    const { bottom, top } = current.getBoundingClientRect();
    const { bottom: wrapBottom, top: wrapTop } = $newRecordWrap.getBoundingClientRect();
    if (wrapBottom - bottom < 360 && top - wrapTop > 360) {
      setPopupDirection('top');
    } else {
      setPopupDirection('bottom');
    }
  }, []);

  const clickEvent = () => {
    setPopupVisible(false);
    setIsEdit(false);
    if (onClose) {
      onClose();
    }
  };

  const showPopup = visible => {
    getPopupDirection();
    if (visible) {
      setTimeout(initCanvas, 100);
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
    setIsEdit(false);
    if (onClose) {
      onClose();
    }
  };

  const initCanvas = useCallback(() => {
    const canvas = signatureRef.current;

    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.getContext('2d');
    signaturePadRef.current = new SignaturePad.default(canvas, {
      onBegin: () => {
        setIsEdit(true);
      },
    });
  }, []);

  const saveSignature = event => {
    if (event) {
      event.stopPropagation();
    }

    if (lastInfo) {
      setPopupVisible(false);
      onChange(lastInfo.url);
      return;
    }

    const data = signaturePadRef.current.toDataURL('image/png');

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

            if (window.isPublicWorksheet || _.get(window, 'shareState.isPublicWorkflowRecord')) {
              onChange(res[0].url);
            } else {
              if (!get(window, 'md.global.Account.accountId')) return;
              accountSettingAjax.editSign({ url: res[0].url }).then(result => {
                if (result) {
                  onChange(res[0].url);
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
      setLastInfo(res);
    });
  };

  const clear = () => {
    signaturePadRef.current.clear();
    setIsEdit(false);
    setLastInfo('');
    setTimeout(() => {
      initCanvas();
    }, 100);
  };

  const removeSignature = e => {
    e.stopPropagation();
    onChange('');
    setIsEdit(false);
    setLastInfo('');
  };

  const getAlign = useCallback(() => {
    if (popupDirection === 'bottom') {
      return {
        points: ['tl', 'bl'],
        offset: [-12, 3],
        overflow: { adjustX: true, adjustY: true },
      };
    }
    return {
      points: ['bl', 'tl'],
      offset: [-12, -3],
      overflow: { adjustX: true, adjustY: true },
    };
  }, [popupDirection]);

  const preview = useCallback(
    e => {
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
    },
    [value],
  );

  const renderFooter = () => {
    const { uselast } = advancedSetting;
    const showLast =
      uselast === '1' && !(window.isPublicWorksheet || _.get(window, 'shareState.isPublicWorkflowRecord'));
    return (
      <Footer>
        {showLast && (
          <div className="ThemeColor3 ThemeHoverColor2 pointer lastSignature" onClick={useLastSignature}>
            {_l('使用上次签名')}
          </div>
        )}
        <GenScanUploadQr
          worksheetId={worksheetId}
          viewId={viewIdForPermit}
          controlId={controlId}
          rowId={recordId}
          type={2}
          onScanResultUpdate={files => {
            if (get(files, '0.url')) {
              onChange(get(files, '0.url'));
              if (get(window, 'md.global.Account.accountId')) {
                accountSettingAjax.editSign({ url: get(files, '0.url') });
              }
            }
          }}
        >
          <div className={cx('signatureFromMobile', { showLast })}>
            <i className="icon icon-zendeskHelp-qrcode Font18"></i>
            {_l('扫码签名')}
          </div>
        </GenScanUploadQr>
        <div className="flex"></div>
        {isEdit && (
          <div className="clearSignature" onClick={clear}>
            {_l('清除')}
          </div>
        )}
        <Button disabled={!isEdit} onClick={saveSignature} size="small">
          {_l('确认')}
        </Button>
      </Footer>
    );
  };

  const renderSignature = () => {
    return (
      <Trigger
        popupVisible={onlySignature ? visible : popupVisible}
        action={['click']}
        popupAlign={popupAlign || getAlign()}
        onPopupVisibleChange={showPopup}
        getPopupContainer={() => popupContainer || $ref.current}
        destroyPopupOnHide={destroyPopupOnHide}
        popup={
          <ClickAwayable onClickAway={clickEvent}>
            <SignaturePopup onClick={e => e.nativeEvent.stopImmediatePropagation()}>
              <div className="header">
                <span className="Gray">{_l('请在下方空白区域横向书写签名')}</span>
                <i onClick={closePopup} className="Font18 icon-close"></i>
              </div>
              {lastInfo ? (
                <div className="signatureCanvas">
                  <img src={lastInfo.url} className="w100 h100" />
                </div>
              ) : (
                <canvas id="signatureCanvas" ref={signatureRef} className="signatureCanvas"></canvas>
              )}
              {renderFooter()}
            </SignaturePopup>
          </ClickAwayable>
        }
      >
        {!onlySignature ? (
          <ButtonsCon>
            <GrayButton
              className="addSignature"
              type="ghostgray"
              onClick={e => {
                setPopupVisible(true);
                e.nativeEvent.stopImmediatePropagation();
              }}
            >
              <i className="icon-e-signature Font17 Gray_9e"></i>
              <span className="mLeft5">{_l('添加签名')}</span>
            </GrayButton>
            {allowappupload && (
              <GenScanUploadQr
                worksheetId={worksheetId}
                viewId={viewIdForPermit}
                controlId={controlId}
                rowId={recordId}
                type={2}
                onScanResultUpdate={files => {
                  if (get(files, '0.url')) {
                    onChange(get(files, '0.url'));
                    if (get(window, 'md.global.Account.accountId')) {
                      accountSettingAjax.editSign({ url: get(files, '0.url') });
                    }
                  }
                }}
              >
                <div>
                  <Tooltip title={_l('从移动设备输入')} placement="bottom" mouseEnterDelay={0}>
                    <GrayButton type="ghostgray" className="iconButton">
                      <i className="icon icon-mobile Font20 Gray_9e"></i>
                    </GrayButton>
                  </Tooltip>
                </div>
              </GenScanUploadQr>
            )}
          </ButtonsCon>
        ) : (
          children
        )}
      </Trigger>
    );
  };

  // 只读
  if (disabled) {
    return <SignatureWrap onClick={preview} style={{ backgroundImage: `url(${value})` }} />;
  }

  if (onlySignature) {
    return renderSignature();
  }

  return (
    <SignatureBox ref={$ref} autoHeight={!!value} className={cx('signature')}>
      {value ? (
        <SignatureWrap
          className="signatureDisplay"
          onClick={e => {
            value && preview(e);
            e.nativeEvent.stopImmediatePropagation();
          }}
          style={{ backgroundImage: `url(${value})` }}
        >
          <div className="remove" onClick={removeSignature}>
            <CardButton>
              <i className="icon icon-close" />
            </CardButton>
          </div>
        </SignatureWrap>
      ) : (
        renderSignature()
      )}
    </SignatureBox>
  );
};

export default Signature;
