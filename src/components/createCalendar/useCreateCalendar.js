import React, { lazy, Suspense } from 'react';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';

const LoadableCreateCalendarDialog = lazy(() => import('./FunctionWrapCreateCalendarDialog'));

function CreateCalendarDialogLoader(props) {
  return (
    <Suspense fallback={null}>
      <LoadableCreateCalendarDialog {...props} />
    </Suspense>
  );
}

const getCreateCalendarProps = props => ({ ...props, visibleName: 'open' });

export default function useCreateCalendar() {
  return useFunctionWrapComponent(CreateCalendarDialogLoader, getCreateCalendarProps);
}
