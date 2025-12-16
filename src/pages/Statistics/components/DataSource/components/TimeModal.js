import React, { Component, Fragment } from 'react';
import { Button, Checkbox, DatePicker, Input, Modal, Select } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import TimeZoneTag from 'ming-ui/components/TimeZoneTag';
import {
  dropdownScopeData,
  fiscalYearData,
  getTodayTooltip,
  pastAndFutureData,
  timeTypes,
  unitTypes,
} from 'statistics/common';
import { formatNumberFromInput } from 'src/utils/control';

const { RangePicker } = DatePicker;

const newDropdownScopeData = _.cloneDeep(dropdownScopeData.filter(data => ![18, 19].includes(data.value)));

newDropdownScopeData.splice(18, 0, ...pastAndFutureData);

export default class TimeModal extends Component {
  constructor(props) {
    super(props);
    const { filter } = props;
    this.state = {
      filterRangeId: filter.filterRangeId,
      rangeType: filter.rangeType,
      rangeValue: filter.rangeValue,
      today: filter.today,
      dynamicFilter: filter.dynamicFilter || {
        startType: 1,
        startCount: 1,
        startUnit: 1,
        endType: 1,
        endCount: 1,
        endUnit: 1,
      },
      customRangeDay: false,
      dropdownVisible: false,
    };
  }
  handleSave = () => {
    const { controls, onChangeFilter } = this.props;
    const { filterRangeId, rangeType, rangeValue, today, dynamicFilter } = this.state;
    const control = _.find(controls, { controlId: filterRangeId }) || {};
    onChangeFilter({
      filterRangeName: control.controlName,
      filterRangeId,
      rangeType,
      rangeValue,
      today: [4, 8, 11, 15, 18, 19].includes(rangeType) ? today : false,
      ignoreToday: false,
      dynamicFilter,
    });
  };
  renderFooter() {
    const { onCancel } = this.props;
    return (
      <div className="mTop20 mBottom10 pRight8">
        <Button type="link" onClick={onCancel}>
          {_l('取消')}
        </Button>
        <Button
          type="primary"
          onClick={() => {
            this.handleSave();
            onCancel();
          }}
        >
          {_l('确认')}
        </Button>
      </div>
    );
  }
  renderTime() {
    const { filterRangeId } = this.state;
    const { controls } = this.props;
    return (
      <Fragment>
        <div className="Font13">{_l('时间')}</div>
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
      </Fragment>
    );
  }
  renderScope() {
    const { appId } = this.props;
    const { today, rangeType, rangeValue } = this.state;
    const pastAndFutureText = {
      18: _l('过去'),
      19: _l('将来'),
    };
    return (
      <Fragment>
        <div className="Font13 mTop20">{_l('范围')}</div>
        <div className="flexRow valignWrapper mTop5">
          <div className="flex Relative">
            <Select
              className="chartSelect w100"
              value={
                [18, 19].includes(rangeType)
                  ? [7, 30, 365].includes(Number(rangeValue))
                    ? `${rangeType}-${rangeValue}`
                    : `${pastAndFutureText[rangeType]}${rangeValue}${_l('天')}`
                  : rangeType
              }
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                const data = { rangeType: value };
                if (_.isString(value)) {
                  const [rangeType, rangeValue] = value.split('-');
                  data.rangeType = Number(rangeType);
                  data.rangeValue = Number(rangeValue);
                } else if (value === 20) {
                  data.rangeValue = `${moment().add(-7, 'days').format('YYYY/MM/DD')}-${moment().format('YYYY/MM/DD')}`;
                } else if (value === 24) {
                  data.rangeValue = '0:1';
                } else {
                  data.rangeValue = null;
                }
                this.setState(data);
              }}
              onDropdownVisibleChange={visible => {
                this.setState({ dropdownVisible: visible });
              }}
            >
              {newDropdownScopeData.map(item => (
                <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
            <TimeZoneTag appId={appId} position={{ top: 1, bottom: 1 }} />
          </div>
          {rangeType == 20 && this.renderRangePicker()}
          {[4, 8, 11, 15, 18, 19].includes(rangeType) && (
            <div className="flexRow valignWrapper mLeft10">
              <Checkbox
                checked={today}
                onChange={e => {
                  this.setState({ today: e.target.checked });
                }}
              >
                {_l('至今天')}
              </Checkbox>
              <Tooltip title={getTodayTooltip({ rangeType, rangeValue })} placement="bottom">
                <Icon className="Font18 Gray_9e" icon="info" />
              </Tooltip>
            </div>
          )}
        </div>
        {rangeType == 21 && this.renderDynamicFilter()}
        {rangeType == 24 && this.renderFiscalYear()}
      </Fragment>
    );
  }
  renderRangePicker() {
    const { rangeValue } = this.state;
    return (
      <div className="mLeft10">
        <RangePicker
          className="chartInput rangePickerInput"
          allowClear={false}
          suffixIcon={null}
          locale={locale}
          format="YYYY/MM/DD"
          value={rangeValue ? rangeValue.split('-').map(item => moment(item)) : null}
          onChange={date => {
            const [start, end] = date;
            this.setState({
              rangeValue: `${start.format('YYYY/MM/DD')}-${end.format('YYYY/MM/DD')}`,
            });
          }}
        />
      </div>
    );
  }
  renderDynamicFilter() {
    const { dynamicFilter } = this.state;
    const unitValues = [1, 3, 4];
    const changeDynamicFilter = data => {
      this.setState({
        dynamicFilter: {
          ...dynamicFilter,
          ...data,
        },
      });
    };
    return (
      <Fragment>
        <div className="flexRow valignWrapper mTop20">
          <div className="mRight15">{_l('从')}</div>
          <Select
            className="chartSelect flex"
            value={dynamicFilter.startType}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              changeDynamicFilter({
                startType: value,
                startUnit: unitValues.includes(value) ? value : dynamicFilter.startUnit,
              });
            }}
          >
            {timeTypes.map(item => (
              <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
          {[5, 6].includes(dynamicFilter.startType) && (
            <Fragment>
              <Input
                className="chartInput flex mLeft10 mRight10"
                value={dynamicFilter.startCount}
                onChange={event => {
                  const value = event.target.value;
                  changeDynamicFilter({ startCount: formatNumberFromInput(value).replace('-', '') });
                }}
                onBlur={event => {
                  const value = event.target.value;
                  changeDynamicFilter({ startCount: value ? Number(value) : 0 });
                }}
              />
              <Select
                className="chartSelect flex"
                value={dynamicFilter.startUnit}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={value => {
                  changeDynamicFilter({ startUnit: value });
                }}
              >
                {unitTypes.map(item => (
                  <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Fragment>
          )}
        </div>
        <div className="flexRow valignWrapper mTop10">
          <div className="mRight15">{_l('至')}</div>
          <Select
            className="chartSelect flex"
            value={dynamicFilter.endType}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              changeDynamicFilter({
                endType: value,
                endUnit: unitValues.includes(value) ? value : dynamicFilter.endUnit,
              });
            }}
          >
            {timeTypes.map(item => (
              <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
          {[5, 6].includes(dynamicFilter.endType) && (
            <Fragment>
              <Input
                className="chartInput flex mLeft10 mRight10"
                value={dynamicFilter.endCount}
                onChange={event => {
                  const value = event.target.value;
                  changeDynamicFilter({ endCount: formatNumberFromInput(value).replace('-', '') });
                }}
                onBlur={event => {
                  const value = event.target.value;
                  changeDynamicFilter({ startCount: value ? Number(value) : 0 });
                }}
              />
              <Select
                className="chartSelect flex"
                value={dynamicFilter.endUnit}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={value => {
                  changeDynamicFilter({ endUnit: value });
                }}
              >
                {unitTypes.map(item => (
                  <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }
  renderFiscalYear() {
    const { rangeValue } = this.state;
    const [year, month] = rangeValue.split(':');
    return (
      <Fragment>
        <Select
          className="chartSelect w100 mTop10"
          value={Number(year)}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          onChange={value => {
            this.setState({
              rangeValue: `${value}:${month}`,
            });
          }}
        >
          {fiscalYearData.map(item => (
            <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
              {item.text}
            </Select.Option>
          ))}
        </Select>
        <div className="flexRow valignWrapper mTop10">
          <div className="mRight10">{_l('财政年度开始于')}</div>
          <Select
            className="chartSelect flex"
            value={Number(month)}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              this.setState({
                rangeValue: `${year}:${value}`,
              });
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(value => (
              <Select.Option className="selectOptionWrapper" key={value} value={value}>
                {_l('%0月', value)}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Fragment>
    );
  }
  renderContent() {
    return (
      <Fragment>
        {this.renderTime()}
        {this.renderScope()}
      </Fragment>
    );
  }
  render() {
    const { dropdownVisible } = this.state;
    const { visible, onCancel } = this.props;
    return (
      <Modal
        title={_l('时间范围')}
        style={dropdownVisible ? { top: -100 } : {}}
        width={560}
        className="chartModal"
        visible={visible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderFooter()}
        onCancel={onCancel}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}
