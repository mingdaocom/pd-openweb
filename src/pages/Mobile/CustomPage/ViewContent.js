import React, { useEffect, useState, Fragment } from 'react';
import { SpinLoading } from 'antd-mobile';
import { connect } from 'react-redux';
import { View } from 'src/pages/customPage/components/editWidget/view/Preview';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';
import _ from 'lodash';

const emptyArray = [];

function ViewContent(props) {
  const { setting, filterComponents, loadFilterComponentCount } = props;
  const objectId = _.get(setting, 'config.objectId');
  const filtersGroup = formatFiltersGroup(objectId, props.filtersGroup);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const customPageContent = document.querySelector('#componentsWrap');
    if (!customPageContent) {
      setVisible(true);
      return;
    }
    const view = customPageContent.querySelector(`.widgetContent .view-${setting.id}`);
    const checkVisible = () => {
      if (!view) {
        setVisible(true);
        return;
      }
      if (!visible) {
        const pageRect = customPageContent.getBoundingClientRect();
        const rect = view.getBoundingClientRect();
        const value = rect.top <= pageRect.bottom;
        value && setVisible(true);
      }
    }
    customPageContent.addEventListener('scroll', checkVisible, false);
    checkVisible();
    window[`refresh-${objectId}`] = () => {
      setVisible(false);
      setTimeout(() => {
        setVisible(true);
      }, 100);
    }
    return () => {
      customPageContent.removeEventListener('scroll', checkVisible, false);
      delete window[`refresh-${objectId}`];
    }
  }, []);

  if (
    !_.get(window, 'shareState.shareId') &&
    !setting.tabId &&
    !_.get(window, 'shareState.shareId') &&
    filterComponents.length &&
    loadFilterComponentCount < filterComponents.length
  ) {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter w100 h100">
        <SpinLoading color='primary' />
      </div>
    );
  }

  const isClickSearch = !!filterComponents.map(data => {
    const { filters, advancedSetting } = data;
    const result = _.find(filters, { objectId });
    return result && advancedSetting.clicksearch === '1';
  }).filter(n => n).length;

  if (isClickSearch && !filtersGroup.length) {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter w100 h100">
        <span className="Font15 bold Gray_9e">{_l('执行查询后显示结果')}</span>
      </div>
    );
  }

  if (!visible) {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter w100 h100">
        <SpinLoading color='primary' />
      </div>
    );
  }

  return (
    <View {...props} filtersGroup={filtersGroup.length ? filtersGroup : emptyArray} />
  );
}

export default connect(
  state => ({
    filtersGroup: state.mobile.filtersGroup,
    filterComponents: state.mobile.filterComponents,
    loadFilterComponentCount: state.mobile.loadFilterComponentCount,
  })
)(ViewContent);
