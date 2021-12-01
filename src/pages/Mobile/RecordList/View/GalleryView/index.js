import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import GalleryView from 'src/pages/worksheet/views/GalleryView';
import * as actions from 'src/pages/Mobile/RecordList/redux/actions';
import * as galleryActions from 'src/pages/worksheet/redux/actions/galleryview.js';
import { getAdvanceSetting } from 'src/util';

class MobileGalleryView extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    let { view } = this.props
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
    const { view } = this.props;
    let hasGroupFilter = !_.isEmpty(view.navGroup) && view.navGroup.length > 0; // 是否存在分组列表
    return (
      <GalleryView {...this.props} hasGroupFilter={hasGroupFilter} />
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.sheet, ['base', 'galleryview', 'views'])
  }),
  dispatch =>
    bindActionCreators(
      _.pick({ ...actions, ...galleryActions }, ['changeIndex', 'fetch']),
      dispatch,
    ),
)(MobileGalleryView);
