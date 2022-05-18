import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { Toast } from 'antd-mobile';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { getWeiXinConfig } from 'src/api/weixin';
import { getSignatureInfo } from 'src/api/workWeiXin';
import { Modal, Button } from 'antd-mobile';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { browserIsMobile } from 'src/util';
import styled from 'styled-components';

const ErrorWrap = styled.div`
  justify-content: center;
  .iconWrap {
    width: 94px;
    height: 94px;
    border-radius: 50%;
    justify-content: center;
    background-color: #f5f5f5;
  }
`;


const bindWeiXin = () => {
  return new Promise((reslove, reject) => {
    const entryUrl = sessionStorage.getItem('entryUrl');
    const url = (entryUrl || location.href).split('#')[0];
    getWeiXinConfig({
      url: encodeURI(url),
    }).then(({ data, code }) => {
      if (code === 1) {
        wx.config({
          debug: false,
          appId: data.appId,
          timestamp: data.timestamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: ['scanQRCode'],
        });
        wx.ready(() => {
          reslove();
        });
        wx.error((res) => {
          res.mdurl = encodeURI(url);
          _alert(JSON.stringify(res));
          reject();
        });
      }
    });
  });
}

const bindWxWork = (projectId) => {
  return new Promise((reslove, reject) => {
    const url = location.href.split('#')[0];
    const { IsLocal } = md.global.Config;
    getSignatureInfo({
      projectId,
      url: encodeURI(url),
      suiteType: 8,
      tickettype: 1
    }).then((data) => {
      if (!data.corpId) {
        _alert(IsLocal ? _l('请先集成企业微信') : _l('请使用待开发模式集成企业微信'));
        reject();
        return
      }
      wx.config({
        beta: true,
        debug: false,
        appId: data.corpId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['scanQRCode'],
      });
      wx.ready(() => {
        reslove();
      });
      wx.error((res) => {
        res.mdurl = encodeURI(url);
        _alert(JSON.stringify(res));
        reject();
      });
    });
  });
}

const { IsLocal } = md.global.Config;
const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
const isWx = window.navigator.userAgent.toLowerCase().includes('micromessenger') && !IsLocal && !isWxWork;
const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');
const isDing = window.navigator.userAgent.toLowerCase().includes('dingtalk');
const isMobile = browserIsMobile();

export const getIsScanQR = () => {
  return isMobile;
}

const formatScanQRCodeResult = (resultStr) => {
  return resultStr.replace(/^(CODE_39,)|(CODE_93,)|(CODE_128,)|(EAN_8,)|(EAN_13,)|(UPC_A,)|(UPC_E,)|(UPC_EAN_EXTENSION,)|(ITF,)|(RSS_14,)|(RSS_EXPANDED,)/g, '');
}

