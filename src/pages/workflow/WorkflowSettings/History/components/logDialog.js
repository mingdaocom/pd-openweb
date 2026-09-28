import React, { Fragment, useEffect, useMemo, useState } from 'react';
import JsonView from '@mingdaocom/json-view';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { LoadDiv, ScrollView } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import flowNode from '../../../api/flowNode';
import useGetHelp from 'src/components/Mingo/ChatBot/components/GetHelp';
import { formatNumberThousand } from 'src/utils/domain/control/number';
import { ACTION_ID, AGENT_TOOLS, APP_TYPE } from '../../enum';
import { getToolName } from '../../utils';

const LOG_MODAL_STYLES = {
  header: { padding: 20, margin: 0, borderBottom: '1px solid var(--color-border-primary)' },
  body: { display: 'flex', flexDirection: 'column' },
  container: { padding: 0, height: 600 },
};

const Nav = styled.div`
  width: 320px !important;
  flex-shrink: 0;
  .scrollViewContainer {
    padding: 12px 8px;
  }
  li {
    height: 48px;
    display: flex;
    align-items: center;
    padding: 12px 8px;
    cursor: pointer;
    border-radius: 6px;

    &:hover,
    &.active {
      background-color: var(--color-background-hover);
    }
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  .scrollViewContainer {
    padding: 20px 24px 20px 21px;
    background: var(--color-background-secondary);
    border-radius: 0 0 4px 0;
  }
  .contentMessage {
    border-radius: 6px;
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-primary);
    padding: 12px;
    margin-left: 69px;
    margin-top: 12px;
    &.success {
      border-color: var(--color-task);
      background: rgba(1, 202, 131, 0.04);
    }
    &.error {
      border-color: var(--color-error);
    }
  }
`;

const ListIconBox = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-mingo-dark);
  background: #eee3ff;
`;

const Error = styled.div`
  padding: 0 26px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 38px 38px 38px 38px;
  border: 1px solid var(--color-error);
  background: rgba(244, 67, 54, 0.04);
  font-size: 15px;
  color: var(--color-error);
  margin: 20px auto;
`;

const FailureTag = styled.span`
  flex-shrink: 0;
  box-sizing: border-box;
  height: 22px;
  margin-left: 8px;
  padding: 0 6px;
  border: 1px solid rgba(244, 67, 54, 0.35);
  border-radius: 4px;
  background: var(--color-error-bg);
  color: var(--color-error);
  font-size: 12px;
  line-height: 20px;
`;

const FailureMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 10px;
  padding: 14px 16px;
  border: 1px solid rgba(244, 67, 54, 0.35);
  border-radius: 4px;
  background: var(--color-error-bg);
  .label {
    flex-shrink: 0;
    font-weight: bold;
    color: var(--color-text-primary);
  }
  .message {
    color: var(--color-error);
    word-break: break-all;
  }
`;

const MODEL_ICON = {
  AI_Agent: {
    icon: 'icon-AI_Agent',
    color: '#2196f3',
  },
  GPT: {
    icon: 'icon-chatgpt',
    color: '#000',
  },
  DeepSeek: {
    icon: 'icon-deepseek',
    color: '#4d6bfe',
  },
  QWen: {
    icon: 'icon-Qwen',
    color: '#615ced',
  },
};

const ERROR_MESSAGE_KEYS = ['errorMessage', 'ErrorMessage', 'errorMsg', 'message', 'causeMsg', 'error'];

