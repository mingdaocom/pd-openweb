import React, { Fragment } from 'react';
import { flushSync } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _, {
  debounce,
  filter,
  find,
  findIndex,
  get,
  includes,
  isArray,
  isEmpty,
  isFunction,
  isUndefined,
  last,
  omit,
  pick,
} from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Button, Dropdown, Skeleton, Tooltip } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import worksheetAjax from 'src/api/worksheet';
import { createRequestPool } from 'worksheet/api/standard';
import { mobileSelectRecord } from 'mobile/components/RecordCardListDialog';
import { useBatchEditRecord } from 'worksheet/common/BatchEditRecord';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import { getTreeExpandCellWidth } from 'worksheet/common/TreeTableHelper';
import WorkSheetFilter from 'worksheet/common/WorkSheetFilter';
import Pagination from 'worksheet/components/Pagination';
import { SearchInput } from 'worksheet/components/RelateRecordTable/Operate';
import MobileSearchInput from 'worksheet/components/SearchInput';
import { FORM_ERROR_TYPE_TEXT, FROM } from 'src/components/Form/core/config';
import DataFormat from 'src/components/Form/core/DataFormat';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { updateRelateRecordSorts } from 'src/pages/worksheet/controllers/record';
import { filterEmptyChildTableRows } from 'src/utils/core/childTable';
import { parseAdvancedSetting } from 'src/utils/domain/control/advancedSetting';
import { getTitleTextFromControls } from 'src/utils/domain/control/display';
import { updateOptionsOfControls } from 'src/utils/domain/control/options';
import { sortControlByIds } from 'src/utils/domain/control/sort';
import { controlState } from 'src/utils/domain/control/state';
import { controlBatchCanEdit } from 'src/utils/domain/control/state';
import { replaceByIndex } from 'src/utils/domain/control/state';
import { canAsUniqueWidget } from 'src/utils/domain/control/style';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import { checkCellIsEmpty, WIDGET_VALUE_ID } from 'src/utils/domain/control/value';
import { SYS } from 'src/utils/domain/control/widget';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { CONTROL_EDITABLE_WHITELIST } from 'src/utils/domain/worksheet/constants';
import { CHILD_TABLE_ALLOW_IMPORT_CONTROL_TYPES, ROW_HEIGHT } from 'src/utils/domain/worksheet/constants';
import {
  SHEET_VIEW_HIDDEN_TYPES,
  SYSTEM_CONTROLS,
  WORKSHEETTABLE_FROM_MODULE,
} from 'src/utils/domain/worksheet/constants';
import { getSheetStylesOfRelateRecordTable } from 'src/utils/domain/worksheet/helpers';
import {
  copySublistRow,
  filterRowsByKeywords,
  formatRecordToRelateRecord,
  handleSortRows,
  handleUpdateDefsourceOfControl,
} from 'src/utils/domain/worksheet/record';
import { getSheetViewRows } from 'src/utils/domain/worksheet/tree';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { addBehaviorLog } from 'src/utils/services/project';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';
import ColumnHead from '../BaseColumnHead';
import RowHeadColumn from '../BaseColumnHead/RowHeadColumn';
import { useChildTableDialog } from '../ChildTableDialog';
import ExportSheetButton from '../ExportSheetButton';
import { useImportFileToChildTable } from '../ImportFileToChildTable';
import WorksheetTable from '../WorksheetTable';
import ChildTableContext from './ChildTableContext';
import RowHead, {
  hideFloatDragNow,
  hideFloatInsertNow,
  scheduleHideRowFloats,
  showRowFloats,
} from './ChildTableRowHead';
import ChildTableSummaryCell from './ChildTableSummaryCell';
import MobileTable from './MobileTable';
import * as actions from './redux/actions';
import RowDetailMobile from './RowDetailMobileModal';
import RowDetail from './RowDetailModal';
import RowDragManager from './rowDrag';
import { getEffectedControlIds } from './utils';

// 子表批量编辑：选中编辑行数超过此值不走联动重算，仅直接更新被改字段（计算字段保存后由后端补算），
// 避免上百行逐行跑 DataFormat + 他表字段逐行请求造成的性能问题。
const SUBLIST_BATCH_EFFECT_MAX_ROWS = 100;

const IconBtn = styled.span`
  color: var(--color-text-tertiary);
  display: inline-block;
  height: 28px;
  font-size: 20px;
  line-height: 28px;
  padding: 0 4px;
  border-radius: 5px;
  &:hover {
    background: var(--color-background-hover);
  }
`;
const SearchResultNum = styled.div`
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-right: 16px;
`;
const AddRowComp = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 36px;
  cursor: pointer;
  padding-left: 14px;
  font-size: 12px;
  .hoverShow {
    visibility: hidden;
  }
  &:hover {
    background: var(--color-background-secondary);
    .hoverShow {
      visibility: visible;
    }
  }
`;
const BatchAddOfAddRowComp = styled.div`
  margin-left: 32px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-secondary);
  border-radius: 4px;
  padding: 0 8px;
  background: var(--color-background-primary);
  &:hover {
    color: var(--color-primary);
  }
