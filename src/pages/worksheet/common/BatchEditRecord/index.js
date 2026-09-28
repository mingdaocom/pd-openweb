import React, { lazy, Suspense } from 'react';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';

const LoadableBatchEditRecord = lazy(() => import('./BatchEditRecord'));

function BatchEditRecordLoader(props) {
  return (
    <Suspense fallback={null}>
      <LoadableBatchEditRecord {...props} />
    </Suspense>
  );
}

export function useBatchEditRecord() {
  return useFunctionWrapComponent(BatchEditRecordLoader);
}
