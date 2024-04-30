import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, Textarea, LoadDiv, ScrollView, SvgIcon } from 'ming-ui';
import cx from 'classnames';
import ChatList from './ChatList';
import assistantApi from 'src/api/assistant';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import { createParser } from 'eventsource-parser';
import { getPssId } from 'src/util/pssId';
import { getMarkdownContent } from '../../util';
import DocumentTitle from 'react-document-title';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 848px;
  margin: 0 auto;

  .closeIconWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 110px;
    height: 110px;
    background: #f5f5f5;
    border-radius: 50%;
  }
  &.fullContent {
    max-width: 800px;
    .footerWrapper {
      padding: 12px 0 24px;
    }
    .messageItem {
      margin: 24px 0;
    }
  }
`;

const Empty = styled.div`
  padding: 0 24px;
  &.fullContent {
    padding: 0;
  }
  .avatarWrapper {
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 64px;
    height: 64px;
    &.hasBorder {
      border: 1px solid #e0e0e0;
    }
    &.smallSize {
      min-width: 36px;
      width: 36px;
      height: 36px;
    }
  }
  .nameText {
    font-size: 20px;
    font-weight: 500;
    text-align: center;
    margin-top: 14px;
  }
  .promptMsg {
    width: fit-content;
    max-width: 100%;
    min-height: 36px;
    padding: 8px 12px;
    border-radius: 10px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
  }
  .questionList {
    width: 100%;
    padding-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .questionItem {
      width: calc(50% - 4px);
      min-height: 36px;
      line-height: 34px;
      padding: 0 12px;
      border-radius: 10px;
      border: 1px solid #e0e0e0;
      &.canSend {
        cursor: pointer;
        &:hover {
          border-color: #2196f3;
        }
      }
    }
    &.singleQuestionRow {
      .questionItem {
        width: 100%;
      }
    }
  }
`;

const FooterWrapper = styled.div`
  padding: 12px 24px 24px 24px;
  width: 100%;
  .footStatusWrapper {
    display: flex;
    align-items: center;
    height: 36px;
    width: fit-content;
    padding: 0 12px;
    border: 1px solid #eaeaea;
    border-radius: 36px;
    background: #fff;
    margin: 0 auto;
    margin-bottom: 16px;
    color: #9e9e9e;

    &.stopBtn {
      height: 32px;
      padding: 0 16px;
      border-radius: 18px;
      &.canStop {
        cursor: pointer;
        &:hover {
          border-color: #2196f3;
          color: #2196f3;
        }
      }
    }
  }
  .footer {
    display: flex;
    position: relative;
    textarea {
      box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.2);
      border-radius: 24px !important;
      border-width: 0 48px 0 8px !important;
      border-color: transparent !important;
      line-height: 1.15;
    }
    .clearBtn {
      width: 48px;
      height: 48px;
      margin-right: 8px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2196f3;
      font-size: 26px;
      color: #fff;
    }
    .sendBtn {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      .icon-airplane {
        color: #ddd;
      }
      &.enabled {
        cursor: pointer;
        &:hover {
          background: #f5f5f5;
          .icon-airplane {
            color: #2196f3;
          }
        }
      }
    }
  }
