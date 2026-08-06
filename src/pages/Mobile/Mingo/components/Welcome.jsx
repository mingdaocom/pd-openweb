import React from 'react';
import styled from 'styled-components';
import { BgIconButton, Skeleton } from 'ming-ui';
import { AGENT_ATTACHMENT_MIME_TYPES } from 'src/components/Agent/agentService';
import { AttachmentTooltip, PromptInput } from 'src/components/Agent/ui';
import AddedFiles from 'src/components/Mingo/ChatBot/components/AddedFiles';
import AttachmentUploader from 'src/components/Mingo/ChatBot/components/AttachmentUploader';
import { ATTACHMENT_TOKEN_TYPE, MAX_ATTACHMENTS, PROMPT_INPUT_ID } from '../core/constants';

const Wrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  .tryList {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
    width: 100%;
  }
  .tryItem {
    width: 100%;
    min-height: 70px;
    box-sizing: border-box;
    line-height: 20px;
    margin-bottom: 10px;
    padding: 14px 16px;
    border: 0;
    border-radius: 16px;
    color: var(--color-text-primary);
    background: var(--color-background-tertiary);
    font-size: 15px;
    font-weight: 500;
    text-align: left;
    box-shadow: none;
  }
  .tryTitle {
    margin-bottom: 4px;
    color: var(--color-mingo);
    font-size: 13px;
    font-weight: 600;
  }
  .tryText {
    color: var(--color-text-primary);
    font-size: 15px;
    font-weight: 500;
  }
  &.buildMode {
    .tryList {
      margin-bottom: 30px;
    }
    .tryItem {
      display: flex;
      align-items: center;
      min-height: 50px;
      padding: 14px 16px;
      border-radius: 16px;
      line-height: 18px;
    }
  }
  .newBadge {
    margin-left: 3px;
    color: var(--color-success);
  }
  /* 加载中骨架卡：与 tryItem 同款卡片，内置居中扫光条（复用 ming-ui Skeleton） */
  .tryItem.trySkeleton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .trySkeleton .loadingSkeleton {
    width: 62%;
    padding: 0;
    background: transparent;
  }
`;

export default function Welcome({
  promptInputRef,
  project,
  draft,
  attachments,
  tryItems,
  loading = false,
  placeholder = _l('选择应用提问或开始搭建一个新应用'),
  enableMention = true,
  buildMode = false,
  onDraftChange,
  onSubmit,
  onAttachmentsChange,
}) {
  return (
    <Wrap className={buildMode ? 'buildMode' : undefined}>
      <div className="tryList">
        {loading
          ? [0, 1, 2].map(i => (
              <div className="tryItem trySkeleton" key={i}>
                <Skeleton active widths={['100%']} height="16px" />
              </div>
            ))
          : tryItems.map((item, index) => (
              <div className="tryItem" key={index} onClick={() => item.onClick(item)}>
                {item.title && <div className="tryTitle">{item.title}</div>}
                <div className="tryText">
                  {item.text}
                  {item.isNew && <span className="newBadge">{_l('新！')}</span>}
                </div>
              </div>
            ))}
      </div>
      <PromptInput
        className="mobileMingoPromptInput mobileMingoWelcomeInput"
        ref={promptInputRef}
        value={draft}
        projectId={project.projectId}
        onChange={onDraftChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
        enableMention={enableMention}
        mentionButtonIcon="widgets"
        mentionButtonText={_l('选择应用')}
        inputId={PROMPT_INPUT_ID}
        attachments={
          attachments.length ? (
            <AddedFiles
              files={attachments}
              onRemove={id => onAttachmentsChange(prev => prev.filter(f => f.id !== id))}
            />
          ) : null
        }
        attachmentSlot={
          <AttachmentUploader
            tokenType={ATTACHMENT_TOKEN_TYPE}
            maxFilesLength={MAX_ATTACHMENTS}
            files={attachments}
            allowMimeTypes={AGENT_ATTACHMENT_MIME_TYPES}
            dropElementId={PROMPT_INPUT_ID}
            onChange={onAttachmentsChange}
          >
            <BgIconButton
              className="mobileMingoAttachmentButton"
              style={{ borderRadius: '8px', padding: '6px' }}
              icon="plus"
              tooltip={<AttachmentTooltip max={MAX_ATTACHMENTS} />}
              popupPlacement="top"
            />
          </AttachmentUploader>
        }
      />
    </Wrap>
  );
}
