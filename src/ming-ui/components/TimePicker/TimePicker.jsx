import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import Panel from './Panel';
import PositionContainer from 'ming-ui/components/PositionContainer';
import { getComputedStyle } from 'ming-ui/utils/DomUtils';
import { isDescendant } from 'ming-ui/utils/DomHelpers';
import '../less/TimePicker.less';

class TimePicker extends Component {
  static propTypes = {
    /**
     * 时间选择器类名
     */
    className: PropTypes.string,
    /**
     * 下拉面板类名
     */
    panelCls: PropTypes.string,
    /**
     * 受限，为moment值，需要搭配onChange使用
     */
    value: PropTypes.object,
    /**
     * 初始值，只在初始化时作用
     */
    defaultValue: PropTypes.object,
    /**
     * 输入框占位符
     */
    placeholder: PropTypes.string,
    /**
     * 选择时间发生的回调
     */
    onChange: PropTypes.func,
    /**
     * 是否显示时钟
     */
    showHour: PropTypes.bool,
    /**
     * 是否显示分钟
     */
    showMinute: PropTypes.bool,
    /**
     * 是否显示秒钟
     */
    showSecond: PropTypes.bool,
    /**
     * 格式化选择结果文本显示的方法，参数为 (value: moment.MomentInput, showHour: boolean, showMinute: boolean, showSecond: boolean)
     */
    resultFormatter: PropTypes.func,
    /**
     * 格式化选项显示的方法，参数为 (type:'hour'|'minute'|'second', value: number)
     */
    optionFormatter: PropTypes.func,
    /**
     * 用于弹出层随此节点滚动
     */
    popupParentNode: PropTypes.any, // eslint-disable-line
    /**
     * 禁用
     */
    disabled: PropTypes.bool,
    /**
     * 不可选的小时参数（hour／小时）
     */
    disabledHours: PropTypes.func,
    /**
     * 不可选的秒钟，参数（minute／分钟）
     */
    disabledMinutes: PropTypes.func,
    /**
     * 不可选的秒钟，参数（seconds／秒钟）
     */
    disabledSeconds: PropTypes.func,
    /**
     * 触发元素
     */
    children: PropTypes.node,
  };

  static defaultProps = {
    showHour: true,
    showMinute: true,
    showSecond: true,
    onChange: () => {},
  };

  constructor(props) {
    super(props);

    let value;
    if ('defaultValue' in props) {
      value = props.defaultValue;
    }
    if ('value' in props) {
      value = props.value;
    }

    this.state = {
      value,
      visible: false,
      bounding: null,
    };
  }

  componentDidMount() {
    this.clickHandler = this.addEvent(document, 'click', this.withClickAway);
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({ value: nextProps.value });
    }
  }

  componentDidUpdate() {
    if (!this.clickHandler) {
      this.clickHandler = this.addEvent(document, 'click', this.withClickAway);
    }
  }

  componentWillUnmount() {
    if (this.clickHandler) {
      this.clickHandler.remove();
    }
  }

  getRef = panel => {
    this._panel = panel;
  };

  getDefaultChildren = () => {
    const { placeholder } = this.props;
    const { value } = this.state;
    const formatValue = this.getFormat(value);
    return (
      <input
        readOnly
        value={formatValue}
        placeholder={placeholder}
        onClick={this.handleFocus}
        className="TimePicker-input ThemeHoverColor3 ThemeHoverBorderColor3"
        ref={timepicker => (this._timepicker = timepicker)}
      />
    );
  };

  getFormat = value => {
    const { showHour, showMinute, showSecond } = this.props;
    if (this.props.resultFormatter) {
      return this.props.resultFormatter(value, showHour, showMinute, showSecond);
    } else {
      return value
        ? value.format(
            [showHour ? 'HH' : '', showMinute ? 'mm' : '', showSecond ? 'ss' : '']
              .filter(item => item !== '')
              .join(':'),
          )
        : '';
    }
  };

  withClickAway = event => {
    if (this._panel && !isDescendant(this._panel, event.target) && this._timepicker !== event.target) {
      this.handleClose();
    }
  };

  addEvent(element, type, handler) {
    element.addEventListener(type, handler);
    return {
      remove() {
        element.removeEventListener(type, handler);
      },
    };
  }

  handleFocus = () => {
    if (this.props.disabled) {
      return;
    }
    const bounding = this._timepicker.getBoundingClientRect();
    const iptHeight = parseInt(getComputedStyle(this._timepicker, 'height'), 10);

    const newBounding = {
      left: bounding.left,
      right: bounding.right,
      bottom: bounding.bottom - iptHeight,
      top: bounding.top + iptHeight,
      width: bounding.width,
      height: bounding.height,
    };

    this.setState({
      visible: true,
      bounding: newBounding,
    });
  };

  handleChange = value => {
    if (!('value' in this.props)) {
      this.setState({ value });
    }
    this.props.onChange(value);
  };

  handleClear = () => {
    if (!('value' in this.props)) {
      this.setState({ value: null });
    }
    this.props.onChange(null);
    this.setState({ visible: false });
  };

  handleClose = () => {
    this.setState({ visible: false });
  };

  render() {
    const { placeholder, className, popupParentNode, children, ...others } = this.props;
    const { visible, bounding, value } = this.state;

    return (
      <span className={classNames('ming TimePicker', className)}>
        <span className="TimePicker-input-container">
          {children
            ? React.cloneElement(children, {
                ref: timepicker => (this._timepicker = timepicker),
                onClick: this.handleFocus,
              })
            : this.getDefaultChildren()}
        </span>
        <PositionContainer
          visible={visible}
          bounding={bounding}
          placement="bottom"
          onHide={this.handleClose}
          popupParentNode={popupParentNode}
        >
          <Panel
            {...others}
            getRef={this.getRef}
            format={this.getFormat}
            onClose={this.handleClose}
            placeholder={placeholder}
            value={value}
            onClear={this.handleClear}
            onChange={this.handleChange}
            defaultOpenValue={moment()}
          />
        </PositionContainer>
      </span>
    );
  }
}

export default TimePicker;
