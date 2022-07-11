import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import { Flex, ActivityIndicator, WhiteSpace, ListView, WingBlank } from 'antd-mobile';
import CustomRecordCard from 'mobile/RecordList/RecordCard';
import sheetApi from 'src/api/worksheet';
import { WithoutSearchRows } from '../RecordList/SheetRows';
import { getDefaultCondition, formatConditionForSave } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getRequest } from 'src/util';
import './index.less';

const pageSize = 20;

class Search extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      sheetInfo: {},
      rows: [],
      filterControls: [],
      dataSource,
      isMore: true,
      loading: true,
      pageIndex: 1
    };
  }
  componentDidMount() {
    const { params } = this.props.match;
    const { filterId } = getRequest();

    const requestSheet = sheetApi.getWorksheetInfo({
      appId: params.appId,
      worksheetId: params.worksheetId,
      getTemplate: true,
      getViews: true,
    }).then();

    const requestFilters = filterId ? sheetApi.getWorksheetFilterById({
      filterId
    }) : undefined;

    Promise.all([requestSheet, requestFilters]).then(result => {
      const [ sheet, filterData = {} ] = result;
      this.setState({
        sheetInfo: sheet,
        filterControls: formatValuesOfOriginConditions(filterData.items || [])
      });
      this.requestFilterRows();
    });
  }
  requestFilterRows = () => {
    const { params } = this.props.match;
    const { loading, isMore, pageIndex, filterControls, sheetInfo } = this.state;
    const controls = _.get(sheetInfo, ['template', 'controls']) || [];
    const { keyWords, searchId } = getRequest();

    this.setState({
      loading: true
    });

    const searchControl = _.find(controls, { controlId: searchId });
    let searchFilter = null;

    if (searchControl) {
      const data = getDefaultCondition(searchControl);
      searchFilter = formatConditionForSave({
        ...data,
        type: 2,
        values: [keyWords]
      }, 1);
    }

    sheetApi.getFilterRows({
      appId: params.appId,
      worksheetId: params.worksheetId,
      searchType: 1,
      pageSize,
      pageIndex,
      status: 1,
      viewId: params.viewId,
      keyWords: searchId ? undefined : keyWords,
      filterControls: searchFilter ? filterControls.concat(searchFilter) : filterControls
    }).then(({ data }) => {
      const { rows } = this.state;
      const newRows = rows.concat(data);
      if (newRows.length === 1) {
        window.mobileNavigateTo(`/mobile/record/${params.appId}/${params.worksheetId}/${params.viewId}/${newRows[0].rowid}`, true);
      }
      this.setState({
        rows: newRows,
        isMore: data.length === pageSize,
        pageIndex: pageIndex + 1,
        loading: false,
        dataSource: this.state.dataSource.cloneWithRows(newRows),
      });
    });
  }
  handleEndReached = () => {
    const { loading, isMore } = this.state;
    if (!loading && isMore) {
      this.requestFilterRows();
    }
  }
  renderRow = item => {
    const { match } = this.props;
    const { params } = match;
    const { sheetInfo } = this.state;
    const { views } = sheetInfo;
    const view = _.find(views, { viewId: params.viewId });

    const worksheetControls = sheetInfo.template.controls.filter(item => {
      if (item.attribute === 1) {
        return true;
      }
      return _.isEmpty(view) ? true : !view.controls.includes(item.controlId);
    });

    return (
      <WingBlank size="md" key={item.rowid}>
        <CustomRecordCard
          key={item.rowid}
          data={item}
          view={view}
          controls={worksheetControls}
          allowAdd={sheetInfo.allowAdd}
          onClick={() => {
            window.mobileNavigateTo(`/mobile/record/${params.appId}/${params.worksheetId}/${params.viewId}/${item.rowid}`);
          }}
        />
      </WingBlank>
    );
  }
  render() {
    const { loading, isMore, rows, dataSource } = this.state;
    return (
      <div className="searchRecordWrapper flexColumn h100">
        <div className="flex">
          {
            loading && _.isEmpty(rows) ? (
              <Flex justify="center" align="center" className="h100">
                <ActivityIndicator size="large" />
              </Flex>
            ) : (
              <Fragment>
                {rows.length ? (
                  <ListView
                    className="searchSheetRowsWrapper h100"
                    dataSource={dataSource}
                    renderHeader={() => ( <Fragment /> )}
                    renderFooter={() => (
                      isMore ? <Flex justify="center">{loading ? <ActivityIndicator animating /> : null}</Flex> : <Fragment />
                    )}
                    pageSize={10}
                    scrollRenderAheadDistance={500}
                    onEndReached={this.handleEndReached}
                    onEndReachedThreshold={10}
                    renderRow={this.renderRow}
                  />
                ) : (
                  <div className="h100">
                    <WithoutSearchRows text={_l('没有搜索结果')}/>
                  </div>
                )}
              </Fragment>
            )
          }
        </div>
      </div>
    );
  }
}

export default Search;

