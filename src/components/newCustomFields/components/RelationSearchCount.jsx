import { isNaN } from 'lodash';
import React from 'react';
import useListenedValue from 'worksheet/hooks/useListenedValue';

export default function RelationSearchCount({ control, recordId }) {
  const countValue = useListenedValue(`relationSearchCount:${recordId}:${control.controlId}`);
  const count = Number(countValue);
  if (isNaN(count) || count === 0) {
    return;
  }
  return <span>({count})</span>;
}
