import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import { get, isArray } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import sseAjax from 'src/api/sse';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { SpeechSynthesizer } from 'src/utils/audio';
import { emitter } from 'src/utils/common';
import { AI_FEATURE_TYPE } from 'src/utils/enum';
import MessageList from '../../ChatBot/components/MessageList';
import ResponseError from '../../ChatBot/components/ResponseError';
import Send from '../../ChatBot/components/Send';
import { MINGO_TASK_TYPE } from '../../ChatBot/enum';
import { title } from './config';
import RecordControlDataSelector from './RecordControlDataSelector';

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
    .aiFillCon {
      display: flex;
      align-items: center;
      justify-content: end;
    }
    .enableAiFillButton {
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      height: 30px;
      border-radius: 30px;
      color: #757575;
      margin-bottom: 6px;
      .starIcon {
        font-size: 15px;
        color: #dedede;
        margin-right: 2px;
      }
      .enabledIcon {
        display: none;
        font-size: 15px;
        margin-left: 3px;
        color: #4caf50;
      }
      &.active {
        .starIcon {
          color: #f9b81a;
        }
        .enabledIcon {
          display: inline-block;
        }
      }
      &:hover {
        background-color: var(--color-background-hover);
      }
    }
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

const MessageRecommendWrap = styled.div`
  margin-top: 8px;
  font-size: 15px;
  hr {
    border: none;
    border-top: 1px solid #eaeaea;
    margin: 20px 0;
  }
  .icon {
    font-size: 16px;
    margin-top: -2px;
    margin-right: 2px;
  }
  .tip {
    font-size: 13px;
    color: #757575;
  }
`;

function getDefaultValueOfMessagesOfMingoCreateRecord(worksheetId) {
  const latestMessagesOfMingoCreateRecord = localStorage.getItem(`latestMessagesOfMingoCreateRecord`);
  const parsedData = safeParse(latestMessagesOfMingoCreateRecord);
  return parsedData?.worksheetId === worksheetId ? parsedData.messages : [];
}

