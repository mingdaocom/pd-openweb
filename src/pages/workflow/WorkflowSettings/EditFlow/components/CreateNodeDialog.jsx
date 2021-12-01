import React, { Component, Fragment } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Dialog, Radio, ScrollView, Support } from 'ming-ui';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import { NODE_TYPE, TRIGGER_ID_TYPE } from '../../enum';
import { upgradeVersionDialog } from 'src/util';
import { getProjectLicenseInfo } from 'src/api/project';

const ClickAwayable = createDecoratedComponent(withClickAway);

export default class CreateNodeDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [
        {
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
                  actionId: '403',
                  name: _l('从Webhook数组获取数据'),
                  describe: _l('获取Webhook节点中的JSON数组对象'),
                },
                {
                  type: 13,
                  appType: 1,
                  actionId: '404',
                  name: _l('从代码块数组获取数据'),
                  describe: _l('获取代码块节点中的JSON数组对象'),
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
          name: _l('人工'),
          items: [
            { type: 4, name: _l('审批'), iconColor: '#7E57C2', iconName: 'icon-workflow_ea' },
            { type: 3, name: _l('填写'), iconColor: '#00BCD4', iconName: 'icon-workflow_write' },
            { type: 5, name: _l('发送站内通知'), iconColor: '#2196f3', iconName: 'icon-workflow_notice' },
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
              name: _l('界面推送'),
              iconColor: '#2196f3',
              iconName: 'icon-notifications_11',
            },
          ],
        },
        {
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
                  describe: _l('在上一个节点完成后，延时一段时间再继续执行流程'),
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
                  name: _l('两个日期间的时长'),
                  actionId: '104',
                  describe: _l('计算两个日期间的时长，并精确到年、月、天、小时、分'),
                },
                {
                  type: 9,
                  name: _l('统计数据条数'),
                  actionId: '105',
                  describe: _l('对获取到的多条数据对象进行数据条数的总计'),
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
              type: 16,
              name: _l('子流程'),
              iconColor: '#4C7D9E',
              iconName: 'icon-subprocess',
            },
            {
              type: 18,
              name: _l('获取记录打印文件'),
              appType: 14,
              iconColor: '#4C7D9E',
              iconName: 'icon-print',
            },
          ],
        },
        {
          name: _l('组织/协作'),
          items: [
            {
              type: 1000,
              name: _l('获取单条人员/部门信息'),
              iconColor: '#2196f3',
              iconName: 'icon-person_search',
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
              ],
            },
            {
              type: 1001,
              name: _l('获取多条人员/部门信息'),
              iconColor: '#2196f3',
              iconName: 'icon-group-members',
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
          name: '开发者',
          items: [
            { type: 8, name: _l('Webhook'), iconColor: '#4C7D9E', iconName: 'icon-workflow_webhook' },
            {
              type: 14,
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
          ],
        },
      ],
      selectItem: null,
      selectSecond: false,
      showDialog: false,
      isOrdinary: true,
      showBranchDialog: false,
      moveType: 1,
    };

    if (!props.hasPushNode) {
      this.state.list.forEach(o => {
        console.log(o.items);
        _.remove(o.items, item => item.type === 17 || (item.iconName === 'icon-custom_assignment' && md.global.SysSettings.forbidSuites.includes('2')));
      });
    }
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
      });
    }
  }

  /**
   * 内容
   */
  renderContent() {
    const { isLast, nodeType, actionId } = this.props;
    const { list, selectItem, selectSecond, showDialog, isOrdinary, showBranchDialog, moveType } = this.state;
    const MOVE_TYPE = () => {
      if (isOrdinary) {
        return [
          { text: _l('左侧'), value: 1 },
          { text: _l('不移动'), value: 0 },
        ];
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
        (nodeType === NODE_TYPE.ACTION && actionId === TRIGGER_ID_TYPE.RELATION)
      ) {
        return [
          { text: _l('左侧（有数据分支）'), value: 1 },
          { text: _l('右侧（无数据分支）'), value: 2 },
          { text: _l('不移动'), value: 0 },
        ];
      }
    };

    // 渲染二级数据
    if (selectSecond) {
      return (
        <div className="pTop20 pBottom15 pLeft12 pRight12">
          {selectItem.typeText && <div className="bold pLeft10">{selectItem.typeText}</div>}
          {selectItem.type === 14 && (
            <div className="Gray_75 mTop10 pLeft10">
              {_l('查看当前代码脚本的')}
              <a
                href="https://help.mingdao.com/flow34.html#%E4%BB%A3%E7%A0%81%E8%84%9A%E6%9C%AC%E8%BF%90%E8%A1%8C%E7%8E%AF%E5%A2%83"
                className="ThemeColor3 ThemeHoverColor2 mLeft3"
                target="_blank"
              >
                {_l('运行版本')}
              </a>
            </div>
          )}
          <ul className="secondNodeList">
            {selectItem.secondList.map((item, i) => {
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
      <div className="pBottom15 pLeft24 pRight24">
        {list.map((data, i) => {
          return (
            <Fragment key={i}>
              <div className="Font14 Gray_75 pTop15">{data.name}</div>
              <ul className="nodeList">
                {data.items.map((item, j) => {
                  return (
                    <li key={j} onClick={() => this.createNodeClick(item)}>
                      <span className="nodeListIcon" style={{ backgroundColor: item.iconColor }}>
                        <i className={item.iconName} />
                      </span>
                      <div className="Font13 mTop8 LineHeight16">{item.name}</div>
                    </li>
                  );
                })}
              </ul>
            </Fragment>
          );
        })}

        <Dialog
          visible={showDialog}
          width={560}
          title={
            nodeType === NODE_TYPE.APPROVAL
              ? _l('在审批节点下添加分支有两种选择：')
              : _l('在查找指定数据节点下添加分支有两种选择：')
          }
          onCancel={() => this.setState({ showDialog: false, isOrdinary: true })}
          onOk={() => (isLast ? this.onOk() : this.setState({ showDialog: false, showBranchDialog: true }))}
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
              ? _l('分支固定为“通过”和“未通过”。如果你同时需要对“未通过”审批的数据进行处理时选择此分支')
              : _l(
                  '分支固定为“查找到数据”和“未查找到数据”。如果你需要在“未查找到”数据的情况下继续执行流程，请选择此分支',
                )}
          </div>
        </Dialog>

        <Dialog
          visible={showBranchDialog}
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
      </div>
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
    const { nodeId, isLast, companyId } = this.props;

    // 二级创建
    if (item.secondList) {
      this.setState({ selectItem: item, selectSecond: true });
      return;
    }

    // 分支 并且 上一个节点是审批
    if (item.type === NODE_TYPE.BRANCH && this.isConditionalBranch()) {
      this.setState({ selectItem: item, showDialog: true });
    } else if (item.type === NODE_TYPE.BRANCH && !isLast) {
      this.setState({ selectItem: item, showBranchDialog: true });
    } else {
      const currentProject = _.find(md.global.Account.projects || [], o => o.projectId === companyId) || {};
      const callback = ({ version, licenseType }) => {
        // 代码块、界面推送 Word打印模板
        if (_.includes([14, 17, 18], item.type) && (licenseType === 0 || version.versionId === 1)) {
          upgradeVersionDialog({ projectId: companyId, isFree: licenseType === 0 });
        } else {
          this.addFlowNode({
            actionId: item.actionId,
            appType: item.appType,
            name: item.name,
            prveId: nodeId,
            typeId: item.type,
          });
        }
      };

      // 外协
      if (_.isEmpty(currentProject)) {
        getProjectLicenseInfo({ projectId: companyId }).then(data => {
          callback(data);
        });
      } else {
        callback(currentProject);
      }
    }
  }

  /**
   * branch dialog确定
   */
  onOk = () => {
    const { nodeId } = this.props;
    const { selectItem, isOrdinary, moveType } = this.state;

    if (this.isConditionalBranch()) {
      this.addFlowNode({
        name: '',
        prveId: nodeId,
        resultFlow: !isOrdinary,
        typeId: NODE_TYPE.BRANCH,
        moveType,
      });
    } else {
      this.addFlowNode({
        actionId: selectItem.actionId,
        appType: selectItem.appType,
        name: selectItem.name,
        prveId: nodeId,
        typeId: selectItem.type,
        moveType,
      });
    }
  };

  /**
   * 添加动作节点
   */
  addFlowNode = args => {
    const { addFlowNode, selectAddNodeId } = this.props;

    addFlowNode(args);
    selectAddNodeId('');
  };

  render() {
    const { nodeId, selectAddNodeId } = this.props;
    const { selectItem, selectSecond } = this.state;

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
                    href="https://help.mingdao.com/flow51.html"
                  />
                </Fragment>
              )}

              <i className="icon-delete Font18 mLeft5" onClick={() => selectAddNodeId('')} />
            </div>
            <div className="flex">
              <ScrollView>{this.renderContent()}</ScrollView>
            </div>
          </ClickAwayable>
        )}
      </ReactCSSTransitionGroup>
    );
  }
}
