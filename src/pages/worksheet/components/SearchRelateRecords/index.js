import React, { lazy, Suspense } from 'react';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';

const LoadableSearchRelateRecords = lazy(() => import('./SearchRelateRecords'));

function SearchRelateRecordsLoader(props) {
  return (
    <Suspense fallback={null}>
      <LoadableSearchRelateRecords {...props} />
    </Suspense>
  );
}

export function useSearchRecordInDialog() {
  return useFunctionWrapComponent(SearchRelateRecordsLoader);
}
