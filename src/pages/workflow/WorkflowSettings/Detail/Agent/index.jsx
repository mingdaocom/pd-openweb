import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Icon, LoadDiv, PriceTip, ScrollView, Support, SvgIcon } from 'ming-ui';
import { Checkbox, Input, Modal, Popover, Switch, Tooltip } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import flowNode from '../../../api/flowNode';
import process from '../../../api/process';
import { dialogSelectIntegrationApi } from 'src/components/dialogSelectIntegrationApi';
import { openAgentPromptGenBot } from 'src/components/Mingo/modules/AgentPromptGenBot';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getFeatureStatus } from 'src/utils/services/project';
import flowNodeV2 from '../../../apiV2/flowNode';
import { useSelectPBPDialog } from '../../../components/selectPBPDialog';
import { AGENT_TOOLS, APP_TYPE, SEARCH_MODE_MAP } from '../../enum';
import {
  CustomTextarea,
  DeletedOrUnopenedSandboxTitle,
  DetailFooter,
  DetailHeader,
  OutputList,
  SelectAIModel,
  VectorKnowledge,
} from '../components';
import { useSelectWorksheetDialog } from './selectWorksheet';
import { useWorksheetFilterDialog } from './worksheetFilter';

const AI_HELP_BTN = styled.div`
  color: var(--color-mingo-light);
  font-size: 12px;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    color: var(--color-mingo-dark);
  }
`;

const AI_RECOMMEND = styled.div`
  color: var(--color-primary);
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  margin-left: 12px;
  white-space: nowrap;
  &.disabled {
    cursor: default;
    opacity: 0.6;
    pointer-events: none;
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
  .icon-edit {
    display: none;
  }
  .red {
    color: var(--color-error);
  }
`;

const MORE_TOOLS_LIST = styled.div`
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
  min-height: 48px;
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
    padding: 3px 10px;
    border-radius: 14px;
    background-color: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
  }
`;

const DATA_PROCESSING_TOOL_TYPES = [1, 2, 3, 4, 10];
const WORKSHEET_RANGE_TOOL_TYPES = [1, 2, 3, 4];
const SINGLETON_TOOL_TYPES = DATA_PROCESSING_TOOL_TYPES.concat([7, 8, 9]);
const NO_CONFIRM_TOOL_TYPES = [3, 4, 9, 10];
const EDITABLE_TOOL_TYPES = [5, 6, 7, 8, 9];

