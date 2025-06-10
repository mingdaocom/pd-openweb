import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import { SpinLoading, Tabs } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { WaterMark } from 'ming-ui';
import FixedPage from 'mobile/App/FixedPage.jsx';
import { AddRecordBtn, BatchOperationBtn } from 'mobile/components/RecordActions';
import { RecordInfoModal } from 'mobile/Record';
import { openAddRecord } from 'mobile/Record/addRecord';
import { addNewRecord } from 'src/pages/worksheet/redux/actions';
import { updateHierarchyConfigLevel } from 'src/pages/worksheet/views';
import { getShowViews } from 'src/pages/worksheet/views/util';
import { getRequest } from 'src/utils/common';
import { handlePushState, mdAppResponse } from 'src/utils/project';
import AppPermissions from '../components/AppPermissions';
import Back from '../components/Back';
import SlideGroupFilter from './GroupFilter/SlideGroupFilter';
import * as actions from './redux/actions';
import State from './State';
import alreadyDelete from './State/assets/alreadyDelete.png';
import { getDefaultValueInCreate, getViewActionInfo } from './util';
import View from './View';
import './index.less';

@withRouter
@AppPermissions
class RecordList extends Component {
  constructor(props) {
    super(props);
    const { hideAddRecord } = getRequest();
    this.state = {
      previewRecordId: undefined,
      tempViewIdForRecordInfo: undefined,
    };
    this.hideAddRecord = hideAddRecord;
  }
  componentDidMount() {
    const { getFilters } = getRequest();
    if (getFilters === 'true') {
      mdAppResponse({ sessionId: 'Filter test session', type: 'getFilters' }).then(data => {
        const { value = [] } = data;
        this.props.updateFilterControls(value);
        this.props.changeMobileGroupFilters([]);
        this.getApp(this.props);
      });
    } else {
      this.props.changeMobileGroupFilters([]);
      this.getApp(this.props);
      if (_.get(this.props, ['filters', 'visible'])) {
        this.props.updateFilters({
          visible: false,
        });
      }
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
    const view = _.find(nextProps.worksheetInfo.views, v => v.viewId === newParams.viewId) || {};
    const { viewType } = view;
    if (newParams.viewId !== params.viewId) {
      this.props.updateBase({ viewId: newParams.viewId });
      _.includes([0, 6], viewType) && this.props.resetSheetView();
    }
    if (viewType === 2) {
      updateHierarchyConfigLevel(view);
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

  handleBack = () => {
    const { match, history, appDetail } = this.props;
    const { params } = match;
    const { hash } = history.location;
    const isHideTabBar = hash.includes('hideTabBar') || !!sessionStorage.getItem('hideTabBar');
    const { appNaviStyle } = appDetail.detail || {};

    if (appNaviStyle === 2 && location.href.includes('mobile/app')) {
      window.mobileNavigateTo('/mobile/dashboard');
    } else if (!isHideTabBar && location.href.includes('mobile/app')) {
      let currentGroupInfo =
        localStorage.getItem('currentGroupInfo') && JSON.parse(localStorage.getItem('currentGroupInfo'));
      if (_.isEmpty(currentGroupInfo)) {
        window.mobileNavigateTo('/mobile/dashboard');
      } else {
        window.mobileNavigateTo(`/mobile/groupAppList/${currentGroupInfo.id}/${currentGroupInfo.groupType}`);
      }
      localStorage.removeItem('currentNavWorksheetId');
    } else {
      window.mobileNavigateTo(`/mobile/app/${params.appId}`);
    }
  };

  renderContent() {
    const {
      base,
      worksheetInfo,
      sheetSwitchPermit,
      match,
      calendarview,
      batchOptVisible,
      appColor,
      history,
      appDetail,
      debugRoles,
      mobileNavGroupFilters,
    } = this.props;
    const { viewId } = base;
    const { detail } = appDetail;
    const { appNaviStyle, debugRole } = detail;

    const { name } = worksheetInfo;
    let views =
      base.type === 'single'
        ? getShowViews(worksheetInfo.views)
        : getShowViews(worksheetInfo.views).filter(
            v => _.get(v, 'advancedSetting.showhide') !== 'hide' && _.get(v, 'advancedSetting.showhide') !== 'spc&happ',
          );
    const view = _.find(views, { viewId }) || views[0];
    const { params } = match;
    const { hash } = history.location;
    const isHideTabBar = hash.includes('hideTabBar') || !!sessionStorage.getItem('hideTabBar');

    if (_.isEmpty(views)) {
      return (
        <Fragment>
          <div className="flexColumn h100 justifyContentCenter alignItemsCenter Font16 Gray_9e">
            <img style={{ width: 70 }} src={alreadyDelete} />
            {_l('视图已隐藏')}
          </div>
          <Back
            icon={appNaviStyle === 2 && location.href.includes('mobile/app') ? 'home' : 'back'}
            className="back Absolute"
            onClick={this.handleBack}
          />
        </Fragment>
      );
    }
    const hasDebugRoles = (debugRole || {}).canDebug && !_.isEmpty(debugRoles);

    const { canAddRecord, showBatchBtn, showBackBtn, recordActionWrapBottom } = getViewActionInfo({
      view,
      viewId: base.viewId,
      worksheetInfo,
      calendarview,
      sheetSwitchPermit,
      batchOptVisible,
      appDetail: detail,
      isHideTabBar,
      hasDebugRoles,
    });
    const navData = (_.get(worksheetInfo, 'template.controls') || []).find(
      o => o.controlId === _.get(view, 'navGroup[0].controlId'),
    );
    const appNavType = _.get(view, 'advancedSetting.appnavtype');
    let hasGroupFilter =
      view.viewId === base.viewId &&
      !_.isEmpty(view.navGroup) &&
      view.navGroup.length > 0 &&
      !location.search.includes('chartId') &&
      _.includes(['0'], String(view.viewType)) &&
      navData &&
      (appNavType === '2' || !appNavType || (appNavType === '3' && _.includes([29, 35], navData.type))); // 是否存在分组列表

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
                className="md-adm-tabs flexUnset"
                activeLineMode="fixed"
                activeKey={viewId}
                onChange={viewId => {
                  const view = _.find(views, { viewId });
                  this.setCache({ viewId: view.viewId, worksheetId: params.worksheetId });
                  this.handleChangeView(view);
                  this.props.changeMobileGroupFilters([]);
                  safeLocalStorageSetItem(`mobileViewSheet-${view.viewId}`, view.viewType);
                  if (view.viewType === 2) {
                    updateHierarchyConfigLevel(view);
                  }
                }}
              >
                {views.map(tab => (
                  <Tabs.Tab title={<span className="tabName ellipsis bold">{tab.name}</span>} key={tab.viewId} />
                ))}
              </Tabs>
            </div>
          )}
          {hasGroupFilter && <SlideGroupFilter {...this.props} />}
          <View
            view={view}
            key={worksheetInfo.worksheetId}
            routerParams={params}
            appNaviStyle={appNaviStyle}
            hasDebugRoles={hasDebugRoles}
          />
          <div
            className="recordActionWrap"
            style={{
              position: 'fixed',
              right: 20,
              bottom: recordActionWrapBottom,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!batchOptVisible && showBackBtn && (
              <Back
                icon={appNaviStyle === 2 && location.href.includes('mobile/app') ? 'home' : 'back'}
                className="back Static"
                style={{ position: 'unset!important', marginTop: 10 }}
                onClick={this.handleBack}
              />
            )}
            {showBatchBtn && (
              <BatchOperationBtn className="Static mTop10" onClick={() => this.props.changeBatchOptVisible(true)} />
            )}
            {canAddRecord ? (
              <AddRecordBtn
                entityName={worksheetInfo.entityName}
                backgroundColor={appColor}
                className="Static mTop10"
                onClick={() => {
                  if (window.isMingDaoApp && window.APP_OPEN_NEW_PAGE) {
                    window.location.href = `/mobile/addRecord/${params.appId}/${worksheetInfo.worksheetId}/${view.viewId}`;
                    return;
                  }

                  let defaultFormData = getDefaultValueInCreate(mobileNavGroupFilters);
                  let param =
                    _.get(view, 'advancedSetting.usenav') === '1'
                      ? {
                          defaultFormData,
                          defaultFormDataEditable: true,
                        }
                      : {};
                  if (window.isMingDaoApp) {
                    handlePushState('page', 'newRecord');
                  }
                  openAddRecord({
                    ...param,
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
        </div>
        <RecordInfoModal
          className="full"
          visible={!!this.state.previewRecordId}
          appId={params.appId}
          worksheetId={worksheetInfo.worksheetId}
          enablePayment={worksheetInfo.enablePayment}
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
    const { worksheetInfo, workSheetLoading, appDetail = {} } = this.props;
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
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color="primary" />
        </div>
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
      'mobileNavGroupFilters',
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
          'updateFilterControls',
          'updateQuickFilter',
        ]),
        addNewRecord,
      },
      dispatch,
    ),
)(RecordList);
