import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import { Flex, ActivityIndicator, WhiteSpace, ListView, WingBlank } from 'antd-mobile';
import CustomRecordCard from 'src/pages/Mobile/RecordList/RecordCard';
import Back from '../components/Back';
import * as recordListActions from '../RecordList/redux/actions';
import * as actions from './redux/actions';
import { WithoutSearchRows } from '../RecordList/SheetRows';
import './index.less';

class Search extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      value: '',
      isQuery: false,
      dataSource,
      isMore: true,
      loading: false,
      pageIndex: 1
    };
  }
  componentDidMount() {
    const { currentSheetInfo, match } = this.props;
    const { params } = match;
    if (_.isEmpty(currentSheetInfo)) {
      this.props.dispatch(recordListActions.getSheet({
        worksheetId: params.worksheetId,
        appId: params.appId,
      }));
    }
  }
  handleChange(event) {
    const { target } = event;
    this.setState({
      value: target.value,
    });
  }
  handleSearch(pageIndex = 1) {
    const { params } = this.props.match;
    const { value } = this.state;
    this.emptySearchSheetRows();
    this.setState({
      isQuery: true,
      loading: true,
    });
    $('.searchWrapper input').blur();
    this.props.dispatch(actions.changeSearchSheetRows({
      worksheetId: params.worksheetId,
      appId: params.appId,
      viewId: params.viewId,
      keyWords: value,
      pageIndex,
    }, isMore => {
      this.setState({
        pageIndex,
        loading: false,
        isMore,
        refreshing: false,
      });
    }));
  }
  navigateTo(url) {
    if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
      url = url + '#publicapp' + window.publicAppAuthorization;
    }
    this.props.history.push(url);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentSearchSheetRows.length !== this.props.currentSearchSheetRows.length) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows({...nextProps.currentSearchSheetRows}),
      });
    }
    if (_.isEmpty(nextProps.currentSheetInfo) !== _.isEmpty(this.props.currentSheetInfo)) {
      const { template } = nextProps.currentSheetInfo;
      this.setState({
        showControls: template.controls.slice(1, 4).map(item => item.controlId),
      });
    }
  }
  emptySearchSheetRows() {
    this.props.dispatch(actions.emptySearchSheetRows());
  }
  componentWillUnmount() {
    this.emptySearchSheetRows();
  }
  handleEndReached() {
    const { loading, isMore, pageIndex } = this.state;
    if (!loading && isMore) {
      this.handleSearch(pageIndex + 1);
    }
  }
  renderRow = item => {
    const { worksheetControls, match, currentSheetInfo } = this.props;
    const { params } = match;
    const { currentView } = currentSheetInfo;
    return (
      <WingBlank size="md" key={item.rowid}>
        <CustomRecordCard
          key={item.rowid}
          data={item}
          view={currentView}
          controls={worksheetControls}
          allowAdd={currentSheetInfo.allowAdd}
          onClick={() => {
            this.navigateTo(`/mobile/record/${params.appId}/${params.worksheetId}/${params.viewId}/${item.rowid}`);
          }}
        />
      </WingBlank>
    );
  }
  render() {
    const { value, isQuery, loading, isMore, dataSource } = this.state;
    const { worksheetControls, currentSearchSheetRows } = this.props;
    return (
      <div className="searchRecordWrapper flexColumn h100">
        <div className="searchWrapper">
          <Icon icon="h5_search"/>
          <form action="#" onSubmit={e => { e.preventDefault() }} className="w100">
            <input
              className="w100"
              type="search"
              autoFocus
              placeholder={_l('搜索')}
              value={value}
              onChange={this.handleChange.bind(this)}
              onKeyDown={event => { event.which === 13 && this.handleSearch() }}
            />
          </form>
          {value ? (
            <Icon
              icon="workflow_cancel"
              onClick={() => {
                this.emptySearchSheetRows();
                this.setState({
                  value: '',
                  isQuery: false,
                });
              }}
            />
          ) : null}
        </div>
        <WhiteSpace size="md" />
        <div className="flex">
          {
            loading && _.isEmpty(currentSearchSheetRows) ? (
              <Flex justify="center" align="center" className="h100">
                <ActivityIndicator size="large" />
              </Flex>
            ) : (
              <Fragment>
                {
                  currentSearchSheetRows.length ? (
                    <Fragment>
                      <ListView
                        className="searchSheetRowsWrapper h100"
                        dataSource={dataSource}
                        renderHeader={() => ( <Fragment /> )}
                        renderFooter={() => (
                          isMore ? <Flex justify="center">{loading ? <ActivityIndicator animating /> : null}</Flex> : <Fragment />
                        )}
                        pageSize={10}
                        scrollRenderAheadDistance={500}
                        onEndReached={this.handleEndReached.bind(this)}
                        onEndReachedThreshold={10}
                        renderRow={this.renderRow}
                      />
                    </Fragment>
                  ) : null
                }
                {
                  !currentSearchSheetRows.length && isQuery ? (
                    <div className="h100">
                      <WithoutSearchRows text={_l('没有搜索结果')}/>
                    </div>
                  ) : null
                }
                <Back
                  className="low"
                  onClick={() => {
                    this.props.history.goBack();
                  }}
                />
              </Fragment>
            )
          }
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  const { currentSheetInfo, worksheetControls, currentSearchSheetRows } = state.mobile;
  return {
    currentSheetInfo,
    worksheetControls,
    currentSearchSheetRows,
  };
})(Search);
