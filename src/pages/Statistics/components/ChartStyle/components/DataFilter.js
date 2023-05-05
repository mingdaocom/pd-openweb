import React, { Component } from 'react';
import { Input } from 'antd';
import { reportTypes } from 'statistics/Charts/common';
import cx from 'classnames';
import { formatNumberFromInput } from 'src/util';

export default class DataFilter extends Component {
  constructor(props) {
    super(props);
    const { showXAxisCount } = props;
    this.state = {
      count: showXAxisCount,
    };
  }
  getText() {
    const { currentReport, name, reportType } = this.props;
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
    const { count } = this.state;
    if (showXAxisCount !== count) {
      this.props.onChange(count);
    }
  };
  render() {
    const { className } = this.props;
    const { count } = this.state;
    return (
      <div className={cx('flexRow valignWrapper mBottom16', className)}>
        <span>{_l('显示%0', this.getText())}</span>
        <span>
          {_l('前')}
          <Input
            style={{ width: 100 }}
            className="chartInput mLeft10 mRight10"
            value={count ? count.toString() : ''}
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
          {_l('项')}
        </span>
      </div>
    );
  }
}
