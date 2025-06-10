import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SpinLoading } from 'antd-mobile';
import _ from 'lodash';
import ViewErrorPage from 'mobile/RecordList/View/components/ViewErrorPage';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import * as actions from 'src/pages/worksheet/redux/actions';
import { getRequest } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import Gunter from './index.jsx';

const data = getRequest();

@connect(state => ({ ...state.sheet }), dispatch => bindActionCreators(actions, dispatch))
export default class MobileGunter extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.initMobileGunter(data);
  }
  render() {
    const { loading, views, controls } = this.props;

    if (loading) {
      return (
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color="primary" />
        </div>
      );
    }

    const view = _.find(views, { viewId: data.viewId });
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
      return <ViewErrorPage icon="gantt" viewName={_l('甘特图')} color="#01BCD5" />;
    }

    return <Gunter view={view} />;
  }
}
