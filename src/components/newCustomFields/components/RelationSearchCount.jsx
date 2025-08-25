import React from 'react';
import { isNaN } from 'lodash';
import useListenedValue from 'worksheet/hooks/useListenedValue';

const RelationSearchCount = React.memo(
  function RelationSearchCount({ control }) {
    const countValue = useListenedValue(`relationSearchCount:${control.controlId}`);
    const count = Number(countValue);
    if (isNaN(count) || count === 0) {
      return null;
    }
    return <span>({count})</span>;
  },
  (prev, next) => {
    // 返回 true 则不重新渲染，返回 false 则重新渲染
    return prev.count === next.count;
  },
);

export default RelationSearchCount;
