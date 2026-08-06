import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { BgIconButton, Icon, Skeleton } from 'ming-ui';
import { AttachmentTooltip, PromptInput } from 'src/components/Agent/ui';
import AddedFiles from 'src/components/Mingo/ChatBot/components/AddedFiles';
import { useDailyBuildSuggestions } from 'src/components/Mingo/ChatBot/components/buildRecommender';
import UploadFiles from 'src/components/Mingo/ChatBot/components/UploadFiles';
import { formatResponseData } from 'src/components/UploadFiles/utils';

const ATTACHMENT_TOKEN_TYPE = 71;
const MAX_ATTACHMENTS = 5;
const ALLOWED_MIME_TYPES = [
  { title: 'image', extensions: 'jpg,jpeg,png,webp,gif' },
  { title: 'doc', extensions: 'pdf,doc,docx,xls,xlsx,pptx,txt,md,csv,json,xml,html' },
];

const Wrapper = styled.div`
  ${() => (md.global.SysSettings.aiBrandThemeColor ? `--color-mingo: ${md.global.SysSettings.aiBrandThemeColor};` : '')}
  .aiLabel {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-mingo);
  }
  .sampleChips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }
  .sampleChip {
    padding: 7px 16px;
    border-radius: 22px;
    border: 1px solid var(--color-border-primary);
    background: var(--color-background-card);
    font-size: 14px;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    /* hover：浅灰填充，保留灰边 */
    &:hover {
      background: var(--color-background-tertiary);
    }
    /* 按下/选中：白底 + 紫边 + 紫字 */
    &:active {
      border-color: var(--color-mingo);
      background: var(--color-background-card);
      color: var(--color-mingo);
    }
  }
  /* 加载中：复用全站 ming-ui Skeleton（主题化扫光），去掉其默认内边距 / 底色，芯片间留 10px 间距 */
  .chipSkeleton {
    margin-top: 12px;
    padding: 0;
    background: transparent;
    ul {
      gap: 10px;
    }
  }
  .moreLabel {
    margin: 28px 0 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
  .moreGrid {
    display: flex;
    gap: 16px;
    align-items: stretch;
  }
  .bigCard {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    border: 1px solid var(--color-border-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--color-background-card);
    &:hover {
      border-color: var(--color-border-hover);
      box-shadow: var(--shadow-sm);
    }
    .cardIcon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 24px;
    }
    .cardTitle {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-title);
    }
    .cardDesc {
      margin-top: 6px;
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }
  .secondaryBox {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    padding: 8px;
    border: 1px dashed rgba(216, 216, 216, 1);
    border-radius: 8px;
    background: var(--color-background-tertiary);
    &:hover {
      background: var(--color-background-hover);
    }
  }
  .secondaryRow {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    color: var(--color-text-title);
    transition: background 0.2s ease;
    .rowIcon {
      font-size: 20px;
      color: var(--color-text-secondary);
    }
    &:hover {
      background: var(--color-background-card);
    }
  }
  .createMethod.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    &:hover {
      background: transparent;
      border-color: var(--color-border-secondary);
      box-shadow: none;
    }
  }
`;

