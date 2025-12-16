import React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import NewRecordLand from 'src/pages/NewRecord';
import { emitter } from 'src/utils/common';

const SideMaskWrap = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  padding: 12px 30px 0;
  background: rgba(0, 0, 0, 0.7);
`;

function clearLatestMessagesOfMingoCreateRecord(worksheetId) {
  const latestMessagesOfMingoCreateRecord = localStorage.getItem('latestMessagesOfMingoCreateRecord');
  const parsedData = safeParse(latestMessagesOfMingoCreateRecord);
  if (parsedData?.worksheetId === worksheetId) {
    localStorage.removeItem('latestMessagesOfMingoCreateRecord');
  }
}

export default function CreateRecordSideMask({ appId, worksheetId, viewId, onClose }) {
  return createPortal(
    <SideMaskWrap className="createRecordSideMask">
      <NewRecordLand
        isMingoCreate
        createOptions={{ appId, worksheetId, viewId }}
        onClose={() => {
          clearLatestMessagesOfMingoCreateRecord(worksheetId);
          onClose();
        }}
        onAdd={(rowData, { continueAdd } = {}) => {
          if (!continueAdd) {
            clearLatestMessagesOfMingoCreateRecord(worksheetId);
          }
          emitter.emit('RELOAD_SHEET_VIEW');
        }}
      />
    </SideMaskWrap>,
    document.querySelector('#containerWrapper'),
  );
}
