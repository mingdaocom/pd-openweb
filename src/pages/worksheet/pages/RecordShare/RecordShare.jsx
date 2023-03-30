import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { RecordInfoModal } from 'src/pages/Mobile/Record';
import { browserIsMobile } from 'src/util';
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

  if (isMobile) {
    return (
      <RecordInfoModal
        visible={true}
        notModal={true}
        appId={appId}
        worksheetId={worksheetId}
        viewId={viewId}
        rowId={rowId}
      />
    );
  }

  return (
    <Con>
      <RecordCon style={{ width: window.innerWidth - 84 > 1200 ? window.innerWidth - 84 : window.innerWidth }}>
        <RecordInfoWrapper
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
