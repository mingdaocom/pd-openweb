import React, { Component, Fragment } from 'react';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import './index.less';
import { Link } from 'react-router-dom';
import { LoadDiv, Dropdown, Switch, Icon, ScrollView, DeleteReconfirm, Dialog, Checkbox, Tooltip } from 'ming-ui';
import cx from 'classnames';
import AppTrash from 'src/pages/worksheet/common/Trash/AppTrash';
import Search from 'src/pages/workflow/components/Search';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import ajaxRequest from 'src/api/appManagement';
import { deleteApp } from 'src/api/homeApp';
import projectSettingAjaxRequest from 'src/api/projectSetting';
import 'src/components/dialogSelectUser/dialogSelectUser';
import CustomIcon from './CustomIcon';
import SvgIcon from 'src/components/SvgIcon';
import Trigger from 'rc-trigger';
import ReactDom from 'react-dom';
import ExportApp from './modules/ExportApp';
import ImportApp from './modules/ImportApp';
import SelectApp from './modules/SelectApp';
import AppAnalytics from 'src/pages/Admin/useAnalytics/components/AppAnalytics';
import AppLog from './modules/AppLog';
import { Drawer } from 'antd';
import EventEmitter from 'events';
import { upgradeVersionDialog, getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';

export const emitter = new EventEmitter();

const optionData = [
  { label: _l('导入应用'), icon: 'reply1', action: 'handleImport', hasBeta: true, featureId: 2 },
  { label: _l('批量导出'), icon: 'cloud_download', action: 'handleExportAll', hasBeta: true, featureId: 2 },
  { label: _l('日志'), icon: 'assignment', action: 'handleLog', hasBeta: false },
  { label: _l('应用回收站'), icon: 'knowledge-recycle', action: 'openAppTrash', hasBeta: false, featureId: 16 },
];

const dialogHeader = {
  selectAppVisible: _l('选择要导出的应用'),
  singleAppVisible: _l('导出应用'),
  uploadVisible: _l('导入应用'),
};

export default class AppManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hiddenIds: [],

      onlyManagerCreateApp: false,
      list: null,
      total: 0,
      count: 0,
      maxCount: 0,

      status: '',
      order: 3,
      pageIndex: 1,
      keyword: '',

      isMore: true,
      loading: false,
      checkAdmin: {
        id: '',
        post: false,
        visible: false,
        title: '',
      },
      uploadSvg: false,

      moreVisible: false,
      rowVisible: null,
      drawerVisible: false,

      //单个导出弹层ids
      exportIds: [],
    };
    //推送完刷新列表
    emitter.addListener('updateState', this.updateState);
  }

  postList = null;

  componentDidMount() {
    const { projectId } = this.props.match.params;
    this.getAppList(projectId);
    this.checkExportOrImportAuth(projectId);
    this.getOnlyManagerCreateApp(projectId);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(nextProps, this.props)) {
      this.setState({
        onlyManagerCreateApp: false,
        list: null,
        status: '',
        order: 3,
        pageIndex: 1,
        keyword: '',
        isMore: true,
        loading: false,
        uploadSvg: false,
        isFree: false,
      });

      const { projectId } = nextProps.match.params;
      this.getAppList(projectId);
      this.checkExportOrImportAuth(projectId);
      this.getOnlyManagerCreateApp(projectId);
    }
  }

  /**
   * 标准版不能导入导出
   */
  checkExportOrImportAuth(projectId) {
    const { licenseType } = _.find(md.global.Account.projects || [], o => o.projectId === projectId) || {};
    this.setState({ isFree: licenseType === 0 });
  }

  /**
   * 获取是否只允许管理员创建应用
   */
  getOnlyManagerCreateApp(projectId) {
    projectSettingAjaxRequest.getOnlyManagerCreateApp({ projectId }).then(result => {
      this.setState({ onlyManagerCreateApp: result.onlyManagerCreateApp });
    });
  }

  /**
   * 获取应用列表
   */
  getAppList(projectId) {
    const { status, order, pageIndex, keyword, loading, isMore } = this.state;

    // 加载更多
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }

    this.setState({ loading: true });

    if (this.postList) {
      this.postList.abort();
    }

    this.postList = ajaxRequest.getAppsForProject({
      projectId,
      status,
      order,
      pageIndex,
      pageSize: 30,
      keyword,
    });
    this.postList.then(({ apps, maxCount, total, count }) => {
      this.setState({
        list: pageIndex === 1 ? apps : this.state.list.concat(apps),
        pageIndex: pageIndex + 1,
        maxCount,
        total,
        count,
        loading: false,
        isMore: apps.length === 30,
      });
    });
  }

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
      <ScrollView className="flex" onScrollEnd={this.searchDataList}>
        {list.filter(item => !_.includes(hiddenIds, item.appId)).map(item => this.renderListItem(item))}
        {loading && pageIndex > 1 && <LoadDiv className="mTop15" size="small" />}
      </ScrollView>
    );
  }

  /**
   * 渲染单个列表项
   */
  renderListItem(item) {
    const { projectId } = this.props.match.params;
    const { list, hiddenIds } = this.state;
    const featureType = getFeatureStatus(projectId, 2);
    return (
      <div className="flexRow manageList" key={item.appId}>
        <div className={cx('iconWrap mLeft10', { unable: !item.status })} style={{ backgroundColor: item.iconColor }}>
          <SvgIcon url={item.iconUrl} fill="#fff" size={24} />
        </div>
        <div className="flex name mLeft10 mRight40">
          <div
            className={cx('flexColumn nameBox ThemeColor3', { unable: !item.status })}
            onClick={() => this.checkIsAppAdmin(item.appId, item.appName)}
          >
            <div className="ellipsis Font14">{item.appName}</div>
          </div>
        </div>
        <div className="columnWidth">{item.sheetCount.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')}</div>
        <div className="columnWidth">
          <Switch
            checked={!!item.status}
            text={item.status ? _l('开启') : _l('关闭')}
            onClick={checked => this.editAppStatus(item.appId, checked ? 0 : 1)}
          />
        </div>
        <div className="columnWidth Gray_9e">{moment(item.ctime).format('YYYY-MM-DD')}</div>
        <div className="columnWidth Gray_75 flexRow">
          <UserHead
            size={28}
            user={{ userHead: item.createAccountInfo.avatar, accountId: item.caid }}
            showOpHtml
            opHtml={this.renderChargeOpHtml()}
            readyFn={evt => this.chargeReadyFn(evt, item.appId, item.caid)}
          />
          <div className="mLeft12 ellipsis flex mRight20">{item.createAccountInfo.fullName}</div>
        </div>
        <div className="w50 mRight20 TxtCenter flexRow">
          {getFeatureStatus(projectId, 17) && (
            <Tooltip text={<span>{_l('使用分析')}</span>}>
              <span
                className="Gray_9e Hand Font18 icon-worksheet_column_chart Hover_49 mRight16 chartIcon"
                onClick={() => {
                  if (getFeatureStatus(projectId, 17) === '2') {
                    buriedUpgradeVersionDialog(projectId, 17);
                    return;
                  }
                  this.setState({ appAnalyticsVisible: true, currentAppInfo: { ...item, name: item.appName } });
                }}
              ></span>
            </Tooltip>
          )}
          <Trigger
            popupVisible={this.state.rowVisible === item.appId}
            onPopupVisibleChange={() => this.handleChangeVisible('rowVisible', item.appId)}
            action={['click']}
            popup={() => {
              return (
                <ul className="optionPanelTrigger">
                  {item.isGoods || !featureType ? null : (
                    <li
                      onClick={() => {
                        if (featureType === '2') {
                          this.setState({ rowVisible: false });
                          buriedUpgradeVersionDialog(projectId, 2);
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
                          deleteApp({
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
                                return $.Deferred().reject();
                              }
                            })
                            .fail(() => {
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
              offset: [-100, 3],
              points: ['tr', 'tl'],
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

  /**
   * 应用导入
   */
  handleImport() {
    const options = {
      title: this.renderHeader('uploadVisible'),
      visible: true,
      footer: null,
      className: 'importSingleAppDialog',
      width: '640',
      overlayClosable: false,
      onCancel: () => this.closeDialog('importSingleAppDialog'),
    };
    ReactDom.render(
      <Dialog {...options}>
        <ImportApp closeDialog={() => this.closeDialog('importSingleAppDialog')}  />
      </Dialog>,
      document.createElement('div'),
    );
  }

  // 应用回收站
  openAppTrash() {
    const { projectId } = this.props.match.params;
    const featureType = getFeatureStatus(projectId, 16);
    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, 16);
    } else {
      this.setState({ appTrashVisible: true });
    }
  }

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
    ReactDom.render(
      <Dialog {...options}>
        <SelectApp
          handleNext={list => {
            this.closeDialog('importTotalAppDialog');
            this.handleExport(list);
          }}
          closeDialog={() => this.closeDialog('importTotalAppDialog')}
        />
      </Dialog>,
      document.createElement('div'),
    );
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
          alert(_l('操作失败，请稍候重试！', 2));
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
  renderChargeOpHtml() {
    return `
      <span class="Gray_9e ThemeHoverColor3 pointer w100 oaButton updateAppCharge">
        ${_l('将应用转交他人')}
      </span>
    `;
  }

  /**
   * 负责人 op操作
   */
  chargeReadyFn = (evt, appId, accountId) => {
    const that = this;
    evt.on('click', '.updateAppCharge', function () {
      $(this).dialogSelectUser({
        sourceId: that.props.match.params.projectId,
        fromType: 4,
        fromAdmin: true,
        SelectUserSettings: {
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          filterAccountIds: [accountId],
          projectId: that.props.match.params.projectId,
          unique: true,
          callback(users) {
            that.updateAppOwner(appId, users[0]);
          },
        },
      });
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
   * 检测是否是应用管理员
   */
  checkIsAppAdmin(appId, name) {
    const opts = post => {
      return {
        id: appId,
        post,
        visible: true,
        title: name,
      };
    };
    this.setState({ checkAdmin: opts(true) }, () => {
      ajaxRequest
        .checkAppAdminForUser({
          appId,
        })
        .then(result => {
          if (result) {
            navigateTo(`/app/${appId}`);
          } else if (this.state.checkAdmin.visible) {
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
      checkAdmin: { id },
    } = this.state;

    ajaxRequest
      .addRoleMemberForAppAdmin({
        appId: id,
      })
      .then(result => {
        if (result) {
          navigateTo(`/app/${id}`);
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
    this.getAppList(projectId);
  }, 200);

  /**
   * 只允许管理员创建应用
   */
  setOnlyManagerCreateApp(checked) {
    const { projectId } = this.props.match.params;

    projectSettingAjaxRequest.setOnlyManagerCreateApp({ projectId, onlyManagerCreateApp: checked }).then(() => {
      this.setState({ onlyManagerCreateApp: checked });
    });
  }

  /**
   * 打开自定义图标
   */
  openCustomSvg = featureType => {
    const { projectId } = this.props.match.params;
    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, 7);
    } else {
      this.setState({ uploadSvg: true });
    }
  };

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
      checkAdmin,
      total,
      maxCount,
      count,
      loading,
      pageIndex,
      order,
      onlyManagerCreateApp,
      uploadSvg,
      moreVisible,
      drawerVisible,
      exportIds,
      appTrashVisible,
      appAnalyticsVisible,
      currentAppInfo = {},
    } = this.state;
    const projectId = this.props.match.params.projectId;
    const { version, licenseType } = _.find(md.global.Account.projects || [], o => o.projectId === projectId) || {};
    const statusList = [
      { text: _l('全部状态'), value: '' },
      { text: _l('开启'), value: 1 },
      { text: _l('关闭'), value: 0 },
    ];
    const featureType = getFeatureStatus(projectId, 7);

    if (uploadSvg) {
      return (
        <CustomIcon onClose={() => this.setState({ uploadSvg: false })} projectId={this.props.match.params.projectId} />
      );
    }

    return (
      <div className="appManagementList flex flexColumn">
        <AdminTitle prefix={_l('应用')} />

        <div className="appManagementHeader flexRow">
          <div className="Font17 bold flex">
            {_l('应用')}
            {total ? `（${total}）` : ''}
          </div>
          {featureType && (
            <div className="ThemeHoverColor3 pointer" onClick={() => this.openCustomSvg(featureType)}>
              <Icon icon="hr_custom" className="Font18 mRight5" />
              {_l('自定义图标')}
            </div>
          )}
          {md.global.Config.IsPlatformLocal && (
            <span
              data-tip={_l('勾选后，只允许组织后台的应用管理员创建应用；不勾选则允许全员创建应用')}
              className="appManagementTips pTop5"
            >
              <Checkbox
                className="InlineBlock mLeft25 ThemeHoverColor3"
                text={_l('只允许应用管理员创建应用')}
                checked={onlyManagerCreateApp}
                onClick={checked => this.setOnlyManagerCreateApp(!checked)}
              />
            </span>
          )}
          <Trigger
            popupVisible={moreVisible}
            onPopupVisibleChange={visible => this.setState({ moreVisible: visible })}
            action={['click']}
            popup={() => {
              return (
                <ul className="optionPanelTrigger moreOptionPanelTrigger">
                  {optionData.map(item => {
                    const featureType = getFeatureStatus(projectId, item.featureId);
                    if (_.includes(['handleImport', 'handleExportAll', 'openAppTrash'], item.action) && !featureType)
                      return;
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
            <span className="Gray_9e mRight5">{_l('已创建工作表')}</span>
            <span className="bold">{count}</span>

            <span className="Gray_9e mLeft15 mRight5">{_l('剩余')}</span>
            <span className="bold" style={{ color: maxCount - count > 10 ? '#333' : '#f44336' }}>
              {maxCount - count < 0 ? 0 : maxCount - count}
            </span>

            {/* {md.global.Account.projects.find(o => o.projectId === this.props.match.params.projectId).licenseType ===
            1 ? (
              <Link
                className={cx('ThemeColor3 ThemeHoverColor2 mLeft20 NoUnderline')}
                to={`/admin/upgradeservice/${this.props.match.params.projectId}`}
              >
                {_l('升级版本')}
              </Link>
            ) : (
              <Link
                className={cx('ThemeColor3 ThemeHoverColor2 mLeft20 NoUnderline')}
                to={`/upgrade/choose?projectId=${this.props.match.params.projectId}`}
              >
                {_l('购买付费版')}
              </Link>
            )} */}
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
          <div className="flex" />
          <Search
            placeholder={_l('应用名称 / 拥有者')}
            handleChange={keyword => this.updateState({ keyword: keyword.trim() })}
          />
        </div>

        <div className="flexRow manageList manageListHeader bold mTop16">
          <div className="flex mLeft10">{_l('应用名称')}</div>
          <div className="columnWidth flexRow">
            <div
              className="pointer ThemeHoverColor3 pRight12"
              style={{ zIndex: 1 }}
              onClick={() => this.updateState({ order: order === 1 ? 2 : 1 })}
            >
              {_l('工作表数')}
            </div>
            <div className="flexColumn manageListOrder">
              <Icon icon="arrow-up" className={cx({ ThemeColor3: order === 2 })} />
              <Icon icon="arrow-down" className={cx({ ThemeColor3: order === 1 })} />
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

        {loading && pageIndex === 1 && <LoadDiv className="mTop15" />}

        <div className="flex flexColumn mTop16">{this.renderList()}</div>

        <Dialog
          visible={checkAdmin.visible}
          className={cx({ checkAdminDialog: checkAdmin.post })}
          title={_l('管理应用“%0”', checkAdmin.title)}
          description={_l('如果你不是应用的管理员，需要将自己加为管理员以获得权限')}
          cancelText=""
          okText={checkAdmin.post ? _l('验证权限...') : _l('加为应用管理员')}
          onOk={checkAdmin.post ? () => {} : this.addRoleMemberForAppAdmin}
          onCancel={() => this.setState({ checkAdmin: Object.assign({}, this.state.checkAdmin, { visible: false }) })}
        />

        <Drawer
          className="appLogDrawerContainer"
          width={480}
          title={
            <div>
              <Icon
                icon="close"
                className="mRight16 Font20 Gray_9e Hand"
                onClick={() => this.setState({ drawerVisible: false })}
              />
              <span>{_l('日志')}</span>
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
          <ExportApp appIds={exportIds} closeDialog={() => this.setState({ exportIds: [] })} />
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

        {appAnalyticsVisible && (
          <AppAnalytics
            currentAppInfo={currentAppInfo}
            projectId={projectId}
            onCancel={() => {
              this.setState({ appAnalyticsVisible: false });
            }}
          />
        )}
      </div>
    );
  }
}
