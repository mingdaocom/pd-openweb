import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import SheetContext from 'worksheet/common/Sheet/SheetContext';
import { hideColumn, clearHiddenColumn, frozenColumn, sortByControl } from 'worksheet/redux/actions/sheetview';
import { Menu, MenuItem, Dialog } from 'ming-ui';
import { CONTROL_FILTER_WHITELIST } from 'worksheet/common/WorkSheetFilter/enum';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import { CONTROL_EDITABLE_WHITELIST } from 'worksheet/constants/enum';
import { emitter, getSortData, fieldCanSort, getLRUWorksheetConfig, saveLRUWorksheetConfig } from 'worksheet/util';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import { isOtherShowFeild } from 'src/pages/widgetConfig/util';
import './ColumnHead.less';
import _ from 'lodash';

class ColumnHead extends Component {
  static contextType = SheetContext;
  static propTypes = {
    rowIsSelected: PropTypes.bool,
    readonly: PropTypes.bool,
    disabledFunctions: PropTypes.arrayOf(PropTypes.string),
    sortControls: PropTypes.arrayOf(PropTypes.shape({})),
    sheetHiddenColumns: PropTypes.arrayOf(PropTypes.string),
    control: PropTypes.shape({}),
    className: PropTypes.string,
    controlId: PropTypes.string,
    viewId: PropTypes.string,
    type: PropTypes.number,
    columnIndex: PropTypes.number,
    fixedColumnCount: PropTypes.number,
    sourceControlType: PropTypes.number,
    hideColumn: PropTypes.func,
    clearHiddenColumn: PropTypes.func,
    frozenColumn: PropTypes.func,
    updateSheetColumnWidths: PropTypes.func,
    onBatchEdit: PropTypes.func,
    sortByControl: PropTypes.func,
  };

  get isAsc() {
    const { control, sortControls } = this.props;
    const sortControl = _.find(sortControls, sort => sort.controlId === control.controlId);
    return sortControl && sortControl.isAsc;
  }

  getType(control) {
    const { type, sourceControlType } = control;
    let itemType = type;
    if (type === 30) {
      itemType = sourceControlType;
    }
    if (itemType === 38) {
      itemType = 6;
    }
    return itemType;
  }

  changeSortType(controlId, isAsc, type) {
    const { sortByControl } = this.props;
    sortByControl({
      controlId,
      datatype: type,
      isAsc,
    });
  }

  handleColumnWidthLRUSave(controlId, value) {
    const { readonly, viewId } = this.props;
    let columnWidth = {};
    try {
      columnWidth = JSON.parse(getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_WIDTH', viewId));
    } catch (err) {}
    if (readonly) return;
    saveLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId, new Date().getTime());
    saveLRUWorksheetConfig(
      'WORKSHEET_VIEW_COLUMN_WIDTH',
      viewId,
      JSON.stringify(_.assign({}, columnWidth, { [controlId]: value })),
    );
  }

  changeSort = newIsAsc => {
    const { updateDefaultScrollLeft } = this.props;
    const { controlId, sourceControlType, type } = this.props.control;
    this.changeSortType(controlId, newIsAsc, this.getType({ sourceControlType, type }));
    updateDefaultScrollLeft();
  };

