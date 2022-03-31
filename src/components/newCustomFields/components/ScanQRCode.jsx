import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Toast } from 'antd-mobile';
import { getWeiXinConfig } from 'src/api/weixin';

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

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
const isWx = window.navigator.userAgent.toLowerCase().includes('micromessenger') && !md.global.Config.IsLocal;
const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');
const isDing = window.navigator.userAgent.toLowerCase().includes('dingtalk');

export default class Widgets extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onScanQRCodeResult: PropTypes.func,
    children: PropTypes.element,
  };
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
  }
  handleWxScanQRCode = () => {
    wx.scanQRCode({
      needResult: 1,
      scanType: ['qrCode', 'barCode'],
      success: res => {
        this.props.onScanQRCodeResult(res.resultStr);
      },
      error: res => {
        if (!res.errMsg.includes('cancel')) {
          Toast.fail(res.errMsg);
        }
      }
    });
  }
  handleScanCode = () => {

    if (isWx) {
      if (window.currentUrl !== location.href) {
        window.currentUrl = location.href;
        window.configSuccess = false;
        window.configLoading = false;
      }

      if (window.configSuccess) {
        this.handleWxScanQRCode();
      } else {
        if (!window.configLoading) {
          bindWeiXin().then(() => {
            window.configLoading = false;
            window.configSuccess = true;
            this.handleWxScanQRCode();
          });
        }
      }
    }

    if (isWeLink && HWH5) {
      HWH5.scanCode({ needResult: 1 }).then(data => {
        const { content } = data;
        this.props.onScanQRCodeResult(content);
      }).catch(error => {
        Toast.fail(_l('扫码异常'));
      });
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
    }
  }
  render() {
    const { className, children } = this.props;
    return (
      <div className={className} onClick={this.handleScanCode}>{children}</div>
    );
  }
}