import React, { Component, Fragment } from 'react';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import './index.less';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import processVersion from '../api/processVersion';
import flowNode from '../api/flowNode';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { Icon, ScrollView, LoadDiv, Dialog } from 'ming-ui';
import MsgTemplate from './components/MsgTemplate';
import Search from '../components/Search';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import PublishBtn from './components/PublishBtn';
import { START_APP_TYPE } from './config/index';
import appManagement from 'src/api/appManagement';
import { Select } from 'antd';
import _ from 'lodash';

const {
  admin: {
    homePage: { extendWorkflow, renewBtn },
  },
} = window.private;

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
    });
  }

  postList = null;

  componentDidMount() {
    const { projectId } = this.props.match.params;

    this.getList(projectId);
    this.getWorkflowCount(projectId);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(nextProps, this.props)) {
      this.setState(
        Object.assign({
          list: null,
          appList: [{ label: _l('全部应用'), value: '' }],
          apkId: '',
          enabled: 0,
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

  /**
   * 获取list
   */
  getList(projectId) {
    const { list, apkId, enabled, isAsc, keyWords, pageIndex, sortId, loading, isMore } = this.state;

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
    const { list } = this.state;

    return (
      <div className="flexRow manageList" key={item.id}>
        <div
          className={cx('iconWrap mLeft10', { unable: !item.enabled })}
          style={{ backgroundColor: START_APP_TYPE[item.child ? 'subprocess' : item.startAppType].iconColor }}
        >
          <Icon icon={START_APP_TYPE[item.child ? 'subprocess' : item.startAppType].iconName} />
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
        <div className="columnWidth">{item.count.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')}</div>
        <div className="columnWidth">
          <PublishBtn list={list} item={item} updateSource={list => this.setState({ list })} />
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

  render() {
    const { params } = this.props.match;
    const { loading, pageIndex, enabled, msgVisible, count, useCount, checkAdmin, appList, apkId, sortId, isAsc } =
      this.state;
    const { limitExecCount, useExecCount, quantity } = useCount;
    const enabledList = [
      { label: _l('全部状态'), value: 0 },
      { label: _l('开启'), value: 1 },
      { label: _l('关闭'), value: 2 },
    ];
    const licenseType = md.global.Account.projects.find(o => o.projectId === params.projectId).licenseType;

    return (
      <div className="adminWorkflowList flex flexColumn">
        <AdminTitle prefix={_l('工作流')} />

        <div className="adminWorkflowHeader flexRow">
          <div className="flex Font17 bold">
            {_l('工作流')}
            {count ? `（${count}）` : ''}
          </div>

          <div className="pointer ThemeHoverColor3 Gray_9e" onClick={() => this.setState({ msgVisible: true })}>
            <Icon icon="workflow_sms" />
            <span className="mLeft5">{_l('短信模版')}</span>
          </div>
        </div>

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

              {licenseType === 1 ? (
                <Link
                  className={cx('ThemeColor3 ThemeHoverColor2 mLeft20 NoUnderline', { Hidden: extendWorkflow })}
                  to={`/admin/expansionservice/${params.projectId}/workflow`}
                >
                  {_l('购买升级包')}
                </Link>
              ) : (
                <Link
                  className={cx('ThemeColor3 ThemeHoverColor2 mLeft20 NoUnderline', { Hidden: renewBtn })}
                  to={`/upgrade/choose?projectId=${params.projectId}`}
                >
                  {_l('购买付费版')}
                </Link>
              )}
            </Fragment>
          ) : (
            _l('加载中...')
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

        {msgVisible && (
          <MsgTemplate
            companyId={params.projectId}
            api={flowNode.getAllSMSTemplateList}
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
      </div>
    );
  }
}
