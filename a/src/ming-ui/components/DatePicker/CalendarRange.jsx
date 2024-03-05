import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import CalendarPart from './CalendarPart';
import RangeFooter from './RangeFooter';
import TaskHeader from './TaskHeader';
import defaultLocale from './locale/zh_CN';
import '../less/dateRangePicker.less';

function noop() {}

function getNow() {
  return moment();
}

function syncTime(from, to) {
  to.hour(from.hour());
  to.minute(from.minute());
  to.second(from.second());
}

function isEmptyArray(arr) {
  return Array.isArray(arr) && (arr.length === 0 || arr.every(i => !i));
}

function getValueFromSelectedValue(selectedValue) {
  // TODO: defaultValue
  let [start, end] = selectedValue;
  start = moment(start || getNow());
  end = moment(end || getNow());
  return [start, end];
}

function momentize(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => momentize(item));
  }
  return obj ? moment(obj) : obj;
}

function normalizeAnchor(props, init) {
  const normalizedValue = momentize(getValueFromSelectedValue(props.selectedValue));
  return !isEmptyArray(normalizedValue) ? normalizedValue : init && [getNow(), getNow()];
}

class CalendarRange extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    timePicker: PropTypes.bool,
    /**
     * 模式
     * default - 默认
     * task - 任务
     */
    mode: PropTypes.oneOf(['default', 'task', 'halfday']),
    halfData: PropTypes.any,
    defaultValue: PropTypes.any,
    selectedValue: PropTypes.array,
    onOk: PropTypes.func,
    locale: PropTypes.object,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    format: PropTypes.string,
    onClear: PropTypes.func,
    popupParentNode: PropTypes.func,
  };

  static defaultProps = {
    locale: defaultLocale,
    prefixCls: 'Calendar',
    defaultValue: [],
    halfData: ['AM', 'PM'],
    selectedValue: [],
    mode: 'default',
    onOk: noop,
    onClear: noop,
    onChange: noop,
    onSelect: noop,
  };

  constructor(props) {
    super(props);

    const selectedValue = momentize(props.selectedValue);
    const value = normalizeAnchor(props, 1);
    this.state = {
      value,
      selectedValue,
      rememberedValue: [...(selectedValue || [null, null])],
      waingAble: false,
    };

    this.halfData = this.props.halfData;
  }

  componentWillReceiveProps(nextProps) {
    const newState = {};
    if ('selectedValue' in nextProps) {
      newState.selectedValue = nextProps.selectedValue;
      this.setState(newState);
    }
  }

  onDateSelect(index, value, options) {
    const selectedValue = [...this.state.selectedValue];
    const rememberedValue = [...this.state.rememberedValue];
    selectedValue[index] = value;
    rememberedValue[index] = selectedValue[index] || rememberedValue[index];
    if (!('selectedValue' in this.props)) {
      this.setState({ selectedValue });
    }
    this.setState({ rememberedValue, waingAble: false });
    this.props.onSelect(selectedValue, options);
  }

  onStartTimeSelect = (leftValue) => {
    this.onDateSelect(0, leftValue, { source: 'timePicker' });
  };

  onEndTimeSelect = (rightValue) => {
    this.onDateSelect(1, rightValue, { source: 'timePicker' });
  };

  onStartDateSelect = (leftValue) => {
    this.onDateSelect(0, leftValue);
  };

  onEndDateSelect = (rightValue) => {
    this.onDateSelect(1, rightValue);
  };

  onOk = () => {
    const selectedValue = this.state.selectedValue;
    if (selectedValue[0] && selectedValue[1] && selectedValue[0].isAfter(selectedValue[1], 'second')) {
      alert('结束时间不能早于开始时间');
      this.setState({ waingAble: true });
      return;
    }
    this.setState({ waingAble: false });
    this.props.onOk(selectedValue, this.halfData);
  };

  onStartValueChange = (leftValue) => {
    const state = this.state;
    const value = [...state.value];
    value[0] = leftValue;
    return this.fireValueChange(value);
  };

  onEndValueChange = (rightValue) => {
    const state = this.state;
    const value = [...state.value];
    value[1] = rightValue;
    return this.fireValueChange(value);
  };

  getStartValue = () => {
    let startValue = this.state.value[0].clone();
    const selectedValue = this.state.selectedValue;
    if (this.props.mode === 'task') {
      startValue = moment(startValue)
        .startOf('day')
        .add(9, 'hour');
    }
    if (selectedValue[0] && this.props.timePicker) {
      syncTime(selectedValue[0], startValue);
    }
    return startValue;
  };

  getEndValue = () => {
    let endValue = this.state.value[1].clone();
    const selectedValue = this.state.selectedValue;
    if (this.props.mode === 'task') {
      endValue = moment(endValue)
        .startOf('day')
        .add(18, 'hour');
    }
    if (selectedValue[1] && this.props.timePicker) {
      syncTime(selectedValue[1], endValue);
    }
    return endValue;
  };

  compare = (v1, v2) => {
    if (this.props.timePicker) {
      return v1.diff(v2);
    }
    return v1.diff(v2, 'days');
  };

  fireSelectValueChange = (selectedValue, direct) => {
    if (!('selectedValue' in this.props)) {
      this.setState({
        selectedValue,
      });
    }
    if (!this.state.selectedValue[0] || !this.state.selectedValue[1]) {
      const startValue = selectedValue[0] || getNow();
      const endValue = selectedValue[1] || startValue.clone();
      this.setState({
        selectedValue,
        value: getValueFromSelectedValue([startValue, endValue]),
      });
    }

    this.props.onChange(selectedValue);
    if (direct || (selectedValue[0] && selectedValue[1])) {
      this.props.onSelect(selectedValue);
    }
  };

  fireValueChange = (value) => {
    const props = this.props;
    if (!('value' in props)) {
      this.setState({
        value,
      });
    }
  };

  clear = () => {
    this.fireSelectValueChange([], true);
    this.props.onClear();
  };

  /**
   * 任务模式，切换开始和结束的选中状态
   */
  toggleValue = (type, checked) => {
    const value = checked ? moment(this.state.rememberedValue[type === 'start' ? 0 : 1] || new Date()) : null;
    if (type === 'start') {
      this.onStartDateSelect(value);
    } else if (type === 'end') {
      this.onEndDateSelect(value);
    }
  };

  halfOnChange = (value, target) => {
    if (!this.halfData) {
      this.halfData = ['AM', 'PM'];
    }

    if (target === 'start') {
      this.halfData[0] = value;
    } else {
      this.halfData[1] = value;
    }

    if (this.props.onSelect) {
      this.props.onSelect(this.state.selectedValue, {}, this.halfData);
    }
  };

  render() {
    const props = this.props;
    const state = this.state;
    const { prefixCls, timePicker, className, locale } = props;
    const { selectedValue, rememberedValue } = state;
    const classes = classNames({
      [className]: !!className,
      [prefixCls]: true,
      [`${prefixCls}-range`]: true,
      [`${prefixCls}-waingAble`]: state.waingAble,
    });

    const startValue = this.getStartValue();
    const endValue = this.getEndValue();

    let taskHeader = null;
    if (this.props.mode === 'task') {
      let startChecked = false;
      if (this.state.selectedValue[0]) {
        startChecked = true;
      }
      let endChecked = false;
      if (this.state.selectedValue[1]) {
        endChecked = true;
      }

      taskHeader = (
        <TaskHeader
          startChecked={startChecked}
          endChecked={endChecked}
          toggle={(type, checked) => {
            this.toggleValue(type, checked);
          }}
        />
      );
    }

    return (
      <div className={classes} ref={root => (this._root = root)}>
        {taskHeader}
        <div className={`${prefixCls}-panel`}>
          <div className={`${prefixCls}-date-panel`}>
            <CalendarPart
              {...props}
              value={startValue}
              direction="left"
              onSelect={this.onStartDateSelect}
              selectedValue={selectedValue}
              onValueChange={this.onStartValueChange}
            />
            <span className={`${prefixCls}-range-middle`} />
            <CalendarPart
              {...props}
              value={endValue}
              direction="right"
              waingAble={state.waingAble}
              onSelect={this.onEndDateSelect}
              selectedValue={selectedValue}
              onValueChange={this.onEndValueChange}
            />
          </div>
        </div>
        <RangeFooter
          locale={locale}
          prefixCls={prefixCls}
          timePicker={timePicker}
          mode={this.props.mode}
          onOk={this.onOk}
          onClear={this.clear}
          startValue={selectedValue[0]}
          endValue={selectedValue[1]}
          halfStart={this.halfData[0]}
          halfEnd={this.halfData[1]}
          halfOnChange={(value, target) => {
            this.halfOnChange(value, target);
          }}
          onStartTimeSelect={this.onStartTimeSelect}
          onEndTimeSelect={this.onEndTimeSelect}
          popupParentNode={props.popupParentNode}
        />
      </div>
    );
  }
}

export default CalendarRange;
