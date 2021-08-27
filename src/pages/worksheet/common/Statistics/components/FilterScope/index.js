import React, { Fragment, Component } from 'react';
import Trigger from 'rc-trigger';
import { Select, DatePicker } from 'antd';
import { Icon, ScrollView, Menu, MenuItem, Tooltip } from 'ming-ui';
import { dropdownScopeData, dropdownDayData, isPastAndFuture, isSystemControl, timeParticleSizeDropdownData } from 'src/pages/worksheet/common/Statistics/common';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import worksheetAjax from 'src/api/worksheet';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';

const { RangePicker } = DatePicker;

export default class extends Component {
  constructor(props) {
    super();
    const { filter } = props.currentReport;
    this.state = {
      dropdownScopeValue: filter.rangeType,
      dropdownDayValue: filter.rangeValue || 7,
    }
  }
  componentDidMount() {
  }
  handleUpdateScope = value => {
    this.setState({
      dropdownScopeValue: value,
      dropdownDayValue: value === 20 ? `${moment().add(-7, 'days').format('YYYY/MM/DD')}-${moment().format('YYYY/MM/DD')}` : isPastAndFuture(value) ? 7 : null,
    }, () => {
      this.handleSave();
    });
  }
  handleUpdateDay = value => {
    this.setState({
      dropdownDayValue: value,
    }, () => {
      this.handleSave();
    });
  }
  handleSave() {
    const { filter } = this.props.currentReport;
    const { dropdownScopeValue, dropdownDayValue } = this.state;
    this.props.onUpdateFilter({
      ...filter,
      rangeType: dropdownScopeValue,
      rangeValue: dropdownDayValue
    });
  }
  render() {
    const { dropdownScopeValue, dropdownDayValue } = this.state;
    const { filterItem, projectId, worksheetInfo, currentReport, xAxisisTime } = this.props;
    const { filter, xaxes } = currentReport;
    return (
      <div className="ChartDialogSetting setting flexColumn ChartFilterPanel">
        <ScrollView className="flex">
          <div className="pLeft20 pRight20 pBottom10">
            <div className="item borderNone pTop20">
              <div className="title Font18 Bold">{_l('统计范围')}</div>
              <div className="Font12 Bold mBottom10 mTop10">{_l('范围')}</div>
              <Select
                className="chartSelect w100"
                value={dropdownScopeValue}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={this.handleUpdateScope}
              >
                {dropdownScopeData.map(item => (
                  <Select.Option
                    className="selectOptionWrapper"
                    key={item.value}
                    value={item.value}
                  >
                    {item.text}
                  </Select.Option>
                ))}
              </Select>
              {xAxisisTime && (
                <Fragment>
                  <div className="Font12 Bold mBottom10 mTop10">{_l('粒度')}</div>
                  <Select
                    className="chartSelect w100"
                    value={xaxes.particleSizeType}
                    suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                    onChange={value => {
                      this.props.onChangeCurrentReport({ particleSizeType: value }, true);
                    }}
                  >
                    {timeParticleSizeDropdownData.map(item => (
                      <Select.Option
                        className="selectOptionWrapper"
                        key={item.value}
                        value={item.value}
                      >
                        {item.text}
                      </Select.Option>
                    ))}
                  </Select>
                </Fragment>
              )}
              {isPastAndFuture(dropdownScopeValue) ? (
                <Select
                  className="chartSelect w100 mTop10"
                  value={Number(dropdownDayValue)}
                  suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                  onChange={this.handleUpdateDay}
                >
                  {dropdownDayData.map(item => (
                    <Select.Option
                      className="selectOptionWrapper"
                      key={item.value}
                      value={item.value}
                    >
                      {item.text}
                    </Select.Option>
                  ))}
                </Select>
              ) : null}
              {
                dropdownScopeValue === 20 && (
                  <RangePicker
                    className="chartInput w100 mTop10"
                    allowClear={false}
                    suffixIcon={null}
                    locale={locale}
                    format="YYYY/MM/DD"
                    value={dropdownDayValue ? dropdownDayValue.split('-').map(item => moment(item)) : [moment().add(-7, 'days'), moment()]}
                    onChange={date => {
                      const [start, end] = date;
                      this.setState({
                        dropdownDayValue: `${start.format('YYYY/MM/DD')}-${end.format('YYYY/MM/DD')}`,
                      }, this.handleSave);
                    }}
                  />
                )
              }
              <div
                className="Font12 Bold mBottom10 mTop20 pTop10 flexRow"
                style={{borderTop: '1px solid #E0E0E0'}}
              >
                <span className="flex">{_l('筛选')}</span>
              </div>
              <SingleFilter
                canEdit
                projectId={projectId}
                columns={worksheetInfo.columns}
                conditions={filterItem}
                onConditionsChange={(conditions, localConditions) => {
                  this.props.onUpdateFilter({
                    ...filter,
                    filterControls: conditions,
                  });
                }}
              />
            </div>
          </div>
        </ScrollView>
      </div>
    );
  }
}
