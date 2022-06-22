import React from 'react';
import { Overload } from 'statistics/components/ChartStatus';
import { reportTypes } from '../Charts/common';

const verificationDataLength = (Component) => {
  class VerificationDataLength extends React.Component {
    get isOverload() {
      const { reportData } = this.props;
      const { map = [], contrastMap = [], aggregations = [] } = reportData;
      if ([reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes].includes(reportData.reportType)) {
        const max = 10000;
        const length = map.length * (_.get(map[0], ['value', 'length']) || 1);
        return length > max;
      }
      if ([reportTypes.LineChart, reportTypes.DualAxes].includes(reportData.reportType)) {
        const max = 10000;
        const length = contrastMap.length * (_.get(contrastMap[0], ['value', 'length']) || 1);
        return length > max;
      }
      if ([reportTypes.RadarChart].includes(reportData.reportType)) {
        const max = 5000;
        const length = map.length * (_.get(map[0], ['value', 'length']) || 1);
        return length > max;
      }
      if ([reportTypes.FunnelChart].includes(reportData.reportType)) {
        const max = 5000;
        const mapLength = map.length * (_.get(map[0], ['value', 'length']) || 1);
        const contrastMapLength = contrastMap.length * (_.get(contrastMap[0], ['value', 'length']) || 1);
        return mapLength > max || contrastMapLength > max;
      }
      if ([reportTypes.PieChart].includes(reportData.reportType)) {
        const max = 500;
        const length = aggregations.length;
        return length > max;
      }
      return false;
    }
    render() {
      return (
        this.isOverload ? (
          <Overload />
        ) : (
          <Component {...this.props} />
        )
      );
    }
  }

  return VerificationDataLength;
}

export default Component => {
  return verificationDataLength(Component);
}
