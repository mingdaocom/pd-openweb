import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import styled from 'styled-components';
import { Button, Checkbox } from 'ming-ui';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';
import Share from 'src/pages/worksheet/components/Share';

const ShareOperateWrap = styled.div`
  width: 100%;
  height: 98px;
  background: var(--color-background-primary);
  border-top: 1px solid var(--color-border-primary);
  &.isAiAction {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 30px;
  }
`;

const WidthWrap = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  margin: 0 auto;
  padding: 0 30px;
  justify-content: space-between;
  &.isAiAction {
    height: auto;
    width: 100%;
    padding: 0px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background: var(--color-border-primary);
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  .Button {
    width: 108px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export default function ShareOperate({
  from = 'chatbot',
  appId,
  chatbotId,
  conversationId,
  isCharge,
  isSelectAll = false,
  messages,
  maxWidth,
  selectedMessageIds,
  setShareMode = () => {},
  setSelectedMessageIds = () => {},
  setIsSelectAll = () => {},
}) {
  const isAiAction = from === 'aiAction';
  const [shareVisible, setShareVisible] = useState(false);
  const [conversationName, setConversationName] = useState();
  const [conversationIdForShare, setConversationIdForShare] = useState(conversationId);
  const selectedCount = Math.floor(selectedMessageIds.length / 2);
  const operateComp = (
    <RightSection>
      <Button
        type="ghostgray"
        size="medium"
        className="Font14"
        onClick={() => {
          setSelectedMessageIds([]);
          setShareMode(false);
        }}
      >
        {_l('取消')}
      </Button>
      <Button
        type="success"
        size="medium"
        style={{ backgroundColor: 'var(--app-primary-color)' }}
        onClick={async () => {
          const res = await chatbotAjax.getConversation({
            chatbotId,
            conversationId,
          });
          console.log(res);
          setConversationName(res.title);
          if (isSelectAll) {
            setShareVisible(true);
          } else {
            chatbotAjax
              .addShareConversation({
                chatbotId,
                conversationId,
                userMessageIds: selectedMessageIds.filter(id => id && id.length === 24),
              })
              .then(data => {
                if (data.conversationId) {
                  setConversationIdForShare(data.conversationId);
                  setShareVisible(true);
                }
              });
          }
        }}
        className="Font14"
      >
        <i className="icon icon-share Font16 mRight6"></i>
        {_l('分享')}
      </Button>
    </RightSection>
  );
  useEffect(() => {
    if (!isSelectAll && isEmpty(selectedMessageIds)) {
      setShareVisible(false);
      setShareMode(false);
    }
  }, [isSelectAll, selectedMessageIds]);
  if (!isSelectAll && isEmpty(selectedMessageIds)) {
    return null;
  }
  return (
    <ShareOperateWrap className={cx({ isAiAction })}>
      <WidthWrap style={{ maxWidth }} className={cx({ isAiAction })}>
        <LeftSection>
          <Checkbox
            text={_l('全选')}
            checked={isSelectAll || selectedMessageIds.length === messages.length}
            onClick={() => {
              if (isSelectAll) {
                setIsSelectAll(false);
              } else {
                if (
                  isEqual(
                    selectedMessageIds,
                    messages.map(message => message.modelMessageId),
                  )
                ) {
                  setSelectedMessageIds([]);
                } else {
                  setSelectedMessageIds(messages.map(message => message.modelMessageId));
                }
              }
            }}
            className="textPrimary"
          />
          {!isSelectAll && !!selectedCount && (
            <Fragment>
              <Divider />
              <span className="Font13 textPrimary">{_l('已选择 %0 组对话', selectedCount)}</span>
            </Fragment>
          )}
        </LeftSection>
        {!isAiAction && operateComp}
      </WidthWrap>
      {isAiAction && <div className="mTop10 t-flex t-justify-end">{operateComp}</div>}
      {shareVisible && (
        <Share
          title={_l('分享对话: %0', conversationName)}
          isCustomShare
          from={from}
          isCharge={isCharge}
          privateShare={false}
          params={{
            appId,
            sourceId: `${chatbotId}|${conversationIdForShare}`,
            worksheetId: chatbotId,
            title: conversationName,
          }}
          onClose={() => setShareVisible(false)}
        />
      )}
    </ShareOperateWrap>
  );
}
