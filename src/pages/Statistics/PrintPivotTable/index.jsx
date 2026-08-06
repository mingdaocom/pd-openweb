import React from 'react';
import _ from 'lodash';
import Chart from 'statistics/Card';
import './index.less';

const getPrintDelay = result => {
  const rowCount = _.get(result, 'data.data[0].data.length') || 0;
  const columnCount = _.get(result, 'data.data.length') || 0;
  const delay = window.isWindows ? 2.5 : 2;
  const minDelay = window.isWindows ? 500 : 300;
  return Math.min(Math.max(rowCount * delay, columnCount * delay, minDelay), 5000);
};

const PrintPivotTable = props => {
  const { match = {} } = props;
  const { params } = match;
  const { reportId, themeColor } = params;
  return (
    <Chart
      report={{ id: reportId }}
      themeColor={decodeURIComponent(themeColor)}
      needEnlarge={false}
      needTimingRefresh={false}
      needRefresh={false}
      onLoad={result => {
        document.title = result.name;
        setTimeout(() => {
          document.querySelector('#containerWrapper').classList.add('print');
          window.print();
        }, getPrintDelay(result));
      }}
    />
  );
};

export default PrintPivotTable;
