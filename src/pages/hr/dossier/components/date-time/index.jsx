import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import DatePicker from 'ming-ui/components/DatePicker';

import './style.less';

import { FormError } from '../lib';

class DateTime extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value[Date]
       */
      value: this.props.value || null,
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
    if (this.props.required && !value) {
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
   */
  valueUpdate = (value) => {
    let newValue = null;
    if (value && value.toDate) {
      try {
        newValue = value.toDate();
      } catch (e) {
        //
      }
    }

    let nextValue = null;
    if (newValue && newValue.getTime) {
      nextValue = newValue.getTime();
    }
    let prevValue = null;
    if (this.state.value && this.state.getTime) {
      prevValue = this.state.value.getTime();
    }

    this.checkValue(newValue, true);

    // update state.value
    this.setState({
      value: newValue,
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
    if (this.state.error && this.state.showError) {
      buttonClassList.push('mui-forminput-error');
    }
    if (this.props.error) {
      buttonClassList.push('mui-forminput-error');
    }
    const buttonClassNames = buttonClassList.join(' ');

    // moment time
    let time = null;
    const value = this.state.value ? new Date(this.state.value) : new Date();
    try {
      time = moment(value);
    } catch (e) {
      //
    }

    return (
      <div className={cx('mui-datetime', this.props.className)}>
        <DatePicker
          mode={this.props.type}
          selectedValue={time}
          format={this.state.timeFormat}
          disabled={this.props.disabled}
          onOk={this.valueUpdate}
          allowClear={this.props.allowClear}
          onClear={this.valueUpdate}
        >
          <button type="button" className={buttonClassNames} disabled={this.props.disabled}>
            {this.state.label ? (
              <span className="mui-forminput-label">{this.state.label}</span>
            ) : (
              <span className="mui-forminput-label placeholder">{_l('请选择')}</span>
            )}
            <Icon icon="bellSchedule" />
          </button>
        </DatePicker>
      </div>
    );
  }
}

DateTime.propTypes = {
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
     * 日期时间
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
  /**
   * props控制的error
   */
  error: PropTypes.shape({
    showError: PropTypes.string,
  }),
  /**
   * allow clear buttun
   */
  allowClear: PropTypes.bool,
  hint: PropTypes.string,
  className: PropTypes.string,
};

DateTime.defaultProps = {
  value: null,
  label: '',
  type: 'date',
  required: false,
  disabled: false,
  className: '',
  showError: false,
  allowClear: true,
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

export default DateTime;
