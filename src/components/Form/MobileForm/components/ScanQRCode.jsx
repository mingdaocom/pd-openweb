import React, { Component, Fragment } from 'react';
import { Dialog, Popup, Toast } from 'antd-mobile';
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
    background-color: var(--color-background-tertiary);
  }
`;

const QrInputWrap = styled.div`
  color: var(--color-background-primary);
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

const ShadeRegion = styled.div`
  position: absolute;
  border-width: ${props => props.borderWidth};
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.48);
  box-sizing: border-box;
  inset: 0px;

  .horizontalBoundary {
    position: absolute;
    background-color: rgb(255, 255, 255);
    width: 40px;
    height: 5px;
  }
  .verticalBoundary {
    position: absolute;
    background-color: rgb(255, 255, 255);
    width: 5px;
    height: 45px;
  }
`;

const JsQRWrapper = styled.div`
  position: relative;
  width: 100vw;
  .jsQRVideo {
    display: block;
    width: 100%;
  }
  .jsQRCanvas {
    display: none;
  }
`;

const ZxingWrapper = styled.div`
  position: relative;
  video {
    display: block;
    width: 100%;
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
      borderWidth: 0,
      loadShadeRegion: false,
    };
    this.id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.html5QrCode = null;

    // jsQR参数
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.animationFrame = null;
    this.jsQRComponent = null;
    // Zxing参数
    this.zxingVideoRef = React.createRef();
    this.zxingComponent = null;
    this.zxingCodeReader = null;
  }
  componentDidMount() {
    // if (window.isDingTalk || window.isWeLink || isWx || window.isWxWork || window.isFeiShu || window.customScan) {
    //   return;
    // }
    // this.loadBuildInScan(false);
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
  // 加载内置的扫码
  loadBuildInScan = () => {
    const { scantype } = this.props;
    switch (scantype) {
      case '2':
        import('jsqr').then(data => {
          this.jsQRComponent = data?.default;
          this.startJsQRCamera();
        });
        break;
      case '1':
        import('@zxing/library').then(data => {
          this.zxingComponent = data;
          this.startZxingLibraryCamera();
        });
        break;
      default:
        import('html5-qrcode').then(data => {
          this.qrCodeComponent = data;
          this.handleScanQRCode();
        });
    }
  };
  handleScanCode = () => {
    // 嵌入第三方APP SDK扫码
    if (window.customScan && typeof window.customScan === 'function') {
      window.customScan({
        success: res => {
          this.props.onScanQRCodeResult(res);
        },
      });
      return;
    }
    const { projectId, control = {} } = this.props;

    compatibleMDJS(
      'scanQRCode',
      {
        control,
        keepScan: control.enumDefault === 2,
        scanType: this.getScanType(), // 可选, 默认为["barCode", "qrCode"]
        albumEnabled: control.strDefault === '10' ? 0 : 1, // 可选, 默认为1:开启相册, 0:禁用相册
        manualInput: _.get(control, ' advancedSetting.dismanual') === '1' ? 0 : 1, // 可选, 默认为1:允许手动输入, 0:禁止手动输入
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
              this.loadBuildInScan();
            }
          });
          return;
        }

        if (window.isWxWork) {
          handleTriggerEvent(this.handleWxScanQRCode, bindWxWork(projectId), errType => {
            if (errType) {
              this.loadBuildInScan();
            }
          });
          return;
        }

        if (window.isFeiShu) {
          handleTriggerEvent(this.handleFeishuScanQRCode, bindFeishu(projectId), errType => {
            if (errType) {
              this.loadBuildInScan();
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
            .catch(() => {
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

        this.loadBuildInScan();
      },
    );
  };
  disableEnvironment = () => {
    const disableEnv = location.protocol === 'http:' && location.hostname !== 'localhost';

    if (disableEnv) {
      Dialog.alert({
        content: _l('浏览器平台仅https环境支持调用摄像头api'),
        confirmText: _l('确定'),
      });
    }

    return disableEnv;
  };
  handleScanQRCode = () => {
    if (this.disableEnvironment()) return;

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
  handleClose = async () => {
    await this.clearQrcode();

    this.setState({
      visible: false,
    });
  };
  handleScanSuccess = decodedText => {
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
        this.html5QrCode.stop().then(() => {
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
        this.html5QrCode.stop().then(() => {
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
      .then(() => {
        this.html5QrCode.clear();
        this.setState({ uploadFile: true });
      })
      .catch(() => {});
  };
  handleScanFile = e => {
    if (e.target.files.length == 0) {
      return;
    }
    const imageFile = e.target.files[0];
    this.html5QrCode
      .scanFile(imageFile, true)
      .then(this.handleScanSuccess)
      .catch(() => {
        alert(_l('未解析到二维码'), 3);
      });
  };
  getCameras() {
    const { Html5Qrcode } = this.qrCodeComponent;
    return new Promise(reslove => {
      Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
          this.setState({ devices }, reslove);
        }
      });
    });
  }
  initQrcode() {
    const { Html5Qrcode } = this.qrCodeComponent;
    this.html5QrCode = new Html5Qrcode(`qrcodeWrapper-${this.id}`, {
      formatsToSupport: this.formatsToSupport,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
    });
    this.startQrcode();
  }
  startQrcode() {
    const { scanShape } = this.state;
    const config = {
      fps: 30,
      aspectRatio: 1,
      rememberLastUsedCamera: true,
      disableFlip: true, // 优化前置摄像头扫描
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
      qrbox: function (viewfinderWidth, viewfinderHeight) {
        const MIN_SIZE = 50;
        if (scanShape === 'square') {
          const n = viewfinderWidth > viewfinderHeight ? viewfinderHeight : viewfinderWidth;
          const ratio = Math.floor(0.8 * n);
          let size;

          if (ratio < 250) {
            size = n < 250 ? n : 250;
          } else {
            size = ratio;
          }
          size = Math.max(size, MIN_SIZE); // 强制不小于 50
          return { width: size, height: size };
        } else {
          const width = Math.max(viewfinderWidth - 20, MIN_SIZE);
          const height = 220;
          return { width, height };
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
    this.html5QrCode.start(cameraConfig, config, this.handleScanSuccess).catch(() => {
      this.setState({
        isError: true,
      });
    });
  }
  clearQrcode = async () => {
    if (this.html5QrCode) {
      const state = this.html5QrCode.getState();
      try {
        // 扫码中
        if (state === 2) {
          await this.html5QrCode.stop();
        }
        this.html5QrCode?.clear();
        this.html5QrCode = null;
      } catch (error) {
        console.log('清除html5QRCode异常：', error);
      }
    }
    if (this.jsQRComponent) {
      this.stopCamera();
    }
    if (this.zxingComponent) {
      this.stopZxing();
    }
    this.setState({ isError: false, uploadFile: false, loadShadeRegion: false, cameraId: null });
  };
  waitForElementReady = (ref, errorMessage = '元素未挂载') => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 20;
      let attempts = 0;

      const check = () => {
        const el = ref.current;
        if (el) {
          resolve(el);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(check, 50);
        } else {
          reject(new Error(errorMessage));
        }
      };

      check();
    });
  };

  // JSQR二维码
  startJsQRCamera = async () => {
    if (this.disableEnvironment()) return;

    this.setState(
      {
        visible: true,
      },
      () => {
        requestAnimationFrame(() => {
          this.waitForElementReady(this.videoRef)
            .then(this.initCamera)
            .catch(error => {
              console.error('摄像头初始化失败:', error);
              this.setState({ isError: true });
            });
        });
      },
    );
  };

  initCamera = async video => {
    this.calculateBorderWidth(video);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
    if (!video) return;
    video.srcObject = stream;
    video.setAttribute('playsinline', true); // iOS 兼容
    await video.play();
    this.tick();
  };

  stopCamera = () => {
    const stream = this.videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    cancelAnimationFrame(this.animationFrame);
  };

  tick = () => {
    const video = this.videoRef.current;
    const canvas = this.canvasRef.current;

    // 视频已准备好播放
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = this.jsQRComponent(imageData.data, canvas.width, canvas.height);
      if (code) {
        this.handleScanSuccess(code.data);
        return;
      }
    }

    this.animationFrame = requestAnimationFrame(this.tick);
  };

  // Zxing
  startZxingLibraryCamera = () => {
    if (this.disableEnvironment()) return;

    this.setState(
      {
        visible: true,
      },
      () => {
        requestAnimationFrame(() => {
          this.waitForElementReady(this.zxingVideoRef)
            .then(this.zxingInit)
            .catch(error => {
              console.error('摄像头初始化失败:', error);
              this.setState({ isError: true });
            });
        });
      },
    );
  };

  zxingInit = video => {
    this.calculateBorderWidth(video, true);

    const { BrowserMultiFormatReader, BarcodeFormat } = this.zxingComponent;
    const ALLOWED_FORMATS = [
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_8,
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF,
      BarcodeFormat.RSS_14,
      BarcodeFormat.RSS_EXPANDED,
      BarcodeFormat.UPC_EAN_EXTENSION,
    ];
    this.zxingCodeReader = new BrowserMultiFormatReader();

    this.zxingCodeReader
      .decodeFromVideoDevice(null, video, result => {
        if (result) {
          const format = result.getBarcodeFormat();
          if (!ALLOWED_FORMATS.includes(format)) {
            return;
          }

          this.handleScanSuccess(result.getText());
        }
      })
      .then(() => {
        // 尝试相机连续自动对焦
        if (video && video.srcObject instanceof MediaStream) {
          const track = video.srcObject.getVideoTracks()[0];

          if (track) {
            const constraints = {
              focusDistance: { ideal: 0 },
              advanced: [{ zoom: { ideal: 0 } }],
            };

            track.applyConstraints(constraints).catch(() => {
              // 忽略失败，设备不支持可能会报错
            });
          }
        }
      })
      .catch(() => {
        this.handleClose();
      });
  };

  stopZxing = () => {
    if (this.zxingCodeReader) {
      this.zxingCodeReader.reset();
    }
  };

  calculateBorderWidth = (video, isBarcode = false) => {
    if (!video) return;

    const updateBorders = () => {
      const containerWidth = video.clientWidth;
      const containerHeight = video.clientHeight;

      let scanBoxWidth, scanBoxHeight;

      if (isBarcode) {
        // 条形码：长方形，宽度较大，高度较小
        scanBoxWidth = containerWidth * 0.8;
        scanBoxHeight = scanBoxWidth * 0.5;
      } else {
        // 二维码：正方形
        const size = Math.min(containerWidth, containerHeight) * 0.8;
        scanBoxWidth = scanBoxHeight = size;
      }

      const verticalBorder = (containerHeight - scanBoxHeight) / 2;
      const horizontalBorder = (containerWidth - scanBoxWidth) / 2;

      this.setState({
        loadShadeRegion: true,
        borderWidth: `${verticalBorder}px ${horizontalBorder}px`,
      });
    };

    if (video.readyState >= video.HAVE_METADATA) {
      updateBorders();
    } else {
      video.onloadedmetadata = () => {
        updateBorders();
      };
    }
  };

  renderShadeRegion = () => {
    const { borderWidth } = this.state;

    return (
      <ShadeRegion borderWidth={borderWidth}>
        <div className="horizontalBoundary" style={{ top: -5, left: 0 }}></div>
        <div className="horizontalBoundary" style={{ top: -5, right: 0 }}></div>
        <div className="horizontalBoundary" style={{ bottom: -5, left: 0 }}></div>
        <div className="horizontalBoundary" style={{ bottom: -5, right: 0 }}></div>
        <div className="verticalBoundary" style={{ top: -5, left: -5 }}></div>
        <div className="verticalBoundary" style={{ bottom: -5, left: -5 }}></div>
        <div className="verticalBoundary" style={{ top: -5, right: -5 }}></div>
        <div className="verticalBoundary" style={{ bottom: -5, right: -5 }}></div>
      </ShadeRegion>
    );
  };

  render() {
    const { visible, isError, scanShape, uploadFile, loadShadeRegion } = this.state;
    const { className, disablePhoto, children, scantype = '0' } = this.props;

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
                <Fragment>
                  {/* 二维码、条形码 */}
                  {scantype === '0' && (
                    <div
                      id={`qrcodeWrapper-${this.id}`}
                      className={cx('qrcodeWrapper flex', { hide: uploadFile })}
                    ></div>
                  )}
                  {/* 条形码 */}
                  {scantype === '1' && (
                    <ZxingWrapper>
                      <video ref={this.zxingVideoRef} />
                      {loadShadeRegion && this.renderShadeRegion()}
                    </ZxingWrapper>
                  )}
                  {/* 二维码 */}
                  {scantype === '2' && (
                    <JsQRWrapper>
                      <video ref={this.videoRef} className="jsQRVideo" muted={true} />
                      <canvas ref={this.canvasRef} className="jsQRCanvas" />
                      {loadShadeRegion && this.renderShadeRegion()}
                    </JsQRWrapper>
                  )}
                </Fragment>
              )}

              {/* 调整摄像头、修改大小、上传 */}
              {!isError && scantype === '0' && (
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
              {/* 关闭扫码 */}
              <div className="Absolute" style={{ right: '5%', top: '5%' }} onClick={this.handleClose}>
                <Icon className={cx('Font28', isError ? 'Gray_9e' : 'White')} icon="cancel" />
              </div>
              {/* 上传图片 */}
              {scantype === '0' && uploadFile && (
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
