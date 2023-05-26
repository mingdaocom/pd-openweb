import React, { useEffect, useState } from 'react';
import Card from 'statistics/Card';
import { connect } from 'react-redux';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';
import _ from 'lodash';

const ChartDisplay = props => {
  const { widget, filtersGroup } = props;
  const objectId = _.get(widget, 'config.objectId');
  const columnWidthConfig = _.get(widget, 'config.columnWidthConfig');
  const filters = formatFiltersGroup(objectId, filtersGroup);

  useEffect(() => {
    if (columnWidthConfig) {
      sessionStorage.setItem(`pivotTableColumnWidthConfig-${widget.value}`, columnWidthConfig);
    }
  }, []);

  return (
    <Card {...props} filtersGroup={filters.length ? filters : undefined} />
  );
}

export default connect(
  state => ({
    filtersGroup: state.customPage.filtersGroup
  })
)(ChartDisplay);
