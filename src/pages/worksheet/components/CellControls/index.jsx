import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { RELATE_RECORD_SHOW_TYPE, ROW_HEIGHT } from 'worksheet/constants/enum';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { Validator, getRangeErrorType } from 'src/components/newCustomFields/tools/utils';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';
import { onValidator } from 'src/components/newCustomFields/tools/DataFormat';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { checkIsTextControl } from '../../util';

import renderText from './renderText';
import Text from './Text';
import Area from './Area';
import Location from './Location';
import RichText from './RichText';
import Date from './Date';
import User from './User';
import Options from './Options';
import Department from './Department';
import Level from './Level';
import Relation from './Relation';
import Attachments from './Attachments';
import RelateRecord from './RelateRecord';
import Signature from './Signature';
import Switch from './Switch';
import MobilePhone from './MobilePhone';
import Cascader from './Cascader';

import './CellControls.less';

export const renderCellText = renderText;

export default class CellControl extends React.Component {
  static propTypes = {
    isSubList: PropTypes.bool,
    className: PropTypes.string,
    tableFromModule: PropTypes.number,
    style: PropTypes.shape({}),
    cell: PropTypes.shape({}),
    row: PropTypes.shape({}),
    canedit: PropTypes.bool,
    from: PropTypes.number,
    rowHeight: PropTypes.number,
    popupContainer: PropTypes.any,
    clickEnterEditing: PropTypes.bool, // 单击进入编辑
    projectId: PropTypes.string,
    updateEditingControls: PropTypes.func,
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
    updateEditingControls: () => {},
    popupContainer: () => document.body,
    scrollTo: () => {},
    clearCellError: () => {},
    cellUniqueValidate: () => true,
  };

  constructor(props) {
    super(props);
    this.state = {
      isediting: false,
    };
  }

  componentDidMount(nextProps) {
    if (!_.isUndefined(this.props.isediting)) {
      this.setState({ isediting: this.props.isediting });
    }
    if (!_.isUndefined(this.props.error)) {
      this.setState({ error: this.props.error });
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  cell = React.createRef();

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

  haveEdittingStatus(cell) {
    return !(
      cell.type === 32 ||
      cell.type === 33 ||
      cell.type === 21 ||
      cell.type === 28 ||
      cell.type === 36 ||
      (cell.type === 29 && parseInt(cell.advancedSetting.showtype, 10) === RELATE_RECORD_SHOW_TYPE.LIST)
    );
  }

  validate(cell) {
    const { tableFromModule, cellUniqueValidate } = this.props;
    let errorType = onValidator(cell);
    if (!errorType && cell.unique && tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST) {
      return cellUniqueValidate(cell.controlId, cell.value) ? '' : 'UNIQUE';
    }
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
  onValidate(value) {
    const { cell } = this.props;
    const errorType = this.validate({ ...cell, value });
    const errorText = errorType && this.getErrorText(errorType, { ...cell, value });
    this.setState({
      error: errorText || null,
    });
    return !errorType;
  }

  @autobind
  handleUpdateCell(newCell = {}, options = {}) {
    const { cell, updateCell } = this.props;
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
    const { cell, row, clearCellError, scrollTo, updateEditingControls, onCellFocus } = this.props;
    const { error } = this.state;
    onCellFocus(isediting);
    const cellFullVisible = isediting && this.checkCellFullVisible();
    const run = () => {
      this.setState(
        {
          isediting,
          error: isediting ? error : null,
        },
        cb,
      );
      if (!isediting) {
        updateEditingControls(isediting);
      }
      if (!isediting && !error) {
        clearCellError(`${row.rowid}-${cell.controlId}`);
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
    const { isSubList, clickEnterEditing, cell, onClick, onMouseDown } = this.props;
    onMouseDown();
    const haveEdittingStatus = this.haveEdittingStatus(cell);
    if (!haveEdittingStatus) {
      onClick(...args);
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
        if (!window.cellisediting && !window.getSelection().toString()) {
          onClick(...args);
        }
      }, 260);
    }
  }

  render() {
    const {
      worksheetId,
      isSubList,
      style,
      tableFromModule,
      cell,
      row,
      formdata,
      from,
      rowHeight,
      popupContainer,
      projectId,
      canedit,
      gridHeight,
      tableScrollTop,
      sheetSwitchPermit,
      viewId,
    } = this.props;
    const { isediting, error } = this.state;
    const singleLine = rowHeight === ROW_HEIGHT[0];
    let className = this.props.className;
    if (error && !_.isUndefined(this.props.error)) {
      className = className + ' cellControlErrorStatus';
    }
    if (singleLine) {
      className += ' singleLine';
    }
    if (row && _.isEmpty(row)) {
      return <div className={className} style={style} />;
    }
    if (cell.type === 37) {
      cell.isSubtotal = true;
      if (cell.advancedSetting && cell.advancedSetting.summaryresult === '1') {
        cell.type = 2;
        cell.value = Math.round(parseFloat(cell.value) * 100) + '%';
      } else {
        cell.type = cell.enumDefault2 || 6;
      }
    }
    const controlPermission = controlState(cell);
    this.editable = canedit && row && (row.allowedit || isSubList) && controlPermission.editable && !cell.isSubtotal;
    const editable = this.editable;
    const isTextControl = checkIsTextControl(cell.type);
    let needLineLimit;
    const props = {
      worksheetId,
      className,
      style,
      ref: this.cell,
      editable,
      recordId: row && row.rowid,
      rowHeight,
      singleLine,
      tableScrollTop,
      gridHeight,
      popupContainer,
      projectId,
      cell: { ...cell },
      formdata,
      from: from,
      tableFromModule,
      isediting,
      error,
      sheetSwitchPermit,
      viewId,
      updateCell: this.handleUpdateCell,
      onClick: this.clickHandle,
      updateEditingStatus: this.handleUpdateEditing,
      clearError: () => this.setState({ error: null }),
      onValidate: this.onValidate,
    };
    // 自定义呈现
    if (_.isObject(cell.value) && cell.value.customCell && cell.value.type === 'text') {
      return (
        <div style={style} className={className}>
          <span style={cell.value.style}>{cell.value.value}</span>
        </div>
      );
    }
    if (isTextControl) {
      if (cell.type === 41 || cell.type === 32 || cell.type === 10010) {
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
      return <Text {...props} needLineLimit={needLineLimit} />;
    }
    if (_.includes([9, 10, 11], cell.type)) {
      return <Options {...props} />;
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
          cell={Object.assign({}, cell, {
            type: cell.sourceControlType,
            advancedSetting: _.get(cell, 'sourceControl.advancedSetting') || {},
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
    return <div className={className} onClick={this.props.onClick} style={style} />;
  }
}
