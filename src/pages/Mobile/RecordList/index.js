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
      batchOptVisible,
      appColor,
      history,
      appDetail,
    } = this.props;
    const { viewId } = base;
    const { detail } = appDetail;
    const { appNaviStyle } = detail;
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
    const { hash } = history.location;
    const isHideTabBar = hash.includes('hideTabBar') || !!sessionStorage.getItem('hideTabBar');
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
          {!batchOptVisible && (
            <div className="viewTabs z-depth-1">
              <Tabs
                tabBarInactiveTextColor="#9e9e9e"
                tabs={views}
                page={viewIndex === -1 ? 999 : viewIndex}
                onTabClick={view => {
                  this.setCache({ viewId: view.viewId, worksheetId: params.worksheetId });
                  this.handleChangeView(view);
                  this.props.changeMobileGroupFilters([]);
                  localStorage.setItem(`mobileViewSheet-${view.viewId}`, view.viewType);
                }}
                renderTab={tab => <span className="ellipsis">{tab.name}</span>}
              ></Tabs>
            </div>
          )}
          <View view={view} key={worksheetInfo.worksheetId} />
          {!batchOptVisible && (!md.global.Account.isPortal || (md.global.Account.isPortal && appNaviStyle !== 2)) && (
            <Back
              style={
                !isHideTabBar && location.href.includes('mobile/app')
                  ? [1, 3, 4].includes(view.viewType) ||
                    (appNaviStyle === 2 && !_.isEmpty(view.navGroup) && view.navGroup.length)
                    ? { bottom: '78px' }
                    : { bottom: '130px' }
                  : [1, 3, 4].includes(view.viewType) || (!_.isEmpty(view.navGroup) && view.navGroup.length)
                  ? { bottom: '20px' }
                  : { bottom: '78px' }
              }
              onClick={() => {
                if (!isHideTabBar && location.href.includes('mobile/app')) {
                  window.mobileNavigateTo('/mobile/appHome');
                } else {
                  window.mobileNavigateTo(`/mobile/app/${params.appId}`);
                }
              }}
            />
          )}
          {view.viewType === 0 && !batchOptVisible && _.isEmpty(view.navGroup) && (
            <div className="batchOperation" onClick={() => this.props.changeBatchOptVisible(true)}>
              <Icon icon={'task-complete'} className="Font24" />
            </div>
          )}
          {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
          worksheetInfo.allowAdd &&
          isHaveSelectControl &&
          !batchOptVisible ? (
            <div className="addRecordItemWrapper">
              <Button
                style={{ backgroundColor: appColor }}
                className={cx('addRecordBtn flex valignWrapper', {
                  Right: ([2, 5].includes(view.viewType) && currentSheetRows.length) || [2].includes(view.viewType),
                  mRight16: ([2, 5].includes(view.viewType) && currentSheetRows.length) || [2].includes(view.viewType),
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
    ..._.pick(
      state.mobile,
      'base',
      'worksheetInfo',
      'sheetSwitchPermit',
      'currentSheetRows',
      'workSheetLoading',
      'filters',
      'controls',
      'appColor',
      'batchOptVisible',
      'isCharge',
      'appDetail',
    ),
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
        'changeBatchOptVisible',
      ]),
      dispatch,
    ),
)(RecordList);
