import React, { useEffect } from 'react';
import useListenedValue from 'worksheet/hooks/useListenedValue';

const countCache = new Map();

const RelationSearchCount = React.memo(
  function RelationSearchCount({ control, recordId, keepPrevious = false }) {
    const countValue = useListenedValue(`relationSearchCount:${control.controlId}`);
    const count = Number(countValue);
    const cacheKey = `${recordId || ''}:${control.controlId}`;
    const cachedCount = keepPrevious ? countCache.get(cacheKey) : undefined;

    useEffect(() => {
      if (keepPrevious && Number.isFinite(count)) {
        countCache.set(cacheKey, count);
      }
    }, [cacheKey, count, keepPrevious]);

    const currentCount = keepPrevious && !Number.isFinite(count) ? cachedCount : count;

    if (!Number.isFinite(currentCount) || currentCount === 0) {
      return null;
    }

    return <span>({currentCount})</span>;
  },
  (prev, next) => {
    // 返回 true 则不重新渲染，返回 false 则重新渲染
    return (
      prev.recordId === next.recordId &&
      prev.keepPrevious === next.keepPrevious &&
      prev.control?.controlId === next.control?.controlId
    );
  },
);

export default RelationSearchCount;
