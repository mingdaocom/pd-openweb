import React, { lazy, Suspense } from 'react';
import { LoadDiv } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';

const isMobile = browserIsMobile();
const LoadableMobileSingleView = lazy(() => import('mobile/components/SingleView'));
const LoadableSingleView = lazy(() => import('worksheet/common/SingleView'));

const ViewSahre = props => {
  const { data, showHeader, headerLeft, headerRight } = props;
  const Component = isMobile ? LoadableMobileSingleView : LoadableSingleView;
  return (
    <Suspense fallback={<LoadDiv className="mTop10" />}>
      <Component
        showHeader={showHeader !== 'false'}
        headerLeft={headerLeft}
        headerRight={headerRight}
        appId={data.appId}
        worksheetId={data.worksheetId}
        viewId={data.viewId}
      />
    </Suspense>
  );
};

export default ViewSahre;
