import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import DialogHeader from './DialogHeader';
import DialogFooter from './DialogFooter';
import DialogBase from './DialogBase';
import '../less/Dialog.less';

class Dialog extends Component {
  static propTypes = {
    /**
     * 弹窗叠弹窗错位
     */
    dislocate: PropTypes.bool,
    /**
     * 点击确认成功回调
     */
    okDisabled: PropTypes.bool,
    /**
     * 点击确认成功回调
     */
    onOk: PropTypes.func,
    /**
     * 确认按钮的文本
     */
    okText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    /**
     * 点击关闭图标的回调
     */
    handleClose: PropTypes.func,
    /**
     * 点击取消回调
     */
    onCancel: PropTypes.func,
    /**
     * 取消按钮的文本
     */
    cancelText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    /**
     * dialogBase Container classname
     */
    dialogClasses: PropTypes.string,
    /**
     * 对话框类名
     */
    className: PropTypes.string,
    /**
     * 描述
     */
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.element]),
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
     * 头部区域
     */
    title: PropTypes.node,
    /**
     * 头部自定义类名
     */
    headerClass: PropTypes.string,
    /**
     * body自定义类名
     */
    bodyClass: PropTypes.string,
    /**
     * 底部区域
     */
    footer: PropTypes.node,
    /**
     * 内容区域
     */
    children: PropTypes.node,
    /**
     * 在input或textarea中按esc不关闭弹层
     */
    escNotCloseInInput: PropTypes.bool,
    /**
     * 是否添加遮罩层
     */
    overlay: PropTypes.bool,
    /**
     * 遮罩层是否可关闭
     */
    overlayClosable: PropTypes.bool,
    /**
     * 是否显示右上角关闭按钮
     */
    closable: PropTypes.bool,
    /**
     * 对话框的可见性
     */
    visible: PropTypes.bool,
    /**
     * 【已废弃】设置body内容自动根据高度滚动（使用 type="fixed" 替代）
     */
    autoScrollBody: PropTypes.bool,
    /**
     * 【已废弃】是否填充到浏览器最大高度（使用 type="fixed" 替代）
     */
    fill: PropTypes.bool,
    /**
     * 【已废弃】对话框的对齐方式
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
     * 【已废弃】触发刷新（当值发生变化时，重新渲染 Dialog）
     */
    updateTrigger: PropTypes.any,
    /**
     * 是否启用动画
     */
    anim: PropTypes.bool,
    /**
     * 滚动事件
     */
    onScroll: PropTypes.func,
  };

  static defaultProps = {
    onOk: () => {},
    onCancel: () => {},
    okText: _l('确定'),
    cancelText: _l('取消'),
    escNotCloseInInput: false,
    overlay: true,
    visible: false,
    closable: true,
    align: 'center',
    autoScrollBody: false,
    fill: false,
    overlayClosable: true,
    maxHeight: 1000,
    updateTrigger: null,
    anim: false,
  };

  constructor(props) {
    super(props);

    // let visible = false;
    // if (props.visible) {
    //   visible = props.visible;
    // }
    //
    // this.state = {
    //   visible,
    // };

    this.handleCancel = this.handleCancel.bind(this);
    this.handleOk = this.handleOk.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.visible !== this.state.visible) {
    //   this.setState({ visible: nextProps.visible });
    // }
  }

  handleCancel() {
    this.props.onCancel();
    // this.setState({ visible: false });
  }

  handleOk(e) {
    this.props.onOk(e);
    // this.setState({ visible: false });
  }

  render() {
    const props = this.props;
    const baseProps = {
      autoZIndex: props.autoZIndex,
      dislocate: props.dislocate,
      dialogClasses: props.dialogClasses,
      className: props.className,
      size: props.size,
      align: props.align,
      width: props.width,
      escNotCloseInInput: props.escNotCloseInInput,
      overlay: props.overlay,
      style: props.style,
      type: props.type,
      confirm: props.confirm,
      overlayClosable: props.overlayClosable,
      autoScrollBody: props.autoScrollBody,
      fill: props.fill,
      updateTrigger: props.updateTrigger,
      maxHeight: props.maxHeight,
      anim: props.anim,
    };

    // 右上角关闭按钮
    let dialogCloseX = null;
    if (this.props.closable) {
      dialogCloseX = (
        <button className="mui-dialog-close-btn" onClick={this.props.handleClose || this.handleCancel}>
          <Icon icon="close" />
        </button>
      );
    }

    // 描述
    let desc = null;
    if (this.props.description) {
      desc = <div className="mui-dialog-desc">{this.props.description}</div>;
    }

    let content = null;
    if (this.props.visible) {
      content = (
        <DialogBase {...baseProps} onClose={this.handleCancel} visible={this.props.visible}>
          {dialogCloseX}
          <div
            className={cx('mui-dialog-header', {
              [props.headerClass]: props.headerClass,
            })}
          >
            <DialogHeader title={props.title} />
            {desc}
          </div>
          <div
            className={cx('mui-dialog-body', {
              [props.bodyClass]: props.bodyClass,
            })}
            onScroll={this.props.onScroll}
          >
            {this.props.children}
          </div>
          <DialogFooter
            footer={props.footer}
            okText={props.okText}
            cancelText={props.cancelText}
            okDisabled={props.okDisabled}
            onOk={this.handleOk}
            action={props.action}
            onCancel={this.handleCancel}
            confirm={props.confirm}
            buttonType={props.buttonType}
          />
        </DialogBase>
      );
    }

    return content;
  }
}

export default Dialog;
