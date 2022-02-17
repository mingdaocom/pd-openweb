import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import update from 'immutability-helper';
import { MDTable } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import { controlIsNumber, checkRulesErrorOfRowControl } from 'worksheet/util';
import { getControlRules } from 'src/api/worksheet';
import { updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import { ROW_HEIGHT, WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { getAdvanceSetting } from 'src/util';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import store from 'redux/configureStore';
import { NoSearch, NoRecords, MDCell } from './components';
import _ from 'lodash';

const NUMBER_HEAD_WIDTH = 70;

function getScrollBarWidth() {
  let width;
  var scroll = document.createElement('div');
  scroll.style.position = 'absolute';
  scroll.style.left = '-10000px';
  scroll.style.top = '-10000px';
  scroll.style.width = '100px';
  scroll.style.height = '100px';
  scroll.style.overflow = 'scroll';
  scroll.innerHTML = '<div style="width: 100px;height:200px"></div>';
  document.body.appendChild(scroll);
  width = scroll.offsetWidth - scroll.clientWidth;
  document.body.removeChild(scroll);
  return width;
}
@autoSize
export default class WorksheetTable extends PureComponent {
  static propTypes = {
    loading: PropTypes.bool,
    disableFrozen: PropTypes.bool,
    forceScrollOffset: PropTypes.shape({}),
    projectId: PropTypes.string,
    width: PropTypes.number, // 表格宽度
    height: PropTypes.number, // 表格高度
    showSummary: PropTypes.bool, // 显示统计
    isSubList: PropTypes.bool, // 单击进入编辑
    clickEnterEditing: PropTypes.bool, // 单击进入编辑
    noRenderEmpty: PropTypes.bool, // 不显示空状态
    emptyIcon: PropTypes.element, // 空状态icon
    emptyText: PropTypes.string, // 空状态提示
    keyWords: PropTypes.string, // 记录搜索关键词
    cellStyle: PropTypes.shape({}), // 单元格样式
    rowHeight: PropTypes.number, // 记录行高 默认36
    fixedColumnCount: PropTypes.number, // 冻结列
    data: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.shape({})), PropTypes.func]),
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    updateCell: PropTypes.func, // 更行数据
    sheetIsFiltered: PropTypes.bool,
    allowAdd: PropTypes.bool,
    noFillRows: PropTypes.bool,
    rowCount: PropTypes.number,
    showNewRecord: PropTypes.func,
    renderRowHead: PropTypes.func, // 行头渲染
    renderColumnHead: PropTypes.func, // 列头渲染
    updateEditingControls: PropTypes.func,
  };

  static defaultProps = {
    noRecordAllowAdd: true,
    fromModule: WORKSHEETTABLE_FROM_MODULE.APP,
    fixedColumnCount: 0,
    rowHeight: 36,
    controls: [],
    data: [],
    cellStyle: {},
    cellErrors: {},
    updateEditingControls: () => {},
  };

  mdtable = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      rulesLoading: !props.rules,
      rules: props.rules && props.rules.length ? props.rules : [],
      editingControls: props.editingControls || {},
      sheetColumnWidths: props.sheetColumnWidths || {},
    };
    this.scrollbarWidth = getScrollBarWidth() + 1;
    this.columns = this.getColumns(props);
    this.updatedRows = {};
    this.recordsFieldPermissionOfRules = {};
  }

  componentDidMount() {
    if (this.state.rulesLoading) {
      this.loadRules();
    } else if (this.state.rules.length) {
      this.initControlState();
    }
  }

  loadRules() {
    const { worksheetId } = this.props;
    getControlRules({
      type: 1,
      worksheetId,
    }).then(data => {
      if (data.length) {
        this.setState(
          {
            rules: data,
            rulesLoading: false,
          },
          this.initControlState,
        );
      } else {
        this.setState({
          rulesLoading: false,
        });
      }
    });
  }

  updateControlByRulesOfRow(row, controls, rules) {
    const formData = updateRulesData({ rules, data: controls.map(c => ({ ...c, value: row[c.controlId] })) });
    const rowControlStates = {};
    formData.forEach((item, index) => {
      const control = _.find(controls, { controlId: item.controlId });
      if (control && item.fieldPermission && item.fieldPermission !== control.fieldPermission) {
        rowControlStates[index] = item.fieldPermission;
      }
    });
    return rowControlStates;
  }

  @autobind
  initControlState() {
    try {
      const recordsFieldPermissionOfRules = {};
      const { isSubList, columns, controls } = this.props;
      const { rules } = this.state;
      const rows = this.data;
      rows.forEach(row => {
        const rowControlStates = this.updateControlByRulesOfRow(row, isSubList ? columns : controls, rules);
        if (!_.isEmpty(rowControlStates)) {
          recordsFieldPermissionOfRules[row.rowid] = rowControlStates;
        }
      });
      this.recordsFieldPermissionOfRules = recordsFieldPermissionOfRules;
      this.mdtable.current.forceUpdate();
    } catch (err) {
      console.log(err);
    }
  }

  @autobind
  checkRulesErrorOfControl(control, row) {
    const { controls } = this.props;
    const { rules } = this.state;
    return checkRulesErrorOfRowControl({ from: 3, rules, controls, control, row });
  }

  updateRecordsFieldPermissionOfRules(row, control) {
    try {
      const { isSubList } = this.props;
      const controls = isSubList ? this.props.columns : this.props.controls;
      const { rules } = this.state;
      const { recordsFieldPermissionOfRules } = this;
      const rowControlStates = {};
      if (!rules.length) {
        return;
      }
      const formData = updateRulesData({
        from: 3,
        rules,
        data: controls.map(c => ({ ...c, value: row[c.controlId] })),
      });
      formData.forEach((item, index) => {
        const control = _.find(controls, { controlId: item.controlId });
        if (control && item.fieldPermission && item.fieldPermission !== control.fieldPermission) {
          rowControlStates[index] = item.fieldPermission;
        }
      });
      this.recordsFieldPermissionOfRules = {
        ...recordsFieldPermissionOfRules,
        [row.rowid]: rowControlStates,
      };
    } catch (err) {
      console.log(err);
    }
  }

  getControlFieldPermission(recordId, controlId, control = {}) {
    try {
      const { isSubList, columns, controls } = this.props;
      const { recordsFieldPermissionOfRules = {} } = this;
      const controlIndex = _.findIndex(isSubList ? columns : controls, { controlId });
      if (!recordsFieldPermissionOfRules[recordId] || controlIndex < 0) {
        return control.fieldPermission || '111';
      }
      return recordsFieldPermissionOfRules[recordId][controlIndex];
    } catch (err) {
      console.log(err);
      return control.fieldPermission || '111';
    }
  }

  componentWillReceiveProps(nextProps) {
    const data = typeof this.props.data === 'function' ? this.props.data() : this.props.data;
    const nextData = typeof nextProps.data === 'function' ? nextProps.data() : nextProps.data;
    if (nextProps.width !== this.props.width || !_.isEqual(nextProps.columns, this.props.columns)) {
      this.columns = this.getColumns(nextProps);
    }
    if (!_.isEqual(this.props.editingControls, nextProps.editingControls)) {
      this.setState({ editingControls: nextProps.editingControls });
    }
    if (!_.isEqual(data, nextData)) {
      this.updatedRows = {};
      if (this.state.rules && this.state.rules.length && nextData.length > data.length) {
        this.updateNewRowsFieldPermission({
          props: nextProps,
          rows: nextData.slice(data.length),
        });
      }
    }

    // TODO
    if (!_.isEqual(this.props.sheetColumnWidths, nextProps.sheetColumnWidths)) {
      this.setState({ sheetColumnWidths: nextProps.sheetColumnWidths });
    }
  }

  updateNewRowsFieldPermission({ props, rows }) {
    const { isSubList, columns, controls } = props || this.props;
    const { rules } = this.state;
    try {
      rows.forEach(row => {
        const rowControlStates = this.updateControlByRulesOfRow(row, isSubList ? columns : controls, rules);
        if (!_.isEmpty(rowControlStates)) {
          this.recordsFieldPermissionOfRules[row.rowid] = rowControlStates;
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  getAverageWidth(props) {
    const { height, responseHeight, rowHeadWidth, renderRowHead, showSummary, rowHeight } = props || this.props;
    let { width } = props || this.props;
    const { sheetColumnWidths = {} } = this.state;
    const heightScroll = rowHeight * this.rowCount > height - 34 - (showSummary ? 34 : 0);
    if (heightScroll && !responseHeight) {
      width = width - this.scrollbarWidth;
    }
    const rowHeadIsNumber = (this.columns[0] && this.columns[0].controlId === 'number') || renderRowHead;
    let existNum = 0;
    let existSum = 0;
    this.columns.forEach(c => {
      if (sheetColumnWidths[c.controlId]) {
        existNum += 1;
        existSum += sheetColumnWidths[c.controlId];
      }
    });
    return (
      (rowHeadIsNumber ? width - (rowHeadWidth || NUMBER_HEAD_WIDTH) - existSum : width - existSum) /
      (rowHeadIsNumber ? this.columns.length - existNum - 1 : this.columns.length - existNum)
    );
  }

  getColumns(props) {
    const { columns, rowHeadWidth, renderRowHead } = props || this.props;
    let newColumns = [...columns].filter(c => !_.includes([WIDGETS_TO_API_TYPE_ENUM.EMBED], c.type));
    if (renderRowHead) {
      newColumns = [
        {
          controlId: 'number',
          width: rowHeadWidth || NUMBER_HEAD_WIDTH,
        },
      ].concat(newColumns);
    }
    this.horizontalScroll =
      _.sum(newColumns.map((c, i) => this.getCellWidth(i, { calcScroll: true, columns: newColumns }))) >= props.width;
    if (this.horizontalScroll) {
      newColumns = [...newColumns, { controlId: 'emptyForResize', width: 60 }];
    } else {
      this.columns = newColumns;
      this.averageWidth = this.getAverageWidth(props);
    }
    return newColumns;
  }

  get rowCount() {
    const { showSummary, rowHeight, height, keyWords, noRenderEmpty, noFillRows } = this.props;
    if (!_.isUndefined(this.props.rowCount)) {
      return this.props.rowCount;
    }
    const data = this.data;
    if (!data.length && !keyWords && !noRenderEmpty) {
      return 0;
    }
    let rowCount = data.length + 1;
    if (noFillRows) {
      return rowCount;
    }
    // 行数无法充满时 填充行数
    const mainHeight = height - this.scrollbarWidth - 3 - (showSummary ? 28 : 0) - 34;
    if (rowCount * rowHeight < mainHeight) {
      rowCount = Math.ceil(mainHeight / rowHeight) + 1;
    }
    return rowCount;
  }

  get fixedColumnCount() {
    const { fixedColumnCount } = this.props;
    return fixedColumnCount + 1;
  }

  get data() {
    return typeof this.props.data === 'function' ? this.props.data() : this.props.data;
  }

  @autobind
  getCellWidth(index, { calcScroll, columns } = {}) {
    let width = 0;
    const { sheetColumnWidths } = this.state;
    const column = (columns || this.columns || [])[index];
    if (!column) {
      return 0;
    }
    if (column && column.width) {
      width = column.width;
    } else if (column && sheetColumnWidths && sheetColumnWidths[column.controlId]) {
      width = sheetColumnWidths[column.controlId];
    } else if (calcScroll) {
      width = 160;
    } else {
      width = this.horizontalScroll ? 160 : this.averageWidth;
    }
    return width;
  }

  @autobind
  getCellPopupContainer(isFixed) {
    const { cellPopupContainer } = this.props;
    if (cellPopupContainer) {
      return cellPopupContainer;
    }
    return (
      (this.tablecon && this.tablecon.querySelector(isFixed ? '.main-left-grid' : '.main-right-grid')) || document.body
    );
  }

  @autobind
  updateEditingControls(key, value) {
    const { updateEditingControls } = this.props;
    const { editingControls } = this.state;
    this.setState({
      editingControls: update(editingControls, value ? { [key]: { $set: true } } : { $unset: [key] }),
    });
    updateEditingControls(key, value);
  }

  @autobind
  updateSheetRow(row) {
    try {
      const rowIndex = _.findIndex(this.data, { rowid: row.rowid });
      if (rowIndex >= 0) {
        this.updatedRows[row.rowid] = row;
        this.mdtable.current.updateRow(rowIndex + 1);
      }
    } catch (err) {
      console.log(err);
    }
  }

  @autobind
  renderCell({ key, style, columnIndex, rowIndex, scrollTo, tableScrollTop, gridHeight }) {
    const {
      readonly,
      id,
      worksheetId,
      controls,
      isSubList,
      clickEnterEditing,
      lineeditable,
      cellStyle,
      rowHeight,
      projectId,
      masterFormData = () => [],
      masterData = () => ({}),
      renderCell,
      renderColumnHead,
      renderRowHead,
      clearCellError,
      cellErrors,
      cellUniqueValidate,
      sheetViewHighlightRows = {},
      onColumnWidthChange = () => {},
      onCellFocus = () => {},
      getRowsCache,
      viewId,
      appId,
    } = this.props;
    const { rulesLoading, editingControls } = this.state;
    const data = this.data;
    const control = { ...(this.columns[columnIndex] || {}) };
    let row = data[rowIndex - 1] || {};
    if (row.isSubListFooter) {
      return <span style={{ ...style, height: 26 }} />;
    }
    control.fieldPermission =
      this.getControlFieldPermission(row.rowid, control.controlId, control) || control.fieldPermission || '111';
    if (this.updatedRows[row.rowid]) {
      row = this.updatedRows[row.rowid];
    }
    let value;
    if (_.isFunction(getRowsCache)) {
      value = _.get(getRowsCache(), row.rowid + '.' + control.controlId) || row[control.controlId];
    } else {
      const rowCache = store.getState().sheet.sheetview.rowCache || {};
      value = rowCache[row.rowid + '-' + control.controlId] || row[control.controlId];
    }
    const className = cx(
      `control-${control.type === 30 ? control.sourceControlType || control.type : control.type}`,
      `row-${rowIndex}`,
      `col-${columnIndex}`,
      'cell',
      `rowheight-${_.findIndex(ROW_HEIGHT, h => h === rowHeight) || 0}`,
      {
        readonly:
          lineeditable &&
          rowIndex > 0 &&
          columnIndex > 0 &&
          (control.fieldPermission[1] === '0' || control.fieldPermission[0] === '0'),
        rowisempty: !row.rowid,
        fixedRow: rowIndex === 0,
        alignRight: controlIsNumber(control),
        highlight:
          sheetViewHighlightRows[row.rowid] ||
          (!_.isUndefined(window[`sheettablehighlightrow${id}`]) && window[`sheettablehighlightrow${id}`] === rowIndex),
      },
    );
    const cellstyle = {
      ...cellStyle,
      ...style,
    };
    if (rulesLoading && rowIndex > 0 && columnIndex > 0) {
      return <div className={className} style={{ ...cellstyle }} />;
    }
    if (control.controlId === 'emptyForResize') {
      return <div style={{ ...cellstyle }} />;
    }
    if (columnIndex === 0 && _.isFunction(renderRowHead)) {
      return renderRowHead({ className, key, style: cellstyle, columnIndex, rowIndex, scrollTo, control, data, row });
    }
    if (rowIndex === 0 && _.isFunction(renderColumnHead)) {
      return renderColumnHead({
        className,
        key,
        style: cellstyle,
        columnIndex,
        rowIndex,
        scrollTo,
        control,
        data,
        fixedColumnCount: this.fixedColumnCount,
        mdtable: this.mdtable,
        isLast:
          control.controlId ===
          _.last(this.columns.filter(c => !_.includes(['number', 'emptyForResize'], c.controlId))).controlId,
        updateSheetColumnWidths: ({ controlId, value }) => {
          onColumnWidthChange(controlId, value);
          this.setState({
            sheetColumnWidths: Object.assign({}, this.state.sheetColumnWidths, { [controlId]: value }),
          });
        },
      });
    }
    if (_.isFunction(renderCell)) {
      return renderCell({ className, key, style: cellstyle, columnIndex, rowIndex, scrollTo, control, data });
    }
    const isediting = editingControls[`${row.rowid}-${control.controlId}`];
    const error = cellErrors[`${row.rowid}-${control.controlId}`];
    return (
      <MDCell
        {...this.props}
        {...{
          key,
          isSubList,
          columnIndex,
          rowIndex,
          row,
          control,
          value,
          getPopupContainer: this.getCellPopupContainer,
          scrollTo,
          clickEnterEditing,
          tableScrollTop,
          gridHeight,
          cellUniqueValidate,
          checkRulesErrorOfControl: this.checkRulesErrorOfControl,
        }}
        worksheetId={worksheetId}
        viewId={viewId}
        isediting={isediting}
        error={error}
        className={className}
        style={_.assign({}, cellstyle, style)}
        formdata={() =>
          (controls || this.columns)
            .map(c => ({ ...c, value: row[c.controlId] }))
            .concat(masterFormData().filter(c => c.controlId.length === 24))
        }
        masterData={() => masterData()}
        lineeditable={!readonly && lineeditable}
        updateEditingControls={status => this.updateEditingControls(`${row.rowid}-${control.controlId}`, status)}
        clearCellError={clearCellError}
        updateCell={(args, options) => {
          this.props.updateCell(args, {
            ...options,
            updateTable: () => {
              if (this.mdtable && this.mdtable.current && typeof this.mdtable.current.forceUpdate === 'function') {
                this.mdtable.current.forceUpdate();
              }
            },
            updateSucessCb: async newrow => {
              this.updateRecordsFieldPermissionOfRules(newrow, args.control);
              this.updatedRows[row.rowid] = { ...row, ..._.omit(newrow, ['allowedit', 'allowdelete']) };
              if (this.mdtable && this.mdtable.current && typeof this.mdtable.current.updateRow === 'function') {
                this.mdtable.current.updateRow(rowIndex);
              }
            },
          });
        }}
        onCellFocus={onCellFocus}
        fixedColumnCount={this.fixedColumnCount}
        projectId={projectId}
        appId={appId}
        data={data}
      />
    );
  }

  render() {
    const {
      id,
      isSubList,
      loading,
      width,
      height,
      rowCount,
      emptyIcon,
      emptyText,
      scrollBarHoverShow,
      disableFrozen,
      forceScrollOffset,
      responseHeight,
      keyWords,
      rowHeight,
      sheetIsFiltered,
      allowAdd,
      noRecordAllowAdd,
      showNewRecord,
      showSummary,
      renderFooterCell,
      defaultScrollLeft,
      scrollBarInOut,
      onCellEnter,
      onCellLeave,
    } = this.props;
    const { sheetColumnWidths } = this.state;
    const data = this.data;
    let tableHeight = !_.isUndefined(rowCount)
      ? rowCount * rowHeight + (this.horizontalScroll ? this.scrollbarWidth + 3 : 0)
      : height;
    return (
      <div
        ref={tablecon => (this.tablecon = tablecon)}
        className={cx('worksheetTable', { subList: isSubList })}
        style={{
          position: 'relative',
          width: '100%',
          height: !_.isUndefined(rowCount)
            ? rowCount * rowHeight + (this.horizontalScroll ? this.scrollbarWidth + 3 : 0)
            : '100%',
        }}
      >
        <MDTable
          id={id}
          loading={loading}
          scrollBarHoverShow={scrollBarHoverShow}
          scrollBarInOut={scrollBarInOut}
          disableFrozen={disableFrozen}
          responseHeight={responseHeight}
          width={width}
          height={tableHeight}
          ref={this.mdtable}
          defaultScrollLeft={defaultScrollLeft}
          showFooterRow={showSummary}
          forceScrollOffset={forceScrollOffset}
          style={{ borderBottom: '1px solid rgba(0,0,0,.06)' }}
          rowHeight={rowHeight}
          scrollbarWidth={this.scrollbarWidth}
          columnCount={this.columns.length}
          rowCount={this.rowCount}
          fixedColumnCount={disableFrozen ? 1 : this.fixedColumnCount}
          renderCell={this.renderCell}
          onCellEnter={onCellEnter}
          onCellLeave={onCellLeave}
          renderFooterCell={renderFooterCell}
          getCellWidth={this.getCellWidth}
          sheetColumnWidths={sheetColumnWidths}
          heightOffset={isSubList && (_.last(data) || {}).isSubListFooter ? -8 : 0}
          renderEmpty={({ style }) => (
            <NoRecords
              icon={emptyIcon}
              text={emptyText}
              style={style}
              sheetIsFiltered={sheetIsFiltered}
              allowAdd={allowAdd && noRecordAllowAdd}
              showNewRecord={showNewRecord}
            />
          )}
        />
        {!data.length && keyWords && <NoSearch keyWords={keyWords} />}
      </div>
    );
  }
}
