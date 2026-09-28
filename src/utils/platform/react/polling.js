import { useCallback, useEffect, useRef } from 'react';

/**
 * 通用定时轮询 Hook。
 * 首次调用会在 interval 后执行 fetcher；当 shouldContinue 返回 false 时自动停止。
 * 请求失败时继续下一轮，超过 slowAfter 次后使用 slowInterval 降低轮询频率。
 *
 * @param {Object} options
 * @param {Function} options.fetcher 每轮执行的异步请求，返回值会传给 shouldContinue
 * @param {Function} options.shouldContinue 判断是否继续轮询，返回 false 时停止
 * @param {number} [options.interval=2000] 常规轮询间隔，单位毫秒
 * @param {number} [options.slowInterval=5000] 降频后的轮询间隔，单位毫秒
 * @param {number} [options.slowAfter=150] 触发降频前的轮询次数
 * @returns {{ start: Function, stop: Function }} 轮询的启动与停止方法
 */
export function usePolling({ fetcher, shouldContinue, interval = 2000, slowInterval = 5000, slowAfter = 150 }) {
  const timerRef = useRef(null);
  const countRef = useRef(0);
  const mountedRef = useRef(true);
  const runningRef = useRef(false);
  const runIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    // 组件卸载时清除待执行任务，避免继续请求或更新状态。
    return () => {
      mountedRef.current = false;
      runningRef.current = false;
      runIdRef.current += 1;
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    countRef.current = 0;
    runningRef.current = false;
    runIdRef.current += 1;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    // 同一个 Hook 实例只允许存在一条轮询链路。
    if (runningRef.current) return;

    countRef.current = 0;
    runningRef.current = true;
    const runId = ++runIdRef.current;

    const isCurrentRun = () => mountedRef.current && runningRef.current && runIdRef.current === runId;

    const scheduleNext = loop => {
      if (!isCurrentRun()) return;

      countRef.current += 1;
      timerRef.current = setTimeout(loop, countRef.current > slowAfter ? slowInterval : interval);
    };

    const loop = async () => {
      let data;

      try {
        data = await fetcher();
      } catch {
        // 临时请求失败不终止任务，保持当前轮询节奏继续重试。
        scheduleNext(loop);
        return;
      }

      if (!isCurrentRun()) return;

      if (shouldContinue && !shouldContinue(data)) {
        stop();
        return;
      }

      scheduleNext(loop);
    };

    timerRef.current = setTimeout(loop, interval);
  }, [fetcher, shouldContinue, interval, slowInterval, slowAfter, stop]);

  return { start, stop };
}
