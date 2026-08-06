import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { find, flatten, get, includes, isEmpty, isFunction, isObject, last, uniq } from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import agentApi from 'src/api/agent';
import appManagementAjax from 'src/api/appManagement';
import departmentAjax from 'src/api/department';
import organizeAjax from 'src/api/organize';
import worksheetAjax from 'src/api/worksheet';
import { SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import { useGlobalStore } from 'src/common/GlobalStore';
import { formatControlToServer } from 'src/components/Form/core/utils';
import {
  SYSTEM_CONTROL,
  WIDGETS_TO_API_TYPE_ENUM,
  WORKFLOW_SYSTEM_CONTROL,
} from 'src/pages/widgetConfig/config/widget';
import IconBtn from 'src/pages/worksheet/common/recordInfo/RecordForm/IconBtn';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { genBotSessionId } from 'src/utils/agentSession';
import { emitter } from 'src/utils/common';
import { controlState, formatAiGenControlValue } from 'src/utils/control';
import { AI_FEATURE_TYPE } from 'src/utils/enum';
import { parseStreamingJsonlData } from 'src/utils/sse';
import mingoTemplateFiles from '../../../../../staticfiles/choroplethData/mingo/MingoTemplateFiles.json';
import MessageList from '../../ChatBot/components/MessageList';
import ResponseError from '../../ChatBot/components/ResponseError';
import Send from '../../ChatBot/components/Send';
import { getUploadFileTooltip } from '../../ChatBot/enum';
import { buildFormFieldsControls, cancelStream, resolveStreamError } from '../../ChatBot/utils';
import CreateWorksheetDataMask from './CreateWorksheetDataMask';
import Recommend from './Recommend';
import { ConfigPanel } from './Recommend';
import WorksheetDataGenerator from './WorksheetDataGenerator';

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
    color: var(--color-text-primary);
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

function isFullUrl(url = '') {
  return /^http/i.test(url);
}

function appendHost(host = '', path = '') {
  if (!host || !path) return path;

  return `${host.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function getPresetUsersAndFiles(config) {
  const result = {};

  if (config.includeSamplePeople) {
    result.users = (mingoTemplateFiles.Users || []).map(user => ({
      ...user,
      AvatarUrl:
        user.AvatarUrl && !isFullUrl(user.AvatarUrl)
          ? appendHost(get(md, 'global.FileStoreConfig.pictureHost'), user.AvatarUrl)
          : user.AvatarUrl,
    }));
  }

  if (config.includeSampleAttachments) {
    result.files = (mingoTemplateFiles.Files || []).map(file => {
      const filePath = file.FilePath || '';
      const host = /^pic/i.test(filePath)
        ? get(md, 'global.FileStoreConfig.pictureHost')
        : get(md, 'global.FileStoreConfig.documentHost');

      return {
        ...file,
        FilePath: filePath && !isFullUrl(filePath) ? appendHost(host, filePath) : filePath,
      };
    });
  }

  return result;
}

function getAvailableControls(controls = []) {
  return controls.reduce((result, control) => {
    if (
      !includes(SHEET_VIEW_HIDDEN_TYPES, control.type) &&
      !includes(
        [...SYSTEM_CONTROL, ...WORKFLOW_SYSTEM_CONTROL].map(c => c.controlId).concat(['uaid']),
        control.controlId,
      ) &&
      controlState(control).visible
    ) {
      result.push(control);
    }

    if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) {
      result.push(...getAvailableControls(control.relationControls || []));
    }

    return result;
  }, []);
}

function flattenDepartments(departments = []) {
  return departments.reduce((result, department) => {
    result.push(department);

    if (department.subDepartments && department.subDepartments.length) {
      result.push(...flattenDepartments(department.subDepartments));
    }

    return result;
  }, []);
}

function formatDepartments(departments = []) {
  return flattenDepartments(departments)
    .slice(0, 3)
    .map(department => ({
      DepartmentName: department.departmentName,
      DepartmentId: department.departmentId,
    }));
}

function formatOrgRoles(orgRoles = []) {
  return orgRoles.slice(0, 3).map(role => ({
    OrgRoleId: role.organizeId,
    OrgRoleName: role.organizeName,
  }));
}

async function getPresetDepartmentsAndRoles({ controls, projectId }) {
  const hasDepartment = !!find(controls, { type: WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT });
  const hasOrgRole = !!find(controls, { type: WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE });

  if (!hasDepartment && !hasOrgRole) return;

  const [departments, orgRoles] = await Promise.all([
    hasDepartment
      ? departmentAjax
          .searchDepartment2(
            {
              projectId,
              keywords: '',
              includeDisabled: false,
              pageIndex: 1,
              pageSize: 3,
            },
            { silent: true },
          )
          .then(res => formatDepartments(res.item2 || []))
          .catch(() => [])
      : Promise.resolve([]),
    hasOrgRole
      ? organizeAjax
          .getOrganizes(
            {
              projectId,
              keywords: '',
              pageIndex: 1,
              pageSize: 3,
              includeDisabled: false,
            },
            { silent: true },
          )
          .then(res => formatOrgRoles(res.list || []))
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  return {
    departments,
    orgRoles,
  };
}

async function getPresetRelatedRecords({ controls, worksheetId }) {
  const hasRelatedRecord = !!find(
    controls,
    control => control.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET && control.dataSource,
  );

  if (!hasRelatedRecord) return;

  return appManagementAjax
    .getExampleDataMockSourceData(
      {
        worksheetId,
      },
      { silent: true },
    )
    .catch(() => undefined);
}

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
  const configStorageKey = `MINGO_CREATE_BOT_CONFIG_${get(md, 'global.Account.accountId')}`;
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem(configStorageKey);
      if (cached) return safeParse(cached, 'object');
    } catch {
      // Ignore invalid local cache and fall back to default config.
    }

    return { includeSamplePeople: true, includeSampleAttachments: true };
  });
  useEffect(() => {
    safeLocalStorageSetItem(configStorageKey, JSON.stringify(config));
  }, [config]);
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
    sessionId: genBotSessionId(),
  });
  const {
    store: { activeWorksheet },
  } = useGlobalStore();
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
    aiCompletionApi: async (_, { abortController, agentParams = {} }) => {
      const availableControls = getAvailableControls(get(worksheetInfo, 'template.controls', []));
      const [presetDepartmentsAndRoles, presetRelatedRecords] = await Promise.all([
        getPresetDepartmentsAndRoles({
          controls: availableControls,
          projectId: worksheetInfo.projectId,
        }),
        getPresetRelatedRecords({
          controls: availableControls,
          worksheetId,
        }),
      ]);

      return await agentApi.agentExecuteStream(
        {
          agentName: 'worksheet-example-data-generator',
          forceReroute: false,
          ...agentParams,
          sessionId: cache.current.sessionId,
          message: agentParams.message || _l('开始'),
          context: {
            userLanguage: window.getCurrentLang() || 'zh-Hans',
            formFields: JSON.stringify(
              buildFormFieldsControls(worksheetInfo, {
                from: 'generate-example-data',
                includeUsers: config.includeSamplePeople,
                includeFiles: config.includeSampleAttachments,
              }),
            ),
            presetUsersAndFiles: JSON.stringify(getPresetUsersAndFiles(config)),
            ...(presetDepartmentsAndRoles
              ? { presetDepartmentsAndRoles: JSON.stringify(presetDepartmentsAndRoles) }
              : {}),
            ...(presetRelatedRecords ? { presetRelatedRecords } : {}),
          },
        },
        { abortController },
      );
    },
    onMessagePipe: (messageContent, messageData, messageId) => {
      setSelectedDataMessageId(prev => uniq([...prev, messageId]));
      const jsonlBlockFence = '```custom_block_mingo_create_worksheet_data_jsonl\n';

      cache.current.currentMessage += messageContent;

      if (messageContent && cache.current.currentMessage.includes(jsonlBlockFence) && !cache.current.JSONLIsPiping) {
        cache.current.JSONLIsPiping = true;
        cache.current.currentJSONLStr = cache.current.currentMessage.slice(
          cache.current.currentMessage.indexOf(jsonlBlockFence) + jsonlBlockFence.length,
        );
      } else if (cache.current.JSONLIsPiping) {
        cache.current.currentJSONLStr += messageContent;
      }

      let parsedData;

      if (cache.current.JSONLIsPiping) {
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

      if (/\n```(\n|$)/.test(cache.current.currentMessage) && cache.current.JSONLIsPiping) {
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

      setError(resolveStreamError(error, eventData));
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

  const handleSend = (newMessage, { images, fileIds, media, useFileContentFormat, attachments } = {}) => {
    setIsChatting(true);
    sendMessage(newMessage, {
      images,
      fileIds,
      media,
      useFileContentFormat,
      attachments,
    });
    setTimeout(() => {
      handleScrollToBottom();
    }, 100);
  };

  const handleAbortRequest = () => {
    abortRequest();
    cancelStream(cache.current.sessionId);
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
      cancelStream(cache.current.sessionId);
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
    if (!activeWorksheet) {
      onClose();
    }
  }, [activeWorksheet]);
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
      <MessageListWrap>
        <MessageList
          showAssistantAvatar={false}
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
              onSelect={description => handleSend(description)}
              onConfigChange={changes => {
                setConfig(prev => ({
                  ...prev,
                  ...changes,
                }));
              }}
            />
          }
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
                    reGenerateMessageAndNoUpdateMessages(messageId, _l('继续生成10条'));
                  }}
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
            uploadFileToolTip={getUploadFileTooltip()}
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
                // 图片与文档都需透传给后端，useChat 会按 mime 映射为 image/doc
                attachments: files,
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