export default class Widgets extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    onChange: PropTypes.func,
    onScanQRCodeResult: PropTypes.func,
    children: PropTypes.element,
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isError: false
    }
    this.id = Date.now();
    this.html5QrCode = null;
  }
  componentDidMount() {
    if (isDing && !window.dd) {
      $.getScript('https://g.alicdn.com/dingding/dingtalk-jsapi/2.6.41/dingtalk.open.js');
    }
    if (isWeLink && !window.HWH5) {
      $.getScript('https://open-doc.welink.huaweicloud.com/docs/jsapi/2.0.4/hwh5-cloudonline.js');
    }
    if (isWx && !window.wx) {
      $.getScript('https://res2.wx.qq.com/open/js/jweixin-1.6.0.js');
    }
    if (isWxWork && !window.wx) {
      $.getScript('https://res.wx.qq.com/open/js/jweixin-1.2.0.js');
    }
  }
  componentWillUnmount() {
    this.clearQrcode();
  }
  handleWxScanQRCode = () => {
    wx.scanQRCode({
      needResult: 1,
      scanType: ['qrCode', 'barCode'],
      success: res => {
        this.props.onScanQRCodeResult(formatScanQRCodeResult(res.resultStr));
      },
      error: res => {
        if (!res.errMsg.includes('cancel')) {
          Toast.fail(res.errMsg);
        }
      }
    });
  }
  handleScanCode = () => {

    if (isWx || isWxWork) {
      const { projectId } = this.props;
      if (window.currentUrl !== location.href) {
        window.currentUrl = location.href;
        window.configSuccess = false;
        window.configLoading = false;
      }
      if (window.configSuccess) {
        this.handleWxScanQRCode();
      } else {
        if (!window.configLoading) {
          const bindFunction = isWx ? bindWeiXin() : bindWxWork(projectId);
          bindFunction.then(() => {
            window.configLoading = false;
            window.configSuccess = true;
            this.handleWxScanQRCode();
          });
        }
      }
      return;
    }

    if (isWeLink && HWH5) {
      HWH5.scanCode({ needResult: 1 }).then(data => {
        const { content } = data;
        this.props.onScanQRCodeResult(content);
      }).catch(error => {
        Toast.fail(_l('扫码异常'));
      });
      return;
    }

    if (isDing) {
      window.dd.biz.util.scan({
        type: 'all',
        onSuccess: (data) => {
          this.props.onScanQRCodeResult(data.text);
        },
        onFail: () => {
          Toast.fail(_l('扫码异常'));
        }
      });
      return;
    }

    this.setState({
      visible: true
    }, () => {
      setTimeout(() => {
        this.renderQrcode();
      }, 300);
    });
  }
  handleClose = () => {
    this.setState({
      visible: false
    }, () => {
      this.clearQrcode();
    });
  }
  handleScanSuccess = (decodedText, decodedResult) => {
    if (decodedText) {
      this.handleClose();
      this.props.onScanQRCodeResult(decodedText);
    }
  }
  renderQrcode() {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.CODE_93,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
      Html5QrcodeSupportedFormats.ITF,
      Html5QrcodeSupportedFormats.RSS_14,
      Html5QrcodeSupportedFormats.RSS_EXPANDED
    ];
    this.html5QrCode = new Html5Qrcode(`qrcodeWrapper-${this.id}`, { formatsToSupport });
    this.html5QrCode
    .start({ facingMode: 'environment' }, config, this.handleScanSuccess)
    .catch((eror) => {
      this.setState({
        isError: true
      });
    });
  }
  clearQrcode() {
    if (this.html5QrCode) {
      const { isError } = this.state;
      if (isError) {
        this.html5QrCode.clear();
      } else {
        this.html5QrCode.stop().then((ignore) => {
          this.html5QrCode.clear();
          this.html5QrCode = null;
        }).catch((err) => {});
      }
    }
    this.setState({ isError: false });
  }
  render() {
    const { visible, isError } = this.state;
    const { className, children } = this.props;
    return (
      <Fragment>
        <div className={className} onClick={this.handleScanCode}>{children}</div>
        <Modal
          popup
          visible={visible}
          onClose={this.handleClose}
          animationType="slide-up"
          className="h100"
        >
          <div className="valignWrapper h100" style={{ backgroundColor: isError ? '#fff' : '#000' }}>
            <div className="flexColumn w100">
              {isError ? (
                <ErrorWrap className="flexColumn valignWrapper h100">
                  <div className="iconWrap valignWrapper mBottom24">
                    <Icon className="Gray_75 Font38" icon="camera_alt" />
                  </div>
                  <div className="Font16 bold Gray">{_l('无法识别您的摄像头')}</div>
                </ErrorWrap>
              ) : (
                <div id={`qrcodeWrapper-${this.id}`} className="qrcodeWrapper flex"></div>
              )}
              <div className="Absolute" style={{ right: '5%', top: '5%' }} onClick={this.handleClose}>
                <Icon className={cx('Font28', isError ? 'Gray_9e' : 'White')} icon="closeelement-bg-circle" />
              </div>
            </div>
          </div>
        </Modal>
      </Fragment>
    );
  }
}