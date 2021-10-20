import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './style.less';

import DateTimeRangePicker from 'ming-ui/components/NewDateTimePicker/date-time-range-picker';
import LibCalender from 'ming-ui/components/lib/calender';
import PositionContainer from 'ming-ui/components/PositionContainer';

class DateTimeRange extends Component {
  constructor(props) {
    super(props);

    this.state = this.generateState(props);
  }

  componentDidMount() {
    if (this.props.defaultVisible) {
      this.showMenu();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.selectedValue, this.props.selectedValue)) {
      this.setState(this.generateState(nextProps));
    }
  }

  generateState = props => {
    const empty = !props.selectedValue || (!props.selectedValue[0] && !props.selectedValue[1]);
    const start = !!(props.selectedValue && props.selectedValue[0]);
    const end = !!(props.selectedValue && props.selectedValue[1]);

    const startValue = props.selectedValue && props.selectedValue[0] ? moment(props.selectedValue[0]).toDate() : null;
    const endValue = props.selectedValue && props.selectedValue[1] ? moment(props.selectedValue[1]).toDate() : null;
    const value = [startValue, endValue];
    const state = {
      /**
       * 当前值
       */
      value,
      /**
       * 显示文本
       */
      label: value
        ? this.getRangeLabel(
            value,
            {
              start,
              end,
            },
            props,
          )
        : this.props.placeholder,
      /**
       * 选中配置
       */
      config: {
        /**
         * 开始时间是否选中
         */
        start,
        /**
         * 结束时间是否选中
         */
        end,
      },
      /**
       * 菜单是否展开
       */
      menuOpened: false,
      bounding: null,
    };

    return state;
  };

  getRangeLabel = (value, config, props) => {
    const mode = props.timePicker ? 'datetime' : props.mode;

    const partial = props.mode === 'task';

    const start =
      value && value[0] && ((partial && config && config.start) || !partial)
        ? LibCalender.formatTime(value[0], mode, this.props.timeMode)
        : '';
    const end =
      value && value[1] && ((partial && config && config.end) || !partial)
        ? LibCalender.formatTime(value[1], mode, this.props.timeMode)
        : '';

    const list = [start, end];

    return start || end ? list.join(' ~ ') : props.placeholder;
  };

  showMenu = () => {
    this.setState({
      menuOpened: true,
      bounding: this._picker.getBoundingClientRect(),
    });
    this.props.onVisibleChange(true);
  };

  hideMenu = () => {
    this.setState({
      menuOpened: false,
    });
    this.props.onVisibleChange(false);
  };

  toggleMenuOpened = () => {
    if (this.props.disabled) {
      return;
    }
    this.setState({
      menuOpened: !this.state.menuOpened,
      bounding: this._picker.getBoundingClientRect(),
    });
    this.props.onVisibleChange(!this.state.menuOpened);
  };

  onChange = (event, value, config) => {
    let newValue = null;
    let label = this.props.placeholder;
    if (value) {
      newValue = value;
      label = this.getRangeLabel(value, config, this.props);
    }
    this.setState({
      value: newValue,
      label,
      config,
      menuOpened: false,
    });
    this.props.onVisibleChange(false);
  };

  render() {
    const min = this.props.min ? this.props.min.toDate() : null;
    const max = this.props.max ? this.props.max.toDate() : null;

    let mode = 'date';
    if (this.props.timePicker || this.props.mode === 'task') {
      mode = 'datetime';
    } else {
      mode = this.props.mode;
    }

    const pickerClassList = ['mui-datetime-picker'];
    if (this.props.disabled) {
      pickerClassList.push('disabled');
    }
    const pickerClassNames = pickerClassList.join(' ');
    let button = (
      <span
        ref={picker => {
          this._picker = picker;
        }}
        className={pickerClassNames}
        disabled={this.props.disabled}
        onClick={this.toggleMenuOpened}
      >
        <span>{this.state.label}</span>
      </span>
    );
    if (this.props.children) {
      button = (
        <span
          ref={picker => {
            this._picker = picker;
          }}
          className={pickerClassNames}
          disabled={this.props.disabled}
          onClick={this.toggleMenuOpened}
        >
          {this.props.children}
        </span>
      );
    }

    const picker = (
      <DateTimeRangePicker
        type={mode}
        timeType={this.props.timeMode}
        partial={this.props.mode === 'task'}
        allowClear={this.props.allowClear}
        config={this.state.config}
        firstDayOfWeek={this.props.firstDayOfWeek}
        min={min}
        max={max}
        value={this.state.value}
        halfStart={this.props.halfData[0]}
        halfEnd={this.props.halfData[1]}
        onChange={(event, value, config) => {
          this.onChange(event, value, config);
        }}
        onOk={this.props.onOk}
        onClear={this.props.onClear}
        onSelect={this.props.onSelect}
        autoFillEndTime={this.props.autoFillEndTime}
      />
    );

    const content = (
      <div className="mui-datetimerange-base">
        {button}
        <PositionContainer
          popupParentNode={this.props.popupParentNode}
          placement="bottom"
          offset={this.props.offset}
          bounding={this.state.bounding}
          visible={this.state.menuOpened}
          onHide={this.hideMenu}
        >
          {picker}
        </PositionContainer>
      </div>
    );

    if (this.props.mode === 'task') {
      return picker;
    } else {
      return content;
    }
  }
}

