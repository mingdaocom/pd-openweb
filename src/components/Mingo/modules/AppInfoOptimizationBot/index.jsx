import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import { isFunction, omit } from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import sseAjax from 'src/api/sse';
import { useGlobalStore } from 'src/common/GlobalStore';
import IconBtn from 'src/pages/worksheet/common/recordInfo/RecordForm/IconBtn';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { AI_FEATURE_TYPE } from 'src/utils/enum';
import MessageList from '../../ChatBot/components/MessageList';
import ResponseError from '../../ChatBot/components/ResponseError';
import Send from '../../ChatBot/components/Send';
import AppOptimizationComp from './AppOptimizationComp';
import Recommend from './Recommend';
import { ConfigPanel } from './Recommend';

const MessageListWrap = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ConfigIconWrap = styled.div`
  position: absolute;
  right: 16px;
  bottom: 6px;
  z-index: 1;
  > span {
    cursor: pointer;
    font-size: 18px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-tertiary);
    margin: 0px;
    &.active {
      color: var(--color-mingo);
    }
  }
`;

const ConfigPanelWrap = styled.div`
  padding: 12px 16px;
  background: var(--color-background-primary);
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
  width: 200px;
  .ming.Checkbox {
    display: flex;
    justify-content: space-between;
  }
`;

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
    color: var(--color-text-title);
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

