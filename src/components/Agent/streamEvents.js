// SSE 事件 → UI 状态的纯函数翻译层
// - appendEventToParts：把一个事件追加到 message.parts（text / reasoning / tool / build-progress 等）
// - ensureCompletedText：completed 兜底，若整轮没有 text part 用 completed 文本补一段
// - forwardFileEvent：把 artifact-file-* 事件转成 bus 的 file:* 事件，AppBuilder 消化
import { parse as parsePartial } from 'partial-json';
import { readField, stringValue, summarizeUnknown } from './agentService';
import { BUILD_STEPS } from './buildSteps';
import { carveWorkParts } from './workParts';

const TOOL_EVENTS = ['tool-call', 'tool-result', 'subagent-tool-call', 'subagent-tool-result'];
const ROUTE_TOOL_ID = 'agent-route-selection';
const WORKFLOW_EVENTS = new Set([
  'workflow-step-start',
  'workflow-step-completed',
  'workflow-loop-start',
  'workflow-loop-completed',
  'workflow-loop-iteration',
  'workflow-loop-iteration-completed',
  // 纯 agent 并行步（step-create-pages-and-chatbots：自定义页面 ∥ 对话机器人）走 parallel-branch-* 事件，
  // 顶层 stepId 是容器 id、分支在 branchId；不消化这三类，进度树会整段缺失这两个模块。
  'workflow-parallel-branch-start',
  'workflow-parallel-branch-completed',
  'workflow-parallel-branch-failed',
]);
const ARTIFACT_EVENTS = new Set([
  'artifact-draft-started',
  'artifact-file-writing',
  'artifact-file-content-delta',
  'artifact-version-committed',
]);

function mergeText(parts, kind, text, extras = {}) {
  const last = parts[parts.length - 1];

  if (last && last.kind === kind) {
    const merged = `${last.text ? `${last.text}\n` : ''}${text}`.trim();

    return [...parts.slice(0, -1), { ...last, ...extras, text: merged }];
  }

  return [...parts, { kind, text, ts: Date.now(), ...extras }];
}

function appendDelta(parts, kind, delta) {
  const last = parts[parts.length - 1];

  if (last && last.kind === kind) {
    return [...parts.slice(0, -1), { ...last, text: (last.text || '') + delta }];
  }

  return [...parts, { kind, text: delta, ts: Date.now() }];
}

function upsertToolPart(parts, tool) {
  const normalized = { ...tool, title: tool.title || _l('工具调用') };
  const idx = parts.findIndex(p => p.kind === 'tool' && p.id === normalized.id);

  if (idx >= 0) {
    // 状态从 running 变 completed 时不更新 ts，保留首次出现时间
    return parts.map((p, i) => (i === idx ? { ...p, ...normalized, kind: 'tool', ts: p.ts } : p));
  }

  return [...parts, { kind: 'tool', ...normalized, ts: Date.now() }];
}

function toolIdOf(event) {
  const d = event.payload.data;

  return (
    stringValue(readField(d, 'callId')) ||
    stringValue(readField(d, 'toolCallId')) ||
    stringValue(readField(d, 'id')) ||
    `${event.eventName}-${event.receivedAt}`
  );
}

function toolNameOf(event) {
  const d = event.payload.data;

  return (
    stringValue(readField(d, 'name')) ||
    stringValue(readField(d, 'toolName')) ||
    stringValue(readField(d, 'toolCallName')) ||
    _l('工具调用')
  );
}

function summarizeArgs(d) {
  const v = readField(d, 'arguments');
  const fallback = readField(d, 'args');
  const picked = v !== undefined ? v : fallback;

  return picked === undefined ? undefined : summarizeUnknown(picked);
}

function summarizeResult(d) {
  const r = readField(d, 'result');
  const o = readField(d, 'output');
  const v = readField(d, 'value');
  const picked = r !== undefined ? r : o !== undefined ? o : v;

  return picked === undefined ? undefined : summarizeUnknown(picked);
}

