import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { Popup } from 'antd-mobile';
import axios from 'axios';
import _ from 'lodash';
import * as SignaturePad from 'signature_pad/dist/signature_pad';
import styled from 'styled-components';
import { Button, Icon } from 'ming-ui';
import accountSettingAjax from 'src/api/accountSetting';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { getToken } from 'src/util';
import 'rc-trigger/assets/index.css';

const Footer = styled.div`
  display: flex;
  justify-content: ${props => (props.canUseLast ? 'space-between;' : 'flex-end;')}
  align-items: center;
  padding: 11px 20px;
  border-top: 1px solid var(--gray-e0);

  .clearSignature {
    margin-right: 20px;
    color: var(--gray-9e);
    cursor: pointer;
  }
  .lastSignature {
    color: var(--color-primary);
  }
`;

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
  const signaturePad = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [lastInfo, setLastInfo] = useState(null);

  const closePopup = () => {
    setIsEdit(false);
    setPopupVisible(false);
    props.onClose && props.onClose();
  };

  const initCanvas = () => {
    const canvas = signatureRef.current;

    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.getContext('2d');
    signaturePad.current = new SignaturePad.default(canvas, {
      onBegin: () => setIsEdit(true),
    });
  };

  const saveSignature = event => {
    if (event) {
      event.stopPropagation();
    }

    if (lastInfo) {
      setPopupVisible(false);
      props.onChange(lastInfo.url);
      return;
    }

    const data = signaturePad.current.toDataURL('image/png');

    getToken([{ bucket: 4, ext: '.png' }], 10, {
      projectId,
      appId,
      worksheetId,
    }).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        const url = `${md.global.FileStoreConfig.uploadHost}putb64/-1/key/${btoa(res[0].key)}`;
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
      setLastInfo(res);
    });
  };

  const clear = () => {
    signaturePad.current.clear();
    setIsEdit(false);
    setLastInfo(null);
    setTimeout(() => {
      initCanvas();
    }, 100);
  };

  const removeSignature = e => {
    e.stopPropagation();
    props.onChange('');
    setIsEdit(false);
    setLastInfo(null);
  };

  const preview = e => {
    e.nativeEvent.stopImmediatePropagation();

    if (window.isMingDaoApp && window.MDJS && window.MDJS.previewSignature) {
      window.MDJS.previewSignature({
        url: value,
      });
      return;
    }

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
    return (
      <Fragment>
        <div
          className="customFormControlBox customFormButton"
          onClick={e => {
            if (window.isMingDaoApp) {
              openSignature();
            } else {
              setPopupVisible(true);
              setTimeout(initCanvas, 500);
              e.nativeEvent.stopImmediatePropagation();
            }
          }}
        >
          <Icon icon="e-signature" />
          <span>{_l('添加签名')}</span>
        </div>

        <Popup visible={popupVisible} className="mobileModal topRadius">
          <div className="flexColumn leftAlign h100">
            <div className="flexRow pTop15 pLeft20 pRight20 pBottom8">
              <div className="Font18 Gray flex bold ellipsis">{_l('请在下方空白区域横向书写签名')}</div>
              <i className="icon-close Gray_9e Font20" onClick={closePopup}></i>
            </div>
            {lastInfo ? (
              <div className="flex">
                <img src={lastInfo.url} className="w100 h100" />
              </div>
            ) : (
              <canvas ref={signatureRef} id="signatureCanvas" className="signatureCanvas flex"></canvas>
            )}
            {renderFooter()}
          </div>
        </Popup>
      </Fragment>
    );
  };

  useEffect(() => {
    if (!value) {
      setIsEdit(false);
      setLastInfo(null);
    }
  }, [flag, value]);

  // 只读
  if (disabled) {
    return <div className="cardWrap" onClick={preview} style={{ height: '130px', backgroundImage: `url(${value})` }} />;
  }

  if (onlySignature) {
    return renderSignature();
  }

  return (
    <Fragment>
      {value ? (
        <div
          className="cardWrap"
          onClick={e => {
            value && preview(e);
            e.nativeEvent.stopImmediatePropagation();
          }}
          style={{ height: '130px', backgroundImage: `url(${value})` }}
        >
          <i className="icon icon-delete_out removeBtn" onClick={removeSignature} />
        </div>
      ) : (
        renderSignature()
      )}
    </Fragment>
  );
};

export default memo(Signature);
