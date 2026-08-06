// 首页「待搭建应用」个性化推荐：调 app-build-recommender agent 按用户画像（部门/职位/角色/组织）
// 推荐 3~6 条搭建引导语。画像由服务端按 projectId 注入（agent requireProjectId），前端只需传 projectId
// + 一个触发用 message。空 / 失败时回退静态 BUILD_SAMPLES，保证首页恒有内容。
import { useCallback, useEffect, useRef, useState } from 'react';
import { parse as parsePartial } from 'partial-json';
import { createAgentSessionId, getCompletedText, requestAgentStream } from 'src/components/Agent/agentService';
import { BUILD_SAMPLES } from './buildSamples';

export const BUILD_RECOMMENDER_AGENT = 'app-build-recommender';

// 内存缓存（按 projectId）：同一会话内（SPA 内来回切换）免重复请求接口，直接读缓存；
// 页面刷新后模块级 Map 重置，自然重新拉一次。不再写 localStorage 持久化。
const sessionCache = new Map();

// 推荐顺延游标（按 projectId）：首次随机起点、之后每次取后自增循环轮换。模块级，跨组件重挂载保留；
// 整页刷新会重置（自然重新随机起点），避免「只能刷新进入」的场景下永远从第一条开始。
const seqCursor = new Map();

// agent 输出结构化 JSON：{ "suggestions": ["搭建XX管理应用", ...] }（3~6 条）。
// 用 partial-json 容忍半截 JSON；非字符串 / 空白统一过滤。异常返回 []。
export function parseBuildSuggestions(raw) {
  if (!raw) return [];

  try {
    const obj = parsePartial(raw);
    const list = obj && obj.suggestions;

    if (Array.isArray(list)) {
      return list.filter(s => typeof s === 'string' && s.trim()).map(s => s.trim());
    }
  } catch {
    /* 半截 JSON 解析失败，等待下一个增量 */
  }

  return [];
}

// 拉取并解析推荐：累积 text-delta，completed 兜底取整段，结束后解析一次。
async function fetchSuggestions({ projectId, forceRefresh, signal }) {
  let acc = '';

  await requestAgentStream(
    {
      sessionId: createAgentSessionId(),
      agentName: BUILD_RECOMMENDER_AGENT,
      projectId,
      message: _l('推荐待搭建应用'),
      forceRefresh,
      // 注入当前语言，让 agent 按用户语言生成推荐
      context: { language: getCurrentLang() },
    },
    {
      onEvent: event => {
        if (signal.aborted) return;
        if (event.eventName === 'text-delta' && event.payload.delta) {
          acc += event.payload.delta;
        } else if (event.eventName === 'completed' && !acc) {
          acc = getCompletedText(event.payload.data) || '';
        }
      },
    },
    signal,
  );

  return parseBuildSuggestions(acc);
}

// 个性化「待搭建应用」推荐 hook。返回 { suggestions, nextSuggestion, randomSamples, status, reload }。
// suggestions：全部推荐；nextSuggestion：按返回顺序顺延取 1 条（首页「试一试」单条展示，每次挂载取下一条、循环）；
// randomSamples：全部推荐（新建应用弹窗芯片展示，不限条数、保持原顺序）。均在异步回调里取并存入 state，
// 保证一次挂载内稳定不抖动、且不在 render 期调用随机 / 自增。
// 无 projectId（如应用内）时不请求 agent，直接回退静态样例。
export function useDailyBuildSuggestions(projectId) {
  const [suggestions, setSuggestions] = useState([]);
  const [nextSuggestion, setNextSuggestion] = useState('');
  const [randomSamples, setRandomSamples] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const abortRef = useRef(null);

  // 从列表派生展示项：按 projectId 游标顺延。nextSuggestion 取游标当前条（试一试单条）；
  // randomSamples 返回「从游标处旋转」后的全量列表——展示全部的消费方（新建应用弹窗）顺序无感，
  // 只截取前几条的消费方（移动端搭建态取前 3）则每次都顺延一组，避免一直固定显示头几条。
  // 首次访问该 projectId 随机起点（刷新进入也能换一组），之后 +1 平滑顺延（SPA 重挂载轮换）。
  const pickFromList = useCallback(
    list => {
      if (!list.length) {
        setNextSuggestion('');
        setRandomSamples([]);
        return;
      }

      let cursor = seqCursor.get(projectId);
      if (cursor === undefined) cursor = Math.floor(Math.random() * list.length);
      const i = cursor % list.length;
      seqCursor.set(projectId, i + 1);
      const rotated = list.slice(i).concat(list.slice(0, i));
      setNextSuggestion(rotated[0]);
      setRandomSamples(rotated);
    },
    [projectId],
  );

  const applySuggestions = useCallback(
    list => {
      setSuggestions(list);
      pickFromList(list);
    },
    [pickFromList],
  );

  const load = useCallback(
    async ({ isReload = false } = {}) => {
      if (!projectId) {
        applySuggestions(BUILD_SAMPLES);
        setStatus('done');
        return;
      }

      // 命中内存缓存：不再请求接口，直接复用缓存列表并按游标顺延一组（每次打开仍换一组）。页面刷新后缓存已清空，自然重拉。
      if (!isReload) {
        const cached = sessionCache.get(projectId);

        if (cached) {
          applySuggestions(cached);
          setStatus('done');
          return;
        }
      }

      abortRef.current?.abort();
      const controller = new AbortController();

      abortRef.current = controller;
      setStatus('loading');

      try {
        const items = await fetchSuggestions({ projectId, forceRefresh: isReload, signal: controller.signal });

        if (controller.signal.aborted) return;
        // 只缓存真实 agent 结果（兜底样例不缓存，下次仍尝试接口）；仅写内存，不持久化
        if (items.length) {
          sessionCache.set(projectId, items);
        }

        applySuggestions(items.length ? items : BUILD_SAMPLES);
        setStatus('done');
      } catch {
        if (controller.signal.aborted) return;
        applySuggestions(BUILD_SAMPLES);
        setStatus('error');
      }
    },
    [projectId, applySuggestions],
  );

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const reload = useCallback(() => load({ isReload: true }), [load]);

  return { suggestions, nextSuggestion, randomSamples, status, reload };
}
