import React, {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flatten, get, isArray, isEmpty, trim } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import appManagementAjax from 'src/api/appManagement';
import mingoAjax from 'src/api/mingo';
import { useGlobalStore } from 'src/common/GlobalStore';
import { toEditWidgetPage } from 'src/pages/widgetConfig/util/index';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { SpeechSynthesizer } from 'src/utils/audio';
import { emitter } from 'src/utils/common';
import { AI_FEATURE_TYPE } from 'src/utils/enum';
import CreateWorksheetRecommend from '../../ChatBot/components/CreateWorksheetRecommend';
import MessageList from '../../ChatBot/components/MessageList';
import ResponseError from '../../ChatBot/components/ResponseError';
import Send from '../../ChatBot/components/Send';
import { MINGO_TASK_STATUS, MINGO_TASK_TYPE } from '../../ChatBot/enum';
import { createWorksheetSuggestionSSE, generateWorksheetWidgetsSSE } from '../../ChatBot/service/aiTask';
import { buildGenerateWorksheetWidgetsUserMessage } from '../../ChatBot/service/buildGenerateWorksheetWidgetsMessages';
import { getStepStatusText } from './LoadingWithSteps';
import MingoCreateWorksheet from './MingoCreateWorksheet';
import MingoEditWorksheetInfo from './MingoEditWorksheetInfo';
import MingoGeneratedWidgetsSelector from './MingoGeneratedWidgetsSelector';
import NewCreatedWorkSheets from './NewCreatedWorkSheets';

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

function getCurrentAppData({ base = {}, sheetList = {} } = {}) {
  if (window?.globalStoreForMingo?.activeModule === 'worksheet') {
    let loading = sheetList.loading;
    const { appId, worksheetId, groupId } = base;
    const worksheets = flatten(sheetList.data.map(item => (item.type === 0 ? item : item.items))).filter(
      sheet => sheet && sheet.type === 0,
    );
    const appDetail =
      appId === window.appInfo?.id ? { name: window.appInfo?.name, description: window.appInfo?.description } : null;
    const baseInfo = {
      loading: loading || !appDetail,
      appId,
      worksheetId,
      projectId: window.appInfo?.projectId,
      sectionId: groupId,
      worksheets,
      appName: window.appInfo?.name,
      appDescription: window.appInfo?.description,
    };
    return {
      activeModule: 'worksheetControlsEdit',
      appId: baseInfo.appId,
      worksheetId: baseInfo.worksheetId,
      projectId: baseInfo.projectId,
      sectionId: baseInfo.sectionId,
      worksheets: baseInfo.worksheets,
      appName: baseInfo.appName,
      appDescription: baseInfo.appDescription,
    };
  } else if (window?.globalStoreForMingo?.activeModule === 'worksheetControlsEdit') {
    const globalStoreForMingo = window.globalStoreForMingo;
    return {
      activeModule: 'worksheet',
      appId: globalStoreForMingo.appId,
      appName: globalStoreForMingo.appName,
      worksheetId: globalStoreForMingo.worksheetId,
      worksheetName: globalStoreForMingo.worksheetName,
      projectId: globalStoreForMingo.projectId,
    };
  }
}

export const STEP_STATUS = {
  GET_WORKSHEET_NAME_AND_ICON: 0,
  CREATING_WORKSHEET: 1,
  CREATING_WORKSHEET_WIDGETS: 2,
};

