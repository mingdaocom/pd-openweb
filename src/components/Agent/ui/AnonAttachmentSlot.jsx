import React, { useRef } from 'react';
import { BgIconButton } from 'ming-ui';
import { antAlert } from 'ming-ui/functions/alert';
import {
  anonAttachmentType,
  ensureAnonymousSession,
  getAnonymousUploadFailedIndexes,
  getAnonymousUploadSizeLimitMB,
  isAnonymousUploadSizeOutOfRangeError,
  isAnonymousUploadTokenValidationError,
  isCaptchaCancelled,
  uploadAnonymousFiles,
} from '../anonymous';
import AttachmentTooltip from './AttachmentTooltip';

// 匿名态附件入口（官网免登录漏斗 §3）：替代登录态的 plupload/UploadFiles。
// 选文件 → upload-token + 直传七牛 → 回写 attachments；产出与登录态同形（{ id, name, type, url, size, status }）。
const MAX_ANON_ATTACHMENTS = 2; // §9：匿名单次文件数上限 2
const ANON_ATTACHMENT_MIME_TYPES = [
  { title: 'image', extensions: 'jpg,jpeg,png,webp,gif' },
  {
    title: 'doc',
    extensions: 'docx,doc,wps,xlsx,pptx,ppt,pdf,xls,md,markdown,txt,csv,json,jsonl,xml,htm,html,yaml,yml,log,toml,ini',
  },
];

// 由匿名入口允许的扩展名拼出 input accept（.pdf,.png,...）
const ACCEPT = ANON_ATTACHMENT_MIME_TYPES.flatMap(m => m.extensions.split(',').map(e => `.${e.trim()}`)).join(',');

export default function AnonAttachmentSlot({
  sessionId,
  files = [],
  onChange,
  onAfterAdd,
  className,
  icon = 'attachment',
  onSessionChange,
  createSession,
}) {
  const inputRef = useRef(null);

  async function handlePick(e) {
    const picked = Array.from(e.target.files || []);

    e.target.value = '';
    if (!picked.length) return;
    const room = MAX_ANON_ATTACHMENTS - files.length;

    if (room <= 0) {
      antAlert(_l('最多上传 %0 个文件', MAX_ANON_ATTACHMENTS), 3);
      return;
    }

    const accepted = picked.slice(0, room);
    let placeholders = [];

    try {
      // 先完成匿名会话/验证码，再进入上传占位，避免验证码弹层背后出现未开始的上传流程。
      const sid = sessionId || (await (createSession || ensureAnonymousSession)());

      if (!sessionId && sid && onSessionChange) onSessionChange(sid);

      // 上传完成再回填 url / 失败标 error
      placeholders = accepted.map(file => ({
        id: `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: anonAttachmentType(file),
        status: 'uploading',
        progress: 0,
      }));

      onChange(prev => [...prev, ...placeholders]);
      onAfterAdd && onAfterAdd();

      const uploaded = await uploadAnonymousFiles(accepted, sid);
      const hasError = placeholders.some((_, i) => !uploaded[i]);

      onChange(prev =>
        prev.map(f => {
          const idx = placeholders.findIndex(p => p.id === f.id);

          if (idx === -1) return f;
          const done = uploaded[idx];

          return done ? { ...f, status: 'uploaded', url: done.url, size: done.size } : { ...f, status: 'error' };
        }),
      );

      if (hasError) antAlert(_l('上传失败'), 2);
    } catch (err) {
      if (isCaptchaCancelled(err)) return;

      console.error('[agent] anonymous upload failed', err);
      const ids = new Set(placeholders.map(p => p.id));

      if (isAnonymousUploadTokenValidationError(err)) {
        const failedIndexes = getAnonymousUploadFailedIndexes(err);
        const failedCount = failedIndexes.length || ids.size || accepted.length || 1;

        if (ids.size) {
          onChange(prev => prev.filter(f => !ids.has(f.id)));
        }

        if (isAnonymousUploadSizeOutOfRangeError(err)) {
          antAlert(_l('%0个文件无法上传：单个文件大小超过%1MB', failedCount, getAnonymousUploadSizeLimitMB(err)), 2);
        } else {
          antAlert(_l('上传失败'), 2);
        }

        return;
      }

      if (ids.size) {
        onChange(prev => prev.map(f => (ids.has(f.id) ? { ...f, status: 'error' } : f)));
      }

      antAlert(_l('上传失败'), 2);
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" multiple accept={ACCEPT} style={{ display: 'none' }} onChange={handlePick} />
      <BgIconButton
        className={className}
        style={{ borderRadius: '8px', padding: '6px' }}
        icon={icon}
        tooltip={<AttachmentTooltip max={MAX_ANON_ATTACHMENTS} />}
        popupPlacement="top"
        onClick={() => inputRef.current && inputRef.current.click()}
      />
    </>
  );
}
