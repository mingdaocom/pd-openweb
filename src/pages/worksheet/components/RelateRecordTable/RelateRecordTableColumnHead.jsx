import React from 'react';
import cx from 'classnames';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import { fieldCanSort, getSortData } from 'src/utils/domain/control/sort';
import { controlBatchCanEdit } from 'src/utils/domain/control/state';
import { CONTROL_FILTER_WHITELIST } from 'src/utils/domain/worksheet/filterConstants';
import { emitter } from 'src/utils/platform/browser/dom';

const maxAllowFrozenColumnIndex = 10;

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
  const canEdit = controlBatchCanEdit(control);
  const maskData =
    !(
      _.get(window, 'shareState.isPublicView') ||
      _.get(window, 'shareState.isPublicPage') ||
      _.get(window, 'shareState.isPublicRecord')
    ) &&
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
      renderPopup={({ closeMenu }) => ({
        style: { width: 180 },
        items: [
          ...(canSort
            ? getSortData(itemType, control).map(item => ({
                key: `sort-${item.value}`,
                icon: (
                  <i className={cx('icon', item.value === 1 ? 'icon-descending-order2' : 'icon-ascending-order2')} />
                ),
                label: item.text,
                onClick: () => {
                  changeSort(item.value === 2);
                  closeMenu();
                },
              }))
            : []),
          maskData && {
            key: 'decode',
            icon: <i className="icon icon-eye_off" />,
            label: _l('解码'),
            onClick: onShowFullValue,
          },
          canFilter &&
            !iseditting &&
            !isCustomButtonFillRecord &&
            !isNewRecord &&
            !selectedRowIds.length &&
            !get(window, 'shareState.shareId') &&
            !isRelationRecord && {
              key: 'filter',
              icon: <i className="icon icon-worksheet_filter" />,
              label: _l('筛选'),
              onClick: () => {
                emitter.emit(tableId, control);
                closeMenu();
              },
            },
          {
            key: 'hide',
            icon: <i className="icon icon-visibility_off" />,
            label: _l('隐藏'),
            onClick: () => {
              hideColumn(control.controlId);
              closeMenu();
            },
          },
          !!sheetHiddenColumnIds.length && {
            key: 'showAll',
            icon: <i className="icon icon-eye" />,
            label: _l('显示所有列'),
            onClick: () => {
              clearHiddenColumn();
              closeMenu();
            },
          },
          columnIndex <= maxAllowFrozenColumnIndex &&
            fixedColumnCount !== columnIndex + 1 && {
              key: 'freeze',
              icon: <i className="icon icon-lock" />,
              label: _l('冻结'),
              onClick: () => {
                frozen(columnIndex);
                closeMenu();
              },
            },
          fixedColumnCount > 1 &&
            columnIndex < fixedColumnCount && {
              key: 'unfreeze',
              icon: <i className="icon icon-task-new-no-locked" />,
              label: _l('解冻所有列'),
              onClick: () => {
                frozen(0);
                closeMenu();
              },
            },
          canEdit &&
            !!selectedRowIds.length &&
            !get(window, 'shareState.shareId') && {
              key: 'batchEdit',
              icon: <i className="icon icon-hr_edit" />,
              label: _l('编辑选中记录'),
              onClick: () => {
                handleBatchUpdateRecords(control);
                closeMenu();
              },
            },
        ].filter(Boolean),
      })}
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
