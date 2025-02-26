import React, { Component, Fragment } from 'react';
import { ScrollView, Checkbox, LoadDiv, Tooltip, Icon, Support } from 'ming-ui';
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
  UpdateFields,
  OperatorEmpty,
  CustomTextarea,
  PromptSoundDialog,
} from '../components';
import styled from 'styled-components';
import cx from 'classnames';
import { OPERATION_TYPE } from '../../enum';
import { clearFlowNodeMapParameter } from '../../utils';

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

export default class Write extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
      tabIndex: 1,
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
  getNodeDetail(props, sId) {
    const { processId, selectNodeId, selectNodeType, isApproval, instanceId } = props;
    const { data } = this.state;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, selectNodeId: sId, instanceId })
      .then(result => {
        if (sId) {
          result = Object.assign({}, data, {
            selectNodeId: result.selectNodeId,
            appList: result.appList,
            selectNodeObj: result.selectNodeObj,
            flowNodeMap: Object.assign({}, data.flowNodeMap, {
              [OPERATION_TYPE.BEFORE]: result.flowNodeMap[OPERATION_TYPE.BEFORE],
              [OPERATION_TYPE.PASS]: result.flowNodeMap[OPERATION_TYPE.PASS],
              [OPERATION_TYPE.PROMPT_SOUND]: result.flowNodeMap[OPERATION_TYPE.PROMPT_SOUND],
            }),
            formProperties: result.formProperties,
          });
        }

        this.setState({ data: result }, () => {
          if (isApproval && !result.selectNodeId) {
            this.onChange(result.flowNodeList[0].nodeId);
          }
        });
      });
  }

  /**
   * 下拉框更改
   */
  onChange = selectNodeId => {
    this.getNodeDetail(this.props, selectNodeId);
  };

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
  updateFlowMapSource = (key, obj, callback = () => {}) => {
    const { data } = this.state;

    this.updateSource(
      {
        flowNodeMap: Object.assign({}, data.flowNodeMap, { [key]: Object.assign({}, data.flowNodeMap[key], obj) }),
      },
      callback,
    );
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const {
      selectNodeId,
      name,
      accounts,
      formProperties,
      submitBtnName,
      schedule,
      operationTypeList,
      encrypt,
      operationUserRange,
      flowNodeMap,
      userTaskNullMap,
      addNotAllowView,
      explain,
    } = data;

    if (!selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (userTaskNullMap[5] && !userTaskNullMap[5].length) {
      alert(_l('必须指定代理人'), 2);
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
        accounts,
        formProperties,
        submitBtnName: submitBtnName.trim(),
        schedule,
        operationTypeList,
        encrypt,
        operationUserRange,
        flowNodeMap: clearFlowNodeMapParameter(flowNodeMap),
        userTaskNullMap,
        addNotAllowView,
        explain,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 渲染tabs
   */
  renderTabs() {
    const { tabIndex } = this.state;
    const TABS = [
      { text: _l('填写设置'), value: 1 },
      { text: _l('字段设置'), value: 2 },
      { text: _l('数据更新'), value: 3 },
    ];

    return (
      <div className="mTop25" style={{ borderBottom: '1px solid #ddd' }}>
        {TABS.map(item => {
          return (
            <TABS_ITEM
              key={item.value}
              className={cx('pointerEventsAuto', { active: item.value === tabIndex })}
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
   * 切换填写设置
   */
  switchWriteSettings(checked, value) {
    const { data } = this.state;
    const operationTypeList = _.cloneDeep(data.operationTypeList);

    if (checked) {
      operationTypeList.push(value);
    } else {
      _.remove(operationTypeList, item => item === value);
    }

    this.updateSource({ operationTypeList });
  }

  render() {
    const { data, showSelectUserDialog, tabIndex } = this.state;
    const SOURCE_HANDLE_LIST = [
      {
        title: _l('节点开始时更新'),
        desc: _l('流程进入此节点且填写开始前，更新数据对象的字段值（退回至此节点也会触发更新）'),
        key: OPERATION_TYPE.BEFORE,
      },
      {
        title: _l('填写后更新'),
        desc: _l('节点通过后，更新数据对象的字段值'),
        key: OPERATION_TYPE.PASS,
      },
    ];

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-workflow_write"
          bg="BGSkyBlue"
          updateSource={this.updateSource}
        />
        <div className="flex">
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

              <div className="Font13 mTop25 bold">{_l('指定人')}</div>

              <Member
                companyId={this.props.companyId}
                appId={this.props.relationType === 2 ? this.props.relationId : ''}
                accounts={data.accounts}
                updateSource={this.updateSource}
              />
              <div
                className="mTop12 flexRow ThemeColor3 workflowDetailAddBtn"
                onClick={() => this.setState({ showSelectUserDialog: true })}
              >
                <i className="Font28 icon-task-add-member-circle mRight10" />
                {_l('指定填写人')}
                <SelectUserDropDown
                  appId={this.props.relationType === 2 ? this.props.relationId : ''}
                  visible={showSelectUserDialog}
                  companyId={this.props.companyId}
                  processId={this.props.processId}
                  nodeId={this.props.selectNodeId}
                  accounts={data.accounts}
                  updateSource={this.updateSource}
                  onClose={() => this.setState({ showSelectUserDialog: false })}
                />
              </div>

              {this.renderTabs()}

              {tabIndex === 1 && (
                <Fragment>
                  <div className="Font13 mTop20 bold">{_l('填写人操作')}</div>
                  <Checkbox
                    className="mTop15 flexRow"
                    text={_l('暂存')}
                    checked={_.includes(data.operationTypeList, 13)}
                    onClick={checked => this.switchWriteSettings(!checked, 13)}
                  />
                  <Checkbox
                    className="mTop15 flexRow"
                    text={_l('转交他人填写')}
                    checked={_.includes(data.operationTypeList, 10)}
                    onClick={checked => this.switchWriteSettings(!checked, 10)}
                  />
                  {_.includes(data.operationTypeList, 10) && (
                    <UserRange
                      {...this.props}
                      operationUserRange={data.operationUserRange}
                      operationType="10"
                      title={_l('可转交给：')}
                      btnText={_l('添加候选人')}
                      updateSource={({ accounts }) => this.updateSource({ operationUserRange: { [10]: accounts } })}
                    />
                  )}

                  <OperatorEmpty
                    projectId={this.props.companyId}
                    appId={this.props.relationType === 2 ? this.props.relationId : ''}
                    isApproval={this.props.isApproval}
                    title={_l('填写人为空时')}
                    titleInfo={_l(
                      '设置当前节点负责人为空时的处理方式。当使用默认设置时，按照流程发起节点中设置的统一的处理方式',
                    )}
                    showDefaultItem
                    userTaskNullMap={data.userTaskNullMap}
                    updateSource={userTaskNullMap => this.updateSource({ userTaskNullMap })}
                  />

                  <div className="Font13 mTop25 bold">{_l('安全')}</div>
                  <Checkbox
                    className="mTop15 flexRow alignItemsCenter"
                    text={
                      <span>
                        {_l('登录密码验证')}
                        <Tooltip
                          popupPlacement="bottom"
                          text={<span>{_l('启用后，用户输入登录密码后才可进行提交')}</span>}
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
                    onClick={checked => this.updateSource({ encrypt: !checked })}
                  />

                  <div className="Font13 bold mTop25">{_l('填写说明')}</div>
                  <CustomTextarea
                    projectId={this.props.companyId}
                    processId={this.props.processId}
                    relationId={this.props.relationId}
                    selectNodeId={this.props.selectNodeId}
                    type={2}
                    height={0}
                    content={data.explain}
                    formulaMap={data.formulaMap}
                    onChange={(err, value, obj) => this.updateSource({ explain: value })}
                    updateSource={this.updateSource}
                  />

                  <ButtonName
                    buttons={[{ key: 'submitBtnName', title: _l('提交按钮'), placeholder: _l('提交') }]}
                    data={data}
                    updateSource={this.updateSource}
                  />

                  <PromptSoundDialog
                    {...this.props}
                    promptSound={data.flowNodeMap[OPERATION_TYPE.PROMPT_SOUND].promptSound}
                    formulaMap={data.flowNodeMap[OPERATION_TYPE.PROMPT_SOUND].formulaMap}
                    updateSource={obj => this.updateFlowMapSource(OPERATION_TYPE.PROMPT_SOUND, obj)}
                  />

                  <div className="Font13 mTop25 bold">{_l('其他')}</div>
                  <EmailApproval
                    {...this.props}
                    title={_l('启用邮件通知')}
                    desc={
                      <span>
                        {_l('启用后，待办消息同时会以邮件的形式发送给相关负责人。')}
                        {(!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal')) &&
                          _l('邮件%0/封，将自动从企业账户扣除。', _.get(md, 'global.PriceConfig.EmailPrice'))}
                      </span>
                    }
                    flowNodeMap={data.flowNodeMap[OPERATION_TYPE.EMAIL]}
                    updateSource={(obj, callback) => this.updateFlowMapSource(OPERATION_TYPE.EMAIL, obj, callback)}
                  />
                  <Checkbox
                    className="mTop15 flexRow"
                    text={<span>{_l('开启限时处理')}</span>}
                    checked={(data.schedule || {}).enable}
                    onClick={checked =>
                      this.updateSource({ schedule: Object.assign({}, data.schedule, { enable: !checked }) })
                    }
                  />
                  <Schedule {...this.props} schedule={data.schedule} updateSource={this.updateSource} />
                </Fragment>
              )}

              {tabIndex === 2 && (
                <Fragment>
                  <div className="Gray_75 mTop20">
                    {_l('设置填写时可以查看、编辑、必填的字段。设为摘要的字段可以在流程待办列表中直接显示。')}
                    <Support
                      type={3}
                      text={_l('帮助')}
                      className="ThemeColor3 ThemeHoverColor2"
                      href="https://help.mingdao.com/workflow/node-approve#field"
                    />
                  </div>

                  {data.selectNodeId ? (
                    <div className="Font13 mTop15">
                      {data.selectNodeObj.nodeName && !data.selectNodeObj.appName ? (
                        <div className="Gray_75 Font13 flexRow flowDetailTips">
                          <i className="icon-task-setting_promet Font16 Gray_9e" />
                          <div
                            className="flex mLeft10"
                            dangerouslySetInnerHTML={{
                              __html: _l(
                                '节点所使用的数据来源%0中的工作表已删除。必须修复此节点中的错误，或重新指定一个有效的对象后才能设置可填写字段。',
                                `<span class="mLeft5 mRight5 flowDetailTipsColor">“${data.selectNodeObj.nodeName}”</span>`,
                              ),
                            }}
                          />
                        </div>
                      ) : (
                        <WriteFields
                          data={data.formProperties}
                          addNotAllowView={data.addNotAllowView}
                          updateSource={this.updateSource}
                          showCard={true}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="Gray_75 Font13 flexRow flowDetailTips mTop15">
                      <i className="icon-task-setting_promet Font16 Gray_9e" />
                      <div className="flex mLeft10">{_l('必须先选择一个对象后，才能设置字段权限')}</div>
                    </div>
                  )}
                </Fragment>
              )}

              {tabIndex === 3 && (
                <Fragment>
                  {data.selectNodeId ? (
                    SOURCE_HANDLE_LIST.map((item, index) => {
                      const sourceData = data.flowNodeMap[item.key] || {};

                      return (
                        <Fragment key={item.key}>
                          <div className={cx('Font13 bold', index === 0 ? 'mTop20' : 'mTop25')}>{item.title}</div>
                          <div className="Font13 Gray_75 mTop10">{item.desc}</div>
                          <UpdateFields
                            type={1}
                            companyId={this.props.companyId}
                            processId={this.props.processId}
                            relationId={this.props.relationId}
                            selectNodeId={this.props.selectNodeId}
                            nodeId={sourceData.selectNodeId}
                            controls={sourceData.controls.filter(o => o.type !== 29)}
                            fields={sourceData.fields}
                            showCurrent={true}
                            filterType={item.key === OPERATION_TYPE.BEFORE ? 7 : 0}
                            formulaMap={sourceData.formulaMap}
                            updateSource={(obj, callback = () => {}) =>
                              this.updateSource(
                                {
                                  flowNodeMap: Object.assign({}, data.flowNodeMap, {
                                    [item.key]: Object.assign({}, data.flowNodeMap[item.key], obj),
                                  }),
                                },
                                callback,
                              )
                            }
                          />
                        </Fragment>
                      );
                    })
                  ) : (
                    <div className="Gray_75 Font13 flexRow flowDetailTips mTop25">
                      <i className="icon-task-setting_promet Font16 Gray_9e" />
                      <div className="flex mLeft10">{_l('必须先选择一个对象后，才能设置数据更新')}</div>
                    </div>
                  )}
                </Fragment>
              )}
            </div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.selectNodeId} onSave={this.onSave} />
      </Fragment>
    );
  }
}
