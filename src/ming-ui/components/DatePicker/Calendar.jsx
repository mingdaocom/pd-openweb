import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import withClickAway from 'ming-ui/decorators/withClickAway';
import DateTable from './DateTable';
import CalendarHeader from './CalendarHeader';
import CalendarFooter from './CalendarFooter';
import YearTable from './YearTable';
import MonthTable from './MonthTable';

import locale from './locale/zh_CN';
import '../less/DatePicker.less';
import '../less/dateRangePicker.less';
import '../less/Rangepicker.less';

function getMorrowTime(value) {
  const tomorrow = moment().add(1, 'days');
  tomorrow.locale(value.locale()).utcOffset(value.utcOffset());
  return tomorrow;
}

function noop() {}

function getNow() {
  return moment();
}

function getTodayTime(value) {
  const today = moment();
  today.locale(value.locale()).utcOffset(value.utcOffset());
  return today;
}

function getNowByCurrentStateValue(value) {
  let ret;
  if (value) {
    ret = getTodayTime(value);
  } else {
    ret = getNow();
  }
  return ret;
}

@withClickAway
class Calendar extends Component {
  static propTypes = {
    value: PropTypes.object,
    selectedValue: PropTypes.object,
    defaultValue: PropTypes.object,
    locale: PropTypes.object,
    onSelect: PropTypes.func,
    onOk: PropTypes.func,
    className: PropTypes.string,
    prefixCls: PropTypes.string,
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
    allowClear: PropTypes.bool,
    onClear: PropTypes.func,
    onChange: PropTypes.func,
    disabledDate: PropTypes.func,
    popupParentNode: PropTypes.func,
  };

  static defaultProps = {
    timePicker: false,
    prefixCls: 'Calendar',
    onOk: noop,
    onSelect: noop,
    allowClear: true,
    onClear: noop,
    onChange: noop,
    locale: locale,
  };

  constructor(props) {
    super(props);

    const value = props.value || props.defaultValue || getNow();
    let view = 'date';
    if (this.props.mode === 'month') {
      view = 'month';
    } else if (this.props.mode === 'year') {
      view = 'year';
    }
    this.state = {
      value,
      selectedValue: props.selectedValue || value,
      /**
       * 年份表格页面
       */
      yearPage: value.year() % 16 ? 16 * Math.floor(value.year() / 16) + 1 : 16 * (Math.floor(value.year() / 16) - 1) + 1,
      /**
       * 当前表格
       * date - 日
       * month - 月
       * year - 年
       */
      view,
    };
  }

  componentWillReceiveProps(nextProps) {
    let { value } = nextProps;
    const { selectedValue } = nextProps;
    if ('value' in nextProps) {
      value = value || nextProps.defaultValue || getNowByCurrentStateValue(this.state.value);
      this.setState({
        value,
      });
    }
    if ('selectedValue' in nextProps) {
      this.setState({
        selectedValue,
      });
    }
  }

  onSelect = (value, cause) => {
    if (value) {
      this.setValue(value);
    }
    this.setSelectedValue(value, cause);
  };

  onClear = () => {
    this.onSelect(null, { source: 'clearButton' });
    this.props.onClear();
  };

  onOk = () => {
    const { value } = this.state;
    this.props.onOk(value);
  };

  onDateTableSelect = value => {
    this.onSelect(value, { source: 'dateTable' });
  };

  onSelectTime = value => {
    this.onSelect(value, { source: 'timePicker' });
  };

  onToday = () => {
    const { value } = this.state;
    const now = getTodayTime(value);
    this.onSelect(now, {
      source: 'todayButton',
    });
  };

  onToMorrow = () => {
    const { value } = this.state;
    const tomorrow = getMorrowTime(value);
    this.onSelect(tomorrow, {
      source: 'tomorrowButton',
    });
  };

  setValue = value => {
    const originalValue = this.state.value;
    if (!('value' in this.props)) {
      this.setState({
        value,
      });
    }
    if (originalValue !== value) {
      this.props.onChange(value);
    }
  };

  setSelectedValue = (selectedValue, cause) => {
    if (!('selectedValue' in this.props)) {
      this.setState({
        selectedValue,
      });
    }
    this.props.onSelect(selectedValue, cause);
  };

