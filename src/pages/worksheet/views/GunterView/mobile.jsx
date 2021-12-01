import React, { Component } from 'react';
import { getRequest } from 'src/util';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/worksheet/redux/actions';
import { Flex, ActivityIndicator } from 'antd-mobile';
import ViewErrorPage from 'src/pages/Mobile/RecordList/View/components/ViewErrorPage';
import Gunter from './index.jsx';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import { getAdvanceSetting } from 'src/util';

const data = getRequest();

@connect(
  state => ({ ...state.sheet }),
  dispatch => bindActionCreators(actions, dispatch),
)
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
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
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
      return (
        <ViewErrorPage
          icon="gantt"
          viewName={_l('甘特图')}
          color="#01BCD5"
        />
      );
    }

    return (
      <Gunter view={view} />
    );
  }
}
