import { useEffect, useRef, useState } from 'react';
import { useAgentBus, useAgentEvent } from '../agentBus';
import { entryByPath, hasData, makeInitialFiles, META_FILE_ENTRIES, parseFile, SIDEBAR_ITEMS } from './fileRegistry';

// 应用元信息文件路径（非 tab）。app.json 里的 planGenerationId 是方案"代次"标识：
// 值变化 = 后端 agent 把整套方案推倒重写（而非局部修订），前端据此清空旧视图重渲染。
const META_FILE_PATH = META_FILE_ENTRIES[0].file;

function tryParse(entry, content) {
  try {
    return parseFile(entry, content);
  } catch {
    return undefined;
  }
}

// 侧栏数量：多数面板 parsed 是扁平数组，length 即条数；
// 自定义动作（custom-actions.json）是「按工作表分组」结构 [{ worksheet, actions: [...] }]，
// 数量需取各组 actions 之和，否则显示的是分组数而非实际动作数。
function countSidebarItems(key, parsed) {
  if (key === 'customActions') {
    return parsed.reduce((sum, group) => sum + (Array.isArray(group && group.actions) ? group.actions.length : 0), 0);
  }

  return parsed.length;
}

// 接管所有 file:* bus 事件，返回当前 files / focus / sidebar 派生入口。
// 内部把"找 entry → 取 cur"重复模式压成一个 update helper，避免 6 个事件各写一遍 setFiles。
export function useFileStore() {
  const bus = useAgentBus();
  const [files, setFiles] = useState(makeInitialFiles);
  const [focus, setFocus] = useState(null);
  // 侧栏按文件首次出现的顺序排列，避免后到的文件被 SIDEBAR_ITEMS 固定位插队
  const [pathOrder, setPathOrder] = useState([]);
  // 上一次已应用的 planGenerationId；undefined = 尚未见过任何方案。值变化 = 整套方案被推倒重写。
  const lastGenIdRef = useRef(undefined);
  // app.json 流式累积缓冲：file:delta 逐段拼接后增量解析 planGenerationId。
  const appMetaBufRef = useRef('');
  // 本轮 app.json 流是否已触发过重置，避免逐 delta 重复 reset。file:begin 时归位。
  const regenFiredRef = useRef(false);
  // 用户是否主动点过侧栏：置位后流式新产物不再抢焦点，避免正在看的 tab 被自动切走。
  // 解除时机：发起新一轮对话（chat:submitting=true）、方案被整套重写、加载历史版本方案——
  // 这三种都是"查看对象换了"，此时继续跟随才符合预期。
  const userPickedRef = useRef(false);

  function update(path, mutator) {
    const entry = entryByPath(path);

    if (!entry) return;
    setFiles(prev => {
      const cur = prev[path] || { content: '', parsed: null, status: 'idle' };
      const next = mutator(entry, cur);

      return next ? { ...prev, [path]: next } : prev;
    });
  }

  function track(path) {
    setPathOrder(prev => (prev.includes(path) ? prev : [...prev, path]));
  }

  // 从（可能半截的）app.json 文本里尽力取 planGenerationId；取不到返回 undefined。
  function readGenId(content) {
    const parsed = tryParse(entryByPath(META_FILE_PATH), content);

    return parsed && typeof parsed === 'object' ? parsed.planGenerationId : undefined;
  }

  // 全量重写：除 app.json（本轮新元信息正在写入）外的全部文件回到初始态，清空侧栏与焦点，
  // 让本轮随后流入的文件从零重渲染，避免与上一版残留合并。
  function resetForRegen() {
    setFiles(prev => {
      const fresh = makeInitialFiles();

      fresh[META_FILE_PATH] = prev[META_FILE_PATH] || fresh[META_FILE_PATH];
      return fresh;
    });
    setPathOrder(prev => prev.filter(p => p === META_FILE_PATH));
    setFocus(null);
    // 旧方案连同用户选中的 tab 一起作废，恢复跟随新一版的流式产物
    userPickedRef.current = false;
  }

  // 用户主动点侧栏切 tab：锁住焦点，后续流式产物不再自动跳走
  function focusByUser(path) {
    userPickedRef.current = true;
    setFocus(path);
  }

  // app.json 流式增量到达：比对 planGenerationId，值变化（且非首次）即判定整套方案重写并清空旧视图。
  // 只在流式（file:begin/file:delta，历史加载不发这两类事件）触发，故不会误伤切换历史版本。
  function trackAppMetaGen() {
    if (regenFiredRef.current) return;
    const genId = readGenId(appMetaBufRef.current);

    if (!genId) return;
    const prevGenId = lastGenIdRef.current;

    lastGenIdRef.current = genId;
    if (prevGenId !== undefined && genId !== prevGenId) {
      regenFiredRef.current = true;
      resetForRegen();
    }
  }

  useAgentEvent('file:begin', ({ path }) => {
    if (path === META_FILE_PATH) {
      appMetaBufRef.current = '';
      regenFiredRef.current = false;
    }

    update(path, (entry, cur) => ({
      ...cur,
      content: '',
      parsed: entry.type === 'markdown' ? '' : cur.parsed || null,
      status: 'streaming',
    }));
    track(path);
    if (!userPickedRef.current) setFocus(path);
  });

  useAgentEvent('file:delta', ({ path, delta }) => {
    if (path === META_FILE_PATH) {
      appMetaBufRef.current += delta || '';
      trackAppMetaGen();
    }

    update(path, (entry, cur) => {
      const content = (cur.content || '') + (delta || '');
      const parsed = entry.type === 'markdown' ? content : tryParse(entry, content) || cur.parsed;

      return { ...cur, content, parsed, status: 'streaming' };
    });
  });

  useAgentEvent('file:end', ({ path }) => {
    update(path, (entry, cur) => {
      const parsed = tryParse(entry, cur.content);

      return { ...cur, parsed: parsed !== undefined ? parsed : cur.parsed, status: 'ready' };
    });
  });

  useAgentEvent('file:write', ({ path, content }) => {
    // 历史版本加载 / 流式最终权威写都走此路径：仅同步 app.json 代次基线，不触发重置
    // （重置只由流式 file:delta 负责；历史加载不发 file:delta，借此天然区分两种场景）。
    if (path === META_FILE_PATH) {
      const genId = readGenId(content);

      if (genId) lastGenIdRef.current = genId;
    }

    update(path, (entry, cur) => {
      const parsed = tryParse(entry, content);

      return { ...cur, content, parsed: parsed !== undefined ? parsed : cur.parsed, status: 'ready' };
    });
    track(path);
  });

  // restore=true 是加载历史版本方案后的定位（换了查看对象），解除锁定并跟随；
  // 其余（流式产物到达）在用户点过侧栏后不再抢焦点。
  useAgentEvent('file:focus', ({ path, restore } = {}) => {
    if (restore) userPickedRef.current = false;
    else if (userPickedRef.current) return;
    setFocus(path);
  });

  // 用户发起新一轮对话：方案即将有新产物，恢复自动跟随
  useAgentEvent('chat:submitting', value => {
    if (value) userPickedRef.current = false;
  });

  // 把 files 推回 chat 侧，构建 build context 时取最新快照
  useEffect(() => {
    bus.emit('builder:files-sync', { files, focus });
  }, [files, focus, bus]);

  // 侧栏按 pathOrder 排序；流式中的也展示（partial-json 早期可能空数组）
  const sidebarItems = pathOrder
    .map(path => {
      const item = SIDEBAR_ITEMS.find(it => it.file === path);
      const file = files[path];

      if (!item || !file) return null;
      if (!hasData(file) && file.status !== 'streaming') return null;
      const next = Array.isArray(file.parsed)
        ? { ...item, count: countSidebarItems(item.key, file.parsed) }
        : { ...item };

      if (file.status === 'streaming') next.streaming = true;
      return next;
    })
    .filter(Boolean);

  return { files, focus, setFocus, focusByUser, sidebarItems };
}
