import React, { Component } from 'react';
import { func } from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import DateRangePicker from 'ming-ui/components/NewDateTimePicker/date-time-range';
import Dropdown from '../../components/Dropdown';
import Search from '../../components/Search';
import { FLOW_STATUS } from './config';

export default class HistoryHeader extends Component {
  static propTypes = {
    onFilter: func,
  };
  static defaultProps = {
    onFilter: () => {},
  };

  state = {
    status: 'all',
    time: ['', ''],
    searchVal: '',
  };

  formatData = (data) => {
    return Object.keys(data).map(key => ({ ...data[key], value: key }));
  };

  renderTimePlaceholder = () => {
    const { time } = this.state;
    const [startTime, endTime] = this.formatTime(time);
    if (!startTime && !endTime) return <span className="placeholder">{_l('筛选时间范围')}</span>;
    return `${startTime} ~ ${endTime}`;
  };

  formatTime = time => time.map(item => item && moment(item).format('YYYY/MM/DD HH:mm'));

  handleClearFilter = () => {
    this.setState({ status: 'all', time: ['', ''], searchVal: '' }, this.onFilterParaChanged);
  };

  handlePara = () => {
    const { status, time, searchVal } = this.state;
    const [startDate, endDate] = this.formatTime(time);
    const para = {};
    status && status !== 'all' && Object.assign(para, { status });
    searchVal && Object.assign(para, { title: searchVal });
    startDate && Object.assign(para, { startDate });
    endDate && Object.assign(para, { endDate });
    return para;
  };

  onFilterParaChanged = () => {
    this.props.onFilter(this.handlePara());
  };

  handleFilter = (obj) => {
    this.setState(obj, this.onFilterParaChanged);
  };

  render() {
    const { status, time } = this.state;
    const data = this.formatData(FLOW_STATUS);
    data.unshift({ value: 'all', text: _l('所有状态') });
    return (
      <div className="historyHeader">
        <div className="statusDropdown">
          <Dropdown
            className="historyHeaderStatusDropdown"
            onChange={status => this.handleFilter({ status })}
            selectedValue={status}
            data={data}
            placeholder={_l('所有状态')}
          />
        </div>
        <DateRangePicker
          mode="datetime"
          timeMode="minute"
          placeholder={_l('筛选时间范围')}
          selectedValue={time}
          children={
            <div className="filterTimeRange">
              <div className="timeContent">{this.renderTimePlaceholder()}</div>
              <Icon icon="bellSchedule" className="Gray_9e Font18" />
            </div>
          }
          onOk={time => this.handleFilter({ time })}
          onClear={() => this.handleFilter({ time: ['', ''] })}
        />
        {(status !== 'all' || time[0]) && (
          <div className="clearFilter ThemeColor3" onClick={this.handleClearFilter}>
            {_l('清除筛选')}
          </div>
        )}
        <div className="flex" />
        <div className="filterName">
          <Search handleChange={searchVal => this.handleFilter({ searchVal })} />
        </div>
      </div>
    );
  }
}
