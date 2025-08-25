import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as actions from 'mobile/RecordList/redux/actions';
import 'src/pages/worksheet/views/HierarchyView/index.less';
import ViewErrorPage from '../components/ViewErrorPage';

class MobileHierarchyView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Component: null,
      HierarchyVerticalView: null,
      HierarchyMixView: null,
    };
  }
  componentDidMount() {
    const hierarchyViewType = _.get(this.props, 'view.advancedSetting.hierarchyViewType');
    if (hierarchyViewType === '1') {
      import('src/pages/worksheet/views/HierarchyVerticalView').then(component => {
        this.setState({ Component: component.default });
      });
    } else if (hierarchyViewType === '2') {
      import('src/pages/worksheet/views/HierarchyMixView').then(component => {
        this.setState({ Component: component.default });
      });
    } else {
      import('src/pages/worksheet/views/HierarchyView').then(component => {
        this.setState({ Component: component.default });
      });
    }
  }
  render() {
    const { Component } = this.state;
    const { view = {}, controls = [] } = this.props;
    const { viewControl, viewControls } = view;
    const isHaveSelectControl =
      viewControl === 'create' ||
      (viewControl && _.find(controls, item => item.controlId === viewControl)) ||
      !_.isEmpty(viewControls);
    // 视图配置错误
    if (!isHaveSelectControl) {
      return <ViewErrorPage icon="hierarchy" viewName={_l('层级视图')} color="#9c27af" />;
    }

    if (!Component) return null;

    return <Component {...this.props} />;
  }
}

export default connect(
  state => ({
    controls: state.sheet.controls,
    currentSheetRows: state.mobile.currentSheetRows,
  }),
  dispatch => bindActionCreators(_.pick(actions, []), dispatch),
)(MobileHierarchyView);
