import React, { Component, Fragment } from 'react';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import './index.less';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import processVersion from '../api/processVersion';
import flowNode from '../api/flowNode';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { Icon, ScrollView, LoadDiv, Dialog, Switch, Tooltip } from 'ming-ui';
import MsgTemplate from './components/MsgTemplate';
import Search from '../components/Search';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import PublishBtn from './components/PublishBtn';
import { START_APP_TYPE } from './config/index';
import appManagement from 'src/api/appManagement';
import projectSetting from 'src/api/projectSetting';
import { Select } from 'antd';
import WorkflowMonitor from './components/WorkflowMonitor';

const tablist = [{ tab: 'workflowList', tabName: _l('工作流') }, { tab: 'monitorTab', tabName: _l('监控') }];

const typeList = [
  { label: _l('全部类型'), value: '' },
  { label: _l('工作表事件'), value: 1 },
  { label: _l('时间'), value: 2 },
  { label: _l('人员事件'), value: 9 },
  { label: _l('Webhook'), value: 6 },
  { label: _l('子流程'), value: 8 },
  { label: _l('自定义动作'), value: 7 },
  { label: _l('审批流程'), value: 11 },
  { label: _l('封装业务流程'), value: 10 },
];

@errorBoundary
export default class AdminWorkflowList extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({
      list: null,
      useCount: '',
      count: 0,
      appList: [{ label: _l('全部应用'), value: '' }],

      apkId: '',
      enabled: 0,
      processListType: '',
      isAsc: false,
      keyWords: '',
      pageIndex: 1,
      sortId: 'createdDate',

      msgVisible: false,
      isMore: true,
      loading: false,
      checkAdmin: {
        appId: '',
        post: false,
        visible: false,
        title: '',
        workflowId: '',
      },
      balance: 0,
      autoPurchaseWorkflowExtPack: false,
      autoOrderVisible: false,

      activeTab: localStorage.getItem('workflowTab') ? localStorage.getItem('workflowTab') : 'workflowList',
    });
  }

  postList = null;

  componentDidMount() {
    const { projectId } = this.props.match.params;

    this.getList(projectId);
    this.getWorkflowCount(projectId);
    this.getAutoOrderStatus(projectId);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(nextProps, this.props)) {
      this.setState(
        Object.assign({
          list: null,
          appList: [{ label: _l('全部应用'), value: '' }],
          apkId: '',
          enabled: 0,
          processListType: '',
          isAsc: false,
          keyWords: '',
          pageIndex: 1,
          sortId: 'createdDate',
          isMore: true,
          loading: false,
        }),
      );

      const { projectId } = nextProps.match.params;
      this.getList(projectId);
      this.getWorkflowCount(projectId);
    }
  }

  componentWillUnmount() {
    localStorage.removeItem('workflowTab');
  }

  /**
   * 获取list
   */
  getList(projectId) {
    const { list, apkId, enabled, processListType, isAsc, keyWords, pageIndex, sortId, loading, isMore } = this.state;

    // 加载更多
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }

    this.setState({ loading: true });

    if (this.postList) {
      this.postList.abort();
    }

    this.postList = processVersion.getProcessByCompanyId({
      companyId: projectId,
      apkId,
      enabled,
      processListType,
      isAsc,
      keyWords,
      pageIndex,
      pageSize: 30,
      sortId,
    });

    this.postList.then(result => {
      this.setState({
        list: pageIndex === 1 ? result.processes : list.concat(result.processes),
        count: result.count,
        pageIndex: pageIndex + 1,
        loading: false,
        isMore: result.processes.length === 30,
      });
    });
  }

  /**
   * 获取工作流数量
   */
  getWorkflowCount(projectId) {
    processVersion.getProcessUseCount({ companyId: projectId }).then(result => {
      this.setState({ useCount: result });
    });
  }

  /**
   * 获得应用列表
   */
  getAppList(projectId) {
    const { appList } = this.state;

    appManagement
      .getAppsForProject({
        projectId,
        status: '',
        order: 3,
        pageIndex: 1,
        pageSize: 100000,
        keyword: '',
      })
      .then(({ apps }) => {
        const newAppList = apps.map(item => {
          return {
            label: item.appName,
            value: item.appId,
          };
        });
        this.setState({ appList: appList.concat(newAppList) });
      });
  }
  /**
   * 获取自动订购
   */
  getAutoOrderStatus(projectId) {
    projectSetting.getAutoPurchaseWorkflowExtPack({ projectId }).then(res => {
      this.setState({
        autoPurchaseWorkflowExtPack: res.autoPurchaseWorkflowExtPack,
        balance: res.balance,
      });
    });
  }
  /**
   * 设置自动订购
   */
  setAutoOrderStatus() {
    const { projectId } = this.props.match.params;
    projectSetting
      .setAutoPurchaseWorkflowExtPack({
        projectId,
        autoPurchaseWorkflowExtPack: !this.state.autoPurchaseWorkflowExtPack,
      })
      .then(res => {
        if (res) {
          this.setState(
            {
              autoPurchaseWorkflowExtPack: !this.state.autoPurchaseWorkflowExtPack,
              autoOrderVisible: false,
            },
            () => {
              if (this.state.autoPurchaseWorkflowExtPack && this.state.balance < 100) {
                alert('当前账户余额不足100元，该功能可能无法正常运行');
              }
            },
          );
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  }
  /**
   * 渲染列表
   */
  renderList() {
    const { list, pageIndex, loading } = this.state;

    if (list === null) return;

    if (!list.length) {
      return (
        <div className="manageListNull flex flexColumn">
          <div className="iconWrap">
            <Icon icon="workflow" />
          </div>
          <div className="emptyExplain">{_l('暂无工作流')}</div>
        </div>
      );
    }

    return (
      <ScrollView className="flex" onScrollEnd={this.searchDataList}>
        {list.map(item => this.renderListItem(item))}
        {loading && pageIndex > 1 && <LoadDiv className="mTop15" size="small" />}
      </ScrollView>
    );
  }

  /**
   * 渲染单个列表项
   */
  renderListItem(item) {
    const { list, loading } = this.state;

    return (
      <div className="flexRow manageList" key={item.id}>
        <div
          className={cx('iconWrap mLeft10', { unable: !item.enabled })}
          style={{ backgroundColor: (START_APP_TYPE[item.child ? 'subprocess' : item.startAppType] || {}).iconColor }}
        >
          <Icon icon={(START_APP_TYPE[item.child ? 'subprocess' : item.startAppType] || {}).iconName} />
        </div>
        <div className="flex name mLeft10 mRight40">
          <div
            className={cx('flexColumn nameBox ThemeColor3 pointer', { unable: !item.enabled })}
            onClick={() => this.checkIsAppAdmin(item.apkId, item.id, item.processName)}
          >
            <div className="ellipsis Font14">{item.processName}</div>
            <div className="ellipsis Font12 Gray_bd">{item.apkName}</div>
          </div>
        </div>
        <div className="columnWidth">{loading ? '-' : item.count.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')}</div>
        <div className="columnWidth">
          <PublishBtn
            disabled={item.startAppType === 9}
            list={list}
            item={item}
            updateSource={list => this.setState({ list })}
          />
        </div>
        <div className="columnWidth Gray_9e">
          {(START_APP_TYPE[item.child ? 'subprocess' : item.startAppType] || {}).text}
        </div>
        <div className="columnWidth Gray_9e">{moment(item.createdDate).format('YYYY-MM-DD')}</div>
        <div className="columnWidth Gray_75 flexRow">
          <UserHead size={28} user={{ userHead: item.createdBy.avatar, accountId: item.createdBy.accountId }} />
          <div className="mLeft12 ellipsis flex mRight20">{item.createdBy.fullName}</div>
        </div>
        <Link to={`/workflowedit/${item.id}/2`} className="w20 mRight20 TxtCenter">
          <span data-tip={_l('历史')}>
            <Icon icon="restore2" className="listBtn ThemeHoverColor3 Gray_9e" />
          </span>
        </Link>
      </div>
    );
  }

  /**
   * 检测是否是应用管理员
   */
  checkIsAppAdmin(appId, id, name) {
    const opts = post => {
      return {
        appId,
        post,
        visible: true,
        title: name,
        workflowId: id,
      };
    };
    this.setState({ checkAdmin: opts(true) }, () => {
      appManagement
        .checkAppAdminForUser({
          appId,
        })
        .then(result => {
          if (result) {
            navigateTo(`/workflowedit/${id}`);
          } else {
            this.setState({ checkAdmin: opts(false) });
          }
        });
    });
  }

  /**
   * 设为应用管理员
   */
  addRoleMemberForAppAdmin = () => {
    const {
      checkAdmin: { appId, workflowId },
    } = this.state;

    appManagement
      .addRoleMemberForAppAdmin({
        appId,
      })
      .then(result => {
        if (result) {
          navigateTo(`/workflowedit/${workflowId}`);
        }
      });
  };

  /**
   * 更新状态
   */
  updateState = obj => {
    this.setState({ list: null, pageIndex: 1, ...obj }, this.searchDataList);
  };

  /**
   * 搜索数据
   */
  searchDataList = _.throttle(() => {
    const { projectId } = this.props.match.params;
    this.getList(projectId);
  }, 200);

  changeTab = tab => {
    safeLocalStorageSetItem('workflowTab', tab);
    this.setState({ activeTab: tab });
  };

  refresh = () => {
    const { projectId } = this.props.match.params;
    const { apkId, enabled, processListType, isAsc, keyWords, pageIndex, sortId, activeTab } = this.state;
    if (activeTab !== 'workflowList') {
      this.setState({ dateNow: Date.now() });
    } else {
      this.setState({ loading: true });
      processVersion
        .init({
          companyId: projectId,
          keyword: keyWords,
          pageIndex,
          pageSize: 30,
        })
        .then(res => {
          if (res) {
            processVersion
              .getProcessByCompanyId({
                companyId: projectId,
                apkId,
                enabled,
                processListType,
                isAsc,
                keyWords,
                pageIndex: 1,
                pageSize: 30,
                sortId,
              })
              .then(res => {
                this.setState({
                  list: res.processes,
                  count: res.count,
                  loading: false,
                });
              });
          } else {
            this.setState({ loading: false });
          }
        });
    }
  };

  render() {
    const { params } = this.props.match;
    const {
      loading,
      pageIndex,
      enabled,
      processListType,
      msgVisible,
      count,
      useCount,
      checkAdmin,
      appList,
      apkId,
      sortId,
      isAsc,
      autoOrderVisible,
      autoPurchaseWorkflowExtPack,
      activeTab,
    } = this.state;
    const { limitExecCount, useExecCount, quantity } = useCount;
    const enabledList = [
      { label: _l('全部状态'), value: 0 },
      { label: _l('开启'), value: 1 },
      { label: _l('关闭'), value: 2 },
    ];
    const licenseType = md.global.Account.projects.find(o => o.projectId === params.projectId).licenseType;
    return (
      <div className="adminWorkflowList flex flexColumn">
        <div className="wokflowInfoHeader flexRow">
          <div className="tabBox flexRow">
            {tablist.map(item => (
              <div
                key={item.tab}
                className={cx('tabItem', { active: item.tab === activeTab })}
                onClick={() => this.changeTab(item.tab)}
              >
                {item.tabName}
                {item.tab === 'workflowList' && count ? `（${count}）` : ''}
              </div>
            ))}
          </div>
          <div className="pre">
            <div
              className={cx('refresh Hand Font20', { mRight24: activeTab === 'workflowList' })}
              onClick={this.refresh}
            >
              <Icon icon="task-later" />
            </div>

            {activeTab === 'workflowList' && (
              <div className="pointer ThemeHoverColor3 Gray_9e" onClick={() => this.setState({ msgVisible: true })}>
                <Icon icon="workflow_sms" />
                <span className="mLeft5">{_l('短信模版')}</span>
              </div>
            )}
          </div>
        </div>
        {activeTab === 'workflowList' ? (
          <Fragment>
            <AdminTitle prefix={_l('工作流')} />
            <div className="adminWorkflowCount flexRow">
              {useCount ? (
                <Fragment>
                  <span className="Gray_9e mRight5">{_l('本月执行数')}</span>
                  <span className="bold mRight5">{`${useExecCount
                    .toString()
                    .replace(/(\d)(?=(\d{3})+$)/g, '$1,')} / ${limitExecCount
                    .toString()
                    .replace(/(\d)(?=(\d{3})+$)/g, '$1,')}`}</span>

                  {!!(quantity.quantityLicense || quantity.quantityMonthly) && (
                    <span className="Gray_75">
                      （{_l('包含')}
                      {!!quantity.quantityLicense &&
                        _l(' %0 月额度', quantity.quantityLicense.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,'))}
                      {!!quantity.quantityLicense && !!quantity.quantityMonthly && <span>，</span>}
                      {!!quantity.quantityMonthly &&
                        _l(' %0 本月额度', quantity.quantityMonthly.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,'))}
                      ）
                    </span>
                  )}

                  <span className="Gray_9e mLeft15 mRight5">{_l('剩余')}</span>

                  <span
                    className="bold"
                    style={{ color: (limitExecCount - useExecCount) / limitExecCount > 0.1 ? '#333' : '#f44336' }}
                  >
                    {(((limitExecCount - useExecCount) / limitExecCount) * 100 || 0).toFixed(2)}%
                  </span>

                  {/* {licenseType === 1 ? (
                    <Link
                      className="ThemeColor3 ThemeHoverColor2 mLeft20 NoUnderline"
                      to={`/admin/expansionservice/${params.projectId}/workflow`}
                    >
                      {_l('购买升级包')}
                    </Link>
                  ) : (
                    <Link
                      className="ThemeColor3 ThemeHoverColor2 mLeft20 NoUnderline"
                      to={`/upgrade/choose?projectId=${params.projectId}`}
                    >
                      {_l('购买付费版')}
                    </Link>
                  )} */}
                </Fragment>
              ) : (
                _l('加载中...')
              )}
              {!md.global.Config.IsLocal && !_.includes([0, 2], licenseType) && (
                <div className="workflowAutoOrder">
                  <Switch
                    checked={autoPurchaseWorkflowExtPack}
                    onClick={() => this.setState({ autoOrderVisible: true })}
                  />
                  <Tooltip
                    popupPlacement="bottom"
                    text={<span>{_l('本月剩余执行额度到达2%时，自动购买100元/1万次的单月包，从账户余额中扣款')}</span>}
                  >
                    <span className="Gray_9e Hand">{_l('自动订购')}</span>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="manageListSearch flexRow">
              <Select
                className="w180 manageListSelect"
                showSearch
                defaultValue={apkId}
                options={appList}
                onFocus={() => appList.length === 1 && this.getAppList(params.projectId)}
                filterOption={(inputValue, option) =>
                  appList
                    .find(item => item.value === option.value)
                    .label.toLowerCase()
                    .indexOf(inputValue.toLowerCase()) > -1
                }
                suffixIcon={<Icon icon="arrow-down-border Font14" />}
                notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
                onChange={value => this.updateState({ apkId: value })}
              />
              <Select
                className="w180 manageListSelect mLeft15"
                defaultValue={enabled}
                options={enabledList}
                suffixIcon={<Icon icon="arrow-down-border Font14" />}
                onChange={value => this.updateState({ enabled: value })}
              />
              <Select
                className="w180 manageListSelect mLeft15"
                defaultValue={processListType}
                options={typeList}
                suffixIcon={<Icon icon="arrow-down-border Font14" />}
                onChange={value => this.updateState({ processListType: value })}
              />

              <div className="flex" />
              <Search
                placeholder={_l('流程名称 / 创建者')}
                handleChange={keyWords => this.updateState({ keyWords: keyWords.trim() })}
              />
            </div>
            <div className="flexRow manageList manageListHeader bold mTop16">
              <div className="flex mLeft10">{_l('流程名称')}</div>
              <div className="columnWidth flexRow">
                <div
                  className="pointer ThemeHoverColor3 pRight12"
                  style={{ zIndex: 1 }}
                  onClick={() => this.updateState({ isAsc: sortId === 'count' ? !isAsc : false, sortId: 'count' })}
                >
                  {_l('本月执行数')}
                </div>
                <div className="flexColumn manageListOrder">
                  <Icon icon="arrow-up" className={cx({ ThemeColor3: isAsc && sortId === 'count' })} />
                  <Icon icon="arrow-down" className={cx({ ThemeColor3: !isAsc && sortId === 'count' })} />
                </div>
              </div>
              <div className="columnWidth">{_l('状态')}</div>
              <div className="columnWidth">{_l('类型')}</div>
              <div className="columnWidth flexRow">
                <div
                  className="pointer ThemeHoverColor3 pRight12"
                  style={{ zIndex: 1 }}
                  onClick={() =>
                    this.updateState({ isAsc: sortId === 'createdDate' ? !isAsc : false, sortId: 'createdDate' })
                  }
                >
                  {_l('创建时间')}
                </div>
                <div className="flexColumn manageListOrder">
                  <Icon icon="arrow-up" className={cx({ ThemeColor3: isAsc && sortId === 'createdDate' })} />
                  <Icon icon="arrow-down" className={cx({ ThemeColor3: !isAsc && sortId === 'createdDate' })} />
                </div>
              </div>
              <div className="columnWidth">{_l('创建者')}</div>
              <div className="w20 mRight20" />
            </div>
            {loading && pageIndex === 1 && <LoadDiv className="mTop15" />}
            <div className="flex flexColumn mTop16">{this.renderList()}</div>
          </Fragment>
        ) : (
          <Fragment>
            <AdminTitle prefix={_l('工作流')} />
            <WorkflowMonitor match={this.props.match} dateNow={this.state.dateNow} />
          </Fragment>
        )}

        {msgVisible && (
          <MsgTemplate
            companyId={params.projectId}
            api={flowNode.getAllSMSTemplateList}
            deleteSMSTemplate={flowNode.deleteSMSTemplate}
            closeLayer={() => this.setState({ msgVisible: false })}
          />
        )}

        <Dialog
          visible={checkAdmin.visible}
          className={cx({ checkAdminDialog: checkAdmin.post })}
          title={_l('管理工作流“%0”', checkAdmin.title)}
          description={_l('如果你不是工作流所在应用的管理员，需要将自己加为管理员以获得权限')}
          cancelText=""
          okText={checkAdmin.post ? _l('验证权限...') : _l('加为应用管理员')}
          onOk={checkAdmin.post ? () => {} : this.addRoleMemberForAppAdmin}
          onCancel={() => this.setState({ checkAdmin: Object.assign({}, this.state.checkAdmin, { visible: false }) })}
        />

        <Dialog
          visible={autoOrderVisible}
          className="publishErrorDialog"
          buttonType={autoPurchaseWorkflowExtPack ? 'danger' : 'primary'}
          title={autoPurchaseWorkflowExtPack ? _l('确认关闭自动订购？') : _l('是否开启自动订购？')}
          description={
            autoPurchaseWorkflowExtPack ? (
              ''
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: _l(
                    '开启后，当月剩余执行额度为2%时，自动购买 %0 100元/1万次 %1 的单月包，从账户余额中扣款',
                    '<span class="Bold Gray">',
                    '</span>',
                  ),
                }}
              />
            )
          }
          okText={autoPurchaseWorkflowExtPack ? _l('关闭') : _l('确定')}
          onOk={() => this.setAutoOrderStatus()}
          onCancel={() => this.setState({ autoOrderVisible: false })}
        />
      </div>
    );
  }
}
