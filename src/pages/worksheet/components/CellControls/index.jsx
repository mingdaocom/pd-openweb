import React from 'react';
import _, { get, includes, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import { RELATE_RECORD_SHOW_TYPE, ROW_HEIGHT } from 'worksheet/constants/enum';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/Form/core/config';
import DataFormat from 'src/components/Form/core/DataFormat';
import { onValidator } from 'src/components/Form/core/formUtils';
import 'src/components/Form/DesktopForm/style.less';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { accDiv } from 'src/utils/common';
import {
  checkIsTextControl,
  getControlStateAndCheckSectionControl,
  getCopyControlText,
  handleCopyControlText,
} from 'src/utils/control';
import SheetContext from '../../common/Sheet/SheetContext';
import Area from './Area';
import Attachments from './Attachments';
import BarCode from './BarCode';
import Cascader from './Cascader';
import CellWithPopupOperate from './CellWithPopupOperate';
import Date from './Date';
import Department from './Department';
import Level from './Level';
import Location from './Location';
import MobilePhone from './MobilePhone';
import NumberSlider from './NumberSlider';
import Options from './Options';
import OptionSteps from './OptionSteps';
import OrgRole from './OrgRole';
import RelateRecord from './RelateRecord';
import Relation from './Relation';
import RelationSearch from './RelationSearch';
import RichText from './RichText';
import Search from './Search';
import Signature from './Signature';
import Switch from './Switch';
import Text from './Text';
import Time from './Time';
import User from './User';
import './CellControls.less';

export function isSameTypeForPaste(type1, type2) {
  if (_.includes([15, 16], type1) && _.includes([15, 16], type2)) {
    return true;
  } else {
    return type1 === type2;
  }
}

export function handlePasteUpdateCell(cell, pasteData, update = () => {}) {
  // WIDGETS_TO_API_TYPE_ENUM
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
        WIDGETS_TO_API_TYPE_ENUM.NUMBER,
        WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU,
        WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT,
        WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN,
        WIDGETS_TO_API_TYPE_ENUM.DATE,
        WIDGETS_TO_API_TYPE_ENUM.DATE_TIME,
        WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
        WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
        WIDGETS_TO_API_TYPE_ENUM.SCORE,
        WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
        WIDGETS_TO_API_TYPE_ENUM.CASCADER,
        WIDGETS_TO_API_TYPE_ENUM.SWITCH,
        WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT,
        WIDGETS_TO_API_TYPE_ENUM.TIME,
        WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
        WIDGETS_TO_API_TYPE_ENUM.LOCATION,
      ],
      cell.type,
    )
  ) {
    update(pasteData.value);
  } else if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE,
        WIDGETS_TO_API_TYPE_ENUM.AREA_CITY,
        WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY,
      ],
      cell.type,
    )
  ) {
    update(safeParse(pasteData.value).code);
  }
  // ATTACHMENT: 14,
  // SIGNATURE
}

function mergeControlAdvancedSetting(control = {}, advancedSetting = {}) {
  return {
    ...control,
    advancedSetting: {
      ...(control.advancedSetting || {}),
      ...advancedSetting,
    },
  };
}
export default class CellControl extends React.Component {
  static propTypes = {
    isSubList: PropTypes.bool,
    className: PropTypes.string,
    tableFromModule: PropTypes.number,
    style: PropTypes.shape({}),
    cell: PropTypes.shape({}),
    row: PropTypes.shape({}),
    canedit: PropTypes.bool,
    disableDownload: PropTypes.bool,
    from: PropTypes.number,
    rowHeight: PropTypes.number,
    popupContainer: PropTypes.any,
    clickEnterEditing: PropTypes.bool, // 单击进入编辑
    projectId: PropTypes.string,
    updateCell: PropTypes.func,
    scrollTo: PropTypes.func,
    onClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    clearCellError: PropTypes.func,
    cellUniqueValidate: PropTypes.func,
    onCellFocus: PropTypes.func,
  };

  static defaultProps = {
    style: {},
    onClick: () => {},
    onMouseDown: () => {},
    popupContainer: () => document.body,
    scrollTo: () => {},
    clearCellError: () => {},
    cellUniqueValidate: () => true,
    registerRef: () => {},
  };
  static contextType = SheetContext;

  constructor(props) {
    super(props);
    this.state = {
      isediting: false,
    };
    this.id = Math.random().toString().slice(2);
  }

