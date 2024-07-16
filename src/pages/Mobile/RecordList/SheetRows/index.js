import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import { bindActionCreators } from 'redux';
import { Flex, Card, ListView, ActivityIndicator, PullToRefresh, WhiteSpace, WingBlank } from 'antd-mobile';
import CustomRecordCard from 'mobile/RecordList/RecordCard';
import * as actions from '../redux/actions';
import { WORKSHEET_TABLE_PAGESIZE } from 'src/pages/worksheet/constants/enum';
import { RecordInfoModal } from 'mobile/Record';
import withoutRows from './assets/withoutRows.png';
import { browserIsMobile, addBehaviorLog } from 'src/util';
import RegExpValidator from 'src/util/expression';
import './index.less';
import _ from 'lodash';

class SheetRows extends Component {
  constructor(props) {
    super(props);
    const { currentSheetRows } = props;
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    const temp =
      _.get(props, 'view.viewType') === 6 && _.get(props, 'view.childType') === 1 && !_.isEmpty(currentSheetRows)
        ? [...currentSheetRows[0]]
        : currentSheetRows;
    this.state = {
      previewRecordId: undefined,
      dataSource: dataSource.cloneWithRows({ ...temp }),
    };
  }
  componentWillReceiveProps(nextProps) {
    const { childType, viewType } = _.get(nextProps, 'view');
    if (nextProps.currentSheetRows.length !== this.props.currentSheetRows.length) {
      const temp =
        viewType === 6 && childType === 1 && !_.isEmpty(nextProps.currentSheetRows)
          ? [...nextProps.currentSheetRows[0]]
          : nextProps.currentSheetRows;
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(temp),
      });
    }
    if (nextProps.batchOptCheckedData.length !== this.props.batchOptCheckedData) {
      const rows = nextProps.currentSheetRows
        .filter((it, index) => (viewType === 6 && childType === 1 ? index === 0 : true))
        .map(item => {
          return {
            check: nextProps.batchOptCheckedData.includes(item.rowid),
            ...item,
          };
        });
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(rows),
      });
    }
  }
  handleEndReached = () => {
    const { sheetRowLoading, sheetView } = this.props;
    if (!sheetRowLoading && sheetView.isMore) {
      this.props.changePageIndex();
    }
  };
  renderRow = item => {
    const { worksheetControls, base, view, worksheetInfo, batchOptVisible, batchOptCheckedData, sheetSwitchPermit } =
      this.props;
    return (
      <WingBlank size="md">
        <CustomRecordCard
          key={item.rowid}
          data={item}
          view={view}
          appId={base.appId}
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

            if (window.isMingDaoApp) {
              const { appId, worksheetId, viewId } = this.props;
              window.location.href = `/mobile/record/${base.appId}/${base.worksheetId}/${base.viewId || view.viewId}/${
                item.rowid
              }`;
              return;
            }
            if (browserIsMobile()) {
              this.setState({
                previewRecordId: item.rowid,
              });
            }
            addBehaviorLog('worksheetRecord', base.worksheetId, { rowId: item.rowid }); // 埋点
          }}
        />
      </WingBlank>
    );
  };
  render() {
    const { dataSource, previewRecordId } = this.state;
    const { currentSheetRows, sheetRowLoading, sheetView, base, view, sheetSwitchPermit } = this.props;
    return (
      <Fragment>
        <ListView
          className="sheetRowsWrapper flex"
          dataSource={dataSource}
          renderHeader={() => <Fragment />}
          renderFooter={() =>
            sheetView.isMore ? (
              <Flex justify="center">{sheetRowLoading ? <ActivityIndicator animating /> : null}</Flex>
            ) : (
              <div className="Height50 mBottom5"></div>
            )
          }
          initialListSize={20}
          pageSize={20}
          scrollRenderAheadDistance={500}
          onEndReached={this.handleEndReached}
          onEndReachedThreshold={20}
          pullToRefresh={
            <PullToRefresh
              refreshing={sheetRowLoading}
              onRefresh={() => {
                this.props.changePageIndex(1);
              }}
            />
          }
          style={{
            height: '100%',
            overflow: 'auto',
          }}
          renderRow={this.renderRow}
        />
        <RecordInfoModal
          className="full"
          visible={!!previewRecordId}
          appId={base.appId}
          worksheetId={base.worksheetId}
          viewId={base.viewId || view.viewId}
          rowId={previewRecordId}
          sheetSwitchPermit={sheetSwitchPermit}
          onClose={() => {
            this.setState({
              previewRecordId: undefined,
            });
          }}
        />
      </Fragment>
    );
  }
}

export const WithoutRows = props => {
  return (
    <Flex className="withoutRows" direction="column" justify="center" align="center">
      <img className="img" src={withoutRows} />
      <WhiteSpace size="md" />
      <div className="text">{props.text}</div>
    </Flex>
  );
};

export const WithoutSearchRows = props => {
  return (
    <Flex className="withoutRows" direction="column" justify="center" align="center">
      <Icon icon="search" />
      <WhiteSpace size="md" />
      <div className="text">{props.text}</div>
    </Flex>
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
  }),
  dispatch => bindActionCreators(_.pick(actions, ['changePageIndex', 'changeBatchOptData']), dispatch),
)(SheetRows);
