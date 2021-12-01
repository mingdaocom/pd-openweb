import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'src/pages/Mobile/RecordList/redux/actions';
import { bindActionCreators } from 'redux';
import HierarchyView from 'src/pages/worksheet/views/HierarchyView';
import ViewErrorPage from '../components/ViewErrorPage'


class MobileHierarchyView extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {}
  render() { 
    const { currentSheetRows = [], view = {}, controls = [] } = this.props
    const { viewControl, viewControls } = view;
    const isHaveSelectControl =
      viewControl === 'create' ||
      (viewControl && _.find(controls, item => item.controlId === viewControl)) ||
      !_.isEmpty(viewControls);
    // 视图配置错误
    if (!isHaveSelectControl) {
      return (<ViewErrorPage
        icon="hierarchy"
        viewName={_l('层级视图')}
        color="#9c27af"
      />)
    }
    return (
      <HierarchyView {...this.props} />
    );
  }
}

export default connect(
  state => ({
    controls: state.sheet.controls,
    currentSheetRows: state.mobile.currentSheetRows,
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, []),
      dispatch,
  ),
)(MobileHierarchyView);
