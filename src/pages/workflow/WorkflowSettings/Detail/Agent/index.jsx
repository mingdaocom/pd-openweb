import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox, Icon, LoadDiv, PriceTip, ScrollView, Support, SvgIcon, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { dialogSelectIntegrationApi } from 'ming-ui/functions';
import flowNode from '../../../api/flowNode';
import process from '../../../api/process';
import { openAgentPromptGenBot } from 'src/components/Mingo/modules/AgentPromptGenBot';
import selectPBPDialog from '../../../components/selectPBPDialog';
import { AGENT_TOOLS, APP_TYPE } from '../../enum';
import {
  CustomTextarea,
  DetailFooter,
  DetailHeader,
  OutputList,
  SelectAIModel,
  SpecificFieldsValue,
} from '../components';
import selectWorksheet from './selectWorksheet';
import worksheetFilter from './worksheetFilter';

const AI_HELP_BTN = styled.div`
  color: var(--color-mingo-light);
  font-size: 12px;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    color: var(--color-mingo-dark);
  }
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
      border-bottom: 3px solid var(--color-primary);
    }
  }
`;

const TOOLS_ITEM = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 4px;
  border: 1px solid var(--color-border-primary);
  margin-top: 12px;
  &:hover {
    .icon-edit {
      display: block;
    }
  }
  .agentToolsIcon {
    background: #eee3ff;
    color: var(--color-mingo-dark);
    font-size: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    align-self: flex-start;
  }
  input {
    background: transparent;
    border: none;
    font-weight: bold;
    padding: 0;
  }
  .icon-edit {
    display: none;
  }
  .red {
    color: var(--color-error);
  }