function routePart(event) {
  if (event.eventName === 'route-start') {
    return {
      id: ROUTE_TOOL_ID,
      title: _l('路由选择'),
      status: 'running',
      output: stringValue(readField(event.payload.data, 'message')) || _l('正在选择目标 agent'),
    };
  }

  if (event.eventName === 'route-selected') {
    const name = stringValue(readField(event.payload.data, 'agentName')) || event.payload.agentName || 'router';

    return { id: ROUTE_TOOL_ID, title: _l('路由选择'), status: 'completed', output: _l('已选择 agent：%0', name) };
  }

  return null;
}

// 把"过程性"事件描述成 reasoning 段文本；completed / workflow-* 不在此处理
function describeAsReasoning(event) {
  if (event.eventName === 'subagent-text-delta') {
    return event.payload.delta || _l('子 agent 正在返回内容');
  }

  if (event.eventName === 'error') {
    return event.payload.errorMessage || _l('执行失败');
  }

  return '';
}

function hasBuildProgress(parts) {
  return parts.some(p => p.kind === 'build-progress');
}

// plan 阶段 artifact 事件 → plan-card part
// 状态机：writing-overview（写 /plan.md）→ writing-details（写 /jsons/*.json）→ committed（版本提交）
function upsertPlanCard(parts, mutator) {
  const idx = parts.findIndex(p => p.kind === 'plan-card');
  const base =
    idx >= 0
      ? parts[idx]
      : { kind: 'plan-card', ts: Date.now(), status: 'writing-overview', name: '', versionLabel: '' };
  const next = mutator({ ...base });

  if (idx >= 0) return parts.map((p, i) => (i === idx ? next : p));
  return [...parts, next];
}

function applyArtifactToPlanCard(card, event) {
  const d = (event.payload && event.payload.data) || {};

  if (card.status === 'committed' && event.eventName !== 'artifact-version-committed') return card;

  switch (event.eventName) {
    case 'artifact-draft-started': {
      // 新建场景服务端在此事件就带 name；修改场景为空串，留待 version-committed 兜底
      const earlyName = stringValue(readField(d, 'name'));

      return {
        ...card,
        status: card.status === 'committed' ? 'committed' : 'writing-overview',
        artifactId: stringValue(readField(d, 'artifactId')) || stringValue(readField(d, 'id')) || card.artifactId,
        draftVersionId:
          stringValue(readField(d, 'draftVersionId')) ||
          stringValue(readField(d, 'artifactVersionId')) ||
          card.draftVersionId,
        name: earlyName || card.name,
      };
    }

    case 'artifact-file-content-delta':
    case 'artifact-file-writing': {
      if (!d.path || d.skipped) return card;
      // app.json 是最先输出的应用元信息（非 tab），不应把卡片状态从「写总览」翻成「写详情」
      const isDetail = d.path.startsWith('/jsons/') && d.path !== '/jsons/app.json';
      const next = { ...card, status: isDetail ? 'writing-details' : 'writing-overview' };

      // /jsons/app.json 携带 appIcon/appColor：累积内容增量并尽力解析，给卡片图标用
      if (d.path === '/jsons/app.json' && d.contentDelta) {
        const buf = (card.appJsonBuf || '') + d.contentDelta;

        next.appJsonBuf = buf;
        try {
          const parsed = parsePartial(buf);

          if (parsed && typeof parsed === 'object') {
            if (parsed.appIcon) next.appIcon = parsed.appIcon;
            if (parsed.appColor) next.appColor = parsed.appColor;
            // 始终以本轮 app.json 流出的 appName 为准：修改/重生成场景 draft-started 带的是旧 artifact 名，
            // 若用 `!card.name` 守卫会卡在旧名；而侧栏标题直接 live 解析 app.json 显示新名，造成卡片名与侧栏不一致。
            if (parsed.appName) next.name = parsed.appName;
          }
        } catch {
          /* 半截 JSON，忽略 */
        }
      }

      return next;
    }

    case 'artifact-version-committed': {
      const name = stringValue(readField(d, 'name'));
      const versionLabel = stringValue(readField(d, 'versionLabel'));
      // 提交事件里版本号字段可能是 versionId / artifactVersionId，artifactId 可能是 id / artifactId；
      // 必须把 versionId 存到卡片上，
      // 否则点击卡片切换版本时 builder:open 的 `artifactId && versionId` 守卫不通过，会静默失效。
      const versionId = stringValue(readField(d, 'versionId')) || stringValue(readField(d, 'artifactVersionId'));
      const artifactId = stringValue(readField(d, 'artifactId')) || stringValue(readField(d, 'id'));

      return {
        ...card,
        status: 'committed',
        name: name || card.name,
        versionLabel: versionLabel || card.versionLabel,
        versionId: versionId || card.versionId,
        artifactId: artifactId || card.artifactId,
      };
    }

    default:
      return card;
  }
}

