import React, { lazy, Suspense } from 'react';
import functionWrap from 'ming-ui/components/FunctionWrap';
import useFunctionWrapComponent, { openFunctionWrapComponent } from 'ming-ui/hooks/useFunctionWrapComponent';

const LoadableNewRecord = lazy(() => import('./NewRecord'));

function NewRecordLoader(props) {
  return (
    <Suspense fallback={null}>
      <LoadableNewRecord {...props} />
    </Suspense>
  );
}

const getNewRecordProps = props => ({ ...props, closeFnName: 'hideNewRecord' });

export function useAddRecord() {
  return useFunctionWrapComponent(NewRecordLoader, getNewRecordProps);
}

export function openGlobalAddRecord(props) {
  openFunctionWrapComponent(functionWrap, NewRecordLoader, props, getNewRecordProps);
}
