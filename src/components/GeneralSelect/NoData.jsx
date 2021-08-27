import React from 'react';
import './css/noData.less';

const NoData = props => {
  return (
    <div className="GSelect-NoData">
      <i className="icon-search GSelect-iconNoData" />
      <p className="GSelect-noDataText">{props.children}</p>
    </div>
  );
};

export default NoData;
