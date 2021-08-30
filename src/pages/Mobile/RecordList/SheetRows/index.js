import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
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
      dataSource: dataSource.cloneWithRows({ ...currentSheetRows }),
      loading: false,
      isMore: currentSheetRows.length === WORKSHEET_TABLE_PAGESIZE,
      pageIndex: 1,
      refreshing: false
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentSheetRows.length !== this.props.currentSheetRows.length) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows({ ...nextProps.currentSheetRows }),
      });
    }
  }
  requestSheetRows(pageIndex) {
    const { params } = this.props;
    this.setState({ loading: true });
    this.props.dispatch(
      actions.addSheetRows(
        {
          ...params,
          pageIndex,
        },
        isMore => {
          this.setState({
            pageIndex,
            loading: false,
            isMore,
            refreshing: false,
          });
        },
      ),
    );
  }
  handleEndReached() {
    const { loading, isMore, pageIndex } = this.state;
    if (!loading && isMore) {
      this.requestSheetRows(pageIndex + 1);
    }
  }
  renderRow(item) {
    const { worksheetControls, navigateTo, params, currentView, currentSheetInfo } = this.props;
    return (
      <WingBlank size="md">
        <CustomRecordCard
          key={item.rowid}
          data={item}
          view={currentView}
          controls={worksheetControls}
          allowAdd={currentSheetInfo.allowAdd}
          onClick={() => {
            navigateTo(
              `/mobile/record/${params.appId}/${params.worksheetId}/${params.viewId || currentView.viewId}/${
                item.rowid
              }`,
            );
          }}
        />
      </WingBlank>
    );
  }
  render() {
    const { isMore, loading, dataSource, refreshing } = this.state;
    const { currentSheetRows } = this.props;
    return (
      <Fragment>
        <ListView
          className="sheetRowsWrapper"
          dataSource={dataSource}
          renderHeader={() => <Fragment />}
          renderFooter={() =>
            isMore ? <Flex justify="center">{loading ? <ActivityIndicator animating /> : null}</Flex> : <Fragment />
          }
          initialListSize={20}
          pageSize={20}
          scrollRenderAheadDistance={500}
          onEndReached={this.handleEndReached.bind(this)}
          onEndReachedThreshold={20}
          pullToRefresh={
            <PullToRefresh
              refreshing={refreshing}
              onRefresh={() => {
                this.setState({ refreshing: true });
                this.requestSheetRows(1);
              }}
            />
          }
          style={{
            height: '100%',
            overflow: 'auto',
          }}
          renderRow={this.renderRow.bind(this)}
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
      {props.children}
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

export default connect(state => {
  const { currentSheetRows, worksheetControls, currentSheetInfo } = state.mobile;
  return {
    currentSheetRows,
    worksheetControls,
    currentSheetInfo,
  };
})(SheetRows);
