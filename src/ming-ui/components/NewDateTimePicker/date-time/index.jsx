import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './style.less';

import DateTimePicker from 'ming-ui/components/NewDateTimePicker/date-time-picker';
import LibCalender from 'ming-ui/components/lib/calender';
import PositionContainer from 'ming-ui/components/PositionContainer';

class DateTime extends Component {
  constructor(props) {
    super(props);

    const mode = props.timePicker ? 'datetime' : props.mode;

    const selectedValue = props.selectedValue ? moment(props.selectedValue).toDate() : null;

    this.state = {
      /**
       * 当前值
       */
      value: selectedValue,
      /**
       * 显示文本
       */
      label: selectedValue ? LibCalender.formatTime(selectedValue, mode, props.timeMode) : '',
      /**
       * 菜单是否展开
       */
      menuOpened: false,
      bounding: null,
    };
  }

  componentDidMount() {
    if (this.props.defaultVisible) {
      this.showMenu();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedValue !== this.props.selectedValue) {
      const mode = nextProps.timePicker ? 'datetime' : nextProps.mode;
      const selectedValue = nextProps.selectedValue ? moment(nextProps.selectedValue).toDate() : null;

      const label = selectedValue ? LibCalender.formatTime(selectedValue, mode, nextProps.timeMode) : '';

      this.setState({
        value: selectedValue,
        label,
      });
    }
  }

  showMenu = () => {
    this.setState({
      menuOpened: true,
      bounding: this._picker.getBoundingClientRect(),
    });
  };

  hideMenu = () => {
    this.setState({
      menuOpened: false,
    });
  };

  toggleMenuOpened = () => {
    if (this.props.disabled) {
      return;
    }
    this.setState({
      menuOpened: !this.state.menuOpened,
      bounding: this._picker.getBoundingClientRect(),
    });
  };

  onChange = (event, value) => {
    let newValue = null;
    let label = '';
    const mode = this.props.timePicker ? 'datetime' : this.props.mode;
    if (value) {
      newValue = value;
      label = LibCalender.formatTime(value, mode, this.props.timeMode);
    }
    this.setState(
      {
        value: newValue,
        label,
        menuOpened: false,
      }
    );
  };

  render() {
    const min = this.props.min ? this.props.min.toDate() : null;
    const max = this.props.max ? this.props.max.toDate() : null;

    const mode = this.props.timePicker ? 'datetime' : this.props.mode;

    const pickerClassList = ['mui-datetime-picker'];
    if (this.props.disabled) {
      pickerClassList.push('disabled');
    }
    const pickerClassNames = pickerClassList.join(' ');
    let button = (
      <span
        ref={(picker) => {
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
          ref={(picker) => {
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

    return (
      <div className="mui-datetime-base">
        {button}
        <PositionContainer
          popupParentNode={this.props.popupParentNode}
          placement={this.props.placement || "bottom"}
          bounding={this.state.bounding}
          visible={this.state.menuOpened}
          offset={this.props.offset}
          onHide={() => {
            this.hideMenu();
          }}
        >
          <DateTimePicker
            type={mode}
            timeType={this.props.timeMode}
            allowClear={this.props.allowClear}
            firstDayOfWeek={this.props.firstDayOfWeek}
            min={min}
            max={max}
            value={this.state.value}
            onChange={(event, value) => {
              this.onChange(event, value);
            }}
            onOk={this.props.onOk}
            onClear={this.props.onClear}
            onSelect={this.props.onSelect}
          />
        </PositionContainer>
      </div>
    );
  }
}

DateTime.propTypes = {
  /**
   * 出现的位置，上 下
   */
  placement: PropTypes.oneOf(['top', 'bottom']),
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
   * 初始是否可见
   */
  defaultVisible: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 偏移
   */
   offset: PropTypes.shape({}),
  /**
   * 指定弹层创建的位置，默认是body下
   */
  popupParentNode: PropTypes.func,
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
};

DateTime.defaultProps = {
  mode: 'date',
  timePicker: false,
  timeMode: 'minute',
  allowClear: true,
  firstDayOfWeek: 1,
  selectedValue: null,
  min: null,
  max: null,
  defaultVisible: false,
  disabled: false,
  placement: 'bottom',
  onOk: (time) => {
    //
  },
  onClear: () => {
    //
  },
  onSelect: (time) => {
    //
  },
};

export default DateTime;
