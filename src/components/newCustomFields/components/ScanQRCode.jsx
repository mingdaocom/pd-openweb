import React, { Component } from 'react';
import PropTypes from 'prop-types';

/* workwx-dev & workwx 分支要引用这个文件 */
// import bindWorkWeiXin from 'src/router/bindWorkWeiXin';

export default class Widgets extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onScanQRCodeResult: PropTypes.func,
    children: PropTypes.element,
  };
  handleWxScanQRCode = () => {
    wx.scanQRCode({
      // desc: 'scanQRCode desc',
      needResult: 1,
      scanType: ['qrCode', 'barCode'],
      success: res => {
        if (res.err_Info === 'success') {
          this.props.onScanQRCodeResult(res.resultStr);
        } else {
          Toast.fail(_l('没有扫描到结果'));
        }
      },
      error: res => {
        if (res.errMsg.indexOf('function_not_exist') > 0) {
          Toast.fail(_l('版本过低请升级'));
        }
      }
    });
  }
  handleScanCode = () => {
    const isWxWork = false;
    const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');

    if (isWxWork) {
      if (window.currentUrl !== location.href) {
        window.currentUrl = location.href;
        window.configSuccess = false;
        window.configLoading = false;
      }

      if (window.configSuccess) {
        this.handleWxScanQRCode();
      } else {
        if (!window.configLoading) {
          bindWorkWeiXin(() => {
            window.configLoading = false;
            window.configSuccess = true;
            this.handleWxScanQRCode();
          });
        }
      }
    }

    if (isWeLink) {
      HWH5.scanCode({ needResult: 1 }).then(data => {
        const { content } = data;
        this.props.onScanQRCodeResult(content);
      }).catch(error => {
        Toast.fail(_l('扫码异常'));
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