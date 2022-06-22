import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import GunterView from 'src/pages/worksheet/views/GunterView';
import ViewErrorPage from '../components/ViewErrorPage';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import { getAdvanceSetting } from 'src/util';

class MobileGunterView extends Component {
  constructor(props) {
    super(props);
  }
  render() { 
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

    if (isDelete || !begindate || !enddate || isDeleteEnd) {
      return (
        <ViewErrorPage
          icon="gantt"
          viewName={_l('甘特图')}
          color="#01BCD5"
        />
      );
    }

    return (
      <GunterView {...this.props} layoutType="mobile" />
    );
  }
}

export default connect(
  state => ({
    controls: state.sheet.controls,
    currentSheetRows: state.mobile.currentSheetRows
  })
)(MobileGunterView);