class Agent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      saveRequest: false,
      recommendModelRequest: false,
      tabIndex: 1,
      selectToolId: '',
      moreToolsVisible: false,
      showVectorDialog: false,
      toolNode: {},
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
    this.mounted = true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.selectNodeId !== prevProps.selectNodeId) {
        this.getNodeDetail(this.props);
      }

      if (
        this.props.selectNodeName &&
        this.props.selectNodeName !== prevProps.selectNodeName &&
        this.props.selectNodeId === prevProps.selectNodeId &&
        !_.isEmpty(this.state.data)
      ) {
        this.updateSource({
          name: this.props.selectNodeName,
        });
      }
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
        if (!this.cacheResult) {
          this.cacheResult = _.cloneDeep(result);
        }

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

  getAgentNodeRequest = () => {
    const { data } = this.state;
    const {
      name,
      model,
      temperature,
      maxTokens,
      input,
      file,
      prompt,
      tools,
      outputs,
      checkUserPermission,
      switchReplyPrompt,
      switchDetail,
      switchDiscussion,
      enableImageRecognition,
    } = data;

    return {
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
      outputs,
      checkUserPermission,
      switchReplyPrompt: outputs.length ? false : switchReplyPrompt,
      switchDetail,
      switchDiscussion,
      enableImageRecognition: !!enableImageRecognition,
    };
  };

  recommendModel = () => {
    if (this.recommendModelRequest) {
      return;
    }

    const recommendNodeId = this.props.selectNodeId;

    this.recommendModelRequest = true;
    this.setState({ recommendModelRequest: true });

    return flowNodeV2
      .recommendAgentModel(this.getAgentNodeRequest())
      .then(model => {
        if (this.mounted && model && this.props.selectNodeId === recommendNodeId) {
          this.updateSource({ model });
        }
      })
      .finally(() => {
        this.recommendModelRequest = false;

        if (this.mounted) {
          this.setState({ recommendModelRequest: false });
        }
      });
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { prompt, outputs } = data;
    let hasError = false;

    (outputs || []).forEach(item => {
      if (!item.controlName) {
        hasError = true;
      }
    });

    if (!prompt.trim()) {
      alert(_l('提示词不能为空'), 2);
      return;
    }

    if (hasError) {
      alert(_l('输出参数配置有误'), 2);
      return;
    }

    if (saveRequest || _.isEqual(data, this.cacheResult)) {
      return;
    }

    flowNode.saveNode(this.getAgentNodeRequest()).then(result => {
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
                  checked={data.switchDetail}
                  onChange={event =>
                    this.updateSource({
                      switchDetail: event.target.checked,
                    })
                  }
                  size="small"
                >
                  {_l('所有字段')}
                </Checkbox>
              </div>
            </Tooltip>
            <Tooltip title={_l('勾选后，系统会将当前记录的最近50条讨论信息提供给 AI Agent')}>
              <div className="ai_actions_checkbox">
                <Checkbox
                  checked={data.switchDiscussion}
                  onChange={event =>
                    this.updateSource({
                      switchDiscussion: event.target.checked,
                    })
                  }
                  size="small"
                >
                  {_l('讨论信息')}
                </Checkbox>
              </div>
            </Tooltip>
          </AI_ACTIONS_BOX>
        )}

        {!isFirstAgent && !isAIActions && this.renderMessage('file')}

        {(isFirstAgent || isAIActions) && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('其他')}</div>
            <div className="flexRow mTop10 alignItemsCenter">
              <Switch
                className="mRight10"
                checked={data.switchReplyPrompt && !data.outputs.length}
                disabled={!!data.outputs.length}
                size="small"
                onClick={(checked, event) => {
                  event.stopPropagation();
                  return this.updateSource({
                    switchReplyPrompt: !data.switchReplyPrompt,
                  });
                }}
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
    const { data, recommendModelRequest } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold">{_l('模型')}</div>
        <div className="Font13 textSecondary mTop5 flexRow alignItemsCenter">
          <div className="flex">
            {window.platformENV.isPlatform ? (
              <Fragment>
                {_l('选择用于 AI Agent 的大语言模型。Token 消耗将从组织信用点扣除')}
                <Support type={3} text={_l('了解模型价格')} href={pathCompletion('/billingrules')} />
              </Fragment>
            ) : (
              _l('选择用于 AI Agent 的大语言模型。')
            )}
          </div>
          <AI_RECOMMEND className={cx({ disabled: recommendModelRequest })} onClick={this.recommendModel}>
            {recommendModelRequest && <i className="Font13 icon-loading_button mRight5" />}
            {_l('AI 推荐')}
          </AI_RECOMMEND>
        </div>
        <SelectAIModel
          projectId={this.props?.companyId}
          appId={this.props.flowInfo?.relationId || this.props?.relationId}
          data={data}
          emptyModelText={_l('未选择时，系统自动推荐')}
          showImageRecognition
          showModelSettings
          updateSource={this.updateSource}
        />
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
        <div className="Font13 bold mTop20 relative flexRow alignItemsCenter">
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
          showNodeDataSelect={key === 'prompt'}
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
    const { flowInfo, isAIActions, companyId } = this.props;
    const { data } = this.state;
    const isChatBot = flowInfo.startAppType === APP_TYPE.CHATBOT;
    const MORE_TOOLS = [3, 1, 2, 10, 4, 7, 8, 6, 5, 9]
      .filter(
        key =>
          key !== 9 ||
          (!md.global?.SysSettings?.hideRagEmbedFun &&
            getFeatureStatus(companyId, VersionProductType.vectorKnowledgeBase) === '1'),
      )
      .map(key => ({ text: AGENT_TOOLS[key].displayName, type: key }))
      .filter(
        o =>
          !_.includes(
            data.tools.filter(o => _.includes(SINGLETON_TOOL_TYPES, o.type) && o.enabled).map(o => o.type),
            o.type,
          ),
      );
    const worksheetTools = data.tools.filter(o => _.includes(DATA_PROCESSING_TOOL_TYPES, o.type) && o.enabled);
    const otherTools = data.tools.filter(o => !_.includes(DATA_PROCESSING_TOOL_TYPES, o.type) && o.enabled);

    return (
      <Fragment>
        <div className="Font12 mTop20 flexRow alignItemsCenter">
          <div className="textSecondary flex">
            {_l('在下方配置AI Agent可以使用的工具。AI Agent将尝试调用工具完成任务')}
          </div>
          {(isChatBot || isAIActions) && (
            <Fragment>
              <Checkbox
                className="InlineFlex"
                checked={data.checkUserPermission}
                onChange={event =>
                  this.updateSource({
                    checkUserPermission: event.target.checked,
                  })
                }
              >
                {_l('按用户权限')}
              </Checkbox>
              <Tooltip
                placement="topRight"
                title={_l(
                  '该配置对数据处理及知识库检索工具生效。取消勾选后，工具执行时将忽略用户数据权限，Agent可访问并返回所有满足配置的数据，请谨慎操作。',
                )}
              >
                <i className="Font14 icon-help textTertiary mLeft5" />
              </Tooltip>
            </Fragment>
          )}
        </div>
        {!!worksheetTools.length && (
          <Fragment>
            <div className="bold Font12 textSecondary mTop20">{_l('数据处理')}</div>
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
          <Popover
            open={this.state.moreToolsVisible}
            onOpenChange={moreToolsVisible => this.setState({ moreToolsVisible })}
            content={
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
                      {index === 0 && _.includes(DATA_PROCESSING_TOOL_TYPES, o.type) && (
                        <div className="desc">{_l('数据处理')}</div>
                      )}
                      {((index === 0 && !_.includes(DATA_PROCESSING_TOOL_TYPES, o.type)) ||
                        (index !== 0 &&
                          index === MORE_TOOLS.filter(o => _.includes(DATA_PROCESSING_TOOL_TYPES, o.type)).length)) && (
                        <div className="desc">{_l('更多工具')}</div>
                      )}
                      <div
                        className="listItem"
                        onClick={() => {
                          this.setState({ moreToolsVisible: false });

                          if (_.includes(DATA_PROCESSING_TOOL_TYPES, o.type)) {
                            const existingTool = data.tools.find(obj => obj.type === o.type);

                            if (existingTool) {
                              this.updateTool(existingTool.toolId, { enabled: true });
                            } else {
                              this.updateSource({ tools: data.tools.concat(getNewTool()) });
                            }
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
                            this.props.openSelectPBPDialog({
                              companyId: this.props.companyId,
                              appId: this.props.relationId,
                              onOk: ({ appId, appName, selectPBCId, selectPBCName }) => {
                                if (!data.tools.find(o => o.type === 6 && o.configs[0].appId === selectPBCId)) {
                                  const config = {
                                    appId: selectPBCId,
                                    appName: selectPBCName,
                                    ...(appId !== this.props.relationId
                                      ? { app: { otherApkId: appId, otherApkName: appName } }
                                      : {}),
                                  };

                                  this.updateSource({
                                    tools: data.tools.concat(getNewTool([config], selectPBCName)),
                                  });
                                }
                              },
                            });
                          }

                          if (_.includes([7, 8], o.type)) {
                            this.updateSource({ tools: data.tools.concat(getNewTool()) });
                          }

                          if (o.type === 9) {
                            const toolNode = data.tools.find(o => o.type === 9)?.toolNode;

                            this.setState({
                              showVectorDialog: true,
                              toolNode: { ...toolNode, searchMode: toolNode.searchMode || 'auto' },
                            });
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
            }
            trigger="click"
            placement="bottomLeft"
            noPadding
          >
            <span className="pointer textTertiary hoverColorPrimary">+ {_l('添加工具')}</span>
          </Popover>
        </div>
      </Fragment>
    );
  }

  // 渲染工具列表
  renderToolsList = item => {
    const { flowInfo, selectNodeId, isAIActions } = this.props;
    const { data, selectToolId } = this.state;
    const isChatBot = flowInfo.startAppType === APP_TYPE.CHATBOT;
    const tool = AGENT_TOOLS[item.type];
    const pbcApp = item.type === 6 ? item.configs[0]?.app : undefined;
    const isDeletedPbcInSandbox = isSandboxEnvironment();
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
                  <Input
                    className="flex Font14 bold pLeft0"
                    variant="borderless"
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
                    <Fragment>
                      {isDelete ? (
                        item.type === 5 ? (
                          _l('API已删除')
                        ) : isDeletedPbcInSandbox ? (
                          <DeletedOrUnopenedSandboxTitle url={`/app/${this.props.relationId}`} />
                        ) : (
                          _l('封装业务流程已删除')
                        )
                      ) : _.includes(DATA_PROCESSING_TOOL_TYPES, item.type) ? (
                        AGENT_TOOLS[item.type].displayName
                      ) : (
                        item.name
                      )}
                      {pbcApp?.otherApkName && <span className="Normal textSecondary">（{pbcApp.otherApkName}）</span>}
                    </Fragment>
                  </div>
                )}

                {item.type === 4 && (
                  <Tooltip title={_l('对工作表数据进行分组统计汇总，帮助 Agent 在流程中自动完成统计分析与结果判断')}>
                    <Icon className="Font14 textTertiary mLeft5" icon="info" />
                  </Tooltip>
                )}

                {tool.range && item.type !== 9 && (
                  <div
                    className="Font13 colorPrimary hoverColorPrimaryDark pointer mLeft10"
                    onClick={() =>
                      this.props.openSelectWorksheetDialog({
                        appId: this.props.relationId,
                        selectIds: item.configs.map(o => o.appId),
                        onOk: o => {
                          this.updateTool(item.toolId, {
                            auto: !o.length,
                            configs: !o.length
                              ? []
                              : o.map(info => {
                                  return {
                                    viewId: '',
                                    fields: [],
                                    filters: [],
                                    ...item.configs.find(config => config.appId === info.workSheetId),
                                    appId: info.workSheetId,
                                    appName: info.workSheetName,
                                    iconColor: info.iconColor,
                                    iconUrl: info.iconUrl,
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
                    className={cx('Font12 icon-task-new-detail colorPrimary hoverColorPrimaryDark pointer', {
                      mLeft10: !pbcApp?.otherApkName,
                    })}
                    onClick={() =>
                      window.open(
                        pathCompletion(
                          `${item.type === 5 ? '/integrationApi' : '/workflowedit'}/${item.configs[0].appId}`,
                        ),
                      )
                    }
                  />
                )}

                {_.includes(EDITABLE_TOOL_TYPES, item.type) && !selectToolId && !isDelete && (
                  <i
                    className="Font16 textSecondary hoverColorPrimary pointer icon-edit mLeft10"
                    onClick={() => this.setState({ selectToolId: item.toolId })}
                  />
                )}

                <div className="flex" />
              </div>

              {(tool.range || tool.desc) && (
                <div className="Font12 textSecondary">
                  {tool.range ? (item.auto ? tool.autoRange : tool.specificRange) : tool.desc}
                </div>
              )}

              {item.type === 8 && window.platformENV.isPlatform && (
                <div className="Font12 textSecondary">
                  <PriceTip text={_l('邮件费用自动从组织信用点中扣除')} />
                </div>
              )}
            </div>

            <div className="mLeft12">
              <i
                className="Font16 pointer textTertiary hoverColorPrimary icon-trash"
                onClick={() => {
                  if (_.includes(DATA_PROCESSING_TOOL_TYPES.concat([9]), item.type)) {
                    this.updateTool(item.toolId, { enabled: !item.enabled });
                  } else {
                    this.updateSource({ tools: data.tools.filter(o => o.toolId !== item.toolId) });
                  }
                }}
              />
            </div>
          </div>

          {(isChatBot || isAIActions) && !_.includes(NO_CONFIRM_TOOL_TYPES, item.type) && !isDelete && (
            <div className="mTop3">
              <Checkbox
                className="textSecondary"
                checked={item.requireUserConfirmation}
                onChange={event =>
                  this.updateTool(item.toolId, {
                    requireUserConfirmation: event.target.checked,
                  })
                }
              >
                {_l('调用前需用户确认')}
              </Checkbox>
            </div>
          )}

          {_.includes(WORKSHEET_RANGE_TOOL_TYPES, item.type) &&
            item.configs.map(o => (
              <SHEET_LIST key={o.appId}>
                <SvgIcon url={o.iconUrl} fill={o.iconColor} size={16} />
                <div className={cx('Font14 bold mLeft5 flex ellipsis', { red: !o.appName })}>
                  {o.appName || _l('工作表已删除')}
                </div>

                {_.includes([3, 4], item.type) && (
                  <i
                    className="Font16 pointer textTertiary hoverColorPrimary icon-settings mLeft15"
                    onClick={() =>
                      this.props.openWorksheetFilterDialog({
                        ...this.props,
                        data,
                        worksheetId: o.appId,
                        nodeId: o.nodeId || selectNodeId,
                        viewId: o.viewId,
                        fields: o.fields,
                        filter: o.filters,
                        updateSource: this.updateSource,
                        onOk: ({ viewId, fields, filters }) =>
                          this.updateTool(item.toolId, {
                            configs: item.configs.map(info => {
                              return info.appId === o.appId ? { ...info, viewId, fields, filters } : info;
                            }),
                          }),
                      })
                    }
                  />
                )}
              </SHEET_LIST>
            ))}

          {item.type === 9 && (
            <SHEET_LIST>
              <div className="flexColumn flex pTop8 pBottom8 pLeft5">
                <div className="Font13">
                  <span className="textSecondary">{_l('知识库')}</span>
                  <span className="mLeft5">{this.renderKnowledgeList(item.toolNode)}</span>
                </div>
                <div className="Font13">
                  <span className="textSecondary">{_l('检索策略')}</span>
                  <span className="mLeft5">{SEARCH_MODE_MAP[item.toolNode.searchMode]}</span>
                </div>
              </div>
              <i
                className="Font16 pointer textTertiary hoverColorPrimary icon-edit mLeft15"
                onClick={() => this.setState({ showVectorDialog: true, toolNode: item.toolNode })}
              />
            </SHEET_LIST>
          )}
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

  // 渲染知识库列表
  renderKnowledgeList({ knowledgeIds, appList }) {
    return knowledgeIds.map((kid, index) => {
      const item = _.find(appList, o => o.id === kid);
      const delimiter = index < knowledgeIds.length - 1 ? '、' : '';

      return item ? item.name + delimiter : <span className="red">{_l('知识库已删除') + delimiter}</span>;
    });
  }

  render() {
    const { data, showVectorDialog, toolNode } = this.state;

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
        <DetailFooter
          {...this.props}
          isCorrect={data.prompt.trim() && !_.isEqual(data, this.cacheResult)}
          onSave={this.onSave}
        />

        {showVectorDialog && (
          <Modal
            className="workflowDialogBox workflowSettings"
            mask={{ closable: false }}
            width={800}
            open
            title={_l('添加知识库检索')}
            onCancel={() => this.setState({ showVectorDialog: false })}
            onOk={() => {
              if (!toolNode.knowledgeIds.length) {
                alert(_l('请选择知识库'), 2);
                return;
              }

              this.updateSource({
                tools: data.tools.map(o =>
                  o.type === 9 ? { ...o, name: _l('知识库检索'), toolNode, enabled: true } : o,
                ),
              });
              this.setState({ showVectorDialog: false });
            }}
          >
            <div className="workflowDetail w100">
              <div className="workflowDetailBox pAll0">
                <VectorKnowledge
                  {...this.props}
                  data={toolNode}
                  showAuto
                  updateSource={(obj, callback) => this.setState({ toolNode: { ...toolNode, ...obj } }, callback)}
                />
              </div>
            </div>
          </Modal>
        )}
      </Fragment>
    );
  }
}

export default withOpeners(Agent, {
  openSelectPBPDialog: useSelectPBPDialog,
  openSelectWorksheetDialog: useSelectWorksheetDialog,
  openWorksheetFilterDialog: useWorksheetFilterDialog,
});
