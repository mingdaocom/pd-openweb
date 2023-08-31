import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import LibCalender from 'ming-ui/components/lib/calender';
import DateTable from './date-table';
import MonthTable from './month-table';
import YearTable from './year-table';
import moment from 'moment';

class Calender extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 周表头
       * [
       *   '周一',
       *   '周二',
       * ]
       */
      weekList: [],
      /**
       * 日列表
       * [
       *   [{
       *     time: new Date(2017, 8, 25), // 代表时间（2017-09-25）
       *     value: 25,
       *     label: '25',                 // 显示文本
       *     other: true,                 // 是否属于其他月份
       *     disabled: false,             // 是否禁用
       *     current: false,              // 是否为当前选中的日期
       *     inRange: false,              // 是否为当前选中的范围
       *     start: false,                // 是否为当前选中范围的开始
       *     end: false,                  // 是否为当前选中范围的结束
       *     left: false,                 // 是否为当前选中范围每行的开始
       *     right: false,                // 是否为当前选中范围每行的结束
       *     now: false,                  // 是否为当日
       *   }],
       * ]
       */
      dateList: [],
      /**
       * 月列表
       * [{
       *   time: new Date(2017, 0),
       *   value: 1,
       *   label: '1',
       *   disabled: false,
       *   current: false, // 是否为当前选中的月份
       *   inRange: false, // 是否为当前选中的范围
       *   now: false,     // 是否为当月
       * }]
       */
      monthList: [],
      /**
       * 年列表
       * [{
       *   time: new Date(2001),
       *   value: 2001,
       *   label: '2001',
       *   disabled: false,
       *   current: false, // 是否为当前选中的年份
       *   inRange: false, // 是否为当前选中的范围
       *   now: false,     // 是否为当年
       * }]
       */
      yearList: [],
    };
  }

  componentWillMount() {
    this.generateList(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.generateList(nextProps);
  }

  /**
   * 生成周数据
   */
  generateWeekList = props => {
    console.log(moment);
    const WeekDays = [0, 1, 2, 3, 4, 5, 6].map(function (item) {
      return moment().day(item).format('dd');
    });

    const firstDayOfWeek = props.firstDayOfWeek;
    const list = [];
    let i = 0;
    while (i < 7) {
      const item = firstDayOfWeek + i >= 7 ? firstDayOfWeek + i - 7 : firstDayOfWeek + i;

      list.push(WeekDays[item]);

      i = i + 1;
    }

    return list;
  };

  /**
   * 生成连续日期数据
   * @param {object} props - 组件参数
   * @param {number} other - 是否为当月
   * -1 - 上月
   * 0 - 当月
   * 1 - 下月
   * @param {number} year - 年
   * @param {number} month - 月
   * @param {number} startDate - 开始日期
   * @param {number} endDate - 结束日期
   */
  generateDates = (props, other, year, month, startDate, endDate) => {
    const list = [];

    let i = 0;
    while (i <= endDate - startDate) {
      const date = startDate + i;

      const time = new Date(year, month, date);
      // is date disabled
      const disabled = !LibCalender.dateInRange(time, props.min, props.max);
      // is same date with props.value
      let current = false;
      if (props.range) {
        current = LibCalender.dateInRange(time, props.value[0], props.value[1]);
      }
      if (
        !props.range &&
        props.value.getFullYear() === year &&
        props.value.getMonth() === month &&
        props.value.getDate() === date
      ) {
        current = true;
      }
      // is inRange
      let inRange = false;
      if (props.selectedRange) {
        inRange = LibCalender.dateInRange(time, props.selectedRange[0], props.selectedRange[1]);
      }
      // is today
      let now = false;
      const today = new Date();
      if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === date) {
        now = true;
      }

      list.push({
        time,
        value: date,
        label: date.toString(),
        other,
        disabled,
        current,
        inRange,
        now,
      });

      i = i + 1;
    }

    return list;
  };

  /**
   * 生成日期数据
   */
  generateDateList = props => {
    // 当前显示页面
    const currentPage = props.cursor;

    /**
     * 当月
     */

    // 当前年
    const currentYear = currentPage.getFullYear();
    // 当前月
    const currentMonth = currentPage.getMonth();

    // 当月天数
    const currentDays = LibCalender.daysOfMonth(currentYear, currentMonth);
    // 当月全部日期
    const currentDates = this.generateDates(props, false, currentYear, currentMonth, 1, currentDays);

    /**
     * 前一个月
     */

    // 前一个月对应的年
    const prevYear = currentMonth <= 0 ? currentYear - 1 : currentYear;
    // 前一个月
    const prevMonth = currentMonth <= 0 ? 11 : currentMonth - 1;

    // 前一个月天数
    const prevDays = LibCalender.daysOfMonth(prevYear, prevMonth);
    // 当月一号周几
    const weekOfCurrentFirst = new Date(currentYear, currentMonth, 1).getDay();

    const d1 = props.firstDayOfWeek === 0 ? 6 : props.firstDayOfWeek - 1;
    const d2 = weekOfCurrentFirst === 0 ? 6 : weekOfCurrentFirst - 1;

    // 前一个月补齐天数
    const prevNeedDays = d2 - d1 <= 0 ? 7 + (d2 - d1) : d2 - d1;
    // 前一个月展示日期
    const prevDates = this.generateDates(props, -1, prevYear, prevMonth, prevDays - prevNeedDays + 1, prevDays);

    /**
     * 后一个月
     */

    // 后一个月对应的年
    const nextYear = currentMonth >= 11 ? currentYear + 1 : currentYear;
    // 后一个月
    const nextMonth = currentMonth >= 11 ? 0 : currentMonth + 1;

    // 下一个月补齐天数
    const nextNeedDays = 7 * 6 - prevNeedDays - currentDays;
    // 下一个月展示日期
    const nextDates = this.generateDates(props, 1, nextYear, nextMonth, 1, nextNeedDays);

    /**
     * 日期数据 6 行 * 7 列
     */
    const list = [];

    const allDays = prevDates.concat(currentDates, nextDates);

    let i = 0;
    let prevItem = null;
    while (i < 6) {
      const items = allDays.slice(7 * i, 7 * (i + 1));

      items.map((item, j) => {
        if (item.current && item.inRange) {
          // start
          items[j].start = this.props.part === 'start';
          // end
          items[j].end = this.props.part === 'end';

          if (props.selectedRange) {
            const a = props.selectedRange[0];
            const b = props.selectedRange[1];

            // same date
            if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()) {
              items[j].start = true;
              items[j].end = true;
            }
          }
        }

        // left
        if (item.inRange && (j === 0 || (j > 0 && !prevItem.inRange))) {
          items[j].left = true;
        }
        // right
        if (item.inRange && (j === 6 || (j < 6 && !items[j + 1].inRange))) {
          items[j].right = true;
        }

        prevItem = item;

        return null;
      });

      list.push(items);

      i = i + 1;
    }

    return list;
  };

  /**
   * 生成月份数据
   */
  generateMonthList = props => {
    const monthList = [];
    // 当前年
    const thisYear = props.cursor.getFullYear();
    const thisMonth = props.cursor.getMonth();

    let i = 0;
    while (i < 12) {
      const time = new Date(thisYear, i, 1);
      // is month disabled
      const disabled = !LibCalender.monthInRange(time, props.min, props.max);
      // is current month
      let current = false;
      if (props.range) {
        current = LibCalender.monthInRange(time, props.value[0], props.value[1]);
      }
      if (!props.range && props.value.getFullYear() === thisYear && props.value.getMonth() === i) {
        current = true;
      }
      // is inRange
      let inRange = false;
      if (props.selectedRange) {
        inRange = LibCalender.monthInRange(time, props.selectedRange[0], props.selectedRange[1]);
      }
      // is this month
      let now = false;
      const today = new Date();
      if (today.getFullYear() === thisYear && today.getMonth() === thisMonth && thisMonth === i) {
        now = true;
      }

      monthList.push({
        time,
        value: i,
        label: _l('%0月', i + 1),
        disabled,
        current,
        inRange,
        now,
      });

      i = i + 1;
    }

    const list = [];

    let j = 0;
    while (j < 3) {
      const items = monthList.slice(4 * j, 4 * (j + 1));
      list.push(items);

      j = j + 1;
    }

    return list;
  };

  /**
   * 生成年份数据
   */
  generateYearList = props => {
    const yearList = [];

    const thisYear = props.cursor.getFullYear();

    const page = parseInt(thisYear / 10, 10);

    const startYear = page * 10 - 1;

    let i = 0;
    while (i < 12) {
      const year = startYear + i;
      const time = new Date(year, 0, 1);
      // is year disabled
      let disabled = false;
      if ((props.min && year < props.min.getFullYear()) || (props.max && year > props.max.getFullYear())) {
        disabled = true;
      }
      // is current year
      let current = false;
      if (props.range) {
        current = year >= props.value[0].getFullYear() && year <= props.value[1].getFullYear();
      }
      if (!props.range) {
        current = props.value.getFullYear() === year;
      }
      // is inRange
      let inRange = false;
      if (props.selectedRange) {
        inRange = year >= props.selectedRange[0].getFullYear() && year <= props.selectedRange[1].getFullYear();
      }
      // is this year
      const now = new Date().getFullYear() === year;

      const other = i === 0 || i === 11;

      yearList.push({
        time,
        value: year,
        label: year.toString(),
        disabled,
        current,
        inRange,
        other,
        now,
      });

      i = i + 1;
    }

    const list = [];

    let j = 0;
    while (j < 3) {
      const items = yearList.slice(4 * j, 4 * (j + 1));
      list.push(items);

      j = j + 1;
    }

    return list;
  };

  /**
   * 生成数据列表
   */
  generateList = props => {
    // BUG: too much update
    const data = {
      weekList: this.generateWeekList(props),
      dateList: this.generateDateList(props),
      monthList: this.generateMonthList(props),
      yearList: this.generateYearList(props),
    };

    this.setState(data);
  };

  /**
   * 选择日期、月份或年份
   */
  onPick = (event, type, value, time) => {
    if (this.props.onPick) {
      this.props.onPick(event, type, value, time);
    }
  };

  renderContent = () => {
    let content = null;
    if (this.props.mode === 'date') {
      content = (
        <DateTable
          headData={this.state.weekList}
          bodyData={this.state.dateList}
          onPick={(event, date, time) => {
            this.onPick(event, 'date', date, time);
          }}
        />
      );
    } else if (this.props.mode === 'month') {
      content = (
        <MonthTable
          bodyData={this.state.monthList}
          onPick={(event, month, time) => {
            this.onPick(event, 'month', month, time);
          }}
        />
      );
    } else if (this.props.mode === 'year') {
      content = (
        <YearTable
          bodyData={this.state.yearList}
          onPick={(event, year, time) => {
            this.onPick(event, 'year', year, time);
          }}
        />
      );
    }

    return content;
  };

  render() {
    const content = this.renderContent();

    return <div className="mui-calender">{content}</div>;
  }
}

