import React, { useRef } from 'react';
import styled from 'styled-components';
import { Skeleton } from 'ming-ui/antd-components';
import SelectProject from 'mobile/components/SelectProject';
import { AGENT_ATTACHMENT_MIME_TYPES } from 'src/components/Agent/agentService';
import { HelpComposerBar, openCustomerService } from 'src/components/Agent/ui/TransferHuman';
import AddedFiles from 'src/components/Mingo/ChatBot/components/AddedFiles';
import AttachmentUploader from 'src/components/Mingo/ChatBot/components/AttachmentUploader';
import { ATTACHMENT_TOKEN_TYPE, MAX_ATTACHMENTS, PROMPT_INPUT_ID } from '../core/constants';
import MobileMingoPromptInput from './MobileMingoPromptInput';

const CAMERA_MIME_TYPES = [{ title: 'image', extensions: 'jpg,jpeg,png,heic' }];

const Wrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  padding-bottom: calc(var(--mobile-mingo-welcome-bottom-gap, 20px) + var(--mobile-mingo-bottom-inset, 0px));
  .tryList {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
    width: 100%;
  }
  .mobileMingoWelcomeProjectSelect {
    width: 100%;
    margin-bottom: 6px;
  }
  .tryItem {
    width: 100%;
    min-height: 70px;
    box-sizing: border-box;
    line-height: 20px;
    margin-bottom: 10px;
    padding: 14px 16px;
    border: 1px solid var(--color-border-primary);
    border-radius: 8px;
    color: var(--color-text-primary);
    background: var(--color-background-card);
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
    .tryItem {
      display: flex;
      align-items: center;
      min-height: 50px;
      padding: 14px 16px;
      line-height: 18px;
    }
  }
  /* 加载中骨架卡：与 tryItem 同款卡片，内置居中扫光条 */
  .tryItem.trySkeleton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .trySkeleton .hap-skeleton {
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
  placeholder = _l('提问或描述应用需求'),
  enableMention = true,
  buildMode = false,
  helpMode = false,
  onDraftChange,
  onSubmit,
  onAttachmentsChange,
  onProjectChange,
  onProjectSelectorOpen,
}) {
  const cameraUploaderRef = useRef(null);

  return (
    <Wrap className={buildMode ? 'buildMode' : undefined}>
      {!buildMode && !helpMode && (
        <div className="mobileMingoWelcomeProjectSelect">
          <SelectProject
            key={project.projectId}
            className="mingoProjectSelect"
            projectId={project.projectId}
            changeProject={onProjectChange}
            onBeforeOpen={onProjectSelectorOpen}
          />
        </div>
      )}
      <div className="tryList">
        {loading
          ? [0, 1, 2].map(i => (
              <div className="tryItem trySkeleton" key={i}>
                <Skeleton
                  className="pAll20"
                  active
                  paragraph={{
                    rows: 1,
                    width: ['100%'],
                  }}
                />
              </div>
            ))
          : tryItems.map((item, index) => (
              <div className="tryItem" key={index} onClick={() => item.onClick(item)}>
                {item.title && <div className="tryTitle">{item.title}</div>}
                <div className="tryText">{item.text}</div>
              </div>
            ))}
      </div>
      {/* 帮助态首页「帮助文档 + 人工客服」栏（对齐桌面 MingoWelcome）：首页尚无会话，
          转人工直接开客服窗口（APP 内经 window.md_js.customerService 原生桥），不出会话分享弹层 */}
      {helpMode && <HelpComposerBar onTransfer={openCustomerService} />}
      <MobileMingoPromptInput
        className="mobileMingoWelcomeInput"
        ref={promptInputRef}
        value={draft}
        projectId={project.projectId}
        onChange={onDraftChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
        enableMention={enableMention}
        onCameraOpen={() => cameraUploaderRef.current?.open()}
        inputId={PROMPT_INPUT_ID}
        attachments={
          !helpMode && attachments.length ? (
            <AddedFiles
              files={attachments}
              onRemove={id => onAttachmentsChange(prev => prev.filter(f => f.id !== id))}
            />
          ) : null
        }
        // 帮助态不提供附件入口，与对话态（runtime.enableAttachment=false）一致
        attachmentSlot={
          helpMode ? null : (
            <AttachmentUploader
              tokenType={ATTACHMENT_TOKEN_TYPE}
              maxFilesLength={MAX_ATTACHMENTS}
              files={attachments}
              allowMimeTypes={AGENT_ATTACHMENT_MIME_TYPES}
              dropElementId={PROMPT_INPUT_ID}
              onChange={onAttachmentsChange}
              onChooseApp={enableMention ? app => promptInputRef.current?.insertApp(app) : undefined}
            />
          )
        }
        cameraSlot={
          <AttachmentUploader
            ref={cameraUploaderRef}
            cameraOnly
            tokenType={ATTACHMENT_TOKEN_TYPE}
            maxFilesLength={MAX_ATTACHMENTS}
            files={attachments}
            allowMimeTypes={CAMERA_MIME_TYPES}
            onChange={onAttachmentsChange}
          >
            <button type="button" tabIndex={-1} aria-hidden="true" />
          </AttachmentUploader>
        }
      />
    </Wrap>
  );
}
