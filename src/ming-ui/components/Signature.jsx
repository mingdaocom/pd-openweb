import React, { Component } from 'react';
import axios from 'axios';
import { get, isFunction, replace } from 'lodash';
import * as SignaturePad from 'signature_pad/dist/signature_pad';
import styled from 'styled-components';
import accountSettingAjax from 'src/api/accountSetting';
import GenScanUploadQr from 'worksheet/components/GenScanUploadQr';
import { getToken } from 'src/utils/common';
import Icon from './Icon';

const SignatureBox = styled.div`
  width: 100%;
  .signatureCanvas {
    width: 100%;
    height: 200px;
    border-radius: 4px;
    background: #f5f5f5;
    vertical-align: top;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
  .flexRow {
    align-items: center;
  }
  .signatureFromMobile {
    font-size: 12px;
    color: #757575;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin: 0 10px;
    .icon {
      font-size: 16px;
      margin-right: 6px;
    }
  }
`;

export default class Signature extends Component {
  state = {
    isEdit: false,
    signature: '',
    key: '',
    showButton: typeof this.props.showButton === 'undefined' ? true : this.props.showButton,
  };

  isComplete = true;

  componentDidMount() {
    setTimeout(() => {
      this.initCanvas();
    }, 100);
  }

  initCanvas = () => {
    const { onBegin } = this.props;
    const canvas = document.getElementById('signatureCanvas');

    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.getContext('2d');
    this.signaturePad = new SignaturePad.default(canvas, {
      onBegin: () => {
        this.setState({ isEdit: true });
        if (isFunction(onBegin)) {
          onBegin();
        }
      },
    });
  };

  clear = () => {
    this.signaturePad.clear();
    this.setState({ isEdit: false, signature: '', key: '' }, () => {
      setTimeout(() => {
        this.initCanvas();
      }, 100);
    });
  };

  checkContentIsEmpty() {
    const { isEdit, signature } = this.state;

    return !isEdit && !signature;
  }

  saveSignature = (callback = () => {}, { getTokenFn } = {}) => {
    const { signature, key } = this.state;

    if (signature) {
      callback({ bucket: 4, key: key });
      return;
    }

    if (!this.isComplete) return;

    this.isComplete = false;

    (getTokenFn || getToken)([{ bucket: 4, ext: '.png' }]).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${btoa(res[0].key)}`;
        axios
          .post(url, this.signaturePad.toDataURL('image/png').split(',')[1], {
            headers: {
              'Content-Type': 'application/octet-stream',
              Authorization: `UpToken ${res[0].uptoken}`,
            },
          })
          .then(({ data }) => {
            const { key = '' } = data || {};

            if (get(window, 'md.global.Account.accountId')) {
              accountSettingAjax.editSign({ url: res[0].url });
            }
            callback({ bucket: 4, key, url: res[0].url });
            this.isComplete = true;
          });
      }
    });
  };

  getSignature = () => {
    accountSettingAjax.getSign().then(res => {
      if (!res.url) return alert(_l('暂无签名记录'), 3);
      this.setState({ isEdit: false, signature: res.url, key: res.key });
    });
  };

  render() {
    const { showUploadFromMobile, worksheetId, viewId, canvasStyle = {} } = this.props;
    const { isEdit, signature, showButton } = this.state;

    return (
      <SignatureBox>
        {signature ? (
          <div className="signatureCanvas">
            <img src={signature} className="w100 h100" />
          </div>
        ) : (
          <canvas id="signatureCanvas" className="signatureCanvas" style={canvasStyle} />
        )}

        {showButton && (
          <div className="flexRow mTop10" style={{ minHeight: 20 }}>
            {!md.global.Account.isPortal && (
              <span className="ThemeColor3 ThemeHoverColor2 pointer flexRow" onClick={this.getSignature}>
                {_l('使用上次签名')}
              </span>
            )}
            {showUploadFromMobile && (
              <GenScanUploadQr
                worksheetId={worksheetId}
                viewId={viewId}
                type={2}
                onScanResultUpdate={files => {
                  if (get(files, '0.url')) {
                    this.setState({
                      isEdit: false,
                      signature: get(files, '0.url'),
                      key: replace(files[0].url.replace(/\?.*$/, ''), md.global.FileStoreConfig.pictureHost, ''),
                    });
                    if (get(window, 'md.global.Account.accountId')) {
                      accountSettingAjax.editSign({ url: get(files, '0.url') });
                    }
                  }
                }}
              >
                <div className="signatureFromMobile">
                  <i className="icon icon-zendeskHelp-qrcode"></i>
                  {_l('扫码签名')}
                </div>
              </GenScanUploadQr>
            )}

            <div className="flex" />
            {(isEdit || !!signature) && (
              <span className="ThemeColor3 ThemeHoverColor2 pointer flexRow" onClick={this.clear}>
                <Icon icon="e-signature" className="Font16 mRight5" />
                {_l('重新签名')}
              </span>
            )}
          </div>
        )}
      </SignatureBox>
    );
  }
}
