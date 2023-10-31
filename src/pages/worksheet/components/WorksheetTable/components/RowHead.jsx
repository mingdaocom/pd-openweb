import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { Checkbox, Menu, MenuItem, Tooltip } from 'ming-ui';
import { FlexCenter } from 'worksheet/components/Basics';
import RecordOperate from 'worksheet/components/RecordOperate';
import ChangeSheetLayout from 'worksheet/components/ChangeSheetLayout';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { handleRowData } from 'src/util/transControlDefaultValue';
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
  &.hover.hasBatch,
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
  color: #2196f3;
  border-radius: 4px;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

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
    rowHeadOnlyNum,
    isCharge,
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
    setHighLight = () => {},
    refreshWorksheetControls = () => {},
    onOpenRecord = () => {},
    columns,
  } = props;
  let { className } = props;
  const [selectAllPanelVisible, setSelectAllPanelVisible] = useState();
  const row = data[rowIndex] || {};
  const selected =
    canSelectAll && allWorksheetIsSelected ? !_.includes(selectedIds, row.rowid) : _.includes(selectedIds, row.rowid);
  function handleCheckAll(force) {
    if (canSelectAll && allWorksheetIsSelected) {
      onSelectAllWorksheet(false);
      if (force) {
        onSelect(data.map(item => item.rowid));
      }
      return;
    }
    if (selectedIds.length > 0 && !force) {
      onSelect([]);
    } else {
      onSelect(data.map(item => item.rowid));
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
      className={cx(className, 'flexRow noRightBorder', { selected, hideNumber: !showNumber, hasBatch })}
      style={style}
      readonly={readonly || !hasBatch}
      onClick={e => {
        if (e.target.classList.contains('cell')) {
          onOpenRecord();
        }
      }}
    >
      {rowIndex !== -1 && (
        <React.Fragment>
          {showOperate && !readonly && !isTrash && !isDraft ? (
            <RecordOperate
              {...{ appId, viewId, worksheetId, recordId: row.rowid, projectId, isCharge }}
              formdata={controls.map(c => ({ ...c, value: row[c.controlId] }))}
              shows={['share', 'print', 'copy', 'openinnew', 'recreate']}
              allowCopy={allowAdd && row.allowedit}
              allowDelete={row.allowdelete}
              sheetSwitchPermit={sheetSwitchPermit}
              popupAlign={{
                offset: [0, 4],
                points: ['tl', 'bl'],
              }}
              onUpdate={(rowdata, row, updatedControls) => {
                if (_.find(updatedControls, item => _.includes([10, 11], item.type) && /color/.test(item.value))) {
                  refreshWorksheetControls();
                }
                if (rowdata.isviewdata) {
                  updateRows([row.rowid], _.omit(rowdata, ['allowedit', 'allowdelete']));
                } else {
                  hideRows([row.rowid]);
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
              onRecreate={() => {
                handleRowData({
                  rowId: row.rowid,
                  worksheetId: worksheetId,
                  columns,
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
                    onAdd: record => {
                      setHighLight(tableId, rowIndex + 1);
                      handleAddSheetRow({ ...record }, row.rowid);
                      alert(_l('创建成功'));
                    },
                  });
                });
              }}
            />
          ) : (
            <span className="moreOperate" style={{ width: 24 }} />
          )}
          {(hasBatch || showNumber) && (
            <div className="numberCon" style={{ marginLeft: 10, width: numberWidth }}>
              {showNumber && <div className="number">{lineNumberBegin + rowIndex + 1}</div>}
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
          {layoutChangeVisible && <ChangeSheetLayout onSave={saveSheetLayout} onCancel={resetSheetLayout} />}
          <div className="topCheckbox" style={{ right: tableType === 'classic' ? 44 : 28, width: numberWidth }}>
            {hasBatch && (
              <div className="checkboxCon mTop3">
                <Checkbox
                  size="small"
                  clearselected={!!(data.length && selectedIds.length && selectedIds.length !== data.length)}
                  disabled={!data.length}
                  checked={
                    canSelectAll && allWorksheetIsSelected
                      ? !selectedIds.length
                      : !!data.length && selectedIds.length === data.length
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
                      offset: [-32, 10],
                    }}
                    action={['click']}
                    popup={
                      <Menu>
                        <MenuItem
                          onClick={e => {
                            e.stopPropagation();
                            handleCheckAll(true);
                            setSelectAllPanelVisible(false);
                          }}
                        >
                          {_l('选择本页记录%02053')}
                        </MenuItem>
                        <MenuItem
                          onClick={e => {
                            e.stopPropagation();
                            setSelectAllPanelVisible(false);
                            onSelectAllWorksheet(true);
                          }}
                        >
                          {_l('选择所有记录%02054')}
                        </MenuItem>
                        {(selectedIds.length || allWorksheetIsSelected) && (
                          <MenuItem
                            onClick={e => {
                              e.stopPropagation();
                              setSelectAllPanelVisible(false);
                              onReverseSelect();
                            }}
                          >
                            {_l('反选%02055')}
                          </MenuItem>
                        )}
                      </Menu>
                    }
                  >
                    <i className="icon icon-expand_more Hand" style={{ position: 'absolute', top: 5, right: -15 }}></i>
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
