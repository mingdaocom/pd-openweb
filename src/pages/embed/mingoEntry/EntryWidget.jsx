import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import AnonAttachmentSlot from 'src/components/Agent/ui/AnonAttachmentSlot';
import PromptInput from 'src/components/Agent/ui/PromptInput';
import AddedFiles from 'src/components/Mingo/ChatBot/components/AddedFiles';
import { browserIsMobile } from 'src/utils/common';
import { isThirdPartyIntegration } from './env';
import { pickEntrySamples } from './samples';

// 官网首页输入框 embed（设计图框选部分）：输入框 + 示例 chips + 换一批。
// JS 直嵌（MDHome 等外部站）：提交 → bootstrap → 写 handoff → 新标签页打开 HAP plan 页。
const PROMPT_INPUT_ID = 'mingo-entry-prompt-input';
let anonymousRuntimePromise;
let loginApiPromise;

function loadAnonymousRuntime() {
  if (!anonymousRuntimePromise) {
    anonymousRuntimePromise = import('src/components/Agent/anonymous');
  }

  return anonymousRuntimePromise;
}

function loadLoginApi() {
  if (!loginApiPromise) {
    loginApiPromise = import('src/api/login');
  }

  return loginApiPromise;
}

function isCaptchaCancelledError(err) {
  return err && err.message === 'captcha_cancelled';
}

function getPlanUrl(key, webUrl) {
  const url = new URL('/public/mingo/plan', webUrl || location.origin);
  const lang = typeof window.getCurrentLang === 'function' ? window.getCurrentLang() : '';

  url.searchParams.set('key', key);
  if (lang) url.searchParams.set('sys_lang', lang);

  return webUrl ? url.toString() : `${url.pathname}${url.search}`;
}

function getMingoChatUrl(sessionId, webUrl) {
  const url = new URL(`/mingo/chat/${encodeURIComponent(sessionId)}`, webUrl || location.origin);
  const lang = typeof window.getCurrentLang === 'function' ? window.getCurrentLang() : '';

  url.searchParams.set('entry', '1');
  if (lang) url.searchParams.set('sys_lang', lang);

  return webUrl ? url.toString() : `${url.pathname}${url.search}`;
}

function getMobileCreateAppUrl(handoffKey, webUrl) {
  const url = new URL('/mobile/mingo/create-app', webUrl || location.origin);
  const lang = typeof window.getCurrentLang === 'function' ? window.getCurrentLang() : '';

  url.searchParams.set('entry', '1');
  url.searchParams.set('handoffKey', handoffKey);
  if (lang) url.searchParams.set('sys_lang', lang);

  return webUrl ? url.toString() : `${url.pathname}${url.search}`;
}

function createMingoSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function checkLoggedAccount() {
  try {
    const module = await loadLoginApi();
    const loginApi = module.default || module;

    return !!(await loginApi.checkLogin({}, { silent: true }));
  } catch (err) {
    console.error('[mingo-entry] check login failed', err);
    throw err;
  }
}

function mapAttachmentForRequest(item) {
  return { type: item.type || 'doc', url: item.url, name: item.name, size: item.size };
}

const Wrap = styled.div`
  ${() => (md.global.SysSettings.aiBrandThemeColor ? `--color-mingo: ${md.global.SysSettings.aiBrandThemeColor};` : '')}
  width: 100%;
  padding: 4px;
  background: transparent;
  text-align: left;
  border-radius: 22px;
  .textAreaCon,
  .textAreaCon:hover {
    border-radius: 20px;
    border: 2px solid transparent;
    background:
      linear-gradient(var(--color-background-primary), var(--color-background-primary)) padding-box,
      linear-gradient(135deg, var(--color-mingo), var(--color-mingo-light)) border-box;
    box-shadow: var(--shadow-sm);

    .mentionEditor {
      min-height: 108px !important;
    }

    @media (max-width: 1024px) {
      .mentionEditor {
        min-height: 88px !important;
      }
    }
  }

  .entrySamples {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: auto;
    gap: 12px;
    margin-top: 48px;
    padding: 0 26px;
    overflow: hidden;

    > .entrySample:nth-child(n + 5) {
      display: none;
    }

    @media (max-width: 767px) {
      grid-template-columns: 1fr;
      grid-auto-rows: auto;
      padding: 0;
    }
  }
  .entrySample {
    height: auto;
    padding: 12px 16px;
    border: 1px solid var(--color-border-secondary);
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-text-primary);
    background-color: var(--color-background-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    transition:
      border-color 0.2s ease,
      background 0.2s ease;
    &:hover {
      background: var(--color-mingo-transparent-light);
    }
  }
  .entryRefresh {
    margin: 20px auto 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: var(--color-text-secondary);
    cursor: pointer;
    &:hover {
      color: var(--color-mingo);
    }
  }
  .refreshRow {
    display: flex;
    justify-content: center;
  }
`;

