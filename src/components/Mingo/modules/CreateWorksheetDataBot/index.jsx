import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { find, flatten, get, includes, isEmpty, isFunction, isObject, last, uniq } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import sseAjax from 'src/api/sse';
import worksheetAjax from 'src/api/worksheet';
import { SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import { controlState, formatControlToServer } from 'src/components/Form/core/utils';
import {
  SYSTEM_CONTROL,
  WIDGETS_TO_API_TYPE_ENUM,
  WORKFLOW_SYSTEM_CONTROL,
} from 'src/pages/widgetConfig/config/widget';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { emitter } from 'src/utils/common';
import { formatAiGenControlValue } from 'src/utils/control';
import { AI_FEATURE_TYPE } from 'src/utils/enum';
import { parseStreamingJsonlData } from 'src/utils/sse';
import MessageList from '../../ChatBot/components/MessageList';
import ResponseError from '../../ChatBot/components/ResponseError';
import Send from '../../ChatBot/components/Send';
import CreateWorksheetDataMask from './CreateWorksheetDataMask';
import Recommend from './Recommend';
import WorksheetDataGenerator from './WorksheetDataGenerator';

const MingoContentWrap = styled.div`
  padding: 0 0 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .sectionName {
    font-weight: bold;
    margin: 26px 0 6px;
    font-size: 15px;
    color: #151515;
  }
  .sendCon {
    position: relative;
    padding: 0 16px;
    margin: 0 auto;
    width: 100%;
    .abort-button {
      position: absolute;
      top: -30px;
      left: calc(50% - 35px);
    }
    .sendHeader {
      height: 38px;
    }
    .helpTitle {
      margin: 0px;
    }
  }
`;

function getDefaultValueOfMessagesOfMingoCreateWorksheetDataBot(storageKey, worksheetId) {
  if (!storageKey || !localStorage.getItem(storageKey)) {
    return {};
  }
  let data = {};
  try {
    const parsedData = JSON.parse(localStorage.getItem(storageKey));
    data = parsedData.worksheetId === worksheetId ? parsedData : {};
  } catch (error) {
    console.error(error);
    return {};
  }
  return data || {};
}

class PromiseQueue {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
    this.results = [];
    this.promises = []; // 存储所有返回的 Promise
    this.resolvers = []; // 存储每个 Promise 的 resolve 函数
  }

  add(task) {
    const index = this.promises.length;

    // 创建一个 Promise，将它的 resolve/reject 保存起来
    const promise = new Promise((resolve, reject) => {
      this.resolvers[index] = { resolve, reject };
    });

    this.promises.push(promise);
    this.queue.push({ task, index });
    this.next();

    return promise;
  }

  next() {
    while (this.running < this.concurrency && this.queue.length) {
      const { task, index } = this.queue.shift();
      this.running++;

      Promise.resolve(task())
        .then(result => {
          // 填充结果数组
          this.results[index] = { status: 'fulfilled', value: result };
          // 调用对应的 resolve
          if (this.resolvers[index]) {
            this.resolvers[index].resolve(result);
          }
        })
        .catch(error => {
          this.results[index] = { status: 'rejected', reason: error };
          if (this.resolvers[index]) {
            this.resolvers[index].reject(error);
          }
        })
        .finally(() => {
          this.running--;
          this.next();
        });
    }
  }

  async addAll(tasks) {
    // 清空状态
    this.results = new Array(tasks.length).fill(null);
    this.promises = [];
    this.resolvers = [];

    // 添加所有任务
    tasks.forEach(task => this.add(task));

    // 等待所有 Promise 完成
    await Promise.allSettled(this.promises);

    // 确保所有结果都已填充
    const completeResults = this.results.map((result, index) => {
      if (result === null) {
        // 如果某个结果还是 null（理论上不应该发生），返回错误
        return {
          status: 'rejected',
          reason: `Task ${index} did not complete properly`,
        };
      }
      return result;
    });

    return completeResults;
  }
}

