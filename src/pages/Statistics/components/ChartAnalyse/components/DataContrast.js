import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Select, Checkbox } from 'antd';
import { formatContrastTypes, formatLineChartContrastTypes } from 'statistics/common';
import { reportTypes } from 'statistics/Charts/common';

export default class DataContrast extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeLifecycle = checked => {
    const { displaySetup } = this.props.currentReport;
    this.props.onUpdateDisplaySetup({
      ...displaySetup,
      isLifecycle: checked,
      lifecycleValue: 0,
    });
  }
  handleChangeDropdown = value => {
    const { displaySetup } = this.props.currentReport;
    this.props.onUpdateDisplaySetup(
      {
        ...displaySetup,
        contrastType: value,
      },
      true,
    );
  }
  renderNumberChartContrast() {
    const { currentReport } = this.props;
    const { displaySetup, filter } = currentReport;
    const contrastTypes = formatContrastTypes(filter);
    return (
      <div className="mBottom16">
        <div className="flexRow mBottom8">
          <Checkbox
            checked={displaySetup.contrast}
            onChange={(event) => {
              const { checked } = event.target;
              this.props.onUpdateDisplaySetup({
                ...displaySetup,
                contrast: checked
              }, true);
            }}
          >
            {_l('环比')}
          </Checkbox>
        </div>
        {!!contrastTypes.length && (
          <div className="flexRow mBottom8">
            <Checkbox
              checked={displaySetup.contrastType}
              onChange={(event) => {
                const { checked } = event.target;
                this.props.onUpdateDisplaySetup({
                  ...displaySetup,
                  contrastType: checked ? 2 : 0
                }, true);
              }}
            >
              {_l('同比')}
            </Checkbox>
          </div>
        )}
        {!!displaySetup.contrastType && !!contrastTypes.length && (
          <Select
            className="chartSelect w100"
            value={displaySetup.contrastType}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={this.handleChangeDropdown}
          >
            {contrastTypes.map(item => (
              <Select.Option
                className="selectOptionWrapper"
                key={item.value}
                value={item.value}
              >
                {item.text}
              </Select.Option>
            ))}
          </Select>
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
          onChange={this.handleChangeDropdown}
        >
          {contrastTypes.map(item => (
            <Select.Option
              className="selectOptionWrapper"
              disabled={item.disabled}
              key={item.value}
              value={item.value}
            >
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
        {contrastVisible && (
          isNumberChart ? this.renderNumberChartContrast() : this.renderLineChartContrast()
        )}
      </Fragment>
    );
  }
}
