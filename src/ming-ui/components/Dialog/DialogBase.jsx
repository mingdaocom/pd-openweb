import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import PropTypes from 'prop-types';
import '../less/Dialog.less';

const dialogContainerPadding = 32;

class DialogBase extends Component {
  static propTypes = {
    /**
     * 弹窗叠弹窗错位
     */
    dislocate: PropTypes.bool,
    /**
     * 关闭弹窗的回调
     */
    onClose: PropTypes.func,
    /**
     * 大层类名
     */
    dialogClasses: PropTypes.string,
    /**
     * 对话框类名
     */
    className: PropTypes.string,
    /**
     * 对话框样式
     */
    style: PropTypes.objectOf(PropTypes.string),
    /**
     * 定位类型（默认居中；fixed：填充高度；scroll：外部滚动）
     */
    type: PropTypes.string,
    /**
     * 确认对话框类型（默认无；success：成功；danger：警告）
     */
    confirm: PropTypes.string,
    /**
     * 内容区域
     */
    children: PropTypes.node,
    /**
     * 是否添加遮罩层
     */
    overlay: PropTypes.bool,
    /**
     * 遮罩层是否可关闭
     */
    overlayClosable: PropTypes.bool,
    /**
     * 对话框的可见性
     */
    visible: PropTypes.bool,
    /**
     * 设置body内容自动根据高度滚动
     */
    autoScrollBody: PropTypes.bool,
    /**
     * 是否填充到浏览器最大高度
     */
    fill: PropTypes.bool,
    /**
     * 对话框的对齐方式
     */
    align: PropTypes.oneOf(['top', 'center', 'bottom']),
    /**
     * 对话框的宽度
     */
    size: PropTypes.oneOf(['default', 'medium', 'large', 'huge']),
    /**
     * 对话框的宽度
     */
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * 对话框的最大高度
     */
    maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * 触发刷新（当值发生变化时，重新渲染 Dialog）
     */
    updateTrigger: PropTypes.any,
    /**
     * 是否启用动画
     */
    anim: PropTypes.bool,
  };

  static defaultProps = {
    onOk: () => {},
    onClose: () => {},
    dialogClasses: '',
    className: '',
    overlay: true,
    align: 'center',
    overlayClosable: true,
    autoScrollBody: false,
    fill: false,
    updateTrigger: null,
    maxHeight: 1000,
    anim: false,
  };

  constructor(props) {
    super(props);
    let dislocateIndex = 1;

    if (!this.target) {
      this.target = document.createElement('div');
    }

    if (this.props.dislocate) {
      window.dislocateCount = (window.dislocateCount || 0) + 1;
      dislocateIndex = window.dislocateCount;
    }

    this.state = { dislocateIndex };
    this.dialogId = Math.random();
    document.body.appendChild(this.target);
  }

  componentDidMount() {
    window.addEventListener('resize', this.autoPosition);
    this.autoPosition();
    if (window.closeFns) {
      window.closeindex = (window.closeindex || 0) + 1;
      this.id = Math.random() && Math.random();
      window.closeFns[this.id] = {
        id: this.id,
        index: window.closeindex,
        fn: this.props.onClose,
      };
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.type !== this.props.type) {
      this.autoPosition();
    }
  }

  componentDidUpdate() {
    this.autoPosition();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.autoPosition);

    if (this.props.dislocate && window.dislocateCount) {
      window.dislocateCount = window.dislocateCount - 1;
    }

    if (this.target) {
      document.body.removeChild(this.target);
      this.target = null;
    }

