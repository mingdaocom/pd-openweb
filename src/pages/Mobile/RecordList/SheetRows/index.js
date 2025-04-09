import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon, PullToRefreshWrapper } from 'ming-ui';
import { bindActionCreators } from 'redux';
import { SpinLoading } from 'antd-mobile';
import CustomRecordCard from 'mobile/RecordList/RecordCard';
import * as actions from '../redux/actions';
import { RecordInfoModal } from 'mobile/Record';
import withoutRows from './assets/withoutRows.png';
import { browserIsMobile, addBehaviorLog, handlePushState, handleReplaceState } from 'src/util';
import RegExpValidator from 'src/util/expression';
import { ScrollView } from 'ming-ui';
import './index.less';
import _ from 'lodash';

class SheetRows extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    window.addEventListener('popstate', this.onQueryChange);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange);
  }
  onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => this.props.updatePreviewRecordId(''));
  };

  handleEndReached = () => {
    const { sheetRowLoading, sheetView } = this.props;
    if (!sheetRowLoading && sheetView.isMore) {
      this.props.changePageIndex();
    }
  };
  handlePullToRefresh = () => {
    this.props.updateIsPullRefreshing(true);
    this.props.changePageIndex(1);
  };
  renderRow = item => {
    const { worksheetControls, base, view, worksheetInfo, batchOptVisible, batchOptCheckedData, sheetSwitchPermit } =
      this.props;
    return (
      <CustomRecordCard
        key={item.rowid}
        className="mLeft8 mRight8"
        data={item}
        view={view}
        appId={base.appId}
        projectId={worksheetInfo.projectId}
        controls={worksheetControls}
        allowAdd={worksheetInfo.allowAdd}
        batchOptVisible={batchOptVisible}
        batchOptCheckedData={batchOptCheckedData}
        changeBatchOptData={this.props.changeBatchOptData}
        sheetSwitchPermit={sheetSwitchPermit}
        onClick={() => {
          const { clicktype, clickcid } = view.advancedSetting || {};
          // clicktype：点击操作 空或者0：打开记录 1：打开链接 2：无
          if (clicktype === '2') return;
          if (clicktype === '1') {
            let value = item[clickcid];
            if (RegExpValidator.isURL(value)) {
              window.open(value);
            }
            return;
          }

          if (window.isMingDaoApp && window.APP_OPEN_NEW_PAGE) {
            window.location.href = `/mobile/record/${base.appId}/${base.worksheetId}/${base.viewId || view.viewId}/${
              item.rowid
            }`;
            return;
          }
          if (browserIsMobile()) {
            handlePushState('page', 'recordDetail');
            this.props.updatePreviewRecordId(item.rowid);
          }
          addBehaviorLog('worksheetRecord', base.worksheetId, { rowId: item.rowid }); // 埋点
        }}
      />
    );
  };
  render() {
    const {
      currentSheetRows,
      sheetRowLoading,
      sheetView,
      base,
      view,
      sheetSwitchPermit,
      worksheetInfo = {},
      previewRecordId,
    } = this.props;

    return (
      <Fragment>
        <ScrollView className="sheetRowsWrapper flex pTop10" onScrollEnd={this.handleEndReached}>
          <PullToRefreshWrapper onRefresh={this.handlePullToRefresh}>
            {currentSheetRows.map(item => this.renderRow(item))}
            {sheetView.isMore ? (
              <div className="flexRow justifyContentCenter">
                {sheetRowLoading ? <SpinLoading color="primary" /> : null}
              </div>
            ) : (
              <div className="Height50 mBottom5"></div>
            )}
          </PullToRefreshWrapper>
        </ScrollView>
        <RecordInfoModal
          className="full"
          visible={!!previewRecordId}
          enablePayment={worksheetInfo.enablePayment}
          appId={base.appId}
          worksheetId={base.worksheetId}
          viewId={base.viewId || view.viewId}
          rowId={previewRecordId}
          sheetSwitchPermit={sheetSwitchPermit}
          canLoadSwitchRecord={true}
          currentSheetRows={currentSheetRows}
          loadNextPageRecords={this.props.changePageIndex}
          loadedRecordsOver={!(!sheetRowLoading && sheetView.isMore)}
          changeMobileSheetRows={this.props.changeMobileSheetRows}
          onClose={() => this.props.updatePreviewRecordId('')}
        />
      </Fragment>
    );
  }
}

export const WithoutRows = props => {
  return (
    <div className="withoutRows">
      <div className="withoutRowsContent flexColumn alignItemsCenter justifyContentCenter h100">
        <img className="img mBottom10" src={withoutRows} />
        <div className="text">{props.text}</div>
      </div>
    </div>
  );
};

export const WithoutSearchRows = props => {
  return (
    <div className="withoutRows flexColumn alignItemsCenter justifyContentCenter">
      <Icon icon="search" />
      <div className="text mTop10">{props.text}</div>
    </div>
  );
};

export default connect(
  state => ({
    base: state.mobile.base,
    worksheetInfo: state.mobile.worksheetInfo,
    currentSheetRows: state.mobile.currentSheetRows,
    worksheetControls: state.mobile.worksheetControls,
    sheetRowLoading: state.mobile.sheetRowLoading,
    sheetView: state.mobile.sheetView,
    batchOptVisible: state.mobile.batchOptVisible,
    batchOptCheckedData: state.mobile.batchOptCheckedData,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
    previewRecordId: state.mobile.previewRecordId,
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, [
        'changePageIndex',
        'changeBatchOptData',
        'changeMobileSheetRows',
        'updateIsPullRefreshing',
        'updatePreviewRecordId',
      ]),
      dispatch,
    ),
)(SheetRows);
