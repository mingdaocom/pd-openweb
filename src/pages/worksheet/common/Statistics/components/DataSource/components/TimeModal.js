import React, { Component, Fragment } from 'react';
import { Select, DatePicker, Menu, Divider, Input, Dropdown } from 'antd';
import { Icon } from 'ming-ui';
import { dropdownScopeData, dropdownDayData, isPastAndFuture } from 'src/pages/worksheet/common/Statistics/common';
import cx from 'classnames';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';

const { RangePicker } = DatePicker;

export default class TimeModal extends Component {
  constructor(props) {
    super(props);
    const { filter } = props;
    this.state = {
      filterRangeId: filter.filterRangeId,
      rangeType: filter.rangeType,
      rangeValue: filter.rangeValue,
      customRangeDay: false
    };
  }
  componentWillReceiveProps(nextProps) {
    const { filter } = nextProps;
    this.setState({
      filterRangeId: filter.filterRangeId,
      rangeType: filter.rangeType,
      rangeValue: filter.rangeValue,
    });
  }
  handleSave = () => {
    const { controls } = this.props;
    const { filterRangeId, rangeType, rangeValue } = this.state;
    const control = _.find(controls, { controlId: filterRangeId });
    this.props.onChangeFilter({
      filterRangeName: control.controlName,
      filterRangeId,
      rangeType,
      rangeValue,
    });
  }
  handleSaveRangeDay = () => {
    const { customRangeDay } = this.state;
    const day = customRangeDay > 365 ? 365 : Number(customRangeDay);
    if (day) {
      this.setState({
        rangeValue: day,
        customRangeDay: day
      }, this.handleSave);
    }
  }
  renderFilterRange() {
    const { controls } = this.props;
    const { filterRangeId } = this.state;
    return (
      <div className="pLeft10 pRight10">
        <div className="Font13 Gray_75 mTop10">{_l('时间')}</div>
        <Select
          className="chartSelect w100 mTop5"
          value={filterRangeId}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          onChange={value => {
            this.setState(
              {
                filterRangeId: value,
              },
              this.handleSave,
            );
          }}
        >
          {controls.map(item => (
            <Select.Option className="selectOptionWrapper" key={item.controlId} value={item.controlId}>
              {item.controlName}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }
  renderRangeDayOverlay() {
    const { rangeValue } = this.state;
    return (
      <Menu className="rangeDayOverlayMenu">
        {
          dropdownDayData.map(item => (
            <Menu.Item
              key={item.value}
              className={cx({ active: rangeValue === item.value })}
              onClick={() => {
                this.setState({
                  rangeValue: item.value,
                  customRangeDay: false
                }, this.handleSave);
              }}
            >
              {item.text}
            </Menu.Item>
          ))
        }
      </Menu>
    );
  }
  renderRangeDay() {
    const { rangeValue, customRangeDay } = this.state;
    const range = _.find(dropdownDayData, { value: rangeValue });
    return (
      <div className="pAll10">
        <Dropdown overlay={this.renderRangeDayOverlay()} trigger={['click']}>
          <Input
            value={customRangeDay === false ? (range ? range.text : _l('%0天', rangeValue)) : customRangeDay}
            className="chartInput w100"
            suffix={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={event => {
              let value = event.target.value;
              let count = value.replace(/[^\d]/g, '');
              this.setState({
                customRangeDay: count
              });
            }}
            onBlur={this.handleSaveRangeDay}
            onKeyDown={event => {
              event.which === 13 && this.handleSaveRangeDay();
            }}
          />
        </Dropdown>
      </div>
    );
  }
  renderRangePicker() {
    const { rangeValue } = this.state;
    return (
      <div className="pAll10">
        <RangePicker
          className="chartInput rangePickerInput"
          allowClear={false}
          suffixIcon={null}
          locale={locale}
          format="YYYY/MM/DD"
          value={rangeValue ? rangeValue.split('-').map(item => moment(item)) : null}
          onChange={date => {
            const [start, end] = date;
            this.setState(
              {
                rangeValue: `${start.format('YYYY/MM/DD')}-${end.format('YYYY/MM/DD')}`,
              },
              this.handleSave,
            );
          }}
        />
      </div>
    );
  }
  render() {
    const { rangeType } = this.state;
    return (
      <div className="chartModal chartTimeModal" style={{ height: document.body.clientHeight / 2 }} ref={(el) => this.scrollViewEl = el}>
        {this.renderFilterRange()}
        <Divider className="mTop10 mBottom10" />
        <div className="Font13 Gray_75 pLeft10 pRight10 mBottom10">{_l('选择范围')}</div>
        {dropdownScopeData.map(item => (
          <Fragment key={item.value}>
            {item.value === 20 && <Divider className="mTop5 mBottom5" />}
            <div
              className={cx('scopeDataItem Gray flexRow valignWrapper pointer', { active: rangeType === item.value })}
              onClick={() => {
                const param = {
                  rangeType: item.value,
                }
                const $el = $(this.scrollViewEl.content);
                if (isPastAndFuture(item.value)) {
                  param.rangeValue = 7;
                }
                if (item.value == 20) {
                  // param.rangeValue = [moment().add(-7, 'days'), moment()];
                  param.rangeValue = null;
                }
                this.setState(param, item.value == 20 ? () => {
                  const height = this.scrollViewEl.scrollHeight;
                  this.scrollViewEl.scrollTop = height;
                } : this.handleSave);
              }}
            >
              <span className="flex Font13">{item.text}</span>
              {rangeType === item.value && <Icon className="Font20" icon="done" />}
            </div>
            {rangeType === item.value && isPastAndFuture(rangeType) && this.renderRangeDay()}
            {rangeType === item.value && rangeType == 20 && this.renderRangePicker()}
          </Fragment>
        ))}
      </div>
    );
  }
}
