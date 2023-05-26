import React, { Component, Fragment } from 'react';
import { ScrollView, Dropdown, Checkbox, LoadDiv, Radio, Icon, Tooltip } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import _ from 'lodash';
import {
  SelectUserDropDown,
  Member,
  SelectNodeObject,
  DetailHeader,
  DetailFooter,
  WriteFields,
  ButtonName,
  Schedule,
  UserRange,
  EmailApproval,
} from '../components';
import styled from 'styled-components';
import cx from 'classnames';
import OpinionTemplate from './OpinionTemplate';
import NoticeTemplate from './NoticeTemplate';
import CallbackSettings from './CallbackSettings';

const GraduallyMember = styled.div`
  .actionFields {
    width: 752px !important;
    left: 0;
  }
  .flowDetailMemberDel {
    display: block !important;
  }
`;

const CustomMessageBox = styled.div`
  height: 36px;
  background: #f5f5f5;
  border-radius: 4px;
  align-items: center;
  padding: 0 12px;
`;

const TABS_ITEM = styled.div`
  display: inline-flex;
  padding: 0 12px 12px 12px;
  margin-right: 36px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  position: relative;
  &.active {
    &::before {
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      content: '';
      height: 0;
      border-bottom: 3px solid #2196f3;
    }
  }
`;

