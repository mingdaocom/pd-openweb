import React, { Component, Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import cx from 'classnames';
import { DateTime } from 'ming-ui/components/NewDateTimePicker';
import { DATE_TYPE } from '../../enum';

export default class LoopContent extends Component {
  /**
   * 处理时间规则
   */
  disposeDateRule = () => {
    const { data, updateSource } = this.props;

    if (data.repeatType !== DATE_TYPE.CUSTOM) {
      const frequency = data.repeatType === DATE_TYPE.WORK ? DATE_TYPE.WEEK : data.repeatType;
      const weekDays =
        data.repeatType === DATE_TYPE.WORK
          ? [1, 2, 3, 4, 5]
          : data.repeatType === DATE_TYPE.WEEK
          ? [moment(data.executeTime).days()]
          : [];

      updateSource({ frequency, interval: 1, weekDays });
    }
  };

  /**
   * 渲染频率内容
   */
  renderFrequencyContent() {
    const { data, updateSource } = this.props;
    const list = [
      { text: _l('小时'), value: DATE_TYPE.HOUR },
      { text: _l('天'), value: DATE_TYPE.DAY },
      { text: _l('周'), value: DATE_TYPE.WEEK },
      { text: _l('月'), value: DATE_TYPE.MONTH },
      { text: _l('年'), value: DATE_TYPE.YEAR },
    ];

    if (md.global.Config.IsLocal) {
      list.unshift({ text: _l('分钟'), value: DATE_TYPE.MINUTE });
    }

    return (
      <Fragment>
        <div className="Font13 mTop20 Gray_75">{_l('频率')}</div>
        <div className="mTop10 alignItemsCenter">
          {_l('每')}
          <input
            type="text"
            className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mLeft15"
            style={{ width: 48, height: 36, textAlign: 'right', minWidth: 48, boxSizing: 'border-box' }}
            defaultValue={data.interval}
            onKeyUp={evt => this.checkNumberControl(evt)}
            onPaste={evt => this.checkNumberControl(evt)}
            onBlur={evt => this.checkNumberControl(evt, true)}
          />
          <Dropdown
            className="flowDropdown mLeft15"
            style={{ width: 90 }}
            data={list}
            value={data.frequency}
            border
            onChange={value => updateSource({ frequency: value }, this.switchFrequency)}
          />
          {data.frequency === DATE_TYPE.MONTH && (
            <span className="Gray_75 mLeft15">{_l('第%0天', moment(data.executeTime).format('DD'))}</span>
          )}
          {data.frequency === DATE_TYPE.YEAR && (
            <span className="Gray_75 mLeft15">{moment(data.executeTime).format('MMMDo')}</span>
          )}
        </div>

        {data.frequency === DATE_TYPE.WEEK && this.renderWeek()}
      </Fragment>
    );
  }

  /**
   * 验证数值金额控件
   */
  checkNumberControl(evt, isBlur) {
    const { updateSource } = this.props;
    let num = evt.target.value.replace(/[^\d]/g, '');

    evt.target.value = num;

    if (isBlur) {
      if (num === '0') {
        num = '1';
        evt.target.value = num;
      }
      updateSource({ interval: num });
    }
  }

  /**
   * 切换频率类型
   */
  switchFrequency = () => {
    const { data, updateSource } = this.props;

    if (data.frequency !== DATE_TYPE.WEEK) {
      updateSource({ weekDays: [] });
    } else {
      updateSource({ weekDays: [moment(data.executeTime).days()] });
    }
  };

  /**
   * 渲染周
   */
  renderWeek() {
    const { data } = this.props;
    const days = [
      { text: moment.localeData()._weekdaysMin[0], value: 0 },
      { text: moment.localeData()._weekdaysMin[1], value: 1 },
      { text: moment.localeData()._weekdaysMin[2], value: 2 },
      { text: moment.localeData()._weekdaysMin[3], value: 3 },
      { text: moment.localeData()._weekdaysMin[4], value: 4 },
      { text: moment.localeData()._weekdaysMin[5], value: 5 },
      { text: moment.localeData()._weekdaysMin[6], value: 6 },
    ];

    return (
      <Fragment>
        <div className="Font13 mTop20 Gray_75">{_l('时间')}</div>
        <div className="mTop10 weekList">
          {days.map((item, i) => {
            return (
              <span
                key={i}
                className={cx({ ThemeBGColor3: _.includes(data.weekDays, item.value) })}
                onClick={() => this.switchWeek(item.value)}
              >
                {item.text}
              </span>
            );
          })}
        </div>
      </Fragment>
    );
  }

  /**
   * 切换周
   */
  switchWeek(value) {
    const { data, updateSource } = this.props;
    const weekDays = _.cloneDeep(data.weekDays);

    if (_.includes(weekDays, value)) {
      _.remove(weekDays, item => item === value);
    } else {
      weekDays.push(value);
    }

    updateSource({ weekDays: !weekDays.length ? [moment(data.executeTime).days()] : weekDays });
  }

  render() {
    const { data, updateSource } = this.props;
    const list = [
      { text: _l('每小时'), value: DATE_TYPE.HOUR },
      { text: _l('每天'), value: DATE_TYPE.DAY },
      { text: _l('工作日(星期一至星期五)'), value: DATE_TYPE.WORK },
      { text: `${_l('每周')}(${moment(data.executeTime).format('dddd')})`, value: DATE_TYPE.WEEK },
      { text: `${_l('每月')}(${moment(data.executeTime).format('Do')})`, value: DATE_TYPE.MONTH },
      { text: `${_l('每年')}(${moment(data.executeTime).format('MMMDo')})`, value: DATE_TYPE.YEAR },
      { text: _l('自定义'), value: DATE_TYPE.CUSTOM },
    ];

    return (
      <Fragment>
        <div className="flowDetailStartHeader flexColumn BGBlue">
          <div className="flowDetailStartIcon flexRow">
            <i className="icon-hr_surplus Font40 blue" />
          </div>
          <div className="Font16 mTop10">{_l('定时')}</div>
        </div>
        <div className="workflowDetailBox mTop20">
          <div className="Font13 bold">{_l('开始执行时间')}</div>
          <div className="actionControlBox ThemeBorderColor3 mTop10 Relative">
            <DateTime
              selectedValue={moment(data.executeTime)}
              timePicker
              allowClear={false}
              timeMode="minute"
              onOk={e =>
                updateSource({ executeTime: e.format('YYYY-MM-DD HH:mm') }, () => {
                  if (data.frequency === DATE_TYPE.WEEK && data.weekDays.length === 1) {
                    updateSource({ weekDays: [e.days()] });
                  }
                })
              }
            >
              {moment(data.executeTime).format('YYYY-MM-DD HH:mm')}
            </DateTime>
            <i className="icon-hr_time Absolute Font16 Gray_9e" style={{ right: 10, top: 10 }} />
          </div>

          <div className="Font13 bold mTop20">{_l('循环')}</div>
          <Dropdown
            className="flowDropdown mTop10"
            data={list}
            value={data.repeatType}
            border
            onChange={value => updateSource({ repeatType: value }, this.disposeDateRule)}
          />

          {data.repeatType === DATE_TYPE.CUSTOM && this.renderFrequencyContent()}
        </div>
      </Fragment>
    );
  }
}
