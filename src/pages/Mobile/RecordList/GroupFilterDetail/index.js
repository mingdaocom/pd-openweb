import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { ActivityIndicator, Flex, Drawer } from 'antd-mobile';
import View from '../View';
import Back from '../../components/Back';
import QuickFilter from 'src/pages/Mobile/RecordList/QuickFilter';

import { Icon, Button } from 'ming-ui';
import './index.less';

class GroupFilterDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    const { base = {} } = this.props;
    const { viewId } = base;
    if (!viewId) {
      const { params } = this.props.match;
      const { viewId, appId, worksheetId, rowId } = params;
      this.props.updateBase({ viewId, appId, worksheetId, rowId });
      this.props.loadWorksheet();
    } else {
      this.getNavGroupFitlers(this.props);
    }
  }
  componentWillReceiveProps(nextProps) {
    const { base = {} } = nextProps;
    if (_.isEqual(base, this.props.base)) {
      this.getNavGroupFitlers(nextProps);
    }
  }
  getNavGroupFitlers = props => {
    const { params } = props.match;
    const { viewId, rowId } = params;
    const { views = [], controls = [] } = props;
    const view = _.find(views, { viewId }) || (viewId === 'all' && views[0]) || {};
    const navGroup = view.navGroup && view.navGroup.length > 0 ? view.navGroup[0] : {};
    let soucre = controls.find(o => o.controlId === navGroup.controlId) || {};
    let obj = _.omit(navGroup, ['isAsc']);
    let navGroupFilters = [
      {
        ...obj,
        values: [rowId],
        dataType: soucre.type,
        filterType: soucre.type === 29 || soucre.type === 35 ? 24 : 2,
      },
    ];
    this.props.changeMobielSheetLoading(false);
    if (rowId === 'all') {
      props.changeMobileGroupFilters([]);
    } else {
      props.changeMobileGroupFilters(navGroupFilters);
    }
  };
  handleOpenDrawer = () => {
    const { filters } = this.props;
    this.props.updateFilters({
      visible: !filters.visible,
    });
  };
  renderSidebar(view) {
    const { fastFilters = [] } = view;
    const { worksheetInfo } = this.props;
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const filters = fastFilters
      .map(filter => ({
        ...filter,
        control: _.find(sheetControls, c => c.controlId === filter.controlId),
      }))
      .filter(c => c.control);
    return <QuickFilter view={view} filters={filters} controls={sheetControls} onHideSidebar={this.handleOpenDrawer} />;
  }
  render() {
    const { params } = this.props.match;
    const { viewId, txt } = params;
    let { navGroupFilters = [] } = this.state;
    const { views = [], worksheetInfo, workSheetLoading, filters } = this.props;
    const view = _.find(views, { viewId }) || (viewId === 'all' && views[0]) || {};
    if (workSheetLoading) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }
    return (
      <Drawer
        className="groupFilterDeatailDraer"
        position="right"
        open={filters.visible}
        sidebar={_.isEmpty(view) ? null : this.renderSidebar(view)}
        onOpenChange={this.handleOpenDrawer}
      >
        <div className="flexColumn h100 Relative groupFitlerDetail">
          <div className="title Font18">{txt}</div>
          {view && Object.keys(view).length ? <View view={view} /> : null}

          <div className="addRecordItemWrapper">
            <Button
              className="addRecordBtn flex valignWrapper"
              onClick={() => {
                window.mobileNavigateTo(
                  `/mobile/addRecord/${params.appId}/${worksheetInfo.worksheetId}/${view.viewId}`,
                );
              }}
            >
              <Icon icon="add" className="Font22" />
              {worksheetInfo.entityName}
            </Button>
          </div>

          <Back
            style={{ bottom: '20px' }}
            onClick={() => {
              this.props.changeMobielSheetLoading(true);
              this.props.history.goBack();
            }}
          />
        </div>
      </Drawer>
    );
  }
}

export default connect(
  state => ({
    base: state.mobile.base,
    views: state.sheet.views,
    controls: state.sheet.controls,
    worksheetInfo: state.mobile.worksheetInfo,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
    workSheetLoading: state.mobile.workSheetLoading,
    filters: state.mobile.filters,
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, [
        'updateBase',
        'loadWorksheet',
        'changeMobileGroupFilters',
        'changeMobielSheetLoading',
        'updateFilters',
      ]),
      dispatch,
    ),
)(GroupFilterDetail);