DateTimeRange.propTypes = {
  /**
   * 替换元素
   */
  children: PropTypes.any,
  /**
   * 选择类型
   */
  mode: PropTypes.oneOf([
    'year', // 年
    'month', // 月
    'date', // 日
    'datetime', // YYYY-MM-DD HH:mm:ss
    'task', // 任务
    'half', // 半天 AM|PM
  ]),
  /**
   * 是否显示时间选择
   * = mode="datetime"
   */
  timePicker: PropTypes.bool,
  /**
   * 时间类型
   */
  timeMode: PropTypes.oneOf([
    'hour', // HH
    'minute', // HH:mm
    'second', // HH:mm:ss
  ]),
  halfData: PropTypes.any,
  /**
   * 是否允许清除
   */
  allowClear: PropTypes.bool,
  /**
   * 每周的第一天
   */
  firstDayOfWeek: PropTypes.oneOf([
    0, // 周日
    1, // 周一
    2,
    3,
    4,
    5,
    6, // 周六
  ]),
  /**
   * 当前值
   */
  selectedValue: PropTypes.any,
  /**
   * 最小值
   */
  min: PropTypes.any,
  /**
   * 最大值
   */
  max: PropTypes.any,
  /**
   * 初始是否可见
   */
  defaultVisible: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 未选择时的文字
   */
  placeholder: PropTypes.string,
  /**
   * 指定弹层创建的位置，默认是body下
   */
  popupParentNode: PropTypes.func,
  /**
   * 指定弹层创建的位置偏移值
   */
  offset: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
  }),
  /**
   * 确定选择
   * @param {object} time - 选中的时间
   */
  onOk: PropTypes.func,
  /**
   * 清除选择
   */
  onClear: PropTypes.func,
  /**
   * 值发生改变
   * @param {object} time - 选中的时间
   */
  onSelect: PropTypes.func,
  /**
   * 可见状态变更
   */
  onVisibleChange: PropTypes.func,
  /**
   * 结束小时数随开始时间改自动加大区间
   */
  autoFillEndTime: PropTypes.number,
};

DateTimeRange.defaultProps = {
  mode: 'date',
  timePicker: false,
  timeMode: 'minute',
  halfData: ['AM', 'PM'],
  allowClear: true,
  firstDayOfWeek: 1,
  selectedValue: null,
  min: null,
  max: null,
  defaultVisible: false,
  disabled: false,
  placeholder: _l('请选择'),
  offset: {
    top: 0,
    left: 0,
  },
  onOk: time => {
    //
  },
  onClear: () => {
    //
  },
  onSelect: time => {
    //
  },
  onVisibleChange: time => {
    //
  },
  autoFillEndTime: 0,
};

export default DateTimeRange;
