import React, { Fragment, useCallback, useEffect, useRef, useContext, useState } from 'react';
import { Skeleton } from 'antd';
import cx from 'classnames';
import { connect } from 'react-redux';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { useKey } from 'react-use';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import { RecordFormContext } from 'worksheet/common/recordInfo/RecordForm';
import TableComp from './TableComp';
import Operate from './Operate';
import * as actions from './redux/action';
import { get, isFunction, isUndefined, pick } from 'lodash';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { v4 } from 'uuid';

const TableCon = styled.div`
  &.userSelectNone {
    * {
      user-select: none !important;
    }
  }
`;

const ErrorStatus = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  background-color: #f7f7f7;
  color: #9e9e9e;
  font-size: 13px;
`;

function RelateRecordTable(props) {
  const {
    mode = 'recordForm',
    saveSync,
    isSplit,
    formData,
    base = {},
    tableState = {},
    loading,
    control,
    records,
    useHeight,
    isDraft,
    onUpdateCell = () => {},
  } = props;
  const { updateWorksheetControls } = props;
  const { updateRecord, deleteRecords, refresh, updateBase, updateTableConfigByControl } = props;
  const { isTab, isInForm, allowEdit, controlPermission, relateWorksheetInfo } = base;
  if (loading) {
    return tableState.error ? (
      <ErrorStatus>{tableState.error}</ErrorStatus>
    ) : (
      <Skeleton
        style={{
          ...(isSplit && { overflow: 'auto', padding: '0 24px' }),
        }}
      />
    );
  }
  const tableCache = useRef({});
  const tableConRef = useRef();
  const [tableId] = useState(v4());
  const { width, recordbase = {}, iseditting } = useContext(RecordFormContext) || {};
  const { recordTitle } = recordbase;
  const smallMode = width < 500;
  const handleOpenRecordInfo = useCallback(
    args => {
      const { recordId, activeRelateTableControlId } = args;
      openRecordInfo({
        disableOpenRecordFromRelateRecord:
          get(window, 'shareState.isPublicRecord') || get(window, 'shareState.isPublicView'),
        showPrevNext: true,
        currentSheetRows: records.filter(r => r.rowid),
        from: 2,
        visible: true,
        appId: relateWorksheetInfo.appId,
        viewId: get(control, 'advancedSetting.openview') || control.viewId,
        recordId: recordId,
        activeRelateTableControlId: activeRelateTableControlId,
        worksheetId: relateWorksheetInfo.worksheetId,
        relationWorksheetId: base.worksheetId,
        rules: relateWorksheetInfo.rules,
        isDraft,
        updateRows: ([rowid], newRecord) => {
          updateRecord(newRecord);
        },
        projectId: relateWorksheetInfo.projectId,
        onClose: () => {
          window.activeTableId = tableId;
        },
        onDeleteSuccess: () => {
          if (!control.disabled && allowEdit && controlPermission.editable) {
            deleteRecords([recordId]);
          }
        },
      });
    },
    [control.controlId, records],
  );
  useEffect(() => {
    if (isUndefined(saveSync)) {
      return;
    }
    updateBase({
      saveSync,
    });
  }, [saveSync]);
  useEffect(() => {
    updateTableConfigByControl(control);
  }, [
    control.fieldPermission,
    control.controlPermissions,
    control.advancedSetting,
    control.disabled,
    control.enumDefault,
    control.enumDefault2,
  ]);
  useKey(
    'Shift',
    () => {
      tableCache.current.shiftActive = false;
      setTimeout(() => {
        if (!tableConRef.current) return;
        tableConRef.current.className = tableConRef.current.className.replace(' userSelectNone', '');
      }, 500);
    },
    { event: 'keyup' },
    [],
  );
  useKey(
    'Shift',
    () => {
      tableCache.current.shiftActive = true;
      if (!tableConRef.current) return;
      tableConRef.current.className = tableConRef.current.className + ' userSelectNone';
    },
    { event: 'keydown' },
    [],
  );
  useEffect(() => {
    if (isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, refresh);
    }
  }, []);
  return (
    <Fragment>
      {
        <Operate
          tableId={tableId}
          isDraft={isDraft}
          mode={mode}
          iseditting={iseditting}
          formData={formData}
          smallMode={smallMode}
          recordTitle={recordTitle}
          className={cx('mBottom10', { mTop10: !isSplit && isTab })}
          style={{
            ...(isSplit && { padding: '10px 24px' }),
          }}
          cache={tableCache}
          handleOpenRecordInfo={handleOpenRecordInfo}
          updateWorksheetControls={updateWorksheetControls}
        />
      }
      <TableCon
        className={cx({ flex: isSplit || useHeight, mTop30: smallMode && isInForm })}
        style={{
          ...(isSplit && { overflow: 'auto', padding: '0 24px' }),
        }}
        ref={tableConRef}
      >
        <TableComp
          iseditting={iseditting}
          tableId={tableId}
          control={control}
          useHeight={useHeight}
          handleOpenRecordInfo={handleOpenRecordInfo}
          updateWorksheetControls={updateWorksheetControls}
          cache={tableCache}
          onUpdateCell={onUpdateCell}
          isDraft={isDraft}
          formData={formData}
        />
      </TableCon>
      {isSplit && <div style={{ height: 30 }} />}
    </Fragment>
  );
}

RelateRecordTable.propTypes = {
  mode: string,
  base: shape({}),
  saveSync: bool,
  isSplit: bool,
  loading: bool,
  control: shape({}),
  records: arrayOf(shape({})),
  useHeight: bool,
  updateWorksheetControls: func,
  updateRecord: func,
  deleteRecords: func,
  updateBase: func,
  refresh: func,
  updateTableConfigByControl: func,
  onUpdateCell: func,
};

const mapStateToProps = state => ({
  ...state,
});
const mapDispatchToProps = dispatch => ({
  refresh: bindActionCreators(actions.refresh, dispatch),
  updateBase: bindActionCreators(actions.updateBase, dispatch),
  updateRecord: bindActionCreators(actions.updateRecord, dispatch),
  deleteRecords: bindActionCreators(actions.deleteRecords, dispatch),
  updateTableConfigByControl: bindActionCreators(actions.updateTableConfigByControl, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(RelateRecordTable);