  frozen(index) {
    const { isTreeTableView, readonly, viewId, frozenColumn } = this.props;
    if (isTreeTableView && index > 0) {
      index = index - 1;
    }
    frozenColumn(index);
    if (readonly) return;
    saveLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId, new Date().getTime());
    saveLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_FROZON', viewId, index);
  }

  updateColumnWidth = ({ controlId, value }) => {
    const { updateSheetColumnWidths } = this.props;
    this.handleColumnWidthLRUSave(controlId, value);
    updateSheetColumnWidths({ controlId, value });
  };

  render() {
    const {
      className,
      type = '',
      worksheetId = '',
      disabled,
      count,
      style,
      isLast,
      allWorksheetIsSelected,
      sheetSelectedRows = [],
      disabledFunctions = [],
      rowIsSelected,
      columnIndex,
      fixedColumnCount,
      sheetHiddenColumns,
      hideColumn,
      clearHiddenColumn,
      onBatchEdit,
      canBatchEdit = true,
      onShowFullValue = () => {},
    } = this.props;
    const hideColumnFilter = _.get(this.context, 'config.hideColumnFilter');
    let control = { ...this.props.control };
    const isShowOtherField = isOtherShowFeild(control);
    const itemType = this.getType(control);
    const canSort = fieldCanSort(itemType, control);
    const canEdit =
      _.includes(CONTROL_EDITABLE_WHITELIST, control.type) &&
      controlState(control).editable &&
      canBatchEdit &&
      !SYS.filter(o => o !== 'ownerid').includes(control.controlId); //系统字段(除了拥有者字段)，不可编辑
    const filterWhiteKeys = _.flatten(
      Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
    );
    let canFilter =
      _.includes(filterWhiteKeys, itemType) && !_.includes(disabledFunctions, 'filter') && !window.hideColumnHeadFilter;
    if (control.type === 30 && control.strDefault === '10') {
      canFilter = false;
    }
    const maskData =
      _.get(control, 'advancedSetting.datamask') === '1' && _.get(control, 'advancedSetting.isdecrypt') === '1';
    control = redefineComplexControl(control);
    return (
      <BaseColumnHead
        disabled={disabled}
        columnIndex={columnIndex}
        className={className}
        style={style}
        control={control}
        showDropdown
        isLast={isLast}
        isAsc={this.isAsc}
        changeSort={this.changeSort}
        updateSheetColumnWidths={this.updateColumnWidth}
        renderPopup={({ closeMenu }) => (
          <Menu
            className="worksheetColumnHeadMenu"
            style={{ width: 180 }}
            specialFilter={target => target === this.head}
            onClickAway={closeMenu}
          >
            {canSort &&
              !isShowOtherField &&
              getSortData(itemType, control).map(item => (
                <MenuItem
                  key={item.value}
                  onClick={() => {
                    this.changeSort(item.value === 2);
                    closeMenu();
                  }}
                >
                  <i className={cx('icon', item.value === 1 ? 'icon-descending-order2' : 'icon-ascending-order2')}></i>
                  {item.text}
                </MenuItem>
              ))}
            {canEdit && rowIsSelected && (
              <MenuItem
                onClick={() => {
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }
                  const selectedLength = allWorksheetIsSelected
                    ? count - sheetSelectedRows.length
                    : sheetSelectedRows.length;
                  if (selectedLength > 1000) {
                    Dialog.confirm({
                      title: (
                        <span style={{ fontWeight: 500, lineHeight: '1.5em' }}>
                          {_l('最大支持批量执行1000行记录，是否只选中并执行前1000行数据？')}
                        </span>
                      ),
                      onOk: () => onBatchEdit(control),
                    });
                  } else {
                    onBatchEdit(control);
                  }
                  closeMenu();
                }}
              >
                <i className="icon icon-hr_edit"></i>
                {_l('编辑选中记录')}
              </MenuItem>
            )}
            {canFilter && !rowIsSelected && !isShowOtherField && !hideColumnFilter && (
              <MenuItem
                onClick={() => {
                  emitter.emit('FILTER_ADD_FROM_COLUMNHEAD' + worksheetId + type, control);
                  closeMenu();
                }}
              >
                <i className="icon icon-worksheet_filter"></i>
                {_l('筛选')}
              </MenuItem>
            )}
            {maskData && (
              <MenuItem onClick={onShowFullValue}>
                <i className="icon icon-eye_off"></i>
                {_l('解码')}
              </MenuItem>
            )}
            {(canSort || (canFilter && !rowIsSelected) || (canEdit && rowIsSelected)) && <hr />}
            <MenuItem
              onClick={() => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                hideColumn(control.controlId);
                closeMenu();
              }}
            >
              <i className="icon icon-visibility_off"></i>
              {_l('隐藏')}
            </MenuItem>
            {!!sheetHiddenColumns.length && (
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
            {columnIndex < 11 && !control.hideFrozen && fixedColumnCount !== columnIndex + 1 && (
              <MenuItem
                onClick={() => {
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }
                  this.frozen(columnIndex);
                  closeMenu();
                }}
              >
                <i className="icon icon-task-new-locked"></i>
                {_l('冻结')}
              </MenuItem>
            )}
            {columnIndex === fixedColumnCount - 1 && !control.hideFrozen && (
              <MenuItem
                onClick={() => {
                  this.frozen(0);
                  closeMenu();
                }}
              >
                <i className="icon icon-task-new-no-locked"></i>
                {_l('解冻')}
              </MenuItem>
            )}
          </Menu>
        )}
      />
    );
  }
}

const mapStateToProps = state => ({
  sheetHiddenColumns: state.sheet.sheetview.sheetViewConfig.sheetHiddenColumns,
  sortControls: state.sheet.sheetview.sheetFetchParams.sortControls,
  allWorksheetIsSelected: state.sheet.sheetview.sheetViewConfig.allWorksheetIsSelected,
  sheetSelectedRows: state.sheet.sheetview.sheetViewConfig.sheetSelectedRows,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      hideColumn,
      clearHiddenColumn,
      frozenColumn,
      sortByControl,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ColumnHead);
