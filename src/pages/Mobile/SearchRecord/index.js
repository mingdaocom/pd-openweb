import React, { Fragment, Component } from 'react';
import { SpinLoading } from 'antd-mobile';
import CustomRecordCard from 'mobile/RecordList/RecordCard';
import sheetApi from 'src/api/worksheet';
import { WithoutSearchRows } from '../RecordList/SheetRows';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getRequest } from 'src/util';
import './index.less';
import _ from 'lodash';

const pageSize = 20;

function getFilterControls(searchId, keyWords) {
  return searchId && keyWords
    ? [
        {
          spliceType: 1,
          isGroup: true,
          groupFilters: [
            {
              controlId: searchId,
              dataType: 2,
              spliceType: 1,
              filterType: 2,
              dynamicSource: [],
              values: [keyWords],
            },
          ],
        },
      ]
    : [];
}

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sheetInfo: {},
      rows: [],
      filterControls: [],
      isMore: true,
      loading: true,
      pageIndex: 1,
    };
  }
  componentDidMount() {
    const { params } = this.props.match;
    const { filterId } = getRequest();

    const requestSheet = sheetApi
      .getWorksheetInfo({
        appId: params.appId,
        worksheetId: params.worksheetId,
        getTemplate: true,
        getViews: true,
      });

    const requestFilters = filterId
      ? sheetApi.getWorksheetFilterById({
          filterId,
        })
      : undefined;

    Promise.all([requestSheet, requestFilters]).then(result => {
      const [sheet, filterData = {}] = result;
      this.setState({
        sheetInfo: sheet,
        filterControls: formatValuesOfOriginConditions(filterData.items || []),
      }, () => {
        this.requestFilterRows();
      });
    });
  }
  requestFilterRows = () => {
    const { params } = this.props.match;
    const { pageIndex, filterControls, sheetInfo } = this.state;
    const controls = _.get(sheetInfo, ['template', 'controls']) || [];
    const { keyWords, searchId } = getRequest();

    this.setState({
      loading: true,
    });

    const searchControl = _.find(controls, { controlId: searchId });
    let searchFilter = null;

    if (searchControl) {
      searchFilter = getFilterControls(searchId, keyWords)
    }

    sheetApi
      .getFilterRows({
        appId: params.appId,
        worksheetId: params.worksheetId,
        searchType: 1,
        pageSize,
        pageIndex,
        status: 1,
        viewId: params.viewId,
        keyWords: searchId ? undefined : keyWords,
        filterControls: searchFilter ? filterControls.concat(searchFilter) : filterControls,
      })
      .then(({ data }) => {
        const { rows } = this.state;
        const newRows = rows.concat(data);
        if (newRows.length === 1) {
          const url = `/mobile/record/${params.appId}/${params.worksheetId}/${params.viewId}/${newRows[0].rowid}`;
          if (window.isMingDaoApp) {
            location.href = url;
          } else {
            window.mobileNavigateTo(url, true);
          }
        }
        this.setState({
          rows: newRows,
          isMore: data.length === pageSize,
          pageIndex: pageIndex + 1,
          loading: false,
        });
      });
  };
  handleEndReached = (event) => {
    const { target } = event;
    const { loading, isMore } = this.state;
    const isEnd = target.scrollHeight - target.scrollTop <= target.clientHeight;
    if (isEnd && !loading && isMore) {
      this.requestFilterRows();
    }
  };
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
      <CustomRecordCard
        className="mLeft8 mRight8"
        key={item.rowid}
        data={item}
        view={view}
        controls={worksheetControls}
        allowAdd={sheetInfo.allowAdd}
        onClick={() => {
          const url = `/mobile/record/${params.appId}/${params.worksheetId}/${params.viewId}/${item.rowid}`;
          if (window.isMingDaoApp) {
            location.href = url;
          } else {
            window.mobileNavigateTo(url);
          }
        }}
      />
    );
  };
  render() {
    const { loading, isMore, rows } = this.state;
    return (
      <div className="searchRecordWrapper flexColumn h100">
        {loading && _.isEmpty(rows) ? (
          <div className="flexRow justifyContentCenter alignItemsCenter h100">
            <SpinLoading color='primary' />
          </div>
        ) : (
          <Fragment>
            {rows.length ? (
              <Fragment>
                <div className="searchSheetRowsWrapper h100 pTop10" onScroll={this.handleEndReached}>
                  {rows.map(row => (
                    this.renderRow(row)
                  ))}
                </div>
                {isMore && (
                  <div className="flexRow alignItemsCenter justifyContentCenter">{loading ? <SpinLoading color='primary' /> : null}</div>
                )}
              </Fragment>
            ) : (
              <div className="h100">
                <WithoutSearchRows text={_l('没有搜索结果')} />
              </div>
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

export default Search;
