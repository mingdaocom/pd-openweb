import { useEffect, useRef, useState } from 'react';
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
                '开启后，对 %0 格式的附件进行增强解析，提升复杂文档的内容提取效果；暂不识别文档内图片内容。',
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
