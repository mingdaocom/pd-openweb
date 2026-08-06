import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import * as actions from 'mobile/RecordList/redux/actions';
import 'src/pages/worksheet/views/HierarchyView/index.less';
import ViewErrorPage from '../components/ViewErrorPage';

const LoadableHierarchyVerticalView = lazy(() => import('src/pages/worksheet/views/HierarchyVerticalView'));
const LoadableHierarchyMixView = lazy(() => import('src/pages/worksheet/views/HierarchyMixView'));
const LoadableHierarchyView = lazy(() => import('src/pages/worksheet/views/HierarchyView'));

class MobileHierarchyView extends Component {
  render() {
    const { view = {}, controls = [] } = this.props;

    const hierarchyViewType = _.get(view, 'advancedSetting.hierarchyViewType');

    const Component =
      hierarchyViewType === '1'
        ? LoadableHierarchyVerticalView
        : hierarchyViewType === '2'
          ? LoadableHierarchyMixView
          : LoadableHierarchyView;
    const { viewControl, viewControls } = view;
    const isHaveSelectControl =
      viewControl === 'create' ||
      (viewControl && _.find(controls, item => item.controlId === viewControl)) ||
      !_.isEmpty(viewControls); // 视图配置错误

    if (!isHaveSelectControl) {
      return <ViewErrorPage icon="hierarchy" viewName={_l('层级视图')} color="var(--color-mingo)" />;
    }

    return (
      <Suspense fallback={<LoadDiv className="mTop10" />}>
        <Component {...this.props} />
      </Suspense>
    );
  }
}

export default connect(
  state => ({
    controls: state.sheet.controls,
    currentSheetRows: state.mobile.currentSheetRows,
  }),
  dispatch => bindActionCreators(_.pick(actions, []), dispatch),
)(MobileHierarchyView);
