import React, { Component, Fragment } from 'react';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import './index.less';
import {
  LoadDiv,
  Dropdown,
  Switch,
  Icon,
  ScrollView,
  DeleteReconfirm,
  Dialog,
  SvgIcon,
  Tooltip,
  UserHead,
  UpgradeIcon,
  MdLink,
} from 'ming-ui';
import cx from 'classnames';
import AppTrash from 'src/pages/worksheet/common/Trash/AppTrash';
import Search from 'src/pages/workflow/components/Search';
import ajaxRequest from 'src/api/appManagement';
import homeAppAjax from 'src/api/homeApp';
import { dialogSelectUser, checkIsAppAdmin } from 'ming-ui/functions';
import Trigger from 'rc-trigger';
import { createRoot } from 'react-dom/client';
import ExportApp from './modules/ExportApp';
import SelectApp from './modules/SelectApp';
import AppLog from './modules/AppLog';
import { Drawer, Select } from 'antd';
import EventEmitter from 'events';
import { getFeatureStatus, buriedUpgradeVersionDialog, addBehaviorLog, getCurrentProject } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import SelectUser from '../../components/SelectUser';
import _ from 'lodash';
import moment from 'moment';
import { transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import { decryptFunc } from './modules/Dectypt';
import projectAjax from 'src/api/project';
import qs from 'query-string';
import SelectDBInstance from 'src/pages/AppHomepage/AppCenter/components/SelectDBInstance';
import UpgradeProcess from 'src/pages/AppSettings/components/ImportUpgrade/components/UpgradeProcess';

export const emitter = new EventEmitter();

const optionData = [
  {
    label: _l('导出应用'),
    icon: 'cloud_download',
    action: 'handleExportAll',
    hasBeta: true,
    featureId: VersionProductType.appImportExport,
  },
  {
    label: _l('导入应用'),
    icon: 'unarchive',
    action: 'handleUpdateAll',
    hasBeta: true,
    featureId: VersionProductType.appBackupRestore,
  },
  { label: _l('日志'), icon: 'assignment', action: 'handleLog', hasBeta: false },
  {
    label: _l('应用回收站'),
    icon: 'knowledge-recycle',
    action: 'openAppTrash',
    hasBeta: false,
    featureId: VersionProductType.recycle,
  },
  {
    label: _l('获取文件密码'),
    icon: 'key1',
    action: 'openDecryptUpload',
    hasBeta: false,
  },
];

const dialogHeader = {
  selectAppVisible: _l('选择要导出的应用'),
  singleAppVisible: _l('导出应用'),
  uploadVisible: _l('导入应用'),
};

const DataDBInstances = [
  { label: _l('全部数据库'), value: 'all', status: 1 },
  { label: _l('系统默认数据库'), value: '', status: 1 },
];

export default class AppManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hiddenIds: [],

      list: null,
      total: 0,
      count: 0,
      maxCount: 0,

      status: '',
      order: 3,
      pageIndex: 1,
      keyword: '',
      userInfo: [],

      loading: false,

      moreVisible: false,
      rowVisible: null,
      drawerVisible: false,
      updateVisible: false,

      //单个导出弹层ids
      exportIds: [],
      hasDataBase: false,
      dbInstanceId: 'all',
      dataDBInstances: DataDBInstances,
      requested: false,
    };
    //推送完刷新列表
    emitter.addListener('updateState', this.updateState);
  }

  postList = null;

  componentDidMount() {
    const { projectId } = this.props.match.params;
    const queryString = this.props.location.search && this.props.location.search.slice(1);
    const query = qs.parse(queryString);
    let _hasDataBase =
      getFeatureStatus(projectId, VersionProductType.dataBase) === '1' && !md.global.Config.IsPlatformLocal;

    this.setState(
      {
        hasDataBase: _hasDataBase,
        dbInstanceId: query.dbInstanceId || 'all',
      },
      () => {
        this.getAppList();
      },
    );

    this.checkExportOrImportAuth(projectId);
    if (query.dbInstanceId && _hasDataBase) {
      this.getDBInstances();
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(nextProps, this.props)) {
      this.setState({
        list: null,
        status: '',
        order: 3,
        pageIndex: 1,
        keyword: '',
        loading: false,
        isFree: false,
      });

      const { projectId } = nextProps.match.params;
      this.getAppList();
      this.checkExportOrImportAuth(projectId);
    }
  }

  async getDBInstances(importApp) {
    const { requested, dataDBInstances } = this.state;
    const { projectId } = this.props.match.params;
    let res = dataDBInstances;
    if (!requested) {
      res = await projectAjax.getDBInstances({ projectId });
      let list = res.map(l => {
        return {
          label: l.name,
          value: l.id,
          status: l.status,
        };
      });
      this.setState({
        dataDBInstances: DataDBInstances.concat(list),
        requested: true,
      });
    }

    if (importApp && res && res.length > 1) {
      this.setState({ DBInstancesDialog: true });
      return true;
    }
  }

  /**
   * 标准版不能导入导出
   */
  checkExportOrImportAuth(projectId) {
    const { licenseType } = getCurrentProject(projectId, true);
    this.setState({ isFree: licenseType === 0 });
  }

  /**
   * 获取应用列表
   */
  getAppList() {
    const { status, order, pageIndex, keyword, dbInstanceId, userInfo = [] } = this.state;
    const { projectId } = this.props.match.params;

    this.setState({ loading: true });

    if (this.postList) {
      this.postList.abort();
    }

    this.postList = ajaxRequest.getAppsForProject({
      projectId,
      status,
      order,
      pageIndex,
      pageSize: 50,
      keyword: keyword.trim(),
      containsLink: true,
      dbInstanceId,
      filterDBType: dbInstanceId === 'all' ? 0 : dbInstanceId === '' ? 1 : 2,
      createrIds: userInfo.map(v => v.accountId),
    });
    this.postList.then(({ apps, maxCount, total, count }) => {
      this.setState({
        list: apps,
        maxCount,
        total,
        count,
        loading: false,
      });
    });
  }

  handleImportApp = dbInstanceId => {
    const { importAppParams } = this.state;
    const requestParam = { ...importAppParams, dbInstanceId };

    window.mdyAPI('', '', requestParam, {
      ajaxOptions: {
        url: `${md.global.Config.AppFileServer}AppFile/Import`,
      },
    });
  };

  /**
   * 渲染列表
   */
  renderList() {
    const { list, pageIndex, loading, hiddenIds } = this.state;

    if (list === null) return;

    if (!list.length) {
      return (
        <div className="manageListNull flex flexColumn">
          <div className="iconWrap">
            <Icon icon="widgets2" />
          </div>
          <div className="emptyExplain">{_l('暂无应用')}</div>
        </div>
      );
    }

    return (
      <ScrollView className="flex">
        {list.filter(item => !_.includes(hiddenIds, item.appId)).map(item => this.renderListItem(item))}
        {loading && <LoadDiv className="mTop15" size="small" />}
      </ScrollView>
    );
  }

  /**
   * 渲染单个列表项
   */
  renderListItem(item) {
    const { projectId } = this.props.match.params;
    const { list, hiddenIds, hasDataBase } = this.state;
    const featureType = getFeatureStatus(projectId, VersionProductType.appImportExport);
    return (
      <div className="flexRow manageList overflowHidden" key={item.appId}>
        <div className="flex flexRow appName">
          <div className={cx('iconWrap mLeft10', { unable: !item.status })} style={{ backgroundColor: item.iconColor }}>
            <SvgIcon url={item.iconUrl} fill="#fff" size={24} />
            {item.createType === 1 && (
              <div className="linkIcon">
                <Tooltip text={_l('外部链接')}>
                  <Icon icon="link1" />
                </Tooltip>
              </div>
            )}
          </div>
          <div className="flex name mLeft10 overflowHidden">
            <div
              className={cx('flexRow nameBox ThemeColor3', { unable: !item.status })}
              onClick={() => {
                if (item.createType === 1) {
                  window.open(transferExternalLinkUrl(item.urlTemplate, projectId, item.appId));
                  addBehaviorLog('app', item.appId); // 埋点
                } else {
                  checkIsAppAdmin({
                    appId: item.appId,
                    appName: item.appName,
                  });
                }
              }}
            >
              <div className="ellipsis Font14" title={item.appName}>
                {item.appName}
              </div>
              {item.sourceType === 60 && (
                <Tooltip text={_l('通过市场安装')}>
                  <Icon icon="merchant" className="Gray_bd mLeft20 Font16" />
                </Tooltip>
              )}
              {item.isLock && (
                <Tooltip text={_l('应用已锁定')}>
                  <Icon icon="lock" className="Gray_bd mLeft20 Font16" />
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        {hasDataBase && <div className="columnWidth dataBase">{item.dbInstance || _l('系统默认数据库')}</div>}
        <div className="columnWidth">
          {item.createType !== 1 ? item.sheetCount.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,') : '-'}
        </div>
        <div className="columnWidth">
          {item.createType !== 1 ? (
            <Switch
              checked={!!item.status}
              text={item.status ? _l('开启') : _l('关闭')}
              onClick={checked => this.editAppStatus(item.appId, checked ? 0 : 1)}
            />
          ) : (
            '-'
          )}
        </div>
        <div className="columnWidth Gray_9e">{moment(item.ctime).format('YYYY-MM-DD')}</div>
        <div className="columnWidth Gray_75 flexRow">
          <UserHead
            size={28}
            projectId={projectId}
            user={{ userHead: item.createAccountInfo.avatar, accountId: item.caid }}
            operation={this.renderChargeOpHtml(item)}
          />
          <div className="mLeft12 ellipsis flex mRight20">{item.createAccountInfo.fullName}</div>
        </div>
        <div className="w50 mRight20 TxtCenter flexRow">
          {getFeatureStatus(projectId, VersionProductType.analysis) && (
            <Tooltip text={<span>{_l('使用分析')}</span>}>
              <span
                className={cx('Gray_9e Hand Font18 icon-worksheet_column_chart Hover_49 mRight16 chartIcon', {
                  isShow: item.createType !== 1,
                })}
                onClick={() => {
                  if (getFeatureStatus(projectId, VersionProductType.analysis) === '2') {
                    buriedUpgradeVersionDialog(projectId, VersionProductType.analysis);
                    return;
                  }
                  window.open(`/app/${item.appId}/analytics/${projectId}`, '__blank');
                }}
              ></span>
            </Tooltip>
          )}
          <Trigger
            popupClassName="actionAppTrigger"
            popupVisible={this.state.rowVisible === item.appId}
            onPopupVisibleChange={() => this.handleChangeVisible('rowVisible', item.appId)}
            action={['click']}
            popup={() => {
              return (
                <ul className="optionPanelTrigger">
                  {!featureType ||
                  item.isLock ||
                  item.isGoods ||
                  !featureType ||
                  item.createType === 1 ||
                  item.sourceType === 60 ? null : (
                    <li
                      onClick={() => {
                        if (featureType === '2') {
                          this.setState({ rowVisible: false });
                          buriedUpgradeVersionDialog(projectId, VersionProductType.appImportExport);
                          return;
                        }
                        this.handleExport([item]);
                        this.handleChangeVisible('rowVisible', item.appId);
                      }}
                    >
                      <Icon icon={'cloud_download'} className="mRight12 Gray_9e" />
                      {_l('导出')}
                    </li>
                  )}
                  <li
                    className="deleteIcon"
                    onClick={() => {
                      DeleteReconfirm({
                        title: _l('你确定删除此应用吗？'),
                        description: _l('应用下所有数据将被删除，请确认所有应用成员都不再需要此应用后，再执行此操作'),
                        data: [{ text: _l('我确认执行此操作'), value: true }],
                        onOk: () => {
                          const oldTotal = this.state.total;
                          this.setState({
                            total: oldTotal - 1,
                            hiddenIds: _.uniq([...hiddenIds, item.appId]),
                          });
                          homeAppAjax
                            .deleteApp({
                              appId: item.appId,
                              projectId,
                              isHomePage: false,
                            })
                            .then(res => {
                              if (res.data) {
                                this.setState({
                                  hiddenIds: hiddenIds.filter(id => id !== item.appId),
                                });
                                this.updateState({});
                              } else {
                                return Promise.reject();
                              }
                            })
                            .catch(() => {
                              this.setState({
                                hiddenIds: hiddenIds.filter(id => id !== item.appId),
                                total: oldTotal,
                              });
                              alert(_l('操作失败，请稍候重试！'), 2);
                            });
                        },
                      });
                      this.handleChangeVisible('rowVisible', item.appId);
                    }}
                  >
                    <Icon icon={'hr_delete'} className="mRight12 Gray_9e" />
                    {_l('删除')}
                  </li>
                </ul>
              );
            }}
            popupAlign={{
              offset: [-100, -20],
              points: ['tl', 'bl'],
              overflow: { adjustX: true, adjustY: true },
            }}
          >
            <span className="Gray_9e Hand Font18 icon-moreop Hover_49"></span>
          </Trigger>
        </div>
      </div>
    );
  }

  /**
   * 列表操作项点击后关闭操作项弹框
   */
  handleChangeVisible(key, value) {
    this.setState({
      [key]: this.state[key] ? false : value,
    });
  }

  //关闭各类型dialog
  closeDialog(name) {
    $(`.${name}`).parents('.mui-dialog-container').parents('div').remove();
  }

  //dialog头部
  renderHeader(name) {
    return (
      <div className="flexRow mBottom4">
        <span className="Font17 overflow_ellipsis Bold">{dialogHeader[name]}</span>
      </div>
    );
  }

  /**
   * 应用导出设置(单个应用导出)
   */
  handleExport(list) {
    this.setState({
      exportIds: list.map(item => item.appId),
    });
  }

  // 应用回收站
  openAppTrash() {
    const { projectId } = this.props.match.params;
    const featureType = getFeatureStatus(projectId, VersionProductType.recycle);
    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.recycle);
    } else {
      this.setState({ appTrashVisible: true });
    }
  }

  openDecryptUpload = () => {
    const { projectId } = this.props.match.params;
    decryptFunc({ projectId });
  };

  /**
   * 日志
   */
  handleLog() {
    this.setState({
      drawerVisible: true,
    });
  }

  /**
   * 批量导出
   */
  handleExportAll() {
    const options = {
      title: this.renderHeader('selectAppVisible'),
      footer: null,
      visible: true,
      width: '720',
      className: 'importTotalAppDialog',
      overlayClosable: false,
      onCancel: () => this.closeDialog('importTotalAppDialog'),
    };
    const root = createRoot(document.createElement('div'));

    root.render(
      <Dialog {...options}>
        <SelectApp
          handleNext={list => {
            this.closeDialog('importTotalAppDialog');
            this.handleExport(list);
          }}
          closeDialog={() => this.closeDialog('importTotalAppDialog')}
        />
      </Dialog>,
    );
  }

  /**
   * 批量导入升级
   */
  handleUpdateAll() {
    this.setState({ updateVisible: true });
  }

  /**
   * 修改应用状态
   */
  editAppStatus(appId, status) {
    const { projectId } = this.props.match.params;
    let list = _.cloneDeep(this.state.list);
    const editAppStatusFun = () => {
      ajaxRequest.editAppStatus({ projectId, appId, status }).then(result => {
        if (result) {
          if (status !== 2) {
            list = list.map(o => {
              if (o.appId === appId) {
                o.status = status;
              }
              return o;
            });
          }

          this.setState({ list });
        } else {
          alert(_l('操作失败，请稍候重试！'), 2);
        }
      });
    };

    // 关闭
    if (status === 0) {
      Dialog.confirm({
        title: _l('你确定关闭此应用吗？'),
        description: _l('关闭应用后，所有人将无法再继续使用和查看此应用，应用下的工作流将全部关闭。'),
        onOk: editAppStatusFun,
        okText: _l('关闭'),
      });
    } else if (status === 1) {
      // 开启
      Dialog.confirm({
        title: _l('你确定开启此应用吗？'),
        description: _l('重新开启应用后，你需要在应用中手动开启需要运行的工作流'),
        onOk: editAppStatusFun,
        okText: _l('开启'),
      });
    }
  }

  /**
   * 负责人 opHtml
   */
  renderChargeOpHtml(item) {
    const { appId, caid } = item;
    return (
      <span
        className="Gray_9e ThemeHoverColor3 pointer w100 oaButton updateAppCharge"
        onClick={() => this.chargeFn(appId, caid)}
      >
        {_l('将应用转交他人')}
      </span>
    );
  }

  chargeFn = (appId, accountId) => {
    dialogSelectUser({
      sourceId: this.props.match.params.projectId,
      fromType: 4,
      fromAdmin: true,
      SelectUserSettings: {
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        filterResigned: false,
        selectedAccountIds: [accountId],
        projectId: this.props.match.params.projectId,
        unique: true,
        callback: users => {
          this.updateAppOwner(appId, users[0]);
        },
      },
    });
  };

  /**
   * 变更拥有者
   */
  updateAppOwner(appId, user) {
    ajaxRequest.updateAppOwner({ appId, memberId: user.accountId }).then(result => {
      if (result) {
        let list = _.cloneDeep(this.state.list);

        list.forEach(item => {
          if (item.appId === appId) {
            item.caid = user.accountId;
            item.createAccountInfo.accountId = user.accountId;
            item.createAccountInfo.avatar = user.avatar;
            item.createAccountInfo.fullName = user.fullname;
          }
        });

        this.setState({ list });
      }
    });
  }

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
    this.getAppList();
  }, 200);

  /**
   * 更多操作项
   */
  renderMore = list => {
    return (
      <ul className="optionPanelTrigger">
        {list.map(item => {
          return (
            <li key={item.action}>
              <span className={item.icon} onClick={() => this[item.action]()}></span>
            </li>
          );
        })}
      </ul>
    );
  };

  render() {
    const {
      status,
      total,
      maxCount,
      count,
      loading,
      pageIndex,
      order,
      moreVisible,
      drawerVisible,
      exportIds,
      appTrashVisible,
      hasDataBase,
      dbInstanceId,
      dataDBInstances,
      DBInstancesDialog = false,
      updateVisible,
      userInfo,
    } = this.state;
    const projectId = this.props.match.params.projectId;
    const { authority = [] } = this.props;
    const { version = {}, licenseType } = getCurrentProject(projectId, true);
    const statusList = [
      { text: _l('全部状态'), value: '' },
      { text: _l('开启'), value: 1 },
      { text: _l('关闭'), value: 0 },
    ];
    const vertionType =
      !_.isEmpty(version) && Number(version.versionIdV2) < 2 ? Number(version.versionIdV2) + 1 : undefined;

    return (
      <div className="orgManagementWrap appManagementList flex flexColumn">
        <AdminTitle prefix={_l('应用管理')} />

        <div className="orgManagementHeader flexRow">
          <div className="Font17 bold flex">
            {_l('应用')}
            {total ? `（${total}）` : ''}
          </div>
          <Trigger
            popupVisible={moreVisible}
            onPopupVisibleChange={visible => this.setState({ moreVisible: visible })}
            action={['click']}
            popup={() => {
              return (
                <ul className="optionPanelTrigger moreOptionPanelTrigger">
                  {optionData.map(item => {
                    const featureType = getFeatureStatus(projectId, item.featureId);

                    if (
                      _.includes(['handleExportAll', 'openAppTrash', 'handleUpdateAll'], item.action) &&
                      !featureType
                    ) {
                      return;
                    }

                    return (
                      <li
                        key={item.action}
                        onClick={() => {
                          if (featureType === '2') {
                            this.setState({ moreVisible: false });
                            buriedUpgradeVersionDialog(projectId, item.featureId);
                            this.setState({ moreVisible: false });
                            return;
                          }
                          this[item.action]();
                          this.handleChangeVisible('moreVisible', true);
                        }}
                      >
                        <Icon icon={item.icon} className="mRight12 Gray_9e" />
                        {item.label}
                        {item.featureId && featureType === '2' && <UpgradeIcon />}
                      </li>
                    );
                  })}
                </ul>
              );
            }}
            popupAlign={{
              offset: [-125, 5],
              points: ['tr', 'tl'],
            }}
          >
            <span className="Gray_9e Font18 icon-more_horiz Hand mLeft25 ThemeHoverColor3"></span>
          </Trigger>
        </div>

        {maxCount > 0 && (
          <div className="appManagementCount flexRow">
            <span className="Gray_9e mRight5">{_l('已创建工作表（含聚合表）')}</span>
            <span className="bold">{count}</span>

            <span className="Gray_9e mLeft15 mRight5">{_l('剩余')}</span>
            <span className="bold" style={{ color: maxCount - count > 10 ? '#151515' : '#f44336' }}>
              {maxCount - count < 0 ? 0 : maxCount - count}
            </span>

            {!md.global.Config.IsLocal && (_.isEmpty(version) || version.versionIdV2 === '1') && (
              <Fragment>
                {licenseType === 1 ? (
                  <MdLink
                    className="ThemeColor3 ThemeHoverColor2 mLeft20 NoUnderline"
                    to={`/admin/upgradeservice/${this.props.match.params.projectId}${
                      vertionType ? '/' + vertionType : ''
                    }`}
                  >
                    {_l('升级版本')}
                  </MdLink>
                ) : (
                  <a
                    href="javascript:void(0);"
                    className="ThemeColor3 ThemeHoverColor2 mLeft20 NoUnderline"
                    onClick={() => {
                      purchaseMethodFunc({ projectId: this.props.match.params.projectId });
                    }}
                  >
                    {_l('购买付费版')}
                  </a>
                )}
              </Fragment>
            )}
          </div>
        )}

        <div className="manageListSearch flexRow">
          <Dropdown
            className="w180"
            data={statusList}
            value={status}
            border
            onChange={value => this.updateState({ status: value })}
          />
          {hasDataBase && (
            <Select
              className="w180 mdAntSelect mLeft15 Hand"
              showSearch
              defaultValue={dbInstanceId}
              options={dataDBInstances}
              onFocus={() => dataDBInstances.length === 2 && this.getDBInstances()}
              filterOption={(inputValue, option) =>
                dataDBInstances
                  .find(item => item.value === option.value)
                  .label.toLowerCase()
                  .indexOf(inputValue.toLowerCase()) > -1
              }
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
              onChange={value => this.updateState({ dbInstanceId: value })}
            />
          )}
          <SelectUser
            className="mdAntSelect w180 mLeft15"
            placeholder={_l('搜索拥有者')}
            projectId={projectId}
            userInfo={userInfo}
            changeData={data => this.updateState({ userInfo: data })}
          />
          <div className="flex" />
          <Search
            placeholder={_l('应用名称')}
            handleChange={_.debounce(keyword => this.updateState({ keyword }), 500)}
          />
        </div>

        <div className="flexRow manageList manageListHeader bold mTop16">
          <div className="flex mLeft10 appName">{_l('应用名称')}</div>
          {hasDataBase && <div className="columnWidth dataBase">{_l('所属数据库')}</div>}
          <div className="columnWidth flexRow">
            <div className="pointer ThemeHoverColor3 pRight12" style={{ zIndex: 1 }}>
              {_l('工作表数')}
            </div>
          </div>
          <div className="columnWidth">{_l('状态')}</div>
          <div className="columnWidth flexRow">
            <div
              className="pointer ThemeHoverColor3 pRight12"
              style={{ zIndex: 1 }}
              onClick={() => this.updateState({ order: order === 3 ? 4 : 3 })}
            >
              {_l('创建时间')}
            </div>
            <div className="flexColumn manageListOrder">
              <Icon icon="arrow-up" className={cx({ ThemeColor3: order === 4 })} />
              <Icon icon="arrow-down" className={cx({ ThemeColor3: order === 3 })} />
            </div>
          </div>
          <div className="columnWidth">{_l('拥有者')}</div>
          <div className="w50 mRight20" />
        </div>

        {loading && <LoadDiv className="mTop15" />}

        <div className="flex flexColumn mTop16">{this.renderList()}</div>

        <PaginationWrap
          total={total}
          pageIndex={pageIndex}
          pageSize={50}
          onChange={pageIndex => this.setState({ pageIndex }, this.getAppList)}
        />

        <Drawer
          className="appLogDrawerContainer"
          width={480}
          title={
            <div className="flexRow">
              <span className="flex">{_l('日志')}</span>
              <Icon
                icon="close"
                className=" Font20 Gray_9e Hand"
                onClick={() => this.setState({ drawerVisible: false })}
              />
            </div>
          }
          placement="right"
          onClose={() => this.setState({ drawerVisible: false })}
          visible={drawerVisible}
          maskClosable={false}
          closable={false}
        >
          <AppLog visible={drawerVisible} />
        </Drawer>

        {exportIds.length > 0 ? (
          <ExportApp appIds={exportIds} projectId={projectId} closeDialog={() => this.setState({ exportIds: [] })} />
        ) : null}

        {appTrashVisible && (
          <AppTrash
            projectId={projectId}
            onCancel={() => this.setState({ appTrashVisible: false })}
            onRestore={() => {
              this.setState({ pageIndex: 1 }, this.searchDataList);
            }}
          />
        )}
        <SelectDBInstance
          visible={DBInstancesDialog}
          options={dataDBInstances.filter(l => l.status === 1 && l.value !== 'all')}
          onOk={id => this.handleImportApp(id)}
          onCancel={() => this.setState({ DBInstancesDialog: false })}
        />

        {updateVisible && (
          <UpgradeProcess projectId={projectId} type="2" onCancel={() => this.setState({ updateVisible: false })} />
        )}
      </div>
    );
  }
}