// 找到 build-progress part 并 upsert；没有就在 parts 末尾追加一个空骨架
function upsertBuildProgress(parts, mutator) {
  const idx = parts.findIndex(p => p.kind === 'build-progress');
  const base = idx >= 0 ? parts[idx] : { kind: 'build-progress', ts: Date.now(), steps: {} };
  const next = mutator(base);

  if (idx >= 0) return parts.map((p, i) => (i === idx ? next : p));
  return [...parts, next];
}

function applyWorkflowEvent(progress, event) {
  const d = event.payload.data || {};
  // 纯 agent 并行步的分支：容器 stepId + 独立 branchId，自己拼成复合 key "{容器}:{分支}"，
  // 与 loop 分支（step-config-and-design:build-roles 等）同体系，BuildProgress 按复合 key 读取。
  const isParallelBranch = event.eventName.startsWith('workflow-parallel-branch-');
  const stepId = isParallelBranch && d.branchId ? `${d.stepId}:${d.branchId}` : d.stepId;

  if (!stepId) return progress;
  const meta = BUILD_STEPS[stepId];
  const steps = { ...progress.steps };
  const cur = steps[stepId] || { title: (meta && meta.title) || stepId, kind: meta ? meta.kind : 'step' };

  switch (event.eventName) {
    case 'workflow-parallel-branch-start':
      steps[stepId] = { ...cur, kind: 'step', status: 'running' };
      return { ...progress, steps };

    case 'workflow-parallel-branch-completed':
      // need_detail 视为仍在进行（与 step-completed 语义对齐）；result 原样存，供 BuildProgress 列子项。
      steps[stepId] = {
        ...cur,
        kind: 'step',
        status: d.status === 'need_detail' ? 'running' : 'completed',
        result: d.result,
      };
      return { ...progress, steps };

    case 'workflow-parallel-branch-failed':
      steps[stepId] = { ...cur, kind: 'step', status: 'failed', error: d.error };
      return { ...progress, steps };

    case 'workflow-step-start':
      steps[stepId] = { ...cur, kind: 'step', status: 'running' };
      return { ...progress, steps };

    case 'workflow-step-completed': {
      const result = d.result;
      const nextProgress = { ...progress, steps };

      steps[stepId] = { ...cur, status: 'completed', result };
      if (stepId === 'step-create-app' && result && result.appId) nextProgress.appId = result.appId;
      return nextProgress;
    }

    case 'workflow-loop-start':
      steps[stepId] = { ...cur, kind: 'loop', status: 'running', index: 0, total: 0, failed: 0, iterations: [] };
      return { ...progress, steps };

    case 'workflow-loop-iteration': {
      // 服务端 d.total = 集合总长度；d.count = i+1（迭代序号，旧字段保留兼容）；d.item = 本次迭代输入项
      const total = d.total != null ? d.total : cur.total || 0;
      const idx = d.index || 0;
      const iterations = Array.isArray(cur.iterations) ? cur.iterations.slice() : [];

      iterations[idx] = { ...(iterations[idx] || {}), index: idx, status: 'running', item: d.item };
      steps[stepId] = { ...cur, kind: 'loop', status: 'running', index: idx + 1, total, iterations };
      return { ...progress, steps };
    }

    case 'workflow-loop-iteration-completed': {
      const total = d.total != null ? d.total : cur.total || 0;
      const idx = d.index || 0;
      const iterations = Array.isArray(cur.iterations) ? cur.iterations.slice() : [];
      // schema_mismatch：终态结构化输出没合 schema，但产物已由工具调用建好、是后端容忍的结果（终端步无下游消费）。
      // 不当失败：迭代标 completed + warning（浅色提示），不计入 failed，避免整段被误标红。
      const isSchemaWarning = d.status === 'schema_mismatch';
      const success = !d.status || d.status === 'success' || isSchemaWarning;

      iterations[idx] = {
        ...(iterations[idx] || { index: idx }),
        status: success ? 'completed' : 'failed',
        warning: isSchemaWarning || undefined,
        result: d.result,
        error: d.error,
      };

      const failedDelta = success ? 0 : 1;
      const failed = (cur.failed || 0) + failedDelta;

      // V4.3 尾段并行的 loop 分支（stepId 形如 step-config-and-design:* / step-build-workflows:*）由 ExecuteParallelLoopBranchesAsync
      // 直接驱动，不发 workflow-loop-completed，只发 iteration 事件。故在此按"迭代跑满"自行收尾：
      // 已结算（completed/failed）的迭代数 >= total 即视为该 loop 结束，状态语义与 loop-completed 对齐
      // （有失败则 failed，否则 completed）。普通 loop 随后仍会收到 loop-completed 重新确认，幂等无副作用。
      // 不这样判，并行分支会因收不到收尾事件而永远停在 running（UI 一直转圈）。
      const settled = iterations.filter(it => it && (it.status === 'completed' || it.status === 'failed')).length;
      const done = total > 0 && settled >= total;

      steps[stepId] = {
        ...cur,
        kind: 'loop',
        total,
        iterations,
        failed,
        ...(done ? { status: failed === 0 ? 'completed' : 'failed' } : {}),
      };
      return { ...progress, steps };
    }

    case 'workflow-loop-completed':
      // 兜底补 total（空集合 loop 不会发 iteration 事件）
      steps[stepId] = {
        ...cur,
        status: (cur.failed || 0) === 0 ? 'completed' : 'failed',
        total: cur.total || d.count || 0,
      };
      return { ...progress, steps };

    default:
      return progress;
  }
}

