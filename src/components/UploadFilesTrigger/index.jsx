import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Popover } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import Icon from 'ming-ui/components/Icon';
import UploadFiles from 'src/components/UploadFiles';
import { generateRandomPassword } from 'src/utils/core/string';
import './index.less';

const ClickAwayable = ClickAway;

export default class UploadFilesTrigger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      dragVisible: false,
      isComplete: true,
    };
    this.id = props.id || generateRandomPassword(16);
  }
  componentDidMount() {
    if (this.props.popupVisible) {
      this.setTriggerPanelVisible(true);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (_.isBoolean(this.props.popupVisible) && this.props.popupVisible !== prevProps.popupVisible) {
        this.setTriggerPanelVisible(this.props.popupVisible);
      }
    }
  }
  componentWillUnmount() {
    this.handleCancelDetection();
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
  isFileDrag = e => {
    const dataTransfer = (e.originalEvent || e).dataTransfer;
    const types = Array.from(dataTransfer?.types || []);
    const items = Array.from(dataTransfer?.items || []);

    return types.includes('Files') || items.some(item => item.kind === 'file');
  };
  dragenter = e => {
    if (!this.isFileDrag(e)) return;

    this.lastenter = e.target;
    this.show(e);
  };
  dragleave = e => {
    if (!this.isFileDrag(e)) return;

    if (this.lastenter === e.target) {
      this.hide(e);
    }
  };
  drop = e => {
    if (!this.isFileDrag(e)) return;

    this.hide(e);
  };
  dragover = e => {
    if (!this.isFileDrag(e)) return;

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
          className="textSecondary pointer Font18 hoverColorPrimary"
          onClick={this.setTriggerPanelVisible.bind(this, false)}
        />
      </div>
    );
  }
  renderBtns() {
    return (
      <div className="panelBtns flexRow valignWrapper">
        <Button
          color="primary"
          variant="link"
          style={{ '--hap-control-height': '32px' }}
          onClick={this.handleCancel.bind(this)}
        >
          {_l('取消')}
        </Button>
        <Button type="primary" style={{ '--hap-control-height': '32px' }} onClick={this.handleOk.bind(this)}>
          {_l('确定')}
        </Button>
      </div>
    );
  }
  renderPanel(uploadFilesProps) {
    const { specialFilter } = this.props;
    const id = `dropTextarea-${this.id}`;
    const { isComplete } = this.state;
    const { onUploadComplete, ...otherProps } = uploadFilesProps;
    const { temporaryData, kcAttachmentData } = otherProps;
    const isData = !!(temporaryData.length + kcAttachmentData.length);
    return (
      <ClickAwayable
        specialFilter={specialFilter}
        onClickAwayExceptions={[
          '.folderSelectDialog',
          '.addLinkFileDialog',
          '.attachmentsPreview',
          '.UploadFilesTriggerPanel',
          '.triggerTraget',
          '.pcUploadModal',
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
          <div className="textTertiary flexRow valignWrapper">
            <Icon icon="view-upload" className="mRight10 Font24" />
            <span className="Font14">{_l('拖拽至此 或 粘贴剪贴板文件')}</span>
          </div>
        </div>
        <textarea
          readOnly
          id={id}
          className={'dropTextarea'}
          onKeyDown={event => {
            if (event.key === 'Enter' && isData && isComplete) {
              event.preventDefault();
              this.handleOk();
            }
          }}
          ref={textarea => {
            this.textarea = textarea;
          }}
        ></textarea>
        <div className="dragPanel flexRow valignWrapper Font18 textSecondary">{_l('拖拽至此处上传文件')}</div>
      </ClickAwayable>
    );
  }
  render() {
    const { visible } = this.state;
    const {
      children,
      getPopupContainer,
      offset,
      noWrap,
      buttonTrigger,
      destroyPopupOnHide = false,
      ...uploadFilesProps
    } = this.props;
    return (
      <Popover
        open={visible}
        onOpenChange={open => {
          if (!noWrap && open) {
            this.setTriggerPanelVisible(true);
          }
        }}
        destroyOnHidden={destroyPopupOnHide}
        classNames={{ root: 'UploadFilesTriggerWrap' }}
        noPadding
        trigger="click"
        placement="bottomLeft"
        content={this.renderPanel(uploadFilesProps)}
        align={{ offset: offset || [2, 2] }}
        getPopupContainer={getPopupContainer}
      >
        {noWrap || buttonTrigger ? children : <div className="triggerTraget">{children}</div>}
      </Popover>
    );
  }
}
