import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import cx from 'classnames';
import _, { get } from 'lodash';
import * as SignaturePad from 'signature_pad/dist/signature_pad';
import styled from 'styled-components';
import { Button, Popover, Tooltip } from 'ming-ui/antd-components';
import accountSettingAjax from 'src/api/accountSetting';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import GenScanUploadQr from 'src/components/GenScanUploadQr';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { CardButton } from 'src/pages/worksheet/components/Basics.jsx';
import { compatibleMDJS } from 'src/utils/services/project';
import { getToken } from 'src/utils/services/request/authenticated';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const SignatureBox = styled.div`
  cursor: pointer;
  height: ${props => props.$autoHeight && 'auto !important'};
`;

const SignaturePopup = styled.div`
  width: 480px;
  touch-action: none;
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
  background-color: #ffffff;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  border: 1px solid var(--color-border-secondary);
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

const Signature = props => {
  const { openPreviewAttachments = previewAttachments } = useContext(RecordInfoContext) || props;
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
    formItemId,
  } = props;

  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [lastInfo, setLastInfo] = useState('');
  const [signatureContainer, setSignatureContainer] = useState(null);
  const allowappupload = (advancedSetting.allowappupload || '1') === '1';
  const isPopupOpen = onlySignature ? visible : popupVisible;

  const signatureRef = useRef(null);
  const signaturePadRef = useRef(null);
  const valueRef = useRef(value);

  const initCanvas = useCallback(() => {
    const canvas = signatureRef.current;

    if (!canvas) return;

    if (signaturePadRef.current) {
      signaturePadRef.current.off();
      signaturePadRef.current = null;
    }

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.getContext('2d');
    signaturePadRef.current = new SignaturePad.default(canvas, {
      penColor: '#151515',
      minWidth: 3,
      maxWidth: 3,
      throttle: 8,
      minDistance: 3,
      onBegin: () => {
        requestAnimationFrame(() => setIsEdit(true));
      },
    });
  }, []);

  const getPopoverContainer = useCallback(
    () => popupContainer || signatureContainer || document.body,
    [popupContainer, signatureContainer],
  );

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      signaturePadRef.current?.off();
      signaturePadRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (value) return;

    const frame = requestAnimationFrame(() => {
      setIsEdit(false);
      setLastInfo('');
    });

    return () => cancelAnimationFrame(frame);
  }, [flag, value]);

  useEffect(() => {
    if (isPopupOpen) {
      setTimeout(initCanvas, 100);
    }
  }, [initCanvas, isPopupOpen]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;

      switch (triggerType) {
        case 'Enter':
          if (valueRef.current) return;
          setPopupVisible(true);
          break;
        case 'trigger_tab_leave':
          setPopupVisible(false);
          break;
        default:
          break;
      }
    }, []),
  );

  const closePopup = () => {
    setPopupVisible(false);
    setIsEdit(false);
    if (onClose) {
      onClose();
    }
  };

  const handlePopoverOpenChange = open => {
    if (!open) {
      closePopup();
    }
  };

  const saveSignature = async event => {
    if (event) {
      event.stopPropagation();
    }

    if (saving) return;

    if (lastInfo) {
      setPopupVisible(false);
      onChange(lastInfo.url);
      return;
    }

    const data = signaturePadRef.current.toDataURL('image/png');

    setSaving(true);
    try {
      const res = await getToken([{ bucket: 4, ext: '.png' }], 10, {
        projectId,
        appId,
        worksheetId,
      });

      if (res.error) {
        alert(res.error);
        return;
      }

      const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${btoa(res[0].key)}`;
      await axios.post(url, data.split(',')[1], {
        headers: {
          'Content-Type': 'application/octet-stream',
          Authorization: `UpToken ${res[0].uptoken}`,
        },
      });
      setPopupVisible(false);

      if (window.isPublicWorksheet || _.get(window, 'shareState.isPublicWorkflowRecord')) {
        onChange(res[0].url);
      } else {
        if (!get(window, 'md.global.Account.accountId')) return;

        const result = await accountSettingAjax.editSign({ url: res[0].url });

        if (result) {
          onChange(res[0].url);
        }
      }
    } catch (error) {
      console.log(error);
      alertIfNotUnauthorized(error, _l('保存失败!'), 2);
    } finally {
      setSaving(false);
    }
  };

  const useLastSignature = () => {
    accountSettingAjax.getSign().then(res => {
      if (!res.url) return alert(_l('暂无签名记录'), 3);
      onChange(res.url);
      closePopup();
    });
  };

  const clear = () => {
    signaturePadRef.current?.clear();
    setIsEdit(false);
    setLastInfo('');
  };

  const removeSignature = e => {
    e.stopPropagation();
    onChange('');
    setIsEdit(false);
    setLastInfo('');
  };

  const preview = useCallback(
    e => {
      e.nativeEvent.stopImmediatePropagation();

      compatibleMDJS('previewSignature', { url: value }, () => {
        openPreviewAttachments({
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
    [openPreviewAttachments, value],
  );

  const renderFooter = () => {
    const { uselast } = advancedSetting;
    const showLast =
      uselast === '1' && !(window.isPublicWorksheet || _.get(window, 'shareState.isPublicWorkflowRecord'));
    return (
      <Footer>
        {showLast && (
          <div className="colorPrimary hoverColorPrimaryDark pointer lastSignature" onClick={useLastSignature}>
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
        <Button type="primary" loading={saving} disabled={!isEdit} onClick={saveSignature}>
          {_l('确认')}
        </Button>
      </Footer>
    );
  };

  const renderSignature = () => {
    return (
      <Popover
        open={isPopupOpen}
        onOpenChange={handlePopoverOpenChange}
        trigger="click"
        placement="bottomLeft"
        noPadding
        getPopupContainer={getPopoverContainer}
        destroyOnHidden={destroyPopupOnHide ?? false}
        content={
          <SignaturePopup onClick={e => e.nativeEvent.stopImmediatePropagation()} className="noSelect">
            <div className="header">
              <span className="textPrimary">{_l('请在下方空白区域横向书写签名')}</span>
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
        }
      >
        {!onlySignature ? (
          <ButtonsCon>
            <Button
              className="addSignature"
              color="default"
              variant="textBordered"
              icon={<i className="icon-e-signature Font17" />}
              onClick={e => {
                setPopupVisible(true);
                e.nativeEvent.stopImmediatePropagation();
              }}
            >
              <span className="text overflow_ellipsis">{_l('添加签名')}</span>
            </Button>
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
                    <Button
                      aria-label={_l('从移动设备输入')}
                      color="default"
                      variant="textBordered"
                      icon={<i className="icon icon-mobile Font20" />}
                    />
                  </Tooltip>
                </div>
              </GenScanUploadQr>
            )}
          </ButtonsCon>
        ) : (
          children
        )}
      </Popover>
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
    <SignatureBox ref={setSignatureContainer} $autoHeight={!!value} className={cx('signature')}>
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
