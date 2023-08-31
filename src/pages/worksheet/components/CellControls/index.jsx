import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { RELATE_RECORD_SHOW_TYPE, ROW_HEIGHT } from 'worksheet/constants/enum';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { Validator, getRangeErrorType } from 'src/components/newCustomFields/tools/utils';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';
import DataFormat, { onValidator } from 'src/components/newCustomFields/tools/DataFormat';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import {
  checkIsTextControl,
  handleCopyControlText,
  isSameTypeForPaste,
  handlePasteUpdateCell,
  getCopyControlText,
} from '../../util';
import { accDiv } from 'src/util';

import renderText from './renderText';
import Text from './Text';
import Area from './Area';
import Location from './Location';
import RichText from './RichText';
import Date from './Date';
import User from './User';
import Options from './Options';
import OptionSteps from './OptionSteps';
import Department from './Department';
import Level from './Level';
import Relation from './Relation';
import Attachments from './Attachments';
import RelateRecord from './RelateRecord';
import Signature from './Signature';
import Switch from './Switch';
import MobilePhone from './MobilePhone';
import Cascader from './Cascader';
import NumberSlider from './NumberSlider';
import BarCode from './BarCode';
import Time from './Time';
import OrgRole from './OrgRole';
import Search from './Search';
import RelationSearch from './RelationSearch';

