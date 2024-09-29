import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import GalleryView from 'src/pages/worksheet/views/GalleryView';
import * as actions from 'mobile/RecordList/redux/actions';
import * as galleryActions from 'src/pages/worksheet/redux/actions/galleryview.js';

class MobileGalleryView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { view } = this.props;

    let hasGroupFilter = !_.isEmpty(view.navGroup) && view.navGroup.length > 0; // 是否存在分组列表

    return <GalleryView {...this.props} hasGroupFilter={hasGroupFilter} />;
  }
}

export default connect(
  state => ({
    ..._.pick(state.sheet, ['base', 'galleryview', 'views']),
    worksheetInfo: state.mobile.worksheetInfo,
  }),
  dispatch =>
    bindActionCreators(_.pick({ ...actions, ...galleryActions }, ['changeIndex', 'fetch', 'updateFilters']), dispatch),
)(MobileGalleryView);
