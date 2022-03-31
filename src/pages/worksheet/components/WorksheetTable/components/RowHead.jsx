import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { Checkbox, Menu, MenuItem, Dialog } from 'ming-ui';
import RecordOperate from 'worksheet/components/RecordOperate';
import ChangeSheetLayout from 'worksheet/components/ChangeSheetLayout';
import { isEmpty } from 'lodash';

const Con = styled.div`
  display: inline-block;
  user-select: none;
  padding: ${({ rowHeadOnlyNum }) => (rowHeadOnlyNum ? '0 12px !important' : '0 24px 0 40px !important')};
  font-size: 13px;
  line-height: 34px;
  text-align: center;
  color: #9e9e9e;
  .moreOperate {
    position: absolute;
    left: 8px;
    top: 5px;
  }
  .checkbox,
  .moreOperate {
    display: none;
    .Checkbox-box {
      margin: 0px;
    }
  }
  .topCheckbox {
    .checkboxCon {
      position: relative;
      display: inline-block;
      .Checkbox-box {
        margin: 0px;
      }
    }
  }
  ${({ readonly }) =>
    !readonly &&
    `
  &.hover,
  &.selected {
    .number {
      display: none;
    }
    .checkbox {
      display: inline-block;
    }
  }
  &.hover {
    .moreOperate {
      display: inline-block;
    }
  }`}
`;

export default function RowHead(props) {
  const {
    readonly,
    isTrash,
    rowHeadOnlyNum,
    isCharge,
    tableId,
    layoutChangeVisible,
    className,
    style,
    selectedIds,
    canSelectAll,
    allWorksheetIsSelected,
    allowAdd,
    appId,
    viewId,
    worksheetId,
    projectId,
    columns = [],
    data,
    lineNumberBegin,
    rowIndex,
    updateRows,
    sheetSwitchPermit,
    customButtons,
    hideRows,
    onSelect,
    onSelectAllWorksheet,
    handleAddSheetRow = () => {},
    onReverseSelect = () => {},
    saveSheetLayout,
    resetSehetLayout,
    setHighLight = () => {},
    refreshWorksheetControls = () => {},
  } = props;
  const [selectAllPanelVisible, setSelectAllPanelVisible] = useState();
  const row = data[rowIndex - 1] || {};
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
  if (isEmpty(row) && rowIndex !== 0) {
    return <Con className={cx(className, { selected })} style={style} />;
  }
  return (
    <Con rowHeadOnlyNum={rowHeadOnlyNum} className={cx(className, { selected })} style={style} readonly={readonly}>
      {rowIndex !== 0 && (
        <React.Fragment>
          {!readonly && !isTrash && (
            <RecordOperate
              {...{ appId, viewId, worksheetId, recordId: row.rowid, projectId, isCharge }}
              formdata={columns.map(c => ({ ...c, value: row[c.controlId] }))}
              shows={['share', 'print', 'copy', 'openinnew']}
              allowCopy={allowAdd}
              defaultCustomButtons={customButtons}
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
            />
          )}
          <div className="number">{lineNumberBegin + rowIndex}</div>
          {!readonly && (
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
        </React.Fragment>
      )}
      {!readonly && rowIndex === 0 && (
        <div className="topCheckbox">
          {layoutChangeVisible && <ChangeSheetLayout onSave={saveSheetLayout} onCancel={resetSehetLayout} />}
          <div className="checkboxCon">
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
                      {_l('选择本页记录')}
                    </MenuItem>
                    <MenuItem
                      onClick={e => {
                        e.stopPropagation();
                        setSelectAllPanelVisible(false);
                        onSelectAllWorksheet(true);
                      }}
                    >
                      {_l('选择所有记录')}
                    </MenuItem>
                    {(selectedIds.length || allWorksheetIsSelected) && (
                      <MenuItem
                        onClick={e => {
                          e.stopPropagation();
                          setSelectAllPanelVisible(false);
                          onReverseSelect();
                        }}
                      >
                        {_l('反选')}
                      </MenuItem>
                    )}
                  </Menu>
                }
              >
                <i className="icon icon-expand_more Hand" style={{ position: 'absolute', top: 12, right: -17 }}></i>
              </Trigger>
            )}
          </div>
        </div>
      )}
    </Con>
  );
}

RowHead.propTypes = {
  readonly: PropTypes.bool,
  isTrash: PropTypes.bool,
  style: PropTypes.shape({}),
  allWorksheetIsSelected: PropTypes.bool,
  appId: PropTypes.string,
  viewId: PropTypes.string,
  worksheetId: PropTypes.string,
  projectId: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.shape({})),
  canSelectAll: PropTypes.bool,
  className: PropTypes.string,
  customButtons: PropTypes.arrayOf(PropTypes.shape({})),
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
