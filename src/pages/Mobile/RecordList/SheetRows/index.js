import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import { bindActionCreators } from 'redux';
import { Flex, Card, ListView, ActivityIndicator, PullToRefresh, WhiteSpace, WingBlank } from 'antd-mobile';
import CustomRecordCard from 'src/pages/Mobile/RecordList/RecordCard';
import * as actions from '../redux/actions';
import { WORKSHEET_TABLE_PAGESIZE } from 'src/pages/worksheet/constants/enum';
import withoutRows from './assets/withoutRows.png';
import './index.less';

class SheetRows extends Component {
  constructor(props) {
    super(props);
    const { currentSheetRows } = props;
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource.cloneWithRows({ ...currentSheetRows })
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentSheetRows.length !== this.props.currentSheetRows.length) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(nextProps.currentSheetRows),
      });
    }
    if (nextProps.batchOptCheckedData.length !== this.props.batchOptCheckedData) {
      const rows = nextProps.currentSheetRows.map(item => {
        return {
          check: nextProps.batchOptCheckedData.includes(item.rowid),
          ...item,
        }
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
  }
  renderRow = item => {
    const { worksheetControls, base, view, worksheetInfo, batchOptVisible, batchOptCheckedData } = this.props;
    return (
      <WingBlank size="md">
        <CustomRecordCard
          key={item.rowid}
          data={item}
          view={view}
          controls={worksheetControls}
          allowAdd={worksheetInfo.allowAdd}
          batchOptVisible={batchOptVisible}
          batchOptCheckedData={batchOptCheckedData}
          changeBatchOptData={this.props.changeBatchOptData}
          onClick={() => {
            if (!window.mobileNavigateTo) return;
            window.mobileNavigateTo(
              `/mobile/record/${base.appId}/${base.worksheetId}/${base.viewId || view.viewId}/${
                item.rowid
              }`,
            );
          }}
        />
      </WingBlank>
    );
  }
  render() {
    const { dataSource } = this.state;
    const { currentSheetRows, sheetRowLoading, sheetView } = this.props;
    return (
      <Fragment>
        <ListView
          className="sheetRowsWrapper flex"
          dataSource={dataSource}
          renderHeader={() => <Fragment />}
          renderFooter={() =>
            sheetView.isMore ? <Flex justify="center">{sheetRowLoading ? <ActivityIndicator animating /> : null}</Flex> : <div className="Height50 mBottom5"></div>
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
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['changePageIndex', 'changeBatchOptData']),
      dispatch,
  ),
)(SheetRows);