import './CellControls.less';
import _ from 'lodash';

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

  constructor(props) {
    super(props);
    this.state = {
      isediting: false,
    };
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

  componentWillUnmount() {
    const { registerRef } = this.props;
    registerRef(undefined);
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  cell = React.createRef();

  get error() {
    return this.errorCleared ? this.state.error : this.state.error || this.props.error;
  }

  checkCellFullVisible() {
    const { style } = this.props;
    let newLeft;
    let newTop;
    const cell = ReactDom.findDOMNode(this);
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
      cell.type === 47 ||
      (cell.type === 29 && parseInt(cell.advancedSetting.showtype, 10) === RELATE_RECORD_SHOW_TYPE.LIST)
    );
  }

  validate(cell, row) {
    const { tableFromModule, cellUniqueValidate, clearCellError, rowFormData } = this.props;
    let { errorType } = onValidator({ item: cell, data: rowFormData() });
    if (!errorType && cell.unique && tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST) {
      errorType = cellUniqueValidate(cell.controlId, cell.value, row.rowid) ? '' : 'UNIQUE';
    }
    this.errorCleared = !errorType;
    return errorType;
  }

  getErrorText(errorType, cell) {
    if (typeof FORM_ERROR_TYPE_TEXT[errorType] === 'string') {
      return FORM_ERROR_TYPE_TEXT[errorType];
    } else if (typeof FORM_ERROR_TYPE_TEXT[errorType] === 'function') {
      return FORM_ERROR_TYPE_TEXT[errorType](cell);
    } else {
      return _l('格式不正确');
    }
  }

  @autobind
  onValidate(value, returnObject = false) {
    const { projectId, cell, row, checkRulesErrorOfControl, rowFormData, clearCellError } = this.props;
    // 百分比值处理
    if (_.includes([6], cell.type) && cell.advancedSetting && cell.advancedSetting.numshow === '1' && value) {
      value = accDiv(value, 100);
    }
    const errorType = this.validate(
      { ...(cell.type === 10 ? mergeControlAdvancedSetting(cell, { otherrequired: '0' }) : { ...cell }), value },
      row,
    );
    let errorText;
    if (_.includes([15, 16, 46], cell.type) && errorType && errorType !== 'REQUIRED') {
      errorText = onValidator({
        item: { ...cell, value },
        data: _.isFunction(rowFormData) ? rowFormData() : rowFormData,
        ignoreRequired: true,
      }).errorText;
    } else {
      errorText = errorType && this.getErrorText(errorType, { ...cell, value });
    }
    if (_.includes([15, 16, 46], cell.type) && !errorText) {
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
    const error = checkRulesErrorOfControl(cell, rowForCheckRule);
    if (error) {
      this.setState({ error: error.errorMessage });
      return !error;
    }
    this.setState({
      error: errorText || null,
    });
    if (returnObject) {
      return {
        errorType,
        errorText,
      };
    }
    return !errorType;
  }
  @autobind
  handleCopy(cell) {
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
  }
  @autobind
  handlePaste(cell) {
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
      if (isSameTypeForPaste(cell.type, pasteData.controlType)) {
        handlePasteUpdateCell(cell, pasteData, value => {
          this.handleUpdateCell({ value: value });
        });
      }
    }
  }
  @autobind
  handleTableKeyDown(e, cache) {
    const { tableType, cell, onClick } = this.props;
    const { isediting } = this.state;
    const haveEditingStatus = this.haveEditingStatus(cell);
    if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
      this.handleCopy(cell);
      return;
    }
    if (
      e.key === 'v' &&
      (e.metaKey || e.ctrlKey) &&
      (!_.includes([2, 4, 7, 5, 6, 8], cell.type) ||
        (cell.type === 6 && cell.advancedSetting && cell.advancedSetting.showtype === '2'))
    ) {
      this.handlePaste(cell);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && !(e.key === 'v' && checkIsTextControl(cell.type))) {
      return;
    }
    switch (e.key) {
      case 'Backspace':
        if (this.editable && haveEditingStatus && !isediting && !cell.required) {
          this.handleUpdateCell({ value: '' });
        }
        break;
      case ' ':
        if (e.target.tagName.toLowerCase() === 'body' || e.target.classList.contains('body')) {
          onClick();
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
          _.includes([26, 27, 29, 36, 42], cell.type) ||
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
  }

  @autobind
  async handleUpdateCell(newCell = {}, options = {}) {
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
        ...options,
      },
    );
    this.setState({
      error: null,
    });
  }

  @autobind
  handleUpdateEditing(isediting, cb = () => {}) {
    if (isediting && !this.editable) {
      return;
    }
    const {
      tableType,
      cell,
      row,
      cache,
      clearCellError,
      enterEditing = () => {},
      scrollTo,
      onCellFocus = () => {},
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
  }

  @autobind
  clickHandle(...args) {
    const { tableType, clickEnterEditing, cell, cellIndex, cache, onClick, onFocusCell, onMouseDown } = this.props;
    onMouseDown();
    const haveEditingStatus = this.haveEditingStatus(cell);
    if (tableType === 'classic') {
      if (!_.isUndefined(cache.focusIndex) && cache.focusIndex === cellIndex) {
        this.handleUpdateEditing(true);
        return;
      }
      onFocusCell();
      if (!haveEditingStatus) {
        return;
      }
    }
    if (!haveEditingStatus || tableType === 'simple') {
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
  }

  render() {
    const {
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
      allowlink,
      disableDownload,
      updateCell,
      isCharge,
      onClick,
      onFocusCell,
    } = this.props;
    const { isediting } = this.state;
    const error = this.error;
    const singleLine = rowHeight === ROW_HEIGHT[0];
    let className = this.props.className;
    if (error) {
      className = className + ' cellControlErrorStatus';
    }
    if (singleLine) {
      className += ' singleLine';
    }
    if (isediting) {
      className += ' isediting';
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
        cell.value = _.round(parseFloat(cell.value) * 100, cell.dot || 0).toFixed(cell.dot || 0) + '%';
      } else {
        if (_.includes([15, 16], cell.enumDefault2) && _.includes([2, 3], cell.enumDefault)) {
          cell.advancedSetting = { ...cell.advancedSetting, showtype: cell.unit };
        }
        cell.type = cell.enumDefault2 || 6;
      }
    }
    const controlPermission = controlState(cell);
    this.editable =
      canedit && row && row.allowedit && controlPermission.editable && !cell.isSubtotal && allowlink !== '0';
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
      from: from,
      mode,
      tableFromModule,
      isediting,
      error,
      sheetSwitchPermit,
      viewId,
      appId,
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
    };
    if (isTextControl) {
      if (cell.type === 41 || cell.type === 32 || cell.type === 10010 || (cell.type === 2 && cell.enumDefault === 1)) {
        needLineLimit = true;
      }
      if (cell.type === 41) {
        return <RichText {...props} needLineLimit={needLineLimit} />;
      }
      if (_.includes([19, 23, 24], cell.type)) {
        return <Area {...props} needLineLimit={needLineLimit} />;
      }
      if (_.includes([15, 16], cell.type)) {
        return <Date {...props} needLineLimit={needLineLimit} />;
      }
      if (cell.type === 3) {
        return <MobilePhone {...props} />;
      }
      if (cell.type === 6 && cell.advancedSetting && cell.advancedSetting.showtype === '2') {
        return <NumberSlider {...props} />;
      }
      return <Text {...props} needLineLimit={needLineLimit} />;
    }
    if (_.includes([9, 10, 11], cell.type) && cell.advancedSetting.showtype !== '2') {
      return <Options {...props} />;
    }
    if (_.includes([9, 10, 11], cell.type) && cell.advancedSetting.showtype === '2') {
      return <OptionSteps {...props} />;
    }
    if (cell.type === 28) {
      return <Level {...props} />;
    }
    if (cell.type === 27) {
      return <Department {...props} />;
    }
    if (cell.type === 26) {
      return <User {...props} />;
    }
    if (cell.type === 21) {
      return <Relation {...props} />;
    }
    if (cell.type === 14) {
      return <Attachments {...props} />;
    }
    if (cell.type === 29 || cell.type === 34) {
      return <RelateRecord {...props} />;
    }
    if (cell.type === 42) {
      return <Signature {...props} />;
    }
    if (cell.type === 36) {
      return <Switch {...props} />;
    }
    if (cell.type === 30) {
      return (
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
      return <Cascader {...props} />;
    }
    if (cell.type === 40) {
      return <Location {...props} />;
    }
    if (cell.type === 46) {
      return <Time {...props} />;
    }
    if (cell.type === 47) {
      return <BarCode {...props} />;
    }
    if (cell.type === 48) {
      return <OrgRole {...props} />;
    }
    if (cell.type === 49 || cell.type === 50) {
      return <Search {...props} />;
    }
    if (cell.type === 51) {
      return <RelationSearch {...props} />;
    }
    return <div className={className} onClick={this.props.onClick} style={style} />;
  }
}
