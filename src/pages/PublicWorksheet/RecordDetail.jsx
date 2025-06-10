import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Modal } from 'ming-ui';
import { RecordInfoModal as MobileRecordInfoModal } from 'mobile/Record';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { browserIsMobile } from 'src/utils/common';

const RecordCon = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  margin: 0px auto;
  position: relative;

  .recordDetailHeader {
    padding: 20px 24px;
    font-size: 17px;
    font-weight: 600;
  }

  .workSheetRecordInfo {
    flex: 1;
    min-height: 0;

    .ant-pro-layout-watermark-wrapper {
      position: unset !important;
    }
    .recordHeader {
      display: none;
    }
    .recordInfoForm {
      .recordInfoFormHeader {
        display: none;
      }
    }
  }
`;

export default function RecordDetail(props) {
  const { isEdit, publicWorksheetInfo, onClose, rowId, onRefreshList } = props;
  const { worksheetId, appId } = publicWorksheetInfo;

  return browserIsMobile() ? (
    <MobileRecordInfoModal
      className="full"
      visible
      appId={appId}
      worksheetId={worksheetId}
      rowId={rowId}
      editable={isEdit}
      hideOtherOperate={isEdit}
      onClose={onClose}
      updateSuccess={(recordIds, data) => onRefreshList(recordIds[0], data)}
    />
  ) : (
    <Modal visible type="fixed" bodyStyle={{ padding: '0' }} width={1100} onCancel={onClose}>
      <RecordCon>
        <div className="recordDetailHeader">{isEdit ? _l('修改记录') : _l('查看记录')}</div>
        <RecordInfoWrapper
          notDialog
          from={2}
          appId={appId}
          worksheetId={worksheetId}
          allowEdit={isEdit}
          recordId={rowId}
          updateSuccess={(recordIds, data) => onRefreshList(recordIds[0], data)}
        />
      </RecordCon>
    </Modal>
  );
}
