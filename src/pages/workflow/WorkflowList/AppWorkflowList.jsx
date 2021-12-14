import React, { Component, Fragment } from 'react';
import './index.less';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import processVersion from '../api/processVersion';
import { Button, Icon, Dropdown, ScrollView, LoadDiv } from 'ming-ui';
import qs from 'querystring';
import { Link } from 'react-router-dom';
import { navigateTo } from 'router/navigateTo';
import cx from 'classnames';
import Search from '../components/Search';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import { DATE_TYPE, EXEC_TIME_TYPE, TIME_TYPE_NAME } from '../WorkflowSettings/enum';
import PublishBtn from './components/PublishBtn';
import DeleteFlowBtn from './components/DeleteFlowBtn';
import CopyFlowBtn from './components/CopyFlowBtn';
import CreateWorkflow from './components/CreateWorkflow';
import ListName from './components/ListName';
import { FLOW_TYPE, FLOW_TYPE_NULL, START_APP_TYPE } from './config/index';
import { connect } from 'react-redux';
import SvgIcon from 'src/components/SvgIcon';
import DocumentTitle from 'react-document-title';
import HomeAjax from 'src/api/homeApp';

@errorBoundary
class AppWorkflowList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      list: [],
      count: {},
      type: this.getQueryStringType(),
      selectFilter: '',
      keywords: '',
      createWorkflowVisible: false,
      appDetail: {},
    };
  }

  ajaxRequest = null;

  componentDidMount() {
    this.checkIsAppAdmin();
  }

  componentWillReceiveProps(nextProps, nextState) {
    const type = this.getQueryStringType();

    if (type !== this.state.type) {
      this.setState({ loading: true, type, selectFilter: '', keywords: '' });
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
   * 检测是否是应用管理员
   */
  checkIsAppAdmin() {
    const appId = this.props.match.params.appId;

    processVersion.getProcessRole({ relationType: 2, relationId: appId }).then(result => {
      if (result) {
        this.getList(this.state.type);
        this.getCount();
        this.getAppDetail();
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
   * 获取应用详情
   */
  getAppDetail() {
    const appId = this.props.match.params.appId;

    HomeAjax.getAppDetail({
      appId,
    }).then(res => {
      this.setState({ appDetail: res });
    });
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { type, selectFilter, keywords } = this.state;
    let { list } = _.cloneDeep(this.state);

    // 分组筛选
    if (selectFilter !== '') {
      list = list.filter(o => o.groupId === selectFilter);
    }

    // 按名称搜索
    if (keywords) {
      list = list.map(item => {
        item.processList = item.processList.filter(flow =>
          _.includes(flow.name.toLocaleLowerCase(), keywords.toLocaleLowerCase()),
        );
        return item;
      });
    }

    _.remove(list, o => !o.processList.length);

    return (
      <Fragment>
        <div className="flexRow manageList manageListHeader bold">
          <div className="flex mLeft10">{_l('流程名称')}</div>
          <div className="w240">
            {type === FLOW_TYPE.OTHER_APP
              ? _l('修改工作表')
              : type === FLOW_TYPE.CUSTOM_ACTION
              ? _l('按钮名称')
              : _l('触发')}
          </div>
          <div className="w270">{type === FLOW_TYPE.OTHER_APP ? _l('执行动作') : _l('状态')}</div>
          <div className="w150">{_l('创建者')}</div>
          {type !== FLOW_TYPE.CUSTOM_ACTION && (
            <Fragment>
              <div className="w20 mRight20" />
              <div className="w20 mRight20" />
              <div className="w20 mRight20" />
            </Fragment>
          )}
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
    const { type, list } = this.state;

    return (
      <Fragment key={item.groupId}>
        {!_.includes([FLOW_TYPE.OTHER, FLOW_TYPE.USER], type) && (
          <div className="manageListName flexRow">
            {type !== FLOW_TYPE.OTHER_APP && item.groupId !== 'otherSubProcess' && (
              <Fragment>
                {item.iconUrl ? (
                  <SvgIcon url={item.iconUrl} fill="#9e9e9e" size={20} addClassName="mTop2 mRight5" />
                ) : (
                  <i
                    className={cx(
                      'Gray_9e Font20 mRight5',
                      item.groupId === 'timer' ? 'icon-hr_surplus' : 'icon-worksheet',
                    )}
                  />
                )}
              </Fragment>
            )}
            {item.groupName}
          </div>
        )}

        {item.processList.map(data => (
          <div key={data.id} className="flexRow manageList">
            <div
              className={cx('iconWrap mLeft10', { unable: !data.enabled })}
              style={{ backgroundColor: START_APP_TYPE[data.child ? 'subprocess' : data.startAppType].iconColor }}
            >
              <Icon icon={START_APP_TYPE[data.child ? 'subprocess' : data.startAppType].iconName} />
            </div>
            <div className="flex name mLeft10 mRight40">
              <ListName item={data} />
            </div>
            <div className="w240 pRight20">{this.column2Content(data)}</div>
            <div className="w270 pRight20">{this.column3Content(data)}</div>
            <div className="w150 Gray_75 flexRow">
              <UserHead
                size={28}
                user={{ userHead: data.ownerAccount.avatar, accountId: data.ownerAccount.accountId }}
              />
              <div className="mLeft12 ellipsis flex mRight20">{data.ownerAccount.fullName}</div>
            </div>
            {type !== FLOW_TYPE.CUSTOM_ACTION && (
              <Fragment>
                <Link to={`/workflowedit/${data.id}/2`} className="w20 mRight20 TxtCenter">
                  <span data-tip={_l('历史')}>
                    <Icon icon="restore2" className="listBtn ThemeHoverColor3 Gray_9e" />
                  </span>
                </Link>
                <div className="w20 mRight20 TxtCenter">
                  {type !== FLOW_TYPE.OTHER_APP && <CopyFlowBtn item={data} updateList={() => this.getList(type)} />}
                </div>
                <div className="w20 mRight20 TxtCenter">
                  {type !== FLOW_TYPE.OTHER_APP && (
                    <DeleteFlowBtn
                      item={data}
                      callback={id => {
                        let count = _.cloneDeep(this.state.count);
                        const newList = [].concat(list).map(o => {
                          _.remove(o.processList, obj => obj.id === id);
                          return o;
                        });

                        count[type] = count[type] - 1;
                        this.setState({ count, list: newList });
                      }}
                    />
                  )}
                </div>
              </Fragment>
            )}
          </div>
        ))}
      </Fragment>
    );
  }

  /**
   * 列2内容
   */
  column2Content(item) {
    const { type } = this.state;
    const days = [_l('星期日'), _l('星期一'), _l('星期二'), _l('星期三'), _l('星期四'), _l('星期五'), _l('星期六')];
    const triggerText = {
      1: _l('仅新增记录时'),
      2: _l('当新增或更新记录时'),
      3: _l('当删除记录时'),
      4: _l('当更新记录时'),
    };
    const userTriggerText = {
      20: {
        1: _l('当新人入职时'),
        3: _l('当人员离职时'),
      },
      21: {
        1: _l('当创建部门时'),
        3: _l('当解散部门时'),
      },
    };

    // 工作表触发
    if (type === FLOW_TYPE.APP) {
      return triggerText[item.triggerId];
    }

    // 时间触发
    if (type === FLOW_TYPE.TIME) {
      // 循环
      if (item.startAppType === 5) {
        return (
          <div className="twoRowsContent">
            {_l('%0 开始', moment(item.executeTime).format('YYYY-MM-DD HH:mm'))}

            {item.frequency === DATE_TYPE.DAY &&
              _l('每%0天 %1', item.interval > 1 ? ` ${item.interval} ` : '', moment(item.executeTime).format('HH:mm'))}

            {item.frequency === DATE_TYPE.WEEK &&
              _l(
                '每%0周(%1) %2',
                item.interval > 1 ? ` ${item.interval} ` : '',
                item.weekDays
                  .sort((a, b) => a - b)
                  .map(o => days[o])
                  .join('、'),
                moment(item.executeTime).format('HH:mm'),
              )}

            {item.frequency === DATE_TYPE.MONTH &&
              _l(
                '每%0个月在第 %1 天 %2',
                item.interval > 1 ? ` ${item.interval} ` : '',
                moment(item.executeTime).format('DD'),
                moment(item.executeTime).format('HH:mm'),
              )}

            {item.frequency === DATE_TYPE.YEAR &&
              _l(
                '每%0年在 %1',
                item.interval > 1 ? ` ${item.interval} ` : '',
                moment(item.executeTime).format('MMMDo HH:mm'),
              )}
          </div>
        );
      }

      // 日期触发
      return (
        <Fragment>
          <span>{item.assignFieldName || _l('字段不存在')}</span>
          {!!item.number && (
            <span className="mLeft5">
              {item.executeTimeType === EXEC_TIME_TYPE.BEFORE
                ? _l('之前')
                : item.executeTimeType === EXEC_TIME_TYPE.AFTER
                ? _l('之后')
                : ''}
              {item.executeTimeType !== EXEC_TIME_TYPE.CURRENT && (
                <span>{item.number + TIME_TYPE_NAME[item.unit]}</span>
              )}
            </span>
          )}

          <span className="mLeft5">{item.time}</span>
          {item.assignFieldName && <span className="mLeft5">{_l('执行')}</span>}
        </Fragment>
      );
    }

    // webhook触发
    if (type === FLOW_TYPE.OTHER) {
      return _l('Webhook触发');
    }

    // 自定义动作触发
    if (type === FLOW_TYPE.CUSTOM_ACTION) {
      return item.triggerName;
    }

    // 子流程触发
    if (type === FLOW_TYPE.SUB_PROCESS) {
      return _l('子流程触发');
    }

    // 人员或部门
    if (type === FLOW_TYPE.USER) {
      return userTriggerText[item.startAppType][item.triggerId];
    }

    return item.appNames.join('、');
  }

  /**
   * 列3内容
   */
  column3Content(item) {
    const { type, list } = this.state;
    let text;

    if (type !== FLOW_TYPE.OTHER_APP) {
      return <PublishBtn list={list} item={item} showTime={true} updateSource={list => this.setState({ list })} />;
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

  render() {
    const { url, params } = this.props.match;
    const { type, loading, list, selectFilter, createWorkflowVisible, count, appDetail } = this.state;
    const filterList = [[{ text: type === FLOW_TYPE.OTHER_APP ? _l('全部应用') : _l('全部'), value: '' }], []];
    const TYPES = [
      { text: _l('工作表事件'), value: FLOW_TYPE.APP, display: true },
      { text: _l('时间'), value: FLOW_TYPE.TIME, display: true },
      { text: _l('人员事件'), value: FLOW_TYPE.USER, display: true },
      { text: _l('Webhook'), value: FLOW_TYPE.OTHER, display: true },
      { text: _l('子流程'), value: FLOW_TYPE.SUB_PROCESS },
      { text: _l('自定义动作'), value: FLOW_TYPE.CUSTOM_ACTION },
      { text: _l('外部流程修改本应用'), value: FLOW_TYPE.OTHER_APP },
    ];

    (list || []).forEach(item => {
      filterList[1].push({ text: item.groupName, value: item.groupId });
    });

    return (
      <div className="workflowList flexColumn">
        <DocumentTitle title={`${appDetail.name || ''} - ${_l('工作流')}`} />
        <div className="workflowHeader flexRow">
          <div className="flex">
            <i
              className="icon-backspace Font20 Gray_9e ThemeHoverColor3 pointer mRight20"
              onClick={() => {
                const storage = JSON.parse(
                  localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${params.appId}`),
                );

                if (storage) {
                  const { lastGroupId, lastWorksheetId, lastViewId } = storage;
                  navigateTo(
                    `/app/${params.appId}/${_.filter([lastGroupId, lastWorksheetId, lastViewId], item => !!item).join(
                      '/',
                    )}`,
                  );
                } else {
                  navigateTo(`/app/${params.appId}`);
                }
              }}
            />
            <span className="Font17 bold">{_l('自动化工作流')}</span>
          </div>
          <ul className="menuTab">
            {TYPES.map(item =>
              count[item.value] > 0 || item.display ? (
                <Link className="NoUnderline" to={`${url}?type=${item.value}`} key={item.value}>
                  <li className={cx('ThemeColor3', { 'menuTab-active': type === item.value })}>
                    <span className="bold">{item.text}</span>
                    {count[item.value] > 0 ? `(${count[item.value]})` : ''}
                  </li>
                </Link>
              ) : null,
            )}
          </ul>
          <div className="flex flexRow workflowHeaderBtn">
            <div className="flex" />
            <Button
              size="small"
              icon="add"
              className="workflowAdd"
              style={{ backgroundColor: this.props.iconColor }}
              onClick={() => this.setState({ createWorkflowVisible: true })}
            >
              {_l('新建工作流')}
            </Button>
          </div>
        </div>

        {type === FLOW_TYPE.OTHER_APP && (
          <div className="flexRow mLeft20 mRight20 mTop20" style={{ justifyContent: 'center' }}>
            <div className="Gray_75 flex" style={{ maxWidth: 1200 }}>
              {_l('这些其他应用下的流程可以修改本应用中的数据。如果你是这些应用的管理员，你可以在这里查看和编辑流程')}
            </div>
          </div>
        )}

        <div className="manageListContainer flex">
          <div className={cx('manageListBox', { manageListBoxMaxHeight: !list.length })}>
            <div className="manageListBoxContent flexColumn">
              {loading ? (
                <LoadDiv className="mTop10" />
              ) : !list.length ? (
                <div className="flowEmptyWrap flexColumn">
                  <div className={cx('flowEmptyPic', `flowEmptyPic-${FLOW_TYPE_NULL[type].icon}`)} />
                  <div className="Gray_9e Font14 mTop20">{FLOW_TYPE_NULL[type].text}</div>
                </div>
              ) : (
                <Fragment>
                  <div className="manageListSearch flexRow">
                    {type !== FLOW_TYPE.OTHER && (
                      <Dropdown
                        className="w180"
                        data={filterList}
                        value={selectFilter}
                        openSearch
                        border
                        onChange={selectFilter => this.setState({ selectFilter })}
                      />
                    )}

                    <div className="flex" />
                    <Search
                      placeholder={_l('搜索流程名称')}
                      handleChange={keywords => this.setState({ keywords: keywords.trim() })}
                    />
                  </div>
                  {this.renderContent()}
                </Fragment>
              )}
            </div>
          </div>
        </div>

        {createWorkflowVisible && (
          <CreateWorkflow
            appId={params.appId}
            flowName={_l('未命名工作流')}
            onBack={() => this.setState({ createWorkflowVisible: false })}
          />
        )}
      </div>
    );
  }
}

export default connect(state => state.appPkg)(AppWorkflowList);
