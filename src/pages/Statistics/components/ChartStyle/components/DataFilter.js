import React, { Component } from 'react';
import { Input, Select } from 'antd';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { reportTypes } from 'statistics/Charts/common';
import { formatNumberFromInput } from 'src/utils/control';

export default class DataFilter extends Component {
  constructor(props) {
    super(props);
    const { showXAxisCount } = props;
    this.state = {
      count: showXAxisCount,
      showXAxisType: showXAxisCount < 0 ? 0 : 1,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.showXAxisCount !== this.props.showXAxisCount) {
      this.setState({
        count: nextProps.showXAxisCount,
        showXAxisType: nextProps.showXAxisCount < 0 ? 0 : 1,
      });
    }
  }
  getText() {
    const { name, reportType } = this.props;
    if ([reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes].includes(reportType)) {
      return _l('X轴');
    }
    if (reportType === reportTypes.PieChart) {
      return _l('分区');
    }
    if (reportType === reportTypes.RadarChart) {
      return _l('维度');
    }
    if (reportType === reportTypes.FunnelChart) {
      return _l('分组');
    }
    if (reportType === reportTypes.PivotTable) {
      return name;
    }
    return _l('行数据');
  }
  handleSaveCount = () => {
    const { showXAxisCount } = this.props;
    const { count, showXAxisType } = this.state;
    if (showXAxisCount !== count) {
      this.props.onChange(showXAxisType ? Math.abs(count) : -Math.abs(count));
    }
  };
  render() {
    const { className } = this.props;
    const { count, showXAxisType } = this.state;
    return (
      <div className={cx('flexRow valignWrapper mBottom16', className)}>
        <span>{_l('显示%0', this.getText())}</span>
        <div className="addonBeforeWrapper valignWrapper mLeft5 mRight5">
          <Select
            className="chartSelect"
            style={{ width: 60 }}
            value={showXAxisType}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              const newCount = value ? Math.abs(count) : -Math.abs(count);
              this.setState(
                {
                  count: newCount,
                  showXAxisType: value,
                },
                this.handleSaveCount,
              );
            }}
          >
            <Select.Option className="selectOptionWrapper" key={1} value={1}>
              {_l('前')}
            </Select.Option>
            <Select.Option className="selectOptionWrapper" key={0} value={0}>
              {_l('后')}
            </Select.Option>
          </Select>
          <Input
            style={{ width: 130, paddingLeft: 70 }}
            className="chartInput"
            value={count ? Math.abs(count).toString() : ''}
            onBlur={this.handleSaveCount}
            onKeyDown={event => {
              event.which === 13 && this.handleSaveCount();
            }}
            onChange={event => {
              let value = formatNumberFromInput(event.target.value);
              let count = parseInt(value || 0);
              count = count > 1000 ? 1000 : count;
              this.setState({
                count,
              });
            }}
          />
        </div>
        <span>{_l('项')}</span>
      </div>
    );
  }
}
