import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Icon, LoadDiv, ScrollView, Switch, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import projectAjax from 'src/api/project';
import syncTaskApi from 'src/pages/integration/api/syncTask.js';
import { buriedUpgradeVersionDialog, upgradeVersionDialog } from 'src/components/upgradeVersion';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import TableEmpty from 'src/pages/Admin/common/TableEmpty';
import { TASK_STATUS_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import Search from 'src/pages/workflow/components/Search';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import PaginationWrap from '../../components/PaginationWrap';
import PurchaseExpandPack from '../../components/PurchaseExpandPack';
import SelectUser from '../../components/SelectUser';
import './index.less';

export default class AggregationTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appList: [{ label: _l('全部应用'), value: '' }],
      appId: '',
      taskStatus: '',
      pageIndex: 1,
      list: [],
      sortId: 'createDate',
      userInfo: [],
    };
    this.ajaxPromise = null;
    this.changeTaskAjax = null;
  }

  componentDidMount() {
    const { projectId } = this.props.match.params || {};
    const featureType = getFeatureStatus(projectId, VersionProductType.aggregation);
    this.getList();
    if (!featureType || featureType === '2') return;
    this.getAggregationTableUsage();
  }

  getList = () => {
    const { projectId } = this.props.match.params;
    const { appId, keyWords, pageIndex, taskStatus, isAsc, sortId, userInfo = [] } = this.state;

    this.setState({ loading: true });

    if (this.ajaxPromise) {
      this.ajaxPromise.abort();
    }

    this.ajaxPromise = syncTaskApi.list(
      {
        projectId,
        pageNo: pageIndex - 1,
        pageSize: 50,
        searchBody: _.trim(keyWords),
        sort: { fieldName: sortId, sortDirection: isAsc ? 'ASC' : 'DESC' },
        taskType: 1, //聚合表
        appId: appId ? appId : undefined,
        status: taskStatus ? taskStatus : undefined,
        type: 1, // 组织下聚合表数据（非应用下不包含数据源）
        createrIds: userInfo.map(v => v.accountId),
      },
      { isAggTable: true },
    );
    this.ajaxPromise.then(result => {
      if (result) {
        this.setState({
          list: result.content,
          count: result.totalElements,
          loading: false,
        });
      }
    });
  };

  // 获取工作表用量信息
  getAggregationTableUsage = () => {
    const { projectId } = this.props.match.params || {};
    projectAjax
      .getProjectLicenseSupportInfo({
        projectId,
        onlyUsage: true,
      })
      .then(({ limitAggregationTableCount = 20, effectiveAggregationTableCount = 0 }) => {
        this.setState({ limitAggregationTableCount, effectiveAggregationTableCount });
      });
  };

  getAppList() {
    const { appList } = this.state;
    const { projectId } = this.props.match.params || {};
    const { appPageIndex = 1, isMoreApp, loadingApp, keyword = '' } = this.state;
    // 加载更多
    if (appPageIndex > 1 && ((loadingApp && isMoreApp) || !isMoreApp)) {
      return;
    }
    this.setState({ loadingApp: true });

    appManagementAjax
      .getAppsForProject({
        projectId,
        status: '',
        order: 3,
        pageIndex: appPageIndex,
        pageSize: 50,
        keyword: keyword.trim(),
      })
      .then(({ apps }) => {
        const newAppList = apps.map(item => {
          return {
            label: item.appName,
            value: item.appId,
          };
        });
        this.setState({
          appList: appPageIndex === 1 ? [].concat(newAppList) : appList.concat(newAppList),
          isMoreApp: newAppList.length >= 50,
          loadingApp: false,
          appPageIndex: appPageIndex + 1,
        });
      })
      .catch(() => {
        this.setState({ loadingApp: false });
      });
  }

  searchDataList = _.throttle(() => {
    this.getList();
  }, 200);

  changeTask = item => {
    const { projectId } = this.props.match.params || {};
    const { list = [], taskStatus } = this.state;

    if (this.changeTaskAjax) {
      this.changeTaskAjax.abort();
    }

    if (item.taskStatus === TASK_STATUS_TYPE.RUNNING) {
      this.changeTaskAjax = syncTaskApi.stopTask({ projectId, taskId: item.id }, { isAggTable: true });
    } else {
      this.changeTaskAjax = syncTaskApi.startTask({ projectId, taskId: item.id }, { isAggTable: true });
    }
    this.changeTaskAjax.then(res => {
      let isSucceeded = item.taskStatus === TASK_STATUS_TYPE.RUNNING ? res : (res || {}).isSucceeded;
      const { errorMsg, errorMsgList } = res || {};
      if (isSucceeded) {
        this.setState({
          list: list
            .map(o => {
              if (item.id === o.id) {
                return {
                  ...item,
                  taskStatus:
                    item.taskStatus !== TASK_STATUS_TYPE.RUNNING ? TASK_STATUS_TYPE.RUNNING : TASK_STATUS_TYPE.STOP,
                  aggTableTaskStatus: item.taskStatus !== TASK_STATUS_TYPE.RUNNING ? 1 : item.aggTableTaskStatus,
                };
              } else {
                return o;
              }
            })
            .filter(v =>
              taskStatus === 'CLOSED'
                ? v.taskStatus !== TASK_STATUS_TYPE.RUNNING
                : taskStatus === 'RUNNING'
                  ? v.taskStatus === taskStatus
                  : true,
            ),
        });
      } else {
        alert(errorMsg ? errorMsg : errorMsgList ? errorMsgList[0] : _l('失败，请稍后再试'), 2);
      }
    });
  };

  render() {
    const { match = {} } = this.props;
    const { projectId } = match.params || {};
    const {
      keyWords,
      appList,
      appId,
      sortId,
      isAsc,
      loading,
      pageIndex,
      list = [],
      count,
      taskStatus,
      limitAggregationTableCount = 0,
      effectiveAggregationTableCount = 0,
      isMoreApp,
      userInfo,
    } = this.state;
    let featureType = getFeatureStatus(projectId, VersionProductType.aggregation);

    return (
      <div className="orgManagementWrap aggregationTableWrap">
        <AdminTitle prefix={_l('聚合表')} />
        <div className="orgManagementHeader">{_l('聚合表')}</div>
        <div className="orgManagementContent flexColumn">
          {!md.global.Config.IsLocal && (
            <div className="appManagementCount">
              {featureType === '2' ? (
                <Fragment>
                  <span>{_l('升级版本后可在应用中创建聚合表')}</span>
                  <a
                    href="javascript:void(0);"
                    className="ThemeColor3 ThemeHoverColor2 mLeft8 NoUnderline"
                    onClick={() => buriedUpgradeVersionDialog(projectId, VersionProductType.aggregation)}
                  >
                    {_l('升级版本')}
                  </a>
                </Fragment>
              ) : (
                <Fragment>
                  <span className="Gray_9e mRight5">{_l('已启用聚合表个数')}</span>
                  <span className="bold">
                    {_l('%0 / %1 个', effectiveAggregationTableCount, limitAggregationTableCount)}
                  </span>
                  <span className="Gray_9e mLeft15 mRight5">{_l('剩余')}</span>
                  <span className="bold">
                    {_l('%0个', limitAggregationTableCount - effectiveAggregationTableCount)}
                  </span>
                  {!md.global.Config.IsLocal && (
                    <PurchaseExpandPack
                      className="ThemeHoverColor2 mLeft5"
                      text={_l('扩充')}
                      type="aggregationtable"
                      routePath="expansionserviceAggregationtable"
                      projectId={projectId}
                    />
                  )}
                </Fragment>
              )}
            </div>
          )}
          <div className="flexRow">
            <Select
              className="w180 mdAntSelect"
              showSearch
              defaultValue={appId}
              options={appList}
              onFocus={() => appList.length === 1 && this.getAppList()}
              filterOption={(inputValue, option) =>
                appList
                  .find(item => item.value === option.value)
                  .label.toLowerCase()
                  .indexOf(inputValue.toLowerCase()) > -1
              }
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
              onSearch={_.debounce(val => this.setState({ keyword: val, appPageIndex: 1 }, this.getAppList), 500)}
              onChange={value => this.setState({ appId: value, pageIndex: 1 }, this.searchDataList)}
              onPopupScroll={e => {
                e.persist();
                const { scrollTop, offsetHeight, scrollHeight } = e.target;
                if (scrollTop + offsetHeight === scrollHeight) {
                  if (isMoreApp) {
                    this.getAppList();
                  }
                }
              }}
            />

            <Select
              className="w180 mdAntSelect mLeft16"
              defaultValue={taskStatus}
              options={[
                { label: _l('全部状态'), value: '' },
                { label: _l('开启'), value: 'RUNNING' },
                { label: _l('关闭'), value: 'CLOSED' },
              ]}
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              onChange={value => this.setState({ taskStatus: value, pageIndex: 1 }, this.searchDataList)}
            />
            <SelectUser
              className="mdAntSelect w180 mLeft15 "
              placeholder={_l('搜索创建人')}
              projectId={projectId}
              userInfo={userInfo}
              changeData={data => this.setState({ userInfo: data }, this.searchDataList)}
            />
            <div className="flex" />
            <Search
              placeholder={_l('聚合表名称')}
              handleChange={keyWords => {
                this.setState({ keyWords, list: [], pageIndex: 1 }, this.searchDataList);
              }}
            />
          </div>
          <div className="flexRow listHeader bold mTop16">
            <div className="flex pLeft10">{_l('聚合表名称')}</div>
            <div className="columnWidth status">{_l('状态')}</div>
            <div className="columnWidth flexRow">
              <div
                className="pointer ThemeHoverColor3 pRight12"
                onClick={() =>
                  this.setState(
                    { isAsc: sortId === 'createDate' ? !isAsc : false, sortId: 'createDate', pageIndex: 1 },
                    this.searchDataList,
                  )
                }
              >
                {_l('创建时间')}
              </div>
              <div
                className="flexColumn manageListOrder pointer"
                onClick={() =>
                  this.setState(
                    { isAsc: sortId === 'createDate' ? !isAsc : false, sortId: 'createDate', pageIndex: 1 },
                    this.searchDataList,
                  )
                }
              >
                <Icon icon="arrow-up" className={cx({ ThemeColor3: isAsc && sortId === 'createDate' })} />
                <Icon icon="arrow-down" className={cx({ ThemeColor3: !isAsc && sortId === 'createDate' })} />
              </div>
            </div>
            <div className="w140">{_l('创建人')}</div>
          </div>
          <div className="flex overflowHidden">
            {loading && pageIndex === 1 ? (
              <LoadDiv className="mTop15" />
            ) : _.isEmpty(list) ? (
              <TableEmpty
                className="pTop0 h100"
                detail={{ icon: 'icon-aggregate_table', desc: keyWords ? _l('暂无搜索结果') : _l('暂无聚合表') }}
              />
            ) : (
              <ScrollView className="w100 h100">
                {list.map(item => {
                  const {
                    name,
                    appName,
                    taskStatus,
                    createDate,
                    creatorName,
                    creatorAvatar,
                    createBy,
                    aggTableTaskStatus,
                    errorInfo,
                    worksheetId,
                  } = item;

                  return (
                    <div className="flexRow alignItemsCenter listContent">
                      <div
                        className={cx('flex flexRow pLeft10 ', {
                          'Hand ThemeHoverColor3': aggTableTaskStatus !== 0 && !!worksheetId,
                        })}
                        onClick={() => {
                          if (aggTableTaskStatus === 0) {
                            return;
                          }
                          window.open(`/aggregation/${worksheetId || ''}`);
                        }}
                      >
                        <div
                          className="iconWrap"
                          style={{
                            backgroundColor: item.taskStatus !== TASK_STATUS_TYPE.RUNNING ? '#bdbdbd' : '#0096EF',
                          }}
                        >
                          <Icon icon="aggregate_table" className="Font24 White" />
                        </div>
                        <div className="flex flexColumn name mLeft10 mRight40 ellipsis">
                          <div className="ellipsis Font14" title={name}>
                            {name}
                          </div>
                          <div className="ellipsis Font12 Gray_bd" title={appName}>
                            {appName}
                          </div>
                        </div>
                      </div>
                      <div className="columnWidth status">
                        <Switch
                          className="TxtMiddle tableSwitch mRight10"
                          checked={taskStatus === TASK_STATUS_TYPE.RUNNING}
                          text={taskStatus === TASK_STATUS_TYPE.RUNNING ? _l('开启') : _l('关闭')}
                          onClick={() => {
                            if (
                              limitAggregationTableCount &&
                              effectiveAggregationTableCount > limitAggregationTableCount
                            ) {
                              upgradeVersionDialog({
                                projectId: projectId,
                                featureId: VersionProductType.aggregation,
                                explainText: _l('已达到使用上限，请考虑购买增补包或升级版本'),
                                okText: _l('立即购买'),
                                onOk: () =>
                                  navigateTo(`/admin/expansionserviceAggregationtable/${projectId}/aggregationtable`),
                              });
                              return;
                            }

                            this.changeTask(item);
                          }}
                        />
                        {aggTableTaskStatus === 0 && <span className="Gray_75">{_l('未发布')}</span>}
                        {taskStatus !== TASK_STATUS_TYPE.RUNNING && errorInfo && (
                          <Tooltip
                            placement="bottomRight"
                            align={{ offset: [12, 0] }}
                            title={<span className="InlineBlock WordBreak">{errorInfo}</span>}
                          >
                            <Icon type={'error'} className="Red Font16 TxtMiddle InlineBlock" />
                          </Tooltip>
                        )}
                      </div>
                      <div className="columnWidth">{moment(createDate).format('YYYY-MM-DD')}</div>
                      <div className="w140 flexRow alignItemsCenter">
                        <UserHead
                          projectId={projectId}
                          size={28}
                          user={{ userHead: creatorAvatar, accountId: createBy }}
                        />
                        <div className="mLeft12 ellipsis flex mRight20">{creatorName}</div>
                      </div>
                    </div>
                  );
                })}
              </ScrollView>
            )}
          </div>
          {!_.isEmpty(list) && (
            <PaginationWrap
              total={count}
              pageIndex={pageIndex}
              pageSize={50}
              onChange={pageIndex => this.setState({ pageIndex }, this.getList)}
            />
          )}
        </div>
      </div>
    );
  }
}
