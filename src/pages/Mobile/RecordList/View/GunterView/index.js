import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import ViewErrorPage from '../components/ViewErrorPage';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import { getAdvanceSetting } from 'src/util';
import { isIllegal } from 'src/pages/worksheet/views/CalendarView/util';
import _ from 'lodash';

class MobileGunterView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Component: null,
    };
  }

  componentDidMount() {
    import('src/pages/worksheet/views/GunterView').then(component => {
      this.setState({ Component: component.default });
    });
  }

  render() {
    const { Component } = this.state;
    const { currentSheetRows = [], view = {}, controls = [] } = this.props;
    const { begindate = '', enddate = '' } = getAdvanceSetting(view);
    const timeControls = controls.filter(
      item =>
        !SYS.includes(item.controlId) &&
        (_.includes([15, 16], item.type) || (item.type === 38 && item.enumDefault === 2)),
    );
    const timeControlsIds = timeControls.map(o => o.controlId);
    const isDelete = begindate && !timeControlsIds.includes(begindate);
    const isDeleteEnd = enddate && !timeControlsIds.includes(enddate);

    if (
      isDelete ||
      !begindate ||
      !enddate ||
      isDeleteEnd ||
      isIllegal(controls.find(item => item.controlId === begindate) || {}) ||
      isIllegal(controls.find(item => item.controlId === enddate) || {})
    ) {
      return <ViewErrorPage icon="gantt" viewName={_l('甘特图')} color="#01BCD5" />;
    }

    if (!Component) return null;

    return <Component {...this.props} layoutType="mobile" />;
  }
}

export default connect(state => ({
  controls: state.sheet.controls,
  currentSheetRows: state.mobile.currentSheetRows,
}))(MobileGunterView);