function MingoContent(props, ref) {
  const {
    disabled = false,
    className,
    maxWidth,
    base,
    defaultIsChatting = false,
    updateIsChatting = () => {},
    allowEdit = false,
  } = props;
  const { appId } = base || {};
  const appOptimizationCompRef = useRef(null);
  const [config, setConfig] = useState({
    includeAppName: true,
    includeAppIcon: true,
  });
  const configSnapshotRef = useRef(null);
  const configByMessageIdRef = useRef({});
  const messageListRef = useRef(null);
  const cache = useRef({
    currentMessage: '',
    currentJSONLStr: '',
    JSONLIsPiping: false,
  });
  const [isChatting, setIsChatting] = useState(defaultIsChatting);
  const [error, setError] = useState();
  const {
    store: { appInfo },
  } = useGlobalStore();
  const { sendMessage, loading, isRequesting, messages, activeMessageId, abortRequest, clearMessages } = useChat({
    defaultMessages: [
      //     {
      //       role: 'user',
      //       content: '优化应用信息',
      //     },
      //     {
      //       role: 'assistant',
      //       content: `好的，我会根据当前应用信息，智能优化名称、图标及分组。如果您对优化内容有具体要求也可以告诉我。
      // \`\`\`custom_block_mingo_app_info_optimization_jsonl
      // {"appName": "应用名称", "appIcon": "应用图标", "appGroup": "应用分组"}
      // \`\`\`
      //       `,
      //     },
    ],
    aiCompletionApi: async (messages, { abortController }) => {
      configSnapshotRef.current = { ...config };
      //  0全部 1优化应用名称项 2优化应用项图标
      let optimizeType = 0;

      if (config.includeAppName && !config.includeAppIcon) {
        optimizeType = 1;
      }

      if (!config.includeAppName && config.includeAppIcon) {
        optimizeType = 2;
      }

      return sseAjax.optimizeAppInfo(
        {
          appId,
          messageList: messages.filter(m => m.role === 'user').map(m => omit(m, ['media'])),
          optimizeType,
        },
        {
          abortController,
          isReadableStream: true,
        },
      );
    },
    onMessageDone: (messages = []) => {
      console.log('onMessageDone', messages);
    },
    onError: (error, eventData) => {
      if (isFunction(cache.current.handleAbortRequest)) {
        cache.current.handleAbortRequest();
      }

      console.log('onError', error, eventData);

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

  const handleSend = (newMessage, { images, fileIds, media, useFileContentFormat } = {}) => {
    appOptimizationCompRef.current?.hidePopup();
    setIsChatting(true);
    sendMessage(newMessage, { images, fileIds, media, useFileContentFormat });
    setTimeout(() => {
      handleScrollToBottom();
    }, 100);
  };

  const handleAbortRequest = () => {
    abortRequest();
  };

  cache.current.handleAbortRequest = handleAbortRequest;
  useImperativeHandle(ref, () => ({
    destroy: () => {
      abortRequest();
      clearMessages();
      configSnapshotRef.current = null;
      configByMessageIdRef.current = {};
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
  return (
    <MingoContentWrap className={className}>
      <MessageListWrap>
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
          messageRecommendComp={
            <Recommend
              config={config}
              disabled={loading || isRequesting}
              onGenerate={description => handleSend(description)}
              onConfigChange={changes => {
                setConfig(prev => ({
                  ...prev,
                  ...changes,
                }));
              }}
            />
          }
          renderCustomBlock={({ type, content, isStreaming, isLastAssistantMessage, messageId }) => {
            if (type === 'mingo_app_info_optimization_jsonl') {
              let configForBlock = configByMessageIdRef.current[messageId];

              if (!configForBlock && configSnapshotRef.current) {
                configByMessageIdRef.current[messageId] = { ...configSnapshotRef.current };
                configForBlock = configByMessageIdRef.current[messageId];
              }

              if (!configForBlock) configForBlock = config;
              return (
                <AppOptimizationComp
                  appInfo={appInfo}
                  config={configForBlock}
                  isStreaming={isStreaming}
                  isLoading={isLastAssistantMessage && isStreaming}
                  content={content}
                  editable={isLastAssistantMessage}
                  ref={appOptimizationCompRef}
                />
              );
            }

            return null;
          }}
          onSend={handleSend}
        />
        {!!messages.length && (
          <ConfigIconWrap>
            <Trigger
              action={['hover']}
              popupAlign={{
                points: ['br', 'tr'],
                offset: [0, -6],
                overflow: { adjustX: true, adjustY: true },
              }}
              popup={
                <ConfigPanelWrap>
                  <ConfigPanel
                    checkboxTextPosition="left"
                    config={config}
                    disabled={loading || isRequesting}
                    onConfigChange={changes => {
                      setConfig(prev => ({
                        ...prev,
                        ...changes,
                      }));
                    }}
                  />
                </ConfigPanelWrap>
              }
              popupClassName="mingoCreateWorksheetDataBotConfigTrigger"
              destroyPopupOnHide
              zIndex={1050}
            >
              <IconBtn
                as="span"
                className={cx({ active: config.includeSamplePeople || config.includeSampleAttachments })}
              >
                <i className="icon icon-tune" />
              </IconBtn>
            </Trigger>
          </ConfigIconWrap>
        )}
      </MessageListWrap>
      {!disabled && (
        <div className="sendCon" style={{ maxWidth: maxWidth + 16 * 2 }}>
          <Send
            allowUpload
            needOcr
            mingoOcr
            allowMimeTypes={[
              { title: 'image', extensions: 'jpg,jpeg,png,heic' },
              { title: 'office', extensions: 'pdf,doc,docx,xls,xlsx,txt' },
            ]}
            uploadFileToolTip={_l(
              '文件数量：最多5个\n文件大小：单个文件不超过10M\n总字数：所有文档的总字数最多50k，超出自动忽略\n文件格式：PDF / TXT / Word / Excel / 图片',
            )}
            isChatting={isChatting}
            loading={loading}
            isRequesting={isRequesting}
            abortRequest={handleAbortRequest}
            onSend={(value, { files }) => {
              const imageFiles = files.filter(f => f.type.startsWith('image/'));
              const ocrFiles = files.filter(f => !f.type.startsWith('image/') && f.ocrId);
              handleSend(value, {
                images: imageFiles.map(f => f.url).filter(Boolean),
                fileIds: ocrFiles.map(f => f.ocrId).filter(Boolean),
                media: ocrFiles.map(f => f.commonAttachment),
                useFileContentFormat: true,
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
