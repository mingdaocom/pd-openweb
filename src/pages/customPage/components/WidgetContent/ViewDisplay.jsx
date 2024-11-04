import React, { useEffect, useState } from 'react';
import { View } from '../editWidget/view/Preview';
import { LoadDiv } from 'ming-ui';
import { connect } from 'react-redux';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';
import _ from 'lodash';

const emptyArray = [];

const ViewDisplay = props => {
  const { setting, filterComponents, loadFilterComponentCount } = props;
  const objectId = _.get(setting, 'config.objectId');
  const filtersGroup = formatFiltersGroup(objectId, props.filtersGroup);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const customPageContent = document.querySelector('#componentsWrap');
    window[`refresh-${objectId}`] = () => {
      setVisible(false);
      setTimeout(() => {
        setVisible(true);
      }, 100);
    }
    if (!customPageContent || customPageContent.classList.contains('adjustScreen')) {
      setVisible(true);
      return;
    }
    const view = customPageContent.querySelector(`.widgetContent .view-${setting.id}`);
    const checkVisible = () => {
      if (!visible) {
        const pageRect = customPageContent.getBoundingClientRect();
        const rect = view.getBoundingClientRect();
        const value = rect.top <= pageRect.bottom;
        value && setVisible(value);
      }
    }
    customPageContent.addEventListener('scroll', checkVisible, false);
    checkVisible();
    return () => {
      customPageContent.removeEventListener('scroll', checkVisible, false);
      delete window[`refresh-${objectId}`];
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
    <View {...props} filtersGroup={filtersGroup.length ? filtersGroup : emptyArray} />
  );
}

export default connect(
  (state, ownProps) => ({
    filtersGroup: state.customPage.filtersGroup,
    filterComponents: state.customPage.filterComponents.filter(n => ownProps.layoutType === 'mobile' ? n.mobileVisible : true),
    loadFilterComponentCount: state.customPage.loadFilterComponentCount,
  })
)(ViewDisplay);
