import React, { createRef, Component, Fragment } from 'react';
import styled from 'styled-components';
import { Button } from 'ming-ui';
import { Popup } from 'antd-mobile';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import * as SignaturePad from 'signature_pad/dist/signature_pad';
import axios from 'axios';
import cx from 'classnames';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import { browserIsMobile, getToken } from 'src/util';
import accountSettingAjax from 'src/api/accountSetting';
import { CardButton } from 'src/pages/worksheet/components/Basics.jsx';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

const ClickAwayable = createDecoratedComponent(withClickAway);

const SignatureBox = styled.div`
  cursor: pointer;
  height: ${props => props.autoHeight && 'auto !important'};
  .addSignature {
    color: #757575;
    line-height: 36px;
    &:hover {
      color: #2196f3;
    }
  }
`;

const SignaturePopup = styled.div`
  width: 480px;
  min-width: 200px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    span {
      font-size: 15px;
    }
    i {
      cursor: pointer;
      color: #757575;
      &:hover {
        color: #2196f3;
      }
    }
  }
  .signatureCanvas {
    width: 100%;
    height: 200px;
    display: block;
  }
`;
const SignatureWrap = styled.div`
  position: relative;
  height: 130px;
  background-color: #fff;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.12);
    .remove {
      visibility: visible;
    }
  }
  .remove {
    position: absolute;
    right: -12px;
    top: -12px;
    visibility: hidden;
  }
`;
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid #ddd;
  padding: 11px 20px;
  .clearSignature {
    margin-right: 20px;
    color: #9e9e9e;
    cursor: pointer;
  }
  .lastSignature {
    margin: 0 auto 0 0;
  }
