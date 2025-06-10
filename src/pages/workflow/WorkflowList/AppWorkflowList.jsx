import React, { Component, Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import qs from 'query-string';
import { navigateTo } from 'router/navigateTo';
import styled from 'styled-components';
import {
  Button,
  Dropdown,
  Icon,
  LoadDiv,
  MdLink,
  Menu,
  MenuItem,
  ScrollView,
  Support,
  SvgIcon,
  Tooltip,
  UpgradeIcon,
  UserHead,
  WaterMark,
} from 'ming-ui';
import DateRangePicker from 'ming-ui/components/NewDateTimePicker/date-time-range';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import processVersion from '../api/processVersion';
import appManagementAjax from 'src/api/appManagement';
import homeApp from 'src/api/homeApp';
import processAjax from 'src/pages/workflow/api/process';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import TrashDialog from 'src/pages/workflow/WorkflowList/components/Trash';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { getAppFeaturesPath, getTranslateInfo, setFavicon } from 'src/utils/app';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import Search from '../components/Search';
import { APP_TYPE } from '../WorkflowSettings/enum';
import CopyFlowBtn from './components/CopyFlowBtn';
import CreateWorkflow from './components/CreateWorkflow';
import DeleteFlowBtn from './components/DeleteFlowBtn';
import ListName from './components/ListName';
import PublishBtn from './components/PublishBtn';
import { DATE_SCOPE, FLOW_TYPE, FLOW_TYPE_NULL, getActionTypeContent, START_APP_TYPE, TYPES } from './utils/index';
import './index.less';

const HeaderWrap = styled.div`
  height: 50px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
  z-index: 15;
  background-color: #fff;
  padding: 0 24px 0 16px;
  .applicationIcon {
    width: 28px;
    height: 28px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: normal;
    margin-left: -3px;
  }
  .Gray_bd {
    &:hover {
      color: #757575 !important;
      .applicationIcon {
        box-shadow: 0 0 20px 20px rgb(0 0 0 / 10%) inset;
      }
    }
  }
  .trash {
    color: #757575;
    .trashIcon {
      color: #757575;
    }
    &:hover {
      color: #2196f3;
      .trashIcon {
        color: #2196f3;
      }
    }
  }
`;

const CreateBtn = styled.div`
  .workflowAdd {
    line-height: 32px !important;
    border-radius: 32px !important;
    padding: 0 16px !important;
    opacity: 0.87;
    font-weight: bold;
    &:hover {
      opacity: 1;
    }
    .icon {
      margin-right: 2px;
    }
  }
`;

const CreateBtnBig = styled.div`
  .workflowCreate,
  .flowSupport {
    line-height: 36px !important;
    border-radius: 36px !important;
    padding: 0 32px !important;
    opacity: 0.87;
    font-weight: bold;
    &:hover {
      opacity: 1;
    }
  }
  .flowSupport {
    line-height: 34px !important;
    background-color: #fff;
    margin-left: 16px;
    border: 1px solid #bdbdbd;
    span {
      margin-left: 0 !important;
      font-size: 13px;
      font-weight: bold;
      color: #151515 !important;
    }
  }
`;

const DropdownBox = styled.div`
  &.active {
    .Dropdown--border {
      border-color: #2196f3 !important;
      background: #e3f2fd;
      .value {
        color: #2196f3;
      }
    }
    &:hover {
      .icon-arrow-down-border {
        visibility: hidden;
      }
      .icon-closeelement-bg-circle {
        display: block;
      }
    }
  }
  .icon-closeelement-bg-circle {
    position: absolute;
    display: none;
    top: 10px;
    right: 6px;
    color: #757575;
    &:hover {
      color: #2196f3;
    }
  }
`;

const ArrowUp = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent #757575 transparent;
  cursor: pointer;
  &:hover,
  &.active {
    border-color: transparent transparent #2196f3 transparent;
  }
`;

const ArrowDown = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: #757575 transparent transparent transparent;
  cursor: pointer;
  margin-top: 2px;
  &:hover,
  &.active {
    border-color: #2196f3 transparent transparent transparent;
  }
`;

@errorBoundary
class AppWorkflowList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      list: [],
      count: {},
      type: this.getQueryStringType(),
      groupFilter: _.get(props, 'match.params.worksheetId') || '',
      userFilter: '',
      statusFilter: '',
      dateFilter: '',
      keywords: '',
      isCreate: false,
      appDetail: {},
      selectFlowId: '',
      selectItem: '',
      showTrash: false,
      isAsc: true,
      displayType: 'lastModifiedDate',
      sortType: '',
      rangeDate: [],
      showDateRangePicker: false,
    };
  }

  ajaxRequest = null;
  requestPending = false;

  componentDidMount() {
    this.getAppDetail();
    this.checkIsAppAdmin();
  }

  componentWillReceiveProps(nextProps, nextState) {
    const type = this.getQueryStringType();

    if (type !== this.state.type) {
      this.setState({
        loading: true,
        type,
        groupFilter: _.get(nextProps, 'match.params.worksheetId') || '',
        userFilter: '',
        statusFilter: '',
        dateFilter: '',
        keywords: '',
        isAsc: true,
        displayType: 'lastModifiedDate',
        sortType: '',
      });
      this.getList(type);
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

    homeApp.getApp({ appId }).then(appDetail => {
      this.setState({ appDetail });
      setFavicon(appDetail.iconUrl, appDetail.iconColor);
    });
  }

  /**
   * 检测是否是应用管理员
   */
  checkIsAppAdmin() {
    const appId = this.props.match.params.appId;

    processVersion.getProcessRole({ relationType: 2, relationId: appId }).then(result => {
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

    if (!type) {
      this.ajaxRequest = processVersion.listAll({
        relationId: this.props.match.params.appId,
      });
    } else {
      this.ajaxRequest = processVersion.list({
        relationId: this.props.match.params.appId,
        processListType: type,
      });
    }

    this.ajaxRequest.then(result => {
      this.ajaxRequest = null;

      result.forEach(list => {
        list.groupName = getTranslateInfo(this.props.match.params.appId, null, list.groupId).name || list.groupName;
      });

      // webhook触发
      if (type === FLOW_TYPE.WEBHOOK) {
        result.forEach(list => {
          list.processList.forEach(item => {
            item.hookUrl = btoa(item.id);
          });
        });
      }

      this.setState({
        loading: false,
        list: result,
      });
    });
  }

  /**
   * 获取计数
   */
  getCount() {
    processVersion
      .count({
        relationId: this.props.match.params.appId,
        relationType: 2,
      })
      .then(result => {
        this.setState({ count: result });
      });
  }

  /**
   * 渲染头部
   */
  renderHeader() {
    const appId = this.props.match.params.appId;
    const { type, appDetail, isCreate } = this.state;

    return (
      <HeaderWrap className="flexRow alignItemsCenter">
        <Tooltip popupPlacement="bottomLeft" text={<span>{_l('应用：%0', appDetail.name)}</span>}>
          <div
            className="flexRow pointer Gray_bd alignItemsCenter"
            onClick={() => {
              window.disabledSideButton = true;

              const storage =
                JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};

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
            }}
          >
            <i className="icon-navigate_before Font20" />
            <div className="applicationIcon" style={{ backgroundColor: appDetail.iconColor }}>
              <SvgIcon url={appDetail.iconUrl} fill="#fff" size={18} />
            </div>
          </div>
        </Tooltip>

        <div className="flex nativeTitle Font17 bold mLeft16">{_l('自动化工作流')}</div>

        <Support
          className="pointer Gray_75 mRight15"
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
              size="small"
              icon="add"
              className="workflowAdd"
              style={{ backgroundColor: appDetail.iconColor }}
              onClick={() => this.setState({ isCreate: true })}
            >
              {_l('新建工作流')}
            </Button>
          ) : (
            <Button
              size="small"
              icon="add"
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

    return (
      <ul className="workflowHeader flexColumn">
        <ScrollView className="pLeft8 pRight8">
          {TYPES.filter(o => o.value !== FLOW_TYPE.EVENT_PUSH || count[o.value]).map(item => (
            <Fragment key={item.value}>
              {item.value === FLOW_TYPE.APP && (
                <div className="bold Font12 Gray_75 mTop15 mBottom15 mLeft16">{_l('触发方式')}</div>
              )}

              {item.value === FLOW_TYPE.LOOP && (
                <div className="bold Font12 Gray_75 mTop15 mBottom15 mLeft16">{_l('调用流程')}</div>
              )}

              <MdLink
                className="NoUnderline"
                to={item.value ? `${linkUrl}${linkUrl.indexOf('?') > -1 ? '&' : '?'}type=${item.value}` : linkUrl}
                key={item.value}
              >
                <li className={cx({ 'active ThemeColor3': type === item.value })}>
                  <i className={cx('Font18', item.icon, type === item.value ? 'ThemeColor3' : 'Gray_75')} />
                  <span className="flex ellipsis mLeft10">{item.text}</span>
                  <span className="Gray_9e mLeft10 Font13">
                    {(item.value ? count[item.value] : _.sum(Object.values(count))) || ''}
                  </span>
                </li>
              </MdLink>

              {item.value === FLOW_TYPE.PBC && (
                <div className="bold Font12 Gray_75 mTop15 mBottom15 mLeft16">{_l('其他')}</div>
              )}
            </Fragment>
          ))}

          {featureType && (
            <li
              onClick={() => {
                if (isFree) {
                  buriedUpgradeVersionDialog(appDetail.projectId, VersionProductType.recycle);
                  return;
                }
                this.setState({ showTrash: true });
              }}
            >
              <i className="Font18 icon-knowledge-recycle Gray_75" />
              <span className="flex ellipsis mLeft10">
                {_l('回收站')}
                {isFree && <UpgradeIcon />}
              </span>
            </li>
          )}
        </ScrollView>
      </ul>
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
                  <Dropdown
                    className="Normal"
                    data={[
                      { text: _l('创建时间'), value: 'createdDate' },
                      { text: _l('更新时间'), value: 'lastModifiedDate' },
                    ]}
                    value={displayType}
                    renderTitle={() => (
                      <span className="Gray_75 bold">
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
        <ScrollView className="flex">
          {!list.length && (
            <div className="flowEmptyWrap flexColumn">
              <div className="flowEmptyPic flowEmptyPic-search" />
              <div className="Gray_75 Font14 mTop20">{_l('没有搜索到流程')}</div>
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
      timer: 'icon-hr_surplus',
      User: 'icon-hr_structure',
      ExternalUser: 'icon-language',
    };

    return (
      <Fragment key={item.groupId}>
        {!_.includes([FLOW_TYPE.WEBHOOK], type) && !_.includes(['createdDate', 'lastModifiedDate'], sortType) && (
          <div className="manageListName flexRow">
            {type !== FLOW_TYPE.OTHER_APP && item.groupId !== 'otherSubProcess' && (
              <Fragment>
                {item.iconUrl ? (
                  <SvgIcon url={item.iconUrl} fill="#757575" size={20} addClassName="mTop2 mRight5" />
                ) : (
                  <i className={cx('Gray_75 Font20 mRight5', ICON[item.groupId] || 'icon-worksheet')} />
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
          <div key={data.id} className={cx('flexRow manageList', { active: selectFlowId === data.id })}>
            <div
              className={cx('iconWrap mLeft10', { unable: !data.enabled })}
              style={{
                backgroundColor: (START_APP_TYPE[data.child ? 'subprocess' : data.startAppType] || {}).iconColor,
              }}
            >
              <Icon icon={(START_APP_TYPE[data.child ? 'subprocess' : data.startAppType] || {}).iconName} />
            </div>
            <div className="flex name mLeft10 mRight20">
              <ListName item={data} type={this.state.type} />
            </div>
            <div className="w180 pRight20">{getActionTypeContent(this.state.type, data)}</div>
            <div className="w270 pRight20">{this.column3Content(data)}</div>
            <div className="w120 Gray_75 flexRow">
              <UserHead
                projectId={appDetail.projectId}
                size={28}
                user={{ userHead: data.ownerAccount.avatar, accountId: data.ownerAccount.accountId }}
              />
              <div className="mLeft12 ellipsis flex mRight20">{data.ownerAccount.fullName}</div>
            </div>
            <div className="w20 mRight20 TxtCenter relative">
              <Icon
                type="more_horiz"
                className="Gray_75 ThemeHoverColor3 pointer Font16 listBtn"
                onClick={() => this.setState({ selectFlowId: data.id })}
              />
              {selectFlowId === data.id && this.renderMoreOptions(data)}
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
          disabled={type === FLOW_TYPE.APPROVAL}
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
  renderMoreOptions(data) {
    const type = String(data.processListType);

    return (
      <Menu
        className="mTop10 TxtLeft workflowListMenu"
        style={{ left: 'inherit', right: 0 }}
        onClickAway={() => this.setState({ selectFlowId: '' })}
      >
        <MenuItem>
          <MdLink to={`/workflowedit/${data.id}/2`}>
            <span className="icon-restore2 Gray_75 Font16 pLeft12 mRight10" />
            {_l('历史')}
          </MdLink>
        </MenuItem>

        {!_.includes(
          [FLOW_TYPE.OTHER_APP, FLOW_TYPE.APPROVAL, FLOW_TYPE.CUSTOM_ACTION, FLOW_TYPE.EVENT_PUSH, FLOW_TYPE.LOOP],
          type,
        ) && (
          <MenuItem>
            <CopyFlowBtn
              item={data}
              updateList={() => {
                this.getList(this.state.type);
                this.getCount();
              }}
            />
          </MenuItem>
        )}

        {(_.includes([FLOW_TYPE.APP, FLOW_TYPE.CUSTOM_ACTION], type) ||
          (type === FLOW_TYPE.TIME && data.appId !== 'timer') ||
          (type === FLOW_TYPE.SUB_PROCESS && data.appId === 'otherSubProcess')) && (
          <MenuItem>
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
          </MenuItem>
        )}

        {_.includes([APP_TYPE.LOOP, APP_TYPE.WEBHOOK, APP_TYPE.PBC, APP_TYPE.USER], data.startAppType) &&
          type !== FLOW_TYPE.SUB_PROCESS && (
            <MenuItem onClick={() => this.setState({ selectItem: data })}>
              <span className="icon-swap_horiz Gray_75 Font16 pLeft12 mRight10" />
              {_l('移至其他应用')}
            </MenuItem>
          )}

        {type === FLOW_TYPE.OTHER_APP ||
        (type === FLOW_TYPE.APPROVAL && data.triggerId) ||
        type === FLOW_TYPE.CUSTOM_ACTION ? null : (
          <MenuItem>
            <DeleteFlowBtn
              item={data}
              callback={id => {
                this.deleteOrMoveProcessHandle(id);
              }}
            />
          </MenuItem>
        )}
      </Menu>
    );
  }

  /**
   * 创建封装业务流程
   */
  createFlow = appId => {
    this.requestPending = true;

    processAjax
      .addProcess({
        companyId: '',
        relationId: appId,
        relationType: 2,
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
      showDateRangePicker,
    } = this.state;
    let CREATE_FILTER_LIST = [];

    list.forEach(item => {
      CREATE_FILTER_LIST = CREATE_FILTER_LIST.concat(
        item.processList.map(o => {
          return { text: o.ownerAccount.fullName, value: o.ownerAccount.accountId };
        }),
      );
    });

    CREATE_FILTER_LIST = _.uniqBy(CREATE_FILTER_LIST, 'value');

    // 是否包含我自己
    if (CREATE_FILTER_LIST.find(o => o.value === md.global.Account.accountId)) {
      _.remove(CREATE_FILTER_LIST, o => o.value === md.global.Account.accountId);
      CREATE_FILTER_LIST = [[{ text: _l('我自己'), value: md.global.Account.accountId }]].concat([CREATE_FILTER_LIST]);
    }

    return (
      <div className="manageListSearch flexRow">
        {!_.includes([FLOW_TYPE.WEBHOOK, FLOW_TYPE.PBC], type) && (
          <DropdownBox className={cx('w180 relative mRight10', { active: groupFilter !== '' })}>
            <Dropdown
              className="w100"
              data={(list || []).map(item => {
                return { text: item.groupName, value: item.groupId };
              })}
              value={groupFilter}
              placeholder={type === FLOW_TYPE.OTHER_APP ? _l('全部应用') : _l('全部')}
              openSearch
              border
              onChange={groupFilter => {
                this.clearUrlWorksheetId();
                this.setState({ groupFilter });
              }}
            />
            <Icon
              icon="closeelement-bg-circle"
              className="Font16 pointer"
              onClick={() => {
                this.clearUrlWorksheetId();
                this.setState({ groupFilter: '' });
              }}
            />
          </DropdownBox>
        )}

        <DropdownBox className={cx('w180 relative mRight10', { active: statusFilter !== '' })}>
          <Dropdown
            className="w100"
            data={[
              { text: _l('开启'), value: true },
              { text: _l('关闭'), value: false },
            ]}
            value={statusFilter}
            placeholder={_l('状态')}
            border
            onChange={statusFilter => this.setState({ statusFilter })}
          />
          <Icon
            icon="closeelement-bg-circle"
            className="Font16 pointer"
            onClick={() => this.setState({ statusFilter: '' })}
          />
        </DropdownBox>

        <DropdownBox
          className={cx('w180 relative', { active: userFilter !== '' }, showDateRangePicker ? 'mRight9' : 'mRight10')}
        >
          <Dropdown
            className="w100"
            data={CREATE_FILTER_LIST}
            value={userFilter}
            placeholder={_l('拥有者')}
            openSearch
            border
            onChange={userFilter => this.setState({ userFilter })}
          />
          <Icon
            icon="closeelement-bg-circle"
            className="Font16 pointer"
            onClick={() => this.setState({ userFilter: '' })}
          />
        </DropdownBox>

        {showDateRangePicker && (
          <DateRangePicker
            mode="date"
            defaultVisible
            timePicker
            selectedValue={
              rangeDate.length
                ? rangeDate
                : [moment(moment().format('YYYY-MM-DD 00:00')), moment(moment().format('YYYY-MM-DD 23:59'))]
            }
            allowClear={false}
            children={<div className="filterTimeRange"></div>}
            onOk={rangeDate => this.setState({ dateFilter: 8, rangeDate, showDateRangePicker: false })}
            onVisibleChange={visible => {
              if (!visible) {
                !rangeDate.length && this.setState({ dateFilter: '' });
                this.setState({ showDateRangePicker: false });
              }
            }}
          />
        )}

        <DropdownBox className={cx('w180 relative mRight10', { active: dateFilter !== '' })}>
          <Dropdown
            className="w100"
            data={DATE_SCOPE}
            value={dateFilter === 8 ? -1 : dateFilter}
            placeholder={displayType === 'createdDate' ? _l('创建时间') : _l('更新时间')}
            border
            renderTitle={
              dateFilter === 8
                ? () => (
                    <Tooltip
                      popupPlacement="bottomLeft"
                      text={
                        !rangeDate.length ? (
                          ''
                        ) : (
                          <span>
                            {_l(
                              '%0 至 %1',
                              rangeDate[0].format('YYYY-MM-DD HH:mm'),
                              rangeDate[1].format('YYYY-MM-DD HH:mm'),
                            )}
                          </span>
                        )
                      }
                    >
                      <span>{_l('自定义日期')}</span>
                    </Tooltip>
                  )
                : null
            }
            onChange={dateFilter =>
              this.setState({
                dateFilter,
                rangeDate: dateFilter === 8 ? rangeDate : [],
                showDateRangePicker: dateFilter === 8,
              })
            }
          />
          <Icon
            icon="closeelement-bg-circle"
            className="Font16 pointer"
            onClick={() => this.setState({ dateFilter: '', rangeDate: [] })}
          />
        </DropdownBox>

        <div className="flex" />
        <Search
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
              size="small"
              className="workflowCreate"
              style={{ backgroundColor: appDetail.iconColor }}
              onClick={() => this.setState({ isCreate: true })}
            >
              {_l('创建工作流')}
            </Button>
            <Support
              className="pointer Gray_75 flowSupport"
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
        <div className="Gray_75 Font14 mTop20">{FLOW_TYPE_NULL[type].text}</div>
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
    const { type, loading, list, selectItem, appDetail, showTrash } = this.state;

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
      </WaterMark>
    );
  }
}

export default AppWorkflowList;
