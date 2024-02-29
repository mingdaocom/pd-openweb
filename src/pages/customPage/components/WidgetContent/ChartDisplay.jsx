import React, { useEffect, useState } from 'react';
import { LoadDiv } from 'ming-ui';
import Card from 'statistics/Card';
import { connect } from 'react-redux';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';
import _ from 'lodash';

const ChartDisplay = props => {
  const { widget, filterComponents, loadFilterComponentCount } = props;
  const objectId = _.get(widget, 'config.objectId');
  const columnWidthConfig = _.get(widget, 'config.columnWidthConfig');
  const filtersGroup = formatFiltersGroup(objectId, props.filtersGroup);

  useEffect(() => {
    if (columnWidthConfig) {
      sessionStorage.setItem(`pivotTableColumnWidthConfig-${widget.value}`, columnWidthConfig);
    }
  }, []);

  if (!_.get(window, 'shareState.shareId') && filterComponents.length && loadFilterComponentCount < filterComponents.length) {
    return (
      <div className="w100 h100 flexRow alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    );
  }

  const isClickSearch = !!filterComponents.map(data => {
    const { filters, advancedSetting = {} } = data;
    const result = _.find(filters, { objectId });
    return result && advancedSetting.clicksearch === '1';
  }).filter(n => n).length;

  if (isClickSearch && !filtersGroup.length) {
    return (
      <div className="w100 h100 flexRow alignItemsCenter justifyContentCenter">
        <span className="Font15 bold Gray_9e">{_l('执行查询后显示结果')}</span>
      </div>
    );
  }

  return (
    <Card {...props} filtersGroup={filtersGroup.length ? filtersGroup : undefined} />
  );
}

export default connect(
  state => ({
    filtersGroup: state.customPage.filtersGroup,
    filterComponents: state.customPage.filterComponents,
    loadFilterComponentCount: state.customPage.loadFilterComponentCount,
  })
)(ChartDisplay);
