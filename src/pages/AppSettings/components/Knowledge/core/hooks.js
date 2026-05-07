import { useCallback, useEffect, useRef, useState } from 'react';
import knowledgeApi from '../api/knowledge';

/**
 * Hook: a 标签新窗口打开
 * @param {Object} options
 * @param {string} options.selector - 可选，目标容器 selector
 * @param {boolean} options.onlyExternal - 可选，只处理外链
 */
export const useLinkTargetBlank = ({ selector, onlyExternal = false } = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = e => {
      const link = e.target.closest('a');
      if (!link) return;

      let container = null;

      if (containerRef?.current) {
        container = containerRef.current.contains(link) ? containerRef.current : null;
      } else if (selector) {
        container = link.closest(selector);
      }

      if (!container) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      if (onlyExternal && link.host === window.location.host) return;
      if (link.target === '_blank') return;

      window.open(link.href, '_blank', 'noopener,noreferrer');
      e.preventDefault();
      e.stopPropagation();
    };

    // 使用捕获阶段，避免被业务 onClick stopPropagation 后失效
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [containerRef, selector, onlyExternal]);

  return containerRef;
};

// 自动聚焦
export const useAutoFocus = (ref, active = true) => {
  useEffect(() => {
    if (!active) return;

    let frame;
    let count = 0;

    const tryFocus = () => {
      const el = ref?.current;

      if (el) {
        el.focus();
        return;
      }

      if (count < 5) {
        count += 1;
        frame = requestAnimationFrame(tryFocus);
      }
    };

    frame = requestAnimationFrame(tryFocus);

    return () => cancelAnimationFrame(frame);
  }, [active]);
};

// 监听 Esc 键
export const useEsc = (callback, active = true) => {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        callback?.(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback, active]);
};

// 知识库使用情况
export const useKnowledgeUsage = projectId => {
  const [data, setData] = useState({});
  const [attachmentEnhancedTip, setAttachmentEnhancedTip] = useState('');

  useEffect(() => {
    if (!projectId) return;

    let canceled = false;

    knowledgeApi.getKnowledgeBaseUsage({ projectId }).then(res => {
      if (!canceled && res) {
        const { doclingExt } = res;
        const doclingExtText = (doclingExt || '').trim();

        setAttachmentEnhancedTip(
          doclingExtText
            ? _l(
                '开启后，对 %0 格式的附件使用视觉模型解析，提升复杂文档的结构还原准确率。',
                doclingExtText.split(',').join('、'),
              )
            : '',
        );
        setData(res);
      }
    });

    return () => {
      canceled = true;
    };
  }, [projectId]);

  return {
    overLimit: data.overLimit || data.count === data.usedCount,
    count: data.count,
    usedCount: data.usedCount,
    remainingCount: data.count - data.usedCount || 0,
    attachmentEnhancedTip,
  };
};

// 通用轮询
export const usePolling = ({
  fetcher, // async function
  shouldContinue, // (data) => boolean
  interval = 2000, // 初始间隔
  slowInterval = 5000, // 降频间隔
  slowAfter = 150, // 多少次后降频
}) => {
  const timerRef = useRef(null);
  const countRef = useRef(0);
  const mountedRef = useRef(true);
  const runningRef = useRef(false); // 防止重复启动

  // 卸载清理
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    countRef.current = 0;
    runningRef.current = false;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;

    countRef.current = 0;
    runningRef.current = true;
    const loop = async () => {
      const data = await fetcher();

      if (!mountedRef.current) return;

      // 判断是否继续
      if (shouldContinue && !shouldContinue(data)) {
        stop();
        return;
      }

      countRef.current += 1;

      const delay = countRef.current > slowAfter ? slowInterval : interval;

      timerRef.current = setTimeout(loop, delay);
    };

    timerRef.current = setTimeout(loop, interval);
  }, [fetcher, shouldContinue, interval, slowInterval, slowAfter, stop]);

  return {
    start,
    stop,
  };
};