  renderRoot = newProps => {
    const { prefixCls, className, style } = this.props;
    const classes = {
      [prefixCls]: 1,
      [className]: !!className,
    };

    return (
      <div style={style} className={`${classNames(classes)}`}>
        {newProps.children}
      </div>
    );
  };

  /**
   * 切换当前视图
   */
  setCurrentView = view => {
    this.setState({
      view,
    });
  };

  /**
   * 后退
   */
  goBack = event => {
    if (this.state.view === 'year') {
      // year view: year table flip back
      this.setState({
        // year table current page
        yearPage: this.state.yearPage - 16,
      });
    } else if (this.state.view === 'month') {
      // month view: year - 1
      this.onSelect(this.state.value.clone().add(-1, 'years'), {
        source: 'goBack',
      });
    } else if (this.state.view === 'date') {
      // date view: month - 1
      this.onSelect(this.state.value.clone().add(-1, 'months'), {
        source: 'goBack',
      });
    }
  };

  /**
   * 前进
   */
  goForward = event => {
    if (this.state.view === 'year') {
      // year view: year table flip foward
      this.setState({
        // year table current page
        yearPage: this.state.yearPage + 16,
      });
    } else if (this.state.view === 'month') {
      // month view: year + 1
      this.onSelect(this.state.value.clone().add(1, 'years'), {
        source: 'goForward',
      });
    } else if (this.state.view === 'date') {
      // date view: month + 1
      this.onSelect(this.state.value.clone().add(1, 'months'), {
        source: 'goForward',
      });
    }
  };

  yearChanged = (event, value, data) => {
    let view = 'year';
    if (this.props.mode === 'month') {
      view = 'month';
    } else if (this.props.mode === 'date' || this.props.mode === 'datetime') {
      view = 'date';
    }

    this.setState({
      view,
    });
    this.onSelect(this.state.value.year(value), {
      source: 'yearTable',
    });
  };

  monthChanged = (event, value, data) => {
    let view = 'month';
    if (this.props.mode === 'date' || this.props.mode === 'datetime') {
      view = 'date';
    }

    this.setState({
      view,
    });
    this.onSelect(this.state.value.month(value - 1), {
      source: 'monthTable',
    });
  };

  render() {
    const props = this.props;
    const { locale, prefixCls, timePicker, disabledDate } = props;
    const state = this.state;
    const { value, selectedValue } = state;

    let table = null;
    if (this.state.view === 'date') {
      table = (
        <DateTable
          locale={locale}
          value={value}
          disabledDate={disabledDate}
          selectedValue={selectedValue}
          prefixCls={prefixCls}
          onSelect={this.onDateTableSelect}
        />
      );
    } else if (this.state.view === 'month') {
      const month = this.state.value.month() + 1;

      table = (
        <MonthTable
          value={month}
          onChange={(event, _value, data) => {
            this.monthChanged(event, _value, data);
          }}
        />
      );
    } else if (this.state.view === 'year') {
      // current year
      const year = this.state.value.year();

      table = (
        <YearTable
          value={year}
          page={this.state.yearPage}
          onChange={(event, _value, data) => {
            this.yearChanged(event, _value, data);
          }}
        />
      );
    }

    const children = (
      <div className={`${prefixCls}-panel`} key="panel">
        <div className={`${prefixCls}-date-panel`}>
          <CalendarHeader
            prefixCls={prefixCls}
            value={value}
            mode={this.props.mode}
            view={this.state.view}
            openView={view => {
              this.setCurrentView(view);
            }}
            goBack={event => {
              this.goBack(event);
            }}
            goForward={event => {
              this.goForward(event);
            }}
          />
          <div className={`${prefixCls}-body`}>{table}</div>

          <CalendarFooter
            locale={locale}
            prefixCls={prefixCls}
            mode={this.props.mode}
            view={this.state.view}
            openView={view => {
              this.setCurrentView(view);
            }}
            timePicker={timePicker}
            selectedValue={selectedValue}
            value={value}
            onOk={this.onOk}
            allowClear={props.allowClear}
            onClear={this.onClear}
            onSelect={this.onSelectTime}
            onToday={this.onToday}
            onToMorrow={this.onToMorrow}
            popupParentNode={props.popupParentNode}
          />
        </div>
      </div>
    );

    return this.renderRoot({
      children,
    });
  }
}

export default Calendar;
