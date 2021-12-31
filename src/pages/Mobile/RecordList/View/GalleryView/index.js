import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import GalleryView from 'src/pages/worksheet/views/GalleryView';
import * as actions from 'src/pages/Mobile/RecordList/redux/actions';
import * as galleryActions from 'src/pages/worksheet/redux/actions/galleryview.js';
import Search from 'src/pages/Mobile/RecordList/QuickFilter/Search';
import { getAdvanceSetting } from 'src/util';
import { TextTypes } from 'src/pages/worksheet/common/Sheet/QuickFilter/Inputs';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon } from 'ming-ui';

const FilterWrapper = styled.div`
  background-color: #fff;
  padding: 10px;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  .active {
    color: #33a3f4 !important;
  }
`;

class MobileGalleryView extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    let { view } = this.props;
    let hasGroupFilter = !_.isEmpty(view.navGroup) && view.navGroup.length > 0; // 是否存在分组列表
    if (!hasGroupFilter) {
      this.getFetch(this.props);
    }
  }
  getFetch = nextProps => {
    const { base, views } = nextProps;
    const { viewId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const { clicksearch } = getAdvanceSetting(currentView);
    if (clicksearch === '1') {
      this.props.changeIndex(0);
    } else {
      this.props.fetch(1);
    }
  };
  render() {
    const { view, worksheetInfo, quickFilter, updateFilters } = this.props;
    let hasGroupFilter = !_.isEmpty(view.navGroup) && view.navGroup.length > 0; // 是否存在分组列表
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const filters = view.fastFilters
      .map(filter => ({
        ...filter,
        control: _.find(sheetControls, c => c.controlId === filter.controlId),
      }))
      .filter(c => c.control);
    const excludeTextFilter = filters.filter(item => !TextTypes.includes(item.dataType));
    const textFilters = filters.filter(item => TextTypes.includes(item.dataType));
    const isFilter = quickFilter.filter(item => !TextTypes.includes(item.dataType)).length;
    return (
      <Fragment>
        <div className="flexRow valignWrapper pLeft12 pRight12 pTop15 pBottom5">
          <Search textFilters={textFilters} />
          {!_.isEmpty(excludeTextFilter) && (
            <FilterWrapper>
              <Icon
                icon="filter"
                className={cx('Font20 Gray_9e', { active: isFilter })}
                onClick={() => {
                  const { filters } = this.props;
                  updateFilters({ visible: !filters.visible });
                }}
              />
            </FilterWrapper>
          )}
        </div>
        <GalleryView {...this.props} hasGroupFilter={hasGroupFilter} />
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.sheet, ['base', 'galleryview', 'views']),
    quickFilter: state.mobile.quickFilter,
    worksheetInfo: state.mobile.worksheetInfo,
    filters: state.mobile.filters,
  }),
  dispatch =>
    bindActionCreators(_.pick({ ...actions, ...galleryActions }, ['changeIndex', 'fetch', 'updateFilters']), dispatch),
)(MobileGalleryView);
