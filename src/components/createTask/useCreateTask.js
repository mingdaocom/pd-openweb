import React, { lazy, Suspense } from 'react';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';

const LoadableCreateTaskDialog = lazy(() => import('./FunctionWrapCreateTaskDialog'));

function CreateTaskDialogLoader(props) {
  return (
    <Suspense fallback={null}>
      <LoadableCreateTaskDialog {...props} />
    </Suspense>
  );
}

const getCreateTaskProps = props => ({ ...props, visibleName: 'open' });

export default function useCreateTask() {
  return useFunctionWrapComponent(CreateTaskDialogLoader, getCreateTaskProps);
}
