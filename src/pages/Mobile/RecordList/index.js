import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import { Tabs, Flex, ActivityIndicator, Drawer } from 'antd-mobile';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Icon, Button, WaterMark } from 'ming-ui';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import Back from '../components/Back';
import AppPermissions from '../components/AppPermissions';
import QuickFilter from './QuickFilter';
import State from './State';
import View from './View';
import './index.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getAdvanceSetting } from 'src/util';
import cx from 'classnames';


@withRouter
@AppPermissions
class RecordList extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.getApp(this.props);
  }
  getApp(props) {
    const { params } = props.match;
    props.updateBase({
      appId: params.appId,
      groupId: params.groupId,
      worksheetId: params.worksheetId,
      viewId: params.viewId,
    });
    props.loadWorksheet();
  }
  componentWillReceiveProps(nextProps) {
    const { params: newParams } = nextProps.match;
    const { params } = this.props.match;
    if (newParams.viewId !== params.viewId) {
      this.props.updateBase({ viewId: newParams.viewId });
      this.props.resetSheetView();
    }
    if (newParams.worksheetId !== params.worksheetId) {
      this.props.emptySheetRows();
      this.props.emptySheetControls();
      this.getApp(nextProps);
    }
  }
  componentWillUnmount() {
    this.props.emptySheetControls();
  }
  setCache = params => {
    const { worksheetId, viewId } = params;
    localStorage.setItem(`mobileViewSheet-${worksheetId}`, viewId);
  };
  handleOpenDrawer = () => {
    const { filters } = this.props;
    this.props.updateFilters({
      visible: !filters.visible,
    });
  };
  handleChangeView = view => {
    const { match, now } = this.props;
    const { params } = match;
    if (now) {
      this.props.updateBase({ viewId: view.viewId });
      this.props.resetSheetView();
    } else {
      window.mobileNavigateTo(
        `/mobile/recordList/${params.appId}/${params.groupId}/${params.worksheetId}/${view.viewId}`,
        true,
      );
    }
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
  renderContent() {
    const {
      base,
      worksheetInfo,
      sheetSwitchPermit,
      workSheetLoading,
      match,
      currentSheetRows,
      filters,
      controls,
      calendarview,
    } = this.props;
    const { viewId } = base;
    const { views, name } = worksheetInfo;
    const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
    const { params } = match;
    const viewIndex = viewId ? _.findIndex(views, { viewId }) : 0;

    const { calendarData = {} } = calendarview;
    const { begindate = '' } = getAdvanceSetting(view);
    const { startData } = calendarData;
    const isDelete = begindate && (!startData || !startData.controlId);
    const { viewControl, viewControls } = view;
    const isHaveSelectControl = _.includes([1, 2, 4, 5], view.viewType)
      ? viewControl === 'create' ||
        (viewControl && _.find(controls, item => item.controlId === viewControl)) ||
        !_.isEmpty(viewControls) ||
        !(!begindate || isDelete)
      : true;
    return (
      <Drawer
        className="filterStepListWrapper"
        position="right"
        sidebar={_.isEmpty(view) ? null : this.renderSidebar(view)}
        open={filters.visible}
        onOpenChange={this.handleOpenDrawer}
      >
        <div className="flexColumn h100">
          <DocumentTitle title={name} />
          <div className="viewTabs z-depth-1">
            <Tabs
              tabBarInactiveTextColor="#9e9e9e"
              tabs={views}
              page={viewIndex === -1 ? 999 : viewIndex}
              onTabClick={view => {
                this.setCache({viewId: view.viewId, worksheetId: params.worksheetId});
                this.handleChangeView(view);
                this.props.changeMobileGroupFilters([]);
              }}
              renderTab={tab => <span className="ellipsis">{tab.name}</span>}
            ></Tabs>
          </div>
          <View view={view} />
          {!location.href.includes('mobile/app') && (
            <Back
              style={[0, 1, 3, 4].includes(view.viewType) ? { bottom: '20px' } : {}}
              onClick={() => {
                window.mobileNavigateTo(`/mobile/app/${params.appId}`);
              }}
            />
          )}
          {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
          worksheetInfo.allowAdd &&
          isHaveSelectControl ? (
            <div className="addRecordItemWrapper">
              <Button
                className={cx('addRecordBtn flex valignWrapper', {
                  Right: [2, 5].includes(view.viewType) && currentSheetRows.length,
                  mRight16: [2, 5].includes(view.viewType) && currentSheetRows.length,
                })}
                onClick={() => {
                  window.mobileNavigateTo(
                    `/mobile/addRecord/${params.appId}/${worksheetInfo.worksheetId}/${view.viewId}`,
                  );
                }}
              >
                <Icon icon="add" className="Font22 mRight5" />
                {worksheetInfo.entityName}
              </Button>
            </div>
          ) : null}
        </div>
      </Drawer>
    );
  }
  render() {
    const { base, worksheetInfo, workSheetLoading } = this.props;
    const { viewId } = base;

    if (workSheetLoading) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    if (worksheetInfo.resultCode !== 1) {
      return <State type="sheet" />;
    }

    return <WaterMark projectId={worksheetInfo.projectId}>{this.renderContent()}</WaterMark>;
  }
}

export default connect(
  state => ({
    base: state.mobile.base,
    worksheetInfo: state.mobile.worksheetInfo,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
    currentSheetRows: state.mobile.currentSheetRows,
    workSheetLoading: state.mobile.workSheetLoading,
    filters: state.mobile.filters,
    controls: state.sheet.controls,
    calendarview: state.sheet.calendarview,
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, [
        'updateBase',
        'loadWorksheet',
        'resetSheetView',
        'emptySheetControls',
        'emptySheetRows',
        'updateFilters',
        'changeMobileGroupFilters',
      ]),
      dispatch,
    ),
)(RecordList);
