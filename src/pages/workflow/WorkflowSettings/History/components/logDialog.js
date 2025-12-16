import React, { Fragment, useEffect, useState } from 'react';
import JsonView from 'react-json-view';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, FunctionWrap, LoadDiv, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import GetHelp from 'src/components/GetHelp';
import { formatNumberThousand } from 'src/utils/control';
import { ACTION_ID, AGENT_TOOLS, APP_TYPE } from '../../enum';
import { getToolName } from '../../utils';

const DialogWrapper = styled(Dialog)`
  .mui-dialog-header {
    border-bottom: 1px solid #ddd;
  }
  .mui-dialog-body {
    padding: 0 !important;
    flex-basis: 600px !important;
    display: flex;
    flex-direction: column;
  }
`;

const Nav = styled.div`
  width: 320px !important;
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
      background-color: #f5f5f5;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  .scrollViewContainer {
    padding: 20px 24px 20px 21px;
    background: #fafafa;
    border-radius: 0 0 4px 0;
  }
  .contentMessage {
    border-radius: 6px;
    background: #fff;
    border: 1px solid #ddd;
    padding: 12px;
    margin-left: 69px;
    margin-top: 12px;
    &.success {
      border-color: #01ca83;
      background: rgba(1, 202, 131, 0.04);
    }
    &.error {
      border-color: #f44336;
    }
  }
  .react-json-view {
    word-break: break-all;
    border-radius: 2px;
  }
`;

const ListIconBox = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #5b00a6;
  background: #f9e6ff;
`;

const Error = styled.div`
  padding: 0 26px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 38px 38px 38px 38px;
  border: 1px solid #f44336;
  background: rgba(244, 67, 54, 0.04);
  font-size: 15px;
  color: #f44336;
  margin: 20px auto;
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