export function normalizeAgentErrorMessage(value) {
  if (value === undefined || value === null) return '';

  if (typeof value === 'object') {
    for (const key of ERROR_MESSAGE_KEYS) {
      if (value[key] !== undefined && value[key] !== null) {
        const message = normalizeAgentErrorMessage(value[key]);

        if (message) return message;
      }
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  const text = String(value).trim();

  if (!text) return '';

  const jsonCandidates = [text];
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');

  if (jsonStart > -1 && jsonEnd > jsonStart) {
    jsonCandidates.push(text.slice(jsonStart, jsonEnd + 1));
  }

  for (const candidate of jsonCandidates) {
    try {
      const parsed = JSON.parse(candidate);

      if (parsed !== candidate) {
        const message = normalizeAgentErrorMessage(parsed);

        if (message) return message;
      }
    } catch {
      // 普通错误文本无需按 JSON 处理
    }
  }

  return text;
}

export const isAgentLogItemFailed = item => item?.failed === true || item?.toolCall?.failed === true;

const getAgentLogErrorMessage = (item, fallbackErrorMessage) => {
  const values = [
    item?.errorMessage,
    item?.toolCall?.errorMessage,
    item?.toolCall?.responseData,
    item?.text,
    fallbackErrorMessage,
  ];

  for (const value of values) {
    const message = normalizeAgentErrorMessage(value);

    if (message) return message;
  }

  return '';
};

export const decorateFailedAgentHistory = (history = [], fallbackErrorMessage = '') =>
  history.map(item =>
    isAgentLogItemFailed(item) ? { ...item, errorMessage: getAgentLogErrorMessage(item, fallbackErrorMessage) } : item,
  );

const FailureStatus = ({ item }) => {
  if (item.role === 'agent' && item.failed) {
    return <FailureTag>{_l('本轮未完成')}</FailureTag>;
  }

  return isAgentLogItemFailed(item) ? <FailureTag>{_l('失败')}</FailureTag> : null;
};

export const ListIcon = ({ item, model }) => {
  const { icon, ...style } = (() => {
    if (item.role === 'memory') {
      return {
        icon: 'icon-article',
        color: '#9e9e9e',
        backgroundColor: '#eaeaea',
      };
    }

    if (item.role === 'agent') {
      return {
        icon: 'icon-AI_Agent',
        color: '#fff',
        backgroundColor: 'var(--color-mingo)',
      };
    }

    if (item.role === 'ocr') {
      return {
        icon: 'icon-folder',
        color: 'rgba(0, 0, 0, 0.5)',
      };
    }

    if (item.role === 'model') {
      return {
        icon: 'icon-AI_Agent',
        color: '#2196f3',
        backgroundColor: 'var(--color-background-primary)',
        border: '1px solid #ddd',
      };
    }

    if (item.role === 'user' || (item.role === 'assistant' && !item.toolCall)) {
      return {
        ...(_.includes(model, 'GPT')
          ? MODEL_ICON.GPT
          : _.includes(model, 'DeepSeek')
            ? MODEL_ICON.DeepSeek
            : _.includes(model, 'QWen')
              ? MODEL_ICON.QWen
              : MODEL_ICON.AI_Agent),
        backgroundColor: 'var(--color-background-primary)',
        border: '1px solid #ddd',
      };
    }

    if (item.flowNode?.toolType) {
      return AGENT_TOOLS[item.flowNode?.toolType];
    }

    if (item.flowNode?.appType === APP_TYPE.SHEET && item.flowNode?.toolType !== 0) {
      let icon = 'icon-AI_Agent';

      if (item.flowNode.actionId === ACTION_ID.ADD) {
        icon = 'icon-playlist_add';
      } else if (item.flowNode.actionId === ACTION_ID.EDIT) {
        icon = 'icon-workflow_update';
      } else if (item.flowNode.actionId === ACTION_ID.WORKSHEET_TOTAL) {
        icon = 'icon-task_functions';
      } else if (item.flowNode.actionId === ACTION_ID.WORKSHEET_FIND) {
        icon = 'icon-search';
      }

      return { icon };
    }

    return {
      icon: 'icon-tune',
      color: 'rgba(0, 0, 0, 0.5)',
    };
  })();
  const TEXT = {
    memory: _l('记忆'),
    agent: _l('Agent'),
    ocr: _l('解析文件链接'),
    model: _l('选择模型'),
  };

  const isTool =
    !_.includes(['memory', 'agent', 'ocr', 'model', 'user'], item.role) &&
    !(item.role === 'assistant' && !item.toolCall);
  const name = _.includes(['memory', 'agent', 'ocr', 'model'], item.role)
    ? TEXT[item.role]
    : !isTool
      ? model
      : item.flowNode?.id !== item.flowNode?.name
        ? item.flowNode.name
        : getToolName(item.toolCall?.name);
  const desc = isTool && typeof item.flowNode?.desc === 'string' ? item.flowNode.desc.trim() : '';
  const title = desc ? `${name}（${desc}）` : name;

  return (
    <Fragment>
      <ListIconBox className="listIcon" style={style}>
        <i className={icon} />
      </ListIconBox>
      <div className="ellipsis minWidth0 mLeft10 bold" title={title}>
        {title}
      </div>
    </Fragment>
  );
};

const LogDialog = props => {
  const { open: openGetHelp, holder: getHelpHolder } = useGetHelp();
  const { processId, nodeId, instanceId, onClose } = props;
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [folds, setFolds] = useState([]);
  const [list, setList] = useState(null);
  const [showConfigInfo, setShowConfigInfo] = useState(false);
  const [model, setModel] = useState('');
  const [isError, setIsError] = useState(false);
  const [support, setSupport] = useState({});

  const copyText = text => {
    copy(text);
    alert(_l('复制成功'));
  };

  const diffTime = (item, list, index, showDesc = false) => {
    const formatTime = diff => {
      let min = 0;
      let sec = 0;

      min = Math.floor(diff / 60000);
      sec = ((diff % 60000) / 1000).toFixed(3).replace(/\.?0+$/, '');

      return `${min ? _l('%0min', min) : ''}${sec ? _l('%0s', sec) : ''}`;
    };

    const { ctime, utime } = item;
    let diff = 0;

    if (ctime) {
      if (utime) {
        diff = moment(utime).diff(moment(ctime), 'ms');
      } else if (list[index - 1].utime || list[index - 1].ctime) {
        diff = moment(ctime).diff(moment(list[index - 1].utime || list[index - 1].ctime), 'ms');
      }
    }

    return diff <= 0 ? '' : showDesc ? _l('耗时：%0', formatTime(diff)) : formatTime(diff);
  };

  const onScroll = useMemo(
    () =>
      _.debounce(() => {
        const wrapper = document.querySelector('.logDialogWrapper');
        if (!wrapper) return;

        const offsetTop = wrapper.offsetTop;
        const sections = document.querySelectorAll('.workflowSectionName');
        let sectionIndex = 0;

        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();

          if (rect.top <= offsetTop + 80) {
            sectionIndex = index;
          }
        });

        setCurrentSectionIndex(sectionIndex);
      }, 200),
    [],
  );

  useEffect(() => {
    return () => {
      onScroll.cancel();
    };
  }, [onScroll]);

  const convertObjectData = data => {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.log(e);
      return '';
    }
  };

  useEffect(() => {
    flowNode
      .getAgentNodeDetailHistory({ processId, nodeId, instanceId }, { silent: true })
      .then(
        ({
          getModel,
          history = [],
          maxMessages,
          model,
          ocr,
          prompt,
          tools,
          totalTokens,
          price,
          failed,
          errorMessage,
        }) => {
          const decoratedHistory = decorateFailedAgentHistory(history, errorMessage);
          const hasFailedHistory = decoratedHistory.some(isAgentLogItemFailed);
          const memoryData = maxMessages?.length
            ? [
                {
                  utime: maxMessages[0].ctime,
                  role: 'memory',
                  toolCall: {
                    responseData: JSON.stringify(
                      maxMessages.map(o => {
                        return {
                          role: o.role,
                          content: o.text,
                        };
                      }),
                    ),
                  },
                },
              ]
            : [];
          const agentData = [
            {
              role: 'agent',
              failed: failed === true,
              errorMessage: failed === true && !hasFailedHistory ? normalizeAgentErrorMessage(errorMessage) : '',
              toolCall: {
                prompt,
                tools: (tools || []).map(o => ({ ...o, inputSchema: JSON.parse(o.inputSchema) })),
              },
            },
          ];
          const modelData = getModel ? [{ ...getModel, role: 'model' }] : [];
          const ocrData = ocr ? [{ ...ocr, role: 'ocr' }] : [];
          const historyData = decoratedHistory
            .map((o, index) => {
              const nextItem = decoratedHistory[index + 1] || {};

              if (o.isUser && nextItem.isUser && nextItem.role === 'assistant' && !isAgentLogItemFailed(nextItem)) {
                nextItem.isDelete = true;

                return {
                  ...o,
                  utime: nextItem.ctime,
                  toolCall: {
                    responseData: _.slice(decoratedHistory, index)
                      .filter(o => o.isUser && o.role === 'assistant')
                      .map(o => o.text)
                      .join(''),
                  },
                };
              }

              return o;
            })
            .filter(o => !o.isDelete);

          setFolds(memoryData.length ? [0] : []);
          setList(memoryData.concat(agentData, modelData, ocrData, historyData));
          setModel(model);
          setSupport({ totalTokens, price });
        },
      )
      .catch(() => {
        setList(false);
        setIsError(true);
      });
  }, [instanceId, nodeId, processId]);

  return (
    <Modal
      className="logDialogWrapper"
      width={1060}
      open
      title={_l('日志详情')}
      footer={null}
      styles={LOG_MODAL_STYLES}
      onCancel={onClose}
    >
      {getHelpHolder}
      <div className="flexRow h100 minHeight0">
        {list === null && <LoadDiv />}
        {list && (
          <Fragment>
            <Nav className="flexColumn">
              <ScrollView className="flex">
                <ul>
                  {list.map((item, index) => (
                    <li
                      key={index}
                      className={cx({ active: currentSectionIndex === index })}
                      onClick={() => {
                        const sections = document.querySelectorAll('.workflowSectionName');
                        sections[index]?.scrollIntoView();
                      }}
                    >
                      <ListIcon item={item} model={model} />
                      <FailureStatus item={item} />
                      <div className="flex" />
                      {!_.includes(['memory', 'agent'], item.role) && (
                        <div className="mLeft5 textSecondary Font12" style={{ flexShrink: 0 }}>
                          {diffTime(item, list, index)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollView>

              {window.platformENV.isPlatform && (
                <div
                  className="colorPrimary hoverColorPrimaryDark Font14 flexRow alignItemsCenter pointer pLeft16"
                  style={{ height: 40 }}
                  onClick={() => openGetHelp({ type: 2, instanceId, flowNodeId: nodeId, chatbotId: processId })}
                >
                  {_l('反馈给平台')}
                </div>
              )}
            </Nav>

            <Content>
              <ScrollView onScroll={onScroll}>
                {list.map((item, index) => (
                  <Fragment key={index}>
                    <div className={cx('flexRow alignItemsCenter workflowSectionName', { mTop24: index !== 0 })}>
                      <div
                        className="pAll3 pointer Font0 mRight7 textTertiary hoverColorPrimary"
                        style={{ flexShrink: 0 }}
                        onClick={() => {
                          if (_.includes(folds, index)) {
                            setFolds(folds.filter(o => o !== index));
                          } else {
                            setFolds([...folds, index]);
                          }
                        }}
                      >
                        <i
                          className={cx(
                            'Font14',
                            _.includes(folds, index) ? 'icon-arrow-right-tip' : 'icon-arrow-down',
                          )}
                        />
                      </div>
                      <ListIcon item={item} model={model} />
                      <FailureStatus item={item} />
                      <div className="flex" />
                      {!_.includes(['memory', 'agent'], item.role) && (
                        <div className="mLeft5 textSecondary Font12" style={{ flexShrink: 0 }}>
                          {diffTime(item, list, index, true)}
                        </div>
                      )}
                    </div>
                    {!_.includes(folds, index) && (
                      <Fragment>
                        {item.role === 'agent' && (
                          <div className={cx('contentMessage', item.failed ? 'error' : 'success')}>
                            <div className="flexRow Font13 textSecondary bold">
                              <div className="flex">{_l('总 TOKEN 数')}</div>
                              {window.platformENV.isPlatform && <div className="flex">{_l('费用')}</div>}
                            </div>
                            <div className="flexRow Font15 bold">
                              <div className="flex">
                                {_l('%0 Tokens', formatNumberThousand(support.totalTokens) || 0)}
                              </div>
                              {window.platformENV.isPlatform && (
                                <div className="flex">{_l('%0 信用点', support.price || 0)}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {item.text && !isAgentLogItemFailed(item) && (
                          <div className="contentMessage">
                            <div className="flexRow alignItemsCenter">
                              <i
                                className={cx(
                                  'Font16 textTertiary',
                                  item.role === 'user' ? 'icon-input' : 'icon-output',
                                )}
                              />
                              <div className="bold mLeft6">
                                {item.role === 'user' ? _l('%0 输入', item.createBy.fullname) : _l('输出')}
                              </div>
                              <div className="textSecondary Font12 mLeft6 flex">
                                {moment(item.ctime).format('YYYY/MM/DD HH:mm:ss.SSS')}
                              </div>
                              <i
                                className="icon-copy Font16 textTertiary hoverColorPrimary pointer"
                                onClick={() => copyText(item.text)}
                              />
                            </div>
                            <div className="mTop6 breakAll">{item.text.replace(/<\/?FINAL_ANSWER>/g, '')}</div>
                          </div>
                        )}

                        {item.toolCall && (
                          <Fragment>
                            {item.role === 'agent' && (
                              <div className="contentMessage">
                                <div className="flexRow alignItemsCenter">
                                  <i className="icon-settings Font16 textTertiary" />
                                  <div className="bold mLeft6">{_l('配置信息')}</div>
                                  <i
                                    className={cx(
                                      'Font14 textTertiary hoverColorPrimary pointer mLeft6',
                                      showConfigInfo ? 'icon-arrow-down' : 'icon-arrow-right-tip',
                                    )}
                                    onClick={() => setShowConfigInfo(!showConfigInfo)}
                                  />
                                  <div className="flex" />
                                  <i
                                    className="icon-copy Font16 textTertiary hoverColorPrimary pointer"
                                    onClick={() => copyText(JSON.stringify(item.toolCall))}
                                  />
                                </div>
                                {showConfigInfo && (
                                  <div className="mTop6">
                                    <JsonView theme="transparent" data={item.toolCall} enableClipboard={false} />
                                  </div>
                                )}
                              </div>
                            )}

                            {item.toolCall.arguments && (
                              <div className="contentMessage">
                                <div className="flexRow alignItemsCenter">
                                  <i className="icon-input Font16 textTertiary" />
                                  <div className="bold mLeft6">{_l('输入')}</div>
                                  <div className="textSecondary Font12 mLeft6 flex">
                                    {moment(item.ctime).format('YYYY/MM/DD HH:mm:ss.SSS')}
                                  </div>
                                  <i
                                    className="icon-copy Font16 textTertiary hoverColorPrimary pointer"
                                    onClick={() => copyText(item.toolCall.arguments)}
                                  />
                                </div>
                                <div className="mTop6">
                                  {convertObjectData(item.toolCall.arguments) ? (
                                    <JsonView
                                      theme="transparent"
                                      data={convertObjectData(item.toolCall.arguments)}
                                      enableClipboard={false}
                                    />
                                  ) : (
                                    item.toolCall.arguments
                                  )}
                                </div>
                              </div>
                            )}

                            {item.toolCall.responseData && !isAgentLogItemFailed(item) && (
                              <div className="contentMessage success">
                                <div className="flexRow alignItemsCenter">
                                  <i className="icon-output Font16 textTertiary" />
                                  <div className="bold mLeft6">{_l('输出')}</div>
                                  <div className="textSecondary Font12 mLeft6 flex">
                                    {moment(item.utime).format('YYYY/MM/DD HH:mm:ss.SSS')}
                                  </div>
                                  <i
                                    className="icon-copy Font16 textTertiary hoverColorPrimary pointer"
                                    onClick={() => copyText(item.toolCall.responseData)}
                                  />
                                </div>
                                <div className="mTop6 breakAll">
                                  {convertObjectData(item.toolCall.responseData) ? (
                                    <JsonView
                                      theme="transparent"
                                      data={convertObjectData(item.toolCall.responseData)}
                                      enableClipboard={false}
                                    />
                                  ) : (
                                    item.toolCall.responseData
                                  )}
                                </div>
                              </div>
                            )}
                          </Fragment>
                        )}

                        {isAgentLogItemFailed(item) && item.errorMessage && (
                          <div className="contentMessage error">
                            <div className="flexRow alignItemsCenter">
                              <i className="icon-output Font16 textTertiary" />
                              <div className="bold mLeft6">{_l('输出')}</div>
                              {(item.utime || item.ctime) && (
                                <div className="textSecondary Font12 mLeft6 flex">
                                  {moment(item.utime || item.ctime).format('YYYY/MM/DD HH:mm:ss.SSS')}
                                </div>
                              )}
                              <div className="flex" />
                              <i
                                className="icon-copy Font16 textTertiary hoverColorPrimary pointer"
                                onClick={() => copyText(item.errorMessage)}
                              />
                            </div>
                            <FailureMessage>
                              <div className="label">{_l('Error Message')}</div>
                              <div className="message">{item.errorMessage}</div>
                            </FailureMessage>
                          </div>
                        )}
                      </Fragment>
                    )}
                  </Fragment>
                ))}
              </ScrollView>
            </Content>
          </Fragment>
        )}

        {isError && (
          <Error>
            <i className="icon-workflow_failure mRight5 Font20" />
            {_l('系统处理异常，未返回有效内容')}
          </Error>
        )}
      </div>
    </Modal>
  );
};

export function useWorkflowLogDialog() {
  return useFunctionWrapComponent(LogDialog);
}
