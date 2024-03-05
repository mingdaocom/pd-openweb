import React, { Fragment, Component } from 'react';
import DocumentTitle from 'react-document-title';
import { Tabs, Flex, ActivityIndicator } from 'antd-mobile';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Icon, Button, WaterMark } from 'ming-ui';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import { addNewRecord } from 'src/pages/worksheet/redux/actions';
import Back from '../components/Back';
import AppPermissions from '../components/AppPermissions';
import State from './State';
import View from './View';
import { RecordInfoModal } from 'mobile/Record';
import './index.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getAdvanceSetting } from 'src/util';
import cx from 'classnames';
import FixedPage from 'mobile/App/FixedPage.jsx';
import { openAddRecord } from 'mobile/Record/addRecord';
import alreadyDelete from './State/assets/alreadyDelete.png';
import { AddRecordBtn, BatchOperationBtn } from 'mobile/components/RecordActions';
import _ from 'lodash';

@withRouter
@AppPermissions
class RecordList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewRecordId: undefined,
      tempViewIdForRecordInfo: undefined,
    };
  }
  componentDidMount() {
    const { params } = this.props.match || {};
    this.props.changeMobileGroupFilters([]);
    this.getApp(this.props);
    if (_.get(this.props, ['filters', 'visible'])) {
      this.props.updateFilters({
        visible: false,
      });
    }
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
    const viewType = (_.find(nextProps.worksheetInfo.views, v => v.viewId === newParams.viewId) || {}).viewType;
    if (newParams.viewId !== params.viewId) {
      this.props.updateBase({ viewId: newParams.viewId });
      _.includes([0, 6], viewType) && this.props.resetSheetView();
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
  sheetViewOpenRecord = (recordId, viewId) => {
    this.setState({
      previewRecordId: recordId,
      tempViewIdForRecordInfo: viewId,
    });
  };
  setCache = params => {
    const { worksheetId, viewId } = params;
    safeLocalStorageSetItem(`mobileViewSheet-${worksheetId}`, viewId);
  };
  handleChangeView = view => {
    const { match, now } = this.props;
    const { params } = match;
    this.props.updateBase({ viewId: view.viewId });
    if (now) {
      _.includes([0, 6], view.viewType) && this.props.resetSheetView();
    } else {
      window.mobileNavigateTo(
        `/mobile/recordList/${params.appId}/${params.groupId}/${params.worksheetId}/${view.viewId}`,
        true,
      );
    }
  };
  renderContent() {
    const {
      base,
      worksheetInfo,
      sheetSwitchPermit,
      workSheetLoading,
      match,
      currentSheetRows,
      filters,
      worksheetControls,
      calendarview,
      batchOptVisible,
      appColor,
      history,
      appDetail,
      debugRoles,
    } = this.props;
    const { viewId } = base;
    const { detail } = appDetail;
    const { appNaviStyle, debugRole } = detail;

    const { name, advancedSetting = {} } = worksheetInfo;
    let views = worksheetInfo.views.filter(
      v => _.get(v, 'advancedSetting.showhide') !== 'hide' && _.get(v, 'advancedSetting.showhide') !== 'spc&happ',
    );
    const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
    const { params } = match;
    const viewIndex = viewId ? _.findIndex(views, { viewId }) : 0;

    const { calendarData = {} } = calendarview;
    let { begindate = '', enddate = '', calendarcids = '[]' } = getAdvanceSetting(view);
    const { calendarInfo = [] } = calendarData;
    const { viewControl, viewControls } = view;

    try {
      calendarcids = JSON.parse(calendarcids);
    } catch (error) {
      calendarcids = [];
    }
    if (calendarcids.length <= 0) {
      calendarcids = [{ begin: begindate, end: enddate }]; //兼容老数据
    }
    const isDelete =
      calendarcids[0].begin &&
      calendarInfo.length > 0 &&
      (!calendarInfo[0].startData || !calendarInfo[0].startData.controlId);
    const isHaveSelectControl = _.includes([1, 2, 4, 5, 7], view.viewType)
      ? viewControl === 'create' ||
        (viewControl && _.find(worksheetControls, item => item.controlId === viewControl)) ||
        !_.isEmpty(viewControls) ||
        !(!calendarcids[0].begin || isDelete)
      : true;
    const { hash } = history.location;
    const isHideTabBar = hash.includes('hideTabBar') || !!sessionStorage.getItem('hideTabBar');
    const canDelete = isOpenPermit(permitList.delete, sheetSwitchPermit, view.viewId);
    const showCusTomBtn = isOpenPermit(permitList.execute, sheetSwitchPermit, view.viewId);
    if (_.isEmpty(views)) {
      return (
        <div className="flexColumn h100 justifyContentCenter alignItemsCenter Font16 Gray_9e">
          <img style={{ width: 70 }} src={alreadyDelete} />
          {_l('视图已隐藏')}
        </div>
      );
    }
    const hasDebugRoles = (debugRole || {}).canDebug && !_.isEmpty(debugRoles);
    const bottom20 = hasDebugRoles ? '60px' : '20px';
    const bottom70 = hasDebugRoles ? '110px' : '70px';
    const bottom78 = hasDebugRoles ? '118px' : '78px';
    const bottom130 = hasDebugRoles ? '170px' : '130px';

    const styles =
      view.viewType === 6 && view.childType === 1
        ? {
            paddingBottom: 'calc(constant(safe-area-inset-bottom) - 20px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) - 20px)',
          }
        : {};

    return (
      <Fragment>
        <div
          className={cx('flexColumn h100', {
            portalWrapHeight: md.global.Account.isPortal && appNaviStyle === 2,
          })}
        >
          <DocumentTitle title={name} />
          {!batchOptVisible && (
            <div className={cx('viewTabs z-depth-1', { isPortal: md.global.Account.isPortal })}>
              <Tabs
                tabBarInactiveTextColor="#757575"
                tabs={views}
                page={viewIndex === -1 ? 999 : viewIndex}
                onTabClick={view => {
                  this.setCache({ viewId: view.viewId, worksheetId: params.worksheetId });
                  this.handleChangeView(view);
                  this.props.changeMobileGroupFilters([]);
                  safeLocalStorageSetItem(`mobileViewSheet-${view.viewId}`, view.viewType);
                }}
                renderTab={tab => <span className="tabName ellipsis bold">{tab.name}</span>}
              ></Tabs>
            </div>
          )}
          <View
            view={view}
            key={worksheetInfo.worksheetId}
            routerParams={params}
            appNaviStyle={appNaviStyle}
            hasDebugRoles={hasDebugRoles}
          />
          {!batchOptVisible &&
            !(appNaviStyle === 2 && location.href.includes('mobile/app') && md.global.Account.isPortal) && (
              <Back
                icon={appNaviStyle === 2 && location.href.includes('mobile/app') ? 'home' : 'back'}
                style={
                  !isHideTabBar && appNaviStyle === 2 && location.href.includes('mobile/app')
                    ? {
                        bottom:
                          view.childType === 1 && view.viewType === 6
                            ? 140
                            : _.includes([1, 3, 4, 6, 21, 8], view.viewType) ||
                              (!_.isEmpty(view.navGroup) && view.navGroup.length)
                            ? bottom70
                            : bottom130,
                        ...styles,
                      }
                    : {
                        bottom:
                          view.childType === 1 && view.viewType === 6
                            ? 100
                            : [1, 3, 4, 6, 21, 8].includes(view.viewType) ||
                              (!_.isEmpty(view.navGroup) && view.navGroup.length && _.includes([0], view.viewType)) ||
                              !(canDelete || showCusTomBtn)
                            ? bottom20
                            : bottom78,
                        ...styles,
                      }
                }
                onClick={() => {
                  if (!isHideTabBar && location.href.includes('mobile/app')) {
                    let currentGroupInfo =
                      localStorage.getItem('currentGroupInfo') && JSON.parse(localStorage.getItem('currentGroupInfo'));
                    if (_.isEmpty(currentGroupInfo)) {
                      window.mobileNavigateTo('/mobile/dashboard');
                    } else {
                      window.mobileNavigateTo(
                        `/mobile/groupAppList/${currentGroupInfo.id}/${currentGroupInfo.groupType}`,
                      );
                    }
                    localStorage.removeItem('currentNavWorksheetId');
                  } else {
                    window.mobileNavigateTo(`/mobile/app/${params.appId}`);
                  }
                }}
              />
            )}
          {(canDelete || showCusTomBtn) && view.viewType === 0 && !batchOptVisible && _.isEmpty(view.navGroup) && (
            <BatchOperationBtn
              style={{
                bottom: appNaviStyle === 2 && location.href.includes('mobile/app') ? bottom70 : bottom20,
              }}
              onClick={() => this.props.changeBatchOptVisible(true)}
            />
          )}
          {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
          worksheetInfo.allowAdd &&
          isHaveSelectControl &&
          !batchOptVisible &&
          ((view.viewType === 6 && view.childType !== 1) || view.viewType !== 6) ? (
            <AddRecordBtn
              entityName={worksheetInfo.entityName}
              backgroundColor={appColor}
              warpStyle={{ bottom: !isHideTabBar && appNaviStyle === 2 ? bottom70 : bottom20 }}
              btnClassName={cx({
                Right: ([2, 5, 7].includes(view.viewType) && currentSheetRows.length) || [2].includes(view.viewType),
                mRight16: ([2, 5, 7].includes(view.viewType) && currentSheetRows.length) || [2].includes(view.viewType),
              })}
              onClick={() => {
                openAddRecord({
                  className: 'full',
                  worksheetInfo,
                  appId: params.appId,
                  worksheetId: worksheetInfo.worksheetId,
                  viewId: view.viewId,
                  addType: 2,
                  entityName: worksheetInfo.entityName,
                  openRecord: this.sheetViewOpenRecord,
                  onAdd: data => {
                    if (_.isEmpty(data)) {
                      return;
                    }

                    if (view.viewType) {
                      this.props.addNewRecord(data, view);
                    } else {
                      this.props.unshiftSheetRow(data);
                    }
                  },
                  showDraftsEntry: true,
                  sheetSwitchPermit,
                });
              }}
            />
          ) : null}
        </div>
        <RecordInfoModal
          className="full"
          visible={!!this.state.previewRecordId}
          appId={params.appId}
          worksheetId={worksheetInfo.worksheetId}
          viewId={this.state.tempViewIdForRecordInfo}
          rowId={this.state.previewRecordId}
          onClose={() => {
            this.setState({
              previewRecordId: undefined,
              tempViewIdForRecordInfo: undefined,
            });
          }}
        />
      </Fragment>
    );
  }
  render() {
    const { base, worksheetInfo, workSheetLoading, appDetail = {} } = this.props;
    const { viewId } = base;
    const { detail = {}, appName } = appDetail;
    const { webMobileDisplay } = detail;

    if (webMobileDisplay) {
      return (
        <div style={{ background: '#fff', height: '100%' }}>
          <div className="flex WordBreak overflow_ellipsis pLeft20 pRight20 Height80">
            <span className="Gray Font24 LineHeight80 InlineBlock Bold">{appName}</span>
          </div>
          <FixedPage isNoPublish={webMobileDisplay} />
        </div>
      );
    }
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
      'worksheetControls',
      'appColor',
      'batchOptVisible',
      'isCharge',
      'appDetail',
      'debugRoles',
    ),
    calendarview: state.sheet.calendarview,
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, [
          'updateBase',
          'loadWorksheet',
          'unshiftSheetRow',
          'resetSheetView',
          'emptySheetControls',
          'emptySheetRows',
          'updateFilters',
          'changeMobileGroupFilters',
          'changeBatchOptVisible',
        ]),
        addNewRecord,
      },
      dispatch,
    ),
)(RecordList);
