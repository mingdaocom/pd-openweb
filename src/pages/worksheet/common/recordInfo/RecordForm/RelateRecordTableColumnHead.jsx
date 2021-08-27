import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Menu, MenuItem } from 'ming-ui';
import { fieldCanSort, getSortData } from 'worksheet/util';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';

export default function ColumnHead(props) {
  const {
    disabled,
    className,
    style,
    control,
    columnIndex,
    fixedColumnCount,
    isAsc,
    isLast,
    sheetHiddenColumnIds,
    clearHiddenColumn,
    hideColumn,
    changeSort,
    updateSheetColumnWidths,
    frozen,
    getPopupContainer,
  } = props;
  const itemType = control.type === 30 ? control.sourceControlType : control.type;
  const canSort = !disabled && fieldCanSort(itemType);
  return (
    <BaseColumnHead
      className={className}
      style={style}
      control={control}
      showDropdown
      isLast={isLast}
      isAsc={isAsc}
      changeSort={changeSort}
      updateSheetColumnWidths={updateSheetColumnWidths}
      getPopupContainer={getPopupContainer}
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
          <MenuItem
            onClick={() => {
              hideColumn(control.controlId);
              closeMenu();
            }}
          >
            <i className="icon icon-workflow_hide"></i>
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
};
