import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';

const isMobile = browserIsMobile();

const Con = styled.div`
  height: 100vh;
  background: #f5f5f9;
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

const RecordShare = props => {
  const { data } = props;
  const { appId, worksheetId, rowId, viewId } = data;
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (isMobile) {
      import('src/pages/Mobile/Record').then(component => {
        setComponent(component.RecordInfoModal);
      });
    } else {
      import('worksheet/common/recordInfo/RecordInfoWrapper').then(component => {
        setComponent(component);
      });
    }
  }, []);

  if (!Component) return <LoadDiv />;

  if (isMobile) {
    return (
      <Component
        visible={true}
        notModal={true}
        appId={appId}
        worksheetId={worksheetId}
        viewId={viewId}
        rowId={rowId}
        editable={true}
      />
    );
  }

  return (
    <Con>
      <RecordCon style={{ width: window.innerWidth - 84 > 1200 ? window.innerWidth - 84 : window.innerWidth }}>
        <Component.default
          notDialog
          from={2}
          appId={appId}
          worksheetId={worksheetId}
          viewId={viewId}
          recordId={rowId}
        />
      </RecordCon>
    </Con>
  );
};

export default RecordShare;
