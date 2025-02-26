import React, { Component } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import { Skeleton } from 'antd';
import { Checkbox, ScrollView, LoadDiv } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import smartSearchCtrl from 'src/api/smartSearch';
import CommonAjax from 'src/api/addressBook';
import homeAppAjax from 'src/api/homeApp';
import { getFeatureStatus, getCurrentProject } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import UserList from '../components/UserList';
import GlobalSearchEmpty from '../components/GlobalSearchEmpty';
import FilterPosition from '../components/FilterPosition';
import List from '../components/List';
import AppList from '../components/AppList';
import OrgSelect from '../components/OrgSelect';
import { getCurrentProjectId } from '../utils';
import './GlobalSearchAllContent.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

export default class GlobalSearchAllContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leftLoading: true,
      rightLoading: true,
      searchKeyword: '',
      result: false,
      rightResult: false,
      searchScope: this.props.match.params.appId ? localStorage.getItem('GLOBAL_SEARCH_SCOPE_MING') || 'record' : 'all',
      loadAppData: false,
      appData: undefined,
      recordData: undefined,
      isApp: this.props.match.params.appId ? true : false,
      appProjectId: getCurrentProjectId(),
      recordProjectId: getCurrentProjectId(),
      highlightType: '',
      onlyTitle: true,
      appInfo: undefined,
      filterCount: undefined,
    };
  }

  componentDidMount() {
    this.requestDebounce(this.props.searchKeyword);
    this.getFilterCount();

    if (this.props.match.params.appId) {
      this.getAppDetail();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchKeyword !== this.props.searchKeyword) {
      const { searchKeyword } = nextProps;
      this.requestDebounce(searchKeyword);
    }
  }

  getFilterCount = () => {
    const { recordProjectId } = this.state;
    const proObj = getCurrentProject(recordProjectId, true);

    if (getFeatureStatus(recordProjectId, VersionProductType.globalSearch) !== '1' || proObj.licenseType === 2) {
      this.setState({ filterCount: 0 });
      return;
    }

    smartSearchCtrl
      .getFilterCount({
        projectId: recordProjectId,
      })
      .then(res => {
        this.setState({
          filterCount: res,
        });
      });
  };

  getAppDetail = () => {
    homeAppAjax.getApp({ appId: this.props.match.params.appId }).then(res => {
      this.setState({ appInfo: res });
    });
  };

  getNextSection = section => {
    const { appData, recordData, result } = this.state;
    if (!section) {
      return appData.total !== 0
        ? 'appData'
        : recordData.total !== 0
        ? 'recordData'
        : result.length !== 0
        ? 'result'
        : null;
    } else if (section === 'appData') {
      return recordData.total !== 0 ? 'recordData' : result.length !== 0 ? 'result' : null;
    } else if (section === 'recordData') {
      return result.length !== 0 ? 'result' : null;
    } else {
      return null;
    }
  };

  requestDebounce = _.debounce(searchKeyword => {
    if (!searchKeyword) return;

    this.setState(
      {
        leftLoading: true,
        searchKeyword,
        loadAppData: true,
        rightLoading: true,
      },
      () => {
        this.request();
        this.getAllAddressbookByKeywords();
        this.getAppData();
      },
    );
  }, 500);

  request() {
    const { searchKeyword, searchScope } = this.state;

    if (searchScope === 'record') {
      this.setState({ leftLoading: false });
      return;
    }

    if (this.leftAjax) {
      this.leftAjax.abort();
    }

    this.leftAjax = smartSearchCtrl.searchByTypes({
      keywords: searchKeyword,
      searchTypes: ['post', 'task', 'kcnode'],
    });

    this.leftAjax.then(data => {
      this.setState({
        leftLoading: false,
      });
      if (data && data.length > 0) {
        this.setState({
          result: data,
        });
      } else {
        this.setState({
          result: [],
        });
      }
      this.leftAjax = null;
    });
  }

  async getAppData(options = {}) {
    const { searchScope, searchKeyword, appProjectId, recordProjectId, onlyTitle, appInfo } = this.state;
    const { type = undefined } = options;

    if (md.global.Account.projects.length === 0) {
      this.setState({ loadAppData: false });
      return;
    }

    const param = {
      keywords: searchKeyword,
      searchType: type || 0,
      searchRange: searchScope === 'all' ? 2 : 1,
      pageIndex: 1,
      pageSize: 5,
      projectId: getCurrentProjectId(),
      sort: 0,
      onlyTitle: onlyTitle,
      bombLayer: true,
    };

    if (type === 7) {
      param.projectId = appProjectId;
    } else if (type === 8) {
      param.projectId = recordProjectId;
    }

    if (searchScope === 'record') {
      param.appId = this.props.match.params.appId || '';

      if (appInfo && appInfo.projectId) {
        param.projectId = appInfo.projectId;
      }
    }

    const proObj = getCurrentProject(param.projectId, true);

    if (
      type === 8 &&
      (getFeatureStatus(recordProjectId, VersionProductType.globalSearch) === '2' || proObj.licenseType === 2)
    ) {
      this.setState({ loadAppData: false, recordData: { list: [], resultCode: 3 } });
      return;
    }

    smartSearchCtrl.searchApp(param).then(res => {
      if (!type) {
        this.setState({
          appData: res.apps || {},
          recordData: { ...res.rows, resultCode: proObj.licenseType === 2 ? 3 : res.resultCode },
          loadAppData: false,
        });
      } else if (type === 7) {
        this.setState({ appData: res.apps, loadAppData: false });
      } else {
        this.setState({ recordData: { ...res.rows, resultCode: res.resultCode }, loadAppData: false });
      }
    });
  }

  getStart = (type = '') => {
    const { appData, recordData, result } = this.state;

    let startType = '';
    if (appData && recordData && (appData.list.length !== 0 || recordData.list.length !== 0)) {
      startType = appData.list.length !== 0 ? 'app' : recordData.list.length !== 0 ? 'record' : '';
    } else if (result) {
      const _data = result.filter(l => l.count !== 0 && ['user', 'group'].indexOf(l.type) < 0);

      if (_data.length === 0) return false;

      startType = _data[0].type;
    } else {
      return false;
    }

    return type === startType;
  };

  onStartBetween = type => {
    const { appData, recordData, result } = this.state;

    let _list = result.filter(l => ['user', 'group'].indexOf(l.type) < 0);

    let startType = '';
    if (type === 'app') {
      startType = recordData.list.length !== 0 ? 'record' : _list[0].type;
    } else if (type === 'record') {
      startType = _list[0] ? _list[0].type : '';
    } else {
      let obj = _list.find((l, index) => index !== 0 && _list[index - 1].type === type);
      startType = obj ? obj.type : '';
    }
    this.setState({ highlightType: startType });
  };

  getAllAddressbookByKeywords() {
    const { searchKeyword, searchScope } = this.state;

    this.rightAjax && this.rightAjax.abort();
    this.rightAjax = CommonAjax.getAllChatAddressbookByKeywords({
      keywords: searchKeyword,
    });
    this.rightAjax.then(result => {
      this.setState({
        rightLoading: false,
        rightResult: result,
      });
    });
  }

  renderRightContent() {
    const { rightLoading, rightResult, searchKeyword, searchScope, isApp } = this.state;

    if (rightLoading) {
      return (
        <div className="searchContent loading pLeft20 pRight20 mTop20">
          <Skeleton
            className="mBottom13 userListSkeleton"
            loading={true}
            active={true}
            round={true}
            title={{ width: '78px' }}
            paragraph={false}
          />
          {[0, 1, 2, 3].map(l => (
            <Skeleton
              className="mBottom14"
              loading={true}
              active={true}
              round={true}
              avatar={{ size: 32 }}
              title={false}
              paragraph={{ rows: 1, width: '100%' }}
            />
          ))}
        </div>
      );
    }

    const { groups = { list: [] }, accounts = { list: [] } } = rightResult;

    if (accounts.list.length || groups.list.length) {
      return (
        <ScrollView className="globalSearchAllContentUserListCon">
          <UserList
            searchKeyword={searchKeyword}
            data={accounts}
            type={0}
            needTitle={accounts.allCount !== 0}
            showHr={true}
            closeDialog={this.props.onClose}
            needShowMore={false}
          />
          <UserList
            searchKeyword={searchKeyword}
            data={groups}
            type={1}
            needTitle={groups.allCount !== 0}
            closeDialog={this.props.onClose}
            needShowMore={false}
          />
        </ScrollView>
      );
    }

    return <div className="nodata">{_l('暂无联系人与群组搜索结果')}</div>;
  }

  renderAppContent() {
    const {
      leftLoading,
      loadAppData,
      result,
      appData,
      recordData,
      searchKeyword,
      recordProjectId,
      appProjectId,
      searchScope,
      isApp,
      highlightType,
      onlyTitle,
      filterCount,
    } = this.state;

    if (leftLoading || loadAppData) {
      return (
        <div className="searchContent loading searchContentText">
          <Skeleton
            className="mBottom18 userListSkeleton mTop20"
            active={true}
            loading={true}
            round={true}
            title={{ width: '78px' }}
            paragraph={false}
          />
          {[0, 1, 2, 3].map(l => (
            <Skeleton
              className="mBottom20"
              loading={true}
              active={true}
              round={true}
              avatar={{ size: 32 }}
              title={false}
              paragraph={{ rows: 2, width: ['253px', '100%'] }}
            />
          ))}
        </div>
      );
    }

    let content = null;

    if (
      (!appData || appData.total === 0) &&
      (!recordData || recordData.total === 0) &&
      (searchScope === 'record' || !result || result.length === 0)
    ) {
      content = <GlobalSearchEmpty />;
    }

    return (
      <React.Fragment>
        {appData && (
          <AppList
            currentProjectId={appProjectId}
            title={searchScope === 'record' ? _l('应用项') : undefined}
            isApp={isApp}
            data={appData}
            dataKey={'app'}
            searchKeyword={searchKeyword}
            currentProjectName={_.get(_.find(md.global.Account.projects, { projectId: appProjectId }), 'companyName')}
            needTitle={true}
            needShowMore={true}
            start={highlightType ? highlightType === 'app' : this.getStart('app')}
            onStartBetween={() => this.onStartBetween('app')}
            extendButtons={
              searchScope === 'all'
                ? [
                    <OrgSelect
                      style={{ marginLeft: '18px' }}
                      currentProjectId={appProjectId}
                      needAll={false}
                      onChange={projectId =>
                        this.setState({ appProjectId: projectId, loadAppData: true }, () =>
                          this.getAppData({ type: 7 }),
                        )
                      }
                    />,
                  ]
                : null
            }
          />
        )}
        {
          <AppList
            data={recordData}
            dataKey={'record'}
            currentProjectId={recordProjectId}
            searchKeyword={searchKeyword}
            currentProjectName={_.find(md.global.Account.projects, { projectId: recordProjectId }).companyName}
            needTitle={true}
            viewAll={true}
            explore={recordData && recordData.resultCode === 4}
            resultCode={recordData && recordData.resultCode}
            start={highlightType ? highlightType === 'record' : this.getStart('record')}
            onStartBetween={() => this.onStartBetween('record')}
            appId={searchScope === 'record' ? this.props.match.params.appId : ''}
            viewName={searchScope !== 'record'}
            closeDialog={this.props.onClose}
            extendButtons={
              searchScope === 'all'
                ? [
                    <OrgSelect
                      style={{ marginLeft: '18px' }}
                      currentProjectId={recordProjectId}
                      needAll={false}
                      onChange={projectId =>
                        this.setState({ recordProjectId: projectId, loadAppData: true }, () => {
                          this.getAppData({ type: 8 });
                          this.getFilterCount();
                        })
                      }
                    />,
                    <div className="mLeftAuto valignWrapper">
                      <FilterPosition
                        className="mRight20"
                        projectId={recordProjectId}
                        count={filterCount}
                        update={() => this.getAppData({ type: 8 })}
                        onChangeCount={count =>
                          this.setState({
                            filterCount: count,
                          })
                        }
                      />
                      <Checkbox
                        text={_l('只搜索记录标题')}
                        className="Gray_9e"
                        checked={onlyTitle}
                        onClick={value => {
                          this.setState({ onlyTitle: !onlyTitle, loadAppData: true }, () =>
                            this.getAppData({ type: 8 }),
                          );
                        }}
                      />
                    </div>,
                  ]
                : [
                    <div className="mLeftAuto valignWrapper">
                      <FilterPosition
                        className="mRight20"
                        projectId={recordProjectId}
                        count={filterCount}
                        update={() => this.getAppData({ type: 8 })}
                        onChangeCount={count =>
                          this.setState({
                            filterCount: count,
                          })
                        }
                      />
                      <Checkbox
                        text={_l('只搜索记录标题')}
                        className="Gray_9e"
                        checked={onlyTitle}
                        onClick={value => {
                          this.setState({ onlyTitle: !onlyTitle, loadAppData: true }, () =>
                            this.getAppData({ type: 8 }),
                          );
                        }}
                      />
                    </div>,
                  ]
            }
            update={() => {
              this.getFilterCount();
              this.getAppData({ type: 8 });
            }}
          />
        }
        {content}
      </React.Fragment>
    );
  }

  renderLeftContent() {
    const { result, leftLoading, searchKeyword, loadAppData, highlightType } = this.state;

    if (leftLoading || loadAppData) {
      return null;
    }

    if (result.length === 0) {
      return null;
    }

    return (result || []).map(item => {
      return (
        <List
          key={`globalSearchAllList-${item.type}`}
          searchKeyword={searchKeyword}
          data={item}
          dataKey={item.type}
          needTitle={true}
          viewAll={true}
          closeDialog={this.props.onClose}
          start={highlightType ? highlightType === item.type : this.getStart(item.type)}
          onStartBetween={() => this.onStartBetween(item.type)}
        />
      );
    });
  }

  searchScopeChange = type => {
    const { searchScope } = this.state;

    if (type === searchScope) return;

    if (type === 'all') {
      this.setState(
        {
          leftLoading: true,
          rightLoading: true,
        },
        () => {
          this.request();
          this.getAllAddressbookByKeywords();
        },
      );
    }

    this.setState(
      { searchScope: type, appProjectId: getCurrentProjectId(), recordProjectId: getCurrentProjectId() },
      () => {
        this.getAppData();
        this.getFilterCount();
      },
    );
    safeLocalStorageSetItem('GLOBAL_SEARCH_SCOPE_MING', type);
  };

  render() {
    const { searchScope, isApp } = this.state;
    return (
      <ClickAwayable component="div" id="GlobalSearchAllContentDiv" onClickAwayExceptions={['#GlobalSearch']}>
        <div className="globalSearchAllContent">
          <div className="leftCon">
            {isApp && (
              <div className="searchScope">
                <span
                  className={cx({ current: searchScope === 'record' })}
                  onClick={() => this.searchScopeChange('record')}
                >
                  {_l('本应用')}
                </span>
                <span className={cx({ current: searchScope === 'all' })} onClick={() => this.searchScopeChange('all')}>
                  {_l('全部')}
                </span>
              </div>
            )}
            {this.renderAppContent()}
            {searchScope === 'all' && this.renderLeftContent()}
          </div>
          <div className="rightCon">{this.renderRightContent()}</div>
        </div>
      </ClickAwayable>
    );
  }
}