`;

const MORE_TOOLS_LIST = styled.div`
  background: var(--color-background-primary);
  box-shadow: 0 3px 6px 1px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  width: 752px;
  padding: 6px 0;
  .desc {
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
  .listItem {
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 16px;
    cursor: pointer;
    &:hover {
      background: var(--color-background-hover);
    }
    .agentToolsIcon {
      background: #eee3ff;
      color: var(--color-mingo-dark);
      font-size: 16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
    }
  }
`;

const SHEET_LIST = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 0 15px 0 12px;
  height: 48px;
  background: var(--color-background-secondary);
  border-radius: 4px;
  font-size: 0;
  &.red {
    color: var(--color-error);
  }
`;

const REQUIRED_TEXT = styled.span`
  color: var(--color-error);
  position: absolute;
  top: 2px;
  left: -10px;
`;

const AI_ACTIONS_BOX = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 40px;
  border: 1px solid var(--color-border-primary);
  border-top-width: 0;
  border-radius: 0 0 4px 4px;
  margin-right: 36px;
  .ai_actions_checkbox {
    margin-left: 10px;
    height: 28px;
    border-radius: 14px;
    background-color: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
    .Checkbox {
      height: 100%;
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
    }
  }
`;

export default class Agent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      saveRequest: false,
      tabIndex: 1,
      selectToolId: '',
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
    this.mounted = true;
  }

  componentWillReceiveProps(nextProps) {
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

  componentWillUnmount() {
    this.mounted = false;
  }

  /**
   * 获取节点详情
   */
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId })
      .then(result => {
        this.setState({ data: result });
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
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const {
      name,
      model,
      temperature,
      maxTokens,
      input,
      file,
      prompt,
      maxMessages,
      tools,
      outputs,
      checkUserPermission,
      switchReplyPrompt,
      switchDetail,
      switchDiscussion,
    } = data;
    let hasError = false;

    (outputs || []).forEach(item => {
      if (!item.controlName) {
        hasError = true;
      }
    });

    if (saveRequest) {
      return;
    }
    if (!prompt.trim()) {
      alert(_l('提示词不能为空'), 2);
      return;
    }

    if (hasError) {
      alert(_l('输出参数配置有误'), 2);
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        model,
        temperature,
        maxTokens: maxTokens || null,
        input,
        file,
        prompt,
        tools,
        maxMessages,
        outputs,
        checkUserPermission,
        switchReplyPrompt: data.outputs.length ? false : switchReplyPrompt,
        switchDetail,
        switchDiscussion,
      })
      .then(result => {
        location.href.includes('worksheet/formSet/edit') && this.publish();
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 发布流程
   */
  publish = () => {
    process.publish({ isPublish: true, processId: this.props.processId });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { flowInfo, workflowDetail, selectNodeId, isAIActions } = this.props;
    const { tabIndex, data } = this.state;
    const isFirstAgent =
      flowInfo.startAppType === APP_TYPE.CHATBOT &&
      workflowDetail.flowNodeMap[flowInfo.startNodeId].nextId === selectNodeId;
    const TABS = [
      { text: _l('工具'), value: 1 },
      { text: _l('结构化输出'), value: 2 },
    ];

    if (isAIActions) {
      _.remove(TABS, item => item.value === 2);
    }

    return (
      <Fragment>
        {this.renderModel()}

        {this.renderMessage('prompt')}

        {isFirstAgent && (
          <AI_ACTIONS_BOX>
            <div className="Font14 bold">{_l('向 Agent 提供')}</div>
            <Tooltip title={_l('用户在对话中发送的消息和附件将作为上下文提供给 AI Agent')}>
              <div className="ai_actions_checkbox pLeft12 pRight12 Font13 inlineFlexRow alignItemsCenter">
                {_l('用户消息')}
              </div>
            </Tooltip>
          </AI_ACTIONS_BOX>
        )}

        {isAIActions && (
          <AI_ACTIONS_BOX>
            <div className="Font14 bold">{_l('向 Agent 提供当前记录')}</div>
            <Tooltip
              title={_l('勾选后，将向 AI Agent 提供除附件外的所有字段信息。如需使用附件，请在动态值中手动添加。')}
            >
              <div className="ai_actions_checkbox">
                <Checkbox
                  size="small"
                  text={_l('所有字段')}
                  checked={data.switchDetail}
                  onClick={checked => this.updateSource({ switchDetail: !checked })}
                />
              </div>
            </Tooltip>
            <Tooltip title={_l('勾选后，系统会将当前记录的最近50条讨论信息提供给 AI Agent')}>
              <div className="ai_actions_checkbox">
                <Checkbox
                  size="small"
                  text={_l('讨论信息')}
                  checked={data.switchDiscussion}
                  onClick={checked => this.updateSource({ switchDiscussion: !checked })}
                />
              </div>
            </Tooltip>
          </AI_ACTIONS_BOX>
        )}

        {!isFirstAgent && !isAIActions && this.renderMessage('file')}

        {(isFirstAgent || isAIActions) && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('记忆轮次')}</div>
            <div className="Font12 textSecondary mTop5">
              {_l(
                'AI Agent 节点可参考的历史消息轮数。轮数越多，模型对上下文的理解能力越强，但同时会增加上下文处理负载与 Token 消耗',
              )}
            </div>
            <div className="mTop10" style={{ width: 150 }}>
              <SpecificFieldsValue
                type="number"
                min={0}
                max={10}
                hasOtherField={false}
                data={{ fieldValue: data.maxMessages }}
                updateSource={({ fieldValue }) => this.updateSource({ maxMessages: fieldValue })}
              />
            </div>
          </Fragment>
        )}

        {isFirstAgent && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('其他')}</div>
            <div className="flexRow mTop10 alignItemsCenter">
              <Switch
                className="mRight10"
                checked={data.switchReplyPrompt && !data.outputs.length}
                disabled={!!data.outputs.length}
                size="small"
                onClick={() => this.updateSource({ switchReplyPrompt: !data.switchReplyPrompt })}
              />
              {_l('使用系统预设的回复风格')}
              <Tooltip
                title={
                  data.outputs.length
                    ? _l('配置结构化输出后，无法使用预设风格')
                    : _l('开启后，Agent 按系统预设的格式、语气与结构回复；关闭后，可在提示词中约束回复风格。')
                }
              >
                <Icon className="Font16 textTertiary mLeft5" icon="info" />
              </Tooltip>
            </div>
          </Fragment>
        )}

        <div className="mTop30" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
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

        {tabIndex === 1 && this.renderTool()}
        {tabIndex === 2 && this.renderOutputParameter()}
      </Fragment>
    );
  }

  // 渲染模型
  renderModel() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold">{_l('模型')}</div>
        {window.platformENV.isPlatform ? (
          <div className="Font13 textSecondary mTop5">
            {_l('选择用于 AI Agent 的大语言模型。Token 消耗将从组织信用点扣除')}
            <Support type={3} text={_l('了解模型价格')} href={md.global.Config.WebUrl + 'billingrules'} />
          </div>
        ) : (
          <div className="Font13 textSecondary mTop5">{_l('选择用于 AI Agent 的大语言模型。')}</div>
        )}
        <SelectAIModel data={data} showAutoModel showModelSettings updateSource={this.updateSource} />
      </Fragment>
    );
  }

  // 渲染智能体信息
  renderMessage(key) {
    const { flowInfo, workflowDetail, selectNodeId, isAIActions } = this.props;
    const { data } = this.state;
    const isFirstAgent =
      flowInfo.startAppType === APP_TYPE.CHATBOT &&
      workflowDetail.flowNodeMap[flowInfo.startNodeId].nextId === selectNodeId;
    const MESSAGE_MAPS = {
      file: {
        title: _l('文件'),
        info: _l(
          '非图片类附件会先进行文本解析（免费），解析结果将作为上下文发送给模型，可能增加 Token 消耗。图片附件将直接发送给模型处理，是否可识别取决于所选模型是否支持图片理解',
        ),
      },
      prompt: {
        title: _l('提示词'),
        info: _l(
          '描述 AI Agent 节点的角色定位、任务目标及注意事项。优质的提示词能显著提升回答准确性。可使用“AI 生成”辅助生成',
        ),
        required: true,
        desc: (
          <Fragment>
            <div>{_l('填写角色描述与回答要求。')}</div>
            <div>{_l('尝试描述：Agent 需要完成什么任务、服务什么用户、需要避免那些行为？')}</div>
          </Fragment>
        ),
      },
    };
    const source = MESSAGE_MAPS[key];

    return (
      <Fragment>
        <div className="Font13 bold mTop20 relative">
          {source.required && <REQUIRED_TEXT>*</REQUIRED_TEXT>}
          {source.title}
          <Tooltip title={source.info}>
            <Icon className="Font16 textTertiary mLeft5" icon="info" />
          </Tooltip>
        </div>
        <div className="Font13 flexRow" style={{ alignItems: 'end' }}>
          {source.desc && <div className="textSecondary">{source.desc}</div>}
          <div className="flex" />
          {key === 'prompt' && !md.global?.SysSettings?.hideAIBasicFun && (
            <AI_HELP_BTN
              onClick={() => {
                openAgentPromptGenBot({
                  appId: flowInfo.relationId,
                  userLanguage: md.global.Account.lang,
                  nodeName: data.name,
                  nodeDescription: flowInfo.explain,
                  existingPrompt: data.prompt,
                  onUse: promptText => this.mounted && this.updateSource({ prompt: promptText }),
                });
              }}
            >
              {_l('AI 生成')}
              <i className="Font14 icon-auto_awesome mLeft5" />
            </AI_HELP_BTN>
          )}
        </div>
        <CustomTextarea
          className={cx({ minH100: key === 'prompt', clearBorderBottomRadius: isFirstAgent || isAIActions })}
          projectId={this.props.companyId}
          processId={this.props.processId}
          relationId={this.props.relationId}
          selectNodeId={this.props.selectNodeId}
          onlyOneValue={key === 'file'}
          errorMessage={key === 'file' ? _l('附件上传未启用。前往“编辑对话机器人 > 其他”启用“上传附件”') : ''}
          type={key === 'file' ? 14 : 2}
          height={0}
          content={data[key]}
          formulaMap={data.formulaMap}
          onChange={(err, value) => this.updateSource({ [key]: value })}
          updateSource={this.updateSource}
        />
      </Fragment>
    );
  }

  // 渲染工具
  renderTool() {
    const { flowInfo } = this.props;
    const { data } = this.state;
    const isChatBot = flowInfo.startAppType === APP_TYPE.CHATBOT;
    const MORE_TOOLS = [3, 1, 2, 4, 7, 8, 6, 5]
      .map(key => ({ text: AGENT_TOOLS[key].displayName, type: key }))
      .filter(
        o =>
          !_.includes(
            data.tools.filter(o => _.includes([1, 2, 3, 4, 7, 8], o.type) && o.enabled).map(o => o.type),
            o.type,
          ),
      );
    const worksheetTools = data.tools.filter(o => _.includes([1, 2, 3, 4], o.type) && o.enabled);
    const otherTools = data.tools.filter(o => !_.includes([1, 2, 3, 4], o.type));

    return (
      <Fragment>
        <div className="Font12 textSecondary mTop20">
          {_l('在下方配置AI Agent可以使用的工具。AI Agent将尝试调用工具完成任务')}
        </div>
        {!!worksheetTools.length && (
          <Fragment>
            <div className="flexRow alignItemsCenter mTop20">
              <div className="bold Font12 textSecondary flex">{_l('数据处理')}</div>
              {isChatBot && (
                <Fragment>
                  <Checkbox
                    className="InlineFlex"
                    text={_l('按用户权限')}
                    checked={data.checkUserPermission}
                    onClick={checked => this.updateSource({ checkUserPermission: !checked })}
                  />
                  <Tooltip
                    placement="topRight"
                    title={_l(
                      '取消勾选后，工具执行时将忽略用户数据权限，Agent 可访问并返回超出用户权限范围的数据，谨慎操作。',
                    )}
                  >
                    <i className="Font14 icon-help textTertiary mLeft5" />
                  </Tooltip>
                </Fragment>
              )}
            </div>
            {worksheetTools.map(item => this.renderToolsList(item))}
          </Fragment>
        )}

        {!!otherTools.length && (
          <Fragment>
            <div className="bold Font12 textSecondary mTop20">{_l('更多工具')}</div>
            {otherTools.map(item => this.renderToolsList(item))}
          </Fragment>
        )}

        <div className="Font13 mTop15">
          <Trigger
            ref={triggerRef => (this.triggerRef = triggerRef)}
            popup={() => (
              <MORE_TOOLS_LIST>
                {MORE_TOOLS.map((o, index) => {
                  const tool = AGENT_TOOLS[o.type];
                  const getNewTool = (configs = [], name) => ({
                    auto: !configs.length,
                    configs,
                    enabled: true,
                    name: o.text + (name ? `-${name}` : ''),
                    toolId: uuidv4(),
                    type: o.type,
                  });

                  return (
                    <Fragment key={o.type}>
                      {index === 0 && _.includes([1, 2, 3, 4], o.type) && <div className="desc">{_l('数据处理')}</div>}
                      {((index === 0 && !_.includes([1, 2, 3, 4], o.type)) ||
                        (index !== 0 && index === MORE_TOOLS.filter(o => _.includes([1, 2, 3, 4], o.type)).length)) && (
                        <div className="desc">{_l('更多工具')}</div>
                      )}
                      <div
                        className="listItem"
                        onClick={() => {
                          this.triggerRef.close();

                          if (_.includes([1, 2, 3, 4], o.type)) {
                            this.updateTool(data.tools.filter(obj => obj.type === o.type)[0].toolId, { enabled: true });
                          }

                          if (o.type === 5) {
                            dialogSelectIntegrationApi({
                              projectId: this.props.companyId,
                              appId: this.props.relationId,
                              excludeTypes: [3],
                              onOk: (id, name) => {
                                if (!data.tools.find(o => o.type === 5 && o.configs[0].appId === id)) {
                                  this.updateSource({
                                    tools: data.tools.concat(getNewTool([{ appId: id, appName: name }], name)),
                                  });
                                }
                              },
                            });
                          }

                          if (o.type === 6) {
                            selectPBPDialog({
                              companyId: this.props.companyId,
                              appId: this.props.relationId,
                              onOk: ({ selectPBCId, selectPBCName }) => {
                                if (!data.tools.find(o => o.type === 6 && o.configs[0].appId === selectPBCId)) {
                                  this.updateSource({
                                    tools: data.tools.concat(
                                      getNewTool([{ appId: selectPBCId, appName: selectPBCName }], selectPBCName),
                                    ),
                                  });
                                }
                              },
                            });
                          }

                          if (_.includes([7, 8], o.type)) {
                            this.updateSource({ tools: data.tools.concat(getNewTool()) });
                          }
                        }}
                      >
                        <div className="agentToolsIcon">
                          <i className={tool.icon} />
                        </div>
                        <div>{o.text}</div>
                      </div>
                    </Fragment>
                  );
                })}
              </MORE_TOOLS_LIST>
            )}
            action="click"
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [0, 5],
              overflow: { adjustX: true, adjustY: true },
            }}
          >
            <span className="pointer textTertiary ThemeHoverColor3">+ {_l('添加工具')}</span>
          </Trigger>
        </div>
      </Fragment>
    );
  }

  // 渲染工具列表
  renderToolsList = item => {
    const { flowInfo, selectNodeId } = this.props;
    const { data, selectToolId } = this.state;
    const isChatBot = flowInfo.startAppType === APP_TYPE.CHATBOT;
    const tool = AGENT_TOOLS[item.type];
    const isDelete = _.includes([5, 6], item.type) && !item.configs[0]?.appName;

    return (
      <TOOLS_ITEM key={item.toolId}>
        <div className="agentToolsIcon" style={{ backgroundColor: tool.color }}>
          <i className={tool.icon} />
        </div>
        <div className="flex flexColumn minWidth0">
          <div className="flexRow alignItemsCenter">
            <div className="flexColumn justifyContentCenter flex minWidth0">
              <div className="flexRow alignItemsCenter">
                {selectToolId === item.toolId ? (
                  <input
                    type="text"
                    className="flex"
                    autoFocus
                    value={item.name}
                    onFocus={() => (this.cacheName = item.name)}
                    onChange={evt => this.updateTool(item.toolId, { name: evt.target.value })}
                    onBlur={evt => {
                      this.updateTool(item.toolId, { name: evt.target.value.trim() || this.cacheName });
                      this.setState({ selectToolId: '' });
                    }}
                  />
                ) : (
                  <div
                    className={cx('Font14 bold ellipsis', {
                      red: isDelete,
                    })}
                  >
                    {isDelete
                      ? item.type === 5
                        ? _l('API已删除')
                        : _l('封装业务流程已删除')
                      : _.includes([1, 2, 3, 4], item.type)
                        ? AGENT_TOOLS[item.type].displayName
                        : item.name}
                  </div>
                )}

                {item.type === 4 && (
                  <Tooltip title={_l('对工作表数据进行分组统计汇总，帮助 Agent 在流程中自动完成统计分析与结果判断')}>
                    <Icon className="Font14 textTertiary mLeft5" icon="info" />
                  </Tooltip>
                )}

                {tool.range && (
                  <div
                    className="Font13 ThemeColor3 ThemeHoverColor2 pointer mLeft10"
                    onClick={() =>
                      selectWorksheet({
                        appId: this.props.relationId,
                        selectIds: item.configs.map(o => o.appId),
                        onOk: o => {
                          this.updateTool(item.toolId, {
                            auto: !o.length,
                            configs: !o.length
                              ? []
                              : o.map(info => {
                                  return {
                                    appId: info.workSheetId,
                                    appName: info.workSheetName,
                                    iconColor: info.iconColor,
                                    iconUrl: info.iconUrl,
                                    filters: [],
                                  };
                                }),
                          });
                        },
                      })
                    }
                  >
                    {_l('设置工作表范围')}
                  </div>
                )}

                {!tool.range && _.includes([5, 6], item.type) && !selectToolId && !isDelete && (
                  <i
                    className="Font12 icon-task-new-detail ThemeColor3 ThemeHoverColor2 pointer mLeft10"
                    onClick={() =>
                      window.open(`${item.type === 5 ? '/integrationApi' : '/workflowedit'}/${item.configs[0].appId}`)
                    }
                  />
                )}

                {!tool.range && !selectToolId && !isDelete && (
                  <i
                    className="Font16 textSecondary ThemeHoverColor3 pointer icon-edit mLeft10"
                    onClick={() => this.setState({ selectToolId: item.toolId })}
                  />
                )}

                <div className="flex" />
              </div>

              {tool.range && (
                <div className="Font12 textSecondary">{item.auto ? tool.autoRange : tool.specificRange}</div>
              )}
              {item.type === 8 && window.platformENV.isPlatform && (
                <div className="Font12 textSecondary">
                  <PriceTip text={_l('邮件费用自动从组织信用点中扣除')} />
                </div>
              )}
            </div>

            <div className="mLeft12">
              <i
                className="Font16 pointer textTertiary ThemeHoverColor3 icon-trash"
                onClick={() => {
                  if (_.includes([1, 2, 3, 4], item.type)) {
                    this.updateTool(item.toolId, { enabled: !item.enabled });
                  } else {
                    this.updateSource({ tools: data.tools.filter(o => o.toolId !== item.toolId) });
                  }
                }}
              />
            </div>
          </div>

          {isChatBot && !_.includes([3, 4], item.type) && !isDelete && (
            <div className="mTop3">
              <Checkbox
                className="textSecondary"
                text={_l('调用前需用户确认')}
                checked={item.requireUserConfirmation}
                onClick={checked => this.updateTool(item.toolId, { requireUserConfirmation: !checked })}
              />
            </div>
          )}

          {_.includes([1, 2, 3, 4], item.type) &&
            item.configs.map(o => (
              <SHEET_LIST key={o.appId}>
                <SvgIcon url={o.iconUrl} fill={o.iconColor} size={16} />
                <div className={cx('Font14 bold mLeft5 flex ellipsis', { red: !o.appName })}>
                  {o.appName || _l('工作表已删除')}
                </div>

                {_.includes([3, 4], item.type) && (
                  <i
                    className="Font16 pointer textTertiary ThemeHoverColor3 icon-settings mLeft15"
                    onClick={() =>
                      worksheetFilter({
                        ...this.props,
                        data,
                        worksheetId: o.appId,
                        nodeId: o.nodeId || selectNodeId,
                        filter: o.filters,
                        updateSource: this.updateSource,
                        onOk: filters =>
                          this.updateTool(item.toolId, {
                            configs: item.configs.map(info => {
                              return info.appId === o.appId ? { ...info, filters } : info;
                            }),
                          }),
                      })
                    }
                  />
                )}

                <i
                  className="Font16 pointer textTertiary ThemeHoverColor3 icon-closeelement-bg-circle mLeft15"
                  onClick={() =>
                    this.updateTool(item.toolId, {
                      configs: item.configs.filter(info => info.appId !== o.appId),
                    })
                  }
                />
              </SHEET_LIST>
            ))}
        </div>
      </TOOLS_ITEM>
    );
  };

  // 更新工具配置
  updateTool = (toolId, obj) => {
    const { data } = this.state;

    this.updateSource({
      tools: data.tools.map(o => {
        if (o.toolId === toolId) {
          return { ...o, ...obj };
        }

        return o;
      }),
    });
  };

  // 渲染输出参数
  renderOutputParameter() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font12 textSecondary mTop20">
          {_l(
            '结构化输出用于定义 Agent 在执行后返回的字段与格式。你可以添加多个参数并为每个参数编写说明，Agent 将根据说明尝试生成结果，供后续流程引用。参数输出结果依赖大模型的理解能力，复杂场景下建议增加校验或人工复核。',
          )}
        </div>

        <OutputList outputType={3} data={data} updateSource={this.updateSource} />
      </Fragment>
    );
  }

  render() {
    const { data } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-AI_Agent"
          bg="BGDarkViolet"
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.prompt.trim()} onSave={this.onSave} />
      </Fragment>
    );
  }
}
