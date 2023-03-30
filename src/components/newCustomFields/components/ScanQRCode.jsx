import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { Toast } from 'antd-mobile';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { Modal } from 'antd-mobile';
import { browserIsMobile } from 'src/util';
import { bindWeiXin, bindWxWork, bindFeishu } from '../tools/authentication';
import styled from 'styled-components';
import _ from 'lodash';

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

const { IsLocal } = md.global.Config;
const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
const isWx = window.navigator.userAgent.toLowerCase().includes('micromessenger') && !IsLocal && !isWxWork;
const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');
const isDing = window.navigator.userAgent.toLowerCase().includes('dingtalk');
const isFeishu = window.navigator.userAgent.toLowerCase().includes('feishu');
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
      isError: false,
      devices: [],
      cameraId: null,
      resetCameraLoading: false,
      scanShape: 'square'
    }
    this.id = Date.now();
    this.html5QrCode = null;
  }
  componentDidMount() {
    if (isDing || isWeLink || isWx || isWxWork || isFeishu) {
      return;
    }
    import('html5-qrcode').then(data => {
      this.qrCodeComponent = data;
    });
  }
  componentWillUnmount() {
    this.clearQrcode();
  }
  get formatsToSupport() {
    const { Html5QrcodeSupportedFormats } = this.qrCodeComponent;
    return [
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
  handleFeishuScanQRCode = () => {
    window.tt.scanCode({
      scanType: ['barCode', 'qrCode'],
      success: res => {
        this.props.onScanQRCodeResult(res.result);
      },
      fail: res => {
        const { errMsg } = res;
        if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
          _alert(JSON.stringify(res));
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
          }).catch((errType) => {
            if (errType) {
              import('html5-qrcode').then(data => {
                this.qrCodeComponent = data;
                this.handleScanQRCode();
              });
            }
          });
        }
      }
      return;
    }

    if (isFeishu) {
      const { projectId } = this.props;
      if (window.currentUrl !== location.href) {
        window.currentUrl = location.href;
        window.configSuccess = false;
        window.configLoading = false;
      }
      if (window.configSuccess) {
        this.handleFeishuScanQRCode();
      } else {
        if (!window.configLoading) {
          bindFeishu(projectId).then(() => {
            window.configLoading = false;
            window.configSuccess = true;
            this.handleFeishuScanQRCode();
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

    this.handleScanQRCode();
  }
  handleScanQRCode = () => {
    this.setState({
      visible: true
    }, () => {
      setTimeout(() => {
        const { devices } = this.state;
        if (devices.length) {
          this.initQrcode();
        } else {
          this.getCameras().then(() => {
            this.initQrcode();
          });
        }
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
  handleChangeCamera = () => {
    const { cameraId, devices, resetCameraLoading } = this.state;
    const index = _.findIndex(devices, { id: cameraId });
    const nextCameraId = index === -1 ? _.get(devices[0], 'id') : (devices[index + 1] || devices[0]).id;

    if (resetCameraLoading || !this.html5QrCode) return;

    this.setState({ resetCameraLoading: true });
    this.setState({
      cameraId: nextCameraId
    }, () => {
      this.html5QrCode.stop().then((ignore) => {
        this.startQrcode();
        this.setState({ resetCameraLoading: false });
        const currentCamera = _.find(devices, { id: nextCameraId });
        if (currentCamera) {
          Toast.info(_l('切换至 %0', currentCamera.label), 2);
        }
      });
    });
  }
  handleChangeSize = () => {
    const { scanShape, resetCameraLoading } = this.state;

    if (resetCameraLoading || !this.html5QrCode) return;

    this.setState({ resetCameraLoading: true });
    this.setState({
      scanShape: scanShape === 'square' ? 'rectangle' : 'square'
    }, () => {
      this.html5QrCode.stop().then((ignore) => {
        this.startQrcode();
        this.setState({ resetCameraLoading: false });
      });
    });
  }
  getCameras() {
    const { Html5Qrcode } = this.qrCodeComponent;
    return new Promise((reslove, reject) => {
      Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
          this.setState({ devices }, reslove);
        }
      });
    });
  }
  initQrcode() {
    const { Html5Qrcode } = this.qrCodeComponent;
    this.html5QrCode = new Html5Qrcode(`qrcodeWrapper-${this.id}`, { formatsToSupport: this.formatsToSupport });
    this.startQrcode();
  }
  startQrcode() {
    const { scanShape } = this.state;
    const config = {
      fps: 10,
      aspectRatio: 1,
      rememberLastUsedCamera: true,
      qrbox: function(viewfinderWidth, viewfinderHeight) {
        if (scanShape === 'square') {
          const n = viewfinderWidth > viewfinderHeight ? viewfinderHeight : viewfinderWidth;
          const ratio = Math.floor(.8 * n);
          return ratio < 250 ? n < 250 ? { width: n, height: n } : { width: 250, height: 250 } : { width: ratio, height: ratio };
        } else {
          return { width: viewfinderWidth - 20, height: 220 };
          // return { width: 330, height: 220 };
        }
      }
    };
    const { cameraId } = this.state;
    const defaultCameraConfig = {
      facingMode: 'environment'
    };
    const selectCameraConfig = {
      deviceId: { exact: cameraId }
    };
    const cameraConfig = cameraId ? selectCameraConfig : defaultCameraConfig;
    this.html5QrCode.start(cameraConfig, config, this.handleScanSuccess).catch((eror) => {
      this.setState({
        isError: true
      });
    });
  }
  clearQrcode() {
    if (this.html5QrCode) {
      const { isError } = this.state;
      const state = this.html5QrCode.getState();
      if (isError || state === 1) {
        this.html5QrCode.clear();
      } else {
        this.html5QrCode.stop().then((ignore) => {
          this.html5QrCode.clear();
          this.html5QrCode = null;
        }).catch((err) => {});
      }
      this.setState({ cameraId: null });
    }
    this.setState({ isError: false });
  }
  render() {
    const { visible, isError, devices, scanShape } = this.state;
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
              {!isError && (
                <Fragment>
                  <div className="Absolute" style={{ left: '5%', top: '5%' }} onClick={this.handleChangeCamera}>
                    <Icon className="Font28 White" icon="switch_camera" />
                  </div>
                  <div className="Absolute" style={{ left: '15%', top: '5%' }} onClick={this.handleChangeSize}>
                    <Icon className="Font28 White" icon={scanShape === 'square' ? 'get_bigger' : 'put_away'} />
                  </div>
                </Fragment>
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
