import React, { Component } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import Icon from 'ming-ui/components/Icon';
import Button from 'ming-ui/components/Button';
import UploadFiles from 'src/components/UploadFiles';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import _ from 'lodash';
import './index.less';
import { getRandomString } from 'src/util';

const ClickAwayable = createDecoratedComponent(withClickAway);

const builtinPlacements = {
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

export default class UploadFilesTrigger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      dragVisible: false,
      isComplete: true,
    };
    this.id = props.id || getRandomString(16);
  }
  componentDidMount() {
    if (this.props.popupVisible) {
      this.setTriggerPanelVisible(true);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.popupVisible) {
      this.setTriggerPanelVisible(true);
    }
  }
  show = e => {
    e.preventDefault();
    const $el = $(`#UploadFilesTriggerPanel${this.id}`);
    $el.addClass('drag');
  };
  hide = e => {
    e.preventDefault();
    const $el = $(`#UploadFilesTriggerPanel${this.id}`);
    $el.removeClass('drag');
  };
  dragenter = e => {
    this.lastenter = e.target;
    this.show(e);
  };
  dragleave = e => {
    if (this.lastenter === e.target) {
      this.hide(e);
    }
  };
  drop = e => {
    this.hide(e);
  };
  dragover = e => {
    this.show(e);
    return false;
  };
  handleDetection() {
    $(document).on({
      dragenter: this.dragenter,
      dragleave: this.dragleave,
      drop: this.drop,
      dragover: this.dragover,
    });
  }
  handleCancelDetection() {
    $(document).off({
      dragenter: this.dragenter,
      dragleave: this.dragleave,
      drop: this.drop,
      dragover: this.dragover,
    });
  }
  setTriggerPanelVisible(visible) {
    if (!visible && this.props.onClose) {
      this.props.onClose();
    }
    visible ? this.handleDetection() : this.handleCancelDetection();
    this.setState(
      {
        visible: visible,
      },
      () => {
        visible && this.handleFocus();
      },
    );
  }
  handleCancel() {
    this.props.onCancel && this.props.onCancel();
    this.setTriggerPanelVisible(false);
  }
  handleOk() {
    this.props.onOk && this.props.onOk();
    this.setTriggerPanelVisible(false);
  }
  handleFocus() {
    this.textarea && this.textarea.focus();
  }
  renderHeader() {
    return (
      <div className="panelHeader flexRow valignWrapper Font15">
        <div className="flex">
          <span>{_l('添加附件')}</span>
        </div>
        <Icon
          icon="close"
          className="Gray_75 pointer Font18 ThemeHoverColor3"
          onClick={this.setTriggerPanelVisible.bind(this, false)}
        />
      </div>
    );
  }
  renderBtns() {
    return (
      <div className="panelBtns flexRow valignWrapper">
        <Button type="link" size="small" onClick={this.handleCancel.bind(this)}>
          {_l('取消')}
        </Button>
        <Button type="primary" size="small" onClick={this.handleOk.bind(this)}>
          {_l('确定')}
        </Button>
      </div>
    );
  }
  renderPanel(uploadFilesProps) {
    const id = `dropTextarea-${this.id}`;
    const { isComplete } = this.state;
    const { onUploadComplete, ...otherProps } = uploadFilesProps;
    const { temporaryData, kcAttachmentData } = otherProps;
    const isData = !!(temporaryData.length + kcAttachmentData.length);
    return (
      <ClickAwayable
        component="div"
        onClickAwayExceptions={[
          '#folderSelectDialog_container',
          '#addLinkFileDialog_container',
          '.attachmentsPreview',
          '.UploadFilesTriggerPanel',
          '.triggerTraget',
        ]}
        onClickAway={this.setTriggerPanelVisible.bind(this, false)}
        id={`UploadFilesTriggerPanel${this.id}`}
        className={cx('UploadFilesTriggerPanel flexColumn', { compatibilityIe: 'ActiveXObject' in window })}
        style={window.innerWidth < 480 ? { width: window.innerWidth - 20 } : {}}
        onClick={this.handleFocus.bind(this)}
        onMouseEnter={this.handleFocus.bind(this)}
      >
        {this.renderHeader()}
        {isData ? this.renderBtns() : null}
        <UploadFiles
          {...otherProps}
          dropPasteElement={id}
          onUploadComplete={isComplete => {
            onUploadComplete && onUploadComplete(isComplete);
            this.setState({ isComplete });
          }}
        />
        <div
          className={cx('panelContent flexRow valignWrapper', {
            hide: isData || !isComplete,
          })}
        >
          <div className="Gray_9e flexRow valignWrapper">
            <Icon icon="view-upload" className="mRight10 Font24" />
            <span className="Font14">{_l('拖拽至此 或 粘贴剪贴板文件')}</span>
          </div>
        </div>
        <textarea
          readOnly
          id={id}
          className={'dropTextarea'}
          ref={textarea => {
            this.textarea = textarea;
          }}
        ></textarea>
        <div className="dragPanel flexRow valignWrapper Font18 Gray_75">{_l('拖拽至此处上传文件')}</div>
      </ClickAwayable>
    );
  }
  render() {
    const { visible } = this.state;
    const { children, getPopupContainer, offset, noWrap, destroyPopupOnHide, ...uploadFilesProps } = this.props;
    return (
      <Trigger
        popupVisible={visible}
        onPopupVisibleChange={!noWrap ? this.setTriggerPanelVisible.bind(this, true) : () => {}}
        destroyPopupOnHide={destroyPopupOnHide}
        popupClassName="UploadFilesTriggerWrap"
        action={['click']}
        popupPlacement="bottomLeft"
        builtinPlacements={builtinPlacements}
        popup={this.renderPanel(uploadFilesProps)}
        popupAlign={{ offset: offset || [2, 2], overflow: { adjustX: 2, adjustY: 1 } }}
        getPopupContainer={getPopupContainer}
      >
        {noWrap ? children : <div className="triggerTraget">{children}</div>}
      </Trigger>
    );
  }
}
