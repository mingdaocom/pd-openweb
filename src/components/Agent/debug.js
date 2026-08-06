// localStorage.isDebug 任意非空值即开启调试 UI（part 时间戳 / raw JSON 切换）
export const IS_DEBUG = (() => {
  try {
    return localStorage.getItem('isDebug') === '1';
  } catch {
    return false;
  }
})();

export function formatPartTs(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n, w = 2) => String(n).padStart(w, '0');

  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

// 大小写不敏感取字段：后端 Pascal/camel 混用，避免重复写读取分支
function pick(source, ...keys) {
  if (!source || typeof source !== 'object') return undefined;
  for (const key of keys) {
    if (key in source) return source[key];
    const target = key.toLowerCase();

    for (const [k, v] of Object.entries(source)) {
      if (k.toLowerCase() === target) return v;
    }
  }

  return undefined;
}

function preview(value, n = 40) {
  const s = typeof value === 'string' ? value : String(value ?? '');
  const flat = s.replace(/\s+/g, ' ').trim();

  return flat.length > n ? `${flat.slice(0, n - 1)}…` : flat;
}

function shortId(value, n = 8) {
  const s = String(value ?? '');

  return s.length > n ? `${s.slice(0, n)}…` : s;
}

// 事件家族 → 颜色（DevTools console 用，区分高频家族一眼能挑出来）
const EVENT_FAMILY_STYLE = {
  route: 'color:#16a34a;font-weight:600',
  workflow: 'color:#2563eb;font-weight:600',
  tool: 'color:#9333ea;font-weight:600',
  text: 'color:#737373',
  artifact: 'color:#d97706;font-weight:600',
  done: 'color:#059669;font-weight:700',
  error: 'color:#dc2626;font-weight:700',
  other: 'color:#525252',
};

function styleFor(eventName) {
  if (eventName === 'completed') return EVENT_FAMILY_STYLE.done;
  if (eventName === 'error') return EVENT_FAMILY_STYLE.error;
  if (eventName.startsWith('route-')) return EVENT_FAMILY_STYLE.route;
  if (eventName.startsWith('workflow-')) return EVENT_FAMILY_STYLE.workflow;
  if (eventName.includes('tool-')) return EVENT_FAMILY_STYLE.tool;
  if (eventName.endsWith('text-delta') || eventName === 'reasoning-delta') return EVENT_FAMILY_STYLE.text;
  if (eventName.startsWith('artifact-')) return EVENT_FAMILY_STYLE.artifact;
  return EVENT_FAMILY_STYLE.other;
}

// 每个事件提取 1~3 个最有用的字段，拼一行；不打算覆盖所有字段——drill-down 看末尾原始 event
export function summarizeEvent(event) {
  const name = event.eventName;
  const payload = event.payload || {};
  const d = payload.data || {};

  switch (name) {
    case 'route-start':
      return preview(pick(d, 'message'));

    case 'route-selected':
      return `→ ${pick(payload, 'agentName') || pick(d, 'agentName') || '?'}`;

    case 'workflow-step-start':
      return `${pick(d, 'stepId') || '?'}${pick(d, 'subAgentAlias') ? ` (${pick(d, 'subAgentAlias')})` : ''}`;

    case 'workflow-step-completed': {
      const stepId = pick(d, 'stepId') || '?';
      const appId = pick(pick(d, 'result'), 'appId');

      return appId ? `${stepId} ✓ appId=${shortId(appId)}` : `${stepId} ✓`;
    }

    case 'workflow-loop-start':
      return `${pick(d, 'stepId') || '?'} mode=${pick(d, 'mode') || '?'}`;

    case 'workflow-loop-iteration': {
      const stepId = pick(d, 'stepId') || '?';
      const idx = pick(d, 'index') ?? '?';
      const total = pick(d, 'total') ?? pick(d, 'count') ?? '?';

      return `${stepId} #${idx}/${total}`;
    }

    case 'workflow-loop-iteration-completed': {
      const ok = !pick(d, 'status') || pick(d, 'status') === 'success';

      return `${pick(d, 'stepId') || '?'} #${pick(d, 'index') ?? '?'} ${ok ? '✓' : '✗'}`;
    }

    case 'workflow-loop-completed':
      return `${pick(d, 'stepId') || '?'} ✓ total=${pick(d, 'count') ?? '?'}`;

    case 'tool-call':
    case 'subagent-tool-call':
      return `${pick(d, 'name') || '?'} call=${shortId(pick(d, 'callId') || pick(d, 'toolCallId') || '?')}`;

    case 'tool-result':
    case 'subagent-tool-result':
      return `${pick(d, 'name') || '?'} ${pick(d, 'exception') ? '✗' : '✓'}`;

    case 'text-delta':
    case 'reasoning-delta': {
      const delta = pick(payload, 'delta') || '';

      return `+${delta.length} "${preview(delta, 30)}"`;
    }

    case 'subagent-text-delta':
      return `+${(pick(payload, 'delta') || '').length}`;

    case 'artifact-draft-started':
      return `name="${pick(d, 'name') || ''}" new=${pick(d, 'isNewArtifact')} art=${shortId(pick(d, 'artifactId'))}`;

    case 'artifact-file-writing':
      return `${pick(d, 'path')} size=${pick(d, 'size') ?? '?'}${pick(d, 'skipped') ? ' skipped' : ''}`;

    case 'artifact-file-content-delta':
      return `${pick(d, 'path')} +${(pick(d, 'contentDelta') || '').length}`;

    case 'artifact-file-content-end':
      return pick(d, 'path') || '';

    case 'artifact-file-written':
      return `${pick(d, 'path')}${pick(d, 'skipped') ? ' skipped' : ''}`;

    case 'artifact-version-committed': {
      const paths = pick(d, 'changedPaths');

      return `name="${pick(d, 'name') || ''}" ${pick(d, 'versionLabel') || ''} paths=${Array.isArray(paths) ? paths.length : '?'}`;
    }

    case 'completed': {
      const artifactName = pick(pick(d, 'artifact'), 'name') || pick(d, 'appName');
      const msg = pick(d, 'message');

      return [artifactName && `name="${artifactName}"`, msg && `msg="${preview(msg, 40)}"`].filter(Boolean).join(' ');
    }

    case 'error':
      return `${pick(payload, 'errorCode') || ''} ${preview(pick(payload, 'errorMessage'), 60)}`.trim();

    default:
      return '';
  }
}

// IS_DEBUG（localStorage.isDebug=1）或 window.isDebug 任一开启时打印
export function logSseEvent(event) {
  if (!IS_DEBUG && !window.isDebug) return;
  const summary = summarizeEvent(event);
  const style = styleFor(event.eventName);

  console.log(`%c[sse] ${event.eventName}%c ${summary}`, style, 'color:inherit', event);
}