  componentDidMount() {
    const { registerRef } = this.props;
    if (!_.isUndefined(this.props.isediting)) {
      this.setState({ isediting: this.props.isediting });
    }
    if (!_.isUndefined(this.props.error)) {
      this.setState({ error: this.props.error });
    }
    registerRef(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.error && !nextProps.error) {
      this.setState({ error: null });
    }
    if (nextProps.cellIndex !== this.props.cellIndex) {
      const { registerRef } = this.props;
      registerRef(this, nextProps.cellIndex);
    }
  }

  componentWillUnmount() {
    const { registerRef } = this.props;
    registerRef(undefined);
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  cell = React.createRef();

  get error() {
    return this.state.error || this.props.error;
    // return this.errorCleared ? this.state.error : this.state.error || this.props.error;
  }

  checkCellFullVisible() {
    const { style, cellIndex, tableId } = this.props;
    let newLeft;
    let newTop;
    const cell = document.querySelector(`.worksheetTableComp.id-${tableId}-id .cell-${cellIndex}`);
    if (!cell) return;
    const scrollLeft = cell.parentElement.parentElement.scrollLeft;
    const scrollTop = cell.parentElement.parentElement.scrollTop;
    const gridWidth = cell.parentElement.parentElement.clientWidth;
    const gridHeight = cell.parentElement.parentElement.clientHeight;
    const rightVisible = style.left + style.width <= scrollLeft + gridWidth;
    const leftVisible = style.left >= scrollLeft;
    const topVisible = style.top >= scrollTop;
    const bottomVisible = style.top + style.height <= scrollTop + gridHeight;
    if (!leftVisible) {
      newLeft = style.left;
    }
    if (!rightVisible) {
      newLeft = style.left + style.width - gridWidth;
    }
    if (!topVisible) {
      newTop = style.top;
    }
    if (!bottomVisible) {
      newTop = style.top + style.height - gridHeight;
    }
    return {
      fullvisible: rightVisible && leftVisible && topVisible && bottomVisible,
      newLeft,
      newTop,
    };
  }

  haveEditingStatus(cell) {
    return !(
      cell.type === 30 ||
      cell.type === 31 ||
      cell.type === 38 ||
      cell.type === 32 ||
      cell.type === 33 ||
      cell.type === 21 ||
      cell.type === 28 ||
      cell.type === 34 ||
      cell.type === 36 ||
      cell.type === 53 ||
      cell.type === 47 ||
      (cell.type === 29 && parseInt(cell.advancedSetting.showtype, 10) === RELATE_RECORD_SHOW_TYPE.LIST)
    );
  }

  validate(cell, row) {
    const { tableFromModule, cellUniqueValidate, rowFormData, appId } = this.props;
    let { errorType } = onValidator({
      item: cell,
      data: _.isFunction(rowFormData) ? rowFormData() : rowFormData,
      appId,
    });
    if (!errorType && (cell.unique || cell.uniqueInRecord) && tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST) {
      errorType = cellUniqueValidate(cell.controlId, cell.value, row.rowid) ? '' : 'UNIQUE';
    }
    // this.errorCleared = !errorType;
    return errorType;
  }

  getErrorText(errorType, cell) {
    const { isSubList } = this.props;
    if (typeof FORM_ERROR_TYPE_TEXT[errorType] === 'string') {
      return FORM_ERROR_TYPE_TEXT[errorType];
    } else if (typeof FORM_ERROR_TYPE_TEXT[errorType] === 'function') {
      return FORM_ERROR_TYPE_TEXT[errorType](cell, { isSubList });
    } else {
      return _l('格式不正确');
    }
  }

  onValidate = value => {
    const { projectId, cell, row, checkRulesErrorOfControl, rowFormData, clearCellError, appId } = this.props;
    // 百分比值处理
    if (_.includes([6], cell.type) && cell.advancedSetting && cell.advancedSetting.numshow === '1' && value) {
      value = accDiv(value, 100);
    }
    let errorType = this.validate(
      { ...(cell.type === 10 ? mergeControlAdvancedSetting(cell, { otherrequired: '0' }) : { ...cell }), value },
      row,
    );
    let errorText;
    if (
      (_.includes([15, 16, 46], cell.type) && errorType && errorType !== 'REQUIRED') ||
      (cell.type === 2 && errorType === 'CUSTOM')
    ) {
      errorText = onValidator({
        item: { ...cell, value },
        data: _.isFunction(rowFormData) ? rowFormData() : rowFormData,
        ignoreRequired: true,
        appId,
      }).errorText;
    } else {
      errorText = errorType && this.getErrorText(errorType, { ...cell, value });
    }
    if (errorType === 'OTHER_REQUIRED') {
      errorText = null;
      errorType = null;
    }
    if (!errorText) {
      clearCellError(`${(row || {}).rowid}-${cell.controlId}`);
      $('.mdTableErrorTip').remove();
    }
    let rowForCheckRule = { ...row, [cell.controlId]: value };
    try {
      const tempRow = new DataFormat({
        projectId,
        data: _.isFunction(rowFormData) ? rowFormData() : rowFormData,
      });
      tempRow.updateDataSource({ controlId: cell.controlId, value });
      rowForCheckRule = [{}, ...tempRow.data].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
    } catch (err) {
      console.log(err);
    }
    const ruleError = checkRulesErrorOfControl({
      control: cell,
      row: rowForCheckRule,
      validateRealtime: true,
    });
    if (ruleError && ruleError?.errorType !== 'RULE_REQUIRED') {
      this.setState({ error: ruleError.errorMessage, ignoreErrorMessage: ruleError.ignoreErrorMessage });
      return ruleError;
    }
    this.setState({
      error: errorText || null,
      ignoreErrorMessage: false,
    });
    return {
      errorType,
      errorText,
    };
  };

  handleCopy = cell => {
    const { tableId } = this.props;
    handleCopyControlText(cell, tableId);
    if (!_.includes([2, 3, 4, 7, 5, 6, 8], cell.type)) {
      window.tempCopyForSheetView = JSON.stringify({
        type: 'origin',
        value: cell.value,
        textValue: getCopyControlText(cell),
        controlId: cell.controlId,
        controlType: cell.type,
        tableId,
      });
    }
  };

  handlePaste = cell => {
    if (!window.tempCopyForSheetView || !this.editable) {
      return;
    }
    const pasteData = safeParse(window.tempCopyForSheetView);
    if (_.includes([9, 10, 11, 29, 35], cell.type)) {
      if (
        cell.type === 29 &&
        cell.enumDefault === 2 &&
        parseInt(cell.advancedSetting.showtype, 10) === RELATE_RECORD_SHOW_TYPE.LIST
      ) {
        return;
      }
      if (cell.controlId === pasteData.controlId) {
        handlePasteUpdateCell(cell, pasteData, value => {
          this.handleUpdateCell({ value: value });
        });
      }
    } else {
      if (cell.type === 26 && get(safeParse(pasteData.value), '0.status') === 2) {
        return;
      }
      if (isSameTypeForPaste(cell.type, pasteData.controlType)) {
        handlePasteUpdateCell(cell, pasteData, value => {
          this.handleUpdateCell({ value: value });
        });
      }
    }
  };

  handleTableKeyDown = (e, cache) => {
    const { tableType, cell, onClick } = this.props;
    const { isediting } = this.state;
    const haveEditingStatus = this.haveEditingStatus(cell);
    if (e.key.toLowerCase() === 'c' && (e.metaKey || e.ctrlKey) && !window.richTextDialogIsActive) {
      this.handleCopy(cell);
      return;
    }
    if (
      e.key.toLowerCase() === 'v' &&
      (e.metaKey || e.ctrlKey) &&
      (!_.includes([2, 4, 7, 5, 6, 8], cell.type) ||
        (cell.type === 6 && cell.advancedSetting && cell.advancedSetting.showtype === '2')) &&
      !window.richTextDialogIsActive
    ) {
      this.handlePaste(cell);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && !(e.key.toLowerCase() === 'v' && checkIsTextControl(cell.type))) {
      return;
    }
    window.cellLastKey = e.key;
    switch (e.key) {
      case 'Backspace':
        if (this.editable && haveEditingStatus && !isediting && !cell.required) {
          this.handleUpdateCell({ value: cell.type === 29 ? '[]' : '' });
        }
        break;
      case ' ':
        if (!isediting) {
          onClick({ isSpace: true });
        }
        break;
      case 'Enter':
        if (this.editable && haveEditingStatus && !isediting) {
          this.handleUpdateEditing(true);
          e.preventDefault();
          if (tableType === 'classic') {
            cache.hasEditingCell = true;
            window.hasEditingCell = true;
          }
        }
        if (
          _.includes([26, 27, 29, 36, 42, 48], cell.type) ||
          (cell.type === 6 && cell.advancedSetting && cell.advancedSetting.showtype === '2')
        ) {
          if (_.isFunction(_.get(this, 'cell.current.handleTableKeyDown'))) {
            this.cell.current.handleTableKeyDown(e, cache);
          }
        }
        break;
      default:
        if (_.isFunction(_.get(this, 'cell.current.handleTableKeyDown'))) {
          this.cell.current.handleTableKeyDown(e, cache);
        }
        break;
    }
  };

  handleUpdateCell = async (newCell = {}, options = {}) => {
    const { cell, row, updateCell } = this.props;
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    updateCell(
      {
        controlId: cell.controlId,
        controlName: cell.controlName,
        type: cell.type,
        ...newCell,
      },
      {
        silent: true,
        cell: Object.assign({}, cell, newCell),
        row,
        ...options,
      },
    );
    this.setState({
      error: null,
    });
  };

  handleUpdateEditing = (isediting, cb = () => {}, options = {}) => {
    if (isediting && !this.editable) {
      return;
    }
    const {
      tableType,
      tableFromModule,
      cell,
      row,
      cache,
      clearCellError,
      enterEditing = () => {},
      cellUniqueValidate,
      scrollTo,
      onCellFocus = () => {},
      setActiveRow,
    } = this.props;
    const { error } = this;
    onCellFocus(isediting);
    const cellFullVisible = isediting && this.checkCellFullVisible();
    const run = () => {
      this.setState(
        {
          isediting,
          error: isediting ? error : null,
        },
        () => {
          cb();
        },
      );
      if (tableType === 'classic') {
        cache.hasEditingCell = isediting;
        window.hasEditingCell = isediting;
      }
      if (!isediting && !error) {
        clearCellError(`${(row || {}).rowid}-${cell.controlId}`);
        $('.mdTableErrorTip').remove();
      }
      if (isediting) {
        enterEditing();
        setActiveRow(row?.rowid || null);
      }
      setTimeout(
        () => {
          window.cellisediting = isediting;
        },
        isediting ? 0 : 500,
      );
      if (!isediting) {
        window.timer = Math.random();
      }
    };
    if (!isediting && cell.unique) {
      if (cell.unique && !cell.uniqueInRecord && tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST) {
        cellUniqueValidate(cell.controlId, _.isUndefined(options.value) ? cell.value : options.value, row.rowid, true);
      }
    }
    if (isediting && !cellFullVisible.fullvisible) {
      let newPos = {};
      if (_.isNumber(cellFullVisible.newLeft)) {
        newPos.left = cellFullVisible.newLeft;
      }
      if (_.isNumber(cellFullVisible.newTop)) {
        newPos.top = cellFullVisible.newTop;
      }
      scrollTo(newPos);
      setTimeout(run, 10);
      return;
    }
    run();
    setTimeout(() => {
      if (!isediting) {
        window.handFocusCell = false;
      }
    }, 10);
  };

  clickHandle = (...args) => {
    const [e] = args;
    try {
      if (!e.target.closest('.cell-id-' + this.id)) return;
    } catch (err) {
      console.error(err);
    }
    const {
      className,
      isSubList,
      row,
      tableType,
      clickEnterEditing,
      cell,
      cellIndex,
      cache,
      onClick,
      triggerClickImmediate,
      onFocusCell,
      onMouseDown,
      setActiveRow = () => {},
    } = this.props;
    onMouseDown();
    setActiveRow(row.rowid);
    const haveEditingStatus = this.haveEditingStatus(cell);
    if (tableType === 'classic') {
      if (!_.isUndefined(cache.focusIndex) && cache.focusIndex === cellIndex && haveEditingStatus) {
        this.handleUpdateEditing(true);
        return;
      }
      onFocusCell();
      if (isSubList && e.isTrusted) {
        if (className.includes('lastRow') && className.includes('col-1')) {
          window.handFocusCell = true;
        } else {
          window.handFocusCell = false;
        }
      }
      if (!haveEditingStatus) {
        return;
      }
    }
    if (!haveEditingStatus || tableType === 'simple' || triggerClickImmediate) {
      if (!window.getSelection().toString()) {
        onClick(...args);
      }
      return;
    }
    if (this.clicktimer || clickEnterEditing) {
      // double click
      clearTimeout(this.clicktimer);
      this.clicktimer = null;
      if (this.editable) {
        this.handleUpdateEditing(true);
      }
    } else {
      this.clicktimer = setTimeout(() => {
        this.clicktimer = null;
        if (tableType !== 'classic' && !window.cellisediting && !window.getSelection().toString()) {
          onClick(...args);
        } else {
          window.cellisediting = false;
        }
      }, 260);
    }
  };

  render() {
    const {
      direction,
      tableId,
      tableType,
      worksheetId,
      isMobileTable,
      isSubList,
      isTrash,
      cache,
      style,
      tableFromModule,
      cell,
      row,
      rowIndex,
      columnIndex,
      cellIndex,
      rowFormData,
      masterData,
      columnStyle = {},
      from,
      mode,
      rowHeight,
      rowHeightEnum,
      popupContainer,
      projectId,
      canedit,
      gridHeight,
      tableScrollTop,
      sheetSwitchPermit,
      viewId,
      appId,
      disableDownload,
      updateCell,
      isCharge,
      onClick,
      onFocusCell,
      chatButton,
      isDraft,
      setActiveRow,
      cellProps = {},
      updateSheetColumnWidths = () => {},
    } = this.props;
    // style.transform = `translate3d(${style.left}px, ${style.top}px, 0)`;
    // style.left = 0;
    // style.top = 0;
    const { isediting, ignoreErrorMessage } = this.state;
    const error = this.error;
    const singleLine = rowHeight === ROW_HEIGHT[0];
    let className = this.props.className + ' cell-id-' + this.id;
    if (error) {
      className = className + ' cellControlErrorStatus';
    }
    if (ignoreErrorMessage) {
      className = className + ' ignoreErrorMessage';
    }
    if (singleLine) {
      className += ' singleLine';
    }
    if (isediting) {
      className += ' isediting';
    }
    if (
      className.indexOf('highlight') < 0 &&
      String(window[`activeRowIndex-${tableId}`]) === String(direction === 'horizontal' ? rowIndex : columnIndex)
    ) {
      className += ' highlight';
    }
    if (
      cache &&
      !_.isUndefined(cache.focusIndex) &&
      cache.focusIndex === cellIndex &&
      className.indexOf(' focus') < 0
    ) {
      className += ' focus';
    }
    if (_.isObject(cell.value) && cell.value.customCell && cell.value.type === 'text') {
      return (
        <div style={style} className={className}>
          <span style={cell.value.style}>{cell.value.value}</span>
        </div>
      );
    }
    if (row && _.isEmpty(row)) {
      return <div className={className} style={style} />;
    }
    if (!cell.advancedSetting) {
      cell.advancedSetting = {};
    }
    if (cell.type === 37) {
      cell.isSubtotal = true;
      if (cell.advancedSetting && cell.advancedSetting.summaryresult === '1') {
        cell.type = 2;
        cell.value = _.isUndefined(cell.value)
          ? ''
          : _.round(parseFloat(cell.value) * 100, cell.dot || 0).toFixed(cell.dot || 0) + '%';
      } else {
        if (_.includes([15, 16], cell.enumDefault2) && _.includes([2, 3], cell.enumDefault)) {
          cell.advancedSetting = { ...cell.advancedSetting, showtype: cell.unit };
        }
        cell.type = cell.enumDefault2 || 6;
      }
    }
    const controlPermission = getControlStateAndCheckSectionControl(
      cell,
      from,
      _.isFunction(rowFormData) ? rowFormData() : rowFormData,
    );
    this.editable = canedit && row && row.allowedit && !row.sys_lock && controlPermission.editable && !cell.isSubtotal;
    if (this.editable) {
      className += ' editable';
    }
    if (!controlPermission.visible) {
      if (tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST) {
        return <div className={className} onClick={this.props.onClick} style={style} />;
      } else {
        className += ' readonly';
        this.editable = false;
      }
    }
    const editable = this.editable;
    const isTextControl = checkIsTextControl(cell.type);
    let needLineLimit;
    const props = {
      tableId,
      tableType,
      cache,
      isMobileTable,
      isSubList,
      isTrash,
      worksheetId,
      className,
      style,
      rowIndex,
      columnIndex,
      ref: this.cell,
      editable,
      row,
      recordId: row && row.rowid,
      rowHeight,
      rowHeightEnum,
      count: row && row[`rq${cell.controlId}`],
      singleLine,
      tableScrollTop,
      gridHeight,
      popupContainer,
      projectId,
      cell: { ...cell },
      rowFormData,
      masterData,
      columnStyle,
      from: from,
      mode,
      tableFromModule,
      isediting,
      error,
      ignoreErrorMessage,
      sheetSwitchPermit,
      viewId,
      appId,
      isDraft,
      updateCell: this.handleUpdateCell,
      updateControlValue: updateCell,
      onClick: this.clickHandle,
      openRecord: onClick,
      updateEditingStatus: this.handleUpdateEditing,
      clearError: () => this.setState({ error: null }),
      onValidate: this.onValidate,
      disableDownload,
      isCharge,
      onFocusCell,
      setActiveRow,
      fromEmbed: _.get(this.context, 'config.fromEmbed'),
      // 子表和关联记录需要传递主表的appId
      ...(_.includes([WORKSHEETTABLE_FROM_MODULE.SUBLIST, WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD], tableFromModule)
        ? { masterAppId: _.get(this.context, 'appId') }
        : {}),
    };
    let cellContent = null;
    if (isTextControl) {
      if (cell.type === 41 || cell.type === 32 || cell.type === 10010 || (cell.type === 2 && cell.enumDefault === 1)) {
        needLineLimit = true;
      }
      if (cell.type === 41) {
        cellContent = <RichText {...props} needLineLimit={needLineLimit} />;
      }
      if (_.includes([19, 23, 24], cell.type)) {
        cellContent = <Area {...props} needLineLimit={needLineLimit} />;
      }
      if (_.includes([15, 16], cell.type)) {
        cellContent = <Date {...props} needLineLimit={needLineLimit} />;
      }
      if (cell.type === 3) {
        cellContent = <MobilePhone {...props} />;
      }
      if (cell.type === 6 && cell.advancedSetting && cell.advancedSetting.showtype === '2') {
        cellContent = <NumberSlider {...props} />;
      }
      if (!cellContent) {
        cellContent = <Text {...props} needLineLimit={needLineLimit} />;
      }
    }
    if (
      _.includes([9, 11], cell.type) &&
      (columnStyle.showtype === 2 ||
        (cell.advancedSetting.showtype === '2' && (isUndefined(columnStyle.showtype) || isediting)))
    ) {
      cellContent = <OptionSteps {...props} />;
    } else if (_.includes([9, 10, 11], cell.type) && (columnStyle.showtype !== 2 || includes([10, 11], cell.type))) {
      cellContent = <Options {...props} />;
    }
    if (cell.type === 28) {
      cellContent = <Level {...props} />;
    }
    if (cell.type === 27) {
      cellContent = <Department {...props} />;
    }
    if (cell.type === 26) {
      props.disabled = this.props.disabled;
      cellContent = <User {...props} chatButton={chatButton} />;
    }
    if (cell.type === 21) {
      cellContent = <Relation {...props} />;
    }
    if (cell.type === 14) {
      cellContent = <Attachments {...props} />;
    }
    if (cell.type === 29 || cell.type === 34) {
      cellContent = <RelateRecord {...props} />;
    }
    if (cell.type === 42) {
      cellContent = <Signature {...props} />;
    }
    if (cell.type === 36) {
      cellContent = <Switch {...props} />;
    }
    if (cell.type === 30) {
      cellContent = (
        <CellControl
          {...props}
          className={'control-30 ' + props.className}
          cell={Object.assign({}, cell, {
            type: cell.sourceControlType,
            advancedSetting: Object.assign(_.get(cell, 'sourceControl.advancedSetting') || {}, {
              datamask: cell.advancedSetting.datamask,
            }),
          })}
          editable={false}
        />
      );
    }
    if (cell.type === 35) {
      cellContent = <Cascader {...props} />;
    }
    if (cell.type === 40) {
      cellContent = <Location {...props} />;
    }
    if (cell.type === 46) {
      cellContent = <Time {...props} />;
    }
    if (cell.type === 47) {
      cellContent = <BarCode {...props} />;
    }
    if (cell.type === 48) {
      cellContent = <OrgRole {...props} />;
    }
    if (cell.type === 49 || cell.type === 50) {
      cellContent = <Search {...props} />;
    }
    if (cell.type === 51) {
      cellContent = <RelationSearch {...props} />;
    }
    cellContent = cellContent || <div className={className} onClick={this.props.onClick} style={style} />;
    if (direction === 'vertical' && rowIndex === 0) {
      return (
        <CellWithPopupOperate
          className={className}
          control={cell}
          style={style}
          cellProps={cellProps}
          row={row}
          tableId={tableId}
          cellIndex={cellIndex}
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          cellContent={cellContent}
          updateSheetColumnWidths={updateSheetColumnWidths}
        />
      );
    }
    return cellContent;
  }
}
