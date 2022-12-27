import React from 'react';

import moment from 'moment';
import ReactDOM from 'react-dom';

import DatePicker from 'ming-ui/components/DatePicker';

const RangePicker = DatePicker.RangePicker;

import { InputType } from 'src/components/customWidget/src/component/widgets/datetimeRange/data';

import { submitCalculate } from './customFieldsEvents';

class DatetimeRange {
  constructor(target, type, showLength, start, end, $el, formType) {
    /**
     * 元素 ID
     */
    this.target = target;
    /**
     * 组件数据类型（日期|日期时间）
     */
    this.type = type || InputType.DATE;
    /**
     * 是否显示持续时长
     */
    this.showLength = showLength || false;
    /**
     * 已选择的范围
     */
    this.range = {
      start: start || null,
      end: end || null,
    };
    /**
     * rangePicker
     */
    this.timeRangePicker = null;

    this.$el = $el;
    this.formType = formType;
  }

  /**
   * 开始事件监听
   */
  start() {
    if ($(this.target).hasClass('Hidden')) {
      return;
    }

    this.hasAuth = $(this.target).data('hasauth');

    // $(this.target).on('click', '.pickerText', (e) => {
    //   if (this.hasAuth !== false) {
    //     let target = e.target.parentNode;

    //     if (target) {
    //       target.innerHTML = '';

    //       ReactDOM.render(
    //         this.timeRangePicker,
    //         target
    //       );
    //     }
    //   }
    // });

    this.timeFormat = 'YYYY-MM-DD HH:mm';
    this.timePicker = true;
    if (this.type === InputType.DATE) {
      this.timeFormat = 'YYYY-MM-DD';
      this.timePicker = false;
    }

    this.render();

    if (this.hasAuth !== false) {
      let target = this.target;

      if (target) {
        target.innerHTML = '';

        ReactDOM.render(this.timeRangePicker, target);
      }
    }
  }

  /**
   * 更新时间范围
   * pickedData - [momentStart, monentEnd]
   */
  updateTimeRange = pickedData => {
    let start = null;
    let end = null;

    $(this.target)
      .closest('.customContents')
      .find('.customFieldsLabel')
      .removeClass('error');
    $(this.target)
      .closest('.customDetailSingle')
      .find('.detailControlName')
      .removeClass('error');

    if (pickedData && pickedData.length === 2) {
      start = pickedData[0].toDate();
      start.setSeconds(0);

      if (this.type === InputType.DATE) {
        start.setMinutes(0);
        start.setHours(0);
      }

      end = pickedData[1].toDate();
      end.setSeconds(0);

      if (this.type === InputType.DATE) {
        end.setMinutes(0);
        end.setHours(0);
      }

      $(this.target).data('range', `${start.getTime()},${end.getTime()}`);
    } else {
      $(this.target).data('range', '');
    }

    this.range = {
      start: start,
      end: end,
    };

    $(this.target)
      .find('.rangePickerToggle')
      .text(this.getPickerText());
  };

  /**
   * 获取 range 数组
   */
  getRange() {
    let range = [];

    if (this.range.start && this.range.end) {
      range.push(moment(this.range.start));
      range.push(moment(this.range.end));
    }

    if (range && range.length === 2) {
      $(this.target).removeClass('empty');
    } else {
      $(this.target).addClass('empty');
    }

    return range;
  }

  /**
   * 获取展示文字
   */
  getPickerText() {
    let range = this.getRange();
    let pickerText = _l('请选择');

    if (range && range.length === 2) {
      let times = [];
      times = range.map((item, i, list) => {
        return item.format(this.timeFormat);
      });

      pickerText = times.join(' 至 ');

      $(this.target).data('range', `${this.range.start.getTime()},${this.range.end.getTime()}`);
    } else {
      $(this.target).data('range', '');
    }

    let number = '';
    if (this.showLength && this.range.start && this.range.end) {
      let start = moment(this.range.start);
      let end = moment(this.range.end);

      let unit = _l('天');
      let length = end.diff(start, 'days') + 1;
      if (this.type === InputType.DATE_TIME) {
        unit = _l('小时');
        length = ((this.range.end.getTime() - this.range.start.getTime()) / (1000 * 60 * 60)).toFixed(1);
      }

      pickerText += ` ${_l('时长')}: ${length} ${unit}`;

      number = `${length}`;
    }

    submitCalculate({
      type: this.formType,
      $el: this.$el,
      target: this.target,
      number: number,
    });

    return pickerText;
  }

  /**
   * 渲染列表
   */
  render() {
    let range = this.getRange();
    let pickerText = this.getPickerText();

    $(this.target)
      .closest('.customContents')
      .find('.customFieldsLabel')
      .removeClass('error');
    $(this.target)
      .closest('.customDetailSingle')
      .find('.detailControlName')
      .removeClass('error');

    if (this.hasAuth !== false) {
      $(this.target).removeClass('show');
    } else {
      $(this.target).addClass('show');
    }

    if (range && range.length === 2) {
      $(this.target).data('range', `${this.range.start.getTime()},${this.range.end.getTime()}`);
    } else {
      $(this.target).data('range', '');
    }

    this.timeRangePicker = (
      <RangePicker
        timePicker={this.timePicker}
        selectedValue={range}
        format={this.timeFormat}
        defaultVisible={false}
        onOk={this.updateTimeRange}
        onClear={this.updateTimeRange}
      >
        <div className="rangePickerToggle">{pickerText}</div>
      </RangePicker>
    );

    let elmt = `
      <span class="pickerText">${pickerText}</span>
    `;

    $(this.target).html(elmt);
  }
}

export default DatetimeRange;
