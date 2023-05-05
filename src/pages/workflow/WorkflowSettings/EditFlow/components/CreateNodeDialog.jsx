import React, { Component, Fragment } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Dialog, Radio, ScrollView, Support, Icon, Tooltip } from 'ming-ui';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import { NODE_TYPE, ACTION_ID, APP_TYPE, TRIGGER_ID } from '../../enum';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import SelectApprovalProcess from '../../../components/SelectApprovalProcess';
import _ from 'lodash';

const ClickAwayable = createDecoratedComponent(withClickAway);

export default class CreateNodeDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [
        {
          id: 'data',
          name: _l('数据处理'),
          items: [
            {
              type: 6,
              name: _l('新增记录'),
              appType: 1,
              actionId: '1',
              iconColor: '#FFA340',
              iconName: 'icon-workflow_new',
            },
            {
              type: 6,
              name: _l('更新记录'),
              appType: 1,
              actionId: '2',
              iconColor: '#FFA340',
              iconName: 'icon-workflow_update',
            },
            {
              type: 6,
              name: _l('删除记录'),
              appType: 1,
              actionId: '3',
              iconColor: '#FFA340',
              iconName: 'icon-hr_delete',
            },
            {
              type: 7,
              name: _l('获取单条数据'),
              iconColor: '#FFA340',
              iconName: 'icon-search',
              typeText: _l('获取方式'),
              secondList: [
                {
                  type: 7,
                  appType: 1,
                  actionId: '406',
                  name: _l('从工作表获取'),
                  describe: _l('从工作表获取一条指定记录'),
                },
                {
                  type: 7,
                  appType: 1,
                  actionId: '407',
                  name: _l('从多条数据节点获取'),
                  describe: _l('从多条数据节点获取一条指定记录'),
                },
                {
                  type: 6,
                  appType: 1,
                  actionId: '20',
                  name: _l('从关联字段获取'),
                  describe: _l('从关联表、子表或级联选择字段获取一条指定记录'),
                },
                {
                  type: 7,
                  appType: 1,
                  actionId: '420',
                  name: _l('从记录链接获取'),
                  describe: _l('从存有记录链接的文本字段获取一条指定记录'),
                },
              ],
            },
            {
              type: 13,
              name: _l('获取多条数据'),
              iconColor: '#FFA340',
              iconName: 'icon-transport',
              typeText: _l('获取方式'),
              secondList: [
                {
                  type: 13,
                  appType: 1,
                  actionId: '400',
                  name: _l('从工作表获取记录'),
                  describe: _l('获取工作表记录'),
                },
                {
                  type: 13,
                  appType: 1,
                  actionId: '401',
                  name: _l('从记录获取关联记录'),
                  describe: _l('获取关联表、子表或级联选择字段内的数据'),
                },
                {
                  type: 13,
                  appType: 1,
                  actionId: '402',
                  name: _l('从新增节点获取记录'),
                  describe: _l('从创建多条的新增节点获取记录'),
                },
                {
                  type: 13,
                  appType: 1,
                  actionId: '405',
                  name: _l('从人工节点获取操作明细'),
                  describe: _l('获取操作明细，拿到：操作者、操作时间、操作内容、备注'),
                },
                {
                  type: 13,
                  appType: 1,
                  name: _l('从对象数组获取数据'),
                  describe: _l('获取发送API请求、调用已集成API、代码块、业务流程输入/输出节点的JSON数组对象'),
                },
              ],
            },
            {
              type: 6,
              name: _l('更新流程参数'),
              appType: 102,
              actionId: '2',
              iconColor: '#FFA340',
              iconName: 'icon-parameter',
            },
          ],
        },
        {
          id: 'artificial',
          name: _l('待办'),
          items: [
            {
              type: 26,
              name: _l('发起审批流程'),
              iconColor: '#4158DB',
              iconName: 'icon-approval',
              typeText: _l('执行流程'),
              secondList: [
                {
                  type: 26,
                  appType: 10,
                  name: _l('创建新流程'),
                  describe: _l('从空白创建一条新的审批流程'),
                  isNew: true,
                },
                {
                  type: 26,
                  appType: 10,
                  name: _l('从已有审批流程复制'),
                  describe: _l(
                    '从已有审批流程复制不包括数据对象在内的流程框架，涉及相关对象的字段将被重置，需要重新配置这些节点',
                  ),
                },
              ],
            },
            { type: 4, name: _l('审批'), iconColor: '#7E57C2', iconName: 'icon-workflow_ea' },
            { type: 3, name: _l('填写'), iconColor: '#00BCD4', iconName: 'icon-workflow_write' },
            { type: 5, name: _l('抄送'), iconColor: '#2196f3', iconName: 'icon-workflow_notice' },
          ],
        },
        {
          id: 'notice',
          name: _l('通知'),
          items: [
            { type: 27, name: _l('发送站内通知'), iconColor: '#2196f3', iconName: 'icon-hr_message_reminder' },
            { type: 10, name: _l('发送短信'), iconColor: '#2196f3', iconName: 'icon-workflow_sms' },
            {
              type: 11,
              name: _l('发送邮件'),
              appType: 3,
              actionId: '202',
              iconColor: '#2196f3',
              iconName: 'icon-workflow_email',
            },
            {
              type: 17,
              featureId: 14,
              name: _l('界面推送'),
              iconColor: '#2196f3',
              iconName: 'icon-interface_push',
            },
            {
              type: 19,
              name: _l('发送服务号消息'),
              appType: 22,
              actionId: '203',
              iconColor: '#2196f3',
              iconName: 'icon-wechat',
            },
          ],
        },
        {
          id: 'component',
          name: _l('构件'),
          items: [
            { type: 1, name: _l('分支'), iconColor: '#4C7D9E', iconName: 'icon-workflow_branch' },
            {
              type: 12,
              name: _l('延时'),
              iconColor: '#4C7D9E',
              iconName: 'icon-workflow_delayed',
              typeText: _l('延时方式'),
              secondList: [
                {
                  type: 12,
                  name: _l('延时到指定日期'),
                  actionId: '300',
                  describe: _l('在上一个节点完成后，延时到指定的日期和时间后再继续执行流程'),
                },
                {
                  type: 12,
                  name: _l('延时一段时间'),
                  actionId: '301',
                  describe: _l('上一节点完成后，延时一段时间再继续执行流程'),
                },
              ],
            },
            {
              type: 9,
              name: _l('运算'),
              iconColor: '#4C7D9E',
              iconName: 'icon-workflow_function',
              typeText: _l('运算对象'),
              secondList: [
                {
                  type: 9,
                  name: _l('数值运算'),
                  actionId: '100',
                  describe: _l('对 数值/金额 等数字类型字段进行数学运算'),
                },
                {
                  type: 9,
                  name: _l('为日期加减时间'),
                  actionId: '101',
                  describe: _l('对 日期/时间 添加/减去年、月、天、小时、分进行计算'),
                },
                {
                  type: 9,
                  name: _l('时长'),
                  actionId: '104',
                  describe: _l('计算两个日期/时间之间的时长，并精确到年、月、天、时、分、秒'),
                },
                {
                  type: 9,
                  name: _l('统计数据条数'),
                  actionId: '105',
                  describe: _l('对获取到的多条数据对象进行数据条数的总计'),
                },
                {
                  type: 9,
                  name: _l('函数计算'),
                  actionId: '106',
                  describe: _l('通过函数对 文本/数值 等流程节点对象的值进行处理'),
                },
              ],
            },
            {
              type: 15,
              name: _l('获取链接'),
              appType: 13,
              iconColor: '#4C7D9E',
              iconName: 'icon-link2',
            },
            {
              type: 18,
              featureId: 13,
              name: _l('获取记录打印文件'),
              appType: 14,
              iconColor: '#4C7D9E',
              iconName: 'icon-print',
            },
            {
              type: 16,
              name: _l('子流程'),
              iconColor: '#4C7D9E',
              iconName: 'icon-subprocess',
            },
            {
              type: 20,
              name: _l('调用业务流程'),
              appType: 17,
              actionId: '500',
              iconColor: '#4C7D9E',
              iconName: 'icon-pbc',
            },
            {
              type: 25,
              featureId: 4,
              name: _l('调用已集成 API'),
              appType: 42,
              iconColor: '#4C7D9E',
              iconName: 'icon-api',
            },
          ],
        },
        {
          id: 'developer',
          name: '开发者',
          items: [
            {
              type: 24,
              featureId: 4,
              name: _l('API 连接与认证'),
              appType: 41,
              iconColor: '#4C7D9E',
              iconName: 'icon-connect',
            },
            {
              type: 8,
              name: _l('发送 API 请求'),
              iconColor: '#4C7D9E',
              iconName: 'icon-workflow_webhook',
              typeText: _l('发送对象'),
              secondList: [
                {
                  type: 8,
                  appType: 7,
                  name: _l('发送自定义请求'),
                  describe: _l('向 API 发送自定义的Query Param、Header 和 Body 内容'),
                },
                {
                  type: 8,
                  appType: 1,
                  name: _l('发送指定数据对象'),
                  describe: _l('向 API 发送工作流节点中的数据对象'),
                },
              ],
            },
            {
              type: 14,
              featureId: 8,
              name: _l('代码块'),
              iconColor: '#4C7D9E',
              iconName: 'icon-url',
              typeText: _l('选择代码块语言'),
              secondList: [
                {
                  type: 14,
                  name: _l('JavaScript'),
                  actionId: '102',
                  describe: _l('使用JavaScript语言'),
                },
                {
                  type: 14,
                  name: _l('Python'),
                  actionId: '103',
                  describe: _l('使用Python语言'),
                },
              ],
            },
            {
              type: 21,
              name: _l('JSON 解析'),
              appType: 18,
              actionId: '510',
              iconColor: '#4C7D9E',
              iconName: 'icon-task_custom_polymer',
            },
          ],
        },
        {
          id: 'message',
          name: _l('组织/部门/协作'),
          items: [
            {
              type: 1000,
              name: _l('获取单条人员/部门/组织角色数据'),
              iconColor: '#2196f3',
              iconName: 'icon-person_search',
              typeText: _l('获取方式'),
              secondList: [
                {
                  type: 1000,
                  appType: 20,
                  actionId: '20',
                  name: _l('从人员字段获取'),
                  describe: _l('从人员字段获取一名指定人员的相关信息'),
                },
                {
                  type: 1000,
                  appType: 21,
                  actionId: '20',
                  name: _l('从部门字段获取'),
                  describe: _l('从部门字段获取一个指定部门的相关信息'),
                },
                {
                  type: 1000,
                  appType: 24,
                  actionId: '20',
                  name: _l('从组织角色字段获取'),
                  describe: _l('从组织角色字段获取一个指定角色的相关信息'),
                },
                {
                  type: 1000,
                  appType: 20,
                  actionId: '406',
                  name: _l('从组织人员中获取'),
                  describe: _l('从当前组织的所有人员中获取一名指定人员的相关信息'),
                },
                {
                  type: 1000,
                  appType: 21,
                  actionId: '406',
                  name: _l('从组织部门中获取'),
                  describe: _l('从当前组织的所有部门中获取一个指定部门的相关信息'),
                },
                {
                  type: 1000,
                  appType: 24,
                  actionId: '406',
                  name: _l('从组织角色中获取'),
                  describe: _l('从当前组织的所有组织角色中获取一个指定角色的相关信息'),
                },
              ],
            },
            {
              type: 1001,
              name: _l('获取多条人员/部门/组织角色数据'),
              iconColor: '#2196f3',
              iconName: 'icon-group-members',
              typeText: _l('获取方式'),
              secondList: [
                {
                  type: 1001,
                  appType: 20,
                  actionId: '401',
                  name: _l('从人员字段获取'),
                  describe: _l('从人员字段获取批量人员的相关信息'),
                },
                {
                  type: 1001,
                  appType: 21,
                  actionId: '401',
                  name: _l('从部门字段获取'),
                  describe: _l('从部门字段获取批量部门的相关信息'),
                },
                {
                  type: 1001,
                  appType: 24,
                  actionId: '401',
                  name: _l('从组织角色字段获取'),
                  describe: _l('从组织角色字段获取批量角色的相关信息'),
                },
                {
                  type: 1001,
                  appType: 20,
                  actionId: '400',
                  name: _l('从组织人员中获取'),
                  describe: _l('从当前组织的所有人员中获取批量人员的相关信息'),
                },
                {
                  type: 1001,
                  appType: 21,
                  actionId: '400',
                  name: _l('从组织部门中获取'),
                  describe: _l('从当前组织的所有部门中获取批量部门的相关信息'),
                },
                {
                  type: 1001,
                  appType: 24,
                  actionId: '400',
                  name: _l('从组织角色中获取'),
                  describe: _l('从当前组织的所有组织角色中获取批量角色的相关信息'),
                },
              ],
            },
            {
              type: 6,
              name: _l('创建任务'),
              appType: 2,
              actionId: '1',
              iconColor: '#01CA83',
              iconName: 'icon-custom_assignment',
            },
          ],
        },
        {
          id: 'external',
          name: _l('外部用户'),
          items: [
            {
              type: 6,
              name: _l('更新外部用户信息'),
              appType: 23,
              actionId: '2',
              iconColor: '#FFA340',
              iconName: 'icon-update_information',
            },
            {
              type: 6,
              name: _l('邀请外部用户'),
              appType: 23,
              actionId: '1',
              iconColor: '#FFA340',
              iconName: 'icon-invited_users',
            },
            {
              type: 1000,
              name: _l('获取单条外部人员数据'),
              iconColor: '#2196f3',
              iconName: 'icon-external_users',
              typeText: _l('获取方式'),
              secondList: [
                {
                  type: 1000,
                  appType: 23,
                  actionId: '20',
                  name: _l('从外部用户字段获取'),
                  describe: _l('从外部用户字段获取一名指定人员的相关信息'),
                },
                {
                  type: 1000,
                  appType: 23,
                  actionId: '406',
                  name: _l('从外部门户中获取'),
                  describe: _l('从当前应用的所有外部用户中获取一名指定人员的相关信息'),
                },
              ],
            },
            {
              type: 1001,
              name: _l('获取多条外部人员数据'),
              iconColor: '#2196f3',
              iconName: 'icon-folder-public',
              typeText: _l('获取方式'),
              secondList: [
                {
                  type: 1001,
                  appType: 23,
                  actionId: '401',
                  name: _l('从外部用户字段获取'),
                  describe: _l('从外部用户字段获取批量用户的相关信息'),
                },
                {
                  type: 1001,
                  appType: 23,
                  actionId: '400',
                  name: _l('从外部门户中获取'),
                  describe: _l('从当前应用的所有外部用户中获取批量用户的相关信息'),
                },
              ],
            },
          ],
        },
      ],
      selectItem: null,
      selectSecond: false,
      showDialog: false,
      isOrdinary: true,
      showBranchDialog: false,
      moveType: 1,
      foldFeatures: safeParse(localStorage.getItem(`workflowFoldFeatures-${md.global.Account.accountId}`)) || {},
      showApprovalDialog: false,
    };

    if (!_.includes([APP_TYPE.CUSTOM_ACTION, APP_TYPE.PBC], props.flowInfo.startAppType) || props.flowInfo.child) {
      this.state.list.forEach(o => {
        _.remove(
          o.items,
          item =>
            item.type === NODE_TYPE.PUSH ||
            (item.iconName === 'icon-custom_assignment' && md.global.SysSettings.forbidSuites.includes('2')),
        );
      });
    }

    if (
      props.flowInfo.startAppType === APP_TYPE.EXTERNAL_USER &&
      props.flowInfo.startTriggerId === TRIGGER_ID.DISCUSS
    ) {
      _.remove(this.state.list, o => o.id !== 'notice');
      this.state.list.forEach(o => {
        _.remove(o.items, item => item.type === NODE_TYPE.CC);
      });
    }

    // 埋点授权过滤： API集成工作流节点、代码块节点、获取打印文件节点、界面推送
    [
      { featureId: 4, type: [NODE_TYPE.API_PACKAGE, NODE_TYPE.API] },
      { featureId: 8, type: [NODE_TYPE.CODE] },
      { featureId: 13, type: [NODE_TYPE.FILE] },
      { featureId: 14, type: [NODE_TYPE.PUSH] },
    ].forEach(obj => {
      if (!_.includes(['1', '2'], getFeatureStatus(props.flowInfo.companyId, obj.featureId))) {
        this.state.list.forEach(o => {
          _.remove(o.items, item => _.includes(obj.type, item.type));
        });
      }
    });
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.nodeId && nextProps.nodeId !== this.props.nodeId) {
      this.setState({
        selectItem: null,
        selectSecond: false,
        showDialog: false,
        isOrdinary: true,
        showBranchDialog: false,
        moveType: 1,
        showApprovalDialog: false,
      });
    }
  }

  /**
   * 内容
   */
  renderContent() {
    const { list, selectItem, selectSecond, foldFeatures } = this.state;

    // 渲染二级数据
    if (selectSecond) {
      return (
        <div className="pTop20 pBottom15 pLeft12 pRight12">
          {selectItem.typeText && <div className="bold pLeft10">{selectItem.typeText}</div>}
          {selectItem.type === NODE_TYPE.CODE && (
            <div className="Gray_75 mTop10 pLeft10">
              {_l('查看当前代码脚本的')}
              <a
                href="https://help.mingdao.com/zh/flow34.html#%E4%BB%A3%E7%A0%81%E8%84%9A%E6%9C%AC%E8%BF%90%E8%A1%8C%E7%8E%AF%E5%A2%83"
                className="ThemeColor3 ThemeHoverColor2 mLeft3"
                target="_blank"
              >
                {_l('运行版本')}
              </a>
            </div>
          )}

          <ul className="secondNodeList">
            {(selectItem.secondList || []).map((item, i) => {
              return (
                <li key={i} onClick={() => this.createNodeClick(item)}>
                  <Radio className="Font15" text={item.name} disabled />
                  <div className="Gray_75 Font13 mLeft30 mTop5">{item.describe}</div>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return (
      <div className="pBottom15 pLeft10 pRight10">
        {list.map((data, i) => {
          return (
            <div className="mTop15 nodeListContainer" key={i}>
              <div
                className="Font16 bold pTop5 pBottom5 pointer"
                onClick={() => {
                  const newFold = Object.assign({}, foldFeatures, { [data.id]: !foldFeatures[data.id] });

                  this.setState({ foldFeatures: newFold });
                  safeLocalStorageSetItem(
                    `workflowFoldFeatures-${md.global.Account.accountId}`,
                    JSON.stringify(newFold),
                  );
                }}
              >
                <Icon
                  icon={foldFeatures[data.id] ? 'arrow-right-tip' : 'arrow-down'}
                  className="mRight13 Gray_9e Font13 nodeFoldIcon"
                />
                {data.name}
              </div>
              {!foldFeatures[data.id] && (
                <ul className="nodeList clearfix">
                  {data.items.filter(data => !(data.type === 25 && md.global.SysSettings.hideIntegration)).map((item, j) => {
                    return (
                      <li key={j} onClick={() => this.createNodeClick(item)}>
                        <span className="nodeListIcon" style={{ backgroundColor: item.iconColor }}>
                          <i className={item.iconName} />
                        </span>
                        <div className="Font14">{item.name}</div>
                        {item.type === NODE_TYPE.APPROVAL && (
                          <Tooltip
                            popupPlacement="bottom"
                            text={_l(
                              '使用「发起审批流程」节点可提供更完整的审批能力，旧「审批」节点即将被下线。流程中已添加的审批节点不受影响，仍可以继续使用。',
                            )}
                          >
                            <div className="Font12 nodeListOverdue">{_l('即将下线')}</div>
                          </Tooltip>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * 渲染结果分支
   */
  renderResultBranch() {
    const { isLast, nodeType, flowNodeMap, nodeId } = this.props;
    const { isOrdinary } = this.state;

    return (
      <Dialog
        visible
        width={560}
        title={
          nodeType === NODE_TYPE.APPROVAL
            ? _l('在审批节点下添加分支有两种选择：')
            : _l('在查找指定数据节点下添加分支有两种选择：')
        }
        onCancel={() => this.setState({ showDialog: false, isOrdinary: true })}
        onOk={() =>
          isLast || (flowNodeMap[(flowNodeMap[nodeId] || {}).nextId] || {}).actionId === ACTION_ID.PBC_OUT
            ? this.onOk({ noMove: true })
            : this.setState({ showDialog: false, showBranchDialog: true })
        }
      >
        <Radio
          className="Font15"
          text={_l('添加普通分支')}
          checked={isOrdinary}
          onClick={() => this.setState({ isOrdinary: true })}
        />
        <div className="Gray_75 Font13 pLeft30 mTop5 mBottom15">
          {nodeType === NODE_TYPE.APPROVAL
            ? _l('只对“通过”审批的数据进行分支处理')
            : _l('对查找到的数据进行分支处理。未查找到数据时，流程中止')}
        </div>
        <Radio
          className="Font15"
          text={nodeType === NODE_TYPE.APPROVAL ? _l('添加审批结果分支') : _l('添加查找结果分支')}
          checked={!isOrdinary}
          onClick={() => this.setState({ isOrdinary: false })}
        />
        <div className="Gray_75 Font13 pLeft30 mTop5">
          {nodeType === NODE_TYPE.APPROVAL
            ? _l('分支固定为“通过”和“否决”。如果你同时需要对“否决”审批的数据进行处理时选择此分支')
            : _l(
                '分支固定为“查找到数据”和“未查找到数据”。如果你需要在“未查找到”数据的情况下继续执行流程，请选择此分支',
              )}
        </div>
      </Dialog>
    );
  }

  /**
   * 渲染分支
   */
  renderBranch() {
    const { nodeType, actionId } = this.props;
    const { isOrdinary, moveType } = this.state;
    const MOVE_TYPE = () => {
      if (isOrdinary) {
        return [{ text: _l('左侧'), value: 1 }, { text: _l('不移动'), value: 0 }];
      }

      if (nodeType === NODE_TYPE.APPROVAL) {
        return [
          { text: _l('左侧（通过分支）'), value: 1 },
          { text: _l('右侧（否决分支）'), value: 2 },
          { text: _l('不移动'), value: 0 },
        ];
      }

      if (
        _.includes([NODE_TYPE.SEARCH, NODE_TYPE.FIND_SINGLE_MESSAGE], nodeType) ||
        (nodeType === NODE_TYPE.ACTION && actionId === ACTION_ID.RELATION)
      ) {
        return [
          { text: _l('左侧（有数据分支）'), value: 1 },
          { text: _l('右侧（无数据分支）'), value: 2 },
          { text: _l('不移动'), value: 0 },
        ];
      }
    };

    return (
      <Dialog
        visible
        width={560}
        title={_l('分支下方的节点整体放置在')}
        onCancel={() => this.setState({ showBranchDialog: false, isOrdinary: true, moveType: 1 })}
        onOk={this.onOk}
      >
        {MOVE_TYPE().map(o => (
          <div key={o.value} className="mBottom15">
            <Radio
              className="Font15"
              text={o.text}
              checked={moveType === o.value}
              onClick={() => this.setState({ moveType: o.value })}
            />
          </div>
        ))}
        <div className="Gray_75 Font13 pLeft30" style={{ marginTop: -10 }}>
          {_l('等待分支汇集后再执行下方节点')}
        </div>
      </Dialog>
    );
  }

  /**
   * 判断是否是条件分支
   */
  isConditionalBranch() {
    const { nodeType, actionId } = this.props;

    return (
      _.includes([NODE_TYPE.APPROVAL, NODE_TYPE.SEARCH, NODE_TYPE.FIND_SINGLE_MESSAGE], nodeType) ||
      (nodeType === NODE_TYPE.ACTION && actionId === '20')
    );
  }

  /**
   * 创建节点点击
   */
  createNodeClick(item) {
    const { nodeId, isLast, flowInfo, flowNodeMap } = this.props;
    const { selectItem } = this.state;
    const featureId = selectItem && selectItem.featureId ? selectItem.featureId : item.featureId;
    const featureType = getFeatureStatus(flowInfo.companyId, featureId);

    // 二级创建
    if (item.secondList) {
      if (_.includes([NODE_TYPE.CODE], item.type) && featureType === '2') {
        buriedUpgradeVersionDialog(flowInfo.companyId, featureId);
        return;
      }
      this.setState({ selectItem: item, selectSecond: true });
      return;
    }

    // 分支 并且 上一个节点是审批
    if (item.type === NODE_TYPE.BRANCH && this.isConditionalBranch()) {
      this.setState({ selectItem: item, showDialog: true });
    } else if (
      item.type === NODE_TYPE.BRANCH &&
      !isLast &&
      (flowNodeMap[(flowNodeMap[nodeId] || {}).nextId] || {}).actionId !== ACTION_ID.PBC_OUT
    ) {
      this.setState({ selectItem: item, showBranchDialog: true });
    } else if (
      _.includes([NODE_TYPE.CODE, NODE_TYPE.PUSH, NODE_TYPE.FILE, NODE_TYPE.API_PACKAGE, NODE_TYPE.API], item.type) &&
      featureType === '2'
    ) {
      // 代码块、界面推送、Word打印模板、API连接与认证、调用已集成的API
      buriedUpgradeVersionDialog(flowInfo.companyId, featureId);
    } else if (item.type === NODE_TYPE.APPROVAL_PROCESS && !item.isNew) {
      this.setState({ showApprovalDialog: true });
    } else {
      this.addFlowNode({
        actionId: item.actionId,
        appType: item.appType,
        name: item.type === NODE_TYPE.APPROVAL_PROCESS ? _l('发起审批') : item.name,
        prveId: nodeId,
        typeId: item.type,
      });
    }
  }

  /**
   * dialog确定
   */
  onOk = ({ noMove }) => {
    const { nodeId } = this.props;
    const { selectItem, isOrdinary, moveType } = this.state;

    if (this.isConditionalBranch()) {
      this.addFlowNode({
        name: '',
        prveId: nodeId,
        resultFlow: !isOrdinary,
        typeId: NODE_TYPE.BRANCH,
        moveType: noMove ? 0 : moveType,
      });
    } else {
      this.addFlowNode({
        actionId: selectItem.actionId,
        appType: selectItem.appType,
        name: selectItem.name,
        prveId: nodeId,
        typeId: selectItem.type,
        moveType: noMove ? 0 : moveType,
      });
    }
  };

  /**
   * 添加节点
   */
  addFlowNode = args => {
    const { flowInfo, addFlowNode, selectAddNodeId } = this.props;

    addFlowNode(flowInfo.id, args);
    selectAddNodeId('');
  };

  render() {
    const { nodeId, selectAddNodeId, flowInfo } = this.props;
    const { selectItem, selectSecond, showDialog, showBranchDialog, showApprovalDialog } = this.state;

    return (
      <ReactCSSTransitionGroup
        transitionName="createNodeDialogTransition"
        transitionEnterTimeout={250}
        transitionLeaveTimeout={250}
      >
        {!!nodeId && (
          <ClickAwayable
            className="createNodeDialog flexColumn"
            onClickAwayExceptions={[
              '.workflowLineBtn .icon-custom_add_circle',
              '.mui-dialog-container',
              '.workflowCopyBtn',
            ]}
            onClickAway={() => selectAddNodeId('')}
          >
            <div
              className="createNodeDialogHeader flexRow"
              style={{ background: selectItem ? selectItem.iconColor : '#2196f3' }}
            >
              {selectSecond ? (
                <div className="flex Font18">
                  <i
                    className="icon-backspace Font20 pointer"
                    onClick={() => this.setState({ selectItem: null, selectSecond: false })}
                  />
                  <span className="mLeft10">{selectItem.name}</span>
                </div>
              ) : (
                <Fragment>
                  <div className="flex Font18">{_l('选择一个动作')}</div>
                  <Support
                    className="createNodeExplain"
                    type={2}
                    text={_l('了解这些动作')}
                    href="https://help.mingdao.com/zh/flow51.html"
                  />
                </Fragment>
              )}

              <i className="icon-delete Font18 mLeft5" onClick={() => selectAddNodeId('')} />
            </div>
            <div className="flex">
              <ScrollView>{this.renderContent()}</ScrollView>
            </div>

            {showDialog && this.renderResultBranch()}

            {showBranchDialog && this.renderBranch()}

            {showApprovalDialog && (
              <SelectApprovalProcess
                companyId={flowInfo.companyId}
                appId={flowInfo.relationId}
                onOk={({ processId }) =>
                  this.addFlowNode({
                    appType: APP_TYPE.APPROVAL,
                    name: _l('发起审批'),
                    prveId: nodeId,
                    typeId: NODE_TYPE.APPROVAL_PROCESS,
                    approvalId: processId,
                  })
                }
                onCancel={() => this.setState({ showApprovalDialog: false })}
              />
            )}
          </ClickAwayable>
        )}
      </ReactCSSTransitionGroup>
    );
  }
}