    if (window.closeFns) {
      delete window.closeFns[this.id];
    }
  }

  getZIndex() {
    const dialog = [...document.querySelectorAll('.mui-dialog-container')].pop();
    if (!dialog || typeof window.getComputedStyle !== 'function') {
      return;
    }
    let zIndex;
    try {
      zIndex = parseInt(window.getComputedStyle(dialog).zIndex, 10) + 100;
    } catch (err) {
      console.log(err);
    }
    return zIndex;
  }

  autoPosition = () => {
    if (this._dialog) {
      const windowHeight = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
      const propsMaxHeight = parseInt(this.props.maxHeight, 10);
      let maxHeight = windowHeight;
      if (this.props.type !== 'fixed' && (maxHeight > propsMaxHeight || this.props.type === 'scroll')) {
        maxHeight = propsMaxHeight;
      }

      // reset
      this._dialog.style.maxHeight = 'none';
      this._dialog.style.height = 'auto';
      this._ghost.style.height = 'auto';

      if (this.props.type !== 'scroll') {
        this._dialog.style.maxHeight = `${maxHeight}px`;
      }
      if (this.props.type === 'fixed' || !this.props.type) {
        this._dialog.style.maxHeight = `${maxHeight - dialogContainerPadding * 2}px`;
      }

      if (this.props.type !== 'fixed' && this._ghost) {
        this._ghost.style.height = `${windowHeight - dialogContainerPadding * 2}px`;
      }

      if (this.props.type === 'fixed') {
        this._dialog.style.height = `${windowHeight - dialogContainerPadding * 2}px`;
      }

      if (this.props.width) {
        let dialogWidth = parseInt(this.props.width, 10);
        this._dialog.style.width = `${dialogWidth}px`;
      }
    }
    this.setDislocate();
  };

  setDislocate = () => {
    const { dislocateIndex } = this.state;
    const windowWidth = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
    let dialogWidth = parseInt(this.props.width, 10);

    if (!this._dialog) {
      return;
    }

    if (this.props.dislocate && dislocateIndex > 1) {
      const dialogBaseLeft = (windowWidth - dialogWidth) / 2;
      let marginLeft = (dislocateIndex - 1) * 10;
      if ((dislocateIndex - 1) * 10 >= (windowWidth - dialogWidth) / 2 - 32) {
        const maxLeft = Math.floor(((windowWidth - dialogWidth) / 2 - 32) / 10) * 10;
        if (dialogWidth - (dislocateIndex - 1) * 10 >= 1087) {
          dialogWidth = dialogWidth - ((dislocateIndex - 1) * 10 - maxLeft);
        } else {
          marginLeft = maxLeft + (dialogWidth - 1087);
          dialogWidth = 1087;
        }
      }
      this._dialog.style.position = 'absolute';
      this._dialog.style.left = dialogBaseLeft + marginLeft + 'px';
    }
    this._dialog.style.width = `${dialogWidth}px`;
  };

  render() {
    const { autoZIndex, dialogClasses, containerClassName, style, overlayClosable } = this.props;
    const { dislocateIndex } = this.state;
    const dialogContainerStyle = {};
    if (autoZIndex) {
      dialogContainerStyle.zIndex = this.getZIndex();
    }
    const containerClassList = ['mui-dialog-scroll-container'];
    // type
    if (this.props.type === 'fixed') {
      containerClassList.push('mui-dialog-fixed');
    }
    if (this.props.type === 'scroll') {
      containerClassList.push('mui-dialog-scroll');
    }

    const containerClasses = containerClassList.join(' ');

    let dialogClassList = ['mui-dialog-dialog'];
    // size
    if (this.props.size === 'medium') {
      dialogClassList.push('mui-dialog-medium');
    }
    if (this.props.size === 'large') {
      dialogClassList.push('mui-dialog-large');
    }
    if (this.props.size === 'huge') {
      dialogClassList.push('mui-dialog-huge');
    }
    // confirm
    if (this.props.confirm === 'confirm') {
      dialogClassList.push('mui-dialog-confirm');
    }
    if (this.props.confirm === 'success') {
      dialogClassList.push('mui-dialog-confirm', 'mui-dialog-success');
    }
    if (this.props.confirm === 'danger') {
      dialogClassList.push('mui-dialog-confirm', 'mui-dialog-danger');
    }
    // anim
    if (this.props.anim) {
      dialogClassList.push('mui-dialog-anim');
    }
    // props.className
    if (this.props.className) {
      dialogClassList = dialogClassList.concat(this.props.className.split(' '));
    }

    // 遮罩层关闭事件
    const overlayOnClick = e => {
      if (e.target.className !== 'mui-dialog-scroll-container' || e.target.id !== String(this.dialogId)) {
        return;
      }

      if (overlayClosable && this.props.onClose && !window.getSelection().toString().trim()) {
        this.props.onClose(e);
      }
    };
    // container
    let container = null;
    if (this.props.visible) {
      let mask = null;
      if (this.props.overlay) {
        mask = <div className="mui-dialog-mask" />;
      }
      if (this.props.dislocate && dislocateIndex > 1) {
        mask = <div className="mui-dialog-mask" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }} />;
      }
      container = (
        <div className={cx('mui-dialog-container', dialogClasses)} style={dialogContainerStyle}>
          {mask}
          <div
            className={cx(containerClasses, containerClassName)}
            id={this.dialogId}
            onClick={e => {
              overlayOnClick(e);
            }}
          >
            <div className={dialogClassList.join(' ')} style={style} ref={dialog => (this._dialog = dialog)}>
              {this.props.children}
            </div>
            <span className="mui-dialog-ghost" ref={ghost => (this._ghost = ghost)} />
          </div>
        </div>
      );
    }

    return createPortal(container, this.target);
  }
}

export default DialogBase;
