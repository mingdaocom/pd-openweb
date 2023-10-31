import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import Trigger from 'rc-trigger';
import Panel from './Panel';
import '../less/CityPicker.less';
import 'rc-trigger/assets/index.css';

class CityPicker extends Component {
  static propTypes = {
    /**
     * 触发元素
     */
    children: PropTypes.node,
    /**
     * 时间选择器类名
     */
    className: PropTypes.string,
    /**
     * API HOST
     */
    host: PropTypes.string,
    /**
     * 默认显示的地址，可以是 string 和 object，如果是 object 组件会检测 id 定位到指定的城市
     */
    defaultValue: PropTypes.any,
    /**
     * 输入框占位符
     */
    placeholder: PropTypes.string,
    /**
     * 指定弹层创建的位置，默认是body下
     */
    popupParentNode: PropTypes.any,
    /**
     * 默认值3：表示省-市-县；2：表示省-市；1：省
     */
    level: PropTypes.number,
    /**
     * 回调函数，返回选择的城市数据 { id, name }
     */
    callback: PropTypes.func.isRequired,
    /**
     * 关闭回调函数
     */
    handleClose: PropTypes.func,
    /**
     * 是否禁用
     */
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    level: 3,
    placeholder: '省/市/县',
    defaultValue: '',
    callback: () => {},
    handleClose: () => {},
    popupParentNode: document.body,
  };

  constructor(props) {
    super(props);
    const { defaultValue } = props;
    const isString = typeof defaultValue === 'string';
    const value = isString ? defaultValue : defaultValue.map(item => item.name).join('/');

    this.state = {
      value,
      visible: false,
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleCallback = this.handleCallback.bind(this);
  }
  handleOpen() {
    if (!this.props.disabled) {
      this.setState({
        visible: !this.state.visible,
      });
    }
  }
  updateBounding = () => {
    this.setState({
      visible: this.state.visible,
    });
  };
  handleClose() {
    this.props.handleClose();
    this.setState({
      visible: false,
    });
  }
  handleCallback(array, panelIndex) {
    const values = array.map(item => item.name);
    this.setState({
      value: values.join('/'),
    });
    this.props.callback(array, panelIndex);
  }
  render() {
    const { placeholder, className, popupParentNode, defaultValue, disabled, destroyPopupOnHide, level } = this.props;
    const { value, visible, bounding } = this.state;
    const cls = classNames('ming CityPicker-wrapper', className);

    let content = (
      <input
        readOnly
        value={value}
        placeholder={placeholder}
        className="CityPicker-input"
        ref={citypicker => (this.citypicker = citypicker)}
      />
    );
    if (this.props.children) {
      content = this.props.children;
    }
    return (
      <span className={cls}>
        <Trigger
          action={['click']}
          popupVisible={visible}
          destroyPopupOnHide={destroyPopupOnHide}
          onPopupVisibleChange={visible => {
            if (!disabled) {
              this.setState({
                visible,
              });
              if (!visible) {
                this.props.handleClose();
              }
            }
          }}
          popupClassName="CityPickerPanelTrigger"
          popupAlign={{
            points: ['tl', 'bl'],
            overflow: { adjustX: true, adjustY: true },
          }}
          getPopupContainer={() => popupParentNode}
          popup={
            <Panel
              defaultValue={typeof defaultValue === 'object' ? defaultValue : []}
              host={this.props.host}
              level={level}
              callback={this.handleCallback}
              handleOpen={this.updateBounding}
              handleClose={this.handleClose}
              onHide={this.handleClose}
            />
          }
        >
          <span className="CityPicker-input-container" ref={trigger => (this.trigger = trigger)}>
            {content}
          </span>
        </Trigger>
      </span>
    );
  }
}

export default CityPicker;
