import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';

import './style.less';

import Icon from 'ming-ui/components/Icon';
import DatePicker from 'ming-ui/components/DatePicker';
import { FormError } from '../lib';
const RangePicker = DatePicker.RangePicker;

class DateTimeRange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value[Date, Date]
       */
      value: this.props.value || [],
      /**
       * time format
       */
      timeFormat: this.props.type === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
      /**
       * button label
       */
      label: this.props.label || null,
      /**
       * value error
       */
      error: false,
      // dirty
      dirty: false,
      // show error
      showError: false,
    };
  }

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps) {
    // apply label update
    if (nextProps.label !== this.props.label) {
      const label = nextProps.label && nextProps.label.length ? nextProps.label.toString() : '';

      this.setState({
        label,
      });
    }
    // apply value update
    if (nextProps.value !== this.props.value) {
      this.setState({
        value: nextProps.value,
      });
    }
    // apply type update
    if (nextProps.type !== this.props.type) {
      this.setState({
        timeFormat: nextProps.type === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
      });
    }
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  /**
   * check value
   * @param {any} value - current value
   * @param {bool} dirty - value ever changed
   */
  checkValue = (value, dirty) => {
    const error = {
      type: '',
      message: '',
      dirty,
    };

    // required
    if (this.props.required && (!value || !value.length)) {
      error.type = FormError.types.REQUIRED;
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else {
      // fire onValid callback
      if (this.props.onValid) {
        this.props.onValid();
      }
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  /**
   * 所选时间已更新
   * @param {moment} value - 选择的时间
   * @param {array} halfData - 半天数据
   */
  valueUpdate = (value, halfData) => {
    let newValue = [];
    if (value && value.length === 2) {
      try {
        newValue = [value[0].toDate(), value[1].toDate()];
      } catch (e) {
        //
      }

      if (this.props.type === 'datehalf' && halfData && halfData.length) {
        newValue.push(halfData[0]);
        newValue.push(halfData[1]);
      }
    }

    let nextValue = [];
    if (newValue && newValue.length) {
      nextValue = [newValue[0].getTime(), newValue[1].getTime()];

      if (this.props.type === 'datehalf') {
        nextValue.push(newValue[2]);
        nextValue.push(newValue[3]);
      }
    }
    let prevValue = [];
    if (this.state.value && this.state.value.length && this.state.value[0].getTime && this.state.value[1].getTime) {
      prevValue = [this.state.value[0], this.state.value[1]];

      if (this.props.type === 'datehalf') {
        prevValue.push(this.state.value[2]);
        prevValue.push(this.state.value[3]);
      }
    }

    this.checkValue(nextValue, true);

    // update state.value
    this.setState({
      value: nextValue,
    });

    // fire onChange callback
    if (this.props.onChange) {
      this.props.onChange(null, nextValue, {
        prevValue,
      });
    }
  };

  render() {
    const buttonClassList = ['mui-forminput', 'ThemeFocusBorderColor3'];
    if ((this.state.error || this.props.error) && this.state.showError) {
      buttonClassList.push('mui-forminput-error');
    }
    const buttonClassNames = buttonClassList.join(' ');

    // pick time
    const timePicker = this.props.type === 'datetime';
    // pick half date
    const halfDay = this.props.type === 'datehalf' ? 'half' : 'date';

    const now = new Date();

    // moment time
    let range = [];
    const value0 =
      this.state.value && this.state.value[0] ? new Date(this.state.value[0]) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const value1 =
      this.state.value && this.state.value[1] ? new Date(this.state.value[1]) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    try {
      range = [moment(value0), moment(value1)];
    } catch (e) {
      //
    }
    // half data
    let halfData = [];
    if (this.state.value && this.state.value.length >= 4) {
      halfData.push(this.state.value[2]);
      halfData.push(this.state.value[3]);
    } else {
      halfData = ['AM', 'PM'];
    }

    return (
      <div className="mui-datetimerange">
        <RangePicker
          timePicker={timePicker}
          mode={halfDay}
          selectedValue={range}
          halfData={halfData}
          format={this.state.timeFormat}
          disabled={this.props.disabled}
          onOk={this.valueUpdate}
          onClear={this.valueUpdate}
        >
          <button type="button" className={buttonClassNames} disabled={this.props.disabled}>
            <span className="mui-forminput-label">{this.state.label}</span>
            <Icon icon="bellSchedule" />
          </button>
        </RangePicker>
      </div>
    );
  }
}

DateTimeRange.propTypes = {
  /**
   * 当前选中的值
   */
  value: PropTypes.any,
  /**
   * Button 显示内容
   */
  label: PropTypes.string,
  /**
   * 数据类型
   */
  type: PropTypes.oneOf([
    /**
     * 日期
     */
    'date',
    /**
     * 日期（半天）
     */
    'datehalf',
    /**
     * 日期时间
     */
    'datetime',
  ]),
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
  /**
   * 选项改变回调
   * @param {Event} event - 点击事件
   * @param {any} value - 选中的值
   * @param {object} data - 其他数据
   * data.prevValue - 之前的值
   */
  onChange: PropTypes.func,
  /**
   * 【回调】发生错误
   * @param {Error} error - 错误
   * error.type - 错误类型
   * error.dirty - 值是否发生过改变
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（与 onError 相反）
   */
  onValid: PropTypes.func,
  error: PropTypes.object,
  hint: PropTypes.string,
};

DateTimeRange.defaultProps = {
  value: null,
  label: '',
  type: 'date',
  required: false,
  disabled: false,
  showError: false,
  onChange: (event, value, item) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default DateTimeRange;
