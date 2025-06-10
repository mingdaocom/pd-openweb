import React, { useEffect, useState } from 'react';
import { LoadDiv } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';

const isMobile = browserIsMobile();

const ViewSahre = props => {
  const { data, showHeader, headerLeft, headerRight } = props;
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (isMobile) {
      import('mobile/components/SingleView').then(component => {
        setComponent(component.default);
      });
    } else {
      import('worksheet/common/SingleView').then(component => {
        setComponent(component.default);
      });
    }
  }, []);

  if (!Component) return <LoadDiv />;

  return (
    <Component
      showHeader={showHeader !== 'false'}
      headerLeft={headerLeft}
      headerRight={headerRight}
      appId={data.appId}
      worksheetId={data.worksheetId}
      viewId={data.viewId}
    />
  );
};

export default ViewSahre;
