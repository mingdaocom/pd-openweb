import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SpinLoading } from 'antd-mobile';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon, LoadDiv, PullToRefreshWrapper, ScrollView } from 'ming-ui';
import { RecordInfoModal } from 'mobile/Record';
import RecordCardIO from 'mobile/RecordList/RecordCard/RecordCardIO';
import GroupByControl from 'src/pages/Mobile/components/GroupByControl';
import { browserIsMobile } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { getGroupControlId } from 'src/utils/worksheet';
import * as actions from '../redux/actions';
import withoutRows from './assets/withoutRows.png';
import './index.less';

class SheetRows extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollViewEl: null,
      viewCardUpdateMap: {},
    };
  }

  scrollViewRef = React.createRef();

  componentDidMount() {
    window.addEventListener('popstate', this.onQueryChange);

    this.intervalId = setInterval(() => {
      const scrollInfo = this.scrollViewRef.current?.getScrollInfo?.();
      if (scrollInfo?.viewport) {
        this.setState({ scrollViewEl: scrollInfo.viewport });
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }, 50);
  }

  componentWillUnmount() {
    this.setState({ currentGroupKey: undefined });
    this.props.updatePreviewRecordId('');
    window.removeEventListener('popstate', this.onQueryChange);
  }
  onQueryChange = () => {
    if (!this.props.previewRecordId) return;
    handleReplaceState('page', 'recordDetail', () => {
      this.setState({ currentGroupKey: undefined });
      this.props.updatePreviewRecordId('');
    });
  };

  updateViewCard = (rowid, height) => {
    this.setState(prevState => {
      const prevMap = prevState.viewCardUpdateMap;
      if (prevMap[rowid] === height) {
        return null; // 不需要更新
      }
      return {
        viewCardUpdateMap: {
          ...prevMap,
          [rowid]: height,
        },
      };
    });
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
    const {
      worksheetControls,
      base,
      view,
      worksheetInfo,
      batchOptVisible,
      batchOptCheckedData,
      sheetSwitchPermit,
      currentSheetRows,
      groupDataInfo,
      colNum = 1,
      changeBatchOptData = () => {},
    } = this.props;

    return (
      <RecordCardIO
        key={item.rowid}
        colNum={colNum}
        data={item}
        view={view}
        appId={base.appId}
        projectId={worksheetInfo.projectId}
        controls={worksheetControls}
        allowAdd={worksheetInfo.allowAdd}
        batchOptVisible={batchOptVisible}
        batchOptCheckedData={batchOptCheckedData}
        sheetSwitchPermit={sheetSwitchPermit}
        currentSheetRows={currentSheetRows}
        groupDataInfo={groupDataInfo}
        changeBatchOptData={changeBatchOptData}
        viewRootEl={this.state.scrollViewEl}
        updateViewCard={this.updateViewCard}
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
            this.setState({ currentGroupKey: item.groupKey });
            this.props.updatePreviewRecordId(item.rowid);
          }
          addBehaviorLog('worksheetRecord', base.worksheetId, { rowId: item.rowid }); // 埋点
        }}
      />
    );
  };

  updateRow = (rowId, value, isviewdata) => {
    this.props.updateRow(rowId, value, isviewdata);
  };

  // 分组
  renderGroupContent = () => {
    const {
      groupDataInfo,
      base,
      view,
      worksheetControls = [],
      updateGroupDataInfo = () => {},
      loadGroupMore = () => {},
    } = this.props;
    const { groupData, isGroupLoading, unfoldedKeys } = groupDataInfo;
    const { viewId, appId, worksheetId } = base;

    return groupData.map(({ key, name, rows = [], totalNum, pageIndex = 1 } = {}) => {
      return (
        <Fragment key={key}>
          <div className="rowWrap">
            <GroupByControl
              appId={appId}
              worksheetId={worksheetId}
              viewId={viewId}
              folded={!unfoldedKeys.includes(key)}
              allFolded={unfoldedKeys.length >= groupData.length}
              count={totalNum}
              control={worksheetControls.find(o => o.controlId === getGroupControlId(view))}
              groupKey={key}
              name={name}
              view={view}
              onFold={() => {
                this.props.updateGroupDataInfo({
                  unfoldedKeys: !unfoldedKeys.includes(key)
                    ? [...unfoldedKeys, key]
                    : unfoldedKeys.filter(o => o !== key),
                });
              }}
            />

            {unfoldedKeys.includes(key) && rows.map(item => this.renderRow({ ...safeParse(item), groupKey: key }))}
          </div>
          {unfoldedKeys.includes(key) && rows.length < totalNum ? (
            isGroupLoading ? (
              <LoadDiv />
            ) : (
              <div
                className="mTop10 mBottom10 ThemeColor Font15 TxtCenter"
                onClick={() => {
                  updateGroupDataInfo({ groupKey: key, currentKeyPageIndex: pageIndex + 1 });
                  loadGroupMore(key);
                }}
              >
                <span TxtMiddle>{_l('查看更多')}</span>
                <span className="icon-arrow-down mLeft6"></span>
              </div>
            )
          ) : null}
        </Fragment>
      );
    });
  };

  render() {
    const {
      currentSheetRows,
      sheetRowLoading,
      sheetView,
      base,
      view,
      sheetSwitchPermit,
      previewRecordId,
      isCharge,
      worksheetInfo = {},
      groupDataInfo = {},
    } = this.props;
    const { groupData } = groupDataInfo;
    const { currentGroupKey } = this.state;
    const isGroup = _.get(view, 'advancedSetting.groupsetting');

    return (
      <Fragment>
        <ScrollView className="sheetRowsWrapper flex" ref={this.scrollViewRef} onScrollEnd={this.handleEndReached}>
          <PullToRefreshWrapper onRefresh={this.handlePullToRefresh}>
            {isGroup ? (
              this.renderGroupContent()
            ) : (
              <div className="rowWrap">{currentSheetRows.map(item => this.renderRow(item))}</div>
            )}
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
          isCharge={isCharge}
          currentSheetRows={
            isGroup && currentGroupKey
              ? (_.find(groupData, v => v.key === currentGroupKey) || {}).rows.map(o => safeParse(o))
              : currentSheetRows
          }
          loadNextPageRecords={this.props.changePageIndex}
          loadedRecordsOver={!(!sheetRowLoading && sheetView.isMore)}
          changeMobileSheetRows={this.props.changeMobileSheetRows}
          onClose={() => {
            this.setState({ currentGroupKey: undefined });
            this.props.updatePreviewRecordId('');
          }}
          updateRow={this.updateRow}
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
    ..._.pick(
      state.mobile,
      'base',
      'worksheetInfo',
      'currentSheetRows',
      'worksheetControls',
      'sheetRowLoading',
      'sheetView',
      'batchOptVisible',
      'batchOptCheckedData',
      'sheetSwitchPermit',
      'previewRecordId',
      'groupDataInfo',
      'isCharge',
    ),
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, [
        'changePageIndex',
        'changeBatchOptData',
        'changeMobileSheetRows',
        'updateIsPullRefreshing',
        'updatePreviewRecordId',
        'updateRow',
        'updateGroupDataInfo',
        'loadGroupMore',
      ]),
      dispatch,
    ),
)(SheetRows);

SheetRows.PropTypes = {
  colNum: PropTypes.number, // 一行显示几个，默认1个（画廊视图可配置2个）
};
