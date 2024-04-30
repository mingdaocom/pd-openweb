import React, { useEffect, useState } from 'react';
import { LoadDiv } from 'ming-ui';
import Card from 'statistics/Card';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';
import { updateLinkageFiltersGroup } from 'src/pages/customPage/redux/action.js';
import { formatLinkageFiltersGroup } from 'src/pages/customPage/util';
import _ from 'lodash';

const ChartDisplay = props => {
  const { widget, filterComponents, loadFilterComponentCount } = props;
  const objectId = _.get(widget, 'config.objectId');
  const columnWidthConfig = _.get(widget, 'config.columnWidthConfig');
  const [visible, setVisible] = useState(false);
  const [sheetId, setSheetId] = useState(null);
  const filtersGroup = formatFiltersGroup(objectId, props.filtersGroup);
  const { linkageFiltersGroup = [], initiateChartIds = [] } = sheetId ? formatLinkageFiltersGroup({ sheetId, reportId: widget.value, objectId }, props.linkageFiltersGroup) : {};

  useEffect(() => {
    const customPageContent = document.querySelector('#componentsWrap');
    if (!customPageContent || customPageContent.classList.contains('adjustScreen')) {
      setVisible(true);
      return;
    }
    const chat = customPageContent.querySelector(`.widgetContent .analysis-${widget.id}`);
    const checkVisible = () => {
      if (!visible) {
        const pageRect = customPageContent.getBoundingClientRect();
        const rect = chat.getBoundingClientRect();
        const value = rect.top <= pageRect.bottom;
        value && setVisible(value);
      }
    }
    customPageContent.addEventListener('scroll', checkVisible, false);
    checkVisible();
    if (columnWidthConfig) {
      sessionStorage.setItem(`pivotTableColumnWidthConfig-${widget.value}`, columnWidthConfig);
    }
    return () => {
      customPageContent.removeEventListener('scroll', checkVisible, false);
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

  if (!visible) {
    return (
      <div className="w100 h100 flexRow alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    );
  }

  return (
    <Card
      {...props}
      linkageMatch={props.linkageFiltersGroup[widget.id]}
      filtersGroup={filtersGroup.length ? filtersGroup : undefined}
      linkageFiltersGroup={linkageFiltersGroup.length ? linkageFiltersGroup : undefined}
      initiateChartInfo={initiateChartIds.map(id => props.linkageFiltersGroup[id])}
      onUpdateLinkageFiltersGroup={data => {
        data.objectId = objectId;
        data.widgetId = widget.id;
        props.updateLinkageFiltersGroup({
          value: widget.id,
          filters: data
        });
      }}
      onLoad={result => setSheetId(result.appId)}
    />
  );
}

export default connect(
  state => ({
    filtersGroup: state.customPage.filtersGroup,
    linkageFiltersGroup: state.customPage.linkageFiltersGroup,
    filterComponents: state.customPage.filterComponents,
    loadFilterComponentCount: state.customPage.loadFilterComponentCount,
  }),
  dispatch => bindActionCreators({ updateLinkageFiltersGroup }, dispatch)
)(ChartDisplay);
