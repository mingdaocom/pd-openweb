import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CalendarRange from './CalendarRange';
import locale from './locale/zh_CN';
import Picker from './Picker';
import '../less/DatePicker.less';
import '../less/dateRangePicker.less';
import '../less/Rangepicker.less';

class RangePicker extends Component {
  static propTypes = {
    /**
     * 占位符
     */
    placeholder: PropTypes.string,
    /**
     * 日历locale
     */
    locale: PropTypes.object,
    /**
     * 当前已选中值
     */
    selectedValue: PropTypes.arrayOf(PropTypes.object),
    /**
     * 半天数据
     */
    halfData: PropTypes.any,
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
     * 选中时间触发的回调
     */
    onSelect: PropTypes.func,
    /**
     * 点击确定按钮触发的回调
     */
    onOk: PropTypes.func,
    /**
     * 是否显示时间选择器
     */
    timePicker: PropTypes.bool,
    /**
     * 模式
     * default - 默认
     * task - 任务
     * halfday - 半天（AM|PM）
     */
    mode: PropTypes.oneOf(['default', 'task', 'halfday']),
    /**
     * 点击清除按钮触发的回调
     */
    onClear: PropTypes.func,
    /**
     * 日历只要发生改变就会触发的回调
     */
    onChange: PropTypes.func,
    /**
     * 两段时间之间的分隔符
     */
    separator: PropTypes.string,
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
    separator: '至',
    placeholder: '请选择',
    selectedValue: [],
    halfData: ['AM', 'PM'],
    mode: 'default',
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
    if (value && Array.isArray(value) && value[0] && value[1]) {
      return (
        <span className="Calendar-picker-input-duration">
          <span className="Calendar-picker-input-start">{value[0].format(format)}</span>
          <span className="Calendar-picker-input-separator">{props.separator}</span>
          <span className="Calendar-picker-input-end">{value[1].format(format)}</span>
        </span>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  render() {
    const props = this.props;
    const { offsetTop, offsetLeft, panelCls, className, popupParentNode, children, defaultVisible, ...other } = props;
    const formatVal = this.getFormat();
    const calendar = <CalendarRange {...other} prefixCls="Calendar" />;
    return (
      <Picker
        timePicker
        offsetTop={offsetTop}
        offsetLeft={offsetLeft}
        prefixCls="Calendar-picker"
        disabled={this.props.disabled}
        calendar={calendar}
        panelCls={panelCls}
        className={className}
        popupParentNode={popupParentNode}
        defaultVisible={defaultVisible}
        defaultValue={props.selectedValue}
      >
        {({ value }) => {
          if (children) {
            return <span className="Calendar-picker-input">{React.cloneElement(children)}</span>;
          }
          return (
            <span tabIndex="0" className="Calendar-picker-input">
              {this.getDateString(value, formatVal)}
            </span>
          );
        }}
      </Picker>
    );
  }
}

export default RangePicker;