function isInIframe() {
  return typeof window !== 'undefined' && window.parent !== window;
}

function getOfficialHomeUrl() {
  const sourceUrl = isInIframe() && document.referrer ? document.referrer : location.href;

  try {
    const url = new URL(sourceUrl);

    return url.origin + '/';
  } catch {
    return '';
  }
}

function hasGlobalMeta(data) {
  if (!data || typeof data !== 'object') return false;

  const globalMeta = data['md.global'] || data;

  return !!(
    globalMeta.Config ||
    globalMeta.FileStoreConfig ||
    globalMeta.SysSettings ||
    globalMeta.Account ||
    globalMeta.CaptchaAppId ||
    globalMeta.CaptchaType !== undefined
  );
}

export default function EntryWidget({
  webUrl,
  transparentBody = isInIframe(),
  ensureGlobalMeta,
  applyGlobalMeta,
} = {}) {
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [samples, setSamples] = useState(() => pickEntrySamples());
  const [submitting, setSubmitting] = useState(false);
  const [entrySessionId, setEntrySessionId] = useState('');
  const promptRef = useRef(null);
  const rootRef = useRef(null);
  // 预留给可取消的提交过程，组件卸载时统一收口。
  const abortCtrlRef = useRef(null);
  const submitLockRef = useRef(false);
  const globalMetaReadyRef = useRef(false);
  const globalMetaPromiseRef = useRef(null);

  // 自动聚焦（对齐设计图）
  useEffect(() => {
    const timer = setTimeout(() => promptRef.current && promptRef.current.focus(), 0);
    return () => clearTimeout(timer);
  }, []);

  // 官网 iframe 嵌入：body 背景透明，让 MDHome 的渐变描边容器透出
  useEffect(() => {
    if (!transparentBody) return undefined;

    document.body.style.background = 'transparent';
    return () => {
      document.body.style.background = '';
    };
  }, [transparentBody]);

  useEffect(() => {
    if (attachments.length) import('src/common/mdcss/fileIcons.css');
  }, [attachments.length]);

  // 组件卸载时取消正在进行的流（页面离开 / iframe 销毁）
  useEffect(() => {
    return () => {
      if (abortCtrlRef.current) abortCtrlRef.current.abort();
    };
  }, []);

  // iframe 高度自适应：把内容高度 postMessage 给官网父页，由父页设置 iframe 高度
  useLayoutEffect(() => {
    if (window.parent === window) return undefined;
    const report = () => {
      const h = rootRef.current ? rootRef.current.scrollHeight : document.body.scrollHeight;

      window.parent.postMessage({ type: 'MINGO_ENTRY_RESIZE', height: h }, '*');
    };

    report();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(report) : null;

    if (ro && rootRef.current) ro.observe(rootRef.current);
    return () => ro && ro.disconnect();
  }, [attachments.length, samples]);

  async function ensureSubmitGlobalMeta() {
    if (globalMetaReadyRef.current || typeof ensureGlobalMeta !== 'function') return;

    if (!globalMetaPromiseRef.current) {
      globalMetaPromiseRef.current = Promise.resolve(ensureGlobalMeta())
        .then(data => {
          if (applyGlobalMeta) applyGlobalMeta(data);
          if (hasGlobalMeta(data)) globalMetaReadyRef.current = true;
          return data;
        })
        .catch(err => {
          globalMetaPromiseRef.current = null;
          throw err;
        });
    }

    await globalMetaPromiseRef.current;
    if (!globalMetaReadyRef.current) globalMetaPromiseRef.current = null;
  }

  async function createEntryAnonymousSession() {
    const { bootstrapAnonymousSession } = await loadAnonymousRuntime();

    return bootstrapAnonymousSession();
  }

  async function handleSubmit(textOverride) {
    const text = (typeof textOverride === 'string' ? textOverride : draft).trim();

    if (!text || submitting || submitLockRef.current) return;
    submitLockRef.current = true;
    const isMobile = browserIsMobile();
    const threePartyIntegration = isThirdPartyIntegration();
    const targetWindow = isMobile && !threePartyIntegration ? window.open('about:blank', '_blank') : null;

    setSubmitting(true);
    try {
      await ensureSubmitGlobalMeta();
      const logged = await checkLoggedAccount();
      const { bootstrapAnonymousSession, setAnonHandoff } = await loadAnonymousRuntime();
      const sessionId = logged ? createMingoSessionId() : entrySessionId || (await bootstrapAnonymousSession());
      const uploaded = attachments.filter(f => f.status === 'uploaded').map(mapAttachmentForRequest);
      const handoffData = {
        prompt: text,
        attachments: uploaded,
        sessionId,
        source: logged ? 'mingo-entry-logged' : 'mingo-entry-anonymous',
        officialHomeUrl: getOfficialHomeUrl(),
      };
      const key = await setAnonHandoff(handoffData, logged ? { key: sessionId } : undefined);
      const targetUrl = logged
        ? isMobile
          ? getMobileCreateAppUrl(key, webUrl)
          : getMingoChatUrl(sessionId, webUrl)
        : getPlanUrl(key, webUrl);

      if (targetWindow) {
        targetWindow.open(targetUrl, '_self');
      } else if (threePartyIntegration) {
        location.href = targetUrl;
      } else {
        window.open(targetUrl, '_blank');
      }

      setDraft('');
      setAttachments([]);
      setEntrySessionId('');
    } catch (err) {
      if (targetWindow) targetWindow.close();
      if (isCaptchaCancelledError(err)) return;

      console.error('[mingo-entry] start plan failed', err);
      alert(_l('网络繁忙，请稍后再试'), 2);
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  }

  function fillSample(text) {
    setDraft(text);
    promptRef.current && promptRef.current.setInputValue(text);
    promptRef.current && promptRef.current.focus();
  }

  function handleStop() {
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
      abortCtrlRef.current = null;
    }
  }

  return (
    <Wrap ref={rootRef}>
      <PromptInput
        ref={promptRef}
        value={draft}
        enableMention={false}
        forceEnableVoice
        getVoiceAuthConfig={() => loadAnonymousRuntime().then(module => module.requestAnonymousVoiceToken())}
        autoFocus
        placeholder={_l('告诉我您想搭建的应用，或者从下面推荐中选择一个尝试')}
        inputId={PROMPT_INPUT_ID}
        submitting={submitting}
        onChange={setDraft}
        onSubmit={handleSubmit}
        onStop={handleStop}
        attachments={
          attachments.length ? (
            <AddedFiles files={attachments} onRemove={id => setAttachments(prev => prev.filter(f => f.id !== id))} />
          ) : null
        }
        attachmentSlot={
          <AnonAttachmentSlot
            sessionId={entrySessionId}
            files={attachments}
            onChange={setAttachments}
            onSessionChange={setEntrySessionId}
            createSession={createEntryAnonymousSession}
            onAfterAdd={() => setTimeout(() => promptRef.current && promptRef.current.focus(), 0)}
          />
        }
      />

      <div className="entrySamples">
        {samples.map((text, i) => (
          <div className="entrySample" key={i} onClick={() => fillSample(text)}>
            {text}
          </div>
        ))}
      </div>
      <div className="refreshRow">
        <div className="entryRefresh" onClick={() => setSamples(pickEntrySamples())}>
          <i className="icon icon-refresh1" />
          {_l('换一批')}
        </div>
      </div>
    </Wrap>
  );
}
