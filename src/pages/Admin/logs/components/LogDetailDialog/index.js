import React, { useState, useEffect } from 'react';
import { Dialog } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import WorksheetRocordLog from 'src/pages/worksheet/components/WorksheetRecordLog/WorksheetRocordLog';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import styled from 'styled-components';

const RecordLogDialogWrap = styled(Dialog)`
  min-height: 500px;
  max-height: 100% !important;
  background: pink;
  .mui-dialog-body {
    padding: 0 !important;
    background: #fafafa;
    position: relative;
    overflow: hidden;
    .nano-content {
      position: static;
    }
    .nano > .nano-pane {
      display: none;
    }
  }
  .logBox .selectTriggerChildAvatar .accountName:hover {
    color: #333;
    background: #fff;
  }
`;

export default function LogDetailDialog(props) {
  const { visible, onCancel, currentRowInfo = {} } = props;
  const [titleName, setTitleName] = useState('');
  const [controls, setControls] = useState(undefined);
  const appId = _.get(currentRowInfo, 'application.appId');
  const worksheetId = _.get(currentRowInfo, 'appItem.id');
  const rowId = _.get(currentRowInfo, 'rowId');

  const [filterUniqueIds, setFilterUniqueIds] = useState([currentRowInfo.uniqueId]);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    Promise.all([
      sheetAjax.getWorksheetInfo({
        getRules: true,
        getTemplate: true,
        worksheetId: worksheetId,
      }),
      sheetAjax.getRowDetail({ appId, worksheetId, rowId }),
    ]).then(([res, record]) => {
      const newControls = res.template.controls.map(it => {
        if (it.attribute === 1) {
          return { ...it, value: record.titleName };
        }
        return it;
      });
      setControls(res.template.controls);
      const titleName = getTitleTextFromControls(newControls, undefined, undefined, {
        noMask: true,
      });
      setTitleName(titleName);
    });
  };

  return (
    <RecordLogDialogWrap title={titleName} width={650} visible={visible} onCancel={onCancel} footer={null}>
      {controls && (
        <WorksheetRocordLog
          appId={appId}
          rowId={rowId}
          worksheetId={worksheetId}
          showFilter={false}
          filterUniqueIds={filterUniqueIds}
          isGlobaLog={true}
          controls={controls}
        />
      )}
    </RecordLogDialogWrap>
  );
}
