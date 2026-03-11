import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
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

export default function CreateRecordSideMask({
  appId,
  worksheetId,
  viewId,
  defaultFormData,
  defaultFormDataEditable,
  onAdd = () => {},
  onClose,
}) {
  const didMountTimestamp = useRef(Date.now());
  useEffect(() => {
    document.querySelectorAll('.ant-modal-wrap').forEach(el => {
      const modalRoot = el.closest('.ant-modal-root');
      if (modalRoot) {
        modalRoot.classList.add('hide');
      }
    });
    document.querySelectorAll('.mui-dialog-container').forEach(el => {
      el.classList.add('hide');
    });
    return () => {
      document.querySelectorAll('.ant-modal-wrap').forEach(el => {
        const modalRoot = el.closest('.ant-modal-root');
        if (modalRoot) {
          modalRoot.classList.remove('hide');
        }
      });
      document.querySelectorAll('.mui-dialog-container').forEach(el => {
        el.classList.remove('hide');
      });
    };
  }, []);
  return createPortal(
    <SideMaskWrap
      className={cx('createRecordSideMask withSaveShortcut', `createTimestamp-${didMountTimestamp.current}`)}
    >
      <NewRecordLand
        isMingoCreate
        createOptions={{ appId, worksheetId, viewId, didMountTimestamp: didMountTimestamp.current }}
        onClose={() => {
          clearLatestMessagesOfMingoCreateRecord(worksheetId);
          onClose();
        }}
        onAdd={(rowData, { continueAdd } = {}) => {
          if (!continueAdd) {
            clearLatestMessagesOfMingoCreateRecord(worksheetId);
          }
          emitter.emit('RELOAD_SHEET_VIEW');
          onAdd(rowData, { continueAdd });
        }}
        defaultCreateRecordParams={{ defaultFormData, defaultFormDataEditable }}
      />
    </SideMaskWrap>,
    document.querySelector('#containerWrapper'),
  );
}
