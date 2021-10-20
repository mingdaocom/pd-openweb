import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import { hideColumn, clearHiddenColumn, frozenColumn, sortByControl } from 'worksheet/redux/actions/sheetview';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import { CONTROL_FILTER_WHITELIST } from 'worksheet/common/WorkSheetFilter/enum';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import { CONTROL_EDITABLE_BALCKLIST } from 'worksheet/constants/enum';
import { emitter, getSortData, fieldCanSort, getLRUWorksheetConfig, saveLRUWorksheetConfig } from 'worksheet/util';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import './ColumnHead.less';

class ColumnHead extends Component {
  static propTypes = {
    rowIsSelected: PropTypes.bool,
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
    return type === 30 ? sourceControlType : type;
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
    const { viewId } = this.props;
    let columnWidth = {};
    try {
      columnWidth = JSON.parse(getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_WIDTH', viewId));
    } catch (err) {}
    saveLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId, new Date().getTime());
    saveLRUWorksheetConfig(
      'WORKSHEET_VIEW_COLUMN_WIDTH',
      viewId,
      JSON.stringify(_.assign({}, columnWidth, { [controlId]: value })),
    );
  }

  @autobind
  changeSort(newIsAsc) {
    const { updateDefaultScrollLeft } = this.props;
    const { controlId, sourceControlType, type } = this.props.control;
    this.changeSortType(controlId, newIsAsc, this.getType({ sourceControlType, type }));
    updateDefaultScrollLeft();
  }

  frozen(index) {
    const { viewId, frozenColumn } = this.props;
    frozenColumn(index);
    saveLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId, new Date().getTime());
    saveLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_FROZON', viewId, index);
  }

  @autobind
  updateColumnWidth({ controlId, value }) {
    const { updateSheetColumnWidths } = this.props;
    this.handleColumnWidthLRUSave(controlId, value);
    updateSheetColumnWidths({ controlId, value });
  }

  render() {
    const {
      className,
      style,
      isLast,
      rowIsSelected,
      columnIndex,
      fixedColumnCount,
      sheetHiddenColumns,
      hideColumn,
      clearHiddenColumn,
      onBatchEdit,
      canBatchEdit = true,
    } = this.props;
    let control = { ...this.props.control };
    const itemType = this.getType(control);
    const canSort = fieldCanSort(itemType);
    const canEdit =
      !_.includes(CONTROL_EDITABLE_BALCKLIST, control.type) &&
      controlState(control).editable &&
      canBatchEdit &&
      !SYS.filter(o => o !== 'ownerid').includes(control.controlId); //系统字段(除了拥有者字段)，不可编辑
    const filterWhiteKeys = _.flatten(
      Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
    );
    const canFilter = _.includes(filterWhiteKeys, itemType);
    control = redefineComplexControl(control);
    return (
      <BaseColumnHead
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
                  onBatchEdit(control);
                  closeMenu();
                }}
              >
                <i className="icon icon-hr_edit"></i>
                {_l('编辑选中记录')}
              </MenuItem>
            )}
            {canFilter && !rowIsSelected && (
              <MenuItem
                onClick={() => {
                  emitter.emit('FILTER_ADD_FROM_COLUMNHEAD', control);
                  closeMenu();
                }}
              >
                <i className="icon icon-worksheet_filter"></i>
                {_l('筛选')}
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
              <i className="icon icon-workflow_hide"></i>
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
            {columnIndex < 11 && fixedColumnCount !== columnIndex + 1 && (
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
            {columnIndex === fixedColumnCount - 1 && (
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
