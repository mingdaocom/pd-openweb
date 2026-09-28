import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _, { get } from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, Support, SvgIcon } from 'ming-ui';
import { Button, Checkbox, Dropdown, Modal, Tooltip } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import flowNode from '../../api/flowNode';
import process from '../../api/process';
import sheetAjax from 'src/api/worksheet';
import AiActionChatBot from 'src/components/Mingo/modules/AiActionChatBot';
import WorkflowChatBot from 'src/components/Mingo/modules/WorkflowChatBot';
import { useSelectRecords } from 'src/components/SelectRecords';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import PublishErrorDialog from '../../components/PublishErrorDialog';
import Switch from '../../components/Switch';
import { clearTestRunning, updatePublishState, updateTestRunning } from '../../redux/actions';
import { getWorkflowListReturnPath, START_APP_TYPE } from '../../WorkflowList/utils';
import { ProcessParameters } from '../Detail/components';
import { APP_TYPE, NODE_TYPE } from '../enum';
import { useWorkflowLogDialog } from '../History/components/logDialog';
import { getIcons, getStartNodeColor } from '../utils';
import HistoryVersion, { restoreVision } from './HistoryVersion';
import './index.less';

const TABS_OPTS = [
  { tabIndex: 1, name: _l('流程') },
  { tabIndex: 3, name: _l('配置') },
  { tabIndex: 2, name: _l('历史') },
];

const Description = styled.div`
  > div {
    padding-left: 18px;
    margin-bottom: 10px;
    position: relative;
    color: var(--color-text-title);
    &::before {
      position: absolute;
      top: 7px;
      left: 0;
      content: '';
      width: 5px;
      height: 5px;
      background: var(--color-background-inverse);
      border-radius: 50%;
    }
  }
`;

const TestHeader = styled.div`
  display: flex;
  align-items: center;
  height: 55px;
  padding: 0 20px;
  align-items: center;
  color: var(--color-white);
  .icon-delete {
    width: 18px;
    display: inline-block;
    cursor: pointer;
    transition: all 250ms ease-out;
    &:hover {
      transform: rotate(90deg);
    }
  }
  &.BGYellow {
    background: var(--color-warning);
  }
  &.BGDarkRed {
    background: #a00416;
  }
  &.BGBlueAsh {
    background: #4c7d9e;
  }
  &.BGBlue {
    background: var(--color-primary);
  }
  &.BGSkyBlue {
    background: var(--color-cyan);
  }
  &.BGGreen {
    background: var(--color-task);
  }
  &.BGDarkBlue {
    background: #4158db;
  }
  &.BGRed {
    background: var(--color-calendar);
  }
`;

const Footer = styled.div`
  .footerSaveBtn {
    height: 36px;
    line-height: 36px;
    display: inline-block;
    padding: 0 32px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
    box-sizing: border-box;
    color: var(--color-white);
  }
`;

const BotBox = styled.div`
  height: calc(100vh - 87px);
  width: 500px;
  position: absolute;
  right: 16px;
  top: 71px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-background-primary);
`;

