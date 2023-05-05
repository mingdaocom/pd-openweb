import React, { Component } from 'react';
import { withRouter } from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import { ScrollView, LoadDiv, Checkbox, WaterMark } from 'ming-ui';
import { Skeleton } from 'antd';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import GlobalSearchSide from './containers/GlobalSearchSide';
import GlobalSearchEmpty from './components/GlobalSearchEmpty';
import UserList from './components/UserList';
import OrgSelect from './components/OrgSelect';
import List from './components/List';
import AppList from './components/AppList';
import { navigateTo } from 'src/router/navigateTo';
import smartSearchAjax from 'src/api/smartSearch';
import { getRequest, getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { NEED_ALL_ORG_TAB, SEARCH_APP_SEARCH_TYPE, GLOBAL_SEARCH_FEATURE_ID } from './enum';
import './index.less';
import SelectApp from './components/selectApp';
import SelectSort from './components/SelectSort';
import DateFilter from './components/DateFilter';
import { getCurrentProjectId } from './utils';

@withRouter
@errorBoundary
export default class GlobalSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKey: undefined,
      searchType: '',
      loading: false,
      data: undefined,
      pageIndex: 1,
      projectId: '',
      total: 0,
      searchAppResCode: false,
      appData: undefined,
      appId: undefined,
      sort: 0,
      dateRange: undefined,
      loadEnd: false,
      otherLoading: false,
      appProjectId: '',
      highlightType: '',
      onlyTitle: true,
    };
  }

  componentDidMount() {
    const urlParam = getRequest(this.props.search);

    this.initParam();

    if (urlParam.appId) {
      this.setState({ appId: urlParam.appId });
    }
  }

  componentDidUpdate() {
    const urlParam = getRequest(this.props.search);

    if (
      this.state.searchKey !== urlParam.search_key ||
      (urlParam.search_type && this.state.searchType !== urlParam.search_type)
    ) {
      this.initParam();
    }
  }

  initParam() {
    const urlParam = getRequest(this.props.search);
    const { searchType, projectId, appProjectId } = this.state;

    this.updateSearchParam({
      searchKey: urlParam.search_key,
      searchType: urlParam.search_type || 'all',
      projectId: NEED_ALL_ORG_TAB.includes(urlParam.search_type)
        ? 'all'
        : urlParam.search_type !== searchType
        ? getCurrentProjectId()
        : projectId,
      appProjectId: urlParam.search_type !== searchType ? getCurrentProjectId() : appProjectId,
      pageIndex: 1,
      dateRange: undefined,
    });
  }

  updateSearchParam = (options = {}) => {
    this.setState(options, this.getData);
  };

  getData = () => {
    const { searchKey, searchType, pageIndex, projectId, appId, sort, dateRange, appData, data, onlyTitle } =
      this.state;
    const _searchRange = searchType === 'record' && appId ? 1 : 2;

    if (!searchKey || !searchKey.trim() || searchKey.trim() === 'undefined') return;
    if (SEARCH_APP_SEARCH_TYPE.hasOwnProperty(searchType) && !projectId) return;

    this.setState({ loading: true, otherLoading: true });

    const searchAppParam = {
      keywords: searchKey,
      searchType: SEARCH_APP_SEARCH_TYPE[searchType],
      searchRange: _searchRange,
      pageIndex,
      pageSize: searchType === 'all' ? 5 : 50,
      projectId: projectId === 'all' || !projectId ? getCurrentProjectId() : projectId,
      appId: _searchRange === 1 ? appId : undefined,
      sort: searchType === 'record' ? sort : 0,
      onlyTitle: onlyTitle,
      bombLayer: searchType === 'all' ? true : false,
    };

    const searchParam = {
      keywords: searchKey,
      searchType: searchType,
      projectId: searchType === 'all' ? '' : projectId === 'all' ? '' : projectId,
      pageSize: searchType === 'all' ? 5 : 50,
      searchRange: searchType === 'all' ? '0' : projectId === 'all' ? '0' : '2',
      postType: -1,
      pageIndex,
    };

    if (dateRange && dateRange.key !== 'clear') {
      searchParam.startDate = moment(dateRange.value[0]).format('YYYY-MM-DD');
      searchParam.endDate = moment(dateRange.value[1]).format('YYYY-MM-DD');
    }

    if (searchType === 'all') {
      smartSearchAjax.search(searchParam).then(res => {
        this.setState({
          loading: false,
          data: res,
        });
      });
      if (md.global.Account.projects.length === 0) {
        this.setState({ otherLoading: false });
      } else {
        smartSearchAjax.searchApp(searchAppParam).then(
          resApp => {
            this.setState({
              otherLoading: false,
              resultCode: resApp.resultCode,
              appData: resApp,
            });
          },
          err => {
            this.setState({ otherLoading: false });
          },
        );
      }
    } else {
      const proId = projectId === 'all' || !projectId ? getCurrentProjectId() : projectId;

      const proObj = _.find(md.global.Account.projects || [], {
        projectId: proId,
      });

      if (
        searchType === 'record' &&
        (getFeatureStatus(proId, GLOBAL_SEARCH_FEATURE_ID) !== '1' || proObj.licenseType === 2)
      ) {
        this.setState({
          loading: false,
          otherLoading: false,
          total: 0,
          loadEnd: true,
        });
        return;
      }

      const promise = SEARCH_APP_SEARCH_TYPE.hasOwnProperty(searchType)
        ? smartSearchAjax.searchApp(searchAppParam)
        : smartSearchAjax.search(searchParam);

      promise.then(res => {
        const _data = searchType === 'app' ? res.apps : searchType === 'record' ? res.rows : res;
        const _state = {
          loading: false,
          otherLoading: false,
          total: SEARCH_APP_SEARCH_TYPE.hasOwnProperty(searchType)
            ? _data.total || 0
            : _data[0]
            ? _data[0].count || 0
            : 0,
          searchAppResCode: res.resultCode,
        };
        if (['app', 'record'].indexOf(searchType) > -1) {
          let key = searchType === 'app' ? 'apps' : 'rows';
          if (pageIndex === 1) {
            _state.appData = res;
          } else if (searchType === 'app') {
            _state.appData = res;
            _state.appData.apps.list = appData.apps.list.concat(_data.list);
          } else {
            _state.appData = res;
            _state.appData.rows.list = appData.rows.list.concat(_data.list);
            _state.appData.rows.titleControls = appData.rows.titleControls.concat(_data.titleControls);
          }
          _state.loadEnd =
            searchType === 'record' ? !res.rows.nextPage : !(_state.total > _state.appData[key].list.length);
        } else {
          _state.data = _data;
          if (pageIndex !== 1) {
            _state.data[0][searchType + 'List'] = (data[0][searchType + 'List'] || []).concat(
              _data[0][searchType + 'List'] || [],
            );
            _state.loadEnd = !(_state.total > _state.data[0][searchType + 'List'].length);
          }
        }

        this.setState({ ..._state });
      });
    }
  };

  updateSearchApp = (options = {}) => {
    this.setState({ loading: true });
    const { searchKey, projectId, appProjectId, resultCode, appData, onlyTitle } = this.state;
    const { type } = options;
    const param = {
      keywords: searchKey,
      searchType: type,
      searchRange: 2,
      pageIndex: 1,
      pageSize: 5,
      projectId: !projectId ? getCurrentProjectId() : type === 7 ? appProjectId : projectId,
      sort: 0,
      onlyTitle: onlyTitle,
    };
    smartSearchAjax.searchApp(param).then(res => {
      let _data = _.cloneDeep(appData);
      if (type === 7) {
        _data.apps = res.apps;
      } else {
        _data.rows = res.rows;
        _data.resultCode = res.resultCode;
      }
      this.setState({
        loading: false,
        resultCode: type === 7 ? resultCode : res.resultCode,
        appData: _data,
      });
    });
  };

  onChange = value => {
    const { searchKey, searchType, projectId, loading, otherLoading } = this.state;
    if (value.searchType === searchType || loading || otherLoading) return;
    navigateTo(`/search?search_key=${searchKey || ''}&search_type=${value.searchType || ''}`);
  };

  getStart = (type = '') => {
    const { appData, data } = this.state;

    let startType = '';
    if (appData && (appData.apps.length !== 0 || appData.rows.length !== 0)) {
      startType = appData.apps.length !== 0 ? 'app' : appData.rows.length !== 0 ? 'record' : '';
    } else if (data) {
      const _data = data.filter(l => l.count !== 0 && ['user', 'group'].indexOf(l.type) < 0);

      if (_data.length === 0) return false;

      startType = _data[0].type;
    } else {
      return false;
    }

    return type === startType;
  };

  onStartBetween = type => {
    const { appData, data } = this.state;

    let _list = data.filter(l => ['user', 'group'].indexOf(l.type) < 0);

    let startType = '';
    if (type === 'app') {
      startType = appData.rows.length !== 0 ? 'record' : _list[0].type;
    } else if (type === 'record') {
      startType = _list[0] ? _list[0].type : '';
    } else {
      let obj = _list.find((l, index) => index !== 0 && _list[index - 1].type === type);
      startType = obj ? obj.type : '';
    }
    this.setState({ highlightType: startType });
  };

  renderList = () => {
    const {
      searchType,
      loading,
      searchKey,
      projectId,
      data,
      appData,
      searchAppResCode,
      otherLoading,
      sort,
      onlyTitle,
      resultCode,
    } = this.state;

    let content = null;

    if (searchAppResCode === 2 && searchType === 'record') return null;

    const currentProject = _.find(md.global.Account.projects, {
      projectId:
        projectId !== 'all' ? projectId : NEED_ALL_ORG_TAB.includes(searchType) ? projectId : getCurrentProjectId(),
    });

    if (
      searchType === 'record' &&
      (getFeatureStatus(currentProject.projectId, GLOBAL_SEARCH_FEATURE_ID) !== '1' || currentProject.licenseType === 2)
    )
      return null;

    if (
      !loading &&
      !otherLoading &&
      ((searchType === 'all' &&
        (!data || data.length === 0) &&
        (!appData || ((!appData.apps || appData.apps.total === 0) && (!appData.rows || appData.rows.total === 0)))) ||
        (searchType === 'record' && (!appData || !appData.rows || appData.rows.total === 0)) ||
        (searchType === 'app' && (!appData || !appData.apps || appData.apps.total === 0)))
    ) {
      return (
        <GlobalSearchEmpty positionStyle={{ top: '97px', transform: 'translate(-50%, 0)' }} text={_l('没有搜索结果')} />
      );
    }

    if (!data && !appData) return;

    if ((searchType === 'user' || searchType === 'group') && data && data[0]) {
      let _data = {
        allCount: data[0].count || 0,
        type: data[0].type,
        list: data[0][searchType + 'List'],
      };
      content = (
        <UserList
          needDesc={searchType === 'group' ? false : projectId && projectId !== 'all'}
          data={{ ..._data }}
          type={searchType === 'user' ? 0 : 1}
          needShowMore={false}
          needShowAll={false}
          searchKeyword={searchKey}
        />
      );
    } else if (['kcnode', 'task', 'post'].indexOf(searchType) > -1) {
      content = data && (
        <List data={data[0] || []} dataKey={searchType} searchKeyword={searchKey} needTime={true} start={true} />
      );
    } else if (['app', 'record'].indexOf(searchType) > -1) {
      if (!appData || !projectId) return null;

      content = (
        <AppList
          data={searchType === 'app' ? appData.apps : appData.rows}
          dataKey={searchType}
          searchKeyword={searchKey}
          currentProjectName={currentProject.companyName}
          needTime={true}
          start={true}
          loadMore={true}
          sortTime={sort < 3 ? 'updateTime' : 'createTime'}
          getNextPage={() => {
            if (searchType === 'app') return;

            const { searchType, loadEnd } = this.state;

            if (loadEnd) return;

            this.updateSearchParam({ pageIndex: this.state.pageIndex + 1 });
          }}
        />
      );
    } else if (searchType === 'all') {
      const { appProjectId, highlightType } = this.state;

      return (
        <React.Fragment>
          {['apps', 'rows'].map(item => {
            if (!appData) return null;

            let buttons = [
              <OrgSelect
                style={{ marginLeft: '18px' }}
                currentProjectId={(item === 'apps' ? appProjectId : projectId) || getCurrentProjectId()}
                needAll={false}
                onChange={projectId => {
                  if (item === 'apps') {
                    this.setState({ appProjectId: projectId }, () => this.updateSearchApp({ type: 7 }));
                    return;
                  }
                  this.setState({ projectId }, () => this.updateSearchApp({ type: 8 }));
                }}
              />,
            ];
            const type = item === 'apps' ? 'app' : 'record';

            if (item === 'rows') {
              buttons.push(
                <Checkbox
                  text={_l('只搜索记录标题')}
                  className="Gray_9e mLeftAuto"
                  checked={onlyTitle}
                  onClick={value => {
                    this.setState({ onlyTitle: !onlyTitle }, () => this.updateSearchApp({ type: 8 }));
                  }}
                />,
              );
            }

            return (
              <AppList
                key={`global-search-appList-${item}`}
                data={appData[item] || {}}
                dataKey={type}
                searchKeyword={searchKey}
                currentProjectName={currentProject.companyName}
                needTime={true}
                needTitle={true}
                viewAll={true}
                className="globalSearchAllContentItem"
                extendButtons={buttons}
                start={highlightType ? highlightType === type : this.getStart(type)}
                explore={item === 'rows' && searchAppResCode === 4}
                onStartBetween={() => this.onStartBetween(type)}
                resultCode={item === 'rows' ? (currentProject.licenseType === 2 ? 3 : resultCode) : null}
              />
            );
          })}
          {data &&
            data
              .filter(l => l.type !== 'user' && l.type !== 'group')
              .map(item => {
                return (
                  <List
                    className="globalSearchAllContentItem"
                    data={item}
                    dataKey={item.type}
                    searchKeyword={searchKey}
                    needTime={true}
                    needTitle={true}
                    start={highlightType ? highlightType === item.type : this.getStart(item.type)}
                    onStartBetween={() => this.onStartBetween(item.type)}
                    viewAll={true}
                  />
                );
              })}
          {data &&
            data
              .filter(l => l.type === 'user' || l.type === 'group')
              .map(item => {
                let _data = {
                  allCount: item.count,
                  type: item.type,
                  list: item[item.type + 'List'],
                };
                return (
                  <UserList
                    needDesc={false}
                    data={{ ..._data }}
                    type={item.type === 'user' ? 0 : 1}
                    needShowMore={false}
                    needShowAll={true}
                    searchKeyword={searchKey}
                    needTitle={true}
                    className="globalSearchAllContentItem"
                  />
                );
              })}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        {content}
        {(loading || otherLoading) && (
          <div className="searchContent loading">
            <LoadDiv size="middle" />
          </div>
        )}
      </React.Fragment>
    );
  };

  handleScrollEnd = _.debounce(e => {
    const { searchType, loadEnd } = this.state;

    if (searchType === 'all' || loadEnd) return;

    this.updateSearchParam({ pageIndex: this.state.pageIndex + 1 });
  }, 500);

  render() {
    const {
      searchKey,
      searchType,
      data,
      loading,
      projectId,
      total,
      searchAppResCode,
      appData,
      appId,
      sort,
      dateRange,
      otherLoading,
      onlyTitle,
      pageIndex,
    } = this.state;

    if (!searchType) return null;

    const proId = projectId === 'all' || !projectId ? getCurrentProjectId() : projectId;

    const proObj = _.find(md.global.Account.projects, {
      projectId: proId,
    });

    return (
      <WaterMark projectId={getCurrentProjectId()}>
        <div className="GlobalSearch">
          <div className="GlobalSearchCard">
            <GlobalSearchSide
              current={searchType}
              onChange={value => {
                if (value.searchType === searchType) return;

                this.setState({ data: undefined, appData: undefined });
                navigateTo(`/search?search_key=${searchKey}&search_type=${value.searchType}`);
              }}
            />
            <div className="GlobalSearchContent">
              {searchType !== 'all' && (
                <React.Fragment>
                  <div className="flexRow selectCon mTop20">
                    <OrgSelect
                      currentProjectId={projectId || getCurrentProjectId()}
                      needAll={NEED_ALL_ORG_TAB.includes(searchType)}
                      onChange={projectId => this.updateSearchParam({ projectId, pageIndex: 1 })}
                    />
                    <div className="mRight24 valignWrapper">
                      {searchType === 'record' && (
                        <Checkbox
                          text={_l('只搜索记录标题')}
                          className="Gray_9e"
                          checked={onlyTitle}
                          onClick={value => {
                            this.updateSearchParam({ onlyTitle: !onlyTitle, pageIndex: 1 });
                          }}
                        />
                      )}
                      {searchType === 'record' && (
                        <SelectApp
                          className="mLeft16"
                          projectId={projectId}
                          defaultAppId={appId}
                          filterIds={_.uniq((appData ? appData.rows.list || [] : []).map(l => l.appId))}
                          onChange={newAppId => this.updateSearchParam({ appId: newAppId, pageIndex: 1 })}
                        />
                      )}
                      {['record'].indexOf(searchType) > -1 && (
                        <SelectSort
                          className="mLeft20"
                          value={sort}
                          onChange={value => this.updateSearchParam({ sort: value, pageIndex: 1 })}
                        />
                      )}
                      {['post', 'task', 'kcnode'].indexOf(searchType) > -1 && (
                        <DateFilter
                          value={dateRange}
                          onChange={value => this.updateSearchParam({ dateRange: value, pageIndex: 1 })}
                        />
                      )}
                    </div>
                  </div>

                  {searchKey &&
                    (searchType === 'record'
                      ? getFeatureStatus(proId, GLOBAL_SEARCH_FEATURE_ID) !== '2' && proObj.licenseType !== 2
                      : true) && (
                      <Skeleton
                        round={true}
                        paragraph={false}
                        loading={
                          (loading || otherLoading) &&
                          pageIndex === 1 &&
                          (['app', 'record'].indexOf(searchType) < 0 ||
                            (searchAppResCode === 2 && searchType === 'record'))
                        }
                        title={{ width: '250px' }}
                        active={true}
                      >
                        <p className="allCount mTop16 Gray_9e mLeft10">
                          {searchAppResCode === 2 && searchType === 'record'
                            ? _l('数据正在初始化，请耐心等待')
                            : ['app', 'record'].indexOf(searchType) < 0
                            ? _l('搜索到 %0 个结果', total)
                            : null}
                        </p>
                      </Skeleton>
                    )}
                </React.Fragment>
              )}

              {(!searchKey || !searchKey.trim()) &&
                (searchType === 'record'
                  ? getFeatureStatus(proId, GLOBAL_SEARCH_FEATURE_ID) === '1' && proObj.licenseType !== 2
                  : true) && (
                  <GlobalSearchEmpty
                    positionStyle={{ top: '97px', transform: 'translate(-50%, 0)' }}
                    text={_l('请输入搜索关键字')}
                  />
                )}
              {searchType === 'record' &&
                !loading &&
                (getFeatureStatus(proId, GLOBAL_SEARCH_FEATURE_ID) !== '1' || proObj.licenseType === 2) && (
                  <div className="upgradeVersion ">
                    {buriedUpgradeVersionDialog(proId, GLOBAL_SEARCH_FEATURE_ID, 'content')}
                  </div>
                )}
              <ScrollView onScrollEnd={this.handleScrollEnd}>
                {searchKey && searchKey.trim() && (
                  <React.Fragment>
                    {[...new Array(5)].map((item, index) => (
                      <Skeleton
                        className="mBottom20 scrollListskeleton"
                        active={true}
                        round={true}
                        loading={loading && otherLoading && pageIndex === 1}
                        title={false}
                        avatar={{ size: 32 }}
                        paragraph={{ rows: 2, width: ['253px', '100%'] }}
                      >
                        {index === 0 ? this.renderList() : null}
                      </Skeleton>
                    ))}
                  </React.Fragment>
                )}
              </ScrollView>
            </div>
          </div>
        </div>
      </WaterMark>
    );
  }
}
