import React, { Component } from 'react';
import { arrayOf, bool, func, shape } from 'prop-types';
import { getRequest } from 'src/util';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CustomWidgetView from 'src/pages/worksheet/views/CustomWidgetView';
import * as actions from 'src/pages/worksheet/redux/actions';
import { SpinLoading } from 'antd-mobile';
import _ from 'lodash';

const data = getRequest();

@connect(state => ({ ...state.sheet }), dispatch => bindActionCreators(actions, dispatch))
export default class MobileContainer extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.initMobileGunter(data);
  }
  render() {
    const { loading, base = {}, views } = this.props;
    const { appId, worksheetId, viewId } = base;

    if (loading) {
      return (
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color='primary' />
        </div>
      );
    }

    const view = _.find(views, { viewId: data.viewId });
    return <CustomWidgetView appId={appId} worksheetId={worksheetId} viewId={viewId} view={view} />;
  }
}

MobileContainer.propTypes = {
  loading: bool,
  base: shape({}),
  views: arrayOf(shape({})),
  initMobileGunter: func,
};