Calender.propTypes = {
  /**
   * 显示模式
   */
  mode: PropTypes.oneOf([
    'date', // 日
    'month', // 月
    'year', // 年
  ]),
  /**
   * 是否为范围选择
   */
  range: PropTypes.bool,
  /**
   * 范围的上半部分/下半部分
   */
  part: PropTypes.oneOf([
    '',
    'start', // 上半部分
    'end', // 下半部分
  ]),
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
   * 可选最小值
   */
  min: PropTypes.any,
  /**
   * 可选最大值
   */
  max: PropTypes.any,
  /**
   * 选中值
   */
  value: PropTypes.any,
  /**
   * 已选择的范围
   */
  selectedRange: PropTypes.any,
  /**
   * 当前显示页面的值
   */
  cursor: PropTypes.any,
  /**
   * 值发生改变
   * @param {event} event - 事件
   * @param {string} type - 选中值得类型 date|month|year
   * @param {number} value - 选中的值
   * @param {Date} time - 选中的日期
   */
  onPick: PropTypes.func,
};

Calender.defaultProps = {
  mode: 'date',
  range: false,
  part: '',
  firstDayOfWeek: 1,
  min: null,
  max: null,
  value: new Date(),
  cursor: new Date(),
  onPick: (event, type, value, time) => {
    //
  },
};

export default Calender;
