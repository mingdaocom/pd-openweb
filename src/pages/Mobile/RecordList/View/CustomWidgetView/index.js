import React, { lazy, Suspense } from 'react';
import { LoadDiv } from 'ming-ui';

const LoadableCustomWidgetView = lazy(() => import('src/pages/worksheet/views/CustomWidgetView'));

export default function MobileCustomWidgetView(props) {
  return (
    <Suspense fallback={<LoadDiv className="mTop10" />}>
      <LoadableCustomWidgetView {...props} />
    </Suspense>
  );
}
