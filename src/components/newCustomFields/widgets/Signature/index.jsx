import React, { createRef, Component, Fragment } from 'react';
import styled from 'styled-components';
import { Button, Dialog } from 'ming-ui';
import { Modal } from 'antd-mobile';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import previewAttachments from 'previewAttachments';
import * as SignaturePad from 'signature_pad/dist/signature_pad';
import axios from 'axios';
import cx from 'classnames';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import { browserIsMobile, getToken } from 'src/util';
import { Base64 } from 'js-base64';

const ClickAwayable = createDecoratedComponent(withClickAway);

const ModalWrap = styled(Modal)`
  height: 300px !important;
`;
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
    right: -8px;
    top: -8px;
    visibility: hidden;
    i {
      font-size: 18px;
      color: #757575;
    }
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
    signature: null,
    popupVisible: false,
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.value && this.state.signature) {
      this.setState({ signature: null, isEdit: false });
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
    this.setState({ popupVisible: false });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

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

  saveSignature = event => {
    event.stopPropagation();
    const data = this.signaturePad.toDataURL('image/png');
    this.setState({ popupVisible: false, signature: data });
    getToken([{ bucket: 4, ext: '.png' }]).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${Base64.encode(res[0].key)}`;
        axios
          .post(url, data.split(',')[1], {
            headers: {
              'Content-Type': 'application/octet-stream',
              Authorization: `UpToken ${res[0].uptoken}`,
            },
          })
          .then(({ data }) => {
            const { key = '' } = data || {};
            this.props.onChange(JSON.stringify({ bucket: 4, key: key }));
          })
          .catch(error => {
            console.log(error);
            alert(_l('保存失败'), 2);
          });
      }
    });
  };

  clear = () => {
    this.signaturePad.clear();
    this.setState({ isEdit: false });
  };

  removeSignature = e => {
    e.stopPropagation();
    this.props.onChange('');
    this.setState({ signature: null, isEdit: false });
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
    previewAttachments({
      attachments: [{ previewType: 1, ext: 'png', name: 'signature.png', previewAttachmentType: 'QINIU', path: value }],
      index: 0,
      callFrom: 'player',
      hideFunctions: ['editFileName'],
    });
  };

  renderFooter() {
    const { isEdit } = this.state;

    return (
      <Footer>
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
    const { popupVisible } = this.state;

    return browserIsMobile() ? (
      <Fragment>
        <div
          className="addSignature"
          onClick={e => {
            this.setState({ popupVisible: true });
            setTimeout(this.initCanvas, 500);
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          <i className="icon-e-signature Font17"></i>
          <span className="mLeft5">{_l('添加签名')}</span>
        </div>

        <ModalWrap popup visible={popupVisible} animationType="slide-up" className="mobileNewRecordDialog">
          <div className="flexColumn leftAlign h100">
            <div className="flexRow pTop15 pLeft20 pRight20 pBottom8">
              <div className="Font18 Gray flex bold ellipsis">{_l('请在下方空白区域书写签名')}</div>
              <i className="icon-close Gray_9e Font20" onClick={this.closePopup}></i>
            </div>
            <canvas id="signatureCanvas" className="signatureCanvas flex"></canvas>
            {this.renderFooter()}
          </div>
        </ModalWrap>
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
                <span className="Gray">{_l('请在下方空白区域书写签名')}</span>
                <i onClick={this.closePopup} className="Font18 icon-close"></i>
              </div>
              <canvas id="signatureCanvas" className="signatureCanvas"></canvas>
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
    const { disabled, onlySignature } = this.props;
    const value = /(\.jpeg|\.png|\.jpg)$/.test((this.props.value || '').replace(/\?.*/g, '')) ? this.props.value : '';
    const { signature } = this.state;

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
        autoHeight={!!signature || !!value}
        className={cx('signature', { 'customFormControlBox ThemeHoverColor3': !signature && !value })}
      >
        {signature || value ? (
          <SignatureWrap
            onClick={e => {
              value && this.preview(e);
              e.nativeEvent.stopImmediatePropagation();
            }}
            style={{ backgroundImage: `url(${signature || value})` }}
          >
            <div className="remove" onClick={this.removeSignature}>
              <i className="icon-minus-square" />
            </div>
          </SignatureWrap>
        ) : (
          this.renderSignature()
        )}
      </SignatureBox>
    );
  }
}
