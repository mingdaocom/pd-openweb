import React, { Component, Fragment } from 'react';
import { Dialog, Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import { compatibleMDJS } from 'src/utils/project';
import { bindFeishu, bindWeiXin, bindWxWork, handleTriggerEvent } from '../../core/authentication';

const ErrorWrap = styled.div`
  justify-content: center;
  .iconWrap {
    width: 94px;
    height: 94px;
    border-radius: 50%;
    justify-content: center;
    background-color: var(--gray-f5);
  }
`;

const QrInputWrap = styled.div`
  color: var(--color-third);
  width: auto;
  height: 36px;
  padding: 0 24px;
  border-radius: 24px;
  margin: 0 auto;
  background-color: var(--color-primary);
  input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 1;
  }
`;

const isWx = window.isWeiXin && !window.isWxWork;
const isMobile = browserIsMobile();

export const getIsScanQR = () => {
  return isMobile;
};

const formatScanQRCodeResult = resultStr => {
  return resultStr.replace(
    /^(CODE_39,)|(CODE_93,)|(CODE_128,)|(EAN_8,)|(EAN_13,)|(UPC_A,)|(UPC_E,)|(UPC_EAN_EXTENSION,)|(ITF,)|(RSS_14,)|(RSS_EXPANDED,)/g,
    '',
  );
};

export default class Widgets extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    disablePhoto: PropTypes.bool,
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
      scanShape: 'square',
      uploadFile: false,
    };
    this.id = Date.now();
    this.html5QrCode = null;
  }
  componentDidMount() {
    if (window.isDingTalk || window.isWeLink || isWx || window.isWxWork || window.isFeiShu) {
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
    const { scantype = '0' } = this.props;
    const qrCodeType = [Html5QrcodeSupportedFormats.QR_CODE];
    const barCodeType = [
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
      Html5QrcodeSupportedFormats.RSS_EXPANDED,
      Html5QrcodeSupportedFormats.DATA_MATRIX,
    ];

    if (scantype === '0') {
      return [...qrCodeType, ...barCodeType];
    }
    if (scantype === '1') {
      return barCodeType;
    }
    return qrCodeType;
  }
  handleWxScanQRCode = () => {
    window.wx.scanQRCode({
      needResult: 1,
      scanType: this.getScanType(),
      success: res => {
        this.props.onScanQRCodeResult(formatScanQRCodeResult(res.resultStr));
      },
      error: res => {
        if (!res.errMsg.includes('cancel')) {
          alert(res.errMsg, 3);
        }
      },
    });
  };
  handleFeishuScanQRCode = () => {
    window.tt.scanCode({
      scanType: this.getScanType(),
      success: res => {
        this.props.onScanQRCodeResult(res.result);
      },
      fail: res => {
        const { errMsg } = res;
        if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
          window.nativeAlert(JSON.stringify(res));
        }
      },
    });
  };
  getScanType = () => {
    const { scantype = '0' } = this.props;
    if (scantype === '0') {
      return ['barCode', 'qrCode'];
    }
    if (scantype === '1') {
      return ['barCode'];
    }
    if (scantype === '2') {
      return ['qrCode'];
    }
  };
  handleScanCode = () => {
    const { projectId, control = {} } = this.props;

    compatibleMDJS(
      'scanQRCode',
      {
        control,
        keepScan: control.enumDefault === 2,
        success: res => {
          this.props.onScanQRCodeResult(res.resultStr);
        },
        cancel: function (res) {
          const { errMsg } = res;
          if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
            window.nativeAlert(JSON.stringify(res));
          }
        },
      },
      () => {
        if (isWx) {
          handleTriggerEvent(this.handleWxScanQRCode, bindWeiXin(projectId), errType => {
            if (errType) {
              import('html5-qrcode').then(data => {
                this.qrCodeComponent = data;
                this.handleScanQRCode();
              });
            }
          });
          return;
        }

        if (window.isWxWork) {
          handleTriggerEvent(this.handleWxScanQRCode, bindWxWork(projectId), errType => {
            if (errType) {
              import('html5-qrcode').then(data => {
                this.qrCodeComponent = data;
                this.handleScanQRCode();
              });
            }
          });
          return;
        }

        if (window.isFeiShu) {
          handleTriggerEvent(this.handleFeishuScanQRCode, bindFeishu(projectId), errType => {
            if (errType) {
              import('html5-qrcode').then(data => {
                this.qrCodeComponent = data;
                this.handleScanQRCode();
              });
            }
          });
          return;
        }

        if (window.isWeLink && window.HWH5) {
          window.HWH5.scanCode({ needResult: 1 })
            .then(data => {
              const { content } = data;
              this.props.onScanQRCodeResult(content);
            })
            .catch(error => {
              alert(_l('扫码异常'), 3);
            });
          return;
        }

        if (window.isDingTalk) {
          window.dd.biz.util.scan({
            type: 'all',
            onSuccess: data => {
              this.props.onScanQRCodeResult(data.text);
            },
            onFail: () => {
              alert(_l('扫码异常'), 3);
            },
          });
          return;
        }

        this.handleScanQRCode();
      },
    );
  };
  handleScanQRCode = () => {
    if (location.protocol === 'http:' && location.hostname !== 'localhost') {
      Dialog.alert({
        content: _l('浏览器平台仅https环境支持调用摄像头api'),
        confirmText: _l('确定'),
      });
      return;
    }
    this.setState(
      {
        visible: true,
      },
      () => {
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
      },
    );
  };
  handleClose = () => {
    this.setState(
      {
        visible: false,
      },
      () => {
        this.clearQrcode();
      },
    );
  };
  handleScanSuccess = (decodedText, decodedResult) => {
    if (decodedText) {
      this.handleClose();
      this.props.onScanQRCodeResult(decodedText);
    }
  };
  handleChangeCamera = () => {
    const { cameraId, devices, resetCameraLoading, uploadFile } = this.state;
    const index = _.findIndex(devices, { id: cameraId });
    const nextCameraId = index === -1 ? _.get(devices[0], 'id') : (devices[index + 1] || devices[0]).id;

    if (uploadFile) {
      this.startQrcode();
      this.setState({ uploadFile: false });
      return;
    }

    if (resetCameraLoading || !this.html5QrCode) return;

    this.setState({ resetCameraLoading: true });
    this.setState(
      {
        cameraId: nextCameraId,
      },
      () => {
        this.html5QrCode.stop().then(ignore => {
          this.startQrcode();
          this.setState({ resetCameraLoading: false });
          const currentCamera = _.find(devices, { id: nextCameraId });
          if (currentCamera) {
            Toast.info(_l('切换至 %0', currentCamera.label), 2);
          }
        });
      },
    );
  };
  handleChangeSize = () => {
    const { scanShape, resetCameraLoading, uploadFile } = this.state;

    if (resetCameraLoading || !this.html5QrCode || uploadFile) return;

    this.setState({ resetCameraLoading: true });
    this.setState(
      {
        scanShape: scanShape === 'square' ? 'rectangle' : 'square',
      },
      () => {
        this.html5QrCode.stop().then(ignore => {
          this.startQrcode();
          this.setState({ resetCameraLoading: false });
        });
      },
    );
  };
  handleOpenUploadFile = () => {
    const { resetCameraLoading } = this.state;

    if (resetCameraLoading || !this.html5QrCode) return;

    this.html5QrCode
      .stop()
      .then(ignore => {
        this.html5QrCode.clear();
        this.setState({ uploadFile: true });
      })
      .catch(err => {});
  };
  handleScanFile = e => {
    if (e.target.files.length == 0) {
      return;
    }
    const imageFile = e.target.files[0];
    this.html5QrCode
      .scanFile(imageFile, true)
      .then(this.handleScanSuccess)
      .catch(err => {
        alert(_l('未解析到二维码'), 3);
      });
  };
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
      qrbox: function (viewfinderWidth, viewfinderHeight) {
        if (scanShape === 'square') {
          const n = viewfinderWidth > viewfinderHeight ? viewfinderHeight : viewfinderWidth;
          const ratio = Math.floor(0.8 * n);
          return ratio < 250
            ? n < 250
              ? { width: n, height: n }
              : { width: 250, height: 250 }
            : { width: ratio, height: ratio };
        } else {
          return { width: viewfinderWidth - 20, height: 220 };
          // return { width: 330, height: 220 };
        }
      },
    };
    const { cameraId } = this.state;
    const defaultCameraConfig = {
      facingMode: 'environment',
    };
    const selectCameraConfig = {
      deviceId: { exact: cameraId },
    };
    const cameraConfig = cameraId ? selectCameraConfig : defaultCameraConfig;
    this.html5QrCode.start(cameraConfig, config, this.handleScanSuccess).catch(eror => {
      this.setState({
        isError: true,
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
        this.html5QrCode
          .stop()
          .then(ignore => {
            this.html5QrCode.clear();
            this.html5QrCode = null;
          })
          .catch(err => {});
      }
      this.setState({ cameraId: null });
    }
    this.setState({ isError: false, uploadFile: false });
  }
  render() {
    const { visible, isError, devices, scanShape, uploadFile } = this.state;
    const { className, disablePhoto, children } = this.props;
    return (
      <Fragment>
        <div className={className} onClick={this.handleScanCode}>
          {children}
        </div>
        <Popup visible={visible} onClose={this.handleClose} className="mobileModal full">
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
                <div id={`qrcodeWrapper-${this.id}`} className={cx('qrcodeWrapper flex', { hide: uploadFile })}></div>
              )}
              {!isError && (
                <Fragment>
                  <div className="Absolute" style={{ left: '5%', top: '5%' }} onClick={this.handleChangeCamera}>
                    <Icon className="Font28 White" icon="switch_camera" />
                  </div>
                  <div className="Absolute" style={{ left: '15%', top: '5%' }} onClick={this.handleChangeSize}>
                    <Icon
                      className={cx('Font28', uploadFile ? 'Gray_9e' : 'White')}
                      icon={scanShape === 'square' ? 'get_bigger' : 'put_away'}
                    />
                  </div>
                  {!disablePhoto && (
                    <div className="Absolute" style={{ left: '25%', top: '5.5%' }} onClick={this.handleOpenUploadFile}>
                      <Icon className="Font26 White" icon="insert_photo_21" />
                    </div>
                  )}
                </Fragment>
              )}
              <div className="Absolute" style={{ right: '5%', top: '5%' }} onClick={this.handleClose}>
                <Icon className={cx('Font28', isError ? 'Gray_9e' : 'White')} icon="closeelement-bg-circle" />
              </div>
              {uploadFile && (
                <QrInputWrap className="valignWrapper justifyContentCenter Relative">
                  {_l('上传图片进行识别')}
                  <input type="file" accept="image/*" onChange={this.handleScanFile} />
                </QrInputWrap>
              )}
            </div>
          </div>
        </Popup>
      </Fragment>
    );
  }
}