const LogDialog = props => {
  const { processId, nodeId, instanceId, onClose } = props;
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [folds, setFolds] = useState([]);
  const [list, setList] = useState(null);
  const [showConfigInfo, setShowConfigInfo] = useState(false);
  const [model, setModel] = useState('');
  const [isError, setIsError] = useState(false);
  const [support, setSupport] = useState({});
  const ListIcon = ({ item }) => {
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
          backgroundColor: '#6E09F9',
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
          backgroundColor: '#fff',
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
          backgroundColor: '#fff',
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

    return (
      <Fragment>
        <ListIconBox className="listIcon" style={style}>
          <i className={icon} />
        </ListIconBox>
        <div className="flex ellipsis mLeft10 bold">
          {_.includes(['memory', 'agent', 'ocr', 'model'], item.role)
            ? TEXT[item.role]
            : item.role === 'user' || (item.role === 'assistant' && !item.toolCall)
              ? model
              : item.flowNode?.id !== item.flowNode?.name
                ? item.flowNode.name
                : getToolName(item.toolCall?.name)}
        </div>
      </Fragment>
    );
  };
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
  const onScroll = _.debounce(() => {
    const offsetTop = document.querySelector('.logDialogWrapper').offsetTop;
    const sections = document.querySelectorAll('.workflowSectionName');
    let sectionIndex = 0;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      if (rect.top <= offsetTop + 80) {
        sectionIndex = index;
      }
    });

    setCurrentSectionIndex(sectionIndex);
  }, 200);
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
      .then(({ getModel, history, maxMessages, model, ocr, prompt, tools, totalTokens, price }) => {
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
            toolCall: {
              prompt,
              tools: (tools || []).map(o => ({ ...o, inputSchema: JSON.parse(o.inputSchema) })),
            },
          },
        ];
        const modelData = getModel ? [{ ...getModel, role: 'model' }] : [];
        const ocrData = ocr ? [{ ...ocr, role: 'ocr' }] : [];
        const historyData = history
          .map((o, index) => {
            const nextItem = history[index + 1] || {};

            if (o.isUser && nextItem.isUser && nextItem.role === 'assistant') {
              nextItem.isDelete = true;

              return {
                ...o,
                utime: nextItem.ctime,
                toolCall: {
                  responseData: _.slice(history, index)
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
      })
      .catch(() => {
        setList(false);
        setIsError(true);
      });
  }, []);

  return (
    <DialogWrapper
      className="logDialogWrapper"
      width={1060}
      visible
      title={_l('日志详情')}
      footer={null}
      onCancel={onClose}
    >
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

                        sections[index].scrollIntoView();
                      }}
                    >
                      <ListIcon item={item} />
                      {!_.includes(['memory', 'agent'], item.role) && (
                        <div className="mLeft5 Gray_75 Font12">{diffTime(item, list, index)}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollView>

              {(!md.global.Config.IsLocal || md.global.Config.IsPlatformLocal) && (
                <div
                  className="ThemeColor3 ThemeHoverColor2 Font14 flexRow alignItemsCenter pointer pLeft16"
                  style={{ height: 40 }}
                  onClick={() => GetHelp({ type: 2, instanceId, flowNodeId: nodeId, chatbotId: processId })}
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
                        className="pAll3 pointer Font0 mRight7 Gray_9e ThemeHoverColor3"
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
                      <ListIcon item={item} />
                      {!_.includes(['memory', 'agent'], item.role) && (
                        <div className="mLeft5 Gray_75 Font12">{diffTime(item, list, index, true)}</div>
                      )}
                    </div>
                    {!_.includes(folds, index) && (
                      <Fragment>
                        {item.role === 'agent' && (
                          <div className="contentMessage success">
                            <div className="flexRow Font13 Gray_75 bold">
                              <div className="flex">{_l('总 TOKEN 数')}</div>
                              {md.global.Config.IsPlatformLocal && <div className="flex">{_l('费用')}</div>}
                            </div>
                            <div className="flexRow Font15 bold">
                              <div className="flex">
                                {_l('%0 Tokens', formatNumberThousand(support.totalTokens) || 0)}
                              </div>
                              {md.global.Config.IsPlatformLocal && (
                                <div className="flex">{_l('%0 信用点', support.price || 0)}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {item.text && (
                          <div className="contentMessage">
                            <div className="flexRow alignItemsCenter">
                              <i
                                className={cx('Font16 Gray_9e', item.role === 'user' ? 'icon-input' : 'icon-output')}
                              />
                              <div className="bold mLeft6">
                                {item.role === 'user' ? _l('%0 输入', item.createBy.fullname) : _l('输出')}
                              </div>
                              <div className="Gray_75 Font12 mLeft6 flex">
                                {moment(item.ctime).format('YYYY/MM/DD HH:mm:ss.SSS')}
                              </div>
                              <i
                                className="icon-copy Font16 Gray_9e ThemeHoverColor3 pointer"
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
                                  <i className="icon-settings Font16 Gray_9e" />
                                  <div className="bold mLeft6">{_l('配置信息')}</div>
                                  <i
                                    className={cx(
                                      'Font14 Gray_9e ThemeHoverColor3 pointer mLeft6',
                                      showConfigInfo ? 'icon-arrow-down' : 'icon-arrow-right-tip',
                                    )}
                                    onClick={() => setShowConfigInfo(!showConfigInfo)}
                                  />
                                  <div className="flex" />
                                  <i
                                    className="icon-copy Font16 Gray_9e ThemeHoverColor3 pointer"
                                    onClick={() => copyText(JSON.stringify(item.toolCall))}
                                  />
                                </div>
                                {showConfigInfo && (
                                  <div className="mTop6">
                                    <JsonView
                                      src={item.toolCall}
                                      theme="summerfruit:inverted"
                                      enableClipboard={false}
                                      displayDataTypes={false}
                                      displayObjectSize={false}
                                      name={null}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {item.toolCall.arguments && (
                              <div className="contentMessage">
                                <div className="flexRow alignItemsCenter">
                                  <i className="icon-input Font16 Gray_9e" />
                                  <div className="bold mLeft6">{_l('输入')}</div>
                                  <div className="Gray_75 Font12 mLeft6 flex">
                                    {moment(item.ctime).format('YYYY/MM/DD HH:mm:ss.SSS')}
                                  </div>
                                  <i
                                    className="icon-copy Font16 Gray_9e ThemeHoverColor3 pointer"
                                    onClick={() => copyText(item.toolCall.arguments)}
                                  />
                                </div>
                                <div className="mTop6">
                                  {convertObjectData(item.toolCall.arguments) ? (
                                    <JsonView
                                      src={convertObjectData(item.toolCall.arguments)}
                                      theme="summerfruit:inverted"
                                      enableClipboard={false}
                                      displayDataTypes={false}
                                      displayObjectSize={false}
                                      name={null}
                                    />
                                  ) : (
                                    item.toolCall.arguments
                                  )}
                                </div>
                              </div>
                            )}

                            {item.toolCall.responseData && (
                              <div className="contentMessage success">
                                <div className="flexRow alignItemsCenter">
                                  <i className="icon-output Font16 Gray_9e" />
                                  <div className="bold mLeft6">{_l('输出')}</div>
                                  <div className="Gray_75 Font12 mLeft6 flex">
                                    {moment(item.utime).format('YYYY/MM/DD HH:mm:ss.SSS')}
                                  </div>
                                  <i
                                    className="icon-copy Font16 Gray_9e ThemeHoverColor3 pointer"
                                    onClick={() => copyText(item.toolCall.responseData)}
                                  />
                                </div>
                                <div className="mTop6 breakAll">
                                  {convertObjectData(item.toolCall.responseData) ? (
                                    <JsonView
                                      src={convertObjectData(item.toolCall.responseData)}
                                      theme="summerfruit:inverted"
                                      enableClipboard={false}
                                      displayDataTypes={false}
                                      displayObjectSize={false}
                                      name={null}
                                    />
                                  ) : (
                                    item.toolCall.responseData
                                  )}
                                </div>
                              </div>
                            )}
                          </Fragment>
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
    </DialogWrapper>
  );
};

export default props => FunctionWrap(LogDialog, { ...props });
