import React from 'react';
import PropTypes from 'prop-types';
import { emitter } from 'worksheet/util';
import cx from 'classnames';
import { Menu, MenuItem } from 'ming-ui';
import { CONTROL_EDITABLE_WHITELIST } from 'worksheet/constants/enum';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import { fieldCanSort, getSortData } from 'worksheet/util';
import { CONTROL_FILTER_WHITELIST } from 'worksheet/common/WorkSheetFilter/enum';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import _, { get } from 'lodash';

import { controlCanEdit } from 'worksheet/common/BatchEditRecord/BatchEditRecord.jsx';

export default function ColumnHead(props) {
  const {
    iseditting,
    isCustomButtonFillRecord,
    disabled,
    isNewRecord,
    className,
    style,
    control,
    columnIndex,
    fixedColumnCount,
    isAsc,
    isLast,
    tableId,
    isRelationRecord,
    selectedRowIds = [],
    sheetHiddenColumnIds = [],
    clearHiddenColumn,
    hideColumn,
    changeSort,
    updateSheetColumnWidths,
    frozen,
    getPopupContainer,
    onShowFullValue,
    handleBatchUpdateRecords,
    isDraft,
    hideFilter,
  } = props;
  const itemType = control.type === 30 ? control.sourceControlType : control.type;
  const filterWhiteKeys = _.flatten(
    Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
  );
  let canFilter = _.includes(filterWhiteKeys, itemType);
  if ((control.type === 30 && control.strDefault === '10') || hideFilter) {
    canFilter = false;
  }
  const canSort = !disabled && fieldCanSort(itemType);
  const canEdit = controlCanEdit(control);
  const maskData =
    !(_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) &&
    _.get(control, 'advancedSetting.datamask') === '1' &&
    _.get(control, 'advancedSetting.isdecrypt') === '1';

  return (
    <BaseColumnHead
      disableSort={disabled}
      className={className}
      style={style}
      control={control}
      showDropdown
      isLast={isLast}
      isAsc={isAsc}
      changeSort={changeSort}
      updateSheetColumnWidths={updateSheetColumnWidths}
      getPopupContainer={getPopupContainer}
      isDraft={isDraft}
      renderPopup={({ closeMenu }) => (
        <Menu className="worksheetColumnHeadMenu" style={{ width: 180 }} onClickAway={closeMenu}>
          {canSort &&
            getSortData(itemType, control).map(item => (
              <MenuItem
                key={item.value}
                onClick={() => {
                  changeSort(item.value === 2);
                  closeMenu();
                }}
              >
                <i className={cx('icon', item.value === 1 ? 'icon-descending-order2' : 'icon-ascending-order2')}></i>
                {item.text}
              </MenuItem>
            ))}
          {maskData && (
            <MenuItem onClick={onShowFullValue}>
              <i className="icon icon-eye_off"></i>
              {_l('解密')}
            </MenuItem>
          )}
          {canFilter &&
            !iseditting &&
            !isCustomButtonFillRecord &&
            !isNewRecord &&
            !selectedRowIds.length &&
            !get(window, 'shareState.shareId') &&
            !isRelationRecord && (
              <MenuItem
                onClick={() => {
                  emitter.emit(tableId, control);
                  closeMenu();
                }}
              >
                <i className="icon icon-worksheet_filter"></i>
                {_l('筛选')}
              </MenuItem>
            )}
          <MenuItem
            onClick={() => {
              hideColumn(control.controlId);
              closeMenu();
            }}
          >
            <i className="icon icon-visibility_off"></i>
            {_l('隐藏')}
          </MenuItem>
          {!!sheetHiddenColumnIds.length && (
            <MenuItem
              onClick={() => {
                clearHiddenColumn();
                closeMenu();
              }}
            >
              <i className="icon icon-eye"></i>
              {_l('显示所有列')}
            </MenuItem>
          )}
          {columnIndex < 6 && fixedColumnCount !== columnIndex + 1 && (
            <MenuItem
              onClick={() => {
                frozen(columnIndex);
                closeMenu();
              }}
            >
              <i className="icon icon-task-new-locked"></i>
              {_l('冻结')}
            </MenuItem>
          )}
          {fixedColumnCount > 1 && columnIndex < fixedColumnCount && (
            <MenuItem
              onClick={() => {
                frozen(0);
                closeMenu();
              }}
            >
              <i className="icon icon-task-new-no-locked"></i>
              {_l('解冻所有列')}
            </MenuItem>
          )}
          {canEdit && selectedRowIds.length && !get(window, 'shareState.shareId') && (
            <MenuItem
              onClick={() => {
                handleBatchUpdateRecords(control);
                closeMenu();
              }}
            >
              <i className="icon icon-hr_edit"></i>
              {_l('编辑选中记录')}
            </MenuItem>
          )}
        </Menu>
      )}
    />
  );
}

ColumnHead.propTypes = {
  className: PropTypes.string,
  columnIndex: PropTypes.number,
  style: PropTypes.shape({}),
  isAsc: PropTypes.bool,
  isLast: PropTypes.bool,
  control: PropTypes.shape({
    controlId: PropTypes.any,
    sourceControlType: PropTypes.any,
    type: PropTypes.number,
  }),
  fixedColumnCount: PropTypes.number,
  frozen: PropTypes.func,
  hideColumn: PropTypes.func,
  sheetHiddenColumnIds: PropTypes.arrayOf(PropTypes.string),
  clearHiddenColumn: PropTypes.func,
  changeSort: PropTypes.func,
  updateSheetColumnWidths: PropTypes.func,
  handleBatchUpdateRecords: PropTypes.func,
  getPopupContainer: PropTypes.func,
  onShowFullValue: PropTypes.func,
};
