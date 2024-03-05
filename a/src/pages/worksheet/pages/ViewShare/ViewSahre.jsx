import React, { useEffect, useState } from 'react';
import SingleView from 'worksheet/common/SingleView';
import MobileSingleView from 'mobile/components/SingleView';
import { browserIsMobile } from 'src/util';
const isMobile = browserIsMobile();

const ViewSahre = props => {
  const { data, headerLeft, headerRight } = props;
  const Component = isMobile ? MobileSingleView : SingleView;
  return (
    <Component
      showHeader={true}
      headerLeft={headerLeft}
      headerRight={headerRight}
      appId={data.appId}
      worksheetId={data.worksheetId}
      viewId={data.viewId}
    />
  );
}

export default ViewSahre;
