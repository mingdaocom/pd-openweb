import React, { forwardRef, Fragment, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { useKey } from 'react-use';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _, { pick } from 'lodash';
import styled from 'styled-components';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import ChildTableContext from 'worksheet/components/ChildTable/ChildTableContext';
import {
  getTitleControlIdFromRelateControl,
  getTitleTextFromRelateControl,
} from 'src/components/newCustomFields/tools/utils';
import { selectRecords } from 'src/components/SelectRecords';
import { searchRecordInDialog } from 'src/pages/worksheet/components/SearchRelateRecords';
import { browserIsMobile } from 'src/utils/common';
import { addBehaviorLog } from 'src/utils/project';

function getCellHeight(texts = [], width) {
  let result;
  const div = document.createElement('div');
  div.style.position = 'absolute';
  // div.style.left = '10px';
  // div.style.top = '10px';
  div.style.background = '#fff';
  div.style.zIndex = '999';
  div.style.left = '-10000px';
  div.style.bottom = '-10000px';
  div.style.width = width + 'px';
  div.style.paddingRight = '6px';
  document.body.appendChild(div);
  div.innerHTML = texts
    .map(
      text =>
        `<div style="display:inline-block;font-size: 13px;margin: 6px 0 0 6px;padding: 0 10px;max-width: ${
          width - 46
        }px"><span class="name InlineBlock ellipsis" style="max-width: 100%;">${text}</span></div>`,
    )
    .join('');
  result = div.clientHeight;
  document.body.removeChild(div);
  return result;
}

function getCellMaxShowNum(texts = [], { width = 100, maxHeight = 34 } = {}) {
  let result = texts.length;
  let needLimit = false;
  let i = 1;
  while (i <= texts.length) {
    const cellHeight = getCellHeight(texts.slice(0, i), width);
    if (cellHeight > maxHeight) {
      needLimit = true;
      result = i - 1;
      break;
    }
    i++;
  }
  if (!needLimit) {
    return;
  }
  const lastHeight = getCellHeight(texts.slice(0, result).concat('='), width);
  return result < texts.length && lastHeight > maxHeight ? result : result + 1;
}

const Con = styled.div`
  overflow: hidden;
  padding-bottom: 6px;
  &.isediting {
    background-color: #fff;
  }
`;

const Tag = styled.div`
  position: relative;
  display: inline-block;
  line-height: 21px;
  background-color: rgba(0, 100, 240, 0.08);
  border-radius: 3px;
  padding: 0 10px;
  margin: 6px 0 0 6px;
  &.isediting.allowRemove {
    padding-right: 24px;
  }
  &.allowOpenRecord:hover {
    color: #2196f3;
    background-color: rgba(33, 150, 243, 0.16);
    cursor: pointer;
  }
  .icon-close {
    cursor: pointer;
    position: absolute;
    right: 4px;
    top: 2px;
    color: #9d9d9d;
    font-size: 16px;
    cursor: pointer;
  }
  &.icon {
    font-size: 14px;
    color: #757575;
    cursor: pointer;
    padding: 0;
    height: 21px;
    width: 21px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    &:hover {
      background: rgb(33, 150, 243, 0.1);
    }
  }
`;

function getDefaultRelateSheetValue({ worksheetId, control, recordId, rowFormData } = {}) {
  try {
    const { controlId } = control;
    const formDataArray = typeof rowFormData === 'function' ? rowFormData() : rowFormData;
    const titleControl = _.find(formDataArray, control => control.attribute === 1);
    const defaultRelatedSheetValue = {
      name: titleControl.value,
      sid: recordId,
      type: 8,
      sourcevalue: JSON.stringify({
        ..._.assign(...formDataArray.map(c => ({ [c.controlId]: c.value }))),
        [titleControl.controlId]: titleControl.value,
        rowid: recordId,
      }),
    };
    if (titleControl.type === 29) {
      try {
        const cellData = JSON.parse(titleControl.value);
        defaultRelatedSheetValue.name = cellData[0].name;
      } catch (err) {
        defaultRelatedSheetValue.name = '';
      }
    }
    return {
      worksheetId,
      relateSheetControlId: controlId,
      value: defaultRelatedSheetValue,
    };
  } catch (err) {
    return;
  }
}

export default forwardRef(function RelateRecordTags(props, ref) {
  const {
    from,
    appId,
    isDraft,
    disabled,
    isediting,
    rowIndex,
    allowOpenRecord,
    style = {},
    control,
    worksheetId,
    recordId,
    rowFormData = () => [],
    onClose = () => {},
    onCloseDialog = () => {},
    onOpenDialog = () => {},
  } = props;
  const { rows } = useContext(ChildTableContext) || {};
  const [changed, setChanged] = useState(false);
  const [count, setCount] = useState(props.count || 0);
  const [records, setRecords] = useState(props.records || []);
  const [addedIds, setAddedIds] = useState(props.addedIds || []);
  const [deletedIds, setDeletedIds] = useState(props.deletedIds || []);
  const conRef = useRef(null);
  const cache = useRef({});
  const allowNewRecord = control.enumDefault2 !== 1 && control.enumDefault2 !== 11 && !window.isPublicWorksheet;
  const multiple = control.enumDefault === 2;
  const allowRemove = control.advancedSetting.allowcancel !== '0' || !multiple;
  const allowSelect = control.enumDefault2 !== 10 && control.enumDefault2 !== 11;
  const canAdd = control.enumDefault === 2 ? count < 50 : records.length === 0;
  const isMobile = browserIsMobile();
  let maxShowNum = getCellMaxShowNum(
    records.map(r => getTitleTextFromRelateControl(control, r)),
    { width: style.width, maxHeight: style.height },
  );
  useClickAway(conRef, e => {
    if (!cache.current.isActive) {
      onClose({ deletedIds, addedIds, records, count, changed });
    }
  });
  function openDialogCallback() {
    cache.current.isActive = true;
    onOpenDialog();
  }
  function closeDialogCallback() {
    cache.current.isActive = false;
    onCloseDialog();
  }
  useEffect(() => {
    setRecords(props.records);
  }, [
    JSON.stringify(
      props.records.map(r => pick(r, ['rowid'].concat(getTitleControlIdFromRelateControl(control) || []))),
    ),
  ]);
  function handleOpenRecord({ appId, worksheetId, recordId, viewId }) {
    openDialogCallback();
    openRecordInfo({
      appId: appId,
      worksheetId: worksheetId,
      recordId,
      viewId,
      relationWorksheetId: props.worksheetId,
      onClose: closeDialogCallback,
    });
  }
  function handleSearchRecords() {
    openDialogCallback();
    searchRecordInDialog({
      from,
      disabled: disabled || !allowRemove,
      title: control.controlName,
      worksheetId: worksheetId,
      controlId: control.controlId,
      recordId,
      control,
      controls: control.relationControls,
      hiddenRecordIds: deletedIds,
      onlySearchLoad: false,
      sourceEntityName: control.sourceEntityName,
      allowlink: (control.advancedSetting || {}).allowlink,
      onCardClick:
        !allowOpenRecord || !recordId
          ? () => {}
          : r => {
              handleOpenRecord({
                viewId: _.get(control, 'advancedSetting.openview') || control.viewId,
                worksheetId: control.dataSource,
                recordId: r.rowid,
              });
            },
      onDelete: deletedRecord => {
        setChanged(true);
        setRecords(records.filter(r => r.rowid !== deletedRecord.rowid));
        setDeletedIds([...deletedIds, deletedRecord.rowid]);
        setCount(count - 1);
      },
      onCancel: closeDialogCallback,
    });
  }
  function handleSelectRecords() {
    if (!allowSelect || !canAdd) {
      return;
    }
    openDialogCallback();
    const needIgnoreRowIds =
      control.unique || control.uniqueInRecord
        ? (rows || []).map(r => _.get(safeParse(r[control.controlId], 'array'), '0.sid')).filter(_.identity)
        : [];
    selectRecords({
      // canSelectAll: true,
      appId,
      multiple,
      control,
      allowNewRecord,
      viewId: control.viewId,
      parentWorksheetId: worksheetId,
      controlId: control.controlId,
      recordId,
      worksheetId: control.dataSource,
      filterRowIds: records
        .map(r => r.rowid)
        .concat(needIgnoreRowIds)
        .concat(control.dataSource === worksheetId ? recordId : []),
      ignoreRowIds: deletedIds,
      selectedCount: count,
      maxCount: 50,
      formData: _.isFunction(rowFormData) ? rowFormData() : rowFormData,
      defaultRelatedSheet: getDefaultRelateSheetValue({ worksheetId, control, recordId, rowFormData }),
      isDraft: from === 21 || isDraft,
      onOk: async selectedRecords => {
        setChanged(true);
        setRecords(records.concat(selectedRecords));
        setAddedIds([...addedIds, ...selectedRecords.map(r => r.rowid)]);
        setCount(count + selectedRecords.length);
      },
      onClose: closeDialogCallback,
    });
  }
  useImperativeHandle(ref, () => ({
    searchRecords: handleSearchRecords,
    selectRecords: handleSelectRecords,
  }));
  useKey('Enter', e => {
    if (e.shiftKey && isediting) {
      handleSearchRecords();
    }
  });
  return (
    <Con
      ref={conRef}
      className={cx('cellRelateRecordTags', { isediting, cellControlEdittingStatus: isediting })}
      style={
        isediting
          ? {
              width: style.width,
              ...(rowIndex === 0 && style.height < 56
                ? {
                    height: 56,
                    overflow: 'auto',
                  }
                : {
                    minHeight: style.height,
                  }),
            }
          : {
              width: style.width,
            }
      }
    >
      {(!maxShowNum || maxShowNum >= count || isediting ? records : records.slice(0, maxShowNum - 1)).map(
        (record, i) => {
          const text = getTitleTextFromRelateControl(control, record);
          return (
            <Tag
              className={cx('ellipsis', {
                isediting,
                allowOpenRecord: allowOpenRecord && record.rowid && !/^temp/.test(record.rowid),
                allowRemove,
              })}
              style={{ maxWidth: records.length < count ? 'calc(100% - 40px)' : 'calc(100% - 13px)' }}
              key={i}
              title={text}
              onClick={e => {
                if (!record.rowid || /^temp/.test(record.rowid) || isMobile) {
                  return;
                }
                e.stopPropagation();
                if (allowOpenRecord) {
                  addBehaviorLog('worksheetRecord', control.dataSource, { rowId: record.rowid }); // 埋点
                  handleOpenRecord({
                    viewId: _.get(control, 'advancedSetting.openview') || control.viewId,
                    worksheetId: control.dataSource,
                    recordId: record.rowid,
                  });
                }
              }}
            >
              {text}
              {isediting && allowRemove && (
                <i
                  className="icon-close"
                  onClick={e => {
                    e.stopPropagation();
                    setChanged(true);
                    setRecords(records.filter(r => r.rowid !== record.rowid));
                    setDeletedIds([...deletedIds, record.rowid]);
                    setCount(count - 1);
                  }}
                ></i>
              )}
            </Tag>
          );
        },
      )}
      <Fragment>
        {records.length < count && (
          <Tooltip title={!isediting ? undefined : _l('查看全部(Shift+Enter)')} placement="bottom">
            <Tag
              className="icon moreRecords"
              onClick={e => {
                if (isMobile) {
                  return;
                }
                e.stopPropagation();
                handleSearchRecords();
              }}
            >
              <i className="icon icon-more_horiz" />
            </Tag>
          </Tooltip>
        )}
        {isediting && (multiple ? count < 50 : records.length === 0) && (allowNewRecord || allowSelect) && (
          <Tag
            className="icon selectRecords"
            onClick={e => {
              e.stopPropagation();
              if (allowSelect) {
                handleSelectRecords();
              } else if (allowNewRecord) {
                openDialogCallback();
                addRecord({
                  showFillNext: true,
                  directAdd: true,
                  className: 'worksheetRelateNewRecordFromTags',
                  worksheetId: control.dataSource,
                  addType: 2,
                  entityName: control.sourceEntityName,
                  filterRelateSheetIds: [control.dataSource],
                  filterRelatesheetControlIds: [control.controlId],
                  masterRecordRowId: recordId,
                  isDraft,
                  defaultRelatedSheet: getDefaultRelateSheetValue({ worksheetId, control, recordId, rowFormData }),
                  onAdd: record => {
                    setChanged(true);
                    setRecords(records.concat(record));
                    setAddedIds([...addedIds, record.rowid]);
                    setCount(count + 1);
                    closeDialogCallback();
                  },
                  onCloseDialog: closeDialogCallback,
                });
              }
            }}
          >
            <i className="icon icon-plus" />
          </Tag>
        )}
      </Fragment>
    </Con>
  );
});
