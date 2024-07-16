import React, { Component } from 'react';
import Chart from 'statistics/Card';
import './index.less';

const PrintPivotTable = (props) => {
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
      onLoad={(result) => {
        document.title = result.name;
        setTimeout(window.print, 100);
      }}
    />
  );
}

export default PrintPivotTable;
