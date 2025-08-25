import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Calendar from './Calendar';
import locale from './locale/zh_CN';
import Picker from './Picker';

class DatePicker extends Component {
  static propTypes = {
    /**
     * 占位符
     */
    placeholder: PropTypes.string,
    /**
     * 日历locale，多语言支持
     */
    locale: PropTypes.object,
    /**
     * 当前已选中值
     */
    selectedValue: PropTypes.object,
    /**
     * 下拉面板类名
     */
    panelCls: PropTypes.string,
    /**
     * 是否禁用
     */
    disabled: PropTypes.bool,
    /**
     * 触发元素的类名
     */
    className: PropTypes.string,
    /**
     * 使用format解析时间
     */
    format: PropTypes.string,
    /**
     * 选中日期触发的回调，参数(date, source)
     */
    onSelect: PropTypes.func,
    /**
     * 点击确定按钮触发的回调
     */
    onOk: PropTypes.func,
    /**
     * 日历只要发生改变就会触发的回调
     */
    onChange: PropTypes.func,
    /**
     * 是否显示时间选择器
     */
    timePicker: PropTypes.bool,
    /**
     * 选择模式
     */
    mode: PropTypes.oneOf([
      /**
       * 【默认】日期（等同于 timePicker = false）
       */
      'date',
      /**
       * 日期时间（等同于 timePicker = true）
       */
      'datetime',
      /**
       * 月
       */
      'month',
      /**
       * 年
       */
      'year',
    ]),
    /**
     * 是否允许清除数据
     */
    allowClear: PropTypes.bool,
    /**
     * 点击清除按钮触发的回调
     */
    onClear: PropTypes.func,
    /**
     * 左侧偏移量
     */
    offsetLeft: PropTypes.number,
    /**
     * 顶部偏移量
     */
    offsetTop: PropTypes.number,
    /**
     * 触发元素
     */
    children: PropTypes.node,
    /**
     * 初始是否可见
     */
    defaultVisible: PropTypes.bool,
    /**
     * 指定弹层创建的位置，默认是body下
     */
    popupParentNode: PropTypes.func,
  };

  static defaultProps = {
    locale,
    placeholder: '请选择',
    allowClear: true,
  };

  getFormat = () => {
    const props = this.props;
    let { format } = props;
    if (!format) {
      if (props.timePicker) {
        format = props.locale.lang.dateTimeFormat;
      } else {
        format = props.locale.lang.dateFormat;
      }
    }
    return format;
  };

  getDateString = (value, format) => {
    const props = this.props;
    if (value) {
      return value && value.format(format);
    }
    return props.placeholder;
  };

  render() {
    const props = this.props;
    const { offsetTop, offsetLeft, panelCls, className, popupParentNode, children, defaultVisible, ...other } = props;
    const formatVal = this.getFormat();
    let mode = this.props.timePicker ? 'datetime' : 'date';
    if (this.props.mode) {
      mode = this.props.mode;
    }

    const calendar = <Calendar {...other} mode={mode} prefixCls="Calendar" />;
    return (
      <Picker
        calendar={calendar}
        panelCls={panelCls}
        className={className}
        disabled={this.props.disabled}
        offsetTop={offsetTop}
        offsetLeft={offsetLeft}
        defaultVisible={defaultVisible}
        popupParentNode={popupParentNode}
        defaultValue={props.selectedValue}
        timePicker={props.timePicker}
        prefixCls="Calendar-picker"
      >
        {({ value }) => {
          if (children) {
            return <span className="Calendar-picker-input">{React.cloneElement(children)}</span>;
          }
          return <span className="Calendar-picker-input">{this.getDateString(value, formatVal)}</span>;
        }}
      </Picker>
    );
  }
}

export default DatePicker;