`;

export default class Signature extends Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.$ref = createRef();
    this.popupDirection = 'bottom';
  }

  state = {
    isEdit: false,
    popupVisible: false,
    lastInfo: '',
  };

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.flag !== this.props.flag && !nextProps.value) {
      this.setState({ isEdit: false, lastInfo: '' });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.onlySignature && !prevProps.visible && this.props.visible) {
      setTimeout(this.initCanvas, 100);
    }
  }

  getPopupDirection = () => {
    const { current } = this.$ref;
    if (!current) return;
    const $newRecordWrap = document.querySelector('.workSheetNewRecord .mui-dialog-body');
    if (!$newRecordWrap) return;
    const { bottom, top } = current.getBoundingClientRect();
    const { bottom: wrapBottom, top: wrapTop } = $newRecordWrap.getBoundingClientRect();
    if (wrapBottom - bottom < 360 && top - wrapTop > 360) {
      this.popupDirection = 'top';
    } else {
      this.popupDirection = 'bottom';
    }
  };

  clickEvent = e => {
    this.setState({
      popupVisible: false,
      isEdit: false,
    });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  showPopup = visible => {
    this.getPopupDirection();
    if (visible) {
      setTimeout(this.initCanvas, 100);
    }
  };

  closePopup = () => {
    this.setState({ popupVisible: false, isEdit: false });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  initCanvas = () => {
    const canvas = this.signature;

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

  saveSignature = event => {
    if (event) {
      event.stopPropagation();
    }

    if (this.state.lastInfo) {
      this.setState({ popupVisible: false });
      this.props.onChange(this.state.lastInfo.url);
      return;
    }

    const data = this.signaturePad.toDataURL('image/png');
    const { projectId, appId, worksheetId } = this.props;

    getToken([{ bucket: 4, ext: '.png' }], 10, {
      projectId,
      appId,
      worksheetId,
    }).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${btoa(res[0].key)}`;
        axios
          .post(url, data.split(',')[1], {
            headers: {
              'Content-Type': 'application/octet-stream',
              Authorization: `UpToken ${res[0].uptoken}`,
            },
          })
          .then(() => {
            this.setState({ popupVisible: false });

            if (window.isPublicWorksheet || _.get(window, 'shareState.isPublicWorkflowRecord')) {
              this.props.onChange(res[0].url);
            } else {
              accountSettingAjax.editSign({ url: res[0].url }).then(result => {
                if (result) {
                  this.props.onChange(res[0].url);
                }
              });
            }
          })
          .catch(error => {
            console.log(error);
            alert(_l('保存失败'), 2);
          });
      }
    });
  };

  useLastSignature = () => {
    accountSettingAjax.getSign().then(res => {
      if (!res.url) return alert(_l('暂无签名记录'), 3);
      this.setState({ isEdit: true, lastInfo: res });
    });
  };

  clear = () => {
    this.signaturePad.clear();
    this.setState({ isEdit: false, lastInfo: '' }, () => {
      setTimeout(() => {
        this.initCanvas();
      }, 100);
    });
  };

  removeSignature = e => {
    e.stopPropagation();
    this.props.onChange('');
    this.setState({ isEdit: false, lastInfo: '' });
  };

  getAlign = () => {
    if (this.popupDirection === 'bottom') {
      return {
        points: ['tl', 'bl'],
        offset: [-12, 3],
        overflow: { adjustX: true, adjustY: true },
      };
    }
    return {
      points: ['bl', 'tl'],
      offset: [-12, -3],
      overflow: { adjustX: true, adjustY: true },
    };
  };

  preview = e => {
    e.nativeEvent.stopImmediatePropagation();
    const { value } = this.props;

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

  openSignature = () => {
    const { controlId, formData } = this.props;
    const control = _.find(formData, { controlId }) || {};
    if (!window.MDJS || !window.MDJS.signature) return;
    window.MDJS.signature({
      control,
      success: res => {
        var { url } = res.signature;
        this.props.onChange(url);
      },
      cancel: res => {
        const { errMsg } = res;
        if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
          window.nativeAlert(JSON.stringify(res));
        }
      },
    });
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  renderFooter() {
    const { advancedSetting: { uselast } = {} } = this.props;
    const { isEdit } = this.state;

    return (
      <Footer>
        {uselast === '1' && !(window.isPublicWorksheet || _.get(window, 'shareState.isPublicWorkflowRecord')) && (
          <div className="ThemeColor3 ThemeHoverColor2 pointer lastSignature" onClick={this.useLastSignature}>
            {_l('使用上次签名')}
          </div>
        )}
        {isEdit && (
          <div className="clearSignature" onClick={this.clear}>
            {_l('清除')}
          </div>
        )}
        <Button disabled={!isEdit} onClick={this.saveSignature} size="small">
          {_l('确认')}
        </Button>
      </Footer>
    );
  }

  renderSignature = () => {
    const { onlySignature, children, visible, popupContainer, destroyPopupOnHide, popupAlign } = this.props;
    const { popupVisible, lastInfo } = this.state;

    return browserIsMobile() ? (
      <Fragment>
        <div
          className="addSignature"
          onClick={e => {
            if (window.isMingDaoApp) {
              this.openSignature();
            } else {
              this.setState({ popupVisible: true });
              setTimeout(this.initCanvas, 500);
              e.nativeEvent.stopImmediatePropagation();
            }
          }}
        >
          <i className="icon-e-signature Font17"></i>
          <span className="mLeft5">{_l('添加签名')}</span>
        </div>

        <Popup visible={popupVisible} className="mobileModal topRadius">
          <div className="flexColumn leftAlign h100">
            <div className="flexRow pTop15 pLeft20 pRight20 pBottom8">
              <div className="Font18 Gray flex bold ellipsis">{_l('请在下方空白区域横向书写签名')}</div>
              <i className="icon-close Gray_9e Font20" onClick={this.closePopup}></i>
            </div>
            {lastInfo ? (
              <div className="signatureCanvas flex">
                <img src={lastInfo.url} className="w100 h100" />
              </div>
            ) : (
              <canvas
                ref={con => (this.signature = con)}
                id="signatureCanvas"
                className="signatureCanvas flex"
              ></canvas>
            )}
            {this.renderFooter()}
          </div>
        </Popup>
      </Fragment>
    ) : (
      <Trigger
        popupVisible={onlySignature ? visible : popupVisible}
        action={['click']}
        popupAlign={popupAlign || this.getAlign()}
        onPopupVisibleChange={this.showPopup}
        getPopupContainer={() => popupContainer || this.$ref.current}
        destroyPopupOnHide={destroyPopupOnHide}
        popup={
          <ClickAwayable onClickAway={this.clickEvent}>
            <SignaturePopup onClick={e => e.nativeEvent.stopImmediatePropagation()}>
              <div className="header">
                <span className="Gray">{_l('请在下方空白区域横向书写签名')}</span>
                <i onClick={this.closePopup} className="Font18 icon-close"></i>
              </div>
              {lastInfo ? (
                <div className="signatureCanvas">
                  <img src={lastInfo.url} className="w100 h100" />
                </div>
              ) : (
                <canvas id="signatureCanvas" ref={con => (this.signature = con)} className="signatureCanvas"></canvas>
              )}
              {this.renderFooter()}
            </SignaturePopup>
          </ClickAwayable>
        }
      >
        {!onlySignature ? (
          <div
            className="addSignature"
            onClick={e => {
              this.setState({ popupVisible: true });
              e.nativeEvent.stopImmediatePropagation();
            }}
          >
            <i className="icon-e-signature Font17"></i>
            <span className="mLeft5">{_l('添加签名')}</span>
          </div>
        ) : (
          children
        )}
      </Trigger>
    );
  };

  render() {
    const { disabled, onlySignature, value } = this.props;

    // 只读
    if (disabled) {
      return <SignatureWrap onClick={this.preview} style={{ backgroundImage: `url(${value})` }} />;
    }

    if (onlySignature) {
      return this.renderSignature();
    }

    return (
      <SignatureBox
        ref={this.$ref}
        autoHeight={!!value}
        className={cx('signature', { 'customFormControlBox ThemeHoverColor3': !value })}
      >
        {value ? (
          <SignatureWrap
            onClick={e => {
              value && this.preview(e);
              e.nativeEvent.stopImmediatePropagation();
            }}
            style={{ backgroundImage: `url(${value})` }}
          >
            <div className="remove" onClick={this.removeSignature}>
              <CardButton>
                <i className="icon icon-close" />
              </CardButton>
            </div>
          </SignatureWrap>
        ) : (
          this.renderSignature()
        )}
      </SignatureBox>
    );
  }
}
