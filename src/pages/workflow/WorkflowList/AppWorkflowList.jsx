import React, { Component, Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import qs from 'query-string';
import { navigateTo } from 'router/navigation/navigateTo';
import styled from 'styled-components';
import { Icon, LoadDiv, MdLink, ScrollView, Support, SvgIcon, UpgradeIcon, UserHead } from 'ming-ui';
import { Button, DatePicker, Dropdown, Input, Menu, Modal, Select, Tooltip, WaterMark } from 'ming-ui/antd-components';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import processVersion from '../api/processVersion';
import appManagementAjax from 'src/api/appManagement';
import homeApp from 'src/api/homeApp';
import processAjax from 'src/pages/workflow/api/process';
import { updateGlobalStoreForMingo } from 'src/common/runtime/mingoStore';
import EnvironmentBadge from 'src/components/AppSandbox/environment/EnvironmentBadge';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import TrashDialog from 'src/pages/workflow/WorkflowList/components/Trash';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { emitter } from 'src/utils/platform/browser/dom';
import { getAppFeaturesPath } from 'src/utils/platform/navigation/query';
import { getAppLangDetail, getTranslateInfo, setFavicon } from 'src/utils/services/app';
import { getFeatureStatus } from 'src/utils/services/project';
import Search from '../components/Search';
import { APP_TYPE, RELATION_TYPE } from '../WorkflowSettings/enum';
import CopyFlowBtn from './components/CopyFlowBtn';
import CreateWorkflow from './components/CreateWorkflow';
import ListName from './components/ListName';
import PublishBtn from './components/PublishBtn';
import {
  buildWorkflowListReturnQuery,
  DATE_SCOPE,
  FLOW_TYPE,
  FLOW_TYPE_NULL,
  getActionTypeContent,
  getWorkflowListState,
  START_APP_TYPE,
  TYPES,
} from './utils/index';
import './index.less';

const HeaderWrap = styled.div`
  height: 50px;
  box-shadow: var(--shadow-md);
  z-index: 15;
  background-color: var(--color-background-primary);
  padding: 0 24px 0 16px;
  .applicationIcon {
    width: 28px;
    height: 28px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: normal;
    margin-left: 10px;
  }
  .simpleHeaderBackIcon {
    line-height: 1;
    cursor: pointer;
  }
  .trash {
    color: var(--color-text-secondary);
    .trashIcon {
      color: var(--color-text-secondary);
    }
    &:hover {
      color: var(--color-primary);
      .trashIcon {
        color: var(--color-primary);
      }
    }
  }
`;

function updateWorkflowMingoStore(appDetail = {}) {
  updateGlobalStoreForMingo({
    activeModule: 'workflow',
    appId: appDetail.id,
    projectId: appDetail.projectId,
    sectionId: _.get(appDetail, 'sections[0].appSectionId'),
    appName: appDetail.name,
    appDescription: appDetail.description,
  });
}

const isCompleteDateRange = range =>
  Array.isArray(range) && range.length === 2 && range.every(date => moment.isMoment(date) && date.isValid());

const RANGE_PICKER_TRIGGER_STYLE = {
  position: 'absolute',
  inset: 0,
  opacity: 0,
  pointerEvents: 'none',
};
const WORKFLOW_MENU_STYLE = { minWidth: 180 };

const CreateBtn = styled.div``;

const CreateBtnBig = styled.div`
  .workflowCreate {
    opacity: 0.87;
    &:hover {
      opacity: 1;
    }
  }
  .flowSupport {
    line-height: 34px !important;
    border-radius: 36px !important;
    padding: 0 32px !important;
    background-color: var(--color-background-primary);
    margin-left: 16px;
    border: 1px solid var(--color-text-disabled);
    opacity: 0.87;
    font-weight: bold;
    &:hover {
      opacity: 1;
    }
    span {
      margin-left: 0 !important;
      font-size: 13px;
      font-weight: bold;
      color: var(--color-text-title) !important;
    }
  }
`;

const ArrowUp = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent var(--color-text-tertiary) transparent;
  cursor: pointer;
  &:hover,
  &.active {
    border-color: transparent transparent #1677ff transparent;
  }
`;

const ArrowDown = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: var(--color-text-tertiary) transparent transparent transparent;
  cursor: pointer;
  margin-top: 2px;
  &:hover,
  &.active {
    border-color: var(--color-primary) transparent transparent transparent;
  }
`;

export class AppWorkflowList extends Component {
  constructor(props) {
    super(props);
    const listState = getWorkflowListState(location.search, _.get(props, 'match.params.worksheetId') || '');

    this.state = {
      loading: true,
      list: [],
      count: {},
      ...listState,
      isCreate: false,
      appDetail: {},
      selectFlowId: '',
      selectItem: '',
      renameItem: null,
      renameName: '',
      renamePending: false,
      showTrash: false,
      showDateRangePicker: false,
    };
  }

  ajaxRequest = null;
  requestPending = false;
  renameRequestPending = false;

  componentDidMount() {
    const { appId } = this.props.match.params;
    updateWorkflowMingoStore({ id: appId, ...(window.appInfo || {}) });
    this.getAppDetail();
    this.checkIsAppAdmin();
  }

  componentWillUnmount() {
    if (window.globalStoreForMingo?.activeModule === 'workflow') {
      updateGlobalStoreForMingo({ activeModule: 'worksheet' });
    }
  }

  /**
   * 获取type
   */
  /**
   * 获取type
   */

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const type = this.getQueryStringType();

      if (type !== this.state.type) {
        this.setState({
          loading: true,
          type,
          groupFilter: _.get(this.props, 'match.params.worksheetId') || '',
          userFilter: '',
          statusFilter: '',
          dateFilter: '',
          keywords: '',
          isAsc: true,
          displayType: 'lastModifiedDate',
          sortType: '',
          focusId: '',
        });
        this.getList(type);
        this.getCount();
      }
    }
  }

  /**
   * 获取type
   */
  getQueryStringType() {
    const queryString = location.search && location.search.slice(1);

    return qs.parse(queryString).type || '';
  }

  /**
   * 获得应用详情
   */
  getAppDetail() {
    const appId = this.props.match.params.appId;

    homeApp.getApp({ appId, getLang: true }).then(appDetail => {
      updateWorkflowMingoStore(appDetail);
      emitter.emit('UPDATE_GLOBAL_STORE', 'appInfo', appDetail);
      getAppLangDetail(appDetail).then(() => {
        appDetail.name = getTranslateInfo(appId, null, appId).name || appDetail.name;
        this.setState({ appDetail });
        setFavicon(appDetail.iconUrl, appDetail.iconColor);
      });
    });
  }

  /**
   * 检测是否是应用管理员
   */
  checkIsAppAdmin() {
    const appId = this.props.match.params.appId;

    processVersion.getProcessRole({ relationType: RELATION_TYPE.APP, relationId: appId }).then(result => {
      if (result) {
        this.getList(this.state.type);
        this.getCount();
      } else {
        navigateTo(`/app/${appId}`);
      }
    });
  }

  /**
   * 获取list
   */
  getList(type) {
    if (this.ajaxRequest) {
      this.ajaxRequest.abort();
    }

    const appId = this.props.match.params.appId;

    if (!type) {
      this.ajaxRequest = processVersion.listAll({
        relationId: appId,
      });
    } else {
      this.ajaxRequest = processVersion.list({
        relationId: appId,
        processListType: type,
      });
    }

    this.ajaxRequest.then(result => {
      this.ajaxRequest = null;

      result.forEach(list => {
        list.groupName = getTranslateInfo(appId, null, list.groupId).name || list.groupName;
        list.processList.forEach(item => {
          item.name = getTranslateInfo(appId, null, item.id).name || item.name;
        });
      });

      // webhook触发
      if (type === FLOW_TYPE.WEBHOOK) {
        result.forEach(list => {
          list.processList.forEach(item => {
            item.hookUrl = btoa(item.id);
          });
        });
      }

      this.focusedWorkflowElement = null;
      this.setState(
        {
          loading: false,
          list: result,
        },
        this.scrollToFocusedWorkflow,
      );
    });
  }

  getWorkflowListReturnQuery = focusId => buildWorkflowListReturnQuery(this.state, focusId);

  scrollToFocusedWorkflow = () => {
    if (!this.state.focusId || !this.listScrollView || !this.focusedWorkflowElement) return;

    const { viewport } = this.listScrollView.getScrollInfo() || {};

    if (!viewport) return;

    const viewportRect = viewport.getBoundingClientRect();
    const elementRect = this.focusedWorkflowElement.getBoundingClientRect();

    if (elementRect.top < viewportRect.top || elementRect.bottom > viewportRect.bottom) {
      this.listScrollView.scrollToElement(this.focusedWorkflowElement);
    }
  };

  /**
   * 获取计数
   */
  getCount() {
    processVersion
      .count({
        relationId: this.props.match.params.appId,
        relationType: RELATION_TYPE.APP,
      })
      .then(result => {
        this.setState({ count: result });
      });
  }

  backToApp() {
    const appId = this.props.match.params.appId;

    window.disabledSideButton = true;

    const storage = safeParse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};

    if (storage) {
      const { lastGroupId, lastWorksheetId, lastViewId } = storage;
      navigateTo(
        `/app/${appId}/${[lastGroupId, lastWorksheetId, lastViewId]
          .filter(o => o && !_.includes(['undefined', 'null'], o))
          .join('/')}?from=insite`,
      );
    } else {
      navigateTo(`/app/${appId}`);
    }
  }

  /**
   * 渲染头部
   */
  renderHeader() {
    const appId = this.props.match.params.appId;
    const { type, appDetail, isCreate } = this.state;

    return (
      <HeaderWrap className="flexRow alignItemsCenter">
        <EnvironmentBadge />
        <div className="flexRow alignItemsCenter">
          <i
            className="icon-backspace simpleHeaderBackIcon Font20 textTertiary hoverColorPrimary"
            onClick={() => this.backToApp()}
          />
          <Tooltip placement="bottomLeft" title={_l('应用：%0', appDetail.name)}>
            <div
              className="applicationIcon pointer"
              style={{ backgroundColor: appDetail.iconColor }}
              onClick={() => this.backToApp()}
            >
              <SvgIcon url={appDetail.iconUrl} fill="#fff" size={18} />
            </div>
          </Tooltip>
        </div>

        <div className="flex nativeTitle Font17 bold mLeft10">{_l('自动化工作流')}</div>

        <Support
          className="pointer textSecondary mRight15"
          href={
            type === FLOW_TYPE.PBC
              ? 'https://help.mingdao.com/workflow/pbp'
              : 'https://help.mingdao.com/workflow/create'
          }
          type={2}
          text={_l('使用帮助')}
        />

        <CreateBtn>
          {type !== FLOW_TYPE.PBC ? (
            <Button
              type="primary"
              shape="round"
              icon={<Icon icon="add" />}
              className="workflowAdd"
              style={{ backgroundColor: appDetail.iconColor }}
              onClick={() => this.setState({ isCreate: true })}
            >
              {_l('新建工作流')}
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              icon={<Icon icon="add" />}
              className="workflowAdd"
              onClick={() => !this.requestPending && this.createFlow(appId)}
            >
              {_l('新建封装业务流程')}
            </Button>
          )}
        </CreateBtn>

        {isCreate && (
          <CreateWorkflow
            appId={appId}
            flowName={_l('未命名工作流')}
            onBack={() => this.setState({ isCreate: false })}
          />
        )}
      </HeaderWrap>
    );
  }

  /**
   * 渲染导航
   */
  renderNavigation() {
    const { params } = this.props.match;
    const { type, count, appDetail } = this.state;
    const isFree =
      _.get(
        _.find(md.global.Account.projects, item => item.projectId === appDetail.projectId),
        'licenseType',
      ) === 0;
    const featureType = getFeatureStatus(appDetail.projectId, VersionProductType.recycle);
    const featurePath = getAppFeaturesPath();
    const linkUrl =
      (_.get(params, 'worksheetId')
        ? location.pathname.replace(`/${_.get(params, 'worksheetId')}`, '')
        : location.pathname) + (featurePath ? `?${featurePath}` : '');
    const visibleTypes = TYPES.filter(
      o =>
        !(md.global.SysSettings.hideAIBasicFun && o.value === FLOW_TYPE.AI_ACTIONS) &&
        (o.value !== FLOW_TYPE.EVENT_PUSH || count[o.value]),
    );
    const getNavigationItem = item => ({
      key: item.value || 'all',
      icon: <i className={cx('Font18', item.icon)} />,
      label: (
        <div className="workflowNavigationLabel flexRow">
          <span className="flex ellipsis">{item.text}</span>
          <span className="textTertiary mLeft10 Font13">
            {(item.value ? count[item.value] : _.sum(Object.values(count))) || ''}
          </span>
        </div>
      ),
    });
    const navigationItems = [
      getNavigationItem(visibleTypes[0]),
      {
        type: 'group',
        label: _l('触发方式'),
        children: visibleTypes
          .filter(item =>
            _.includes(
              [
                FLOW_TYPE.APP,
                FLOW_TYPE.TIME,
                FLOW_TYPE.USER,
                FLOW_TYPE.WEBHOOK,
                FLOW_TYPE.CUSTOM_ACTION,
                FLOW_TYPE.AI_ACTIONS,
                FLOW_TYPE.CHATBOT,
              ],
              item.value,
            ),
          )
          .map(getNavigationItem),
      },
      {
        type: 'group',
        label: _l('调用流程'),
        children: visibleTypes
          .filter(item =>
            _.includes([FLOW_TYPE.LOOP, FLOW_TYPE.SUB_PROCESS, FLOW_TYPE.APPROVAL, FLOW_TYPE.PBC], item.value),
          )
          .map(getNavigationItem),
      },
      {
        type: 'group',
        label: _l('其他'),
        children: visibleTypes.filter(item => item.value === FLOW_TYPE.EVENT_PUSH).map(getNavigationItem),
      },
    ];

    if (featureType) {
      navigationItems.push({
        key: 'trash',
        icon: <i className="Font18 icon-knowledge-recycle" />,
        label: (
          <span className="flex ellipsis">
            {_l('回收站')}
            {isFree && <UpgradeIcon />}
          </span>
        ),
      });
    }

    return (
      <div className="workflowHeader flexColumn">
        <ScrollView className="pLeft8 pRight8">
          <Menu
            className="workflowNavigationMenu"
            mode="inline"
            selectedKeys={[type || 'all']}
            items={navigationItems}
            onClick={({ key }) => {
              if (key === 'trash') {
                if (isFree) {
                  buriedUpgradeVersionDialog(appDetail.projectId, VersionProductType.recycle);
                  return;
                }

                this.setState({ showTrash: true });
                return;
              }

              const flowType = key === 'all' ? '' : key;
              navigateTo(flowType ? `${linkUrl}${linkUrl.indexOf('?') > -1 ? '&' : '?'}type=${flowType}` : linkUrl);
            }}
          />
        </ScrollView>
      </div>
    );
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const {
      type,
      groupFilter,
      userFilter,
      statusFilter,
      dateFilter,
      keywords,
      sortType,
      isAsc,
      displayType,
      rangeDate,
    } = this.state;
    let { list } = _.cloneDeep(this.state);

    // 分组筛选
    if (groupFilter !== '') {
      list = list.filter(o => o.groupId === groupFilter);
    }

    // 拥有者筛选
    if (userFilter !== '') {
      list = list.map(item => {
        item.processList = item.processList.filter(flow => flow.ownerAccount.accountId === userFilter);
        return item;
      });
    }

    // 状态筛选
    if (statusFilter !== '') {
      list = list.map(item => {
        item.processList = item.processList.filter(flow => flow.enabled === statusFilter);
        return item;
      });
    }

    // 时间筛选
    if (dateFilter !== '') {
      const [startTime, endTime] = dateFilter === 8 ? rangeDate : DATE_SCOPE.find(o => o.value === dateFilter).format();
      list = list.map(item => {
        item.processList = item.processList.filter(flow =>
          !startTime || !endTime
            ? true
            : moment(flow[displayType]) >= moment(startTime) && moment(flow[displayType]) < moment(endTime),
        );
        return item;
      });
    }

    // 按名称搜索
    if (keywords) {
      list = list.map(item => {
        item.processList = item.processList.filter(
          flow =>
            _.includes(flow.name.toLocaleLowerCase(), keywords.toLocaleLowerCase()) ||
            (flow.hookUrl || '').toLocaleLowerCase() === keywords.toLocaleLowerCase(),
        );
        return item;
      });
    }

    _.remove(list, o => !o.processList.length);

    // 排序
    if (sortType !== '') {
      // 按时间排序合并工作流
      if (_.includes(['createdDate', 'lastModifiedDate'], sortType)) {
        let newList = [];

        list.forEach(item => {
          newList = newList.concat(
            item.processList.map(o => {
              return { ...o, explain: item.groupName };
            }),
          );
        });

        list = [{ processList: newList }];
      }

      list = list.map(item => {
        item.processList = item.processList.sort((a, b) => {
          if (isAsc) {
            if (sortType === 'name') {
              return a[sortType].charCodeAt(0) - b[sortType].charCodeAt(0);
            }

            return moment(a[sortType]) - moment(b[sortType]);
          } else {
            if (sortType === 'name') {
              return b[sortType].charCodeAt(0) - a[sortType].charCodeAt(0);
            }

            return moment(b[sortType]) - moment(a[sortType]);
          }
        });
        return item;
      });
    }

    return (
      <Fragment>
        <div className="flexRow manageList manageListHeader bold">
          <div className="flex mLeft10 mRight20 flexRow" style={{ minWidth: 120 }}>
            <div className="flex">{!type ? _l('工作表/流程名称') : _l('流程名称')}</div>
            <div className="flexColumn">
              <ArrowUp
                className={cx({ active: sortType === 'name' && isAsc })}
                onClick={() => this.setState({ sortType: 'name', isAsc: true })}
              />
              <ArrowDown
                className={cx({ active: sortType === 'name' && !isAsc })}
                onClick={() => this.setState({ sortType: 'name', isAsc: false })}
              />
            </div>
          </div>
          <div className="w180">
            {type === FLOW_TYPE.OTHER_APP
              ? _l('修改工作表')
              : type === FLOW_TYPE.CUSTOM_ACTION
                ? _l('数据源')
                : type === FLOW_TYPE.APPROVAL
                  ? _l('触发流程')
                  : type
                    ? _l('触发方式')
                    : _l('类型')}
          </div>
          <div className="w270 pRight20 flexRow">
            {type === FLOW_TYPE.OTHER_APP ? (
              <div className="flex">{_l('执行动作')}</div>
            ) : (
              <Fragment>
                <div className="flex">
                  <Select
                    className="workflowListTimeSelect Normal"
                    variant="borderless"
                    options={[
                      { label: _l('创建时间'), value: 'createdDate' },
                      { label: _l('更新时间'), value: 'lastModifiedDate' },
                    ]}
                    value={displayType}
                    labelRender={() => (
                      <span className="textSecondary bold">
                        {displayType === 'createdDate' ? _l('状态 / 创建时间') : _l('状态 / 更新时间')}
                      </span>
                    )}
                    onChange={displayType => this.setState({ displayType, sortType: displayType, isAsc: true })}
                  />
                </div>
                <div className="flexColumn">
                  <ArrowUp
                    className={cx({ active: _.includes(['createdDate', 'lastModifiedDate'], sortType) && isAsc })}
                    onClick={() => this.setState({ sortType: displayType, isAsc: true })}
                  />
                  <ArrowDown
                    className={cx({ active: _.includes(['createdDate', 'lastModifiedDate'], sortType) && !isAsc })}
                    onClick={() => this.setState({ sortType: displayType, isAsc: false })}
                  />
                </div>
              </Fragment>
            )}
          </div>
          <div className="w120">{_l('拥有者')}</div>
          <div className="w20 mRight20" />
        </div>
        <ScrollView className="flex" ref={ref => (this.listScrollView = ref)}>
          {!list.length && (
            <div className="flowEmptyWrap flexColumn">
              <div className="flowEmptyPic flowEmptyPic-search" />
              <div className="textSecondary Font17 mTop20">{_l('没有搜索到流程')}</div>
            </div>
          )}
          {list.map(item => this.renderListItem(item))}
        </ScrollView>
      </Fragment>
    );
  }

  /**
   * 渲染列表项
   */
  renderListItem(item) {
    const { type, selectFlowId, appDetail, sortType } = this.state;
    const ICON = {
      timer: 'icon-access_alarm',
      User: 'icon-hr_structure',
      ExternalUser: 'icon-language',
    };

    return (
      <Fragment key={item.groupId}>
        {!_.includes([FLOW_TYPE.WEBHOOK, FLOW_TYPE.CHATBOT], type) &&
          !_.includes(['createdDate', 'lastModifiedDate'], sortType) && (
            <div className="manageListName flexRow">
              {type !== FLOW_TYPE.OTHER_APP && item.groupId !== 'otherSubProcess' && (
                <Fragment>
                  {item.iconUrl ? (
                    <SvgIcon
                      url={item.iconUrl}
                      fill="var(--color-text-secondary)"
                      size={20}
                      addClassName="mTop2 mRight5"
                    />
                  ) : (
                    <i className={cx('textSecondary Font20 mRight5', ICON[item.groupId] || 'icon-worksheet')} />
                  )}
                </Fragment>
              )}
              {item.groupId === 'timer'
                ? _l('定时触发')
                : item.groupId === 'User'
                  ? _l('组织人员事件触发')
                  : item.groupId === 'ExternalUser'
                    ? _l('外部用户事件触发')
                    : item.groupName}
            </div>
          )}

        {item.processList.map(data => (
          <div
            key={data.id}
            ref={data.id === this.state.focusId ? element => (this.focusedWorkflowElement = element) : null}
            className={cx('flexRow manageList', { active: selectFlowId === data.id })}
          >
            <div
              className={cx('iconWrap mLeft10', { unable: !data.enabled })}
              style={{
                backgroundColor: (
                  START_APP_TYPE[
                    data.child ? 'subprocess' : data.moduleType === 1 ? 'ai_actions' : data.startAppType
                  ] || {}
                ).iconColor,
              }}
            >
              <Icon
                icon={
                  (
                    START_APP_TYPE[
                      data.child ? 'subprocess' : data.moduleType === 1 ? 'ai_actions' : data.startAppType
                    ] || {}
                  ).iconName
                }
              />
            </div>
            <div className="flex name mLeft10 mRight20">
              <ListName item={data} returnQuery={this.getWorkflowListReturnQuery(data.id)} />
            </div>
            <div className="w180 pRight20 breakAll">{getActionTypeContent(this.state.type, data)}</div>
            <div className="w270 pRight20">{this.column3Content(data)}</div>
            <div className="w120 textSecondary flexRow">
              <UserHead
                projectId={appDetail.projectId}
                size={28}
                user={{ userHead: data.ownerAccount.avatar, accountId: data.ownerAccount.accountId }}
              />
              <div className="mLeft12 ellipsis flex mRight20">{data.ownerAccount.fullName}</div>
            </div>
            <div className="w20 mRight20 TxtCenter relative">
              <Dropdown
                trigger={['click']}
                open={selectFlowId === data.id}
                onOpenChange={open => this.setState({ selectFlowId: open ? data.id : '' })}
                placement="bottomRight"
                menu={{
                  style: WORKFLOW_MENU_STYLE,
                  items: this.getMoreOptionItems(data),
                  onClick: () => this.setState({ selectFlowId: '' }),
                }}
              >
                <Icon type="more_horiz" className="textSecondary hoverColorPrimary pointer Font16 listBtn" />
              </Dropdown>
            </div>
          </div>
        ))}
      </Fragment>
    );
  }

  /**
   * 列3内容
   */
  column3Content(item) {
    const { type, list, displayType } = this.state;
    let text;

    if (type !== FLOW_TYPE.OTHER_APP) {
      return (
        <PublishBtn
          disabled={type === FLOW_TYPE.APPROVAL || item.startAppType === APP_TYPE.APPROVAL_START}
          list={list}
          item={item}
          showTime={true}
          showCreateTime={displayType === 'createdDate'}
          updateSource={list => this.setState({ list })}
        />
      );
    }

    return (
      <div className="twoRowsContent">
        {item.flowNodeActionDtos
          .map(o => {
            if (o.typeId === 3) {
              text = _l('填写节点');
            } else {
              switch (o.actionId) {
                case '1':
                  text = _l('新增记录');
                  break;
                case '2':
                  text = _l('更新记录');
                  break;
                case '3':
                  text = _l('删除记录');
                  break;
                case '21':
                  text = _l('批量新增记录');
                  break;
              }
            }

            return text + (o.count > 1 ? `(${o.count})` : '');
          })
          .join('，')}
      </div>
    );
  }

  /**
   * 更多操作
   */
  getMoreOptionItems(data) {
    const type = String(data.processListType);
    const canCopy = !_.includes(
      [
        FLOW_TYPE.OTHER_APP,
        FLOW_TYPE.APPROVAL,
        FLOW_TYPE.CUSTOM_ACTION,
        FLOW_TYPE.EVENT_PUSH,
        FLOW_TYPE.LOOP,
        FLOW_TYPE.CHATBOT,
        FLOW_TYPE.AI_ACTIONS,
      ],
      type,
    );
    const canConvert =
      _.includes([FLOW_TYPE.APP, FLOW_TYPE.CUSTOM_ACTION], type) ||
      (type === FLOW_TYPE.TIME && data.appId !== 'timer') ||
      (type === FLOW_TYPE.SUB_PROCESS && data.appId === 'otherSubProcess');
    const canMove =
      _.includes([APP_TYPE.LOOP, APP_TYPE.WEBHOOK, APP_TYPE.PBC, APP_TYPE.USER], data.startAppType) &&
      type !== FLOW_TYPE.SUB_PROCESS;
    const canDelete = !_.includes(
      [FLOW_TYPE.OTHER_APP, FLOW_TYPE.CUSTOM_ACTION, FLOW_TYPE.CHATBOT, FLOW_TYPE.AI_ACTIONS],
      type,
    );

    return [
      {
        key: 'rename',
        icon: <i className="icon-edit Font16" />,
        label: _l('重命名'),
        onClick: () => this.openRenameDialog(data),
      },
      {
        key: 'history',
        label: (
          <MdLink to={`/workflowedit/${data.id}/2`}>
            <span className="icon-restore2 textSecondary Font16 mRight10" />
            {_l('历史')}
          </MdLink>
        ),
      },
      canCopy && {
        key: 'copy',
        label: (
          <CopyFlowBtn
            item={data}
            updateList={() => {
              this.getList(this.state.type);
              this.getCount();
            }}
          />
        ),
      },
      canConvert && {
        key: 'convert',
        label: (
          <CopyFlowBtn
            item={data}
            isConvertSubProcess={
              _.includes([FLOW_TYPE.APP, FLOW_TYPE.CUSTOM_ACTION], type) ||
              (type === FLOW_TYPE.TIME && data.appId !== 'timer')
            }
            isConvertPBP={type === FLOW_TYPE.SUB_PROCESS && data.appId === 'otherSubProcess'}
            updateList={() => {
              this.getList(this.state.type);
              this.getCount();
            }}
          />
        ),
      },
      canMove && {
        key: 'move',
        icon: <i className="icon-swap_horiz Font16" />,
        label: _l('移至其他应用'),
        onClick: () => this.setState({ selectItem: data }),
      },
      canDelete && {
        key: 'delete',
        danger: true,
        icon: <i className="icon-trash Font16" />,
        label: _l('删除'),
        onClick: () => this.deleteFlow(data),
      },
    ].filter(Boolean);
  }

  /**
   * 重命名工作流
   */
  openRenameDialog = item => {
    this.setState({ renameItem: item, renameName: item.name });
  };

  renameWorkflow = () => {
    const { appDetail, renameItem, renameName } = this.state;
    const name = renameName.trim();

    if (this.renameRequestPending || !renameItem) return;

    if (!name) {
      alert(_l('请输入工作流名称'), 2);
      this.renameInput?.focus();
      return;
    }

    this.renameRequestPending = true;
    this.setState({ renamePending: true });

    return processAjax
      .updateProcess({
        companyId: renameItem.companyId || appDetail.projectId,
        processId: renameItem.id,
        name,
      })
      .then(() => {
        this.setState(state => ({
          list: state.list.map(group => ({
            ...group,
            processList: group.processList.map(item => (item.id === renameItem.id ? { ...item, name } : item)),
          })),
          renameItem: null,
          renameName: '',
        }));
      })
      .finally(() => {
        this.renameRequestPending = false;
        this.setState({ renamePending: false });
      });
  };

  /**
   * 创建封装业务流程
   */
  createFlow = appId => {
    this.requestPending = true;

    processAjax
      .addProcess({
        companyId: '',
        relationId: appId,
        relationType: RELATION_TYPE.APP,
        startEventAppType: 17,
        name: _l('未命名业务流程'),
      })
      .then(res => {
        appManagementAjax.addWorkflow({ projectId: res.companyId, name: _l('未命名业务流程') });
        navigateTo(`/workflowedit/${res.id}`);
      })
      .finally(() => {
        this.requestPending = false;
      });
  };

  /**
   * 删除工作流
   */
  deleteFlow = item => {
    Modal.confirm({
      title: <span className="textError">{_l('删除工作流“%0”', item.name)}</span>,
      content: _l('工作流将被删除，请确认执行此操作'),
      okText: _l('删除'),
      okButtonProps: {
        danger: true,
      },
      onOk: () =>
        processAjax.deleteProcess({ processId: item.id }).then(res => {
          if (res) {
            this.deleteOrMoveProcessHandle(item.id);
          }
        }),
    });
  };

  /**
   * 删除或移动流程后续处理
   */
  deleteOrMoveProcessHandle(id) {
    const { list } = this.state;
    const newList = [].concat(list).map(o => {
      _.remove(o.processList, obj => obj.id === id);
      return o;
    });

    this.getCount();
    this.setState({ list: newList });
  }

  /**
   * 恢复流程后续处理
   */
  replyProcessHandle(type) {
    let count = _.cloneDeep(this.state.count);
    count[type] = count[type] + 1;
    this.setState({ count });
  }

  /**
   * 渲染筛选器
   */
  renderFilter() {
    const {
      type,
      list,
      groupFilter,
      userFilter,
      statusFilter,
      dateFilter,
      displayType,
      rangeDate,
      keywords,
      showDateRangePicker,
    } = this.state;
    let CREATE_FILTER_LIST = [];

    list.forEach(item => {
      CREATE_FILTER_LIST = CREATE_FILTER_LIST.concat(
        item.processList.map(o => {
          return { label: o.ownerAccount.fullName, value: o.ownerAccount.accountId };
        }),
      );
    });

    CREATE_FILTER_LIST = _.uniqBy(CREATE_FILTER_LIST, 'value');

    // 是否包含我自己
    if (CREATE_FILTER_LIST.find(o => o.value === md.global.Account.accountId)) {
      _.remove(CREATE_FILTER_LIST, o => o.value === md.global.Account.accountId);
      CREATE_FILTER_LIST = [{ label: _l('我自己'), value: md.global.Account.accountId }].concat(CREATE_FILTER_LIST);
    }

    const hasCompleteRangeDate = isCompleteDateRange(rangeDate);
    const rangeDateText =
      dateFilter === 8 && hasCompleteRangeDate
        ? _l('%0 至 %1', rangeDate[0].format('YYYY-MM-DD HH:mm'), rangeDate[1].format('YYYY-MM-DD HH:mm'))
        : '';

    return (
      <div className="manageListSearch flexRow">
        {!_.includes([FLOW_TYPE.WEBHOOK, FLOW_TYPE.PBC, FLOW_TYPE.CHATBOT], type) && (
          <Select
            allowClear
            className="w180 mRight10"
            options={(list || []).map(item => {
              return { label: item.groupName, value: item.groupId };
            })}
            value={groupFilter || undefined}
            placeholder={type === FLOW_TYPE.OTHER_APP ? _l('全部应用') : _l('全部')}
            showSearch
            optionFilterProp="label"
            onChange={groupFilter => {
              this.clearUrlWorksheetId();
              this.setState({ groupFilter: groupFilter || '' });
            }}
          />
        )}

        <Select
          allowClear
          className="w180 mRight10"
          options={[
            { label: _l('开启'), value: true },
            { label: _l('关闭'), value: false },
          ]}
          value={statusFilter === '' ? undefined : statusFilter}
          placeholder={_l('状态')}
          onChange={statusFilter => this.setState({ statusFilter: statusFilter ?? '' })}
        />

        <Select
          allowClear
          className="w180 mRight10"
          options={CREATE_FILTER_LIST}
          value={userFilter || undefined}
          placeholder={_l('拥有者')}
          showSearch
          optionFilterProp="label"
          onChange={userFilter => this.setState({ userFilter: userFilter || '' })}
        />

        <div className="w180 mRight10 Relative">
          {showDateRangePicker && (
            <DatePicker.RangePicker
              allowClear={false}
              format="YYYY-MM-DD HH:mm"
              open
              showTime={{ format: 'HH:mm' }}
              style={RANGE_PICKER_TRIGGER_STYLE}
              onOk={rangeDate => {
                if (isCompleteDateRange(rangeDate)) {
                  this.setState({ dateFilter: 8, rangeDate, showDateRangePicker: false });
                }
              }}
              onOpenChange={open => {
                if (!open) {
                  this.setState(prevState => {
                    const hasCompleteRangeDate = isCompleteDateRange(prevState.rangeDate);

                    return {
                      dateFilter: hasCompleteRangeDate ? 8 : '',
                      rangeDate: hasCompleteRangeDate ? prevState.rangeDate : [],
                      showDateRangePicker: false,
                    };
                  });
                }
              }}
            />
          )}

          <Tooltip placement="bottomLeft" title={rangeDateText}>
            <Select
              allowClear
              className="w100"
              options={DATE_SCOPE}
              value={dateFilter === 8 ? -1 : dateFilter || undefined}
              placeholder={displayType === 'createdDate' ? _l('创建时间') : _l('更新时间')}
              labelRender={dateFilter === 8 ? () => <span>{_l('自定义日期')}</span> : null}
              onChange={dateFilter => {
                const nextDateFilter = dateFilter || '';

                this.setState({
                  dateFilter: nextDateFilter,
                  rangeDate: nextDateFilter === 8 && hasCompleteRangeDate ? rangeDate : [],
                  showDateRangePicker: nextDateFilter === 8,
                });
              }}
            />
          </Tooltip>
        </div>

        <div className="flex" />
        <Search
          value={keywords}
          placeholder={_l('搜索流程名称')}
          handleChange={keywords => this.setState({ keywords: keywords.trim() })}
        />
      </div>
    );
  }

  /**
   * 渲染空状态
   */
  renderEmptyContent() {
    const { type, appDetail } = this.state;

    if (!type) {
      return (
        <div className="flowEmptyWrap flexColumn">
          <div className="flowEmptyPicBig" />
          <div className="Font16 bold mTop25">{_l('将日常工作与业务流程自动化运行，替代手工操作')}</div>
          <CreateBtnBig className="flexRow mTop25">
            <Button
              type="primary"
              shape="round"
              className="workflowCreate"
              style={{ backgroundColor: appDetail.iconColor }}
              onClick={() => this.setState({ isCreate: true })}
            >
              {_l('创建工作流')}
            </Button>
            <Support
              className="pointer textSecondary flowSupport"
              href="https://help.mingdao.com/workflow/create"
              type={3}
              text={_l('了解更多')}
            />
          </CreateBtnBig>
          <div className="flowEmptyWrapDesc">
            <div>{_l('场景举例：')}</div>
            <div className="mTop5">
              <span className="mRight5">•</span>
              {_l('当有新订单时，通知领导进行查看与审批确认')}
            </div>
            <div className="mTop5">
              <span className="mRight5">•</span>
              {_l('当新成交的客户生日时，当天九点自动给客户发送祝福短信')}
            </div>
            <div className="mTop5">
              <span className="mRight5">•</span>
              {_l('当晚上八点时，自动将当日订单数据进行汇总，并生成报告发送邮件给领导查看')}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flowEmptyWrap flexColumn">
        <div className={cx('flowEmptyPic', `flowEmptyPic-${FLOW_TYPE_NULL[type].icon}`)} />
        <div className="textSecondary Font17 mTop20">{FLOW_TYPE_NULL[type].text}</div>
      </div>
    );
  }

  /**
   * 清理表筛选url参数
   */
  clearUrlWorksheetId = () => {
    const worksheetId = _.get(this.props, 'match.params.worksheetId');

    if (worksheetId) {
      history.replaceState(null, '', location.href.replace(`/${worksheetId}`, ''));
    }
  };

  render() {
    const { appId } = this.props.match.params;
    const { type, loading, list, selectItem, renameItem, renameName, renamePending, appDetail, showTrash } = this.state;

    return (
      <WaterMark projectId={appDetail.projectId}>
        <DocumentTitle title={`${appDetail.name ? appDetail.name + ' - ' : ''}${_l('工作流')}`} />

        <div className="flexColumn h100">
          {this.renderHeader()}

          <div className="workflowList flexRow workflowListShadow flex">
            {this.renderNavigation()}

            <div className="manageListContainer flex">
              <div className="manageListBox">
                <div className="manageListBoxContent flexColumn">
                  {loading ? (
                    <LoadDiv className="mTop10" />
                  ) : !list.length ? (
                    this.renderEmptyContent()
                  ) : (
                    <Fragment>
                      {this.renderFilter()}
                      {this.renderContent()}
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectItem && (
          <SelectOtherWorksheetDialog
            projectId={appDetail.projectId}
            visible
            onlyApp
            title={_l('移动工作流“%0”至其他应用', selectItem.name)}
            onOk={selectedAppId => {
              const isCurrentApp = selectedAppId === appId;

              if (isCurrentApp) {
                alert(_l('请选择一个其他应用', 3));
              } else {
                processAjax.move({ relationId: selectedAppId, processId: selectItem.id }).then(result => {
                  if (result) {
                    this.deleteOrMoveProcessHandle(selectItem.id);
                  }
                });
              }
            }}
            onHide={() => this.setState({ selectItem: '' })}
          />
        )}

        {showTrash && (
          <TrashDialog
            projectId={appDetail.projectId}
            appId={appId}
            onCancel={() => this.setState({ showTrash: false })}
            onChange={processListType => {
              this.getList(type);
              this.replyProcessHandle(processListType);
            }}
          />
        )}

        <Modal
          centered
          width={520}
          title={_l('重命名')}
          open={!!renameItem}
          maskClosable={false}
          okText={_l('确定')}
          cancelText={_l('取消')}
          confirmLoading={renamePending}
          okButtonProps={{ disabled: !renameName.trim() }}
          cancelButtonProps={{ disabled: renamePending }}
          onOk={this.renameWorkflow}
          onCancel={() => !renamePending && this.setState({ renameItem: null, renameName: '' })}
        >
          <Input
            ref={input => (this.renameInput = input)}
            autoFocus
            maxLength={30}
            value={renameName}
            onChange={event => this.setState({ renameName: event.target.value })}
            onPressEnter={() => !renamePending && this.renameWorkflow()}
          />
        </Modal>
      </WaterMark>
    );
  }
}

export default ErrorBoundary.wrap(AppWorkflowList);
