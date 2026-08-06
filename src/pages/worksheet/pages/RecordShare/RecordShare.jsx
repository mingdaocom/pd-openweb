import React, { lazy, Suspense, useState } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import CreateByMingDaoYun from 'src/components/CreateByMingDaoYun';
import PublicAppLangDropdown from 'src/components/PublicAppLangDropdown';
import { browserIsMobile } from 'src/utils/common';

const isMobile = browserIsMobile();
const Con = styled.div`
  height: 100vh;
  background: var(--color-background-secondary);
`;
const RecordCon = styled.div`
  max-width: 1200px;
  height: 100%;
  overflow: hidden;
  margin: 0px auto;
  .workSheetRecordInfo {
    height: 100%;
  }
`;
const MobileCon = styled.div`
  height: 100vh;
  overflow: hidden;
  background: var(--color-background-primary);
`;
const MobileHeader = styled.div`
  height: 44px;
  padding: 0 12px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--color-border-secondary);
  background: var(--color-background-primary);
  flex-shrink: 0;

  .refreshIcon {
    width: 36px;
    height: 36px;
    color: var(--color-text-tertiary);
  }
`;
const MobileRecordCon = styled.div`
  height: calc(100vh - 44px);
  overflow: hidden;
`;
const LoadableMobileRecordInfoModal = lazy(() =>
  import('src/pages/Mobile/Record').then(component => ({
    default: component.RecordInfoModal,
  })),
);
const LoadableRecordInfoWrapper = lazy(() => import('worksheet/common/recordInfo/RecordInfoWrapper'));

const RecordShare = props => {
  const { data } = props;
  const { appId, projectId, worksheetId, rowId, viewId } = data;
  const [refreshKey, setRefreshKey] = useState(0);
  const Component = isMobile ? LoadableMobileRecordInfoModal : LoadableRecordInfoWrapper;

  if (isMobile) {
    return (
      <MobileCon className="flexColumn">
        <MobileHeader className="flexRow alignItemsCenter">
          <Icon
            icon="task-later"
            className="refreshIcon flexRow alignItemsCenter justifyContentCenter Hand Font20"
            onClick={() => setRefreshKey(key => key + 1)}
          />
          <div className="flex" />
          <div className="flexRow alignItemsCenter">
            <PublicAppLangDropdown className="mRight6" appId={appId} projectId={projectId} />
            <CreateByMingDaoYun />
          </div>
        </MobileHeader>
        <MobileRecordCon>
          <Suspense fallback={<LoadDiv className="mTop10" />}>
            <Component
              key={refreshKey}
              visible={true}
              notModal={true}
              appId={appId}
              worksheetId={worksheetId}
              viewId={viewId}
              rowId={rowId}
              editable={true}
            />
          </Suspense>
        </MobileRecordCon>
      </MobileCon>
    );
  }

  return (
    <Con>
      <RecordCon
        style={{
          width: window.innerWidth - 84 > 1200 ? window.innerWidth - 84 : window.innerWidth,
        }}
      >
        <Suspense fallback={<LoadDiv className="mTop10" />}>
          <Component notDialog from={2} appId={appId} worksheetId={worksheetId} viewId={viewId} recordId={rowId} />
        </Suspense>
      </RecordCon>
    </Con>
  );
};

export default RecordShare;
