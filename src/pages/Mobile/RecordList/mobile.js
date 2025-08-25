import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SpinLoading } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import FixedPage from 'mobile/App/FixedPage.jsx';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { addNewRecord } from 'src/pages/worksheet/redux/actions';
import { getRequest } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import { mdAppResponse } from 'src/utils/project';
import AppPermissions from '../components/AppPermissions';
import * as actions from './redux/actions';
import State from './State';
import alreadyDelete from './State/assets/alreadyDelete.png';
import View from './View';
import './index.less';

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
    const { getFilters } = getRequest();
    if (getFilters === 'true') {
      mdAppResponse({ sessionId: 'Filter test session', type: 'getFilters' }).then(data => {
        const { value = [] } = data;
        this.props.updateFilterControls(value);
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
      tempViewIdForRecordInfo: viewId,
    });
  };
  setCache = params => {
    const { worksheetId, viewId } = params;
    safeLocalStorageSetItem(`mobileViewSheet-${worksheetId}`, viewId);
  };
  handleChangeView = view => {
    const { now } = this.props;
    if (now) {
      this.props.updateBase({ viewId: view.viewId });
      this.props.resetSheetView();
    }
  };
  renderContent() {
    const { base, worksheetInfo, sheetSwitchPermit, match, batchOptVisible, appDetail } = this.props;
    const { viewId } = base;
    const { detail } = appDetail;
    const { appNaviStyle } = detail;

    let views = worksheetInfo.views.filter(
      v => _.get(v, 'advancedSetting.showhide') !== 'hide' && _.get(v, 'advancedSetting.showhide') !== 'spc&happ',
    );
    const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
    const { params } = match;

    let { begindate = '', enddate = '', calendarcids = '[]' } = getAdvanceSetting(view);

    try {
      calendarcids = JSON.parse(calendarcids);
    } catch (error) {
      console.log(error);
      calendarcids = [];
    }
    if (calendarcids.length <= 0) {
      calendarcids = [{ begin: begindate, end: enddate }]; //兼容老数据
    }
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
    return (
      <Fragment>
        <div
          className={cx('flexColumn w100 h100', {
            portalWrapHeight: md.global.Account.isPortal && appNaviStyle === 2,
          })}
        >
          <View view={view} key={worksheetInfo.worksheetId} routerParams={params} />
          {!window.isMingDaoApp &&
            !_.get(window, 'shareState.shareId') &&
            (canDelete || showCusTomBtn) &&
            view.viewType === 0 &&
            !batchOptVisible &&
            _.isEmpty(view.navGroup) && (
              <div
                className={cx('batchOperation', {
                  bottom70: appNaviStyle === 2 && location.href.includes('mobile/app'),
                })}
                onClick={() => this.props.changeBatchOptVisible(true)}
              >
                <Icon icon={'done_all'} className="Font24" />
              </div>
            )}
        </div>
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

    return (
      <div className="flexRow justifyContentCenter alignItemsCenter w100 relative h100">{this.renderContent()}</div>
    );
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
        ]),
        addNewRecord,
      },
      dispatch,
    ),
)(RecordList);