`;
const isMobile = browserIsMobile();
const systemControls = SYSTEM_CONTROLS.map(c => ({
  ...c,
  fieldPermission: '111',
}));
const MAX_COUNT = 1000;
// 手动排序 / 定位插入行的记录数上限：超过后只见当前页或数据量过大，
// 跨页手动排序与定位插入都失去意义，一律禁用并隐藏对应的拖拽手柄 / 插入加号
const MAX_ROW_COUNT_FOR_DRAG_INSERT = 200;

// 从 html 代码创建元素
const createElementFromHtml = html => {
  const con = document.createElement('div');
  con.innerHTML = html;
  return con.firstElementChild;
};
const maxAllowFrozenColumnIndex = 10;
const getDefaultSummaryTypes = control => {
  const types = safeParse(control?.advancedSetting?.statisticsseting || '[]', 'array');
  return types.reduce((acc, curr) => {
    acc[curr.id] = curr.type;
    return acc;
  }, {});
};
class ChildTable extends React.Component {
  static contextType = RecordInfoContext;
  static propTypes = {
    mode: PropTypes.string,
    entityName: PropTypes.string,
    recordId: PropTypes.string,
    control: PropTypes.shape({}),
    masterData: PropTypes.shape({}),
    registerCell: PropTypes.func,
    loadRows: PropTypes.func,
    initRows: PropTypes.func,
    addRow: PropTypes.func,
    updateRow: PropTypes.func,
    deleteRow: PropTypes.func,
    sortRows: PropTypes.func,
    resetRows: PropTypes.func,
    mobileIsEdit: PropTypes.bool,
    showSearch: PropTypes.bool,
    showExport: PropTypes.bool,
    openSelectRecords: PropTypes.func,
    openBatchEditRecord: PropTypes.func,
    openChildTable: PropTypes.func,
    importFileToChildTable: PropTypes.func,
  };
  static defaultProps = {
    masterData: {
      formData: [],
    },
    registerCell: () => {},
  };
  static getDerivedStateFromProps(props, state) {
    const nextValue = _.get(props, 'control.value');
    if (!state.__valueChangedInited) {
      return {
        __valueChangedInited: true,
        __lastObservedValue: nextValue,
        valueChanged: false,
      };
    }
    if (!_.isEqual(state.__lastObservedValue, nextValue)) {
      return {
        __lastObservedValue: nextValue,
        valueChanged: true,
      };
    }

    // 主记录保存后子表 control.value 切回已保存态，需让筛选/刷新等依赖项重新可用；
    // 真正的"已脏未保存"状态由 changes.isDirty / recordEditing 持续兜底。
    if (state.valueChanged) {
      return {
        valueChanged: false,
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.defaultDirection = get(props, 'control.advancedSetting.direction') === '1' ? 'vertical' : 'horizontal';
    this.state = {
      controls: this.getControls(props),
      tempSheetColumnWidths: {},
      previewRowIndex: null,
      recordVisible: false,
      loading: !!props.recordId && !props.initSource && !(get(props, 'base.loaded') || get(props, 'base.reset')),
      selectedRowIds: [],
      pageIndex: 1,
      keywords: '',
      pageSize: this.settings.rownum,
      headHeight: 34,
      frozenIndex: this.settings.frozenIndex,
      frozenIndexChanged: false,
      disableMaskDataControls: {},
      rowsLoadingStatus: {},
      showLoadingMask: false,
      menuVisible: false,
      layoutDirection: this.defaultDirection,
    };
    this.state.sheetColumnWidths = this.getSheetColumnWidths();
    this.controls = props.controls;
    this.abortController = typeof AbortController !== 'undefined' && new AbortController();
    this.requestPool = createRequestPool({
      abortController: this.abortController,
    });
    const _handleUpdateCell = this.handleUpdateCell.bind(this);
    this.handleUpdateCell = (...args) => {
      flushSync(() => {
        _handleUpdateCell(...args);
      });
    };
    this.dataFormatCacheMap = new Map();
    props.registerCell(this);
    this.rowsLoading = {};
    this.rowDragManager = new RowDragManager();
  }
  componentDidMount() {
    const { control, recordId, needResetControls } = this.props;
    this.updateDefsourceOfControl();
    if (recordId) {
      if (!(get(this, 'props.base.loaded') || get(this, 'props.base.reset'))) {
        this.loadRows(undefined, {
          needResetControls,
        });
      } else {
        // store 已加载完成(如大表单复用/切换记录预置的 store)，loadRows 不会再触发，
        // 此时若树形 treeMap 未建则主动补建，避免展开 icon 不显示
        this.ensureTreeTableViewData();
      }
    }
    if (_.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, options => this.refresh(null, options));
    }
    if (browserIsMobile()) return;
    $(this.childTableCon).on('mouseenter', '.cell:not(.row-head)', this.handleMouseEnter);
    $(this.childTableCon).on('mouseleave', '.cell:not(.row-head)', this.handleMouseLeave);
    window.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('click', this.hideRowFloats, true);
  }
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.refreshFlag && this.props.refreshFlag !== prevProps.refreshFlag) {
        this.refresh();
      }
      const { initRows } = this.props;
      this.updateDefsourceOfControl(this.props);
      const control = prevProps.control;
      const nextControl = this.props.control;
      const isAddRecord = !this.props.recordId;
      const valueChanged = !_.isEqual(control.value, nextControl.value);
      if (this.props.recordId !== prevProps.recordId) {
        this.refresh(this.props, {
          needResetControls: false,
        });
      } else if (isAddRecord && valueChanged && typeof nextControl.value === 'undefined') {
        initRows([]);
      }
      if (
        nextControl.controlId !== control.controlId ||
        !_.isEqual(nextControl.showControls, control.showControls) ||
        !_.isEqual(
          (control.relationControls || []).map(a => a.fieldPermission),
          (nextControl.relationControls || []).map(a => a.fieldPermission),
        ) ||
        !_.isEqual(
          (control.relationControls || []).map(a => a.required),
          (nextControl.relationControls || []).map(a => a.required),
        )
      ) {
        this.setState(
          {
            controls: this.getControls(this.props),
          },
          () => {
            if (!_.isEqual(nextControl.showControls, control.showControls)) {
              this.setState({
                sheetColumnWidths: this.getSheetColumnWidths(this.props.control),
              });
            }
          },
        );
      } // 重新渲染子表来适应新宽度

      // 重新渲染子表来适应新宽度
      if (
        this.props.control.sideVisible !== prevProps.control.sideVisible ||
        this.props.control.formWidth !== prevProps.control.formWidth
      ) {
        setTimeout(() => {
          try {
            if (this.worksheettable && this.worksheettable.current) {
              const ref = this.worksheettable.current;
              if (typeof ref.updateSize === 'function') {
                ref.updateSize();
              } else if (typeof ref.handleUpdate === 'function') {
                ref.handleUpdate();
              }
            }
          } catch (err) {
            console.error(err);
          }
        }, 100);
      }
      if (!_.isEqual(prevProps.rows, this.props.rows)) {
        const { pageIndex, pageSize } = this.state;
        const pageNum = Math.ceil(this.props.rows.length / pageSize);
        if (pageIndex > pageNum && pageNum) {
          this.setState({
            pageIndex: pageNum,
          });
        }
        if (get(this.props, 'lastAction.type') === 'CLEAR_AND_SET_ROWS') {
          this.dataFormatCacheMap.clear();
        }
      }
      this.ensureTreeTableViewData();
    }

    // 行数达到上限、权限变化等导致插入加号 / 拖拽手柄不再可用时立即收掉：
    // 它们挂在 body 上，只靠 hover 事件收不掉「加到上限时指针没再移动」的残留
    if (this.prevCanInsertRow && !this.canInsertRow) {
      hideFloatInsertNow();
    }

    if (this.prevCanDragRow && !this.canDragRow) {
      hideFloatDragNow();
    }

    this.prevCanInsertRow = this.canInsertRow;
    this.prevCanDragRow = this.canDragRow;
  }

  // 树形子表自愈：行已就位但 treeMap 未覆盖根行时主动补建一次。
  // 切换记录时大表单会替换子表 store，新 store 的建树逻辑(setRowsFromStaticRows)可能排在
  // waitListForLoadRows 队列里，而该队列仅在 LOAD_ROWS_COMPLETE 时 drain；若新 store 未走
  // loadRows 便不会触发，导致树永不建、展开 icon 消失。此处兜底覆盖所有行注入路径。
  ensureTreeTableViewData() {
    const { base = {}, rows = [], treeTableViewData = {}, updateTreeTableViewData } = this.props;
    if (!get(base, 'isTreeTableView') || !isFunction(updateTreeTableViewData)) {
      return;
    }
    const realRows = rows.filter(r => r.rowid && !/^empty-/.test(r.rowid));
    if (!realRows.length) {
      return;
    }
    const treeMap = treeTableViewData.treeMap || {};
    const rootRows = realRows.filter(r => !r.pid);
    const missing = rootRows.some(r => !treeMap[r.rowid]);
    if (!missing) {
      return;
    }

    // 用 rows 引用去重：同一份 rows(引用未变)重建仍补不出根行(degenerate)时不再重试，避免死循环；
    // 切换/切回记录会替换 store 产生新 rows 引用，不会被误跳过，确保能重新建树
    if (this._treeRebuiltForRows === rows) {
      return;
    }
    this._treeRebuiltForRows = rows;
    updateTreeTableViewData();
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.state, nextState)) {
      return true;
    }
    return (
      !_.isEqual(get(this.props, 'treeTableViewData.treeMap'), get(nextProps, 'treeTableViewData.treeMap')) ||
      !_.isEqual(this.props.rows, nextProps.rows) ||
      !_.isEqual(this.props.cellErrors, nextProps.cellErrors) ||
      !_.isEqual(this.props.mobileIsEdit, nextProps.mobileIsEdit) ||
      !_.isEqual(this.props.control.relationControls, nextProps.control.relationControls) ||
      !_.isEqual(this.props.control.fieldPermission, nextProps.control.fieldPermission) ||
      !_.isEqual(this.props.sortConfig, nextProps.sortConfig) ||
      !_.isEqual(this.props.filterControls, nextProps.filterControls) ||
      this.props.realCount !== nextProps.realCount ||
      !_.isEqual(this.props.changes, nextProps.changes) ||
      !_.isEqual(this.props.valueChanged, nextProps.valueChanged)
    );
  }
  componentWillUnmount() {
    const { mode, control } = this.props;
    if (mode !== 'dialog' && _.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, undefined);
    }
    $(this.childTableCon).off('mouseenter', '.cell:not(.row-head)', this.handleMouseEnter);
    $(this.childTableCon).off('mouseleave', '.cell:not(.row-head)', this.handleMouseLeave);
    window.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.hideRowFloats, true);
    this.abortController && this.abortController.abort && this.abortController.abort();
    this.dataFormatCacheMap.clear();
    this.rowDragManager && this.rowDragManager.destroy();
    hideFloatInsertNow();
    hideFloatDragNow();
    window.handFocusCell = false;
  }
  worksheettable = React.createRef();
  searchRef = React.createRef();
  get settings() {
    const { control = {} } = this.props;
    const parsedSettings = parseAdvancedSetting(control.advancedSetting);
    let { min, max, rownum, enablelimit, treeLayerControlId } = parsedSettings;
    let minCount;
    let maxCount = _.get(window, 'shareState.isPublicForm') ? 200 : MAX_COUNT;
    if (enablelimit) {
      minCount = min;
      maxCount = max;
    }
    return {
      ...parsedSettings,
      minCount,
      maxCount,
      rownum,
      treeLayerControlId,
    };
  }
  // 未筛选真实总数：筛选生效时 rows 只是命中筛选的子集、分页时只有当前页，
  // 行数上限与拖拽/插入阈值都必须按真实总数判断，否则筛选一下这些限制就失效了。
  // realCount 由 store 在未筛选加载时落值并按本地增删维护，未知时退回当前 rows 行数。
  get totalRowCount() {
    const { rows = [], realCount } = this.props;
    const loadedCount = filterEmptyChildTableRows(rows).length;

    return _.isNumber(realCount) ? Math.max(realCount, loadedCount) : loadedCount;
  }
  get useUserPermission() {
    const { control } = this.props;
    const [isHiddenOtherViewRecord] = (control.strDefault || '000').split('');
    return !!+isHiddenOtherViewRecord;
  }
  get searchConfig() {
    const { searchConfig, base } = this.props;
    return get(base, 'searchConfig') || searchConfig;
  }
  get worksheetInfo() {
    const { base = {} } = this.props;
    return base.worksheetInfo || {};
  }
  get showAsPages() {
    const { base = {} } = this.props;
    return get(this, 'props.control.advancedSetting.showtype') === '2' && !isMobile && !base.isTreeTableView;
  }
  getControls(props, { newControls } = {}) {
    props = props || this.props;
    const { baseLoading, from, appId, base = {}, control = {}, updateBase } = props;
    const { useUserPermission } = this;
    const { instanceId, workId, worksheetInfo } = base;
    const isWorkflow =
      ((instanceId && workId) || window.shareState.isPublicWorkflowRecord) &&
      worksheetInfo.workflowChildTableSwitch !== false;
    const { showControls = [], advancedSetting = {}, relationControls = [] } = control;
    if (baseLoading) {
      return [];
    }
    const controls = replaceControlsTranslateInfo(
      appId,
      worksheetInfo.worksheetId,
      (newControls || get(base, 'controls') || props.controls).map(c => ({
        ...c,
        ...(isWorkflow
          ? {}
          : {
              controlPermissions:
                isRelateRecordTableControl(c) || c.type === 34
                  ? '000'
                  : useUserPermission
                    ? c.controlPermissions
                    : controlState(control, from).editable
                      ? '111'
                      : '101',
            }),
        // ...(isWorkflow && control.type === WIDGETS_TO_API_TYPE_ENUM.SECTION ? {} : {}),
      })),
    );
    let controlssorts = [];
    try {
      controlssorts = JSON.parse(advancedSetting.controlssorts);
    } catch (err) {
      console.log(err);
    }
    // controlssorts 可能是子表新增字段之前存下的旧排序，缺失的字段按显示字段顺序补齐，
    // 避免落到接口返回的无序 controls 上导致列顺序错乱

    const sortedControlIds = _.isEmpty(controlssorts) ? showControls : _.uniq(controlssorts.concat(showControls));

    let result = sortControlByIds(controls, sortedControlIds).map(c => {
      const control = {
        ...c,
      };
      const resetedControl = _.find(relationControls.concat(systemControls), {
        controlId: control.controlId,
      });
      if (resetedControl) {
        control.required = resetedControl.required;
        control.fieldPermission = resetedControl.fieldPermission;
      }
      if (!_.find(showControls, scid => control.controlId === scid)) {
        if (control.type === 52) {
          control.hidden = true;
          if (isWorkflow) {
            control.fieldPermission = (control.fieldPermission || '000').replace(/^(\d)\d(\d)$/, '$11$2');
          }
        } else {
          control.fieldPermission = (control.fieldPermission || '000').replace(/^\d(\d)\d$/, '0$10');
        }
      } else {
        control.fieldPermission = replaceByIndex(control.fieldPermission || '111', 2, '1');
      }
      if (!useUserPermission && !isWorkflow) {
        control.controlPermissions = '111';
      } else {
        if (isWorkflow) {
          control.controlPermissions = replaceByIndex(control.controlPermissions || '111', 2, '1');
        }
      }
      if (
        control.controlId === 'ownerid' ||
        (_.get(window, 'shareState.isPublicWorkflowRecord') &&
          _.includes(
            [
              WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
              WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
              WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
            ],

            control.type,
          ))
      ) {
        control.controlPermissions = replaceByIndex(control.controlPermissions || '111', 1, '0');
        control.fieldPermission = replaceByIndex(control.fieldPermission || '111', 1, '0');
      }
      return control;
    });
    updateBase({
      controls: result,
    });
    result = result.filter(
      c =>
        c &&
        !(
          window.isPublicWorksheet &&
          _.includes([WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT], c.type)
        ),
    );
    return result;
  }
  updateAbortController = () => {
    this.abortController && this.abortController.abort && this.abortController.abort();
    this.abortController = typeof AbortController !== 'undefined' && new AbortController();
    this.requestPool = createRequestPool({
      abortController: this.abortController,
    });
    this.dataFormatCacheMap.clear();
  };
  getControl(controlId) {
    return _.find(this.state.controls, {
      controlId,
    });
  }
  // 任意点击都收起行悬浮手柄 / 加号：点击可能打开弹窗（如关联记录的选择记录），弹窗盖住表格后单元格收不到
  // mouseleave，它们会一直停在弹窗上面。捕获阶段监听，避免被单元格内的 stopPropagation 拦住
  hideRowFloats = () => {
    hideFloatInsertNow();
    hideFloatDragNow();
  };
  handleKeyDown = e => {
    if (
      (window.isMacOs ? e.metaKey : e.ctrlKey) &&
      e.key === 'Enter' &&
      this.childTableCon &&
      this.childTableCon.querySelector('.cell.focus')
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.handleAddRowByLine();
    }
  };
  handleClearAndSetRows(rows) {
    const { control, clearAndSetRows } = this.props;
    const { controls = [] } = this.state;
    const sort = safeParse(control.advancedSetting.sorts)[0];
    if (sort && sort.controlId) {
      const sortControl = _.find(controls, c => c.controlId === sort.controlId);
      if (sortControl) {
        clearAndSetRows(handleSortRows(rows, sortControl, sort.isAsc));
        return;
      }
    }
    clearAndSetRows(rows);
  }
  updateDefsourceOfControl(nextProps) {
    const { recordId, masterData } = nextProps || this.props;
    const relateRecordControl = (nextProps || this.props).control;
    this.setState(oldState => {
      return {
        controls: handleUpdateDefsourceOfControl({
          recordId,
          relateRecordControl,
          masterData,
          controls: oldState.controls,
        }),
      };
    });
  }
  loadRows(nextProps, { needResetControls, isRefresh } = {}) {
    const { control, recordId, masterData, loadRows, from, base = {} } = nextProps || this.props;
    const { isTreeTableView, instanceId, workId, worksheetInfo, originControls } = base;
    const isWorkflow =
      ((instanceId && workId) || window?.shareState?.isPublicWorkflowRecord) &&
      worksheetInfo?.workflowChildTableSwitch !== false;
    if (!recordId || !masterData) {
      return;
    }
    loadRows({
      getWorksheet: needResetControls,
      worksheetId: masterData.worksheetId,
      recordId,
      controlId: control.controlId,
      isCustomButtonFillRecord: control.isCustomButtonFillRecord,
      from,
      isTreeTableView,
      setLoadingInfo: control.setLoadingInfo,
      callback: res => {
        if (isFunction(get(control, 'dataFormat.current.revalidateControl'))) {
          control.dataFormat.current.revalidateControl(control.controlId);
        }
        if (res === null) {
          this.setState({
            error: _l('没有权限'),
          });
          return;
        }
        const state = {
          loading: false,
        };
        if (needResetControls) {
          let newControls = (_.get(res, 'worksheet.template.controls') || _.get(res, 'template.controls')).concat(
            systemControls,
          );
          // 这里要和 getControls 一起统一到 action 内处理
          const { uniqueControlIds } = parseAdvancedSetting(control.advancedSetting);
          newControls = newControls.map(c => ({
            ...c,
            uniqueInRecord: includes(uniqueControlIds, c.controlId) && canAsUniqueWidget(c),
          }));
          if (newControls && newControls.length) {
            state.controls = this.getControls(nextProps, {
              newControls,
            });
          }
        }
        this.setState(state, () => {
          if (isWorkflow && isRefresh) {
            if (!isEmpty(originControls) && isFunction(control.updateRelationControls)) {
              control.updateRelationControls(control.controlId, originControls);
            }
          }
        });
      },
    });
  }
  refresh = (nextProps, { needResetControls = true } = {}) => {
    this.setState({
      loading: true,
      keywords: undefined,
      isBatchEditing: false,
      selectedRowIds: [],
      pageIndex: 1,
    });
    this.loadRows(nextProps, {
      needResetControls,
      isRefresh: true,
    });
    if (get(this, 'searchRef.current.clear')) {
      this.searchRef.current.clear();
    }
    this.dataFormatCacheMap.clear();
  };
  triggerCustomEvent = () => {
    if (isFunction(get(this, 'props.control.triggerCustomEvent'))) {
      get(this, 'props.control.triggerCustomEvent')(ADD_EVENT_ENUM.CHANGE);
    }
  };
  getShowColumns() {
    const { control, treeTableViewData, rows, base = {} } = this.props;
    const { isTreeTableView } = base;
    const { controls } = this.state;
    const hiddenTypes = window.isPublicWorksheet ? [48] : [];
    const { h5showtype } = parseAdvancedSetting(control.advancedSetting);
    let columns = !controls.length
      ? [{}]
      : controls
          .filter(c =>
            browserIsMobile() && h5showtype == '2'
              ? c.type !== 34 &&
                !isRelateRecordTableControl(c) &&
                !_.includes(hiddenTypes.concat(SHEET_VIEW_HIDDEN_TYPES), c.type)
              : _.find(control.showControls, scid => scid === c.controlId) &&
                c.type !== 34 &&
                controlState(c).visible &&
                !isRelateRecordTableControl(c) &&
                !_.includes(hiddenTypes.concat(SHEET_VIEW_HIDDEN_TYPES), c.type),
          )
          .map(c => _.assign({}, c));
    if (isTreeTableView && columns[0]) {
      const appendWidth = getTreeExpandCellWidth(treeTableViewData.maxLevel, rows.length);
      this.expandCellAppendWidth = appendWidth;
      columns[0].appendWidth = appendWidth;
      columns[0].hideFrozen = true;
      columns[0].isTreeExpandCell = true;
    }
    return columns;
  }
  getSheetColumnWidths(control) {
    control = control || this.props.control;
    const columns = this.getShowColumns();
    let widths = {};
    try {
      widths = JSON.parse(control.advancedSetting.widths);
    } catch (err) {
      console.log(err);
    }
    if (isArray(widths)) {
      let result = {};
      columns.forEach((column, i) => {
        result[column.controlId] = widths[i];
      });
      return result;
    }
    return pick(
      widths,
      columns.map(c => c.controlId),
    );
  }
  newRow = (defaultRow, { isDefaultValue, isCreate, isQueryWorksheetFill, isImportFromExcel } = {}) => {
    const tempRowId = !isDefaultValue ? `temp-${uuidv4()}` : `default-${uuidv4()}`;
    const row = this.rowUpdate(
      {
        row: defaultRow,
        rowId: tempRowId,
      },
      {
        isCreate,
        isQueryWorksheetFill,
        isImportFromExcel,
      },
    );
    return {
      ...row,
      rowid: tempRowId,
      pid: (defaultRow && defaultRow.pid) || '',
      allowedit: true,
      allowdelete: true,
      addTime: new Date().getTime(),
    };
  };
  copyRow(row) {
    const { addRow } = this.props;
    const rowId = `temp-${uuidv4()}`;
    addRow(
      Object.assign({}, _.omit(copySublistRow(this.state.controls, row), ['updatedControlIds']), {
        rowid: rowId,
        allowedit: true,
        isCopy: true,
        pid: row.pid,
        addTime: new Date().getTime(),
      }),
      row.rowid,
    );
    this.triggerCustomEvent();
    setTimeout(() => {
      if (!this.worksheettable.current) return;
      const activeCell = this.worksheettable.current.table.refs.dom.current.querySelector(
        '.cell.row-id-' + rowId + '.canedit',
      );
      if (activeCell) {
        activeCell.click();
      }
    }, 100);
  }
  // 拖拽排序：由行头拖拽手柄 onMouseDown 触发
  handleRowDragStart = (e, rowid) => {
    const container = _.get(this, 'worksheettable.current.table.refs.dom.current');
    if (!container || !rowid) {
      return;
    }
    const scrollViewport = container.querySelector('.scroll-y .scroll-viewport');
    this.rowDragManager.start(e, {
      container,
      rowid,
      scrollViewport,
      onDragBegin: () => {
        // 悬浮的插入加号/hover 手柄收掉，拖拽态的跟随手柄由 rowDrag 自己绘制
        hideFloatInsertNow();
        hideFloatDragNow();
      },
      onReorder: (fromRowId, toRowId, position) => {
        const { recordId, masterData, control, store, from, isDraft } = this.props;
        const recordEditing = !!(this.context && this.context.iseditting);
        // 查看已存记录（非表单编辑态）：直接走接口持久化，此时静默重排——不向大表单上报、不标脏，
        // 不触发记录变更（不误进编辑态）。新建/编辑态：本地重排并经 store 订阅同步表单值，随表单保存提交。
        const viewMode = !!(recordId && !recordEditing);
        this.props.moveRow({ fromRowId, toRowId, position, silent: viewMode });
        if (viewMode) {
          // 与关联卡片排序接口一致：editType 31 + 按新顺序的 sid 数组（后端按 rowid 轻量重排、不重建行）。
          // moveRow 已同步重排 store，直接读 store 的新顺序拼 sid。
          const orderedSids = filterEmptyChildTableRows(store.getState().rows).map(row => ({ sid: row.rowid }));
          updateRelateRecordSorts({
            worksheetId: masterData.worksheetId,
            recordId,
            isDraft: isDraft || from === FROM.DRAFT,
            changes: [{ ...control, editType: 31, value: JSON.stringify(orderedSids) }],
          });
        }
      },
    });
  };
  // 整行 hover（由表格 onCellEnter 回调，指针进入本行任意单元格即触发）时定位悬浮手柄/插入加号
  handleSublistRowHover = cellEl => {
    // 读实例上的最新值，避免 onCellEnter 闭包捕获旧的 canDragRow/canInsertRow
    const canDrag = this.canDragRow;
    const canInsert = this.canInsertRow;

    if (!canDrag && !canInsert) {
      // 行数达上限等原因导致手柄和加号都不可用：收掉可能仍悬浮着的单例元素
      hideFloatInsertNow();
      hideFloatDragNow();
      return;
    }

    if (!cellEl) {
      return;
    }
    const match = (cellEl.className || '').match(/\brow-id-([^\s]+)/);
    const rowid = match && match[1];
    if (!rowid || rowid === 'undefined' || rowid.indexOf('empty') === 0) {
      return;
    }
    showRowFloats({
      cell: cellEl,
      rowid,
      canDrag,
      canInsert,
      onDragStart: this.handleRowDragStart,
      onInsert: this.handleInsertRowAbove,
    });
  };
  // 插入行：在 hover 行的上方插入一条空行（第一行则插到最前）
  handleInsertRowAbove = rowid => {
    const { rows, addRow, control } = this.props;
    const { maxCount } = this.settings;
    const { enablelimit } = parseAdvancedSetting(control.advancedSetting);
    if (this.totalRowCount >= maxCount) {
      alert(enablelimit ? _l('已超过子表最大行数') : _l('最多输入%0条记录', maxCount), 3);
      return;
    }
    const realRows = rows.filter(r => r.rowid && !r.rowid.startsWith('empty'));
    const index = _.findIndex(realRows, r => r.rowid === rowid);
    const row = this.newRow();
    addRow(row, index <= 0 ? '__HEAD__' : realRows[index - 1].rowid);
    this.triggerCustomEvent();
    setTimeout(() => {
      if (!this.worksheettable.current) return;
      const activeCell = this.worksheettable.current.table.refs.dom.current.querySelector(
        '.cell.row-id-' + row.rowid + '.canedit',
      );
      if (activeCell) {
        activeCell.click();
      }
    }, 100);
  };
  copyRows(rows) {
    const { addRows } = this.props;
    const newRows = rows.map(row =>
      Object.assign({}, _.omit(copySublistRow(this.state.controls, row), ['updatedControlIds']), {
        rowid: `temp-${uuidv4()}`,
        allowedit: true,
        isCopy: true,
        pid: row.pid,
        addTime: new Date().getTime(),
      }),
    );
    addRows(newRows);
    this.triggerCustomEvent();
  }
  rowUpdate(
    { row, controlId, value, rowId } = {},
    { isCreate = false, isQueryWorksheetFill = false, isImportFromExcel, userTriggerChange = true } = {},
  ) {
    const { masterData, recordId } = this.props;
    const { projectId, rules = [] } = this.worksheetInfo;
    const { searchConfig } = this;
    const asyncUpdateCell = (cid, newValue) => {
      this.handleUpdateCell(
        {
          control: this.getControl(cid),
          cell: {
            controlId: cid,
            value: newValue,
          },
          row: {
            rowid: rowId || (row || {}).rowid,
          },
        },
        {
          isQueryWorksheetFill,
          asyncUpdate: true,
          userTriggerChange: false,
          updateSuccessCb: needUpdateRow => {
            if (isMobile) {
              this.handleRowDetailSave(needUpdateRow);
            }
          },
        },
      );
    };
    let formdata = null;
    const isNewRecord = isCreate || !row;
    const cacheKey = isNewRecord ? rowId : row?.rowid;
    if (isNewRecord || !cacheKey || !this.dataFormatCacheMap.has(cacheKey)) {
      formdata = new DataFormat({
        requestPool: this.requestPool,
        data: this.state.controls.map(c => {
          const importedValue = (row || {})[c.controlId];
          let controlValue = importedValue;
          if (_.isUndefined(controlValue) && (isCreate || !row)) {
            controlValue = c.value;
          }
          return {
            ...c,
            isSubList: true,
            isQueryWorksheetFill,
            // 仅对真正导入了非空值的单元格打 isImportFromExcel：未映射/空的列其值来自默认值或计算，
            // 不应被导入守卫保护，否则其首遍计算值会被当作导入值保留，挡掉依赖回填后的二次重算
            isImportFromExcel: isImportFromExcel && !checkCellIsEmpty(importedValue),
            value: controlValue,
          };
        }),
        isCreate: isCreate || !row,
        from: FROM.NEWRECORD,
        rules,
        searchConfig,
        projectId,
        masterData,
        abortController: this.abortController,
        masterRecordRowId: recordId,
        noAutoSubmit: true,
        updateLoadingItems: loadingInfo => {
          if (!row || !row.needShowLoading) return;
          this.rowsLoading[rowId] = !_.every(Object.values(loadingInfo), b => !b);
          const newShowLoadingMask = !Object.values(this.rowsLoading).every(v => v === false);
          if (newShowLoadingMask !== this.showLoadingMask) {
            this.setState({
              showLoadingMask: newShowLoadingMask,
            });
          }
          this.showLoadingMask = newShowLoadingMask;
        },
        onAsyncChange: (changes, dataFormat) => {
          flushSync(() => {
            if (rowId && row && row.needShowLoading) {
              this.rowsLoading[rowId] = !_.every(Object.values(dataFormat.loadingInfo), b => !b);
              const newShowLoadingMask = !Object.values(this.rowsLoading).every(v => v === false);
              if (newShowLoadingMask !== this.showLoadingMask) {
                this.setState({
                  showLoadingMask: newShowLoadingMask,
                });
              }
              this.showLoadingMask = newShowLoadingMask;
            }
            if (!_.isEmpty(changes.controlIds)) {
              changes.controlIds.forEach(cid => {
                asyncUpdateCell(cid, changes.value);
              });
            } else if (changes.controlId) {
              asyncUpdateCell(changes.controlId, changes.value);
            }
          });
        },
      });
      this.dataFormatCacheMap.set(cacheKey, formdata);
    } else {
      formdata = this.dataFormatCacheMap.get(cacheKey);
    }
    if (controlId) {
      // 用户真正编辑该行后，导入/查询填充语义才失效，解除对默认值联动的守卫。
      // 不能在构造后立即清除：关联记录类默认值需异步拉取详情后回填，
      // 立即清除会抢在异步回填之前，导致 isImportFromExcel 守卫失效、导入值被默认值覆盖。
      if (userTriggerChange) {
        formdata.data.forEach(c => {
          c.isImportFromExcel = false;
          c.isQueryWorksheetFill = false;
        });
      }
      formdata.updateDataSource({
        controlId,
        value,
        userTriggerChange,
      });
    }
    return [
      {
        ...(row || {}),
        rowid: row ? row.rowid : rowId,
        updatedControlIds: _.uniqBy(((row && row.updatedControlIds) || []).concat(formdata.getUpdateControlIds())),
      },
      ...filter(formdata.getDataSource(), c => c.controlId !== 'rowid'),
    ].reduce((a = {}, b = {}) =>
      Object.assign(a, {
        [b.controlId]: b.value,
      }),
    );
  }
  handleSetPageIndexWhenAddRow(newRowsLength, { atHead = false } = {}) {
    const { pageSize, pageIndex } = this.state;
    let newPageIndex = pageIndex;

    // 新行置顶时（筛选态）目标页固定为第一页，不能按总行数算到最后一页
    if (this.showAsPages && atHead) {
      if (pageIndex !== 1) {
        this.setState({ pageIndex: 1 });
      }

      return 1;
    }

    if (this.showAsPages && newRowsLength > pageSize) {
      newPageIndex = Math.ceil(newRowsLength / pageSize);
      if (pageIndex !== newPageIndex) {
        this.setState({
          pageIndex: newPageIndex,
        });
      }
    }
    return newPageIndex;
  }
  handleAddRowByLine = () => {
    const { from, control, addRow, rows, filterControls = [] } = this.props;
    const { layoutDirection } = this.state;
    const maxCount = this.settings.maxCount;
    const maxShowRowCount = this.settings.rownum;
    const controlPermission = controlState(control, from);
    const disabled = !controlPermission.editable || control.disabled;
    let { allowadd } = parseAdvancedSetting(control.advancedSetting);
    const filteredRows = filterEmptyChildTableRows(rows);
    const disabledNew = this.totalRowCount >= maxCount || disabled || !allowadd;
    if (disabledNew) {
      return;
    }
    // 筛选生效时新增的临时行会被置顶（见 redux/actions.js 的 addRow），
    // 定位、滚动、翻页都不能再按「新行在末尾」推算，否则会定位到别的行——
    // 经典模式下点中的单元格会打开对应行详情，表现为新增后打开的是筛选结果里的第一条
    const newRowAtHead = !_.isEmpty(filterControls);
    this.handleSetPageIndexWhenAddRow(filteredRows.length + 1, { atHead: newRowAtHead });
    this.updateDefsourceOfControl();
    const row = this.newRow();
    addRow(row);
    setTimeout(() => {
      try {
        if (layoutDirection === 'horizontal') {
          this.worksheettable.current.table.refs.setScroll(
            0,
            !newRowAtHead && rows.length + 1 > maxShowRowCount ? 100000 : 0,
          );
        } else {
          this.worksheettable.current.table.refs.setScroll(newRowAtHead ? 0 : 100000, 0);
        }
        setTimeout(() => {
          if (!this.worksheettable.current || !this.worksheettable.current.table) {
            return;
          }
          // 按 rowid 定位新行的可编辑单元格：行号会随置顶、分页、筛选变化，rowid 不会
          const activeCell = this.worksheettable.current.table.refs.dom.current.querySelector(
            '.cell.row-id-' + row.rowid + '.canedit',
          );
          if (activeCell) {
            activeCell.click();
          }
        }, 100);
      } catch (err) {
        console.log(err);
      }
    }, 100);
  };
  handleImport = ({ replace = false } = {}) => {
    const { control, masterData, addRows } = this.props;
    const { projectId } = this.worksheetInfo;
    const controls = this.getShowColumns();
    if (!controls.filter(c => _.includes(CHILD_TABLE_ALLOW_IMPORT_CONTROL_TYPES, c.type)).length) {
      alert(_l('没有支持导入的字段'), 3);
      return;
    }
    this.props.importFileToChildTable({
      projectId,
      maxCount: this.settings.maxCount,
      worksheetId: masterData.worksheetId,
      controlId: control.controlId,
      dataCount: this.totalRowCount,
      controls,
      onClose: data => {
        if (!_.isArray(data)) {
          return;
        }
        setTimeout(() => {
          const newRows = data.slice(0, this.settings.maxCount - this.totalRowCount).map(updatedValues =>
            this.newRow(
              omit(
                {
                  ...updatedValues,
                  needShowLoading: true,
                },
                'rowid',
              ),
              {
                isCreate: true,
                isImportFromExcel: true,
              },
            ),
          );
          if (replace) {
            this.handleClearAndSetRows(newRows);
          } else {
            addRows(newRows);
          }
        }, 0);
      },
    });
  };
  handleAddRowsFromRelateRecord = batchAddControls => {
    const { addRows, control, rows, appId } = this.props;
    let { h5showtype, h5abstractids = [] } = parseAdvancedSetting(control.advancedSetting);
    const { entityName } = this.worksheetInfo;
    const { controls } = this.state;
    const relateRecordControl = batchAddControls[0];
    if (!relateRecordControl) {
      return;
    }
    this.updateDefsourceOfControl();
    const tempRow = this.newRow();
    const relateRecord = isMobile ? mobileSelectRecord : this.props.openSelectRecords;
    relateRecord({
      entityName,
      appId,
      canSelectAll: true,
      multiple: true,
      control: relateRecordControl,
      controlId: relateRecordControl.controlId,
      parentWorksheetId: control.dataSource,
      allowNewRecord: false,
      viewId: relateRecordControl.viewId,
      relateSheetId: relateRecordControl.dataSource,
      filterRowIds:
        relateRecordControl.unique || relateRecordControl.uniqueInRecord
          ? (rows || [])
              .map(r => _.get(safeParse(r[relateRecordControl.controlId], 'array'), '0.sid'))
              .filter(_.identity)
          : [],
      formData: controls
        .map(c => ({
          ...c,
          value: tempRow[c.controlId],
        }))
        .concat(this.props.masterData.formData),
      onOk: selectedRecords => {
        const rowsLength = this.totalRowCount;
        if (rowsLength + selectedRecords.length > this.settings.maxCount) {
          alert(_l('最多输入%0条记录，超出的记录不写入', this.settings.maxCount), 3);
        }
        addRows(
          selectedRecords.slice(0, this.settings.maxCount - rowsLength).map(selectedRecord => {
            const row = this.rowUpdate({
              row: this.newRow(),
              controlId: relateRecordControl.controlId,
              value: JSON.stringify(formatRecordToRelateRecord(relateRecordControl.relationControls, [selectedRecord])),
            });
            return row;
          }),
        );
        this.handleSetPageIndexWhenAddRow(rowsLength + selectedRecords.length);
        this.triggerCustomEvent();
        setTimeout(() => {
          try {
            const ele = document.querySelector('.mobileSheetRowRecord .recordScroll');
            if (isMobile && ele) {
              const itemHeight =
                h5showtype === '2' ? 36 * ((_.isEmpty(h5abstractids) ? 3 : h5abstractids.length) + 1) : 36;
              ele.scrollTop = ele.scrollTop + (selectedRecords.length - 1) * itemHeight;
            }
            this.worksheettable.current.table.refs.setScroll(0, 100000);
          } catch (err) {
            console.log(err);
          }
        }, 100);
      },
    });
  };
  handleUpdateCell({ control, cell, row = {} }, options) {
    const { rows, updateRow } = this.props;
    const { controls } = this.state;
    const rowData = _.find(rows, r => r.rowid === row.rowid);
    if (!rowData) {
      return;
    }
    let { value } = cell;
    let tempRowId;
    const isEmptyRow = row?.rowid?.startsWith('empty');
    if (isEmptyRow) {
      if (this.disabledNew || this.isExceed) {
        return;
      }
      tempRowId = `temp-${uuidv4()}`;
    }
    const newRow = this.rowUpdate(
      {
        // 空行（仅含 rowid）直接转新行时要补 allowedit/allowdelete：rowUpdate 会原样透传这些字段，
        // 不补的话新行 allowedit 为 undefined，canedit 计算为 false —— 编辑失焦后这条记录无法再次编辑。
        row: {
          ...rowData,
          ...(tempRowId
            ? {
                rowid: tempRowId,
                isCreate: true,
                allowedit: true,
                allowdelete: true,
              }
            : {}),
        },
        controlId: cell.controlId,
        value,
      },
      {
        ...options,
        control,
      },
    );
    const update = debounce(
      () => {
        if (_.isFunction(options.updateSuccessCb)) {
          options.updateSuccessCb(newRow);
        }
        updateRow(
          {
            rowid: row.rowid,
            value: newRow,
          },
          {
            asyncUpdate: options.asyncUpdate,
          },
        );
        if (!options.asyncUpdate) {
          this.triggerCustomEvent();
        }
      },
      isUndefined(options.debounceTime) ? 300 : options.debounceTime,
    );

    // 处理新增自定义选项
    if (
      _.includes([WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN], control.type) &&
      /{/.test(value)
    ) {
      const newOption = {
        index: control.options.length + 1,
        isDeleted: false,
        key: _.last(JSON.parse(value)),
        ...JSON.parse(_.last(JSON.parse(value))),
      };
      controls.forEach(c => {
        if (c.controlId === control.controlId) {
          c.options = _.uniqBy([...control.options, newOption], 'key');
        }
      });
      update();
      return;
    }
    update.apply(this);
  }
  handleRowDetailSave = (row, updatedControlIds) => {
    const { updateRow, addRow } = this.props;
    const { previewRowIndex, controls } = this.state;
    const newControls = updateOptionsOfControls(
      controls.map(c => ({
        ...{},
        ...c,
        value: row[c.controlId],
      })),
      row,
    );
    this.setState(
      {
        controls: controls.map(c => {
          const newControl = _.find(newControls, {
            controlId: c.controlId,
          });
          return newControl
            ? {
                ...newControl,
                value: c.value,
              }
            : c;
        }),
      },
      () => {
        row.updatedControlIds = _.isEmpty(row.updatedControlIds)
          ? updatedControlIds
          : _.uniqBy(row.updatedControlIds.concat(updatedControlIds));
        row.updatedControlIds = row.updatedControlIds.concat(
          controls
            .filter(c => _.find(updatedControlIds, cid => ((c.advancedSetting || {}).defsource || '').includes(cid)))
            .map(c => c.controlId),
        );
        if (previewRowIndex > -1) {
          updateRow({
            rowid: row.rowid,
            value: row,
          });
        } else {
          addRow(row);
        }
      },
    );
  };
  handleSwitch = ({ prev }) => {
    const { previewRowIndex } = this.state;
    let newRowIndex;
    if (prev) {
      newRowIndex = previewRowIndex - 1;
    } else {
      newRowIndex = previewRowIndex + 1;
    }
    this.openDetail(newRowIndex);
  };
  openDetail = index => {
    this.setState({
      previewRowIndex: index,
      recordVisible: true,
      isEditCurrentRow: true,
    });
  };
  handleClearCellError = (key, error) => {
    const { cellErrors, persistedCellErrors = {}, updateCellErrors } = this.props;
    if (error) {
      // 二参形式用于"失焦兜底"：把校验错误写入 cellErrors，让主记录保存时也能拦截。
      // 同时标记 persisted：这类非法值没有落进 row 数据，保存时的 row 端校验发现不了，
      // 需要在保存合并时保留（区别于上一次保存写回的必填/规则错误）
      if (cellErrors[key] === error && persistedCellErrors[key] === error) return;
      updateCellErrors(
        {
          ...cellErrors,
          [key]: error,
        },
        { persisted: { [key]: error } },
      );
      return;
    }
    updateCellErrors(_.omit(cellErrors, [key]));
  };
  compareValue(control, value1, value2) {
    try {
      if (control && _.includes([26, 27, 48], control.type)) {
        return _.isEqual(
          safeParse(value1, 'array').map(c => c[WIDGET_VALUE_ID[control.type]]),
          safeParse(value2, 'array').map(c => c[WIDGET_VALUE_ID[control.type]]),
        );
      } else {
        return value1 === value2;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  handleUniqueValidate = (controlId, value, rowId, backendCheck) => {
    const { rows, control, updateCellErrors } = this.props;
    const { controls } = this.state;
    const checkControl = _.find(controls, {
      controlId,
    });
    const { uniqueControlIds } = parseAdvancedSetting(control.advancedSetting);
    const isUniqueInRecord = !_.find(rowId ? rows.filter(row => row.rowid !== rowId) : rows, row =>
      this.compareValue(checkControl, row[controlId], value),
    );
    if (_.includes(uniqueControlIds, controlId)) {
      return isUniqueInRecord;
    } else if (!isUniqueInRecord) {
      return false;
    } else if (backendCheck) {
      if (checkControl && checkControl.unique && !checkControl.uniqueInRecord) {
        worksheetAjax
          .checkFieldUnique({
            worksheetId: control.dataSource,
            controlId,
            controlType: checkControl.type,
            controlValue: value,
          })
          .then(res => {
            if (!res.isSuccess && res.data && res.data.rowId !== rowId) {
              // 不唯一。跨记录唯一性由接口判定，row 端校验发现不了，标记 persisted 让保存时保留
              const uniqueError = FORM_ERROR_TYPE_TEXT.UNIQUE(checkControl, true);
              const uniqueErrorKey = `${rowId}-${controlId}`;
              updateCellErrors(
                {
                  ...this.props.cellErrors,
                  [uniqueErrorKey]: uniqueError,
                },
                { persisted: { [uniqueErrorKey]: uniqueError } },
              );
            } else if (res.isSuccess) {
              // 唯一
            }
          });
      }
    } else {
      return true;
    }
  };
  handleMouseEnter = e => {
    const { layoutDirection } = this.state;
    const cell = $(e.target).closest('.cell:not(.focus)')[0];
    if (!cell) {
      return;
    }
    $(cell).addClass('errorActive');
    const { rows, cellErrors } = this.props;
    const columns = this.getShowColumns();
    const hasError = /cellControlErrorStatus/.test(cell.className);
    const cellIsEditing = /iseditting/.test(cell.className);
    const rowIndex = cell.className.match(/ row-([0-9]+) /) && Number(cell.className.match(/ row-([0-9]+) /)[1]);
    const columnIndex = cell.className.match(/ col-([0-9]+) /) && Number(cell.className.match(/ col-([0-9]+) /)[1]);
    const dataIndex = layoutDirection === 'horizontal' ? rowIndex : columnIndex - 1;
    const controlIndex = layoutDirection === 'horizontal' ? columnIndex : rowIndex + 1;
    const rowId = (rows[dataIndex] || {}).rowid;
    const controlId = !isUndefined(controlIndex) && (columns[controlIndex - 1] || {}).controlId;
    if (hasError && !cellIsEditing && rowId && controlId) {
      const error = cellErrors[rowId + '-' + controlId];
      if (error) {
        const errorEle = createElementFromHtml(`<div
            class="mdTableErrorTip"
            style="
              position: absolute;
              font-size: 12px;
              padding: 0px 8px;
              height: 26px;
              max-width: 300px;
              line-height: 26px;
              white-space: nowrap;
              background: var(--color-error);
              z-index: 2;
              color: var(--color-white)";
          >
            <div class="ellipsis" title="${error}">${error}</div>
          </div>`);
        document.body.appendChild(errorEle);
        const top =
          cell.getBoundingClientRect().y +
          (/row-0/.test(cell.getAttribute('class')) ? cell.offsetHeight - 1 : -1 * errorEle.offsetHeight);
        const left = cell.getBoundingClientRect().x;
        errorEle.style.top = top + 'px';
        errorEle.style.left = left + 'px';
        errorEle.style.zIndex = 9999999;
      }
    }
  };
  handleMouseLeave = () => {
    $('.mdTableErrorTip').remove();
    $('.cell').removeClass('errorActive');
  };
  handleBatchUpdateRecords = ({ tableRows, activeControl } = {}) => {
    const { appId, control, updateRows, rows, clearAndSetRows, updateTreeTableViewData, sortRows, sortConfig } =
      this.props;
    const { selectedRowIds, controls } = this.state;
    const { projectId, worksheetId } = this.worksheetInfo;
    if (!selectedRowIds.length) {
      return;
    }
    const selectedRows = selectedRowIds
      .map(rowId =>
        find(tableRows, {
          rowid: rowId,
        }),
      )
      .filter(_.identity)
      .filter(row => row.allowedit);
    if (!selectedRows.length) {
      return;
    }
    this.props.openBatchEditRecord({
      appId,
      worksheetId,
      projectId,
      isCharge: control.isCharge,
      selectedRows,
      activeControl,
      defaultWorksheetInfo: {
        entityName: _l('记录'),
        template: {
          controls: this.getShowColumns(),
        },
      },
      triggerBatchUpdateRecords: ({ needUpdateControls, onClose }) => {
        // 关联记录清空不能用 ''：子表提交格式化时 '' 与 'deleteRowIds: all' 都会被当作 undefined 而无法清空，
        // 必须按「该行当前关联 id」下发 `deleteRowIds: id1,id2`（与单元格清空一致）。各行待删 id 不同，
        // 故不能用单值 updateRows；又因逐行多次 updateRows 会互相覆盖只生效一条，改用 clearAndSetRows 单次提交。
        const relateClearCids = needUpdateControls
          .filter(c => c.type === 29 && c.editType === 'clear')
          .map(c => c.controlId);
        const baseChanges = needUpdateControls.reduce((acc, c) => {
          if (c.type === 29 && c.editType === 'clear') return acc;
          acc[c.controlId] = c.sourceValue || c.value;
          return acc;
        }, {});
        const selectedIdSet = new Set(selectedRows.map(r => r.rowid));
        // 关联记录清空按行计算 deleteRowIds 指令值（各行待删关联 id 不同）
        const getRelateClearValue = (row, cid) => {
          const ids = safeParse(row[cid], 'array')
            .map(r => r.sid)
            .filter(Boolean);
          return ids.length ? `deleteRowIds: ${ids.join(',')}` : '';
        };
        // clearAndSetRows 会重置展示排序（sortConfig），与原 updateRows 行为不同，这里恢复，避免副作用。
        const restoreSort = () => {
          if (sortConfig && sortConfig.controlId) {
            const sortControl = _.find(controls, {
              controlId: sortConfig.controlId,
            });
            if (sortControl) {
              sortRows({
                control: sortControl,
                isAsc: sortConfig.isAsc,
              });
            }
          }
        };
        // 被编辑字段是否存在下游联动（公式/汇总/大写金额/他表字段/动态默认值/默认值函数等）。
        // 无联动走原轻量浅合并；有联动才逐行经 rowUpdate(DataFormat) 重算依赖字段，避免无谓的整行重算开销。
        const hasEffect =
          getEffectedControlIds(
            controls,
            needUpdateControls.map(c => c.controlId),
          ).length > 0;

        // 选中编辑行数超过阈值时不走联动重算（逐行 DataFormat 计算 + 他表字段逐行请求开销过大），
        // 直接更新被改字段，计算字段留待父记录保存后由后端补算。
        if (hasEffect && selectedRows.length <= SUBLIST_BATCH_EFFECT_MAX_ROWS) {
          // 逐行、逐字段走 rowUpdate（内部 DataFormat.updateDataSource）联动重算，再一次性 clearAndSetRows 写回，
          // 避免逐行 dispatch 多次 render。此处不清 dataFormatCacheMap —— 他表字段等异步回填
          // (onAsyncChange→handleUpdateCell) 需复用同行缓存实例，提前删除会打断异步回填链路。
          const newRows = rows.map(row => {
            if (!selectedIdSet.has(row.rowid)) return row;
            let latestRow = row;
            Object.keys(baseChanges).forEach(cid => {
              latestRow = this.rowUpdate({ row: latestRow, controlId: cid, value: baseChanges[cid] });
            });
            relateClearCids.forEach(cid => {
              latestRow = this.rowUpdate({
                row: latestRow,
                controlId: cid,
                value: getRelateClearValue(latestRow, cid),
              });
            });
            return latestRow;
          });
          clearAndSetRows(newRows, {
            isSetValueFromEvent: true,
            controls,
          });
          updateTreeTableViewData();
          restoreSort();
        } else if (relateClearCids.length) {
          const newRows = rows.map(row => {
            if (!selectedIdSet.has(row.rowid)) return row;
            const rowChanges = {
              ...baseChanges,
            };
            relateClearCids.forEach(cid => {
              rowChanges[cid] = getRelateClearValue(row, cid);
            });
            return {
              ...row,
              ...rowChanges,
            };
          });
          clearAndSetRows(newRows, {
            isSetValueFromEvent: true,
            controls,
          });
          updateTreeTableViewData();
          restoreSort();
          selectedRowIds.forEach(rowId => {
            this.dataFormatCacheMap.delete(rowId);
          });
        } else {
          updateRows({
            rowIds: selectedRowIds,
            value: baseChanges,
          });
          selectedRowIds.forEach(rowId => {
            this.dataFormatCacheMap.delete(rowId);
          });
        }
        // 批量编辑（含清空）后，被修改单元格的旧格式校验错误（手机/证件等）已不对应新值，需同步清掉 cellErrors，否则失焦时持久化的错误状态会残留。
        const { cellErrors, updateCellErrors } = this.props;
        if (!_.isEmpty(cellErrors)) {
          const clearedKeys = _.flatMap(selectedRowIds, rowId =>
            needUpdateControls.map(c => `${rowId}-${c.controlId}`),
          );
          if (clearedKeys.some(key => key in cellErrors)) {
            updateCellErrors(_.omit(cellErrors, clearedKeys));
          }
        }
        onClose();
      },
    });
  };
  render() {
    const {
      mode,
      maxHeight,
      cellErrors,
      from,
      recordId,
      viewId,
      control,
      base = {},
      treeTableViewData,
      rows,
      deleteRow,
      deleteRows,
      sortRows,
      addRow,
      updateRow,
      exportSheet,
      mobileIsEdit,
      appId,
      sheetSwitchPermit,
      showSearch,
      showExport,
      updateBase,
      masterData,
      updateTreeNodeExpansion,
      isDraft,
      filterControls = [],
      setFilterControls,
      changes = {},
      enableRules = true,
    } = this.props;
    const { isTreeTableView } = base;
    const isDirty = !!changes.isDirty;
    const { projectId, rules } = this.worksheetInfo;
    const { searchConfig } = this;
    let {
      allowcancel,
      allowedit,
      batchcids,
      allowsingle,
      hidenumber,
      rowheight,
      enablelimit,
      rownum,
      h5showtype,
      h5abstractids,
      titleCenter,
      allowDrag,
    } = parseAdvancedSetting(control.advancedSetting);
    const { useUserPermission } = this;
    let allowadd = parseAdvancedSetting(control.advancedSetting).allowadd;
    allowadd = allowadd && (useUserPermission ? this.worksheetInfo.allowAdd : true);
    const { maxCount, allowOpenRecord, allowCopy, titleWrap, treeLayerControlId } = this.settings;
    const maxShowRowCount = this.props.maxShowRowCount || rownum;
    const rowHeight = ROW_HEIGHT[rowheight] || 34;
    const { showAsPages } = this;
    const {
      loading,
      error,
      tempSheetColumnWidths,
      previewRowIndex,
      sheetColumnWidths,
      recordVisible,
      controls,
      isBatchEditing,
      selectedRowIds,
      pageSize,
      pageIndex,
      keywords,
      headHeight,
      isEditCurrentRow,
      frozenIndex,
      frozenIndexChanged,
      isMobileSearchFocus,
      isAddRowByLine,
      disableMaskDataControls,
      showLoadingMask,
      menuVisible,
      layoutDirection,
    } = this.state;
    const { treeMap = {} } = treeTableViewData;
    // 勾选「列样式与工作表保持一致」后，子表继承其数据管理视图的列样式（列宽 + 对齐方式 + 样式）；
    // 此时忽略字段自身列宽，拖拽列宽仅临时生效、不保存。
    const useColumnStyle = get(control, 'advancedSetting.usecolumnstyle') === '1';
    const inheritedSheetStyles = useColumnStyle
      ? getSheetStylesOfRelateRecordTable({
          control,
          worksheetInfo: this.worksheetInfo,
          manageView: base.manageView,
        })
      : undefined;
    const columnStyles = useColumnStyle ? get(inheritedSheetStyles, 'columnStyles') : undefined;
    const baseColumnWidths = useColumnStyle ? get(inheritedSheetStyles, 'sheetColumnWidths') || {} : sheetColumnWidths;
    const batchAddControls = batchcids
      .map(id =>
        _.find(controls, {
          controlId: id,
        }),
      )
      .filter(_.identity);
    const addRowFromRelateRecords = !!batchAddControls.length;
    const allowAddByLine =
      (_.isUndefined(_.get(control, 'advancedSetting.allowsingle')) && !addRowFromRelateRecords) || allowsingle;
    let allowExport = _.get(control, 'advancedSetting.allowexport');
    allowExport = _.isUndefined(allowExport) || allowExport === '1';
    const controlPermission = controlState(control, from);
    let tableRows = rows.map(row => {
      if (/^temp/.test(row.rowid)) {
        return row;
      } else if (/^empty/.test(row.rowid)) {
        return {
          ...row,
          allowedit: allowadd,
        };
      } else {
        return {
          ...row,
          allowedit: allowedit && (useUserPermission ? row.allowedit : true),
        };
      }
    });
    const originRows = tableRows;
    const valueChanged = _.isUndefined(this.props.valueChanged) ? this.state.valueChanged : this.props.valueChanged;
    const disabled = !controlPermission.editable || control.disabled;
    const noColumns = !controls.length;
    const columns = this.getShowColumns();
    const totalRowCount = this.totalRowCount;
    const isExceed = totalRowCount >= maxCount;
    const disabledNew = noColumns || disabled || !allowadd;
    this.disabledNew = disabledNew;
    this.isExceed = isExceed;
    const allowBatch = !_.includes([FROM.DEFAULT], from) && this.settings.allowBatch;
    const allowBatchDelete = allowcancel || (allowadd && !!originRows.filter(r => /^temp/.test(r.rowid)).length);
    const allowImport = this.settings.allowImport && !_.includes([FROM.DEFAULT], from);
    const showBatchEdit =
      !isMobile &&
      !disabled &&
      allowBatch &&
      !!filterEmptyChildTableRows(tableRows).length &&
      layoutDirection === 'horizontal';
    const showImport = !isMobile && allowImport && !disabledNew;
    const showAddRowByLine = !isMobile && !disabledNew && allowAddByLine;
    const showSelectRecord = !isMobile && !disabledNew && addRowFromRelateRecords;
    const RowDetailComponent = isMobile ? RowDetailMobile : RowDetail;
    const allowEdit = !disabled && allowedit;
    const allowBatchEditControls = columns.filter(controlBatchCanEdit);
    const showSummary =
      layoutDirection === 'horizontal' &&
      String(get(control, 'advancedSetting.openstatistics')) === '1' &&
      !isTreeTableView &&
      !get(window, 'shareState.shareId') &&
      filterEmptyChildTableRows(tableRows).length > 0;
    if (!columns.length) {
      return <div className="childTableEmptyTag"></div>;
    }
    if (keywords) {
      tableRows = filterRowsByKeywords({
        rows: tableRows,
        controls: controls,
        keywords,
      });
    }

    // 根据 sortConfig 对 tableRows 进行排序显示，但不修改原始 rows
    const { sortConfig } = this.props;
    if (sortConfig && sortConfig.controlId) {
      const sortControl = _.find(controls, {
        controlId: sortConfig.controlId,
      });
      if (sortControl) {
        tableRows = handleSortRows(tableRows, sortControl, sortConfig.isAsc);
      }
    }
    let tableData = tableRows;
    if (showAsPages) {
      tableData = tableData.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
    }
    if (treeLayerControlId) {
      const emptyRows = _.filter(tableRows, r => /^empty-/.test(r.rowid));
      tableData = getSheetViewRows(
        {
          rows: _.filter(tableRows, r => !/^empty-/.test(r.rowid)),
        },
        {
          treeMap,
        },
      ).concat(emptyRows);
    }
    // 新增一行后行详情要定位的位置：筛选生效时新行被置顶（见 redux/actions.js 的 addRow），
    // 其余场景新行落在末尾，索引即新增前的行数
    const newRowPreviewIndex = !_.isEmpty(filterControls)
      ? 0
      : isMobile && keywords
        ? originRows.length
        : tableRows.length;
    // 拖拽排序/插入行的显隐门槛：
    // - 仅横向表格、非移动端、非批量编辑、非树形、无字段排序方式、无筛选条件、无搜索关键字时可用
    //   （有排序方式/筛选/搜索时可见顺序≠rows 真实顺序，手动排序/定位插入无意义；
    //   且筛选态 rows 只是子集，按它算行数会让超限的大子表重新放出这些操作）
    // - 拖拽排序额外要求"允许编辑已有记录(allowEdit)"且当前页真实行数>1；总记录数>200 一律禁止排序
    //   （分页为纯前端切片，store 里 rows 始终是全量，页内拖拽经 MOVE_ROW 按 rowid 重排全量顺序，
    //   提交的 sid 数组仍是完整顺序，故分页态可拖；受限于 DOM 只渲染当前页，跨页拖拽本就做不到）
    // - 插入行同样要求排序方式为"拖拽排序"(allowReorder)——按设置的排序下行序由排序规则决定，
    //   插到指定位置立刻会被重排，定位插入无意义；此外还要求"允许新增(!disabledNew)、
    //   可整行添加(allowAddByLine)、未超上限"，且总记录数>200 一律禁止
    // - 这里的总记录数取 this.totalRowCount（未筛选真实总数），不是当前 rows 长度
    const dragInsertBaseEnabled =
      layoutDirection === 'horizontal' &&
      !isMobile &&
      !isBatchEditing &&
      !isTreeTableView &&
      !(sortConfig && sortConfig.controlId) &&
      _.isEmpty(filterControls) &&
      !keywords;
    // 拖拽排序权限：控件排序方式需选“拖拽排序”(rcsorttype='1')，且子表可改（能新增 allowadd 或能编辑已有 allowedit）。
    // 不再按 recordId 区分——草稿态新建记录也带 recordId，若卡在 allowedit 会导致新建态拖不了；
    // 真正只读（既不能增也不能改）的子表 allowadd/allowedit 都为 false，自然不显示拖拽手柄。
    // 开启“按用户权限访问”时不同用户可见子记录不同，手动排序会错乱，与配置端开关禁用逻辑保持一致，一律禁止。
    const allowReorder = allowDrag && !useUserPermission && !disabled && (allowadd || allowedit);
    const canDragRow =
      dragInsertBaseEnabled &&
      allowReorder &&
      totalRowCount <= MAX_ROW_COUNT_FOR_DRAG_INSERT &&
      filterEmptyChildTableRows(tableData).length > 1;
    const canInsertRow =
      dragInsertBaseEnabled &&
      allowReorder &&
      !disabledNew &&
      allowAddByLine &&
      !isExceed &&
      totalRowCount <= MAX_ROW_COUNT_FOR_DRAG_INSERT;
    // 存到实例上供 onCellEnter 读最新值：表格行 hover 事件在 useEffect 里绑定一次，
    // 若把 canDragRow/canInsertRow 通过闭包传进去，会捕获旧值（如加行前 canDragRow 尚为 false）导致手柄不显示。
    this.canDragRow = canDragRow;
    this.canInsertRow = canInsertRow;
    const rowCount = layoutDirection === 'horizontal' ? tableData.length : columns.length;
    const fullShowTable = rowCount <= maxShowRowCount;
    let tableHeight =
      (fullShowTable ? rowCount || 1 : maxShowRowCount) * rowHeight + headHeight + (showSummary ? 34 : 0);
    if (maxHeight && tableHeight > maxHeight) {
      tableHeight = maxHeight;
    }
    let tableFooter;
    if (
      layoutDirection === 'horizontal' &&
      !isMobile &&
      !disabledNew &&
      (allowAddByLine || addRowFromRelateRecords) &&
      !(isExceed || disabledNew)
    ) {
      tableFooter = {
        height: 36,
        comp: (
          <AddRowComp
            className="textTertiary"
            onClick={
              isExceed || disabledNew
                ? () => {}
                : () => {
                    if (allowAddByLine) {
                      this.handleAddRowByLine();
                    } else if (addRowFromRelateRecords) {
                      this.handleAddRowsFromRelateRecord(batchAddControls);
                    }
                  }
            }
          >
            <i className={`icon ${allowAddByLine ? 'icon-plus' : 'icon-done_all'} mRight5 Font14`}></i>
            <span
              className="hoverShow content ellipsis"
              style={{
                maxWidth: 200,
              }}
            >
              {allowAddByLine
                ? layoutDirection === 'horizontal'
                  ? _l('添加一行')
                  : _l('添加一列')
                : _l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
            </span>
            {allowAddByLine && addRowFromRelateRecords && (
              <BatchAddOfAddRowComp
                className="hoverShow"
                onClick={e => {
                  this.handleAddRowsFromRelateRecord(batchAddControls);
                  e.stopPropagation();
                }}
              >
                <i className="icon icon-done_all mRight5 Font16"></i>
                <span
                  className="content ellipsis"
                  style={{
                    maxWidth: 200,
                  }}
                >
                  {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
                </span>
              </BatchAddOfAddRowComp>
            )}
          </AddRowComp>
        ),
      };
    }
    const operateComp = (
      <Fragment>
        {showSearch &&
          (isMobile ? (
            <MobileSearchInput
              ref={this.searchRef}
              inputWidth={100}
              searchIcon={
                <IconBtn className="Hand hoverColorPrimary">
                  <i className="icon icon-search inherit" />
                </IconBtn>
              }
              keywords={keywords}
              className={cx('queryInput', {
                mobileQueryInput: isMobile,
              })}
              focusedClass={cx({
                mRight10: !isMobileSearchFocus,
              })}
              onOk={value => {
                this.setState({
                  keywords: value,
                  pageIndex: 1,
                });
              }}
              onClear={() => {
                this.setState({
                  keywords: '',
                  pageIndex: 1,
                  isMobileSearchFocus: false,
                });
              }}
              onFocus={() =>
                this.setState({
                  isMobileSearchFocus: isMobile,
                })
              }
              onBlur={() =>
                this.setState({
                  isMobileSearchFocus: false,
                })
              }
            />
          ) : (
            <SearchInput
              className={cx('queryInput', {
                mobileQueryInput: isMobile,
              })}
              keywords={keywords}
              control={control}
              onSearch={value => {
                this.setState({
                  keywords: value,
                  pageIndex: 1,
                });
              }}
            />
          ))}
        {!isMobile &&
          !isTreeTableView &&
          recordId &&
          !control.isCustomButtonFillRecord &&
          !get(window, 'shareState.shareId') &&
          (() => {
            const recordEditing = !!(this.context && this.context.iseditting);
            const dirty = isDirty || valueChanged || recordEditing;
            const tooltipTitle = dirty
              ? _l('存在未保存修改。为避免编辑对象变化，请先保存或取消修改后再调整筛选。')
              : '';

            // 内嵌表与放大弹层共用同一个 control.store（filterControls / rows 同一份），
            // 两边都渲染完整可编辑筛选器并共用同一 filterCompId；通过 controlledFilterControls
            // 把共享的 filterControls 回填到面板，使两处筛选条件与数据始终保持同步。
            return (
              <Tooltip title={tooltipTitle} placement="bottom">
                <span
                  style={{
                    display: 'inline-block',
                    margin: '4px 5px 0 0',
                  }}
                >
                  <WorkSheetFilter
                    style={{
                      paddingTop: 8,
                    }}
                    filterCompId={`childTable-${control.controlId}`}
                    controlledFilterControls={filterControls}
                    className="actionWrap mLeft6"
                    getPopupContainer={() => document.body}
                    appId={appId}
                    viewId={control.viewId}
                    projectId={projectId}
                    worksheetId={control.dataSource}
                    columns={columns.map((c, idx) => ({
                      ...c,
                      controlPermissions: '111',
                      row: idx,
                      col: 0,
                    }))}
                    filterResigned={false}
                    showSavedFilters={false}
                    readOnly={dirty}
                    onChange={({ filterControls: next }) => {
                      if (dirty) return;
                      setFilterControls(next);
                      this.setState(
                        {
                          pageIndex: 1,
                        },
                        () => this.loadRows(),
                      );
                    }}
                  />
                </span>
              </Tooltip>
            );
          })()}
        {this.defaultDirection === 'vertical' && (
          <Tooltip title={_l('行列转置')} placement="bottom">
            <IconBtn
              className="Hand hoverColorPrimary mLeft6"
              onClick={() =>
                this.setState({
                  layoutDirection: layoutDirection === 'horizontal' ? 'vertical' : 'horizontal',
                })
              }
            >
              <i className="icon icon-table_convert" />
            </IconBtn>
          </Tooltip>
        )}
        {!isMobileSearchFocus &&
          showExport &&
          allowExport &&
          recordId &&
          from !== FROM.DRAFT &&
          !control.isCustomButtonFillRecord &&
          (!_.get(window, 'shareState.shareId') || _.get(window, 'shareState.isPublicWorkflowRecord')) &&
          (!isMobile ? true : disabled) && (
            <ExportSheetButton
              className="mLeft6"
              exportSheet={cb => {
                if (!filterEmptyChildTableRows(tableRows).filter(r => !/^temp-/.test(r.rowid)).length) {
                  cb();
                  alert(_l('数据为空，暂不支持导出！'), 3);
                  return;
                }
                return exportSheet({
                  worksheetId: this.props.masterData.worksheetId,
                  rowId: recordId,
                  controlId: control.controlId,
                  clientId: window.clientId || sessionStorage.getItem('clientId'),
                  filterControls,
                  fileName:
                    `${((_.last([...document.querySelectorAll('.recordTitle')]) || {}).innerText || '').slice(0, 200)}_${control.controlName}_${moment().format('YYYYMMDDHHmmss')}`.trim() +
                    '.xlsx',
                  onDownload: cb,
                });
              }}
            />
          )}
        {!isMobileSearchFocus && recordId && !valueChanged && (
          <Tooltip title={_l('刷新')} placement="bottom">
            <span
              className="mLeft6 Hand"
              style={{
                height: 28,
              }}
              onClick={() => {
                this.refresh();
              }}
            >
              <IconBtn className="hoverColorPrimary">
                <i className="icon icon-task-later" />
              </IconBtn>
            </span>
          </Tooltip>
        )}
        {mode !== 'dialog' && from !== FROM.DRAFT && recordId && !isMobile && (
          <Tooltip title={_l('全屏')} placement="bottom">
            <span
              className="mLeft6"
              onClick={() =>
                this.props.openChildTable({
                  ...this.props,
                  valueChanged,
                  allowEdit: !disabled,
                  worksheetId: this.props.masterData.worksheetId,
                  title:
                    (_.last([...document.querySelectorAll('.recordTitle')]) || {}).innerText ||
                    _.get(this, 'props.masterData.formData')
                      ? getTitleTextFromControls(_.get(this, 'props.masterData.formData'))
                      : '',
                })
              }
            >
              <IconBtn className="Hand hoverColorPrimary">
                <i className="icon icon-worksheet_enlarge" />
              </IconBtn>
            </span>
          </Tooltip>
        )}
      </Fragment>
    );

    return (
      <ChildTableContext.Provider
        value={{
          rows,
        }}
      >
        <div className="childTableCon" ref={con => (this.childTableCon = con)}>
          {!_.isEmpty(cellErrors) && (
            <span
              className="errorTip ellipsis"
              style={
                isMobile
                  ? {
                      top: -31,
                    }
                  : {}
              }
            >
              {' '}
              {_l('请正确填写%0', control.controlName)}{' '}
            </span>
          )}
          {isBatchEditing && !!selectedRowIds.length && (
            <div className="selectedTip">{_l('已选择%0条记录', selectedRowIds.length)}</div>
          )}

          {isMobile ? (
            ''
          ) : (
            <div className="operate">
              {!isBatchEditing ? (
                <Fragment>
                  {showSelectRecord && (
                    <Button
                      className="addRowByDialog mRight8"
                      color="default"
                      variant="textBordered"
                      disabled={isExceed || disabledNew}
                      icon={<i className="icon icon-done_all Font16" />}
                      onClick={() => this.handleAddRowsFromRelateRecord(batchAddControls)}
                    >
                      <span
                        className="content ellipsis"
                        style={{
                          maxWidth: 200,
                        }}
                      >
                        {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
                      </span>
                    </Button>
                  )}
                  {showAddRowByLine && (
                    <Button
                      className="addRowByLine mRight8"
                      color="default"
                      variant="textBordered"
                      disabled={isExceed || disabledNew}
                      icon={<i className="icon icon-plus Font16" />}
                      onClick={this.handleAddRowByLine}
                    >
                      {layoutDirection === 'horizontal' ? _l('添加一行') : _l('添加一列')}
                    </Button>
                  )}
                  {showImport && (
                    <Button.Group className="importFromFile mRight8">
                      <Tooltip placement="bottom" title={<span className="preWrap">{_l('导入数据')}</span>}>
                        <Button
                          aria-label={_l('导入数据')}
                          className="content"
                          color="default"
                          variant="textBordered"
                          disabled={isExceed}
                          icon={<i className="icon icon-worksheet_import Font16" />}
                          onClick={this.handleImport}
                        />
                      </Tooltip>
                      <Dropdown
                        open={menuVisible && !isExceed}
                        trigger={['click']}
                        placement="bottomLeft"
                        getPopupContainer={() => document.body}
                        onOpenChange={visible => {
                          this.setState({
                            menuVisible: visible,
                          });
                        }}
                        menu={{
                          items: [
                            {
                              key: 'append',
                              label: _l('增加明细'),
                              onClick: () => {
                                if (!isExceed) {
                                  this.handleImport();
                                }
                              },
                            },
                            allowEdit && {
                              key: 'replace',
                              label: _l('替换已有明细'),
                              onClick: () => {
                                if (!isExceed) {
                                  this.handleImport({
                                    replace: true,
                                  });
                                }
                              },
                            },
                          ].filter(Boolean),
                        }}
                      >
                        <Button
                          aria-label={_l('更多导入方式')}
                          className="dropdownButtonIcon"
                          color="default"
                          variant="textBordered"
                          disabled={isExceed}
                          icon={<i className="icon icon-arrow-down Font15" />}
                        />
                      </Dropdown>
                    </Button.Group>
                  )}
                  {showBatchEdit && (allowBatchDelete || allowEdit || (allowadd && allowCopy)) && (
                    <Fragment>
                      {(showImport || showAddRowByLine || showSelectRecord) && <div className="splitter"></div>}
                      <Button
                        className="batchEditBtn mRight8"
                        color="default"
                        variant="textBordered"
                        onClick={() =>
                          this.setState({
                            isBatchEditing: true,
                          })
                        }
                      >
                        {_l('批量操作')}
                      </Button>
                    </Fragment>
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  <Button
                    className="operateButton exitBatch mRight8"
                    color="default"
                    variant="textBordered"
                    icon={<i className="icon icon-close Font18" />}
                    onClick={() =>
                      this.setState({
                        isBatchEditing: false,
                        selectedRowIds: [],
                      })
                    }
                  >
                    {_l('退出')}
                  </Button>
                  {allowEdit && (
                    <Button
                      className="operateButton mRight8"
                      color="default"
                      variant="textBordered"
                      disabled={!selectedRowIds.length || !allowBatchEditControls.length}
                      onClick={() =>
                        allowBatchEditControls.length &&
                        this.handleBatchUpdateRecords({
                          tableRows,
                        })
                      }
                    >
                      {_l('编辑')}
                    </Button>
                  )}
                  {allowBatchDelete && (
                    <Button
                      className="operateButton mRight8"
                      color="default"
                      variant="textBordered"
                      disabled={!selectedRowIds.length}
                      onClick={() => {
                        if (selectedRowIds.length) {
                          deleteRows(allowcancel ? selectedRowIds : selectedRowIds.filter(rid => /^temp/.test(rid)), {
                            useUserPermission: useUserPermission && !!recordId,
                          });
                          this.setState({
                            selectedRowIds: [],
                            isBatchEditing: selectedRowIds.length === tableRows.length,
                          });
                        }
                      }}
                    >
                      {_l('删除')}
                    </Button>
                  )}
                  {allowadd && allowCopy && (
                    <Button
                      className="operateButton mRight8"
                      color="default"
                      variant="textBordered"
                      disabled={!selectedRowIds.length || isExceed || isTreeTableView}
                      onClick={() => {
                        if (!selectedRowIds.length || isExceed || isTreeTableView) {
                          return;
                        }
                        if (totalRowCount + selectedRowIds.length > maxCount) {
                          alert(_l('复制失败，最多输入%0条记录', maxCount), 2);
                          return;
                        }
                        if (selectedRowIds.length) {
                          this.copyRows(
                            selectedRowIds
                              .map(rowId =>
                                _.find(tableRows, {
                                  rowid: rowId,
                                }),
                              )
                              .filter(_.identity)
                              .slice(0, maxCount - totalRowCount),
                          );
                          this.setState({
                            selectedRowIds: [],
                          });
                        }
                      }}
                    >
                      {_l('复制')}
                    </Button>
                  )}
                </Fragment>
              )}
              <div className="flex"></div>
              {keywords && <SearchResultNum>{_l('共 %0 行', tableRows.length)}</SearchResultNum>}
              {/* 批量编辑时不能卸载，否则 WorkSheetFilter 内部 reducer 状态丢失，"已筛选"指示消失 */}
              <div
                className="mTop5 flexRow alignItemsCenter"
                style={
                  isBatchEditing
                    ? {
                        display: 'none',
                      }
                    : undefined
                }
              >
                {operateComp}
              </div>
              {showAsPages && tableRows.length > pageSize && (
                <Pagination
                  allowChangePageSize={false}
                  className="pagination"
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  allCount={tableRows.length}
                  changePageIndex={value => {
                    this.setState({
                      pageIndex: value,
                    });
                  }}
                  onPrev={() => {
                    this.setState({
                      pageIndex: pageIndex - 1 < 0 ? 0 : pageIndex - 1,
                    });
                  }}
                  onNext={() => {
                    this.setState({
                      pageIndex:
                        pageIndex + 1 > Math.ceil(tableRows.length / pageSize)
                          ? Math.ceil(tableRows.length / pageSize)
                          : pageIndex + 1,
                    });
                  }}
                />
              )}
            </div>
          )}
          {!isMobile && !loading && (
            <div
              className="Relative"
              style={{
                height: tableFooter ? tableHeight + tableFooter.height : tableHeight,
              }}
            >
              <WorksheetTable
                direction={layoutDirection}
                showControlStyle
                columnStyles={columnStyles}
                showLoadingMask={showLoadingMask}
                showSummary={showSummary}
                loadingMaskChildren={<span className="childTableIsImportingData">{_l('正在导入数据...')}</span>}
                isTreeTableView={isTreeTableView}
                treeLayerControlId={treeLayerControlId}
                treeTableViewData={treeTableViewData}
                expandCellAppendWidth={this.expandCellAppendWidth}
                from={from}
                isDraft={isDraft}
                tableType={get(control, 'advancedSetting.sheettype') === '0' ? 'simple' : 'classic'}
                isSubList
                disableValidate={this.props.disableValidate}
                formItemId={this.props.formItemId}
                showAsZebra={false}
                wrapControlName={titleWrap}
                headTitleCenter={titleCenter}
                rules={rules}
                enableRules={enableRules}
                allowAdd={allowadd}
                height={tableHeight}
                fromModule={WORKSHEETTABLE_FROM_MODULE.SUBLIST}
                viewId={viewId}
                onCellEnter={cellEl => this.handleSublistRowHover(cellEl)}
                onCellLeave={scheduleHideRowFloats}
                scrollBarHoverShow
                ref={this.worksheettable}
                setHeightAsRowCount={fullShowTable}
                forceScrollOffset={
                  fullShowTable && {
                    height: true,
                  }
                }
                clickEnterEditing
                cellErrors={cellErrors}
                clearCellError={this.handleClearCellError}
                cellUniqueValidate={this.handleUniqueValidate}
                fixedColumnCount={frozenIndex}
                lineEditable={!disabled}
                noRenderEmpty={!keywords}
                keyWords={keywords}
                rowHeight={rowHeight}
                worksheetId={control.dataSource}
                projectId={projectId}
                appId={appId}
                columns={columns.map(c =>
                  disableMaskDataControls[c.controlId]
                    ? {
                        ...c,
                        advancedSetting: Object.assign({}, c.advancedSetting, {
                          datamask: '0',
                        }),
                      }
                    : c,
                )}
                controls={controls}
                cellProps={{
                  recordId,
                  allowCopy: allowCopy && !disabled && allowadd,
                  allowDelete: !disabled && allowcancel,
                  useUserPermission,
                  renderVerticalAddLine:
                    !(isExceed || disabledNew) &&
                    allowAddByLine &&
                    (({ className, style }) => (
                      <div
                        className={cx(className, 'addRowBtnOfVertical Hand')}
                        style={style}
                        onClick={
                          isExceed || disabledNew
                            ? () => {}
                            : () => {
                                if (allowAddByLine) {
                                  this.handleAddRowByLine();
                                } else if (addRowFromRelateRecords) {
                                  this.handleAddRowsFromRelateRecord(batchAddControls);
                                }
                              }
                        }
                      >
                        <Tooltip title={_l('添加一列')}>
                          <div className="IconCon Hand">
                            <i className="verticalAddButtonIcon icon icon-plus Font16"></i>
                          </div>
                        </Tooltip>
                      </div>
                    )),

                  onOpenRecord: index => this.openDetail(index),
                  onDeleteRecord: row => {
                    deleteRow(row.rowid);
                    this.triggerCustomEvent();
                  },
                  onCopyRecord: row => {
                    if (isExceed) {
                      alert(enablelimit ? _l('已超过子表最大行数') : _l('最多输入%0条记录', maxCount), 3);
                      return;
                    }
                    this.copyRow(row);
                  },
                }}
                data={keywords ? filterEmptyChildTableRows(tableData) : tableData}
                sheetColumnWidths={{
                  ...baseColumnWidths,
                  ...tempSheetColumnWidths,
                }}
                rowHeadWidth={(() => {
                  if (!allowOpenRecord) {
                    return 44;
                  } else return hidenumber && !allowadd && !allowcancel ? 44 : 75;
                })()}
                sheetSwitchPermit={sheetSwitchPermit}
                masterFormData={() => this.props.masterData.formData}
                masterData={() => this.props.masterData}
                sheetViewHighlightRows={[{}, ...selectedRowIds].reduce((a, b) => ({
                  ...a,
                  [b]: true,
                }))}
                renderRowHead={args => (
                  <RowHead
                    useUserPermission={useUserPermission}
                    showNumber={!hidenumber}
                    lineNumberBegin={showAsPages ? (pageIndex - 1) * pageSize : 0}
                    showCheckbox={
                      isBatchEditing &&
                      !!tableRows.length &&
                      (useUserPermission && !!recordId
                        ? _.get(args.row, 'allowdelete') || (allowadd && allowCopy) || args.rowIndex === -1
                        : true)
                    }
                    {...args}
                    isSelectAll={selectedRowIds.length === tableRows.length}
                    selectedRowIds={selectedRowIds}
                    row={tableData[args.rowIndex]}
                    allowAdd={allowadd}
                    allowCopy={allowCopy}
                    allowCancel={allowcancel}
                    recordId={recordId}
                    changeSheetLayoutVisible={
                      control.isCharge && ((!useColumnStyle && !_.isEmpty(tempSheetColumnWidths)) || frozenIndexChanged)
                    }
                    disabled={disabled}
                    allowOpenRecord={allowOpenRecord}
                    onSelect={(selectedRowId, isAdd = true) => {
                      if (isAdd) {
                        this.setState({
                          selectedRowIds: _.uniq(selectedRowIds.concat(selectedRowId)),
                        });
                      } else {
                        this.setState({
                          selectedRowIds: selectedRowIds.filter(rowId => rowId !== selectedRowId),
                        });
                      }
                    }}
                    onSelectAll={selectAll => {
                      if (selectAll) {
                        this.setState({
                          selectedRowIds: filterEmptyChildTableRows(tableRows).map(row => row.rowid),
                        });
                      } else {
                        this.setState({
                          selectedRowIds: [],
                        });
                      }
                    }}
                    onOpen={index => this.openDetail(index)}
                    onDelete={() => {
                      deleteRow(args.row.rowid);
                      this.triggerCustomEvent();
                    }}
                    onCopy={() => {
                      if (isExceed) {
                        alert(enablelimit ? _l('已超过子表最大行数') : _l('最多输入%0条记录', maxCount), 3);
                        return;
                      }
                      this.copyRow(args.row);
                    }}
                    saveSheetLayout={({ closePopup }) => {
                      const changes = {};
                      // 继承列样式时，列宽由数据管理视图托管，拖拽列宽不写回字段配置
                      if (!useColumnStyle && !_.isEmpty(tempSheetColumnWidths)) {
                        changes.widths = JSON.stringify(
                          pick(
                            {
                              ...sheetColumnWidths,
                              ...tempSheetColumnWidths,
                            },
                            columns.map(c => c.controlId),
                          ),
                        );
                      }
                      if (frozenIndexChanged) {
                        changes.freezeids = JSON.stringify([String(frozenIndex)]);
                      }
                      const newControl = {
                        ...control,
                        advancedSetting: {
                          ...control.advancedSetting,
                          ...changes,
                        },
                      };
                      worksheetAjax
                        .editWorksheetControls({
                          worksheetId: this.props.masterData.worksheetId,
                          controls: [
                            {
                              ..._.pick(newControl, ['controlId', 'advancedSetting']),
                              editattrs: ['advancedSetting'],
                            },
                          ],
                        })
                        .then(res => {
                          if (res.data) {
                            closePopup();
                            this.setState({
                              frozenIndexChanged: false,
                              tempSheetColumnWidths: {},
                              sheetColumnWidths: this.getSheetColumnWidths(newControl),
                            });
                            try {
                              if (_.isFunction(_.get(this, 'context.updateWorksheetControls'))) {
                                const updateFn = _.get(this, 'context.updateWorksheetControls');
                                let newResponseControl = res.data.controls.filter(
                                  c => c.controlId === control.controlId,
                                )[0];
                                if (newResponseControl) {
                                  newResponseControl = {
                                    ...newResponseControl,
                                    relationControls: control.relationControls,
                                  };
                                  updateFn([newResponseControl]);
                                }
                              }
                            } catch (err) {
                              console.log(err);
                            }
                          }
                        });
                    }}
                    resetSheetLayout={() => {
                      this.setState({
                        tempSheetColumnWidths: {},
                        frozenIndexChanged: false,
                      });
                    }}
                  />
                )}
                renderColumnHead={({ ...rest }) => {
                  const { control, columnIndex, rowIndex, isVertical } = rest;
                  if (isVertical) {
                    return (
                      <RowHeadColumn
                        showRequired={!disabled}
                        columnIndex={rowIndex}
                        control={control}
                        showNumber={!hidenumber}
                        {...rest}
                      />
                    );
                  }
                  const maskData =
                    _.get(control, 'advancedSetting.datamask') === '1' &&
                    _.get(control, 'advancedSetting.isdecrypt') === '1';
                  const controlAllowEdit =
                    _.includes(CONTROL_EDITABLE_WHITELIST, control.type) &&
                    controlState(control).editable &&
                    !SYS.filter(o => o !== 'ownerid').includes(control.controlId);
                  const showEdit = selectedRowIds.length && controlAllowEdit && allowEdit;
                  const showFrozen =
                    frozenIndex === columnIndex ||
                    (frozenIndex !== columnIndex && columnIndex <= maxAllowFrozenColumnIndex);
                  const showRemoveMask = maskData && !get(window, 'shareState.shareId');
                  return (
                    <ColumnHead
                      disableSort={isTreeTableView}
                      showDropdown={showEdit || showFrozen || showRemoveMask}
                      showRequired={!disabled}
                      isAsc={sortConfig && sortConfig.controlId === control.controlId ? sortConfig.isAsc : undefined}
                      changeSort={sortType => {
                        sortRows({
                          control,
                          isAsc: sortType,
                        });
                      }}
                      renderPopup={({ closeMenu }) => ({
                        style: { width: 180 },
                        items: [
                          showFrozen && {
                            key: frozenIndex === columnIndex ? 'unfreeze' : 'freeze',
                            icon: (
                              <i
                                className={cx(
                                  'icon font16',
                                  frozenIndex === columnIndex ? 'icon-task-new-no-locked' : 'icon-lock',
                                )}
                              />
                            ),
                            label: frozenIndex === columnIndex ? _l('解冻') : _l('冻结'),
                            onClick: () => {
                              if (window.isPublicApp) {
                                alert(_l('预览模式下，不能操作'), 3);
                                return;
                              }

                              const isFrozen = frozenIndex === columnIndex;
                              this.setState({
                                frozenIndex: isFrozen ? 0 : columnIndex,
                                frozenIndexChanged: true,
                              });
                              closeMenu();
                            },
                          },
                          showRemoveMask && {
                            key: 'decode',
                            icon: <i className="icon icon-eye_off" />,
                            label: _l('解码'),
                            onClick: () => {
                              addBehaviorLog('worksheetBatchDecode', _.get(base, 'worksheetInfo.worksheetId'), {
                                controlId: control.controlId,
                              });
                              this.setState({
                                disableMaskDataControls: {
                                  ...disableMaskDataControls,
                                  [control.controlId]: true,
                                },
                              });
                            },
                          },
                          showEdit && {
                            key: 'batch-edit',
                            icon: <i className="icon icon-hr_edit" />,
                            label: _l('编辑选中记录'),
                            onClick: () => {
                              this.handleBatchUpdateRecords({
                                tableRows,
                                activeControl: control,
                              });
                              closeMenu();
                            },
                          },
                        ].filter(Boolean),
                      })}
                      {...rest}
                    />
                  );
                }}
                renderFooterCell={({ columnIndex, className, style }) => {
                  let childtableControl = [
                    {
                      type: 'summaryhead',
                    },
                  ].concat(columns)[columnIndex];
                  return (
                    <ChildTableSummaryCell
                      className={className}
                      style={style}
                      control={childtableControl}
                      defaultSummaryTypes={getDefaultSummaryTypes(control)}
                      rows={filterEmptyChildTableRows(tableRows)}
                      selectedIds={selectedRowIds}
                    />
                  );
                }}
                updateCell={this.handleUpdateCell}
                onColumnWidthChange={(controlId, value) => {
                  this.setState({
                    tempSheetColumnWidths: {
                      ...tempSheetColumnWidths,
                      [controlId]: value,
                    },
                  });
                }}
                addNewRow={this.handleAddRowByLine}
                onFocusCell={(row, cellIndex) => {
                  if (disabledNew || isExceed) {
                    return;
                  }
                  const isEmptyRow = row.rowid.startsWith('empty');
                  if (isEmptyRow) {
                    updateRow({
                      rowid: row.rowid,
                      value: this.newRow(
                        {},
                        {
                          isCreate: true,
                        },
                      ),
                    });
                    setTimeout(() => {
                      const tableDom = get(this.worksheettable, 'current.table.refs.dom.current');
                      const activeCell = tableDom && tableDom.querySelector('.cell.cell-' + cellIndex);
                      if (activeCell) {
                        activeCell.click();
                      }
                    }, 100);
                    return;
                  }
                  if (isDraft) {
                    const enterEditingMode = _.get(this, 'context.enterEditingMode');
                    if (enterEditingMode) {
                      enterEditingMode();
                    }
                  }
                }}
                onUpdateRules={newRules => {
                  updateBase({
                    worksheetInfo: {
                      ...this.worksheetInfo,
                      rules: newRules,
                    },
                  });
                }}
                onCellClick={(_, row, rowIndex, columnIndex, { isSpace } = {}) => {
                  const isSimpleMode = get(control, 'advancedSetting.sheettype') === '0';
                  const isEmptyRow = String(get(row, 'rowid') || '').startsWith('empty');
                  if ((isSpace || isSimpleMode) && allowOpenRecord && !isEmptyRow) {
                    this.openDetail(layoutDirection === 'vertical' ? columnIndex - 1 : rowIndex);
                  }
                }}
                tableFooter={tableFooter}
                actions={{
                  updateTreeNodeExpansion: (row, options = {}) =>
                    updateTreeNodeExpansion(
                      row,
                      Object.assign({}, options, {
                        worksheetId: masterData.worksheetId,
                        recordId,
                      }),
                    ),
                  handleAddNewRecord: (parentRow, { addParentControl } = {}) => {
                    this.updateDefsourceOfControl();
                    const row = this.newRow(
                      {
                        [addParentControl.controlId]: JSON.stringify([
                          {
                            sid: parentRow.rowid,
                            sourcevalue: JSON.stringify(parentRow),
                            type: 8,
                          },
                        ]),
                        pid: parentRow.rowid,
                      },
                      {
                        isCreate: true,
                      },
                    );
                    addRow(row, parentRow.rowid);
                    updateTreeNodeExpansion(parentRow, {
                      forceUpdate: true,
                      getNewRows: () => Promise.resolve([row]),
                      updateRows: ([recordId], changes) => {
                        updateRow(
                          {
                            rowid: recordId,
                            value: changes,
                          },
                          {
                            noRealUpdate: true,
                          },
                        );
                      },
                    });
                    function getUpRowId() {
                      const childrenRows = filter(tableData, r => r.pid === parentRow.rowid);
                      if (childrenRows.length) {
                        return last(childrenRows).rowid;
                      } else {
                        return parentRow.rowid;
                      }
                    }
                    const upRowId = getUpRowId();
                    const upRowIndex =
                      upRowId &&
                      findIndex(tableData, {
                        rowid: upRowId,
                      });
                    const tableDom = get(this.worksheettable, 'current.table.refs.dom.current');
                    const scrollY = tableDom && tableDom.querySelector('.scroll-y');
                    if (scrollY) {
                      const newRowBottomToTop = (upRowIndex + 2) * rowHeight;
                      const conHeight = scrollY.clientHeight;
                      const conScrollTop = scrollY.scrollTop;
                      const newRowVisible = newRowBottomToTop - conScrollTop < conHeight;
                      console.table({
                        newRowBottomToTop,
                        conHeight,
                        conScrollTop,
                        newRowVisible,
                      });
                      if (!newRowVisible) {
                        setTimeout(() => {
                          if (!this.worksheettable.current) return;
                          this.worksheettable.current.table.refs.setScroll(0, newRowBottomToTop + 10 - conHeight);
                        }, 100);
                      }
                    }
                    setTimeout(() => {
                      if (!this.worksheettable.current) return;
                      const activeCell = this.worksheettable.current.table.refs.dom.current.querySelector(
                        '.cell.row-id-' + row.rowid + '.canedit',
                      );
                      if (activeCell) {
                        activeCell.click();
                      }
                    }, 200);
                  },
                }}
                onColumnHeadHeightUpdate={newColumnHeadWidth => {
                  this.setState({
                    headHeight: newColumnHeadWidth,
                  });
                }}
              />
            </div>
          )}
          {isMobile && !loading && (
            <MobileTable
              sheetSwitchPermit={sheetSwitchPermit}
              allowcancel={allowcancel}
              allowadd={allowadd}
              disabled={disabled}
              controlPermission={controlPermission}
              rows={tableRows}
              controls={columns}
              onOpen={this.openDetail}
              isEdit={mobileIsEdit}
              onDelete={deleteRow}
              showNumber={!hidenumber}
              h5showtype={h5showtype}
              h5abstractids={h5abstractids}
              appId={appId}
              worksheetId={control.dataSource}
              rules={rules}
              cellErrors={cellErrors}
              projectId={projectId}
              allowedit={allowedit}
              isAddRowByLine={isAddRowByLine}
              from={from}
              isDraft={isDraft}
              masterData={() => this.props.masterData}
              getMasterFormData={() => this.props.masterData.formData}
              useUserPermission={useUserPermission}
              recordId={recordId}
              updateIsAddByLine={value =>
                this.setState({
                  isAddRowByLine: value,
                })
              }
              onSave={this.handleRowDetailSave}
              submitChildTableCheckData={control.submitChildTableCheckData}
            />
          )}
          {loading &&
            (error ? (
              <div className="center textTertiary">{error}</div>
            ) : (
              <div
                style={{
                  padding: 10,
                }}
              >
                <Skeleton
                  className="pAll20"
                  style={{
                    flex: 1,
                  }}
                  active
                  paragraph={{
                    rows: 4,
                    width: ['30%', '40%', '90%', '60%'],
                  }}
                />
              </div>
            ))}

          {isMobile && (
            <div className="operate valignWrapper mTop12">
              {isMobile && !disabledNew && !isExceed && addRowFromRelateRecords && (
                <Button
                  className="addRowByDialog h5 mRight10"
                  color="default"
                  variant="textBordered"
                  icon={<i className="icon icon-done_all Font16" />}
                  onClick={() => this.handleAddRowsFromRelateRecord(batchAddControls)}
                >
                  <span
                    className="content ellipsis"
                    style={{
                      maxWidth: 200,
                    }}
                  >
                    {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
                  </span>
                </Button>
              )}
              {isMobile && mobileIsEdit && !disabledNew && !isExceed && allowAddByLine && (
                <Button
                  className="addRowByLine h5"
                  color="default"
                  variant="textBordered"
                  icon={<i className="icon icon-plus Font16" />}
                  onClick={() => {
                    this.handleAddRowByLine();
                    this.setState({
                      previewRowIndex: newRowPreviewIndex,
                      recordVisible: h5showtype === '2' ? false : true,
                      isAddRowByLine: true,
                    });
                  }}
                >
                  {_l('添加')}
                </Button>
              )}
              <div
                className={cx('operates', {
                  isMobile,
                })}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                {operateComp}
              </div>
            </div>
          )}
          {recordVisible && (
            <RowDetailComponent
              widgetStyle={this.worksheetInfo.advancedSetting}
              isEditCurrentRow={isEditCurrentRow}
              masterData={masterData}
              isWorkflow
              ignoreLock={/^(temp|default|empty)/.test((tableData[previewRowIndex] || {}).rowid)}
              visible
              aglinBottom={!!recordId}
              from={from === FROM.DRAFT ? 3 : from}
              isDraft={isDraft}
              worksheetId={control.dataSource}
              projectId={projectId}
              appId={appId}
              searchConfig={searchConfig}
              sheetSwitchPermit={sheetSwitchPermit}
              controlName={control.controlName}
              title={
                previewRowIndex > -1 ? (
                  isMobile ? (
                    <Fragment>
                      <div className="ellipsis">{control.controlName}</div>
                      <div>#{previewRowIndex + 1}</div>
                    </Fragment>
                  ) : (
                    `${control.controlName}#${previewRowIndex + 1}`
                  )
                ) : (
                  _l('创建%0', control.controlName)
                )
              }
              disabled={disabled || (!/^temp/.test(_.get(tableData, `${previewRowIndex}.rowid`)) && !allowedit)}
              isExceed={isExceed}
              mobileIsEdit={mobileIsEdit}
              allowDelete={
                /^temp/.test(_.get(tableData, `${previewRowIndex}.rowid`)) ||
                (allowcancel &&
                  (useUserPermission && !!recordId ? _.get(tableData[previewRowIndex], 'allowdelete') : true))
              }
              controls={controls.map(c => ({
                ...c,
                hidden: !_.includes(control.showControls, c.controlId) ? true : c.hidden,
              }))}
              data={previewRowIndex > -1 ? tableData[previewRowIndex] || {} : this.newRow()}
              switchDisabled={{
                prev: previewRowIndex === 0,
                next:
                  previewRowIndex === filterEmptyChildTableRows(tableData.filter(r => !r.isSubListFooter)).length - 1,
              }}
              getMasterFormData={() => this.props.masterData.formData}
              handleUniqueValidate={this.handleUniqueValidate}
              onSwitch={this.handleSwitch}
              onSave={this.handleRowDetailSave}
              onDelete={deleteRow}
              onClose={() => {
                const { previewRowIndex } = this.state;

                // 清理弹窗中编辑的行的缓存，确保行内编辑时使用最新数据
                if (previewRowIndex > -1) {
                  const row = tableData[previewRowIndex];
                  if (row && row.rowid) {
                    this.dataFormatCacheMap.delete(row.rowid);
                  }
                }
                this.setState({
                  recordVisible: false,
                  isEditCurrentRow: false,
                  previewRowIndex: null,
                });
              }}
              rules={rules}
              openNextRecord={() => {
                this.handleAddRowByLine();
                this.setState({
                  previewRowIndex: newRowPreviewIndex,
                  recordVisible: true,
                });
              }}
            />
          )}
        </div>
      </ChildTableContext.Provider>
    );
  }
}
const mapStateToProps = state => ({
  baseLoading: state.baseLoading,
  base: state.base,
  treeTableViewData: state.treeTableViewData,
  rows: state.rows,
  lastAction: state.lastAction,
  cellErrors: state.cellErrors,
  persistedCellErrors: state.persistedCellErrors,
  sortConfig: state.sortConfig,
  filterControls: state.filterControls,
  realCount: state.realCount,
  changes: state.changes,
});
const mapDispatchToProps = dispatch => ({
  loadRows: bindActionCreators(actions.loadRows, dispatch),
  setOriginRows: bindActionCreators(actions.setOriginRows, dispatch),
  resetRows: bindActionCreators(actions.resetRows, dispatch),
  initRows: bindActionCreators(actions.initRows, dispatch),
  addRow: bindActionCreators(actions.addRow, dispatch),
  addRows: bindActionCreators(actions.addRows, dispatch),
  updateRow: bindActionCreators(actions.updateRow, dispatch),
  updateRows: bindActionCreators(actions.updateRows, dispatch),
  deleteRow: bindActionCreators(actions.deleteRow, dispatch),
  deleteRows: bindActionCreators(actions.deleteRows, dispatch),
  moveRow: bindActionCreators(actions.moveRow, dispatch),
  sortRows: bindActionCreators(actions.sortRows, dispatch),
  clearAndSetRows: bindActionCreators(actions.clearAndSetRows, dispatch),
  exportSheet: bindActionCreators(actions.exportSheet, dispatch),
  updateCellErrors: bindActionCreators(actions.updateCellErrors, dispatch),
  updateBase: bindActionCreators(actions.updateBase, dispatch),
  updateTreeNodeExpansion: bindActionCreators(actions.updateTreeNodeExpansion, dispatch),
  updateTreeTableViewData: bindActionCreators(actions.updateTreeTableViewData, dispatch),
  setFilterControls: bindActionCreators(actions.setFilterControls, dispatch),
});
export default withOpeners(connect(mapStateToProps, mapDispatchToProps)(ChildTable), {
  importFileToChildTable: useImportFileToChildTable,
  openBatchEditRecord: useBatchEditRecord,
  openChildTable: useChildTableDialog,
});
