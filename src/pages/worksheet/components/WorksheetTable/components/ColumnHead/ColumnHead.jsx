import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _, { get, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { Dialog, Icon, Input, Menu, MenuItem } from 'ming-ui';
import SheetContext from 'worksheet/common/Sheet/SheetContext';
import { CONTROL_FILTER_WHITELIST } from 'worksheet/common/WorkSheetFilter/enum';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import getTableColumnWidth from 'worksheet/components/BaseColumnHead/getTableColumnWidth';
import { CONTROL_EDITABLE_WHITELIST, WORKSHEET_ALLOW_SET_ALIGN_CONTROLS } from 'worksheet/constants/enum';
import {
  clearHiddenColumn,
  frozenColumn,
  hideColumn,
  saveColumnStylesToLocal,
  sortByControl,
  updateColumnStyles,
} from 'worksheet/redux/actions/sheetview';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import { isOtherShowFeild } from 'src/pages/widgetConfig/util';
import { showTypeData } from 'src/pages/worksheet/common/ViewConfig/components/BatchSet';
import { COVER_DISPLAY_FILL } from 'src/pages/worksheet/common/ViewConfig/config.js';
import { emitter } from 'src/utils/common';
import { saveLRUWorksheetConfig } from 'src/utils/common';
import { checkIsTextControl, controlIsNumber, fieldCanSort, getSortData } from 'src/utils/control';
import { WIDGETS_TO_API_TYPE_ENUM } from '../../../../../widgetConfig/config/widget';
import './ColumnHead.less';

function getShowTypeData(control) {
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT) {
    return showTypeData.filter(a => [4, 5, 6].includes(a.value));
  } else if (
    control.type === WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU ||
    control.type === WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN
  ) {
    return showTypeData.filter(a => [0, 1, 2, 3, 7].includes(a.value));
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT) {
    return showTypeData.filter(a => [0, 7].includes(a.value));
  }
}

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

  conRef = React.createRef();

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
    const { readonly, saveColumnStylesToLocal, updateColumnStyles } = this.props;

    if (readonly) return;

    saveColumnStylesToLocal({ [controlId]: { width: value } });
    updateColumnStyles({ [controlId]: { width: value } });
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

  updateColumnStyle = ({ controlId, key, value }) => {
    const { saveColumnStylesToLocal, updateColumnStyles } = this.props;
    if (!get(window, 'shareState.shareId')) {
      saveColumnStylesToLocal({ [controlId]: { [key]: value } });
    }
    updateColumnStyles({ [controlId]: { [key]: value } });
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
      isCharge,
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
      columnStyles = {},
      rows = [],
      onShowFullValue = () => {},
      onBatchSetColumns = () => {},
    } = this.props;
    const hideColumnFilter = _.get(this.context, 'config.hideColumnFilter');
    let control = { ...this.props.control };
    const columnStyle = get(columnStyles, control.controlId, {});
    const direction = isUndefined(columnStyle.direction) ? (controlIsNumber(control) ? 2 : 0) : columnStyle.direction;
    const showtype = !isUndefined(columnStyle.showtype)
      ? columnStyle.showtype
      : (control.type === 30 ? control.sourceControlType : control.type) === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT
        ? 6
        : _.get(control, 'advancedSetting.showtype') === '2'
          ? 2
          : 0;
    const coverFillType = !isUndefined(columnStyle.coverFillType) ? columnStyle.coverFillType : 0;
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
    const allowSetAlign = WORKSHEET_ALLOW_SET_ALIGN_CONTROLS.includes(control.type);
    return (
      <BaseColumnHead
        rows={rows}
        worksheetId={worksheetId}
        disabled={disabled}
        columnIndex={columnIndex}
        className={className}
        style={style}
        control={control}
        showDropdown
        isLast={isLast}
        isAsc={this.isAsc}
        columnStyle={columnStyle}
        changeSort={this.changeSort}
        updateSheetColumnWidths={this.updateColumnWidth}
        renderPopup={({ closeMenu }) => (
          <Menu
            className="worksheetColumnHeadMenu"
            style={{ width: 180 }}
            specialFilter={target => target === this.head}
            onClickAway={closeMenu}
            setRef={this.conRef}
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
                <i className="icon icon-lock"></i>
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
            {(isCharge || checkIsTextControl(control.type)) && <hr />}
            {isCharge && (
              <Trigger
                getPopupContainer={() => this.conRef.current}
                popupClassName="Relative"
                action={['hover']}
                popupPlacement="bottom"
                popupAlign={{
                  points: isLast ? ['tr', 'tl'] : ['tl', 'tr'],
                  offset: [0, -6],
                  overflow: { adjustX: true, adjustY: true },
                }}
                popup={
                  <Menu className="columnHeadChangeAlign">
                    {(allowSetAlign
                      ? [
                          {
                            name: _l('左对齐'),
                            value: 0,
                          },
                          {
                            name: _l('居中'),
                            value: 1,
                          },
                          {
                            name: _l('右对齐'),
                            value: 2,
                          },
                        ]
                      : [
                          {
                            name: _l('左对齐'),
                            value: 0,
                          },
                          {
                            name: _l('居中'),
                            value: 1,
                          },
                        ]
                    ).map(({ value, name }, index) => (
                      <MenuItem
                        key={index}
                        className={cx({ active: direction === value })}
                        onClick={() => {
                          this.updateColumnStyle({ controlId: control.controlId, key: 'direction', value });
                          closeMenu();
                        }}
                      >
                        <div className="flexRow">
                          {name}
                          {!allowSetAlign && value === 1 && <span className="sec">{_l('(仅字段名称)')}</span>}
                          <div className="flex"></div>
                          {direction === value && <Icon icon="done" className="mRight12 Relative" />}
                        </div>
                      </MenuItem>
                    ))}
                  </Menu>
                }
              >
                <MenuItem
                  onClick={() => {
                    closeMenu();
                  }}
                >
                  <i className="icon icon-format_align_left"></i>
                  {_l('对齐')}
                  <i
                    className="icon icon-arrow-right-tip Right"
                    style={{
                      fontSize: 12,
                      marginTop: 12,
                      marginRight: -8,
                    }}
                  ></i>
                </MenuItem>
              </Trigger>
            )}
            {isCharge &&
              [
                WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU,
                WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN,
                WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT,
                WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT,
              ].includes(control.type) && (
                <Trigger
                  getPopupContainer={() => this.conRef.current}
                  popupClassName="Relative"
                  action={['hover']}
                  popupPlacement="bottom"
                  popupAlign={{
                    points: isLast ? ['tr', 'tl'] : ['tl', 'tr'],
                    offset: [0, -6],
                    overflow: { adjustX: true, adjustY: true },
                  }}
                  popup={
                    <Menu className="columnHeadChangeAlign Relative">
                      {getShowTypeData(control).map(({ value, text }, index) => (
                        <MenuItem
                          key={index}
                          className={cx({ active: showtype === value })}
                          onClick={() => {
                            this.updateColumnStyle({ controlId: control.controlId, key: 'showtype', value });
                            closeMenu();
                          }}
                        >
                          <div className="flexRow">
                            <div className="flex">{text}</div>
                            {showtype === value && <Icon icon="done" className="mRight12 Relative" />}
                          </div>
                        </MenuItem>
                      ))}
                      {control.type === 14 && showtype !== 6 && (
                        <Trigger
                          getPopupContainer={() => this.conRef.current}
                          popupClassName="Relative"
                          action={['hover']}
                          popupPlacement="bottom"
                          popupAlign={{
                            points: isLast ? ['tr', 'tl'] : ['tl', 'tr'],
                            offset: [0, -6],
                            overflow: { adjustX: true, adjustY: true },
                          }}
                          popup={
                            <Menu className="columnHeadChangeAlign" style={{ width: 220 }}>
                              {COVER_DISPLAY_FILL.map(({ text, value }, index) => (
                                <MenuItem
                                  key={index}
                                  className={cx({ active: coverFillType === value })}
                                  onClick={() => {
                                    this.updateColumnStyle({
                                      controlId: control.controlId,
                                      key: 'coverFillType',
                                      value,
                                    });
                                    closeMenu();
                                  }}
                                >
                                  <div className="flexRow">
                                    <div className="flex">{text}</div>
                                    {coverFillType === value && <Icon icon="done" className="mRight12 Relative" />}
                                  </div>
                                </MenuItem>
                              ))}
                            </Menu>
                          }
                        >
                          <MenuItem
                            onClick={() => {
                              closeMenu();
                            }}
                          >
                            {_l('图片填充方式')}
                            <i
                              className="icon icon-arrow-right-tip Right"
                              style={{
                                fontSize: 12,
                                marginTop: 12,
                                marginRight: -8,
                              }}
                            ></i>
                          </MenuItem>
                        </Trigger>
                      )}
                    </Menu>
                  }
                >
                  <MenuItem
                    onClick={() => {
                      closeMenu();
                    }}
                  >
                    <i className="icon icon-task-color"></i>
                    {_l('样式')}
                    <i
                      className="icon icon-arrow-right-tip Right"
                      style={{
                        fontSize: 12,
                        marginTop: 12,
                        marginRight: -8,
                      }}
                    ></i>
                  </MenuItem>
                </Trigger>
              )}
            <Trigger
              getPopupContainer={() => this.conRef.current}
              popupClassName="Relative"
              action={['hover']}
              popupPlacement="bottom"
              popupAlign={{
                points: ['tl', 'tr'],
                offset: [0, -6],
                overflow: { adjustX: true, adjustY: true },
              }}
              destroyPopupOnHide={true}
              popup={
                <div className="changeColumnWidthPanel">
                  <Input
                    className="w100"
                    defaultValue={style.width}
                    onBlur={e => {
                      let newWidth = Number(e.target.value);
                      if (isNaN(newWidth)) {
                        return;
                      }
                      if (newWidth < 60) {
                        newWidth = 60;
                      }
                      if (newWidth > 600) {
                        newWidth = 600;
                      }
                      this.updateColumnWidth({ controlId: control.controlId, value: newWidth });
                      closeMenu();
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        let newWidth = Number(e.target.value);
                        if (isNaN(newWidth)) {
                          return;
                        }
                        if (newWidth < 60) {
                          newWidth = 60;
                        }
                        if (newWidth > 600) {
                          newWidth = 600;
                        }
                        this.updateColumnWidth({ controlId: control.controlId, value: newWidth });
                        closeMenu();
                      }
                    }}
                  />
                  <div className="px">px</div>
                  <div
                    className="resize"
                    onClick={() => {
                      const width = getTableColumnWidth(
                        document.querySelector('.sheetViewTable'),
                        rows,
                        control,
                        columnStyle,
                        worksheetId,
                      );
                      this.updateColumnWidth({ controlId: control.controlId, value: width });
                      closeMenu();
                    }}
                  >
                    {_l('列宽适合内容')}
                  </div>
                </div>
              }
            >
              <MenuItem>
                <i className="icon icon-sheets_rtl"></i>
                {_l('列宽适合内容')}
                <i
                  className="icon icon-arrow-right-tip Right"
                  style={{
                    fontSize: 12,
                    marginTop: 12,
                    marginRight: -8,
                  }}
                ></i>
              </MenuItem>
            </Trigger>
            {isCharge && (
              <MenuItem
                onClick={() => {
                  onBatchSetColumns();
                  closeMenu();
                }}
              >
                <i className="icon icon-align_setting"></i>
                {_l('批量设置')}
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
  columnStyles: state.sheet.sheetview.sheetViewConfig.columnStyles,
  rows: state.sheet.sheetview.sheetViewData.rows,
  worksheetInfo: state.sheet.worksheetInfo,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      hideColumn,
      clearHiddenColumn,
      frozenColumn,
      sortByControl,
      updateColumnStyles,
      saveColumnStylesToLocal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ColumnHead);