function MingoContent(props, ref) {
  const {
    disabled = false,
    className,
    maxWidth,
    sheetList,
    base,
    infoLoading = false,
    defaultIsChatting = false,
    onClose,
    updateIsChatting = () => {},
    baseLoading = false,
    allowEdit = false,
    taskType,
    setTitle = () => {},
  } = props;
  const storageKey = `MINGO_CACHE_CREATE_WORKSHEET_BOT_${get(md, 'global.Account.accountId')}`;
  const defaultData = useMemo(() => {
    let result = {};
    if (localStorage.getItem(storageKey)) {
      result = JSON.parse(localStorage.getItem(storageKey));
    }
    return result;
  }, [storageKey]);
  const {
    store: { mingoCreateWorksheetAction },
  } = useGlobalStore();
  const [rootComp, setRootComp] = useState(null);
  const [error, setError] = useState();
  const [sendDisabled, setSendDisabled] = useState(false);
  const [currentAppData, setCurrentAppData] = useState(getCurrentAppData({ base, sheetList }));
  const [unsavedControlIds, setUnsavedControlIds] = useState([]);
  const { appId, projectId, sectionId, worksheetId } = currentAppData;
  const cache = useRef({
    taskStatus:
      defaultData.taskStatus ||
      window.mingoPendingCreateWorksheetTaskStatus ||
      MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_PREPARING_WORKSHEET_DESCRIPTION,
  });
  const messageListRef = useRef(null);
  const [isChatting, setIsChatting] = useState(defaultIsChatting);
  const [taskStatus, setTaskStatus] = useState(
    defaultData.taskStatus ||
      window.mingoPendingCreateWorksheetTaskStatus ||
      MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_PREPARING_WORKSHEET_DESCRIPTION,
  );
  const [taskStep, setTaskStep] = useState();
  const handleSetTaskStatus = useCallback(status => {
    setTaskStatus(status);
    cache.current.taskStatus = status;
  }, []);
  const speechSynthesizer = useRef(new SpeechSynthesizer({ bufferDelay: 2000 }));
  const {
    messages,
    sendMessage,
    loading,
    activeMessageId,
    isRequesting,
    abortRequest,
    clearMessages,
    setMessages,
    setIsRequesting,
    reGenerate,
    cleanMessages,
  } = useChat({
    defaultMessages: defaultData.messages || [],
    messageProps: {
      messageTaskStatus: taskStatus,
    },
    aiCompletionApi: async (messages, { abortController }) => {
      const taskStatus = cache.current.taskStatus;
      if (taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_WIDGETS) {
        return generateWorksheetWidgetsSSE({
          appId,
          messages: [
            {
              role: 'user',
              content: buildGenerateWorksheetWidgetsUserMessage(
                cache.current.worksheetDescription,
                window.globalStoreForMingo?.allWidgets || [],
              ),
              hidden: true,
              messageTaskStatus: taskStatus,
            },
          ].concat(
            messages
              .filter(message => message.messageTaskStatus === taskStatus)
              .map(message => ({
                ...message,
                content: isArray(message.content)
                  ? message.content.filter(item => item.type !== 'tool_calls')
                  : message.content,
              }))
              .slice(-1),
          ),
          abortController,
        });
      }
      return createWorksheetSuggestionSSE({ appId, taskType, messages, abortController, currentAppData });
    },
    onMessagePipe: messageContent => {
      if (cache.current.autoPlay) {
        speechSynthesizer.current.speakStream(messageContent);
      }
    },
    onMessageDone: messages => {
      if (cache.current.taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_WIDGETS) {
        emitter.emit('UPDATE_GLOBAL_STORE', 'mingoIsCreatingWorksheetStatus', 2);
      }
      if (cache.current.taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_WIDGETS) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            worksheetId: window.globalStoreForMingo?.worksheetId,
            accountId: get(md, 'global.Account.accountId'),
            messages: messages.map(item => ({ ...item, deactivated: true })),
            taskStatus: cache.current.taskStatus,
            taskType: MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT,
          }),
        );
      }
      console.log('onMessageDone', messages);
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
    if (taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_WIDGETS) {
      emitter.emit('UPDATE_GLOBAL_STORE', 'mingoIsCreatingWorksheetStatus', 1);
    }
    if (!isEmpty(unsavedControlIds)) {
      emitter.emit('WIDGET_CONFIG_DELETE_WIDGETS', { needDeleteWidgets: unsavedControlIds });
    }
    setIsChatting(true);
    if (taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_WIDGETS) {
      const userMessageContent = buildGenerateWorksheetWidgetsUserMessage(
        cache.current.worksheetDescription,
        window.globalStoreForMingo?.allWidgets || [],
      );
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: 'user',
          content: userMessageContent,
          hidden: true,
        },
      ]);
      sendMessage(newMessage, {
        messageOptions: { messageTaskStatus: cache.current.taskStatus },
      });
    } else {
      sendMessage(newMessage, { fromMessageId, images });
    }
    setTimeout(() => {
      handleScrollToBottom();
    }, 100);
  };
  const handleStartCreateWorksheet = useCallback(createWorksheetParams => {
    const { worksheetName, worksheetDescription } = createWorksheetParams;
    handleSend([worksheetName, worksheetDescription].filter(trim).join('、'));
  }, []);
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
    const newData = getCurrentAppData({ base, sheetList });
    setCurrentAppData(oldState => ({
      ...oldState,
      ...newData,
    }));
  }, [window?.globalStoreForMingo?.activeModule, baseLoading, base, sheetList]);
  useEffect(() => {
    if (get(mingoCreateWorksheetAction, 'action') === 'createFromEmpty') {
      setTimeout(() => {
        setTitle(_l('生成表单字段'));
      }, 0);
      const { worksheetInfo = {} } = mingoCreateWorksheetAction;
      const { name, desc } = worksheetInfo;
      setIsRequesting(true);
      cache.current.worksheetDescription = [_l('工作表名称：%0', name), desc && _l('工作表描述：%0', desc)]
        .filter(Boolean)
        .join('、');
      handleSend(_l('开始生成'));
      emitter.emit('UPDATE_GLOBAL_STORE', 'mingoCreateWorksheetAction', true);
    }
  }, [mingoCreateWorksheetAction?.action]);
  useEffect(() => {
    if (window.createWorksheetParams) {
      const { worksheetName, worksheetDescription } = window.createWorksheetParams;
      handleSend([worksheetName, worksheetDescription].filter(trim).join('、'));
      window.createWorksheetParams = undefined;
    }
    emitter.on('WIDGET_CONFIG_UNMOUNT', onClose);
    emitter.on('MINGO_START_CRETE_WORKSHEET', handleStartCreateWorksheet);
    delete window.mingoPendingCreateWorksheetTaskStatus;
    return () => {
      emitter.emit('UPDATE_GLOBAL_STORE', 'mingoIsCreatingWorksheetStatus', false);
      emitter.emit('UPDATE_GLOBAL_STORE', 'mingoCreateWorksheetAction', false);
      emitter.off('MINGO_START_CRETE_WORKSHEET', handleStartCreateWorksheet);
      emitter.off('WIDGET_CONFIG_UNMOUNT', onClose);
    };
  }, []);
  return (
    <MingoContentWrap className={className}>
      <MessageList
        taskStatus={taskStatus}
        showLoadingWhenContentIsEmpty={!error}
        handleSetTaskStatus={handleSetTaskStatus}
        activeMessageId={activeMessageId}
        taskType={taskType}
        projectId={projectId}
        appId={appId}
        allowEdit={allowEdit}
        maxWidth={maxWidth}
        loading={loading}
        isRequesting={isRequesting}
        statusText={getStepStatusText(taskStep)}
        // customLoadingComp={<LoadingWithSteps stepStatus={taskStep} />}
        isLoadingChat={infoLoading}
        messages={messages.filter(item => !item.hidden)}
        renderToolCalls={() => ''}
        ref={messageListRef}
        errorComp={
          error ? <ResponseError aiFeatureType={AI_FEATURE_TYPE.CREATE_SHEET} error={error} showFeedback /> : null
        }
        messageRecommendComp={
          taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_PREPARING_WORKSHEET_DESCRIPTION && (
            <Fragment>
              <div className="messageContent">{_l('请告诉我您想创建的工作表，或上传参考图片 😉')}</div>
              <CreateWorksheetRecommend appId={appId} onSelect={({ name }) => handleSend(name)} />
            </Fragment>
          )
        }
        renderCustomBlock={({ type, content, deactivated, isStreaming, isLastAssistantMessage }) => {
          if (type === 'mingo_create_worksheet_description' && content) {
            return (
              <MingoCreateWorksheet
                isStreaming={isStreaming}
                taskStatus={taskStatus}
                content={content}
                disabled={!isLastAssistantMessage}
                onClick={async () => {
                  handleSetTaskStatus(MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_BEGIN_CREATE_WORKSHEET);
                  cache.current.worksheetDescription = content;
                  setSendDisabled(true);
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages.push({
                      messageTaskStatus: taskStatus,
                      id: uuidv4(),
                      role: 'user',
                      content: _l('开始创建'),
                    });
                    return newMessages;
                  });
                  setIsRequesting(true);
                  setTaskStep(STEP_STATUS.GET_WORKSHEET_NAME_AND_ICON);
                  handleScrollToBottom({ timeout: 100 });
                  const { worksheetName, icons } = await mingoAjax.getRecommendedSheetSummaries({
                    appId,
                    requirements: content,
                  });
                  const iconName = icons[0].fileName || 'table';
                  const iconUrl = `https://fp1.mingdaoyun.cn/customIcon/${iconName}.svg`;
                  setTaskStep(STEP_STATUS.CREATING_WORKSHEET);
                  appManagementAjax
                    .addWorkSheet({
                      appId,
                      sourceType: 1,
                      name: worksheetName,
                      iconColor: '#732ED1',
                      projectId,
                      appSectionId: sectionId,
                      icon: iconName,
                      iconUrl,
                      type: 0,
                    })
                    .then(data => {
                      setIsRequesting(false);
                      if (data.workSheetId) {
                        setMessages(prev => {
                          const newMessages = [...prev];
                          newMessages.push({
                            messageTaskStatus: taskStatus,
                            id: uuidv4(),
                            role: 'assistant',
                            content: `已为你创建工作表\n\`\`\`custom_block_mingo_edit_worksheet_info\n
              {
                "workSheetName": "${worksheetName}",
                "worksheetId": "${data.workSheetId}",
                "icon": "${iconName}",
                "iconColor": "#732ED1",
                "iconUrl": "${iconUrl}",
                "icons": ${JSON.stringify(icons)}
              }\n\`\`\``,
                          });
                          return newMessages;
                        });
                        handleScrollToBottom();
                        handleSetTaskStatus(MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_SUCCESS);
                        setTaskStep(STEP_STATUS.CREATING_WORKSHEET_WIDGETS);
                        window.hideAllPanels = true;
                        toEditWidgetPage(
                          {
                            sourceId: data.workSheetId,
                          },
                          false,
                        );
                        emitter.emit('UPDATE_GLOBAL_STORE', 'mingoCreateWorksheetAction', true);
                        setSendDisabled(false);
                        handleSetTaskStatus(MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_WIDGETS);
                        emitter.emit('UPDATE_GLOBAL_STORE', 'mingoIsCreatingWorksheetStatus', 1);
                        reGenerate();
                      }
                    });
                }}
              />
            );
          }
          if (type === 'mingo_edit_worksheet_info') {
            const { workSheetName, worksheetId, icon, icons } = safeParse(content);
            return (
              <MingoEditWorksheetInfo
                appId={appId}
                taskStatus={taskStatus}
                projectId={projectId}
                worksheetId={worksheetId}
                worksheetName={workSheetName}
                iconName={icon}
                icons={icons}
              />
            );
          }
          if (type === 'mingo_generate_worksheet_widgets_jsonl') {
            return (
              <MingoGeneratedWidgetsSelector
                appId={appId}
                projectId={projectId}
                worksheetId={worksheetId}
                sectionId={sectionId}
                content={content}
                deactivated={deactivated}
                isStreaming={isStreaming}
                isLastAssistantMessage={isLastAssistantMessage}
                setRootComp={setRootComp}
                updateUnsavedControlIds={setUnsavedControlIds}
                onAppendNewCreatedWorksheets={relateControls => {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages.push({
                      messageTaskStatus: taskStatus,
                      id: uuidv4(),
                      role: 'assistant',
                      content: `\`\`\`custom_block_mingo_new_created_worksheets\n
              {
                "relateControls": ${JSON.stringify(relateControls)}
              }\n\`\`\``,
                    });
                    return newMessages;
                  });
                  handleScrollToBottom();
                }}
              />
            );
          }
          if (type === 'mingo_new_created_worksheets') {
            const { relateControls } = safeParse(content);
            return (
              <NewCreatedWorkSheets
                relateControls={relateControls}
                onEditWorkSheet={({ worksheetId, worksheetName, worksheetDescription } = {}) => {
                  toEditWidgetPage(
                    {
                      sourceId: worksheetId,
                    },
                    false,
                  );
                  cleanMessages();
                  window.pendingTaskForEditWorksheet = () => {
                    setIsRequesting(true);
                    cache.current.worksheetDescription = [
                      _l('工作表名称：%0', worksheetName),
                      worksheetDescription && _l('工作表描述：%0', worksheetDescription),
                    ]
                      .filter(Boolean)
                      .join('、');
                    handleSend(_l('开始生成'));
                    emitter.emit('UPDATE_GLOBAL_STORE', 'mingoCreateWorksheetAction', true);
                  };
                }}
              />
            );
          }
          return <code>{content}</code>;
        }}
        onSend={handleSend}
      />
      {!disabled && (
        <div className="sendCon" style={{ maxWidth: maxWidth + 16 * 2 }}>
          <Send
            disabled={sendDisabled}
            allowUpload={taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_PREPARING_WORKSHEET_DESCRIPTION}
            isChatting={isChatting}
            loading={loading}
            isRequesting={isRequesting}
            abortRequest={() => {
              abortRequest();
              if (messages.filter(message => message.role === 'assistant').length === 0) {
                emitter.emit('UPDATE_GLOBAL_STORE', 'mingoIsCreatingWorksheetStatus', false);
                onClose();
              }
              emitter.emit(
                'UPDATE_GLOBAL_STORE',
                'mingoIsCreatingWorksheetStatus',
                unsavedControlIds.length ? 2 : false,
              );
            }}
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
      {rootComp}
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
export function openMingoCreateWorksheet(params) {
  window.mingoPendingStartTask = { type: MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT, params };
  localStorage.removeItem(`MINGO_CACHE_CREATE_WORKSHEET_BOT_${get(md, 'global.Account.accountId')}`);
  if (!isEmpty(params)) {
    window.createWorksheetParams = params;
    emitter.emit('MINGO_START_CRETE_WORKSHEET', params);
  }
  emitter.emit('SET_MINGO_VISIBLE');
}