function MingoContent(props, ref) {
  const {
    disabled = false,
    className,
    maxWidth,
    base,
    defaultIsChatting = false,
    updateIsChatting = () => {},
    allowEdit = false,
    onClose = () => {},
  } = props;
  const { appId, projectId, worksheetId, worksheetInfo } = base || {};
  const storageKey = `MINGO_CREATE_WORKSHEET_DATA_BOT_MESSAGES_${get(md, 'global.Account.accountId')}`;
  const defaultData = useMemo(
    () => getDefaultValueOfMessagesOfMingoCreateWorksheetDataBot(storageKey, worksheetId),
    [storageKey],
  );
  const messageListRef = useRef(null);
  const cache = useRef({
    currentMessage: '',
    currentJSONLStr: '',
    JSONLIsPiping: false,
  });
  const [isChatting, setIsChatting] = useState(defaultIsChatting);
  const [createdDataMap, setCreatedDataMap] = useState(defaultData.createdDataMap || {});
  const [selectedDataMessageId, setSelectedDataMessageId] = useState([]);
  const [previewTempData, setPreviewTempData] = useState([]);
  const [messageIdOfIsGeneratingMoreData, setMessageIdOfIsGeneratingMoreData] = useState();
  const [error, setError] = useState();
  const {
    sendMessage,
    loading,
    isRequesting,
    messages,
    activeMessageId,
    abortRequest,
    clearMessages,
    setIsRequesting,
    setLoading,
    reGenerateMessageAndNoUpdateMessages,
  } = useChat({
    defaultMessages: defaultData.messages || [],
    aiCompletionApi: async (messages, { abortController }) => {
      return sseAjax.generateExampleData(
        {
          worksheetId,
          messageList: messages,
        },
        {
          abortController,
          isReadableStream: true,
        },
      );
      // const systemPrompt = buildSystemPrompt({ worksheetInfo });
      // return sseAjax.buildWorkSheet(
      //   {
      //     appId: 'ab228e89-afd6-4aa1-b0f5-5aeb285bdb94',
      //     messageList: [
      //       {
      //         role: 'system',
      //         content: systemPrompt,
      //       },
      //       ...messages,
      //     ],
      //   },
      //   {
      //     abortController,
      //     isReadableStream: true,
      //   },
      // );
    },
    onMessagePipe: (messageContent, messageData, messageId) => {
      setSelectedDataMessageId(prev => uniq([...prev, messageId]));
      if (
        messageContent &&
        cache.current.currentMessage.includes('```custom_block_mingo_create_worksheet_data_jsonl\n') &&
        !cache.current.JSONLIsPiping
      ) {
        cache.current.JSONLIsPiping = true;
      }
      cache.current.currentMessage += messageContent;
      let parsedData;
      if (cache.current.JSONLIsPiping) {
        cache.current.currentJSONLStr += messageContent;
        parsedData = parseStreamingJsonlData(
          cache.current.currentJSONLStr,
          !cache.current.currentMessage.includes('\n```'),
        )
          .filter(item => !isEmpty(item))
          .map(row => {
            const newRow = {
              rowid: row.rowid || `temp-${uuidv4()}`,
            };
            Object.keys(row).forEach(key => {
              const control = find(visibleControls, { controlId: key });
              if (!control) return;
              newRow[key] = formatAiGenControlValue(control, row[key]);
            });
            return newRow;
          });
        // console.log('parsedData', parsedData);
        setPreviewTempData(parsedData);
      }
      if (cache.current.currentMessage.includes('\n```') && cache.current.JSONLIsPiping) {
        cache.current.JSONLIsPiping = false;
        setPreviewTempData([]);
        setMessageIdOfIsGeneratingMoreData(undefined);
        setCreatedDataMap(prev => ({
          ...prev,
          [messageId]: (prev[messageId] || []).concat(
            parsedData.map((row, index) => {
              return {
                ...row,
                rowid: row.rowid || `temp-${uuidv4()}`,
                fakeCreatedAt: new Date().getTime() + index,
              };
            }),
          ),
        }));
      }
    },
    onMessageDone: (messages = []) => {
      cache.current.currentMessage = '';
      cache.current.JSONLIsPiping = false;
      cache.current.currentJSONLStr = '';
      setCreatedDataMap(prev => {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            worksheetId,
            messages,
            createdDataMap: prev,
          }),
        );
        return prev;
      });
      console.log('onMessageDone', messages);
    },
    onError: (error, eventData) => {
      if (isFunction(cache.current.handleAbortRequest)) {
        cache.current.handleAbortRequest();
      }
      setError({
        errorMsg: _l('模型调用失败'),
        sourceData: eventData,
      });
    },
  });
  const handleScrollToBottom = useCallback(({ timeout = 0 } = {}) => {
    if (messageListRef.current) {
      messageListRef.current.scrollToBottom();
      setTimeout(() => {
        messageListRef.current.scrollToBottom();
      }, timeout);
    }
  }, []);
  const handleSend = (newMessage, { images } = {}) => {
    setIsChatting(true);
    sendMessage(newMessage, { images });
    setTimeout(() => {
      handleScrollToBottom();
    }, 100);
  };
  const handleAbortRequest = () => {
    abortRequest();
    cache.current.JSONLIsPiping = false;
    setMessageIdOfIsGeneratingMoreData(undefined);
    const messageId = last(messages)?.id;
    cache.current.currentMessage = '';
    cache.current.currentJSONLStr = '';
    cache.current.JSONLIsPiping = false;
    if (messageId) {
      setCreatedDataMap(prev => ({
        ...prev,
        [messageId]: (prev[messageId] || []).concat(
          previewTempData.map((row, index) => {
            return {
              ...row,
              rowid: row.rowid || `temp-${uuidv4()}`,
              fakeCreatedAt: new Date().getTime() + index,
            };
          }),
        ),
      }));
    }
    setPreviewTempData([]);
  };
  cache.current.handleAbortRequest = handleAbortRequest;
  useImperativeHandle(ref, () => ({
    destroy: () => {
      abortRequest();
      clearMessages();
      // 终止正在进行的 load 请求
      if (cache.current.loadAbortController) {
        cache.current.loadAbortController.abort();
      }
      setIsChatting(false);
      cache.current = {};
    },
  }));
  useEffect(() => {
    updateIsChatting(isChatting);
  }, [isChatting]);
  const visibleControls = get(worksheetInfo, 'template.controls', []).filter(
    control =>
      !includes(SHEET_VIEW_HIDDEN_TYPES, control.type) &&
      !includes(
        [...SYSTEM_CONTROL, ...WORKFLOW_SYSTEM_CONTROL].map(c => c.controlId).concat(['uaid']),
        control.controlId,
      ) &&
      controlState(control).visible,
  );
  const dataForPreview = flatten(selectedDataMessageId.map(messageId => createdDataMap[messageId] || []))
    .sort((a, b) => a.fakeCreatedAt - b.fakeCreatedAt)
    .concat(previewTempData);
  return (
    <MingoContentWrap className={className}>
      <MessageList
        activeMessageId={activeMessageId}
        allowEdit={allowEdit}
        maxWidth={maxWidth}
        loading={loading}
        isRequesting={isRequesting}
        messages={messages.filter(item => !item.hidden)}
        ref={messageListRef}
        errorComp={
          error ? <ResponseError aiFeatureType={AI_FEATURE_TYPE.SAMPLE_DATA} error={error} showFeedback /> : null
        }
        messageRecommendComp={<Recommend onSelect={description => handleSend(description)} />}
        renderCustomBlock={({ type, messageId, isStreaming, isLastAssistantMessage }) => {
          if (type === 'mingo_create_worksheet_data_jsonl') {
            const data = createdDataMap[messageId] || [];
            return (
              <WorksheetDataGenerator
                isLoading={(isLastAssistantMessage && isStreaming) || messageIdOfIsGeneratingMoreData === messageId}
                isSelected={selectedDataMessageId.includes(messageId)}
                count={data.length}
                onToggle={() => {
                  setSelectedDataMessageId(prev =>
                    selectedDataMessageId.includes(messageId)
                      ? prev.filter(id => id !== messageId)
                      : [...prev, messageId],
                  );
                }}
                onContinueGenerate={() => {
                  setIsRequesting(true);
                  setLoading(true);
                  setMessageIdOfIsGeneratingMoreData(messageId);
                  reGenerateMessageAndNoUpdateMessages(messageId, '继续生成10条');
                }}
              />
            );
          }
          return null;
        }}
        onSend={handleSend}
      />
      {!disabled && (
        <div className="sendCon" style={{ maxWidth: maxWidth + 16 * 2 }}>
          <Send
            allowUpload
            isChatting={isChatting}
            loading={loading}
            isRequesting={isRequesting}
            abortRequest={handleAbortRequest}
            onSend={(value, { files }) => {
              handleSend(value, {
                images: files
                  .filter(f => f.type.startsWith('image/'))
                  .map(f => f.file?.url)
                  .filter(Boolean),
              });
            }}
          />
        </div>
      )}
      {!!messages.length && (
        <CreateWorksheetDataMask
          isLoading={isRequesting || loading}
          appId={appId}
          projectId={projectId}
          controls={visibleControls}
          data={dataForPreview}
          onAppendToWorksheet={() => {
            function getValue(control, row) {
              return typeof row[control.controlId] === 'string'
                ? row[control.controlId]
                : isObject(row[control.controlId])
                  ? JSON.stringify(row[control.controlId])
                  : row[control.controlId];
            }
            const doNotAllowAddControlTypes = [WIDGETS_TO_API_TYPE_ENUM.AUTO_ID];
            if (find(visibleControls, c => c.type === 34)) {
              const queue = new PromiseQueue(3); // 并发数3
              queue
                .addAll(
                  dataForPreview.map(row => {
                    return () =>
                      worksheetAjax.addWorksheetRow({
                        worksheetId,
                        receiveControls: visibleControls
                          .filter(
                            control => row[control.controlId] && !doNotAllowAddControlTypes.includes(control.type),
                          )
                          .map(control =>
                            formatControlToServer(
                              {
                                controlId: control.controlId,
                                advancedSetting: control.advancedSetting,
                                type: control.type,
                                value: getValue(control, row),
                                ...(control.type === 34 ? { relationControls: control.relationControls } : {}),
                              },
                              { isFromMingoData: true },
                            ),
                          ),
                      });
                  }),
                )
                .then(responseList => {
                  alert(
                    _l('成功添加 %0 条记录', responseList.filter(response => response?.value?.resultCode === 1).length),
                  );
                  emitter.emit('RELOAD_SHEET_VIEW');
                  localStorage.removeItem(storageKey);
                  onClose();
                });
            } else {
              worksheetAjax
                .addWSRowsBatch({
                  worksheetId,
                  receiveRows: dataForPreview.map(row =>
                    visibleControls
                      .filter(control => row[control.controlId] && !doNotAllowAddControlTypes.includes(control.type))
                      .map(control =>
                        formatControlToServer(
                          {
                            controlId: control.controlId,
                            advancedSetting: control.advancedSetting,
                            type: control.type,
                            value: getValue(control, row),
                            ...(control.type === 34 ? { relationControls: control.relationControls } : {}),
                          },
                          { isFromMingoData: true },
                        ),
                      ),
                  ),
                })
                .then(count => {
                  alert(_l('成功添加 %0 条记录', count));
                  emitter.emit('RELOAD_SHEET_VIEW');
                  localStorage.removeItem(storageKey);
                  onClose();
                });
            }
          }}
          onClean={() => {
            setSelectedDataMessageId([]);
          }}
        />
      )}
    </MingoContentWrap>
  );
}

MingoContent.propTypes = {
  className: PropTypes.string,
  maxWidth: PropTypes.number,
  updateIsChatting: PropTypes.func.isRequired,
};

export default forwardRef(MingoContent);
