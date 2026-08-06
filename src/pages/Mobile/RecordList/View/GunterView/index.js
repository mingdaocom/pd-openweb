import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import { isIllegal } from 'src/pages/worksheet/views/CalendarView/util';
import { isGunterGroupMultiSelectControl } from 'src/pages/worksheet/views/GunterView/util.js';
import { getAdvanceSetting } from 'src/utils/control';
import ViewErrorPage from '../components/ViewErrorPage';

const LoadableGunterView = lazy(() => import('src/pages/worksheet/views/GunterView'));

class MobileGunterView extends Component {
  render() {
    const { view = {}, controls = [] } = this.props;
    const { begindate = '', enddate = '' } = getAdvanceSetting(view);
    const groupControl = controls.find(item => item.controlId === view.viewControl);
    const timeControls = controls.filter(
      item =>
        !SYS.includes(item.controlId) &&
        (_.includes([15, 16], item.type) || (item.type === 38 && item.enumDefault === 2)),
    );
    const timeControlsIds = timeControls.map(o => o.controlId);
    const isDelete = begindate && !timeControlsIds.includes(begindate);
    const isDeleteEnd = enddate && !timeControlsIds.includes(enddate);

    if (view.viewControl && isGunterGroupMultiSelectControl(groupControl)) {
      return (
        <ViewErrorPage
          icon="gantt"
          viewName={_l('甘特图')}
          color="var(--color-cyan)"
          errorInfo={_l('该字段不支持作为分组')}
        />
      );
    }

    if (
      isDelete ||
      !begindate ||
      !enddate ||
      isDeleteEnd ||
      isIllegal(controls.find(item => item.controlId === begindate) || {}) ||
      isIllegal(controls.find(item => item.controlId === enddate) || {})
    ) {
      return <ViewErrorPage icon="gantt" viewName={_l('甘特图')} color="var(--color-cyan)" />;
    }

    return (
      <Suspense fallback={<LoadDiv className="mTop10" />}>
        <LoadableGunterView {...this.props} layoutType="mobile" />
      </Suspense>
    );
  }
}

export default connect(state => ({
  controls: state.sheet.controls,
  currentSheetRows: state.mobile.currentSheetRows,
}))(MobileGunterView);
