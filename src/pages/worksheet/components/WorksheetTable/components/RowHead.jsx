import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import { find, get, isEmpty } from 'lodash';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, Menu, MenuItem, Tooltip } from 'ming-ui';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { updateRecordLockStatus } from 'worksheet/common/recordInfo/crtl';
import { FlexCenter } from 'worksheet/components/Basics';
import ChangeSheetLayout from 'worksheet/components/ChangeSheetLayout';
import RecordOperate from 'worksheet/components/RecordOperate';
import { handleRowData } from 'src/utils/record';

const Con = styled.div`
  user-select: none;
  padding-left: 2px;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  font-size: 13px;
  color: #9e9e9e;
  padding: 0px !important;
  align-items: center;
  > * {
    flex: 0 0 auto;
  }
  .numberCon {
    display: inline-block;
    text-align: center;
  }
  .moreOperate {
    margin-left: 8px;
    visibility: hidden;
  }
  .checkbox {
    margin-top: 5px;
    display: none;
    .Checkbox-box {
      margin: 0px;
    }
  }
  .openRecord {
    visibility: hidden;
  }
  .topCheckbox {
    position: absolute;
    text-align: center;
    .checkboxCon {
      position: relative;
      display: inline-block;
      .Checkbox-box {
        margin: 0px;
      }
    }
  }
  .number {
    display: inline-block;
  }
  .showMore:hover {
    color: #757575;
  }
  &.rowHadFocus {
    .openRecord {
      visibility: visible;
    }
  }
  &.hover {
    .openRecord {
      visibility: visible;
    }
  }
  &.cell.noRightBorder {
    border-right: none !important;
  }
  &.hideNumber {
    .number {
      display: none;
    }
  }
  &.hover.hasBatch.recordOperateVisible,
  &.hover.hasBatch.showCheckbox,
  &.selected.hasBatch {
    .number {
      display: none;
    }
    .checkbox {
      display: inline-block;
    }
  }
  &.hideNumber {
    .number {
      display: none;
    }
    .checkbox {
      display: inline-block;
    }
  }
  &.hover {
    .moreOperate {
      visibility: visible;
    }
  }
`;

