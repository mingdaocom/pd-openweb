import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { Button, Checkbox } from 'ming-ui/antd-components';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';
import Share from 'src/pages/worksheet/components/Share';
import { buildChatbotShareProps } from './chatbotShare';

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
`;

// 一「组对话」= 一次用户提问及其对应的 AI 回复，因此组数按用户消息条数计算。
// 不能用 selectedMessageIds.length / 2 推算：末条提问尚无回复、或多条 assistant 消息被
// formatMessages 合并时，id 数与组数并非固定 2:1 关系。
export function getShareGroupCounts({ messages = [], selectedMessageIds = [], isSelectAll = false }) {
  const userMessages = messages.filter(message => message.role === 'user');
  const totalCount = userMessages.length;
  const selectedCount = isSelectAll
    ? totalCount
    : userMessages.filter(
        message => selectedMessageIds.includes(message.modelMessageId) || selectedMessageIds.includes(message.id),
      ).length;

  return { selectedCount, totalCount };
}

export default function ShareOperate({
  from = 'chatbot',
  appId,
  chatbotId,
  conversationId,
  // 分享的可见范围按应用所属组织提交，不传会回退到「当前组织」（localStorage / 第一个组织），
  // 跨组织时会把分享挂到错误的组织下
  projectId,
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
  const { selectedCount, totalCount } = getShareGroupCounts({ messages, selectedMessageIds, isSelectAll });
  // 勾选态与「再点一次取消」必须同一口径：逐组手动勾满时勾选框已是选中态，
  // 若取消再按 selectedMessageIds 与全量 modelMessageId 深比较（顺序、无 id 的实时消息都对不上），
  // 首次点击会退化成「再全选一次」，画面无变化，需要点两次才清空。
  const allSelected = isSelectAll || (!!totalCount && selectedCount === totalCount);
  // 全选即分享整个会话，用原会话作锚点；否则按所选提问建一条新的分享会话（延后到开启分享时执行）
  const selectedUserMessageIds = isSelectAll ? [] : selectedMessageIds.filter(id => id && id.length === 24);
  const operateComp = (
    <RightSection>
      <Button
        onClick={() => {
          setSelectedMessageIds([]);
          setShareMode(false);
        }}
      >
        {_l('取消')}
      </Button>
      <Button
        color="var(--app-primary-color, var(--color-success))"
        variant="solid"
        icon={<i className="icon icon-share" />}
        onClick={async () => {
          try {
            const res = await chatbotAjax.getConversation({
              chatbotId,
              conversationId,
            });
            setConversationName(res.title);
          } catch (err) {
            console.error('[chatbot-share] get conversation failed', err);
          }

          setShareVisible(true);
        }}
      >
        {_l('分享')}
      </Button>
    </RightSection>
  );
  useEffect(() => {
    if (!isSelectAll && isEmpty(selectedMessageIds)) {
      setShareVisible(false);
      setShareMode(false);
    }
  }, [isSelectAll, selectedMessageIds, setShareMode]);
  if (!isSelectAll && isEmpty(selectedMessageIds)) {
    return null;
  }

  return (
    <ShareOperateWrap className={cx({ isAiAction })}>
      <WidthWrap style={{ maxWidth }} className={cx({ isAiAction })}>
        <LeftSection>
          <Checkbox
            checked={allSelected}
            onChange={() => {
              if (allSelected) {
                setIsSelectAll(false);
                setSelectedMessageIds([]);
                return;
              }

              setSelectedMessageIds(messages.map(message => message.modelMessageId));
            }}
            className="textPrimary"
          >
            {_l('全选')}
          </Checkbox>
          {!!totalCount && (
            <Fragment>
              <Divider />
              <span className="Font13 textPrimary">{_l('已选择 %0 / %1 组对话', selectedCount, totalCount)}</span>
            </Fragment>
          )}
        </LeftSection>
        {!isAiAction && operateComp}
      </WidthWrap>
      {isAiAction && <div className="mTop10 t-flex t-justify-end">{operateComp}</div>}
      {shareVisible && (
        <Share
          {...buildChatbotShareProps({
            from,
            appId,
            chatbotId,
            conversationId,
            title: conversationName,
            projectId,
            isCharge,
            messageIds: selectedUserMessageIds,
          })}
          onClose={() => setShareVisible(false)}
        />
      )}
    </ShareOperateWrap>
  );
}
