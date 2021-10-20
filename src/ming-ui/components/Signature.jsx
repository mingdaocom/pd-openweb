import React, { Component } from 'react';
import Icon from './Icon';
import styled from 'styled-components';
import * as SignaturePad from 'signature_pad/dist/signature_pad';
import axios from 'axios';
import { getToken } from 'src/util';
import { Base64 } from 'js-base64';

const SignatureBox = styled.div`
  width: 100%;
  .signatureCanvas {
    width: 100%;
    height: 200px;
    border-radius: 4px;
    background: #f5f5f5;
  }
  .flexRow {
    align-items: center;
  }
`;

export default class Signature extends Component {
  state = {
    isEdit: false,
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
    this.setState({ isEdit: false });
  };

  checkContentIsEmpty() {
    return !this.state.isEdit;
  }

  saveSignature = (callback = () => {}) => {
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

            callback({ bucket: 4, key: key });
            this.isComplete = true;
          });
      }
    });
  };

  render() {
    const { isEdit } = this.state;

    return (
      <SignatureBox>
        <canvas id="signatureCanvas" className="signatureCanvas"></canvas>
        <div className="flexRow mTop5" style={{ minHeight: 20 }}>
          <div className="flex" />
          {isEdit && (
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
