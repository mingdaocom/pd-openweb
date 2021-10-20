import React, { Component, Fragment } from 'react';
import { Dropdown, Icon } from 'ming-ui';
import cx from 'classnames';
import { DateTime } from 'ming-ui/components/NewDateTimePicker';
import { DATE_TYPE } from '../../enum';
import RadioGroup from 'ming-ui/components/RadioGroup2';

export default class LoopContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOldCustom: props.data.repeatType === DATE_TYPE.CUSTOM && !props.data.config,
    };
  }

  /**
   * 渲染旧版内容
   */
  renderOldContent() {
    const { data } = this.props;

    return (
      <Fragment>
        {data.repeatType === DATE_TYPE.CUSTOM && this.renderFrequencyContent()}

        <div className="workflowDetailDesc pTop15 pBottom15 mTop20" style={{ background: 'rgba(255, 163, 64, 0.12)' }}>
          <div className="Gray_9e mBottom5">
            {_l('新版定时触发器可以综合小时、天/星期、月三个维度来设置定时任务。')}
            <span style={{ color: '#ffa340' }}>{_l('注意：切换为新方式并保存配置后，将无法恢复到旧的配置方式')}</span>
          </div>
          <span
            className="ThemeColor3 ThemeHoverColor2 pointer"
            onClick={() => {
              this.setState({ isOldCustom: false });
              this.initConfig();
            }}
          >
            {_l('切换为新版配置方式')}
          </span>
        </div>
      </Fragment>
    );
  }
  /**
   * 处理时间规则
   */
  disposeDateRule = () => {
    const { data, updateSource } = this.props;
    const { isOldCustom } = this.state;

    if (data.repeatType !== DATE_TYPE.CUSTOM) {
      const frequency = data.repeatType === DATE_TYPE.WORK ? DATE_TYPE.WEEK : data.repeatType;
      const weekDays =
        data.repeatType === DATE_TYPE.WORK
          ? [1, 2, 3, 4, 5]
          : data.repeatType === DATE_TYPE.WEEK
          ? [moment(data.executeTime).days()]
          : [];

      updateSource({ frequency, interval: 1, weekDays, config: null });
    } else if (!isOldCustom) {
      this.initConfig();
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
        <div className="mTop10 flexRow alignItemsCenter">
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
   * 验证数值控件
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

  /**
   * 初始化config
   */
  initConfig = () => {
    const { data, updateSource } = this.props;

    updateSource({
      config: {
        minute: {
          type: 3,
          values: [moment(data.executeTime).format('m')],
        },
        hour: {
          type: 3,
          values: [moment(data.executeTime).format('H')],
        },
        day: {
          type: 1,
          values: [],
        },
        week: {
          type: 0,
          values: [],
        },
        month: {
          type: 1,
          values: [],
        },
      },
    });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { data, getNodeDetail, checkTimingTriggerConfig } = this.props;

    if (!data.config) return null;

    return (
      <Fragment>
        {md.global.Config.IsLocal && this.renderMinute()}
        {this.renderHour()}
        {this.renderDay()}
        {this.renderMonth()}

        <div
          className="mTop25 webhookBtn InlineBlock"
          onClick={() =>
            checkTimingTriggerConfig(data.config) && getNodeDetail(data.executeTime, JSON.stringify(data.config))
          }
        >
          {_l('生成接下来七次的执行时间')}
        </div>

        {!!data.executeTimes.length && (
          <div className="mTop25 webhookBox">
            <div className="webhookHeader flexRow">
              <div className="bold w140 ellipsis">{_l('序号')}</div>
              <div className="bold mLeft15 flex ellipsis">{_l('日期时间')}</div>
            </div>
            <ul className="webhookList">
              {data.executeTimes.map((item, i) => {
                return (
                  <li className="flexRow" key={i}>
                    <div className="w140">{i + 1}</div>
                    <div className="mLeft15 flex">{item}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染分钟
   */
  renderMinute() {
    const { data } = this.props;
    const list = [
      { text: _l('每分钟都触发'), value: 1 },
      { text: _l('按范围触发'), value: 2 },
      { text: _l('按固定值触发'), value: 3 },
      { text: _l('按一定增量触发'), value: 4 },
    ];

    return (
      <Fragment>
        <div className="Font13 mTop20">{_l('分钟')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={list}
          value={data.config.minute.type}
          border
          onChange={type => this.updateConfigValue({ minute: { type, values: [] } })}
        />

        {this.renderRangeContent('minute')}
        {this.renderFixedContent('minute')}
        {this.renderIncrementContent('minute')}
      </Fragment>
    );
  }

  /**
   * 渲染小时
   */
  renderHour() {
    const { data } = this.props;
    const list = [
      { text: _l('每小时都触发'), value: 1 },
      { text: _l('按范围触发'), value: 2 },
      { text: _l('按固定值触发'), value: 3 },
      { text: _l('按一定增量触发'), value: 4 },
    ];

    return (
      <Fragment>
        <div className="Font13 mTop20">{_l('小时')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={list}
          value={data.config.hour.type}
          border
          onChange={type => this.updateConfigValue({ hour: { type, values: [] } })}
        />

        {this.renderRangeContent('hour')}
        {this.renderFixedContent('hour')}
        {this.renderIncrementContent('hour')}
      </Fragment>
    );
  }

  /**
   * 渲染天
   */
  renderDay() {
    const { data } = this.props;
    const isDay = data.config.day.type !== 0;
    const list = [
      { text: _l('每天都触发'), value: 1 },
      { text: _l('按范围触发'), value: 2 },
      { text: _l('按固定值触发'), value: 3 },
      { text: _l('按一定增量触发'), value: 4 },
      { text: _l('每月的最后一天触发'), value: 5 },
    ];
    const days = [
      { text: moment.localeData()._weekdaysMin[0], value: '1' },
      { text: moment.localeData()._weekdaysMin[1], value: '2' },
      { text: moment.localeData()._weekdaysMin[2], value: '3' },
      { text: moment.localeData()._weekdaysMin[3], value: '4' },
      { text: moment.localeData()._weekdaysMin[4], value: '5' },
      { text: moment.localeData()._weekdaysMin[5], value: '6' },
      { text: moment.localeData()._weekdaysMin[6], value: '7' },
    ];

    return (
      <Fragment>
        <div className="Font13 mTop20">{_l('天/星期')}</div>
        <RadioGroup
          className="mTop5 Font12"
          data={[
            { text: _l('天'), value: 1, checked: isDay },
            { text: _l('星期'), value: 2, checked: !isDay },
          ]}
          onChange={value => {
            if (value === 1) {
              this.updateConfigValue({ day: { type: 1, values: [] }, week: { type: 0, values: [] } });
            } else {
              this.updateConfigValue({
                day: { type: 0, values: [] },
                week: {
                  type: 3,
                  values: [(moment(data.executeTime).day() + 1).toString()],
                },
              });
            }
          }}
        />

        {isDay ? (
          <Dropdown
            className="flowDropdown mTop10"
            data={list}
            value={data.config.day.type}
            border
            onChange={type => this.updateConfigValue({ day: { type, values: [] } })}
          />
        ) : (
          <div className="mTop10 weekList">
            {days.map((item, i) => {
              return (
                <span
                  key={i}
                  className={cx({ ThemeBGColor3: _.includes(data.config.week.values, item.value) })}
                  onClick={() => this.updateFixedConfig('week', item.value)}
                >
                  {item.text}
                </span>
              );
            })}
          </div>
        )}

        {this.renderRangeContent('day')}
        {this.renderFixedContent('day')}
        {this.renderIncrementContent('day')}
      </Fragment>
    );
  }

  /**
   * 渲染月
   */
  renderMonth() {
    const { data } = this.props;
    const list = [
      { text: _l('每月都触发'), value: 1 },
      { text: _l('按固定值触发'), value: 3 },
    ];

    return (
      <Fragment>
        <div className="Font13 mTop20">{_l('月')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={list}
          value={data.config.month.type}
          border
          onChange={type => this.updateConfigValue({ month: { type, values: [] } })}
        />
        {this.renderFixedContent('month')}
      </Fragment>
    );
  }

  /**
   * 更新配置数据
   */
  updateConfigValue(obj) {
    const { data, updateSource } = this.props;

    updateSource({ config: Object.assign({}, { ...data.config }, { ...obj }) });
  }

  /**
   * 渲染范围内容
   */
  renderRangeContent(key) {
    const { data } = this.props;
    const KEYS_ENUM = {
      minute: {
        min: 0,
        max: 59,
      },
      hour: {
        min: 0,
        max: 23,
      },
      day: {
        min: 1,
        max: 31,
      },
    };

    if (data.config[key].type !== 2) return null;

    const start = data.config[key].values[0] || '';
    const end = data.config[key].values[1] || '';

    return (
      <div className="mTop10 flexRow alignItemsCenter">
        <input
          type="text"
          className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
          style={{ height: 36, textAlign: 'right', boxSizing: 'border-box' }}
          placeholder={_l('输入范围')}
          defaultValue={start}
          onKeyUp={evt => this.checkRangeNumber(evt)}
          onPaste={evt => this.checkRangeNumber(evt)}
          onBlur={evt => this.checkRangeNumber(evt, key, KEYS_ENUM[key].min, KEYS_ENUM[key].max, false)}
        />
        <span className="mLeft10 mRight10">~</span>
        <input
          type="text"
          className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
          style={{ height: 36, textAlign: 'right', boxSizing: 'border-box' }}
          placeholder={_l('输入范围')}
          defaultValue={end}
          onKeyUp={evt => this.checkRangeNumber(evt)}
          onPaste={evt => this.checkRangeNumber(evt)}
          onBlur={evt => this.checkRangeNumber(evt, key, KEYS_ENUM[key].min, KEYS_ENUM[key].max, true)}
        />
      </div>
    );
  }

  /**
   * 验证范围开始值、结束值
   */
  checkRangeNumber(evt, key, min, max, isEnd) {
    let num = evt.target.value.replace(/[^\d]/g, '');
    evt.target.value = num;

    if (key) {
      const { data } = this.props;
      let values = [].concat(data.config[key].values);

      num = num.replace(/^0*/, '');

      if (!num || parseInt(num) < parseInt(min)) {
        num = min;
        evt.target.value = num;
      }

      if (parseInt(num) > parseInt(max)) {
        num = max;
        evt.target.value = num;
      }

      // 开始 且 大于结束
      if (!isEnd && values[1] && parseInt(num) > parseInt(values[1])) {
        num = values[1];
        evt.target.value = num;
      }

      // 结束 且 小于开始
      if (isEnd && values[0] && parseInt(num) < parseInt(values[0])) {
        num = values[0];
        evt.target.value = num;
      }

      values[isEnd ? 1 : 0] = num;
      this.updateConfigValue({ [key]: Object.assign({}, { ...data.config[key] }, { values }) });
    }
  }

  /**
   * 渲染固定值
   */
  renderFixedContent(key) {
    const { data } = this.props;
    const values = data.config[key].values;
    const KEYS_ENUM = {
      minute: {
        suffix: _l('分钟'),
        min: 0,
        max: 59,
      },
      hour: {
        suffix: _l('时'),
        min: 0,
        max: 23,
      },
      day: {
        suffix: _l('日'),
        min: 1,
        max: 31,
      },
      month: {
        suffix: _l('月'),
        min: 1,
        max: 12,
      },
    };
    let list = [];

    if (data.config[key].type !== 3) return null;

    for (let i = KEYS_ENUM[key].min; i <= KEYS_ENUM[key].max; i++) {
      list.push({
        text: i.toString().padStart(2, '0'),
        value: i.toString(),
        disabled: _.includes(values, i.toString()),
      });
    }

    return (
      <Dropdown
        className={cx('flowDropdown mTop10 flowDropdownMoreSelect', { flowDropdownDate: key === 'day' })}
        selectClose={false}
        data={list}
        value={values.length || undefined}
        border
        placeholder={_l('请选择')}
        onChange={value => this.updateFixedConfig(key, value)}
        renderTitle={() =>
          !!values.length && (
            <ul className="tagWrap">
              {values.map(value => {
                return (
                  <li key={value} className="tagItem flexRow">
                    <span className="tag">{value + KEYS_ENUM[key].suffix}</span>
                    <span
                      className="delTag"
                      onClick={e => {
                        e.stopPropagation();
                        this.updateFixedConfig(key, value);
                      }}
                    >
                      <Icon icon="close" className="pointer" />
                    </span>
                  </li>
                );
              })}
            </ul>
          )
        }
      />
    );
  }

  /**
   * 更新固定值配置
   */
  updateFixedConfig(key, value) {
    const { data } = this.props;
    const values = [].concat(data.config[key].values);

    if (_.includes(values, value)) {
      _.remove(values, o => o === value);
    } else {
      values.push(value);
    }

    this.updateConfigValue({
      [key]: {
        type: 3,
        values,
      },
    });
  }

  /**
   * 渲染增量内容
   */
  renderIncrementContent(key) {
    const { data } = this.props;
    const KEYS_ENUM = {
      minute: {
        text1: _l('分开始，每隔'),
        text2: _l('分钟'),
        min: 0,
        max: 59,
      },
      hour: {
        text1: _l('时开始，每隔'),
        text2: _l('小时'),
        min: 0,
        max: 23,
      },
      day: {
        text1: _l('日开始，每隔'),
        text2: _l('日'),
        min: 1,
        max: 30,
      },
    };

    if (data.config[key].type !== 4) return null;

    const start = data.config[key].values[0] || '';
    const end = data.config[key].values[1] || '';

    return (
      <div className="mTop10 flexRow alignItemsCenter">
        {_l('从')}
        <input
          type="text"
          className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mLeft15 flex"
          style={{ height: 36, textAlign: 'right', boxSizing: 'border-box' }}
          defaultValue={start}
          onKeyUp={evt => this.checkIncrementStartNumber(evt)}
          onPaste={evt => this.checkIncrementStartNumber(evt)}
          onBlur={evt => this.checkIncrementStartNumber(evt, key, KEYS_ENUM[key].min, KEYS_ENUM[key].max)}
        />
        <span className="mLeft10 mRight10">{KEYS_ENUM[key].text1}</span>
        <input
          type="text"
          className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
          style={{ height: 36, textAlign: 'right', boxSizing: 'border-box' }}
          defaultValue={end}
          onKeyUp={evt => this.checkIncrementNumber(evt)}
          onPaste={evt => this.checkIncrementNumber(evt)}
          onBlur={evt => this.checkIncrementNumber(evt, key)}
        />
        <span className="mLeft10">{KEYS_ENUM[key].text2}</span>
      </div>
    );
  }

  /**
   * 验证增量开始值
   */
  checkIncrementStartNumber(evt, key, min, max) {
    let num = evt.target.value.replace(/[^\d]/g, '');
    evt.target.value = num;

    if (key) {
      const { data } = this.props;
      let values = [].concat(data.config[key].values);

      num = num.replace(/^0*/, '');

      if (!num || parseInt(num) < parseInt(min)) {
        num = min;
        evt.target.value = num;
      }

      if (parseInt(num) > parseInt(max)) {
        num = max;
        evt.target.value = num;
      }

      values[0] = num;
      this.updateConfigValue({ [key]: Object.assign({}, { ...data.config[key] }, { values }) });
    }
  }

  /**
   * 验证增量值
   */
  checkIncrementNumber(evt, key) {
    let num = evt.target.value.replace(/[^\d]/g, '');
    evt.target.value = num;

    if (key) {
      const { data } = this.props;
      let values = [].concat(data.config[key].values);

      num = num.replace(/^0*/, '');
      if (!num) {
        num = '1';
        evt.target.value = num;
      }

      values[1] = num;
      this.updateConfigValue({ [key]: Object.assign({}, { ...data.config[key] }, { values }) });
    }
  }

  render() {
    const { data, updateSource } = this.props;
    const { isOldCustom } = this.state;
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
              selectedValue={data.executeTime ? moment(data.executeTime) : ''}
              timePicker
              allowClear={false}
              timeMode="minute"
              onOk={e =>
                updateSource({ executeTime: e.format('YYYY-MM-DD HH:mm') }, () => {
                  if (data.frequency === DATE_TYPE.WEEK && data.weekDays.length === 1) {
                    updateSource({ weekDays: [e.days()] });
                  }

                  if (data.repeatType === DATE_TYPE.CUSTOM && !isOldCustom && !md.global.Config.IsLocal) {
                    this.updateConfigValue({ minute: { type: 3, values: [e.format('m')] } });
                  }
                })
              }
            >
              {data.executeTime ? moment(data.executeTime).format('YYYY-MM-DD HH:mm') : _l('请选择')}
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

          {data.repeatType !== DATE_TYPE.CUSTOM ? null : isOldCustom ? this.renderOldContent() : this.renderContent()}
        </div>
      </Fragment>
    );
  }
}
