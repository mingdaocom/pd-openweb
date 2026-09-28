import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _, { get, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';
import SheetContext from 'worksheet/common/Sheet/SheetContext';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import getTableColumnWidth from 'worksheet/components/BaseColumnHead/getTableColumnWidth';
import {
  clearHiddenColumn,
  frozenColumn,
  hideColumn,
  saveColumnStylesToLocal,
  sortByControl,
  updateColumnStyles,
} from 'worksheet/redux/actions/sheetview';
import { showTypeData } from 'src/pages/worksheet/common/ViewConfig/components/BatchSet';
import { COVER_DISPLAY_FILL } from 'src/pages/worksheet/common/ViewConfig/config.js';
import { isOtherShowFeild } from 'src/utils/domain/control/filters';
import { redefineComplexControl } from 'src/utils/domain/control/normalization';
import { fieldCanSort, getSortData } from 'src/utils/domain/control/sort';
import { controlState } from 'src/utils/domain/control/state';
import { checkIsTextControl, controlIsNumber } from 'src/utils/domain/control/type';
import { SYS } from 'src/utils/domain/control/widget';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { CONTROL_EDITABLE_WHITELIST, WORKSHEET_ALLOW_SET_ALIGN_CONTROLS } from 'src/utils/domain/worksheet/constants';
import { CONTROL_FILTER_WHITELIST } from 'src/utils/domain/worksheet/filterConstants';
import { emitter } from 'src/utils/platform/browser/dom';
import { saveLRUWorksheetConfig } from 'src/utils/platform/storage/local';
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
    sheetHiddenColumns: PropTypes.arrayOf(PropTypes.string), // 外部传入的视图配置中的隐藏列
    control: PropTypes.shape({}),
    className: PropTypes.string,
    controlId: PropTypes.string,
    viewId: PropTypes.string,
    type: PropTypes.number,
    columnIndex: PropTypes.number,
    fixedColumnCount: PropTypes.number,
    sourceControlType: PropTypes.number,
    hideColumn: PropTypes.func, // 外部传入的隐藏列方法
    clearHiddenColumn: PropTypes.func, // 外部传入的清除隐藏列方法
    frozenColumn: PropTypes.func,
    updateSheetColumnWidths: PropTypes.func,
    onBatchEdit: PropTypes.func,
    sortByControl: PropTypes.func,
    // Redux 中的方法（重命名避免冲突）
    reduxHideColumn: PropTypes.func,
    reduxClearHiddenColumn: PropTypes.func,
    reduxSheetHiddenColumns: PropTypes.arrayOf(PropTypes.string),
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

  handleColumnWidthLRUSave(controlId, value, changes) {
    const { readonly, saveColumnStylesToLocal, updateColumnStyles } = this.props;

    if (readonly) return;

    if (changes) {
      const newChanges = _.reduce(
        changes,
        (acc, width, controlId) => {
          acc[controlId] = { width };
          return acc;
        },
        {},
      );
      saveColumnStylesToLocal(newChanges);
      updateColumnStyles(newChanges);
      return;
    }

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
      viewId = '',
      disabled,
      showRequired,
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
      sheetHiddenColumns = [], // 外部传入的视图配置中的隐藏列
      hideColumn, // 外部传入的隐藏列方法
      clearHiddenColumn, // 外部传入的清除隐藏列方法
      onBatchEdit,
      canBatchEdit = true,
      columnStyles = {},
      fromEmbed,
      rows = [],
      columns = [],
      updateSheetColumnWidths,
      onShowFullValue = () => {},
      onBatchSetColumns = () => {},
      scrollToLeftStart = () => {},
      // Redux 中的方法
      reduxHideColumn = () => {},
      reduxClearHiddenColumn = () => {},
      reduxSheetHiddenColumns = [],
    } = this.props;

    // 判断是否是对外分享状态

    // 如果是分享模式，强制使用 redux 中的方法和数据  否则，优先使用外部传入的方法，没有则使用 redux 中的方法
    const finalHideColumn = hideColumn || reduxHideColumn;
    const finalClearHiddenColumn = clearHiddenColumn || reduxClearHiddenColumn;
    const finalSheetHiddenColumns = hideColumn && clearHiddenColumn ? sheetHiddenColumns : reduxSheetHiddenColumns;
    const hideColumnFilter = _.get(this.context, 'config.hideColumnFilter');
    const isSingleView = _.get(this.context, 'isSingleView');
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
      _.includes(filterWhiteKeys, itemType) &&
      !_.includes(disabledFunctions, 'filter') &&
      !window.hideColumnHeadFilter &&
      !fromEmbed;

    if (control.type === 30 && control.strDefault === '10') {
      canFilter = false;
    }

    const maskData =
      !(
        _.get(window, 'shareState.isPublicView') ||
        _.get(window, 'shareState.isPublicPage') ||
        _.get(window, 'shareState.isPublicRecord')
      ) &&
      _.get(control, 'advancedSetting.datamask') === '1' &&
      _.get(control, 'advancedSetting.isdecrypt') === '1';
    control = redefineComplexControl(control);
    const allowSetAlign = WORKSHEET_ALLOW_SET_ALIGN_CONTROLS.includes(control.type);
    return (
      <BaseColumnHead
        showRequired={showRequired}
        rows={rows}
        worksheetId={worksheetId}
        disabled={disabled}
        columnIndex={columnIndex}
        className={className}
        style={style}
        control={control}
        showDropdown={!!control.controlId}
        isLast={isLast}
        isAsc={this.isAsc}
        columnStyle={columnStyle}
        changeSort={this.changeSort}
        updateSheetColumnWidths={this.updateColumnWidth}
        renderPopup={({ closeMenu }) => {
          const updateCustomWidth = value => {
            let newWidth = Number(value);

            if (isNaN(newWidth)) {
              return;
            }

            newWidth = Math.min(600, Math.max(60, newWidth));
            this.updateColumnWidth({ controlId: control.controlId, value: newWidth });
            closeMenu();
          };

          const alignOptions = allowSetAlign
            ? [
                { name: _l('左对齐'), value: 0 },
                { name: _l('居中'), value: 1 },
                { name: _l('右对齐'), value: 2 },
              ]
            : [
                { name: _l('左对齐'), value: 0 },
                { name: _l('居中'), value: 1 },
              ];

          const styleItems = getShowTypeData(control)?.map(({ value, text }) => ({
            key: `showtype-${value}`,
            label: text,
            extra: showtype === value ? <Icon icon="done" className="colorPrimary" /> : undefined,
            className: cx({ colorPrimary: showtype === value }),
            onClick: () => {
              this.updateColumnStyle({ controlId: control.controlId, key: 'showtype', value });
              closeMenu();
            },
          }));

          if (control.type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT && showtype !== 6) {
            styleItems.push({
              key: 'coverFillType',
              label: _l('图片填充方式'),
              children: COVER_DISPLAY_FILL.map(({ text, value }) => ({
                key: `coverFillType-${value}`,
                label: text,
                extra: coverFillType === value ? <Icon icon="done" className="colorPrimary" /> : undefined,
                className: cx({ colorPrimary: coverFillType === value }),
                onClick: () => {
                  this.updateColumnStyle({
                    controlId: control.controlId,
                    key: 'coverFillType',
                    value,
                  });
                  closeMenu();
                },
              })),
            });
          }

          return {
            style: { width: 180 },
            items: [
              ...(canSort && !isShowOtherField
                ? getSortData(itemType, control).map(item => ({
                    key: `sort-${item.value}`,
                    icon: (
                      <i
                        className={cx('icon', item.value === 1 ? 'icon-descending-order2' : 'icon-ascending-order2')}
                      />
                    ),

                    label: item.text,
                    onClick: () => {
                      this.changeSort(item.value === 2);
                      closeMenu();
                    },
                  }))
                : []),
              canEdit &&
                rowIsSelected && {
                  key: 'batchEdit',
                  icon: <i className="icon icon-hr_edit" />,
                  label: _l('编辑选中记录'),
                  onClick: () => {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }

                    const selectedLength = allWorksheetIsSelected
                      ? count - sheetSelectedRows.length
                      : sheetSelectedRows.length;

                    if (selectedLength > 1000) {
                      Modal.confirm({
                        title: (
                          <span style={{ lineHeight: '1.5em' }}>
                            {_l('最大支持批量执行1000行记录，是否只选中并执行前1000行数据？')}
                          </span>
                        ),

                        onOk: () => onBatchEdit(control),
                      });
                    } else {
                      onBatchEdit(control);
                    }

                    closeMenu();
                  },
                },
              canFilter &&
                !rowIsSelected &&
                !isShowOtherField &&
                !hideColumnFilter && {
                  key: 'filter',
                  icon: <i className="icon icon-worksheet_filter" />,
                  label: _l('筛选'),
                  onClick: () => {
                    emitter.emit(
                      'FILTER_ADD_FROM_COLUMNHEAD' + worksheetId + type + (isSingleView ? viewId : ''),
                      control,
                    );
                    closeMenu();
                  },
                },
              maskData && {
                key: 'decode',
                icon: <i className="icon icon-eye_off" />,
                label: _l('解码'),
                onClick: onShowFullValue,
              },
              {
                key: 'hide',
                icon: <i className="icon icon-visibility_off" />,
                label: _l('隐藏'),
                onClick: () => {
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }

                  finalHideColumn(control.controlId);
                  closeMenu();
                },
              },
              !!finalSheetHiddenColumns?.length && {
                key: 'showAll',
                icon: <i className="icon icon-eye" />,
                label: _l('显示所有列'),
                onClick: () => {
                  finalClearHiddenColumn();
                  closeMenu();
                },
              },
              columnIndex < 11 &&
                !control.hideFrozen &&
                fixedColumnCount !== columnIndex + 1 && {
                  key: 'freeze',
                  icon: <i className="icon icon-lock" />,
                  label: _l('冻结'),
                  onClick: () => {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }

                    this.frozen(columnIndex);
                    closeMenu();
                  },
                },
              columnIndex === fixedColumnCount - 1 &&
                !control.hideFrozen && {
                  key: 'unfreeze',
                  icon: <i className="icon icon-task-new-no-locked" />,
                  label: _l('解冻'),
                  onClick: () => {
                    this.frozen(0);
                    closeMenu();
                  },
                },
              (isCharge || checkIsTextControl(control.type)) && { type: 'divider' },
              isCharge && {
                key: 'align',
                icon: <i className="icon icon-format_align_left" />,
                label: _l('对齐'),
                children: alignOptions.map(({ value, name }) => ({
                  key: `align-${value}`,
                  label: !allowSetAlign && value === 1 ? `${name}${_l('(仅字段名称)')}` : name,
                  extra: direction === value ? <Icon icon="done" className="colorPrimary" /> : undefined,
                  className: cx({ colorPrimary: direction === value }),
                  onClick: () => {
                    this.updateColumnStyle({ controlId: control.controlId, key: 'direction', value });
                    closeMenu();
                  },
                })),
              },
              isCharge &&
                [
                  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU,
                  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN,
                  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT,
                  WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT,
                ].includes(control.type) && {
                  key: 'style',
                  icon: <i className="icon icon-task-color" />,
                  label: _l('样式'),
                  children: styleItems,
                },
              {
                key: 'columnWidth',
                icon: <i className="icon icon-sheets_rtl" />,
                label: _l('列宽'),
                children: [
                  {
                    key: 'fitCurrent',
                    label: _l('适合内容（当前列）'),
                    onClick: () => {
                      const width = getTableColumnWidth(
                        document.querySelector('.sheetViewTable'),
                        rows,
                        control,
                        columnStyle,
                        worksheetId,
                      );
                      this.updateColumnWidth({ controlId: control.controlId, value: width });
                      closeMenu();
                    },
                  },
                  {
                    key: 'fitAll',
                    label: _l('适合内容（所有列）'),
                    onClick: () => {
                      const changes = {};
                      columns.forEach(column => {
                        changes[column.controlId] = getTableColumnWidth(
                          document.querySelector('.sheetViewTable'),
                          rows,
                          column,
                          columnStyle,
                          worksheetId,
                        );
                      });
                      this.handleColumnWidthLRUSave(undefined, undefined, changes);
                      updateSheetColumnWidths({ changes });
                      setTimeout(scrollToLeftStart, 100);
                      closeMenu();
                    },
                  },
                  {
                    key: 'customWidth',
                    label: (
                      <div onClick={event => event.stopPropagation()}>
                        <div className="mBottom6">{_l('指定列宽')}</div>
                        <Input
                          className="w100"
                          defaultValue={style.width}
                          suffix={<span className="textTertiary">px</span>}
                          onBlur={event => updateCustomWidth(event.target.value)}
                          onKeyDown={event => {
                            event.stopPropagation();
                            if (event.key === 'Enter') {
                              updateCustomWidth(event.target.value);
                            }
                          }}
                        />
                      </div>
                    ),
                  },
                ],
              },
              isCharge && {
                key: 'batchSet',
                icon: <i className="icon icon-align_setting" />,
                label: _l('批量设置'),
                onClick: () => {
                  onBatchSetColumns();
                  closeMenu();
                },
              },
            ].filter(Boolean),
          };
        }}
      />
    );
  }
}

const mapStateToProps = state => ({
  reduxSheetHiddenColumns: state.sheet.sheetview.sheetViewConfig.sheetHiddenColumns,
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
      reduxHideColumn: hideColumn,
      reduxClearHiddenColumn: clearHiddenColumn,
      frozenColumn,
      sortByControl,
      updateColumnStyles,
      saveColumnStylesToLocal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ColumnHead);
