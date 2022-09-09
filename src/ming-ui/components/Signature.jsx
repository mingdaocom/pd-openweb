import React, { Component } from 'react';
import Icon from './Icon';
import styled from 'styled-components';
import * as SignaturePad from 'signature_pad/dist/signature_pad';
import axios from 'axios';
import { getToken } from 'src/util';
import { Base64 } from 'js-base64';
import { getSign, editSign } from 'src/api/accountSetting';

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
`;

export default class Signature extends Component {
  state = {
    isEdit: false,
    signature: '',
    key: '',
  };

  isComplete = true;

  componentDidMount() {
    setTimeout(() => {
      this.initCanvas();
    }, 100);
  }

  initCanvas = () => {
    const canvas = document.getElementById('signatureCanvas');

    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.getContext('2d');
    this.signaturePad = new SignaturePad.default(canvas, {
      onBegin: () => {
        this.setState({ isEdit: true });
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

  saveSignature = (callback = () => {}) => {
    const { signature, key } = this.state;

    if (signature) {
      callback({ bucket: 4, key: key });
      return;
    }

    if (!this.isComplete) return;

    this.isComplete = false;

    getToken([{ bucket: 4, ext: '.png' }]).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${Base64.encode(res[0].key)}`;
        axios
          .post(url, this.signaturePad.toDataURL('image/png').split(',')[1], {
            headers: {
              'Content-Type': 'application/octet-stream',
              Authorization: `UpToken ${res[0].uptoken}`,
            },
          })
          .then(({ data }) => {
            const { key = '' } = data || {};

            editSign({ bucket: 4, key: key });
            callback({ bucket: 4, key });
            this.isComplete = true;
          });
      }
    });
  };

  getSignature = () => {
    getSign().then(res => {
      if (!res.url) return alert(_l('暂无签名记录'));
      this.setState({ isEdit: false, signature: res.url, key: res.key });
    });
  };

  render() {
    const { isEdit, signature } = this.state;

    return (
      <SignatureBox>
        {signature ? (
          <div className="signatureCanvas">
            <img src={signature} className="w100 h100" />
          </div>
        ) : (
          <canvas id="signatureCanvas" className="signatureCanvas" />
        )}

        <div className="flexRow mTop10" style={{ minHeight: 20 }}>
          {!md.global.Account.isPortal && (
            <span className="ThemeColor3 ThemeHoverColor2 pointer flexRow" onClick={this.getSignature}>
              {_l('使用上次签名')}
            </span>
          )}

          <div className="flex" />
          {(isEdit || !!signature) && (
            <span className="ThemeColor3 ThemeHoverColor2 pointer flexRow" onClick={this.clear}>
              <Icon icon="e-signature" className="Font16 mRight5" />
              {_l('重新签名')}
            </span>
          )}
        </div>
      </SignatureBox>
    );
  }
}
