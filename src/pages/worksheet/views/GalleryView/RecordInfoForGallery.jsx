import React from 'react';
import _ from 'lodash';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';

export default function (props) {
  const { base, worksheetInfo, galleryview, sheetSwitchPermit, views, state, onChangeState, updateRecordEvent } = props;
  const { gallery = [] } = galleryview;
  const { recordId, rowKey } = state;
  const { viewId, appId, worksheetId } = base;
  const currentView = views.find(o => o.viewId === base.viewId) || {};

  const isGroup = _.get(currentView, 'advancedSetting.groupsetting');
  const list = isGroup ? (gallery.find(o => o.key === rowKey) || {}).rows.map(o => safeParse(o)) : gallery;

  const recordInfo = {
    visible: true,
    projectId: worksheetInfo.projectId,
    appId,
    viewId,
    worksheetId,
    currentSheetRows: list,
    enablePayment: worksheetInfo.enablePayment,
    rowId: recordId,
  };
  return (
    <RecordInfoWrapper
      {...recordInfo}
      sheetSwitchPermit={sheetSwitchPermit} // 表单权限
      allowAdd={worksheetInfo.allowAdd}
      showPrevNext={true}
      from={1}
      hideRecordInfo={() => {
        onChangeState({ recordInfoVisible: false, rowKey: '' });
        updateRecordEvent({ worksheetId, recordId, rowKey });
      }}
      view={currentView}
      recordId={recordId}
      rules={worksheetInfo.rules}
      updateSuccess={(ids, updated, data) => {
        props.updateRow(data, rowKey);
      }}
      onDeleteSuccess={() => {
        // 删除行数据后重新加载页面
        props.deleteRow(recordId, rowKey);
        onChangeState({ recordInfoVisible: false, rowKey: '' });
      }}
      handleAddSheetRow={data => {
        props.updateRow(data, rowKey);
        onChangeState({ recordInfoVisible: false, rowKey: '' });
      }}
      hideRows={recordIds => {
        setTimeout(() => {
          recordIds.forEach(props.deleteRow);
        }, 100);
      }}
      updateRows={(ids, newItem) => {
        newItem?.rowid && props.updateRow(newItem, rowKey);
      }}
    />
  );
}
