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

@withRouter
@AppPermissions
class RecordList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewRecordId: undefined,
      tempViewIdForRecordInfo: undefined
    }
  }
  componentDidMount() {
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
  sheetViewOpenRecord = (recordId, viewId) => {
    this.setState({
      previewRecordId: recordId,
      tempViewIdForRecordInfo: viewId
    });
  }
  setCache = params => {
    const { worksheetId, viewId } = params;
    safeLocalStorageSetItem(`mobileViewSheet-${worksheetId}`, viewId);
  }
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
    const isHaveSelectControl = _.includes([1, 2, 4, 5], view.viewType)
      ? viewControl === 'create' ||
      (viewControl && _.find(controls, item => item.controlId === viewControl)) ||
      !_.isEmpty(viewControls) ||
      !(!calendarcids[0].begin || isDelete)
      : true;
    const { hash } = history.location;
    const isHideTabBar = hash.includes('hideTabBar') || !!sessionStorage.getItem('hideTabBar');
    const canDelete = isOpenPermit(permitList.delete, sheetSwitchPermit, view.viewId);
    const showCusTomBtn = isOpenPermit(permitList.execute, sheetSwitchPermit, view.viewId);
    return (
      <Fragment>
        <div className="flexColumn h100">
          <DocumentTitle title={name} />
          {!batchOptVisible && (
            <div className={cx('viewTabs z-depth-1', { isPortal: md.global.Account.isPortal })}>
              <Tabs
                tabBarInactiveTextColor="#9e9e9e"
                tabs={views}
                page={viewIndex === -1 ? 999 : viewIndex}
                onTabClick={view => {
                  this.setCache({ viewId: view.viewId, worksheetId: params.worksheetId });
                  this.handleChangeView(view);
                  this.props.changeMobileGroupFilters([]);
                  safeLocalStorageSetItem(`mobileViewSheet-${view.viewId}`, view.viewType);
                }}
                renderTab={tab => <span className="ellipsis">{tab.name}</span>}
              ></Tabs>
            </div>
          )}
          <View view={view} key={worksheetInfo.worksheetId} routerParams={params} />
          {!batchOptVisible && (!md.global.Account.isPortal || (md.global.Account.isPortal && appNaviStyle !== 2)) && (
            <Back
              style={
                !isHideTabBar && location.href.includes('mobile/app')
                  ? [1, 3, 4].includes(view.viewType) ||
                    (appNaviStyle === 2 && !_.isEmpty(view.navGroup) && view.navGroup.length)
                    ? { bottom: '78px' }
                    : { bottom: '130px' }
                  : [1, 3, 4].includes(view.viewType) ||
                    (!_.isEmpty(view.navGroup) && view.navGroup.length) ||
                    !(canDelete || showCusTomBtn)
                    ? { bottom: '20px' }
                    : { bottom: '78px' }
              }
              onClick={() => {
                if (!isHideTabBar && location.href.includes('mobile/app')) {
                  let currentGroupInfo =
                    localStorage.getItem('currentGroupInfo') && JSON.parse(localStorage.getItem('currentGroupInfo'));
                  if (_.isEmpty(currentGroupInfo)) {
                    window.mobileNavigateTo('/mobile/appHome');
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
            <div
              className={cx('batchOperation', { bottom70: appNaviStyle === 2 && location.href.includes('mobile/app') })}
              onClick={() => this.props.changeBatchOptVisible(true)}
            >
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
                  openAddRecord({
                    className: 'full',
                    worksheetInfo,
                    appId: params.appId,
                    worksheetId: worksheetInfo.worksheetId,
                    viewId: view.viewId,
                    addType: 2,
                    entityName: worksheetInfo.entityName,
                    needCache: true,
                    openRecord: this.sheetViewOpenRecord,
                    onAdd: data => {
                      if (view.viewType) {
                        this.props.addNewRecord(data, view);
                      } else {
                        this.props.unshiftSheetRow(data);
                      }
                    },
                  });
                }}
              >
                <Icon icon="add" className="Font22 mRight5" />
                {worksheetInfo.entityName}
              </Button>
            </div>
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
              tempViewIdForRecordInfo: undefined
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
