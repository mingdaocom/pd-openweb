import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Select, Input } from 'antd';
import { formatContrastTypes } from 'src/pages/worksheet/common/Statistics/common';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';

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
  };
  handleChangeDropdown = value => {
    const { displaySetup } = this.props.currentReport;
    this.props.onUpdateDisplaySetup(
      {
        ...displaySetup,
        contrastType: value,
      },
      true,
    );
  };
  handleUpdateLifecycleValue = value => {
    const { displaySetup } = this.props.currentReport;
    this.props.onUpdateDisplaySetup({
      ...displaySetup,
      lifecycleValue: Number(value.replace(/[^\d.]/g, '')),
    });
  };
  render() {
    const { xAxisisTime, currentReport, mapKeys } = this.props;
    const { displaySetup, reportType, filter } = currentReport;
    return (
      <Fragment>
        {reportType === reportTypes.LineChart && (
          <div className="mBottom16">
            <div className="mBottom8">{_l('周期目标')}</div>
            <Input
              className="chartInput w100"
              value={displaySetup.lifecycleValue ? displaySetup.lifecycleValue.toString() : ''}
              onChange={event => {
                this.handleUpdateLifecycleValue(event.target.value);
              }}
            />
          </div>
        )}
        {(mapKeys.length < 2 && xAxisisTime) ||
        [reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType) ? (
          <div className="mBottom16">
            <div className="mBottom8">{_l('对比')}</div>
            <Select
              className="chartSelect w100"
              value={displaySetup.contrastType}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={this.handleChangeDropdown}
            >
              {formatContrastTypes(filter).map(item => (
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
        ) : null}
      </Fragment>
    );
  }
}