// plan 漂移确认事件 → plan-drift part。后端在 build "继续" 检测到本次方案与上次 checkpoint 不一致时发此事件并
// halt，等用户二选一（rebuild / resume_with_old_plan）。upsert by kind，避免二次进入重复追加。
function upsertPlanDrift(parts, data) {
  const next = {
    kind: 'plan-drift',
    ts: Date.now(),
    status: 'pending',
    stepId: stringValue(readField(data, 'stepId')) || '__plan_drift__',
    options: Array.isArray(readField(data, 'options'))
      ? readField(data, 'options')
      : ['resume_with_old_plan', 'rebuild'],
    currentPlanHash: stringValue(readField(data, 'currentPlanHash')),
    checkpointPlanHash: stringValue(readField(data, 'checkpointPlanHash')),
  };
  const idx = parts.findIndex(p => p.kind === 'plan-drift');

  if (idx >= 0) return parts.map((p, i) => (i === idx ? { ...next, ts: p.ts } : p));
  return [...parts, next];
}

// 用户点选后把 plan-drift part 标记为已决策，禁用按钮、展示选择结果。
export function resolvePlanDrift(message, chosenAction) {
  const parts = message.parts || [];
  const idx = parts.findIndex(p => p.kind === 'plan-drift');

  if (idx < 0) return message;
  return {
    ...message,
    parts: parts.map((p, i) => (i === idx ? { ...p, status: 'resolved', chosenAction } : p)),
  };
}