const OpenRecordBtn = styled(FlexCenter)`
  margin-left: 8px;
  font-size: 16px;
  width: 24px;
  height: 24px;
  color: #1677ff;
  border-radius: 4px;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

function getApplyToAllChecked(worksheetInfo, viewId) {
  const view = find(worksheetInfo.views, o => o.viewId === viewId);
  if (!view) {
    return false;
  }
  const viewListStyle = safeParse(get(view, 'advancedSetting.liststyle'));
  const worksheetInfoListStyle = safeParse(get(worksheetInfo, 'advancedSetting.liststyle'));
  return worksheetInfoListStyle.time > viewListStyle.time;
}
export default function RowHead(props) {
  const {
    tableType,
    hasBatch = true,
    showNumber = true,
    showOperate = true,
    numberWidth,
    readonly,
    isTrash,
    isDraft,
    isDraftTable,
    rowHeadOnlyNum,
    isCharge,
    isDevAndOps,
    tableId,
    layoutChangeVisible,
    style,
    selectedIds,
    canSelectAll,
    allWorksheetIsSelected,
    allowAdd,
    appId,
    viewId,
    worksheetId,
    view,
    projectId,
    controls = [],
    data,
    lineNumberBegin,
    rowIndex,
    updateRows,
    sheetSwitchPermit,
    hideRows,
    onSelect,
    onSelectAllWorksheet,
    handleAddSheetRow = () => {},
    onReverseSelect = () => {},
    saveSheetLayout,
    resetSheetLayout,
    worksheetInfo = {},
    setHighLight = () => {},
    refreshWorksheetControls = () => {},
    onOpenRecord = () => {},
    printCharge,
  } = props;
  let { className } = props;
  const [selectAllPanelVisible, setSelectAllPanelVisible] = useState();
  const row = data[rowIndex] || {};
  const groups = data.filter(r => r.rowid === 'groupTitle').map(r => _.omit(r, ['rows']));
  const selected =
    canSelectAll && allWorksheetIsSelected ? !_.includes(selectedIds, row.rowid) : _.includes(selectedIds, row.rowid);
  const recordOperateVisible = showOperate && !readonly && !isTrash && !isDraftTable;
  const dataLength = data.filter(r => r.rowid !== 'groupTitle').length;
  function handleCheckAll(force) {
    if (canSelectAll && allWorksheetIsSelected) {
      onSelectAllWorksheet(false);
      if (force) {
        onSelect(data.map(item => item.rowid).filter(r => r !== 'groupTitle' && r !== 'loadGroupMore'));
      }
      return;
    }
    if (selectedIds.length > 0 && !force) {
      onSelect([]);
    } else {
      onSelect(data.map(item => item.rowid).filter(r => r !== 'groupTitle' && r !== 'loadGroupMore'));
    }
  }
  if (isEmpty(row) && rowIndex > -1) {
    return <Con className={cx(className, 'noRightBorder', { selected })} style={style} />;
  }

  return (
    <Con
      tableType={tableType}
      rowHeadOnlyNum={rowHeadOnlyNum}
      showOperate={showOperate}
      className={cx(className, 'flexRow noRightBorder', {
        selected,
        hideNumber: !showNumber,
        hasBatch,
        recordOperateVisible,
        showCheckbox: !readonly && hasBatch,
      })}
      style={style}
      readonly={readonly || !hasBatch}
      onClick={e => {
        if (e.target.classList.contains('control-rowHead')) {
          onOpenRecord();
        }
      }}
    >
      {rowIndex !== -1 && (
        <React.Fragment>
          {recordOperateVisible ? (
            <RecordOperate
              {...{
                appId,
                viewId,
                worksheetId,
                recordId: row.rowid,
                groupControl: row.group?.control,
                currentGroupKey: row.group?.key,
                groups,
                projectId,
                isCharge,
                isDevAndOps,
                isDraft,
                printCharge,
                view,
              }}
              formdata={controls.map(c => ({ ...c, value: row[c.controlId] }))}
              shows={['share', 'print', 'copy', 'copyId', 'openinnew', 'recreate', 'fav', 'lock']}
              allowCopy={allowAdd && row.allowedit}
              allowEdit={row.allowedit}
              allowDelete={row.allowdelete}
              allowRecreate={allowAdd}
              isAdmin={worksheetInfo.roleType === 2}
              entityName={worksheetInfo.entityName}
              sheetSwitchPermit={sheetSwitchPermit}
              popupAlign={{
                offset: [0, 4],
                points: ['tl', 'bl'],
              }}
              isRecordLock={row.sys_lock}
              updateRecordLock={() => {
                updateRecordLockStatus(
                  {
                    appId,
                    viewId,
                    worksheetId,
                    recordId: row.rowid,
                    updateType: row.sys_lock ? 42 : 41,
                  },
                  (err, resdata) => {
                    if (resdata.isviewdata) {
                      updateRows([row.rowid], {
                        ...resdata,
                        allowedit: row.allowedit,
                        allowdelete: row.allowdelete,
                      });
                      alert(
                        resdata.sys_lock
                          ? _l('%0锁定成功', worksheetInfo.entityName)
                          : _l('%0已解锁', worksheetInfo.entityName),
                      );
                    } else {
                      hideRows([row.rowid]);
                    }
                  },
                );
              }}
              onUpdate={(rowdata, newRow, updatedControls) => {
                if (!newRow) {
                  newRow = rowdata;
                }
                if (_.find(updatedControls, item => _.includes([10, 11], item.type) && /color/.test(item.value))) {
                  refreshWorksheetControls();
                }
                if (rowdata.isviewdata) {
                  updateRows([newRow.rowid], _.omit(rowdata, ['allowedit', 'allowdelete']));
                } else {
                  hideRows([newRow.rowid]);
                }
              }}
              onCopySuccess={(...args) => {
                setHighLight(tableId, rowIndex + 1);
                handleAddSheetRow(...args);
              }}
              onDeleteSuccess={() => {
                hideRows([row.rowid]);
              }}
              onPopupVisibleChange={value => {
                if (value) {
                  setHighLight(tableId, rowIndex);
                }
              }}
              onRecreate={({ group } = {}) => {
                handleRowData({
                  rowId: row.rowid,
                  worksheetId: worksheetId,
                  columns: controls,
                }).then(res => {
                  const { defaultData, defcontrols } = res;
                  addRecord({
                    worksheetId,
                    appId,
                    viewId,
                    defaultFormData: defaultData,
                    defaultFormDataEditable: true,
                    directAdd: false,
                    writeControls: defcontrols,
                    worksheetInfo,
                    isDraft,
                    onAdd: record => {
                      setHighLight(tableId, rowIndex + 1);
                      handleAddSheetRow({ ...record, group }, row.rowid);
                      alert(_l('创建成功'));
                    },
                  });
                });
              }}
            />
          ) : (
            <span className="moreOperate" style={{ width: rowHeadOnlyNum ? 0 : 24 }} />
          )}
          {(hasBatch || showNumber) && (
            <div className="numberCon" style={{ marginLeft: 10, width: numberWidth }}>
              {showNumber && <div className="number">{lineNumberBegin + (row.rowIndexNumber || rowIndex + 1)}</div>}
              {!readonly && hasBatch && (
                <div className="checkbox">
                  <Checkbox
                    checked={selected}
                    size="small"
                    onClick={() => {
                      if (selectedIds.indexOf(row.rowid) > -1) {
                        onSelect(
                          selectedIds.filter(s => s !== row.rowid),
                          row.rowid,
                        );
                      } else {
                        onSelect(_.uniqBy(selectedIds.concat(row.rowid)), row.rowid);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </React.Fragment>
      )}
      {!readonly && rowIndex === -1 && (
        <Fragment>
          {layoutChangeVisible && (
            <ChangeSheetLayout
              isSheetView
              onSave={saveSheetLayout}
              onCancel={resetSheetLayout}
              applyToAllChecked={getApplyToAllChecked(worksheetInfo, viewId)}
            />
          )}
          <div className="topCheckbox" style={{ right: tableType === 'classic' ? 46 : 30, width: numberWidth }}>
            {hasBatch && (
              <div className="checkboxCon mTop3">
                <Checkbox
                  size="small"
                  clearselected={!!(dataLength && selectedIds.length && selectedIds.length !== dataLength)}
                  disabled={!dataLength}
                  checked={
                    canSelectAll && allWorksheetIsSelected
                      ? !selectedIds.length
                      : !!dataLength && selectedIds.length === dataLength
                  }
                  onClick={(checked, value, e) => {
                    e.stopPropagation();
                    handleCheckAll();
                  }}
                />
                {canSelectAll && (
                  <Trigger
                    popupVisible={selectAllPanelVisible}
                    onPopupVisibleChange={visible => {
                      setSelectAllPanelVisible(visible);
                    }}
                    popupAlign={{
                      points: ['tl', 'bl'],
                      offset: [2, 10],
                    }}
                    action={['hover']}
                    popup={
                      <Menu>
                        <MenuItem
                          onClick={e => {
                            e.stopPropagation();
                            setSelectAllPanelVisible(false);
                            onSelectAllWorksheet(true);
                          }}
                        >
                          {_l('选择所有')}
                        </MenuItem>
                        <MenuItem
                          onClick={e => {
                            e.stopPropagation();
                            setSelectAllPanelVisible(false);
                            onReverseSelect();
                          }}
                        >
                          {_l('反选本页')}
                        </MenuItem>
                      </Menu>
                    }
                  >
                    <i
                      className="icon icon-expand_more Hand Font20 showMore"
                      style={{ position: 'absolute', top: 2, right: -22 }}
                    ></i>
                  </Trigger>
                )}
              </div>
            )}
          </div>
        </Fragment>
      )}
      {tableType === 'classic' &&
        (() => {
          const btn = (
            <OpenRecordBtn className="openRecord" onClick={() => onOpenRecord()}>
              <i className="icon icon-worksheet_enlarge Hand ThemeHoverColor3" />
            </OpenRecordBtn>
          );

          return localStorage.getItem('row_head_no_show_tip') !== '1' ? (
            <Tooltip
              destroyPopupOnHide
              popupPlacement="bottom"
              text={() => (document.querySelector('.cell.focus') ? _l('打开记录（空格）') : _l('打开记录'))}
              onToolTipVisibleChange={visible => {
                if (visible) {
                  setTimeout(() => localStorage.setItem('row_head_no_show_tip', '1'), 1000);
                }
              }}
            >
              {btn}
            </Tooltip>
          ) : (
            btn
          );
        })()}
    </Con>
  );
}

RowHead.propTypes = {
  readonly: PropTypes.bool,
  isTrash: PropTypes.bool,
  isDraft: PropTypes.bool,
  style: PropTypes.shape({}),
  allWorksheetIsSelected: PropTypes.bool,
  appId: PropTypes.string,
  viewId: PropTypes.string,
  worksheetId: PropTypes.string,
  projectId: PropTypes.string,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  canSelectAll: PropTypes.bool,
  className: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  hideRows: PropTypes.func,
  lineNumberBegin: PropTypes.number,
  onSelect: PropTypes.func,
  onSelectAllWorksheet: PropTypes.func,
  rowIndex: PropTypes.number,
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  updateRows: PropTypes.func,
  handleAddSheetRow: PropTypes.func,
  setHighLight: PropTypes.func,
  refreshWorksheetControls: PropTypes.func,
};
