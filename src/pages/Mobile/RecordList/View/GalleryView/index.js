import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import GalleryView from 'src/pages/worksheet/views/GalleryView';
import * as actions from 'mobile/RecordList/redux/actions';
import * as galleryActions from 'src/pages/worksheet/redux/actions/galleryview.js';
import QuickFilterSearch from 'mobile/RecordList/QuickFilter/QuickFilterSearch';
import { getAdvanceSetting } from 'src/util';

class MobileGalleryView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { view, worksheetInfo, quickFilter, updateFilters, appDetail = {} } = this.props;
    const { detail } = appDetail;
    let hasGroupFilter = !_.isEmpty(view.navGroup) && view.navGroup.length > 0; // 是否存在分组列表
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const filters = view.fastFilters
      .map(filter => ({
        ...filter,
        control: _.find(sheetControls, c => c.controlId === filter.controlId),
      }))
      .filter(c => c.control);
    const isFilter = quickFilter.length;

    return (
      <Fragment>
        <QuickFilterSearch
          excludeTextFilter={filters}
          isFilter={isFilter}
          filters={this.props.filters}
          detail={detail}
          view={view}
          worksheetInfo={worksheetInfo}
          sheetControls={sheetControls}
          updateFilters={updateFilters}
        />
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
    appDetail: state.mobile.appDetail,
  }),
  dispatch =>
    bindActionCreators(_.pick({ ...actions, ...galleryActions }, ['changeIndex', 'fetch', 'updateFilters']), dispatch),
)(MobileGalleryView);
