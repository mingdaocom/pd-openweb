import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import TimePicker from 'ming-ui/components/TimePicker/TimePicker';
import Dropdown from 'ming-ui/components/Dropdown';

class RangeFooter extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    timePicker: PropTypes.bool,
    /**
     * 模式
     * default - 默认
     * task - 任务
     * halfday - 半天（AM|PM）
     */
    mode: PropTypes.oneOf(['default', 'task', 'halfday']),
    selectedValue: PropTypes.any,
    halfStart: PropTypes.oneOf(['AM', 'PM']),
    halfEnd: PropTypes.oneOf(['AM', 'PM']),
    halfOnChange: PropTypes.func,
    onStartTimeSelect: PropTypes.func,
    onEndTimeSelect: PropTypes.func,
    onClear: PropTypes.func,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    popupParentNode: PropTypes.func,
  };

  isWarning = (startValue, endValue) => {
    if (startValue && endValue && startValue.isSame(endValue, 'day')) {
      if (endValue.isBefore(startValue, 'hour')) {
        return true;
      }
      if (endValue.isSame(startValue, 'hour')) {
        return endValue.isBefore(startValue, 'minute');
      }
    }
    return false;
  };

  // 半天选择
  halfOnChange = (value, target) => {
    if (this.props.halfOnChange) {
      this.props.halfOnChange(value, target);
    }
  };

  render() {
    const props = this.props;
    const { startValue, endValue, locale, prefixCls, timePicker } = props;

    let footerBtns = [];
    const clearBtn = (
      <a onClick={() => props.onClear()} className={`${prefixCls}-clear-btn`} role="button">
        {locale.lang.clear}
      </a>
    );

    const okBtn = (
      <a onClick={() => props.onOk()} className={`${prefixCls}-ok-btn`} role="button">
        {locale.lang.ok}
      </a>
    );

    // 任务模式特殊参数
    let startExtraOptions = {};
    let endExtraOptions = {};
    if (this.props.mode === 'task') {
      const extraOptions = {
        showMinute: false,
        optionFormatter: n => `${String(n).padStart(2, 0)}:00`,
        resultFormatter: m => (m ? m.format('HH:00') : '— —'),
      };
      startExtraOptions = Object.assign(
        {
          onChange: val => {
            if (val) {
              props.onStartTimeSelect(val);
            } else {
              props.onStartTimeSelect(
                moment(startValue || new Date())
                  .startOf('day')
                  .add(9, 'hour'),
              );
            }
          },
        },
        extraOptions,
      );
      endExtraOptions = Object.assign(
        {
          onChange: val => {
            if (val) {
              props.onEndTimeSelect(val);
            } else {
              props.onEndTimeSelect(
                moment(endValue || new Date())
                  .startOf('day')
                  .add(18, 'hour'),
              );
            }
          },
        },
        extraOptions,
      );
    }

    const timeStartBtn = (
      <span className={`${prefixCls}-timepicker`}>
        <span className={`${prefixCls}-timepicker-title`}>{locale.lang.timepicker}</span>
        <TimePicker
          showSecond={false}
          value={startValue}
          popupParentNode={props.popupParentNode}
          onChange={val => props.onStartTimeSelect(val)}
          className={`${prefixCls}-timepicker-btn`}
          {...startExtraOptions}
        />
      </span>
    );

    const timeEndBtn = (
      <span className={`${prefixCls}-timepicker`}>
        <span className={`${prefixCls}-timepicker-title`}>{locale.lang.timepicker}</span>
        <TimePicker
          showSecond={false}
          value={endValue}
          popupParentNode={props.popupParentNode}
          onChange={val => props.onEndTimeSelect(val)}
          className={classNames(`${prefixCls}-timepicker-btn`, {
            warning: this.isWarning(startValue, endValue),
          })}
          {...endExtraOptions}
        />
      </span>
    );

    // 半天
    const halfOptions = [
      {
        value: 'AM',
        text: 'AM',
      },
      {
        value: 'PM',
        text: 'PM',
      },
    ];

    const halfStartBtn = (
      <span className={`${prefixCls}-timepicker`}>
        <span className={`${prefixCls}-timepicker-title`}>时段</span>
        <Dropdown
          defaultValue={this.props.halfStart}
          data={halfOptions}
          onChange={value => {
            this.halfOnChange(value, 'start');
          }}
        />
      </span>
    );

    const halfEndBtn = (
      <span className={`${prefixCls}-timepicker`}>
        <span className={`${prefixCls}-timepicker-title`}>时段</span>
        <Dropdown
          defaultValue={this.props.halfEnd}
          data={halfOptions}
          onChange={value => {
            this.halfOnChange(value, 'end');
          }}
        />
      </span>
    );

    if (timePicker) {
      footerBtns = (
        <div className={`${prefixCls}-range-footer-timepicker`}>
          <span className={`${prefixCls}-range-footer-timepicker-left`}>{timeStartBtn}</span>
          <div className={`${prefixCls}-range-footer-divide`} />
          <span className={`${prefixCls}-range-footer-timepicker-right`}>
            {timeEndBtn}
            {clearBtn}
            {okBtn}
          </span>
        </div>
      );
    } else {
      if (this.props.mode === 'halfday') {
        footerBtns = (
          <div className={`${prefixCls}-range-footer-timepicker`}>
            <span className={`${prefixCls}-range-footer-timepicker-left`}>{halfStartBtn}</span>
            <div className={`${prefixCls}-range-footer-divide`} />
            <span className={`${prefixCls}-range-footer-timepicker-right`}>
              {halfEndBtn}
              {clearBtn}
              {okBtn}
            </span>
          </div>
        );
      } else {
        footerBtns = (
          <div className={`${prefixCls}-range-footer-basic`}>
            {clearBtn}
            {okBtn}
          </div>
        );
      }
    }

    return <div className={`${prefixCls}-footer ${prefixCls}-range-footer`}>{footerBtns}</div>;
  }
}

export default RangeFooter;