// 意图弹层确认（路径 E）：build "继续"/模糊表达，后端在「有进度」时跑意图分类器判 rebuild / 低置信 / unrelated，
// 经 completed{status:awaiting_rebuild_confirmation} 携带 stepId + 动态 options 回来，等用户定夺。
// 与 plan-drift 不同，它没有专属事件，由 completed payload 直接驱动卡片。upsert by kind 避免重复追加。
export function upsertRebuildConfirm(message, data) {
  const parts = message.parts || [];
  const options = readField(data, 'options');
  const next = {
    kind: 'rebuild-confirm',
    ts: Date.now(),
    status: 'pending',
    stepId: stringValue(readField(data, 'stepId')) || '__rebuild__',
    options: Array.isArray(options) && options.length ? options : ['resume', 'rebuild'],
  };
  const idx = parts.findIndex(p => p.kind === 'rebuild-confirm');

  if (idx >= 0) return { ...message, parts: parts.map((p, i) => (i === idx ? { ...next, ts: p.ts } : p)) };
  return { ...message, parts: [...parts, next] };
}

// 用户点选后把 rebuild-confirm part 标记为已决策。
export function resolveRebuildConfirm(message, chosenAction) {
  const parts = message.parts || [];
  const idx = parts.findIndex(p => p.kind === 'rebuild-confirm');

  if (idx < 0) return message;
  return {
    ...message,
    parts: parts.map((p, i) => (i === idx ? { ...p, status: 'resolved', chosenAction } : p)),
  };
}

export function appendEventToParts(message, event) {
  const parts = message.parts || [];

  // 0. plan 漂移确认：独占 part，halt 等用户决策
  if (event.eventName === 'workflow-plan-drift-detected') {
    return { ...message, parts: upsertPlanDrift(parts, event.payload.data || {}) };
  }

  // 1. workflow-*：进度卡 part，独占消化（不进 reasoning / text）
  if (WORKFLOW_EVENTS.has(event.eventName)) {
    return { ...message, parts: upsertBuildProgress(parts, base => applyWorkflowEvent(base, event)) };
  }

  // 1.5 plan 阶段 artifact-* 事件：drive 一张 plan-card；文件内容仍由 forwardFileEvent 单独消化
  if (ARTIFACT_EVENTS.has(event.eventName)) {
    return { ...message, parts: upsertPlanCard(parts, base => applyArtifactToPlanCard(base, event)) };
  }

  // 2. build 阶段 subagent-text-delta 是 sub-agent 内部 JSON 回吐，无 UI 价值；其他场景仍走 reasoning
  if (event.eventName === 'subagent-text-delta' && hasBuildProgress(parts)) {
    return message;
  }

  if (event.eventName === 'reasoning-delta' && event.payload.delta) {
    return { ...message, parts: appendDelta(parts, 'reasoning', event.payload.delta) };
  }

  if (event.eventName === 'text-delta' && event.payload.delta) {
    // 先累积文本，再把已闭合的 <workEnd /> 段切成 work part（finishedAt 取标签到达时刻）
    return { ...message, parts: carveWorkParts(appendDelta(parts, 'text', event.payload.delta), Date.now()) };
  }

  if (TOOL_EVENTS.includes(event.eventName)) {
    const id = toolIdOf(event);
    const title = toolNameOf(event);
    const d = event.payload.data;
    // build 阶段 arguments 都是 ValueKind 占位（.NET JsonElement 序列化），展示出来是噪声；统一隐藏 input
    const isBuild = hasBuildProgress(parts);
    const next = event.eventName.endsWith('tool-call')
      ? { id, title, status: 'running', input: isBuild ? undefined : summarizeArgs(d) }
      : {
          id,
          title,
          status: 'completed',
          input: isBuild ? undefined : summarizeArgs(d),
          output: summarizeResult(d),
        };

    return { ...message, parts: upsertToolPart(parts, next) };
  }

  const route = routePart(event);

  if (route) return { ...message, parts: upsertToolPart(parts, route) };

  if (event.eventName === 'error') {
    let next = parts;
    const desc = describeAsReasoning(event);

    // 错误由 ChatPanel 顶层 interceptError 渲染成"贴底拦截卡"，不再落消息流内 part；
    // 此处仅保留过程性 reasoning 文本（若有）。
    if (desc) next = mergeText(next, 'reasoning', desc, { open: true });
    return { ...message, parts: next };
  }

  const desc = describeAsReasoning(event);

  if (desc) return { ...message, parts: mergeText(parts, 'reasoning', desc, { open: true }) };
  return message;
}

