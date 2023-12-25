import React, { Component, Fragment } from 'react';
import './index.less';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import processVersion from '../api/processVersion';
import { Icon, Dropdown, ScrollView, LoadDiv, Support, Button, Tooltip, Menu, MenuItem, WaterMark } from 'ming-ui';
import qs from 'query-string';
import { Link } from 'react-router-dom';
import { navigateTo } from 'router/navigateTo';
import cx from 'classnames';
import Search from '../components/Search';
import UserHead from 'src/components/userHead/userHead';
import { APP_TYPE } from '../WorkflowSettings/enum';
import PublishBtn from './components/PublishBtn';
import DeleteFlowBtn from './components/DeleteFlowBtn';
import CopyFlowBtn from './components/CopyFlowBtn';
import ListName from './components/ListName';
import { FLOW_TYPE, TYPES, FLOW_TYPE_NULL, START_APP_TYPE, getActionTypeContent, DATE_SCOPE } from './utils/index';
import SvgIcon from 'src/components/SvgIcon';
import CreateWorkflow from './components/CreateWorkflow';
import styled from 'styled-components';
import DocumentTitle from 'react-document-title';
import homeApp from 'src/api/homeApp';
import processAjax from 'src/pages/workflow/api/process';
import appManagementAjax from 'src/api/appManagement';
import _ from 'lodash';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { getFeatureStatus, buriedUpgradeVersionDialog, setFavicon } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import TrashDialog from 'src/pages/workflow/WorkflowList/components/Trash';
import { Base64 } from 'js-base64';
import moment from 'moment';
import DateRangePicker from 'ming-ui/components/NewDateTimePicker/date-time-range';

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
      color: #9e9e9e !important;
      .applicationIcon {
        box-shadow: 0 0 20px 20px rgb(0 0 0 / 10%) inset;
      }
    }
  }
  .trash {
    color: #757575;
    .trashIcon {
      color: #9e9e9e;
    }
    .freeIcon {
      color: #f1b73f;
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
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
`;

const ArrowUp = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent #9e9e9e transparent;
  cursor: pointer;
  &:hover,
  &.active {
    border-color: transparent transparent #2196f3 transparent;
  }
`;

const ArrowDown = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: #9e9e9e transparent transparent transparent;
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
      groupFilter: '',
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
        groupFilter: '',
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
    const { type = FLOW_TYPE.APP } = qs.parse(queryString);

    return type;
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

    this.ajaxRequest = processVersion.list({
      relationId: this.props.match.params.appId,
      processListType: type,
    });

    this.ajaxRequest.then(result => {
      this.ajaxRequest = null;

      // webhook触发
      if (type === FLOW_TYPE.OTHER) {
        result.forEach(list => {
          list.processList.forEach(item => {
            item.hookUrl = Base64.toBase64(item.id);
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

    const isFree =
      _.get(
        _.find(md.global.Account.projects, item => item.projectId === appDetail.projectId),
        'licenseType',
      ) === 0;
    const featureType = getFeatureStatus(appDetail.projectId, VersionProductType.recycle);
    return (
      <HeaderWrap className="flexRow alignItemsCenter">
        <DocumentTitle title={`${appDetail.name ? appDetail.name + ' - ' : ''}${_l('工作流')}`} />

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
        {featureType && (
          <div
            className="trash mRight20 ThemeHoverColor3 flexRow"
            onClick={() => {
              if (isFree) {
                buriedUpgradeVersionDialog(appDetail.projectId, VersionProductType.recycle);
                return;
              }
              this.setState({
                showTrash: true,
              });
            }}
          >
            <Icon icon="knowledge-recycle" className="trashIcon Hand Font18" />
            <div className="recycle InlineBlock Hand mLeft5">{_l('回收站')}</div>
            {isFree && <Icon icon="auto_awesome" className="freeIcon mLeft8" />}
          </div>
        )}
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
    const { url } = this.props.match;
    const { type, count } = this.state;

    return (
      <ul className="workflowHeader flexColumn">
        {TYPES.map(item => (
          <Fragment>
            {item.value === FLOW_TYPE.PBC && <div className="workflowHeaderLine" />}
            <Link className="NoUnderline" to={`${url}?type=${item.value}`} key={item.value}>
              <li className={cx({ 'active ThemeColor3': type === item.value })}>
                {type === item.value && <span className="activeLine" />}
                <i className={cx('Font18', item.icon, type === item.value ? 'ThemeColor3' : 'Gray_9e')} />
                <span className="flex ellipsis mLeft10">{item.text}</span>
                {item.value === FLOW_TYPE.PBC && (
                  <Support
                    className="pointer Gray_9e mLeft2"
                    href="https://help.mingdao.com/flow_pbp"
                    type={1}
                    text={_l('帮助')}
                  />
                )}
                <span className="Gray_9e mLeft10 Font13">{count[item.value] || ''}</span>
              </li>
            </Link>
          </Fragment>
        ))}
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

    // 创建人筛选
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
            <div className="flex">{_l('流程名称')}</div>
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
          <div className="w120">{_l('创建人')}</div>
          <div className="w20 mRight20" />
        </div>
        <ScrollView className="flex">
          {!list.length && (
            <div className="flowEmptyWrap flexColumn">
              <div className="flowEmptyPic flowEmptyPic-search" />
              <div className="Gray_9e Font14 mTop20">{_l('没有搜索到流程')}</div>
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
    const { type, selectFlowId } = this.state;
    const ICON = {
      timer: 'icon-hr_surplus',
      User: 'icon-hr_structure',
      ExternalUser: 'icon-language',
    };

    return (
      <Fragment key={item.groupId}>
        {!_.includes([FLOW_TYPE.OTHER], type) && (
          <div className="manageListName flexRow">
            {type !== FLOW_TYPE.OTHER_APP && item.groupId !== 'otherSubProcess' && (
              <Fragment>
                {item.iconUrl ? (
                  <SvgIcon url={item.iconUrl} fill="#9e9e9e" size={20} addClassName="mTop2 mRight5" />
                ) : (
                  <i className={cx('Gray_9e Font20 mRight5', ICON[item.groupId] || 'icon-worksheet')} />
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
                size={28}
                user={{ userHead: data.ownerAccount.avatar, accountId: data.ownerAccount.accountId }}
              />
              <div className="mLeft12 ellipsis flex mRight20">{data.ownerAccount.fullName}</div>
            </div>
            <div className="w20 mRight20 TxtCenter relative">
              <Icon
                type="more_horiz"
                className="Gray_9e ThemeHoverColor3 pointer Font16 listBtn"
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
    const { type } = this.state;

    return (
      <Menu
        className="mTop10 TxtLeft workflowListMenu"
        style={{ left: 'inherit', right: 0 }}
        onClickAway={() => this.setState({ selectFlowId: '' })}
      >
        <MenuItem>
          <Link to={`/workflowedit/${data.id}/2`}>
            <span className="icon-restore2 Gray_9e Font16 pLeft12 mRight10" />
            {_l('历史')}
          </Link>
        </MenuItem>

        {!_.includes([FLOW_TYPE.OTHER_APP, FLOW_TYPE.APPROVAL, FLOW_TYPE.CUSTOM_ACTION], type) && (
          <MenuItem>
            <CopyFlowBtn
              item={data}
              updateList={() => {
                this.getList(type);
                this.getCount();
              }}
            />
          </MenuItem>
        )}

        {_.includes([FLOW_TYPE.APP, FLOW_TYPE.CUSTOM_ACTION], type) && (
          <MenuItem>
            <CopyFlowBtn
              isConvert
              item={data}
              updateList={() => {
                this.getList(type);
                this.getCount();
              }}
            />
          </MenuItem>
        )}

        {_.includes([APP_TYPE.LOOP, APP_TYPE.WEBHOOK, APP_TYPE.PBC, APP_TYPE.USER], data.startAppType) &&
          type !== FLOW_TYPE.SUB_PROCESS && (
            <MenuItem onClick={() => this.setState({ selectItem: data })}>
              <span className="icon-swap_horiz Gray_9e Font16 pLeft12 mRight10" />
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
        appManagementAjax.addWorkflow({ projectId: res.companyId });
        navigateTo(`/workflowedit/${res.id}`);
      })
      .always(() => {
        this.requestPending = false;
      });
  };

  /**
   * 删除或移动流程后续处理
   */
  deleteOrMoveProcessHandle(id) {
    const { type, list } = this.state;
    let count = _.cloneDeep(this.state.count);
    const newList = [].concat(list).map(o => {
      _.remove(o.processList, obj => obj.id === id);
      return o;
    });

    count[type] = count[type] - 1;
    this.setState({ count, list: newList });
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
        {!_.includes([FLOW_TYPE.OTHER, FLOW_TYPE.PBC], type) && (
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
              onChange={groupFilter => this.setState({ groupFilter })}
            />
            <Icon
              icon="closeelement-bg-circle"
              className="Font16 pointer"
              onClick={() => this.setState({ groupFilter: '' })}
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
            placeholder={_l('创建人')}
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

  render() {
    const { appId } = this.props.match.params;
    const { type, loading, list, selectItem, appDetail, showTrash } = this.state;

    return (
      <WaterMark projectId={appDetail.projectId}>
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
                    <div className="flowEmptyWrap flexColumn">
                      <div className={cx('flowEmptyPic', `flowEmptyPic-${(FLOW_TYPE_NULL[type] || {}).icon}`)} />
                      <div className="Gray_9e Font14 mTop20">{FLOW_TYPE_NULL[type].text}</div>
                    </div>
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
            appId={appId}
            onCancel={() => {
              this.setState({
                showTrash: false,
              });
            }}
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