class Header extends Component {
  static defaultProps = {
    tabIndex: 1,
    switchTabs: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      showPublishDialog: false,
      publishErrorVisible: false,
      errorInfo: {},
      isProgressing: false,
      data: {},
      showApprovalFields: false,
      showApprovalDetail: false,
      testVisible: false,
      showTestFlow: false,
      startNodeDetail: {},
      showChatbotDialog: false,
      worksheetInfo: {},
      recordInfo: {},
    };
    this.requestPending = false;
  }

  closeTestDialog = false;

  componentDidMount() {
    const that = this;

    $('.AppAdminWorkflowEdit').on('click', '.publishDialogOpenHistory', () => {
      that.props.switchTabs(2);
      that.setState({ showPublishDialog: false });
    });

    IM.socket.on('workflow_running', result => {
      if (md.global.Config.pushUniqueId === result.pushUniqueId) {
        this.props.dispatch(updateTestRunning(result));
      }
    });
  }

  componentWillUnmount() {
    IM.socket.off('workflow_running');
  }

  /**
   * 开启关闭流程
   */
  switchStatus = () => {
    const { flowInfo } = this.props;
    this.publishOrCloseFlow(!flowInfo.enabled);
  };

  /**
   * 发布或关闭工作流
   */
  publishOrCloseFlow = (isPublish = true) => {
    const { flowInfo, isPlugin } = this.props;
    const unpublished = !flowInfo.lastPublishDate;

    this.props.dispatch(updatePublishState({ pending: true }));

    process
      .publish({ isPublish, processId: flowInfo.id })
      .then(result => {
        // 关闭
        if (!isPublish) {
          this.props.dispatch(updatePublishState({ pending: false, enabled: false }));
        } else {
          if (result.isPublish) {
            this.props.dispatch(
              updatePublishState({
                pending: false,
                enabled: true,
                publish: true,
                lastPublishDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                publishStatus: 2,
                startAppId: result.process.startNode.appId,
              }),
            );

            // 未发布
            if (unpublished && !isPlugin) {
              setTimeout(() => {
                this.setState({ showPublishDialog: true, data: result });
              }, 300);
            }
          } else {
            this.props.dispatch(updatePublishState({ pending: false }));
            this.setState({ publishErrorVisible: true, errorInfo: result });
          }
        }
      })
      .catch(state => {
        this.props.dispatch(updatePublishState({ state, pending: false }));
      });
  };

  /**
   * 错误节点居中显示
   */
  errorNodeCenter() {
    setTimeout(() => {
      const { errorInfo } = this.state;
      const { errorNodeIds, errorNodeMap } = errorInfo;
      const firstNodeId = errorNodeIds[0];
      let $el;

      if (!errorNodeMap[firstNodeId]) {
        $el = $(`.workflowBox[data-id=${firstNodeId}]`);
      } else {
        $el = $(`.approvalProcessBoxBox[data-id=${firstNodeId}]`).find(
          `.workflowBox[data-id=${errorNodeMap[firstNodeId][0]}]`,
        );
      }

      if (!$el.length) return;

      const { top, left } = $el.offset();
      const $box = $('.workflowSettings .workflowEdit');
      const scrollTop = $box.scrollTop();
      const scrollLeft = $box.scrollLeft();

      $box.scrollTop(scrollTop + top - $box.height() / 2 + $el.height() / 2 - 30);
      $box.scrollLeft(scrollLeft + left - $box.width() / 2 + $el.width() / 2);
    }, 1000);
  }

  /**
   * 返回
   */
  back = () => {
    const { workflowDetail, flowInfo, isPlugin } = this.props;
    let { onBack } = this.props;
    const { startEventId, flowNodeMap } = workflowDetail;
    const noSelectWorksheet =
      startEventId &&
      (flowNodeMap[startEventId].appType === APP_TYPE.SHEET || flowNodeMap[startEventId].appType === APP_TYPE.DATE) &&
      !flowNodeMap[startEventId].appId;

    if (!onBack) {
      onBack = () => {
        location.href = pathCompletion(
          isPlugin
            ? '/plugin/node'
            : flowInfo.parentId
              ? `/workflowedit/${flowInfo.parentId}`
              : getWorkflowListReturnPath(flowInfo.relationId, location.hash),
        );
      };
    }

    if (noSelectWorksheet) {
      Modal.confirm({
        title: _l('是否放弃保存工作流？'),
        content: _l('未设置触发方式的工作流将不会被保存'),
        okText: _l('放弃保存'),
        okButtonProps: { danger: true },
        onOk: () => onBack(flowInfo.enabled),
      });
    } else {
      onBack(flowInfo.enabled);
    }
  };

  /**
   * 渲染测试按钮
   */
  renderTestBtn() {
    const { flowInfo, isPlugin, tabIndex, isAIActions } = this.props;
    const { testVisible, showChatbotDialog } = this.state;

    if (flowInfo.startAppType === APP_TYPE.CHATBOT || isAIActions) {
      if (showChatbotDialog || tabIndex !== 1) return null;

      return (
        <span
          className="workflowAction hoverColorPrimary hoverBorderColorPrimary"
          onClick={() => {
            if (isAIActions) {
              this.selectRecord((records, worksheetInfo) => {
                this.setState({ showChatbotDialog: true, worksheetInfo, recordInfo: records[0] });
              });
            } else {
              this.setState({ showChatbotDialog: true });
            }
          }}
        >
          {_l('测试')}
        </span>
      );
    }

    // 未发布和非立即执行的只有测试
    if (
      isPlugin ||
      !flowInfo.lastPublishDate ||
      !_.includes(
        [
          APP_TYPE.SHEET,
          APP_TYPE.LOOP,
          APP_TYPE.DATE,
          APP_TYPE.CUSTOM_ACTION,
          APP_TYPE.APPROVAL_START,
          APP_TYPE.EVENT_PUSH,
        ],
        flowInfo.startAppType,
      )
    ) {
      return (
        <span className="workflowAction hoverColorPrimary hoverBorderColorPrimary" onClick={this.test}>
          {_l('测试')}
        </span>
      );
    }

    return (
      <Dropdown
        open={testVisible}
        onOpenChange={testVisible => {
          this.setState({ testVisible });
        }}
        trigger={['click']}
        placement="bottomRight"
        menu={{
          items: [
            {
              key: 'test',
              icon: <Icon icon="test_workflow" className="Font16" />,
              label: _l('测试编辑中流程'),
              onClick: () => {
                this.setState({ testVisible: false });
                this.test();
              },
            },
            {
              key: 'execute',
              icon: <Icon icon="play_circle_filled" className="Font16" />,
              label: _l('执行当前运行中的流程'),
              onClick: () => {
                this.setState({ testVisible: false });
                this.onExecuteFlow(false);
              },
            },
          ],
        }}
      >
        <span className="workflowAction hoverColorPrimary hoverBorderColorPrimary">{_l('测试')}</span>
      </Dropdown>
    );
  }

  /**
   * 测试
   */
  test = () => {
    const { isPlugin } = this.props;

    if (!localStorage.getItem('closeWorkflowTestPrompt') && !isPlugin) {
      Modal.confirm({
        width: 560,
        title: _l('测试编辑中流程'),
        content: (
          <Description>
            <div>{_l('待办、通知节点以我自己作为节点执行人，实际执行人不会收到消息。')}</div>
            <div>{_l('审批、填写节点无需操作，将会自动通过。')}</div>
            <div>{_l('仅对主流程进行测试执行。引用的子流程、PBP、审批流程将跳过执行，可单独前往测试这些流程。')}</div>
          </Description>
        ),
        footerLeftElement: (
          <Checkbox onChange={event => (this.closeTestDialog = event.target.checked)}>{_l('下次不再提示')}</Checkbox>
        ),
        okText: _l('继续'),
        cancelButtonProps: {
          style: {
            display: 'none',
          },
        },
        onOk: () => {
          // 本地记忆测试流程弹层提示
          if (this.closeTestDialog) {
            localStorage.setItem('closeWorkflowTestPrompt', true);
          }

          this.onExecuteFlow();
        },
      });
    } else {
      this.onExecuteFlow();
    }
  };

  /**
   * 渲染测试流程
   */
  renderTestFlow = () => {
    const { flowInfo, isPlugin } = this.props;
    const { startNodeDetail } = this.state;
    const { appType, triggerId, typeId, name } = startNodeDetail;

    return (
      <Modal
        open
        type="fixed"
        className="workflowSettings"
        width={800}
        closable={false}
        footer={null}
        styles={{ body: { padding: 0 }, container: { padding: 0 } }}
      >
        <div className="flexColumn h100 workflowDetail">
          {_.isEmpty(startNodeDetail) ? (
            <LoadDiv className="mTop15" />
          ) : (
            <Fragment>
              <TestHeader
                className={isPlugin ? '' : flowInfo.child ? 'BGBlueAsh' : getStartNodeColor(appType, triggerId)}
                style={isPlugin ? { background: flowInfo.iconColor || 'var(--color-primary)' } : {}}
              >
                {isPlugin && flowInfo.iconName ? (
                  <SvgIcon url={flowInfo.iconName} fill="#fff" size={24} />
                ) : (
                  <i
                    className={cx(
                      'Font24',
                      isPlugin
                        ? 'icon-workflow'
                        : flowInfo.child
                          ? 'icon-subprocess'
                          : getIcons(typeId, appType, triggerId),
                    )}
                  />
                )}
                <div className="flex mLeft10 Font17 bold">{isPlugin ? flowInfo.name : name}</div>
                <i className="icon-delete Font18 mLeft10" onClick={() => this.setState({ showTestFlow: false })} />
              </TestHeader>
              <ScrollView className="flex">
                <div className="workflowDetailBox pBottom0">
                  {isPlugin && flowInfo.explain && (
                    <div className="Font14 textSecondary workflowDetailDesc mBottom30">{flowInfo.explain}</div>
                  )}

                  <div style={{ marginTop: -15 }}>
                    <ProcessParameters
                      companyId={flowInfo.companyId}
                      selectNodeType={NODE_TYPE.PLUGIN}
                      hideOtherField
                      data={startNodeDetail}
                      updateSource={obj => {
                        this.setState({ startNodeDetail: Object.assign({}, startNodeDetail, obj) });
                      }}
                    />
                  </div>
                </div>
              </ScrollView>

              <Footer className="mTop30 mLeft24 mBottom20">
                <span
                  className="footerSaveBtn bgColorPrimary hoverBgColorPrimaryDark"
                  onClick={() => {
                    this.sendTestFlow({ fields: startNodeDetail.fields });
                  }}
                >
                  {_l('测试')}
                </span>
              </Footer>
            </Fragment>
          )}
        </div>
      </Modal>
    );
  };

  /**
   * 立即执行流程
   */
  onExecuteFlow = (isTest = true) => {
    const { flowInfo } = this.props;

    if (
      _.includes(
        [APP_TYPE.SHEET, APP_TYPE.DATE, APP_TYPE.CUSTOM_ACTION, APP_TYPE.APPROVAL_START, APP_TYPE.EVENT_PUSH],
        flowInfo.startAppType,
      )
    ) {
      this.selectRecord(selectedRecords => {
        isTest
          ? this.sendTestFlow({ sourceId: selectedRecords[0].rowid })
          : this.sendRealityFlow({ sourceId: selectedRecords[0].rowid });
      });
    } else if (flowInfo.startAppType === APP_TYPE.LOOP) {
      Modal.confirm({
        width: 560,
        title: _l('执行定时触发流程'),
        content: _l('点击确定后，将会立即开始执行此流程'),
        cancelButtonProps: {
          style: {
            display: 'none',
          },
        },
        onOk: () => {
          isTest ? this.sendTestFlow() : this.sendRealityFlow();
        },
      });
    } else {
      this.setState({ showTestFlow: true, startNodeDetail: {} });
      this.getNodeDetail();
    }
  };

  /**
   * 选择记录
   */
  selectRecord = (callback = () => {}) => {
    const { flowInfo } = this.props;

    this.props.openSelectRecords({
      canSelectAll: false,
      pageSize: 25,
      multiple: false,
      singleConfirm: true,
      worksheetId: flowInfo.startAppId,
      onText: _l('开始测试'),
      allowNewRecord: true,
      allowAdd: true,
      showMoreControls: true,
      onOk: callback,
    });
  };

  /**
   * 发送测试流程
   */
  sendTestFlow = ({ sourceId, fields } = {}) => {
    const { flowInfo } = this.props;
    let hasError = 0;

    (fields || []).forEach(o => {
      if (o.required && !o.fieldValue) {
        hasError++;
      }
    });

    if (hasError > 0) {
      alert(_l('有必填字段未填写'), 2);
      return;
    }

    this.props.dispatch(clearTestRunning());

    process
      .startProcessById({
        processId: flowInfo.id,
        sourceId,
        debugEvents: [-1, 0, 1, 2, 3],
        fields,
        pushUniqueId: md.global.Config.pushUniqueId,
      })
      .then(result => {
        // 流程存在异常
        if (result.processWarnings) {
          this.setState({ showTestFlow: false, publishErrorVisible: true, errorInfo: result });
        } else {
          this.setState({ showTestFlow: false });
        }
      });
  };

  /**
   * 发送实际流程
   */
  sendRealityFlow = ({ sourceId } = {}) => {
    const { flowInfo, tabIndex, workflowDetail } = this.props;
    const { isProgressing } = this.state;
    const { flowNodeMap } = workflowDetail;
    let showSendModeDialog = this.hasTodoNode(flowNodeMap);

    const execFunc = (debugEvents = []) => {
      this.setState({ isProgressing: true });

      process
        .startProcessById({
          processId: flowInfo.id,
          sourceId,
          debugEvents,
          pushUniqueId: md.global.Config.pushUniqueId,
        })
        .then(() => {
          // 手动刷新一下历史数据
          if (tabIndex === 2) {
            document.getElementById('historyRefresh') && document.getElementById('historyRefresh').click();
          }

          this.setState({ isProgressing: false });
          alert(_l('执行成功'));
        });
    };

    if (isProgressing) return false;

    // 检测审批流中的待办节点
    Object.keys(flowNodeMap).forEach(key => {
      if (flowNodeMap[key].typeId === NODE_TYPE.APPROVAL_PROCESS) {
        if (this.hasTodoNode(flowNodeMap[key].processNode.flowNodeMap)) {
          showSendModeDialog = true;
        }
      }
    });

    if (showSendModeDialog) {
      let sendModeDialog;
      let isTestSelfPending = false;

      sendModeDialog = Modal.confirm({
        width: 560,
        title: _l('待办、通知发送方式'),
        content: (
          <div>
            <p className="textPrimary">
              {_l('点击【发给我自己测试】时，实际执行人不收到消息，由我作为节点的执行人进行测试。')}
            </p>
            <p>
              •
              <span className="mLeft5">
                {_l('包含待办节点（审批、填写、抄送），通知节点（站内消息、短信、邮件）。')}
              </span>
            </p>
            <p>
              •<span className="mLeft5">{_l('短信、邮件将发送给我的账号绑定的手机、邮箱测试。')}</span>
            </p>
            <p>
              •
              <span className="mLeft5">
                {_l('暂时仅主流程中的节点支持此功能。引用的子流程、PBP中的节点仍为实际执行人，可单独去测试这些节点。')}
              </span>
            </p>
          </div>
        ),
        okText: _l('发给实际执行人'),
        cancelText: _l('发给我自己测试'),
        cancelButtonProps: {
          type: 'default',
          onClick: () => {
            if (isTestSelfPending) return;

            isTestSelfPending = true;
            sendModeDialog.destroy();
            execFunc([1, 2, 3]);
          },
        },
        onOk: execFunc,
      });
    } else {
      execFunc();
    }
  };

  /**
   * 渲染发布成功弹层
   */
  renderPublishDialog() {
    const { showPublishDialog, data, showApprovalFields, showApprovalDetail } = this.state;

    if (!showPublishDialog) return null;

    return (
      <Modal open width={640} closable={false} footer={null} styles={{ body: { padding: 0 } }}>
        <div className="publishSuccessDialog">
          <div className="publishSuccessImg" />

          {!data.apps.length ? (
            <Fragment>
              <div className="Font20 mTop35">{_l('太棒了！流程已自动化运行')}</div>
              <div className="Font14 mTop25 textSecondary">{_l('你再一次为大家节省时间提升了工作效率！')}</div>
              <div
                className="Font14 mTop15 textSecondary"
                dangerouslySetInnerHTML={{
                  __html: _l(
                    '一段时间后，你就可以在%0中看到进入流程的数据和详细的运行状态了',
                    `<span class="mLeft5 mRight5 colorPrimary hoverColorPrimaryDark pointer publishDialogOpenHistory">${_l(
                      '历史',
                    )}</span>`,
                  ),
                }}
              />
              <Button
                type="primary"
                size="large"
                onClick={() => this.setState({ showPublishDialog: false })}
                className="mTop40"
              >
                {_l('我知道了')}
              </Button>
            </Fragment>
          ) : (
            <Fragment>
              <div className="Font20 mTop35">{_l('流程已成功发布！')}</div>
              <div className="Font14 mTop25 bold">
                {_l('是否为%0开启审批功能项', data.apps.map(item => `“${item.name}”`).join('、'))}
              </div>

              <div className="mTop30 flexRow w100 alignItemsCenter justifyContentCenter">
                <Checkbox
                  className="mRight5"
                  checked={showApprovalFields}
                  onChange={event =>
                    this.setState({
                      showApprovalFields: event.target.checked,
                    })
                  }
                >
                  {_l('在视图上显示审批系统字段')}
                </Checkbox>

                <Support
                  type={1}
                  href="https://help.mingdao.com/workflow/node-initiate-approval-flow#approval-process"
                />
              </div>
              <div className="mTop15 flexRow w100 alignItemsCenter justifyContentCenter">
                <Checkbox
                  className="mRight5"
                  checked={showApprovalDetail}
                  onChange={event =>
                    this.setState({
                      showApprovalDetail: event.target.checked,
                    })
                  }
                >
                  {_l('打开记录时显示审批流转详情')}
                </Checkbox>

                <Support
                  type={1}
                  href="https://help.mingdao.com/workflow/node-initiate-approval-flow#approval-process"
                />
              </div>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  if (this.requestPending) return;

                  const switchList = [];

                  if (showApprovalFields) {
                    switchList.push({ state: true, type: 40, roleType: 0 });
                  }

                  if (showApprovalDetail) {
                    switchList.push({ state: true, type: 41, roleType: 0 });
                  }

                  this.requestPending = true;
                  const request = switchList.length
                    ? Promise.all(
                        data.apps.map(({ id }) =>
                          sheetAjax.batchEditSwitch({ worksheetId: id, switchList }).then(result => {
                            if (!result) {
                              alert(_l('修改失败，请稍后再试！'), 2);
                            }
                          }),
                        ),
                      )
                    : Promise.resolve();

                  return request.finally(() => {
                    this.requestPending = false;
                    this.setState({ showPublishDialog: false, showApprovalFields: false, showApprovalDetail: false });
                  });
                }}
                className="mTop40"
              >
                {_l('确定')}
              </Button>
            </Fragment>
          )}
        </div>
      </Modal>
    );
  }

  /**
   * 是否有待办节点
   */
  hasTodoNode(flowNodeMap) {
    let showSendModeDialog = false;

    Object.keys(flowNodeMap).forEach(key => {
      if (
        _.includes(
          [NODE_TYPE.WRITE, NODE_TYPE.APPROVAL, NODE_TYPE.CC, NODE_TYPE.MESSAGE, NODE_TYPE.EMAIL, NODE_TYPE.NOTICE],
          flowNodeMap[key].typeId,
        )
      ) {
        showSendModeDialog = true;
      }
    });

    return showSendModeDialog;
  }

  /**
   * 获取节点详情
   */
  getNodeDetail = () => {
    const { flowInfo, isIntegration } = this.props;

    const isSystemVariable = o => {
      return o.processVariableType === 3 && flowInfo.startAppType === APP_TYPE.LOOP_PROCESS;
    };

    flowNode
      .getNodeDetail({ processId: flowInfo.id, nodeId: flowInfo.startNodeId, flowNodeType: 0 }, { isIntegration })
      .then(result => {
        result.subProcessVariables = result.controls.map(o => ({
          ...o,
          required: isSystemVariable(o) ? true : o.required,
        }));
        result.fields = result.controls.map(o => ({
          ...o,
          type: _.includes([14, 10000003, 10000006, 10000007, 10000008], o.type) ? 2 : o.type,
          fieldId: o.controlId,
          fieldValue: o.type === 26 || o.type === 27 ? '[]' : '',
          required: isSystemVariable(o) ? true : o.required,
        }));

        this.setState({ startNodeDetail: result });
      });
  };

  /**
   * 渲染对话机器人对话框
   */
  renderChatbotDialog() {
    const { flowInfo, workflowDetail, isAIActions } = this.props;
    const { worksheetInfo, recordInfo } = this.state;

    if (isAIActions) {
      return (
        <BotBox>
          <AiActionChatBot
            worksheetId={flowInfo.startAppId}
            recordId={recordInfo.rowid}
            processId={flowInfo.id}
            buttonName={workflowDetail.flowNodeMap[flowInfo.startNodeId].triggerName}
            conversationId={'test-' + _.get(md, 'global.Account.accountId')}
            isTest
            showOperateHeader
            worksheetInfo={worksheetInfo}
            recordData={recordInfo}
            onClose={() => this.setState({ showChatbotDialog: false })}
            onOpenMessageLog={({ instanceId }) => {
              this.props.openWorkflowLogDialog({
                processId: flowInfo.id,
                nodeId: workflowDetail.flowNodeMap[flowInfo.startNodeId].nextId,
                instanceId,
              });
            }}
          />
        </BotBox>
      );
    }

    return (
      <BotBox>
        <WorkflowChatBot
          chatbotId={flowInfo.id}
          conversationId={'test-' + get(md, 'global.Account.accountId')}
          isTest
          showOperateHeader
          worksheetInfo={worksheetInfo}
          recordInfo={recordInfo}
          onClose={() => this.setState({ showChatbotDialog: false })}
          onOpenMessageLog={({ instanceId }) => {
            this.props.openWorkflowLogDialog({
              processId: flowInfo.id,
              nodeId: workflowDetail.flowNodeMap[flowInfo.startNodeId].nextId,
              instanceId,
            });
          }}
        />
      </BotBox>
    );
  }

  render() {
    const { tabIndex, switchTabs, flowInfo, isIntegration, isPlugin, openFlowInfo, isAIActions } = this.props;
    const { publishErrorVisible, errorInfo, isProgressing, showTestFlow, showChatbotDialog } = this.state;
    const tabs = TABS_OPTS.filter(
      item => (flowInfo.startAppType !== APP_TYPE.APPROVAL_START && !isPlugin) || item.tabIndex !== 3,
    );
    const formatString = _l('YYYY年M月D日 HH:mm');
    const processInfo =
      START_APP_TYPE[flowInfo.child ? 'subprocess' : isAIActions ? 'ai_actions' : flowInfo.startAppType] || {};

    return (
      <div className={cx('workflowSettingsHeader flexRow relative', { workflowReleaseHeader: flowInfo.parentId })}>
        <Tooltip title={flowInfo.parentId ? _l('返回最新版本') : _l('返回')} placement="bottomRight">
          <div className="workflowReturn" onClick={this.back}>
            <i className="icon-backspace" />
          </div>
        </Tooltip>

        <Tooltip title={processInfo.text}>
          <div
            className="iconWrap mRight10 pointer"
            style={{ backgroundColor: processInfo.iconColor }}
            onClick={this.back}
          >
            <Icon icon={processInfo.iconName} />
          </div>
        </Tooltip>

        <div className="flex relative w100 h100">
          <div className="flexColumn workflowHeaderDesc">
            <div className="Font17 ellipsis pointer" onClick={openFlowInfo}>
              {flowInfo.name}
              {flowInfo.explain && (
                <Tooltip placement="bottomLeft" align={{ offset: [-12, 0] }} type="white" title={flowInfo.explain}>
                  <Icon icon="info" className="textTertiary Font18 mLeft5" />
                </Tooltip>
              )}
              {flowInfo.publishStatus === 1 && flowInfo.enabled && (
                <div className="workflowSettingsHeaderUpdateBtn Font12 mLeft5 bold">{_l('已修改')}</div>
              )}
            </div>
            {flowInfo.lastPublishDate &&
              (flowInfo.parentId ? (
                <div className="Font12 ellipsis">
                  <span className="textSecondary mRight5">
                    {_l('版本：%0', moment(flowInfo.lastPublishDate).format('YYYY-MM-DD HH:mm'))}
                  </span>
                  <Tooltip title={_l('恢复到此版本')}>
                    <span>
                      <Icon
                        className="Font14 pointer"
                        icon="restore2"
                        onClick={() =>
                          restoreVision({
                            ...flowInfo,
                            date: flowInfo.lastPublishDate,
                            currentFlowId: flowInfo.parentId,
                            isIntegration,
                            isPlugin,
                          })
                        }
                      />
                    </span>
                  </Tooltip>
                </div>
              ) : (
                <div className="Font12 ellipsis">
                  <span className="textSecondary mRight5">
                    {_l('上次发布：%0', moment(flowInfo.lastPublishDate).format('YYYY-MM-DD HH:mm'))}
                  </span>
                  <HistoryVersion {...this.props} />
                </div>
              ))}
          </div>
        </div>

        {tabs.map((item, i) => {
          return (
            <div
              key={i}
              className={cx('Font16 colorPrimary borderColorPrimary workflowHeaderTab', {
                active: tabIndex === item.tabIndex,
                mRight60: TABS_OPTS.length - 1 === i,
              })}
              onClick={() => {
                switchTabs(item.tabIndex);
                this.setState({ showChatbotDialog: false });
              }}
            >
              {item.name}
            </div>
          );
        })}

        <div className="flex flexRow" style={{ justifyContent: 'flex-end', minWidth: 'fit-content' }}>
          {flowInfo.parentId ? (
            <div className="Font12 workflowReleaseBox">
              {_l('发布时间：%0', moment(flowInfo.lastPublishDate).format(formatString))}
            </div>
          ) : (
            <Fragment>
              {!_.includes([APP_TYPE.WEBHOOK, APP_TYPE.USER, APP_TYPE.EXTERNAL_USER], flowInfo.startAppType) &&
                (isPlugin ||
                  flowInfo.publishStatus !== 2 ||
                  flowInfo.startAppType === APP_TYPE.CHATBOT ||
                  isAIActions) &&
                this.renderTestBtn()}

              {flowInfo.publishStatus === 2 &&
                flowInfo.enabled &&
                _.includes(
                  [
                    APP_TYPE.SHEET,
                    APP_TYPE.LOOP,
                    APP_TYPE.DATE,
                    APP_TYPE.CUSTOM_ACTION,
                    APP_TYPE.APPROVAL_START,
                    APP_TYPE.EVENT_PUSH,
                  ],
                  flowInfo.startAppType,
                ) &&
                flowInfo.moduleType !== 1 && (
                  <span
                    className="workflowAction hoverColorPrimary hoverBorderColorPrimary"
                    onClick={() => this.onExecuteFlow(false)}
                  >
                    {isProgressing ? _l('执行中...') : _l('立即执行%03000')}
                  </span>
                )}

              <Switch
                disabledClose={flowInfo.startAppType === APP_TYPE.APPROVAL_START && flowInfo.enabled}
                status={flowInfo.enabled ? 'active' : 'close'}
                pending={!!flowInfo.pending}
                isRefresh={flowInfo.publishStatus === 1 && flowInfo.enabled}
                isNew={!flowInfo.publish}
                switchStatus={this.switchStatus}
                publishFlow={this.publishOrCloseFlow}
                refreshPublish={this.publishOrCloseFlow}
              />
            </Fragment>
          )}
        </div>

        {publishErrorVisible && (
          <PublishErrorDialog
            isPlugin={isPlugin}
            info={errorInfo}
            onOk={() => {
              this.props.switchTabs(1);
              this.setState({ publishErrorVisible: false });
              this.errorNodeCenter();
            }}
            onCancel={() => this.setState({ publishErrorVisible: false })}
          />
        )}

        {this.renderPublishDialog()}

        {showTestFlow && this.renderTestFlow()}

        {showChatbotDialog && this.renderChatbotDialog()}
      </div>
    );
  }
}

export default withOpeners(connect(state => state.workflow)(Header), {
  openSelectRecords: useSelectRecords,
  openWorkflowLogDialog: useWorkflowLogDialog,
});
