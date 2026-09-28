import React, { Component } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Input, Select, Space } from 'ming-ui/antd-components';
import { formatNumberFromInput } from 'src/utils/domain/control/number';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';

export default class DataFilter extends Component {
  constructor(props) {
    super(props);
    const { showXAxisCount } = props;
    this.state = {
      count: showXAxisCount,
      showXAxisType: showXAxisCount < 0 ? 0 : 1,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.showXAxisCount !== prevProps.showXAxisCount) {
        this.setState({
          count: this.props.showXAxisCount,
          showXAxisType: this.props.showXAxisCount < 0 ? 0 : 1,
        });
      }
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
        <div className="valignWrapper flex mLeft5 mRight5">
          <Space.Compact>
            <Select
              value={showXAxisType}
              suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
              options={[
                {
                  value: 1,
                  label: _l('前'),
                },
                {
                  value: 0,
                  label: _l('后'),
                },
              ]}
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
            />
            <Input
              value={count ? Math.abs(count).toString() : ''}
              onBlur={this.handleSaveCount}
              suffix={_l('项')}
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
          </Space.Compact>
        </div>
      </div>
    );
  }
}
