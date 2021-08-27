import $ from 'jquery';
import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';

import DatePicker from 'ming-ui/components/DatePicker';

let InputType = {
  DATE: 15,
  DATE_TIME: 16,
};

class Datetime {
  constructor(target, type, time, postUpdate) {
    /**
     * 元素 ID
     */
    this.target = target;
    /**
     * 组件数据类型（日期|日期时间）
     */
    this.type = type || InputType.DATE;
    /**
     * 已选择的时间
     */
    this.time = time || null;
    /**
     * datetimePicker
     */
    this.datetimePicker = null;
    /**
     * postUpdate
     */
    let defaultPostUpdate = () => {};
    this.postUpdate = postUpdate || defaultPostUpdate;
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
    //         this.datetimePicker,
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

        ReactDOM.render(this.datetimePicker, target);
      }
    }
  }

  /**
   * 更新时间
   * pickedData - [momentTime]
   */
  updateTime = pickedData => {
    let time = null;

    $(this.target)
      .closest('.customContents')
      .find('.customFieldsLabel')
      .removeClass('error');
    $(this.target)
      .closest('.customDetailSingle')
      .find('.detailControlName')
      .removeClass('error');

    if (pickedData) {
      time = pickedData.toDate();
      time.setSeconds(0);

      if (this.type === InputType.DATE) {
        time.setMinutes(0);
        time.setHours(0);
      }
    }

    this.time = time;

    const pickerText = this.getPickerText();
    $(this.target)
      .find('.timePickerToggle')
      .text(pickerText);

    // POST DATA in Task
    let text = pickerText;
    if (!this.time) {
      text = '';
    }
    this.postUpdate($(this.target), text);
  };

  /**
   * 获取展示文字
   */
  getPickerText() {
    let pickerText = _l('请选择');

    if (this.time) {
      pickerText = moment(this.time).format(this.timeFormat);

      $(this.target).data('time', pickerText);
      $(this.target).removeClass('empty');
    } else {
      $(this.target).data('time', '');
      $(this.target).addClass('empty');
    }

    return pickerText;
  }

  /**
   * 渲染列表
   */
  render() {
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

    let time = null;
    if (this.time) {
      time = moment(this.time);
    }

    this.datetimePicker = (
      <DatePicker
        timePicker={this.timePicker}
        selectedValue={time}
        format={this.timeFormat}
        defaultVisible={false}
        onOk={this.updateTime}
        onClear={this.updateTime}
      >
        <div className="timePickerToggle">{pickerText}</div>
      </DatePicker>
    );

    let elmt = `
      <span class="pickerText">${pickerText}</span>
    `;

    $(this.target).html(elmt);
  }
}

export default Datetime;