function MingoContent(props, ref) {
  const {
    disabled = false,
    className,
    maxWidth,
    base,
    infoLoading = false,
    defaultIsChatting = false,
    updateIsChatting = () => {},
    allowEdit = false,
    taskType,
    onBack = () => {},
    onClose = () => {},
  } = props;
  const messageListRef = useRef(null);
  const { appId, worksheetId, projectId, worksheetInfo } = base || {};
  const cache = useRef({
    isSmartFill: true,
  });
  const [isChatting, setIsChatting] = useState(defaultIsChatting);
  const [error, setError] = useState();
  const [enableAiFillButton, setEnableAiFillButton] = useState(true);
  const speechSynthesizer = useRef(new SpeechSynthesizer({ bufferDelay: 2000 }));
  const sendRef = useRef(null);
  const { messages, sendMessage, loading, activeMessageId, isRequesting, abortRequest, clearMessages, cleanMessages } =
    useChat({
      sendImageUrlsWithImage: true,
      defaultMessages: getDefaultValueOfMessagesOfMingoCreateRecord(worksheetId),
      aiCompletionApi: async (messages, { abortController }) => {
        return sseAjax.generateRecordByAI(
          {
            appId,
            projectId: window.appInfo?.projectId,
            worksheetId,
            isSmartFill: cache.current.isSmartFill,
            messageList: messages.map(message => ({
              ...message,
              content: isArray(message.content)
                ? message.content.filter(item => item.type !== 'tool_calls')
                : message.content,
            })),
          },
          {
            abortController,
            isReadableStream: true,
          },
        );
      },
      onMessagePipe: messageContent => {
        if (cache.current.autoPlay) {
          speechSynthesizer.current.speakStream(messageContent);
        }
      },
      onMessageDone: (messages = []) => {
        localStorage.setItem(
          'latestMessagesOfMingoCreateRecord',
          JSON.stringify({
            worksheetId,
            messages,
          }),
        );
      },
      onError: (error, eventData) => {
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
  const handleSend = (newMessage, { fromMessageId, images } = {}) => {
    setIsChatting(true);
    sendMessage(newMessage, { fromMessageId, images });
    setTimeout(() => {
      handleScrollToBottom();
    }, 100);
  };
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
  useEffect(() => {
    cache.current.cleanMessages = cleanMessages;
  }, [cleanMessages]);
  const handleClean = useCallback(() => {
    cache.current.cleanMessages();
  }, []);
  const handleBackAndClose = useCallback(() => {
    onBack();
    onClose();
  }, []);
  useEffect(() => {
    if (window.crateRecordInput) {
      try {
        sendRef.current?.setInputValue(window.crateRecordInput);
      } catch (error) {
        console.error(error);
      }
      window.crateRecordInput = undefined;
    }
    emitter.on('MINGO_CREATE_RECORD_CLEAN', handleClean);
    emitter.on('NEW_RECORD_UNMOUNT', handleBackAndClose);
    emitter.emit('MINGO_CREATE_RECORD');
    setTimeout(() => {
      emitter.emit('MINGO_CREATE_RECORD_ACTIVE', true);
    }, 10);
    return () => {
      emitter.off('MINGO_CREATE_RECORD_CLEAN', handleClean);
      emitter.off('NEW_RECORD_UNMOUNT', handleBackAndClose);
      emitter.emit('MINGO_CREATE_RECORD_ACTIVE', false);
    };
  }, []);
  return (
    <MingoContentWrap className={className}>
      <div className="header">
        <div className="chattingTitle t-flex t-flex-row t-items-center">
          <BgIconButton icon="backspace" onClick={onBack} />
          <div className="chattingTitleText">{title}</div>
        </div>
        <BgIconButton.Group gap={6}>
          <BgIconButton
            icon="close"
            onClick={() => {
              onBack();
              onClose();
            }}
          />
        </BgIconButton.Group>
      </div>
      <MessageList
        activeMessageId={activeMessageId}
        taskType={taskType}
        allowEdit={allowEdit}
        maxWidth={maxWidth}
        loading={loading}
        isRequesting={isRequesting}
        isLoadingChat={infoLoading}
        messages={messages
          .filter(item => !item.hidden)
          .map(item => (isArray(item.content) ? { ...item, content: item.content.filter(c => !c.hidden) } : item))}
        ref={messageListRef}
        errorComp={
          error ? <ResponseError aiFeatureType={AI_FEATURE_TYPE.CREATE_RECORD} error={error} showFeedback /> : null
        }
        messageRecommendComp={
          <MessageRecommendWrap>
            <div>{_l('我可以为您解析文字或图片内容，智能填写到表单字段')}</div>
            <div className="mTop10">{_l('请在下方输入 / 粘贴内容开始创建 👇')}</div>
            <hr />
            <div className="tip t-flex t-flex-row">
              <div className="icon">💡</div>
              <div className="t-flex-1">
                {_l('下次试试在工作表页面直接粘贴剪贴板内容，可以自动激活智能创建，更方便喔～')}
              </div>
            </div>
          </MessageRecommendWrap>
        }
        renderCustomBlock={({ type, content, isStreaming, isLastAssistantMessage }) => {
          if (type === 'mingo_generate_record_jsonl') {
            return (
              <RecordControlDataSelector
                appId={appId}
                worksheetId={worksheetId}
                projectId={projectId}
                controls={get(worksheetInfo, 'template.controls', [])}
                content={content}
                isStreaming={isStreaming}
                isLastAssistantMessage={isLastAssistantMessage}
              />
            );
          }
          return null;
        }}
        renderToolCalls={() => ''}
        onSend={handleSend}
      />
      {!disabled && (
        <div className="sendCon" style={{ maxWidth: maxWidth + 16 * 2 }}>
          <div className="aiFillCon">
            <Tooltip
              maxWidth={300}
              placement="topRight"
              title={
                enableAiFillButton
                  ? _l('✨AI根据输入内容智能推测或联网搜索相关信息，为您补全尽可能多的字段')
                  : _l('AI只填写输入内容中明确包含的字段')
              }
            >
              <div
                className={cx('enableAiFillButton', { active: enableAiFillButton })}
                onClick={() => {
                  setEnableAiFillButton(!enableAiFillButton);
                  cache.current.isSmartFill = !enableAiFillButton;
                }}
              >
                <i className="starIcon icon icon-auto_one_star"></i>
                {_l('智能填写')}
                {enableAiFillButton && <i className="enabledIcon icon icon-ok"></i>}
              </div>
            </Tooltip>
          </div>
          <Send
            allowUpload
            ref={sendRef}
            allowMultiSelection={false}
            isChatting={isChatting}
            loading={loading}
            isRequesting={isRequesting}
            abortRequest={abortRequest}
            setAutoPlay={value => {
              cache.current.autoPlay = value;
            }}
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
    </MingoContentWrap>
  );
}

MingoContent.propTypes = {
  className: PropTypes.string,
  maxWidth: PropTypes.number,
  updateIsChatting: PropTypes.func.isRequired,
};

export default forwardRef(MingoContent);

/**
 * 打开 mingo 创建工作表
 * @param {Object} params - 参数
 * @param {string} params.worksheetName - 工作表名称
 * @param {string} params.worksheetDescription - 工作表描述
 * @returns {void}
 */
export function openMingoCreateRecord(crateRecordInput = '') {
  window.mingoPendingStartTask = { type: MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT };
  window.crateRecordInput = crateRecordInput;
  emitter.emit('SET_MINGO_VISIBLE');
}