`;

export const CHAT_STATUS = {
  create: 'create',
  running: 'running',
  search: 'search',
  reply: 'reply',
};

let stopAjax;

export default function ChatBox(props) {
  const {
    assistantId, //assistantId存在 = 正常聊天(非测试聊天)
    className,
    fullContent,
    singleQuestionRow = true, //一行显示单个问题
    notAllowRestart,
    showTitle,
    /**对话式创建参数 */
    isDialogueCreate,
    projectId,
    assistantConfig,
    onChangeConfig,
    createMsgList = [],
    setCreateMsgList,
  } = props;
  const [messageList, setMessageList] = useState(isDialogueCreate ? createMsgList : []);
  const [controller, setController] = useState(
    isDialogueCreate && !messageList[0].content ? new AbortController() : null,
  );
  const [keywords, setKeywords] = useState('');
  const [config, setConfig] = useState(assistantConfig || {});
  const [historyLoading, setHistoryLoading] = useState(true);
  const [noMoreHistory, setNoMoreHistory] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(true);
  const [threadId, setThreadId] = useState('');
  const [runId, setRunId] = useState('');
  const [chatStatus, setChatStatus] = useState(null);
  const [configUpdating, setConfigUpdating] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { iconUrl, iconColor, name, description, exampleQuestions = [], id, preamble, status } = config;
  const currentAssistantId = id || assistantId;
  const sendDisabled = !isDialogueCreate && (!currentAssistantId || !threadId);
  const isSending = [CHAT_STATUS.create, CHAT_STATUS.running].includes(chatStatus);

  useEffect(() => {
    if (assistantId) {
      getSimpleInfo();
    } else {
      currentAssistantId
        ? assistantApi
            .getThread({ projectId, assistantId: currentAssistantId })
            .then(res => {
              res && setThreadId(res);
              setAssistantLoading(false);
            })
            .catch(error => setAssistantLoading(false))
        : setAssistantLoading(false);
    }
  }, [currentAssistantId]);

  useEffect(() => {
    assistantConfig && setConfig(assistantConfig);
  }, [assistantConfig]);

  useEffect(() => {
    generateMessage();
  }, [controller]);

  //正式聊天--获取助手基础信息+threadId
  const getSimpleInfo = () => {
    assistantApi
      .getSimpleInfo({ assistantId: currentAssistantId })
      .then(res => {
        if (res) {
          setConfig(res);
          setThreadId(res.threadId);
          setAssistantLoading(false);
          res.threadId && res.status === 2 ? getHistoryList(res.threadId) : setHistoryLoading(false);
        }
      })
      .catch(error => setAssistantLoading(false));
  };

  //获取历史消息
  const getHistoryList = threadId => {
    setHistoryLoading(true);
    assistantApi
      .getListAssistantMessage({ threadId, limit: 10, after: !!messageList.length ? messageList[0].msgId : undefined })
      .then(res => {
        if (res) {
          setHistoryLoading(false);
          setNoMoreHistory(res.length < 10);
          const list = res.map(item => ({ ...item, content: item.content.replace(/【\d+†source】/gi, '') }));
          const msgList = _.reverse(list).concat(messageList);
          setMessageList(msgList);
          if (messageList.length) {
            $('.assistantChatListScroll').nanoScroller({
              scrollTo: $(`.messageItem[data-id=${(res[0] || {}).msgId}]`),
            });
          } else {
            $('.assistantChatListScroll .nano-content').scrollTop(10000000);
          }
        }
      })
      .catch(error => setHistoryLoading(false));
  };

  const scrollEvent = (event, values) => {
    const { position, direction } = values;

    if (noMoreHistory || historyLoading) return false;
    direction === 'up' && position === 0 && getHistoryList(threadId);
  };

  //发送聊天消息
  const onSend = keywords => {
    !isDialogueCreate && setChatStatus(CHAT_STATUS.create);
    setController(new AbortController());
    setMessageList(
      messageList.concat([
        { role: 'user', content: keywords.trim() },
        { role: 'assistant', content: '' },
      ]),
    );
    setTimeout(() => {
      setKeywords('');
      $('.assistantChatListScroll .nano-content').scrollTop(10000000);
    }, 0);
  };

  //停止回复
  const onStopApply = () => {
    if (stopAjax) {
      return;
    }
    stopAjax = assistantApi.stopReply({ assistantId: currentAssistantId, threadId, runId });
    stopAjax.then(res => {
      if (res) {
        controller.abort();
        setController(null);
        setChatStatus(null);
        stopAjax = null;
      }
    });
  };

  //重置
  const onReset = () => {
    if (resetLoading) {
      return;
    }
    setResetLoading(true);
    assistantApi
      .resetThread({ assistantId: currentAssistantId, threadId })
      .then(res => {
        if (res) {
          setResetLoading(false);
          setMessageList([]);
          setThreadId(res);
        }
      })
      .catch(error => {
        alert(_l('重置失败'), 2);
        setResetLoading(false);
      });
  };

  //消息流式返回
  const generateMessage = async () => {
    if (!messageList.length || !controller) return;

    let gptResponseContent = '';
    let noReply = true;
    const parser = createParser(event => {
      if (event.type === 'event') {
        if (event.data === '[DONE]') {
          const newList = [].concat(messageList);
          newList[messageList.length - 1].content = gptResponseContent.replace(/【\d+†source】/gi, '');
          setMessageList(newList);
          setController(null);
          isDialogueCreate ? setCreateMsgList(newList) : setChatStatus(null);
          return;
        }

        const source = safeParse(event.data);

        if (isDialogueCreate) {
          if (source.choices && source.choices.length) {
            //创建完成更新对应配置
            if (source.choices[0]['finish_reason'] === 'tool_calls') {
              //Todo 及时remove
              console.log('test unstable bug', gptResponseContent);
              const resultConfig = safeParse(gptResponseContent);
              onChangeConfig &&
                onChangeConfig({
                  name: resultConfig['Assistant_name'],
                  description: resultConfig['Assistant_description'],
                  instructions: resultConfig['Prompt'],
                  preamble: resultConfig['welcome_message'],
                  exampleQuestions: resultConfig['Example_Questions'],
                });
              gptResponseContent = _l('助手创建成功！');
              setConfigUpdating(false);
              return;
            }

            const toolCalls = source.choices[0].delta['tool_calls'];
            !configUpdating && !!toolCalls && setConfigUpdating(true);
            gptResponseContent += toolCalls
              ? _.get(toolCalls, ['0', 'function', 'arguments']) || ''
              : source.choices[0].delta.content || '';
            !toolCalls && $('.createChatElement:last .markdown-body').html(getMarkdownContent(gptResponseContent));
            $('.assistantChatListScroll .nano-content').scrollTop(10000000);
          }
        } else {
          switch (source.object) {
            case 'thread.run':
              setRunId(source.id);
              noReply && setChatStatus(CHAT_STATUS.running);
              break;
            case 'thread.run.step':
              noReply && setChatStatus(CHAT_STATUS.search);
              break;
            case 'thread.message':
              noReply && setChatStatus(CHAT_STATUS.search);
              break;
            case 'thread.message.delta':
              setChatStatus(CHAT_STATUS.reply);
              noReply = false;
              break;
            default:
              break;
          }
          if (source.object === 'thread.message.delta' && source.delta) {
            gptResponseContent += source.delta.content[0].text.value || '';
            $('.assistantChatElement:last .markdown-body').html(
              getMarkdownContent(gptResponseContent.replace(/【\d+†source】/gi, '')),
            );
            $('.assistantChatListScroll .nano-content').scrollTop(10000000);
          }
        }
      }
    });

    const params = isDialogueCreate
      ? {
          projectId,
          isFirst: messageList.length === 1,
          messageList: messageList.filter(item => item.content),
        }
      : { assistantId: currentAssistantId, threadId, content: messageList[messageList.length - 2].content };
    const resp = await fetch(
      `${md.global.Config.AjaxApiUrl}Assistant/${isDialogueCreate ? 'DialogueSetupAssistant' : 'Chat'} `,
      {
        signal: controller.signal,
        method: 'POST',
        headers: {
          Authorization: getPssId() ? `md_pss_id ${getPssId()}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      },
    );

    const reader = resp.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;
        parser.feed(new TextDecoder().decode(value));
      }
    } finally {
      setController(null);
      reader.releaseLock();
    }
  };

  if (!assistantLoading && assistantId && status !== 2) {
    return (
      <Wrapper className="justifyContentCenter">
        {showTitle && name && <DocumentTitle title={name} />}
        <div className="closeIconWrapper">
          <Icon icon="contact_support" className="Font50 Gray_bd" />
        </div>
        <div className="mTop20 Gray_9e Font17">{_l('助手已关闭或删除')}</div>
      </Wrapper>
    );
  }

  const renderEmptyMessage = () => {
    const renderAssistantIcon = size => {
      return (
        <div
          className={cx('avatarWrapper', { hasBorder: !iconUrl, smallSize: size === 'small' })}
          style={{ backgroundColor: iconUrl ? iconColor || '#2196f3' : '' }}
        >
          {iconUrl ? (
            <SvgIcon url={iconUrl} fill={'#fff'} size={size === 'small' ? 24 : 32} />
          ) : (
            <Icon icon="ai1" className={`Gray_bd ${size === 'small' ? 'Font20' : 'Font24'}`} />
          )}
        </div>
      );
    };

    return (
      <Empty className={cx('flex w100 flexColumn alignItemsCenter justifyContentCenter', { fullContent })}>
        {!isDialogueCreate && (assistantLoading || (assistantId && historyLoading)) ? (
          <LoadDiv className="mTop10" />
        ) : (
          <React.Fragment>
            {renderAssistantIcon()}
            {name && <div className="nameText">{name}</div>}
            {description && <div className="Gray_9e mTop4">{description}</div>}
            {preamble && (
              <div className="flexRow mTop24 w100">
                {renderAssistantIcon('small')}
                <div className="flex mLeft8">
                  <div className="promptMsg">{preamble}</div>
                </div>
              </div>
            )}
            {!!exampleQuestions.length && (
              <div className={cx('questionList', { singleQuestionRow })}>
                {exampleQuestions
                  .filter(item => !!item)
                  .map((item, index) => {
                    return (
                      <div
                        key={index}
                        className={cx('questionItem overflow_ellipsis w100', { canSend: !sendDisabled })}
                        title={item}
                        onClick={() => !sendDisabled && onSend(item)}
                      >
                        {item}
                      </div>
                    );
                  })}
              </div>
            )}
          </React.Fragment>
        )}
      </Empty>
    );
  };

  return (
    <Wrapper className={cx(className, { fullContent })}>
      {showTitle && name && <DocumentTitle title={name} />}

      {!messageList.length && renderEmptyMessage()}

      {!!messageList.length && (
        <ScrollView className="flex assistantChatListScroll" updateEvent={scrollEvent}>
          {assistantId && historyLoading && <div className="ThemeColor3 TxtCenter">{_l('加载中...')}</div>}
          <ChatList
            messageList={messageList}
            config={config}
            isDialogueCreate={isDialogueCreate}
            controller={controller}
            chatStatus={chatStatus}
          />
        </ScrollView>
      )}

      <FooterWrapper className="footerWrapper">
        {configUpdating && isDialogueCreate && (
          <div className="footStatusWrapper">
            <LoadDiv size="small" />
            <div className="Gray_9e mLeft8">{_l('正在更新助手配置')}</div>
          </div>
        )}
        {(controller || chatStatus) && !isDialogueCreate && (
          <div
            className={cx('footStatusWrapper stopBtn', { canStop: !isSending })}
            onClick={() => !isSending && runId && onStopApply()}
          >
            {!isSending && <i className="icon-wc-stop mRight5" />}
            <span>{isSending ? _l('发送中...') : _l('停止')}</span>
          </div>
        )}
        <div className="footer">
          {!!messageList.length && !notAllowRestart && (
            <div className="clearBtn tip-top" data-tip={_l('重新开始')} onClick={onReset}>
              <i className="icon-cleaning_services" />
            </div>
          )}
          <Textarea
            className="flex"
            style={{ paddingTop: 16, paddingBottom: 16 }}
            minHeight={0}
            maxHeight={240}
            disabled={sendDisabled}
            placeholder={sendDisabled && !assistantLoading ? _l('请先保存，再测试') : _l('请输入…')}
            value={keywords}
            onChange={setKeywords}
            onKeyDown={event => {
              if (!event.shiftKey && event.keyCode === 13 && !controller) {
                if (event.target.value.trim().replace(/\r\n/, '')) {
                  onSend(keywords);
                }
              }
            }}
          />
          <div
            className={cx('sendBtn', { enabled: !sendDisabled })}
            onClick={() => {
              if (!keywords.trim() || controller || sendDisabled) {
                return;
              }
              onSend(keywords);
            }}
          >
            <i className="icon-airplane" />
          </div>
        </div>
      </FooterWrapper>
    </Wrapper>
  );
}
