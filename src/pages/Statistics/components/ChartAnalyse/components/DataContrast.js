import React, { Component, Fragment } from 'react';
import { Checkbox, DatePicker, Select } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { Icon } from 'ming-ui';
import { formatContrastTypes, formatLineChartContrastTypes } from 'statistics/common';

const { RangePicker } = DatePicker;

export default class DataContrast extends Component {
  constructor(props) {
    super(props);
    const { displaySetup, filter } = this.props.currentReport;
    this.state = {
      customRangeVisible: displaySetup.contrastType === 5 && filter.customRangeValue,
    };
  }
  handleChangeLifecycle = checked => {
    this.props.onChangeDisplaySetup({
      isLifecycle: checked,
      lifecycleValue: 0,
    });
  };
  handleChangeDropdown = data => {
    this.props.onChangeDisplaySetup(data, true);
  };
  renderNumberChartContrast() {
    const { customRangeVisible } = this.state;
    const { currentReport } = this.props;
    const { displaySetup, filter } = currentReport;
    const contrastTypes = formatContrastTypes(filter);
    const { customRangeValue, ignoreToday = false } = filter;
    return (
      <div className="mBottom16">
        <div className="flexRow mBottom8">
          <Checkbox
            checked={displaySetup.contrast}
            onChange={event => {
              const { checked } = event.target;
              this.props.onChangeDisplaySetup(
                {
                  contrast: checked,
                },
                true,
              );
            }}
          >
            {_l('环比')}
          </Checkbox>
        </div>
        {(!!contrastTypes.length || [4, 8, 11].includes(filter.rangeType)) && (
          <div className="flexRow mBottom8">
            <Checkbox
              checked={displaySetup.contrastType}
              onChange={event => {
                const { checked } = event.target;
                this.props.onChangeCurrentReport(
                  {
                    displaySetup: {
                      ...displaySetup,
                      contrastType: checked ? 2 : 0,
                    },
                    filter: {
                      ...filter,
                      ignoreToday: filter.today ? true : false,
                    },
                  },
                  true,
                );
              }}
            >
              {_l('同比')}
            </Checkbox>
          </div>
        )}
        {!!displaySetup.contrastType && !!contrastTypes.length && (
          <Select
            className="chartSelect w100"
            // value={_.findIndex(contrastTypes, { value: customRangeVisible ? 5 : displaySetup.contrastType, ignoreToday: ignoreToday ? ignoreToday : undefined })}
            // value={customRangeVisible ? 5 : displaySetup.contrastType}
            value={
              customRangeVisible
                ? 5
                : ignoreToday
                  ? `${displaySetup.contrastType}-ignoreToday`
                  : displaySetup.contrastType
            }
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              if (value === 5) {
                this.setState({ customRangeVisible: true });
                const value = `${moment().add(-7, 'days').format('YYYY/MM/DD')}-${moment().format('YYYY/MM/DD')}`;
                this.props.onChangeCurrentReport(
                  {
                    displaySetup: {
                      ...displaySetup,
                      contrastType: 5,
                    },
                    filter: {
                      ...filter,
                      customRangeValue: value,
                    },
                  },
                  true,
                );
              } else {
                const isIgnoreToday = _.isString(value);
                let contrastType = isIgnoreToday ? Number(value.split('-')[0]) : value;
                this.setState({ customRangeVisible: false });
                this.props.onChangeCurrentReport(
                  {
                    displaySetup: {
                      ...displaySetup,
                      contrastType,
                    },
                    filter: {
                      ...filter,
                      ignoreToday: isIgnoreToday ? true : false,
                    },
                  },
                  true,
                );
              }
            }}
          >
            {contrastTypes.map(item => (
              <Select.Option
                className="selectOptionWrapper"
                key={item.ignoreToday ? `${item.value}-ignoreToday` : item.value}
                value={item.ignoreToday ? `${item.value}-ignoreToday` : item.value}
              >
                {item.text}
              </Select.Option>
            ))}
          </Select>
        )}
        {customRangeVisible && (
          <RangePicker
            className="chartInput w100 mTop10"
            allowClear={false}
            suffixIcon={null}
            locale={locale}
            format="YYYY/MM/DD"
            value={
              customRangeValue
                ? customRangeValue.split('-').map(item => moment(item))
                : [moment().add(-7, 'days'), moment()]
            }
            onChange={date => {
              const [start, end] = date;
              const value = `${start.format('YYYY/MM/DD')}-${end.format('YYYY/MM/DD')}`;
              this.props.onChangeCurrentReport(
                {
                  displaySetup: {
                    ...displaySetup,
                    contrastType: 5,
                  },
                  filter: {
                    ...filter,
                    customRangeValue: value,
                  },
                },
                true,
              );
            }}
          />
        )}
      </div>
    );
  }
  renderLineChartContrast() {
    const { currentReport } = this.props;
    const { displaySetup, filter } = currentReport;
    const contrastTypes = formatLineChartContrastTypes(filter);
    return (
      <div className="mBottom16">
        <Select
          className="chartSelect w100"
          value={displaySetup.contrastType || 0}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          onChange={valaue => {
            this.handleChangeDropdown({ contrastType: valaue });
          }}
        >
          {contrastTypes.map(item => (
            <Select.Option className="selectOptionWrapper" disabled={item.disabled} key={item.value} value={item.value}>
              {item.text}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }
  render() {
    const { contrastVisible, isNumberChart } = this.props;
    return (
      <Fragment>
        {contrastVisible && (isNumberChart ? this.renderNumberChartContrast() : this.renderLineChartContrast())}
      </Fragment>
    );
  }
}