// 创建应用入口内容：AI 创建输入 + 示例提示词 + 更多创建方式（卡片 / 次级行）。
// 同时供「创建应用」弹窗（CreateAppEntryDialog）与新用户 /app/my 引导页（CreateFirstApp）复用。
export default function CreateAppEntryContent(props) {
  const { actions = [], showAi = true, projectId, autoFocus = true, onAiSubmit = () => {}, onClose = () => {} } = props;
  const [draft, setDraft] = useState('');
  const [draftAttachments, setDraftAttachments] = useState([]);
  const [inputId] = useState(() => `create-app-entry-prompt-${uuidv4()}`);
  // 示例提示词：按当前组织画像取 app-build-recommender 的推荐，从中随机取 3 条展示（每次打开重新随机）；
  // 空 / 失败回退静态样例。
  const { randomSamples: samples, status: samplesStatus } = useDailyBuildSuggestions(projectId);

  const cards = actions.filter(a => !a.hidden && a.variant === 'card');
  const rows = actions.filter(a => !a.hidden && a.variant === 'row');

  // 点击示例：直接以该条作为消息呼出 Mingo 发送（onAiSubmit 会写 mingoInitialMessage、emit SET_MINGO_VISIBLE 并关闭弹窗），
  // 与 MingoWelcome「试一试」搭建示例点击即发起一致；带上已选附件
  const handlePickSample = text => {
    onAiSubmit(text, draftAttachments);
  };

  const runAction = action => {
    if (action.disabled) return;
    action.onClick && action.onClick();
    onClose();
  };

  const handleSubmit = () => {
    // 必须有正文才能提交：仅有附件（无文本内容）不支持发送，与 MingoWelcome / ChatPanel 一致
    if (!draft.trim()) return;
    onAiSubmit(draft, draftAttachments);
  };

  return (
    <Wrapper>
      {showAi && (
        <div className="mBottom8">
          <div className="aiLabel">
            <Icon icon="auto_awesome" className="Font18" />
            {_l('使用AI创建')}
          </div>
          <PromptInput
            autoFocus={autoFocus}
            value={draft}
            onChange={setDraft}
            onSubmit={handleSubmit}
            placeholder={_l('告诉我您希望搭建什么样的应用？')}
            enableMention={false}
            inputId={inputId}
            minRows={3}
            maxRows={8}
            attachments={
              draftAttachments.length ? (
                <AddedFiles
                  files={draftAttachments}
                  onRemove={id => setDraftAttachments(prev => prev.filter(f => f.id !== id))}
                />
              ) : null
            }
            attachmentSlot={
              <UploadFiles
                tokenType={ATTACHMENT_TOKEN_TYPE}
                maxFilesLength={MAX_ATTACHMENTS}
                existingFiles={draftAttachments}
                allowMimeTypes={ALLOWED_MIME_TYPES}
                dropElementId={inputId}
                onAdd={(up, files) => {
                  setDraftAttachments(prev => [
                    ...prev,
                    ...files.map(f => ({
                      id: f.id,
                      size: f.size,
                      type: f.type,
                      name: f.name,
                      status: 'added',
                      file: f,
                    })),
                  ]);
                }}
                onUploadProgress={(up, file) => {
                  const progress = ((file.loaded / file.size) * 100).toFixed(0);

                  setDraftAttachments(prev =>
                    prev.map(f => (f.id === file.id ? { ...f, status: 'uploading', file, progress } : f)),
                  );
                }}
                onUploaded={(up, file, response) => {
                  const commonAttachment = formatResponseData(file, response);

                  setDraftAttachments(prev =>
                    prev.map(f =>
                      f.id === file.id ? { ...f, status: 'uploaded', file, commonAttachment, url: file.url } : f,
                    ),
                  );
                }}
                onError={file => {
                  setDraftAttachments(prev => prev.map(f => (f.id === file?.id ? { ...f, status: 'error' } : f)));
                }}
                removeFile={file => {
                  setDraftAttachments(prev => prev.filter(f => f.id !== file.id));
                }}
              >
                <BgIconButton
                  style={{ borderRadius: '8px', padding: '6px' }}
                  icon="attachment"
                  tooltip={<AttachmentTooltip max={MAX_ATTACHMENTS} />}
                  popupPlacement="top"
                  onClick={() => {}}
                />
              </UploadFiles>
            }
          />
          {samplesStatus === 'loading' ? (
            <Skeleton
              className="chipSkeleton"
              direction="row"
              active
              widths={['132px', '168px', '120px']}
              height="33px"
              itemStyle={{ borderRadius: '22px', margin: 0 }}
            />
          ) : (
            !!samples.length && (
              <div className="sampleChips">
                {samples.map(text => (
                  <div key={text} className="sampleChip" onClick={() => handlePickSample(text)}>
                    {text}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      <div className="moreLabel">{_l('更多创建方式')}</div>
      <div className="moreGrid">
        {cards.map(action => (
          <div
            key={action.id}
            className={cx('bigCard createMethod', { disabled: action.disabled })}
            onClick={() => runAction(action)}
          >
            <div
              className="cardIcon"
              style={{ color: action.iconColor, background: action.iconBg || 'var(--color-background-hover)' }}
            >
              <Icon icon={action.icon} />
            </div>
            <div className="cardTitle">{action.title}</div>
            {action.desc && <div className="cardDesc">{action.desc}</div>}
          </div>
        ))}
        {!!rows.length && (
          <div className="secondaryBox">
            {rows.map(action => (
              <div
                key={action.id}
                className={cx('secondaryRow createMethod', { disabled: action.disabled })}
                onClick={() => runAction(action)}
              >
                <Icon icon={action.icon} className="rowIcon" />
                <span>{action.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
