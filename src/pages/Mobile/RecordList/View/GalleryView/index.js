import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import * as galleryActions from 'src/pages/worksheet/redux/actions/galleryview.js';

class MobileGalleryView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Component: null,
    };
  }

  componentDidMount() {
    import('src/pages/worksheet/views/GalleryView').then(component => {
      this.setState({ Component: component.default });
    });
  }

  render() {
    const { Component } = this.state;

    if (!Component) return null;

    return <Component {...this.props} />;
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