export function ensureCompletedText(message, text) {
  const parts = message.parts || [];

  if (parts.some(p => p.kind === 'text')) return message;
  return { ...message, parts: [...parts, { kind: 'text', text, ts: Date.now() }] };
}

// build 流到尾（completed 事件）给 build-progress part 打 finishedAt 时间戳，
// 让 BuildProgress 折叠态能算出总耗时（finishedAt - ts）并展示"已完成 16m24s"。
export function markBuildProgressFinished(message) {
  const parts = message.parts || [];
  const idx = parts.findIndex(p => p.kind === 'build-progress');

  if (idx < 0 || parts[idx].finishedAt) return message;
  return { ...message, parts: parts.map((p, i) => (i === idx ? { ...p, finishedAt: Date.now() } : p)) };
}

// 搭建异常 / 中止：给 build-progress part 打 aborted 标记，BuildProgress 据此停掉所有 loading（•••）动画，
// 避免运行中的步骤在出错后仍无限转圈。
export function markBuildProgressAborted(message) {
  const parts = message.parts || [];
  const idx = parts.findIndex(p => p.kind === 'build-progress');

  if (idx < 0 || parts[idx].aborted) return message;
  return { ...message, parts: parts.map((p, i) => (i === idx ? { ...p, aborted: true } : p)) };
}

// build agent 的 completed 顶层直接铺 appName；plan agent 在 artifact.name 下。
// 同时把 appName 落到 build-progress part（如果存在），让 BuildProgress 标题用到
export function applyCompletedAppName(message, appName) {
  if (!appName) return message;
  const parts = message.parts || [];
  const idx = parts.findIndex(p => p.kind === 'build-progress');

  if (idx < 0) return message;
  return { ...message, parts: parts.map((p, i) => (i === idx ? { ...p, appName: p.appName || appName } : p)) };
}

// build 流：从 SSE 事件里取出最早的 appId（含 sectionIdByName）。
// 两个来源，取先到的那个：
//   1) subagent-tool-result 且 name='create_app' → result.Text JSON.data.appId（与 fence ARTIFACT_BEGIN 同帧）
//   2) workflow-step-completed 且 stepId='step-create-app' → result.appId / result.sectionIdByName
export function extractAppCreatedIds(event) {
  const d = (event && event.payload && event.payload.data) || {};

  if (event.eventName === 'subagent-tool-result' && stringValue(readField(d, 'name')) === 'create_app') {
    const text = stringValue(readField(readField(d, 'result'), 'Text'));
    const parsed = text ? safeParse(text) : null;
    const inner = readField(parsed, 'data');
    const appId = stringValue(readField(inner, 'appId'));

    if (appId) return { appId, sectionIdByName: {} };
  }

  if (event.eventName === 'workflow-step-completed' && stringValue(readField(d, 'stepId')) === 'step-create-app') {
    const result = readField(d, 'result');
    const appId = stringValue(readField(result, 'appId'));
    const sectionIdByName = readField(result, 'sectionIdByName') || {};

    if (appId) return { appId, sectionIdByName };
  }

  return null;
}

// 把 artifact-file-* SSE 事件转成 bus 的 file:* 事件；返回 true 表示已消化
export function forwardFileEvent(event, bus) {
  const data = (event && event.payload && event.payload.data) || {};

  switch (event.eventName) {
    // tool-call 模式：一次性 emit 整文件
    case 'artifact-file-writing':
      if (data.skipped || !data.path) return true;
      bus.emit('file:write', { path: data.path, content: data.content || '' });
      bus.emit('file:focus', { path: data.path });
      return true;

    // streaming 模式：增量 delta + end
    case 'artifact-file-content-delta':
      if (!data.path) return true;
      if (data.contentDelta) bus.emit('file:delta', { path: data.path, delta: data.contentDelta });
      return true;

    case 'artifact-file-content-end':
      if (!data.path) return true;
      bus.emit('file:end', { path: data.path });
      return true;

    default:
      return false;
  }
}