export default class Approval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
      selectMsgKey: '',
      showCallbackDialog: false,
      tabIndex: 1,
      showApprovalTemplate: false,
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.getNodeDetail(nextProps);
    }

    if (
      nextProps.selectNodeName &&
      nextProps.selectNodeName !== this.props.selectNodeName &&
      nextProps.selectNodeId === this.props.selectNodeId &&
      !_.isEmpty(this.state.data)
    ) {
      this.updateSource({ name: nextProps.selectNodeName });
    }
  }

  /**
   * 获取节点详情
   */
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType, isApproval } = props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }).then(result => {
      this.setState({ data: result });

      if (isApproval && !result.selectNodeId) {
        this.onChange(result.flowNodeList[0].nodeId);
      }
    });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 更新节点对象数据
   */
  updateFlowMapSource = (key, obj) => {
    const { data } = this.state;

    this.updateSource({
      flowNodeMap: Object.assign({}, data.flowNodeMap, { [key]: Object.assign({}, data.flowNodeMap[key], obj) }),
    });
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const {
      name,
      selectNodeId,
      accounts,
      countersignType,
      operationTypeList,
      ignoreRequired,
      isCallBack,
      callBackType,
      callBackMultipleLevel,
      formProperties,
      passBtnName,
      overruleBtnName,
      auth,
      condition,
      multipleLevelType,
      multipleLevel,
      batch,
      schedule,
      passSendMessage,
      passMessage,
      overruleSendMessage,
      overruleMessage,
      callBackNodeType,
      callBackNodeIds,
      encrypt,
      operationUserRange,
      returnBtnName,
      opinionTemplate,
      flowNodeMap,
    } = data;

    if (!selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (!accounts.length && multipleLevelType === 0) {
      alert(_l('必须指定审批人'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        selectNodeId,
        multipleLevelType,
        multipleLevel,
        accounts,
        countersignType,
        condition,
        operationTypeList,
        ignoreRequired,
        isCallBack,
        callBackType,
        callBackMultipleLevel,
        formProperties,
        passBtnName: passBtnName.trim() || _l('通过'),
        overruleBtnName: overruleBtnName.trim() || _l('否决'),
        returnBtnName: returnBtnName.trim() || _l('退回'),
        auth,
        batch,
        schedule,
        passSendMessage,
        passMessage,
        overruleSendMessage,
        overruleMessage,
        callBackNodeType,
        callBackNodeIds,
        encrypt,
        operationUserRange,
        opinionTemplate,
        flowNodeMap,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 下拉框更改
   */
  onChange = selectNodeId => {
    const { data } = this.state;
    const selectNodeObj = _.find(data.appList, item => item.nodeId === selectNodeId);

    this.updateSource({ selectNodeId, selectNodeObj });

    if (data.isCallBack) {
      this.getCallBackNodeNames(selectNodeId, data.callBackType);
    }
  };

  /**
   * 渲染审批人
   */
  renderApprovalUser() {
    const { data } = this.state;
    const list = [
      { text: _l('自定义'), value: 0 },
      { text: _l('按部门层级逐级审批'), value: 1 },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('审批人')}</div>

        <div className="flexRow mTop10">
          {list.map((item, i) => (
            <div className="flex" key={i}>
              <Radio
                text={item.text}
                checked={data.multipleLevelType === item.value || (item.value === 1 && data.multipleLevelType === 2)}
                onClick={() =>
                  this.updateSource({
                    multipleLevelType: item.value,
                    callBackMultipleLevel: -1,
                    accounts: [],
                    multipleLevel: -1,
                    schedule: Object.assign({}, data.schedule, { enable: false }),
                  })
                }
              />
            </div>
          ))}
        </div>

        {data.multipleLevelType === 0 ? this.renderMember() : this.renderApprovalStartAndEnd()}
      </Fragment>
    );
  }

  /**
   * render member
   */
  renderMember() {
    const { data, showSelectUserDialog } = this.state;
    const { accounts } = data;
    const updateAccounts = ({ accounts }) => {
      this.updateSource({ accounts, countersignType: accounts.length <= 1 ? 0 : 3 }, () => {
        this.switchApprovalSettings(false, 16);
      });
    };

    return (
      <div className="mTop15">
        <Member accounts={accounts} updateSource={updateAccounts} />

        <div
          className="flexRow mTop12 ThemeColor3 workflowDetailAddBtn"
          onClick={() => this.setState({ showSelectUserDialog: true })}
        >
          <i className="Font28 icon-task-add-member-circle mRight10" />
          {_l('添加审批人')}
          <SelectUserDropDown
            appId={this.props.relationType === 2 ? this.props.relationId : ''}
            visible={showSelectUserDialog}
            companyId={this.props.companyId}
            processId={this.props.processId}
            nodeId={this.props.selectNodeId}
            unique={false}
            accounts={accounts}
            updateSource={updateAccounts}
            onClose={() => this.setState({ showSelectUserDialog: false })}
          />
        </div>
      </div>
    );
  }

  /**
   * 渲染审批起点和终点
   */
  renderApprovalStartAndEnd() {
    const { data, showSelectUserDialog } = this.state;
    const multipleLevelList = [
      { text: _l('最高级'), value: -1 },
      { text: _l('2级'), value: 2 },
      { text: _l('3级'), value: 3 },
      { text: _l('4级'), value: 4 },
      { text: _l('5级'), value: 5 },
      { text: _l('6级'), value: 6 },
      { text: _l('7级'), value: 7 },
      { text: _l('8级'), value: 8 },
      { text: _l('9级'), value: 9 },
      { text: _l('10级'), value: 10 },
      { text: _l('11级'), value: 11 },
      { text: _l('12级'), value: 12 },
      { text: _l('13级'), value: 13 },
      { text: _l('14级'), value: 14 },
      { text: _l('15级'), value: 15 },
      { text: _l('16级'), value: 16 },
      { text: _l('17级'), value: 17 },
      { text: _l('18级'), value: 18 },
      { text: _l('19级'), value: 19 },
      { text: _l('20级'), value: 20 },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('起点')}</div>

        <GraduallyMember className="flexRow alignItemsCenter">
          {(data.accounts || []).length ? (
            <Member accounts={data.accounts} removeOrganization={true} updateSource={this.updateSource} />
          ) : (
            <div
              className="mTop12 flexRow ThemeColor3 workflowDetailAddBtn"
              onClick={() => this.setState({ showSelectUserDialog: true })}
            >
              <i className="Font28 icon-task-add-member-circle mRight10" />
              {_l('指定成员')}
              <SelectUserDropDown
                appId={this.props.relationType === 2 ? this.props.relationId : ''}
                visible={showSelectUserDialog}
                companyId={this.props.companyId}
                processId={this.props.processId}
                nodeId={this.props.selectNodeId}
                onlyNodeRole
                unique
                accounts={data.accounts}
                updateSource={this.updateSource}
                onClose={() => this.setState({ showSelectUserDialog: false })}
              />
            </div>
          )}
          <div className="mLeft10 mTop12">{_l('的直属部门负责人')}</div>
        </GraduallyMember>

        <div className="Font13 bold mTop20">{_l('终点')}</div>
        <div className="flexRow alignItemsCenter mTop10">
          {_l('该成员在通讯录中的')}
          <Dropdown
            className="flowDropdown mLeft10 mRight10 flex"
            data={multipleLevelList}
            value={data.multipleLevel}
            border
            onChange={multipleLevel => {
              this.updateSource({ multipleLevel });
            }}
          />
          {_l('部门负责人')}
        </div>
        <div className="flexRow alignItemsCenter mTop20">
          <Checkbox
            className="InlineFlex"
            text={_l('仅主部门负责人需要审批')}
            checked={data.multipleLevelType === 2}
            onClick={checked => this.updateSource({ multipleLevelType: checked ? 1 : 2 })}
          />
          <span
            className="workflowDetailTipsWidth mLeft5 Gray_9e"
            data-tip={_l('如不勾选，则需要触发者所属的所有部门的对应层级的部门负责人一起审批')}
          >
            <i className="Font14 icon-workflow_help" />
          </span>
        </div>
      </Fragment>
    );
  }

  /**
   * 渲染审批方式
   */
  renderApprovalMode() {
    const { data } = this.state;
    const personsPassing = [
      { text: _l('或签（一名审批人通过或否决即可）'), value: 3 },
      { text: _l('会签（需所有审批人通过）'), value: 1 },
      { text: _l('会签（只需一名审批人通过，否决需全员否决）'), value: 2 },
      { text: _l('会签（按比例投票通过）'), value: 4 },
    ];
    const conditionList = [
      { text: '10%', value: '10' },
      { text: '20%', value: '20' },
      { text: '30%', value: '30' },
      { text: '40%', value: '40' },
      { text: '50%', value: '50' },
      { text: '60%', value: '60' },
      { text: '70%', value: '70' },
      { text: '80%', value: '80' },
      { text: '90%', value: '90' },
      { text: '100%', value: '100' },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('多人审批时采用的审批方式')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={personsPassing}
          value={data.countersignType}
          border
          onChange={countersignType => {
            let condition = '';
            if (countersignType === 4) {
              condition = '100';
            }
            this.updateSource({
              countersignType,
              operationTypeList: [],
              ignoreRequired: false,
              isCallBack: false,
              condition,
            });
          }}
        />
        {data.countersignType === 4 && (
          <Fragment>
            <div className="Font13 bold mTop25">{_l('通过比例')}</div>
            <div className="mTop10 flexRow alignItemsCenter">
              <Dropdown
                className="flowDropdown mRight10"
                style={{ width: 120 }}
                data={conditionList}
                value={data.condition}
                border
                onChange={condition => {
                  this.updateSource({ condition });
                }}
              />
              {_l('及以上的成员通过后即视为节点通过')}
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染tabs
   */
  renderTabs() {
    const { tabIndex } = this.state;
    const TABS = [
      { text: _l('审批设置'), value: 1 },
      { text: _l('字段权限'), value: 2 },
      // { text: _l('数据更新'), value: 3 },
    ];

    return (
      <div className="mTop25" style={{ borderBottom: '1px solid #ddd' }}>
        {TABS.map(item => {
          return (
            <TABS_ITEM
              key={item.value}
              className={cx({ active: item.value === tabIndex })}
              onClick={() => this.setState({ tabIndex: item.value })}
            >
              {item.text}
            </TABS_ITEM>
          );
        })}
      </div>
    );
  }

  /**
   * 渲染审批设置
   */
  renderApprovalSettings() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold mTop25">{_l('操作')}</div>

        {data.countersignType !== 2 && (
          <Fragment>
            <div className="mTop15">
              <Checkbox
                className="InlineFlex"
                text={_l('转审')}
                checked={_.includes(data.operationTypeList, 6)}
                onClick={checked => this.switchApprovalSettings(!checked, 6)}
              />
            </div>
            {_.includes(data.operationTypeList, 6) && (
              <UserRange
                {...this.props}
                operationUserRange={data.operationUserRange}
                operationType="6"
                title={_l('可转审给：')}
                btnText={_l('添加转审候选人')}
                updateSource={({ accounts }) =>
                  this.updateSource({
                    operationUserRange: Object.assign({}, data.operationUserRange, { [6]: accounts }),
                  })
                }
              />
            )}
          </Fragment>
        )}
        {_.includes([1, 2, 4], data.countersignType) && (
          <Fragment>
            <div className="mTop15">
              <Checkbox
                className="InlineFlex"
                text={_l('添加审批人')}
                checked={_.includes(data.operationTypeList, 16)}
                onClick={checked => this.switchApprovalSettings(!checked, 16)}
              />
            </div>
            {_.includes(data.operationTypeList, 16) && (
              <UserRange
                {...this.props}
                operationUserRange={data.operationUserRange}
                operationType="16"
                title={_l('可添加：')}
                btnText={_l('添加候选人')}
                updateSource={({ accounts }) =>
                  this.updateSource({
                    operationUserRange: Object.assign({}, data.operationUserRange, { [16]: accounts }),
                  })
                }
              />
            )}
          </Fragment>
        )}
        {!_.includes([1, 2, 4], data.countersignType) && (
          <Fragment>
            <div className="mTop15">
              <Checkbox
                className="InlineFlex"
                text={_l('加签')}
                checked={_.includes(data.operationTypeList, 7)}
                onClick={checked => this.switchApprovalSettings(!checked, 7)}
              />
            </div>
            {_.includes(data.operationTypeList, 7) && (
              <UserRange
                {...this.props}
                operationUserRange={data.operationUserRange}
                operationType="7"
                title={_l('可加签给：')}
                btnText={_l('添加加签候选人')}
                updateSource={({ accounts }) =>
                  this.updateSource({
                    operationUserRange: Object.assign({}, data.operationUserRange, { [7]: accounts }),
                  })
                }
              />
            )}
          </Fragment>
        )}
        <Checkbox
          className="mTop15 flexRow"
          text={_l('暂存')}
          checked={_.includes(data.operationTypeList, 13)}
          onClick={checked => this.switchApprovalSettings(!checked, 13)}
        />
        {data.countersignType !== 2 && (
          <Fragment>
            <div className="flexRow alignItemsCenter mTop15">
              <Checkbox
                className="flex flexRow"
                text={_l('退回')}
                disabled={data.countersignType === 2}
                checked={data.isCallBack}
                onClick={checked => {
                  this.updateSource({ isCallBack: !checked, callBackType: 0, callBackMultipleLevel: -1 });
                  if (data.selectNodeId && !checked) {
                    this.getCallBackNodeNames(data.selectNodeId, 0);
                  }
                }}
              />
            </div>
            {data.isCallBack && (
              <div className="flowBackBox Font12 mTop10">
                <div>
                  <span className="Gray_9e mRight5">{_l('处理完成后')}</span>
                  {data.callBackType === 0 && _l('重新执行流程')}
                  {data.callBackType === 1
                    ? data.callBackMultipleLevel === 1
                      ? _l('直接返回退回的层级')
                      : data.multipleLevelType === 0
                      ? _l('直接返回审批节点')
                      : _l('返回此节点的第一级')
                    : ''}
                </div>
                <div className="mTop4">
                  <span className="Gray_9e mRight5">{_l('允许退回的节点')}</span>
                  {data.callBackNodeType === 0 && (
                    <Fragment>
                      {data.callBackNodes.map(o => Object.values(o)).join('、') || _l('无可退回的节点')}
                    </Fragment>
                  )}
                  {data.callBackNodeType === 1 && _l('仅发起节点')}
                  {data.callBackNodeType === 2 && _l('仅上一个节点')}
                  {data.callBackNodeType === 3 &&
                    data.callBackNodes
                      .filter(o => _.includes(data.callBackNodeIds, Object.keys(o)[0]))
                      .map(o => Object.values(o))
                      .join('、')}
                </div>
                <Icon
                  type="edit"
                  className="Gray_9e ThemeHoverColor3 Font14 pointer"
                  onClick={() => this.setState({ showCallbackDialog: true })}
                />
              </div>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 切换审批设置
   */
  switchApprovalSettings(checked, value) {
    const { data } = this.state;
    const operationTypeList = _.cloneDeep(data.operationTypeList);

    if (checked) {
      operationTypeList.push(value);
    } else {
      _.remove(operationTypeList, item => item === value);
    }

    this.updateSource({ operationTypeList });
  }

  /**
   * 获取回滚节点的名称
   */
  getCallBackNodeNames = (id, callBackType) => {
    const { processId, selectNodeId } = this.props;

    flowNode.getCallBackNodeNames({ processId, nodeId: selectNodeId, selectNodeId: id, callBackType }).then(result => {
      this.updateSource({ callBackNodes: result });
    });
  };

  /**
   * 意见必填修改
   */
  opinionRequiredChange(checked, key) {
    const { data } = this.state;
    const currentAuth = [].concat(data.auth[key]);

    if (checked) {
      currentAuth.push(100);
    } else {
      _.remove(currentAuth, item => item === 100);
    }

    this.updateSource({ auth: Object.assign({}, data.auth, { [key]: currentAuth }) });
  }

  /**
   * 认证必填修改
   */
  authRequiredChange(checked, key) {
    const { data } = this.state;
    const currentAuth = [].concat(data.auth[key]).filter(item => item === 100);
    const value = data.auth.passTypeList.concat(data.auth.overruleTypeList).filter(item => item !== 100)[0] || 1;

    if (checked) {
      currentAuth.push(value);
    }

    this.updateSource({ auth: Object.assign({}, data.auth, { [key]: currentAuth }) });
  }

  /**
   * 认证等级修改
   */
  authRankChange = value => {
    const { data } = this.state;
    const passTypeList = data.auth.passTypeList.filter(item => item === 100);
    const overruleTypeList = data.auth.overruleTypeList.filter(item => item === 100);

    if (data.auth.passTypeList.filter(item => item !== 100).length) {
      passTypeList.push(value);
    }

    if (data.auth.overruleTypeList.filter(item => item !== 100).length) {
      overruleTypeList.push(value);
    }

    this.updateSource({ auth: { passTypeList, overruleTypeList } });
  };

  /**
   * 节点结果通知发起人
   */
  renderMessage() {
    const { data } = this.state;
    const MESSAGE_TYPE = [
      { text: _l('通过时通知'), key: 'passSendMessage', msgKey: 'passMessage' },
      { text: _l('否决时通知'), key: 'overruleSendMessage', msgKey: 'overruleMessage' },
    ];

    return (
      <Fragment>
        {MESSAGE_TYPE.map(item => {
          return (
            <div className="flexRow mTop10 alignItemsCenter" key={item.key}>
              <Checkbox
                text={item.text}
                checked={data[item.key]}
                onClick={checked => this.updateSource({ [item.key]: !checked })}
              />
              {data[item.key] && (
                <CustomMessageBox className="flex mLeft10 flexRow">
                  <div className="flex mRight20 ellipsis Font12">
                    {data[item.msgKey] ? _l('自定义') : _l('默认消息内容')}
                  </div>
                  <Icon
                    type="edit"
                    className="Gray_9e ThemeHoverColor3 Font14 pointer"
                    onClick={() => this.setState({ selectMsgKey: item.msgKey })}
                  />
                </CustomMessageBox>
              )}
            </div>
          );
        })}
      </Fragment>
    );
  }

  /**
   * 高级功能设置
   */
  renderSeniorSettings() {
    const { data } = this.state;

    return (
      <Fragment>
        <Checkbox
          className="mTop15 flexRow"
          text={_l('否决/退回时，无需填写表单字段')}
          checked={data.ignoreRequired}
          onClick={checked => this.updateSource({ ignoreRequired: !checked })}
        />

        <Checkbox
          className="mTop15 flexRow"
          text={
            <span>
              {_l('允许批量 / 快速审批')}
              <Tooltip
                popupPlacement="bottom"
                text={
                  <span>
                    {_l(
                      '允许审批人批量、快速处理审批任务（在移动端可以直接点击待审批列表上的按钮进行审批）。在批量处理审批时将忽略表单中的必填字段。',
                    )}
                  </span>
                }
              >
                <Icon className="Font16 Gray_9e mLeft5" style={{ verticalAlign: 'text-bottom' }} icon="info" />
              </Tooltip>
            </span>
          }
          checked={data.batch}
          onClick={checked => this.updateSource({ batch: !checked })}
        />

        <EmailApproval
          {...this.props}
          title={_l('启用邮件通知')}
          desc={_l('启用后，待办消息同时会以邮件的形式发送给相关负责人；邮件0.03元/封，自动从账务中心扣费')}
          showApprovalBtn={!data.encrypt}
          flowNodeMap={data.flowNodeMap[102]}
          updateSource={obj => this.updateFlowMapSource(102, obj)}
        />

        {data.multipleLevelType === 0 && (
          <Fragment>
            <Checkbox
              className="mTop15 flexRow"
              text={_l('开启限时处理')}
              checked={(data.schedule || {}).enable}
              onClick={checked =>
                this.updateSource({ schedule: Object.assign({}, data.schedule, { enable: !checked }) })
              }
            />
            <Schedule schedule={data.schedule} updateSource={this.updateSource} {...this.props} />
          </Fragment>
        )}
      </Fragment>
    );
  }

  render() {
    const { data, showCallbackDialog, tabIndex, showApprovalTemplate, selectMsgKey } = this.state;
    const authTypeListText = {
      1: _l('签名'),
      2: _l('四级：实名'),
      3: _l('三级：实名+实人'),
      4: _l('二级：实名+实人+网证（开发中...）'),
      5: _l('一级：实名+实人+网证+实证（开发中...）'),
    };

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-workflow_ea"
          bg="BGViolet"
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              <div className="Font13 bold">{_l('数据对象')}</div>
              <SelectNodeObject
                disabled={this.props.isApproval}
                appList={data.appList}
                selectNodeId={data.selectNodeId}
                selectNodeObj={data.selectNodeObj}
                onChange={this.onChange}
              />

              {this.renderApprovalUser()}
              {this.renderApprovalMode()}
              {this.renderTabs()}

              {tabIndex === 1 && (
                <Fragment>
                  {this.renderApprovalSettings()}

                  <div className="Font13 bold mTop25">{_l('节点结果通知发起人')}</div>
                  {this.renderMessage()}

                  <div className="Font13 bold mTop25">{_l('审批意见')}</div>
                  <CustomMessageBox className="mTop15 flexRow">
                    <div className="flex mRight20 ellipsis Font12">
                      {data.opinionTemplate.inputType === 1 ? _l('用户自由输入；') : _l('仅支持选择指定模板；')}
                      {(data.opinionTemplate.opinions[4] || []).length &&
                      (data.opinionTemplate.opinions[5] || []).length
                        ? _l('已设置通过、否决/退回时的意见模板')
                        : (data.opinionTemplate.opinions[4] || []).length
                        ? _l('已设置通过时的意见模板')
                        : (data.opinionTemplate.opinions[5] || []).length
                        ? _l('已设置否决/退回时的意见模板')
                        : _l('未设置意见模版')}
                    </div>
                    <Icon
                      type="edit"
                      className="Gray_9e ThemeHoverColor3 Font14 pointer"
                      onClick={() => this.setState({ showApprovalTemplate: true })}
                    />
                  </CustomMessageBox>
                  <div className="flexRow mTop15">
                    <Checkbox
                      className="InlineFlex flex"
                      text={_l('通过时必填')}
                      checked={_.includes(data.auth.passTypeList, 100)}
                      onClick={checked => this.opinionRequiredChange(!checked, 'passTypeList')}
                    />
                    <Checkbox
                      className="InlineFlex flex"
                      text={_l('否决/退回时必填')}
                      checked={_.includes(data.auth.overruleTypeList, 100)}
                      onClick={checked => this.opinionRequiredChange(!checked, 'overruleTypeList')}
                    />
                  </div>

                  <div className="Font13 bold mTop25">
                    {data.authTypeList.length === 1 ? authTypeListText[data.authTypeList[0].value] : _l('认证')}
                  </div>
                  <div className="flexRow mTop15">
                    <Checkbox
                      className="InlineFlex flex"
                      text={_l('通过时必须认证')}
                      checked={!!data.auth.passTypeList.filter(i => i !== 100).length}
                      onClick={checked => this.authRequiredChange(!checked, 'passTypeList')}
                    />
                    <Checkbox
                      className="InlineFlex flex"
                      text={_l('否决/退回时必须认证')}
                      checked={!!data.auth.overruleTypeList.filter(i => i !== 100).length}
                      onClick={checked => this.authRequiredChange(!checked, 'overruleTypeList')}
                    />
                  </div>

                  {data.authTypeList.length === 1 ||
                  data.auth.passTypeList.filter(i => i !== 100).length +
                    data.auth.overruleTypeList.filter(i => i !== 100).length ===
                    0 ? null : (
                    <Fragment>
                      <div className="Font13 bold mTop25">{_l('认证等级')}</div>
                      <Dropdown
                        className="flowDropdown mTop10"
                        data={data.authTypeList.map(({ value, disabled }) => {
                          return { value, text: authTypeListText[value], disabled };
                        })}
                        value={
                          data.auth.passTypeList.concat(data.auth.overruleTypeList).filter(item => item !== 100)[0]
                        }
                        border
                        onChange={this.authRankChange}
                      />
                    </Fragment>
                  )}

                  <div className="Font13 mTop25 bold">{_l('安全')}</div>
                  <Checkbox
                    className="mTop15 flexRow"
                    text={
                      <span>
                        {_l('登录密码验证')}
                        <Tooltip
                          popupPlacement="bottom"
                          text={<span>{_l('启用后，用户输入登录密码后才可进行通过/否决')}</span>}
                        >
                          <Icon
                            className="Font16 Gray_9e mLeft5"
                            style={{ verticalAlign: 'text-bottom' }}
                            icon="info"
                          />
                        </Tooltip>
                      </span>
                    }
                    checked={data.encrypt}
                    onClick={checked =>
                      this.updateSource({ encrypt: !checked }, () => {
                        this.updateFlowMapSource(102, { batch: false });
                      })
                    }
                  />

                  <div className="Font13 bold mTop25">{_l('按钮名称')}</div>
                  <ButtonName
                    dataKey="passBtnName"
                    name={data.passBtnName}
                    buttonName={_l('通过按钮')}
                    onChange={this.updateSource}
                  />
                  <ButtonName
                    dataKey="overruleBtnName"
                    name={data.overruleBtnName}
                    buttonName={_l('否决按钮')}
                    onChange={this.updateSource}
                  />
                  {data.isCallBack && (
                    <ButtonName
                      dataKey="returnBtnName"
                      name={data.returnBtnName}
                      buttonName={_l('退回按钮')}
                      onChange={this.updateSource}
                    />
                  )}

                  <div className="Font13 bold mTop25">{_l('其他')}</div>
                  {this.renderSeniorSettings()}
                </Fragment>
              )}

              {tabIndex === 2 && (
                <Fragment>
                  {data.selectNodeId ? (
                    <div className="Font13 mTop25">
                      <WriteFields
                        processId={this.props.processId}
                        nodeId={this.props.selectNodeId}
                        selectNodeId={data.selectNodeId}
                        data={data.formProperties}
                        updateSource={this.updateSource}
                        showCard={true}
                      />
                    </div>
                  ) : (
                    <div className="Gray_9e Font13 flexRow flowDetailTips mTop25">
                      <i className="icon-task-setting_promet Font16" />
                      <div className="flex mLeft10">{_l('必须先选择一个对象后，才能设置字段权限')}</div>
                    </div>
                  )}
                </Fragment>
              )}
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            data.selectNodeId &&
            ((!!data.accounts.length && data.multipleLevelType === 0) || data.multipleLevelType !== 0)
          }
          onSave={this.onSave}
        />

        {showCallbackDialog && (
          <CallbackSettings
            {...this.props}
            data={data}
            getCallBackNodeNames={this.getCallBackNodeNames}
            updateSource={this.updateSource}
            onClose={() => this.setState({ showCallbackDialog: false })}
          />
        )}

        {selectMsgKey && (
          <NoticeTemplate
            {...this.props}
            data={data}
            selectMsgKey={selectMsgKey}
            updateSource={this.updateSource}
            onClose={() => this.setState({ selectMsgKey: '' })}
          />
        )}

        {showApprovalTemplate && (
          <OpinionTemplate
            title={_l('意见模板')}
            description={_l('预置常用的意见作为模板，帮助审批人快捷填写')}
            keys={[
              { key: 4, text: _l('通过时的模板') },
              { key: 5, text: _l('否决/退回时的模板') },
            ]}
            opinionTemplate={data.opinionTemplate}
            onSave={opinionTemplate => this.updateSource({ opinionTemplate })}
            onClose={() => this.setState({ showApprovalTemplate: false })}
          />
        )}
      </Fragment>
    );
  }
}
