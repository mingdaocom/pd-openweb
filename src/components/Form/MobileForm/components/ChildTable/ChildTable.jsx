import React, { Fragment } from 'react';
import { flushSync } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionSheet, Button, Popup } from 'antd-mobile';
import cx from 'classnames';
import _, { get, includes } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { createRequestPool } from 'worksheet/api/standard';
import { mobileSelectRecord } from 'mobile/components/RecordCardListDialog';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import { SHEET_VIEW_HIDDEN_TYPES, SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { FORM_ERROR_TYPE_TEXT, FROM, WIDGET_VALUE_ID } from 'src/components/Form/core/config';
import DataFormat from 'src/components/Form/core/DataFormat';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import * as actions from 'src/pages/worksheet/components/ChildTable/redux/actions';
import {
  checkCellIsEmpty,
  controlState,
  isRelateRecordTableControl,
  parseAdvancedSetting,
  replaceByIndex,
  sortControlByIds,
  updateOptionsOfControls,
} from 'src/utils/control';
import { canAsUniqueWidget } from 'src/utils/controlCommon';
import { compatibleMDJS } from 'src/utils/project';
import {
  copySublistRow,
  filterEmptyChildTableRows,
  filterRowsByKeywords,
  formatRecordToRelateRecord,
  handleUpdateDefsourceOfControl,
} from 'src/utils/record';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import ChildTableFlatComp from './ChildTableFlatComp';
import MobileTable from './MobileTable';
import RowDetailMobile from './RowDetailMobileModal';
import SearchInput from './SearchInput';
import TableComponent from './TableComponent';
import { normalizeSDKFilterControls } from './utils';

const HorizontalChildTableContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: ${props => (props.$height ? `${props.$height}px` : '100%')};
  width: ${props => (props.$width ? `${props.$width}px` : '100%')};
  overflow: hidden;
  box-sizing: border-box;
  ${props =>
    props.$isHorizontalPortrait &&
    `
      transform: rotate(90deg);
      transform-origin: top left;
      left: ${props.$height}px;
    `}
  ${props =>
    props.$isHorizontal &&
    !props.$isHorizontalPortrait &&
    `
      padding-left: constant(safe-area-inset-left);
      padding-left: env(safe-area-inset-left);
      padding-right: constant(safe-area-inset-right);
      padding-right: env(safe-area-inset-right);
      max-height: 100dvh;
      max-width: 100dvw;
    `}
  .horizontalScrollContent {
    flex: 1;
    min-height: 0;
    padding: 0 16px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--color-text-disabled) transparent;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-text-disabled);
      border-radius: 6px;
    }
  }
  .horizontalTableContent {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    > .mobileChildTableCon {
      flex: 1;
      min-height: 0 !important;
      margin-bottom: 0;
    }
  }
`;

const getViewportSize = () => {
  const viewport = window.visualViewport;

  return {
    width: Math.round((viewport && viewport.width) || window.innerWidth || document.documentElement.clientWidth),
    height: Math.round((viewport && viewport.height) || window.innerHeight || document.documentElement.clientHeight),
  };
};

const systemControls = SYSTEM_CONTROLS.map(c => ({ ...c, fieldPermission: '111' }));
const MAX_COUNT = 1000;
const DEFAULT_TABLE_PAGE_SIZE = 20;
const EXPAND_TABLE_PAGE_SIZE = 200;

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
    mobileIsEdit: PropTypes.bool,
    showSearch: PropTypes.bool,
    showExport: PropTypes.bool,
    filterControls: PropTypes.arrayOf(PropTypes.shape({})),
    setFilterControls: PropTypes.func,
  };

  static defaultProps = {
    masterData: { formData: [] },
    registerCell: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      controls: this.getControls(props),
      tempSheetColumnWidths: {},
      previewRowIndex: null,
      recordVisible: false,
      loading: !!props.recordId && !props.initSource && !(get(props, 'base.loaded') || get(props, 'base.reset')),
      pageIndex: 1,
      keywords: '',
      pageSize: this.settings.rownum,
      headHeight: 34,
      rowsLoadingStatus: {},
      showLoadingMask: false,
      h5height: props.control.advancedSetting.h5height || '0',
      showExpand: false, // 全屏显示子表
      expandShowType: 'current',
      appFilterId: '',
      viewportSize: getViewportSize(),
    };
    this.controls = props.controls;
    this.abortController = typeof AbortController !== 'undefined' && new AbortController();
    this.requestPool = createRequestPool({ abortController: this.abortController });
    const _handleUpdateCell = this.handleUpdateCell.bind(this);

    this.handleUpdateCell = (...args) => {
      flushSync(() => {
        _handleUpdateCell(...args);
      });
    };

    this.deleteConformAction = null;
    this.dataFormatCacheMap = new Map();
    props.registerCell(this);
    this.rowsLoading = {};
    this.viewportResizeTimer = null;
    this.expandPaginationFrame = null;
  }

  componentDidMount() {
    const { control, recordId, needResetControls } = this.props;
    this.updateDefsourceOfControl();
    if (recordId) {
      if (!(get(this, 'props.base.loaded') || get(this, 'props.base.reset'))) {
        this.loadRows(undefined, { needResetControls });
      }
    }

    if (_.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, options => this.refresh(null, options));
    }
  }

  componentDidUpdate(prevProps, prevState) {
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
        this.setState({
          controls: this.getControls(this.props),
        });
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
    }

    if (!prevState.showExpand && this.state.showExpand) {
      this.addViewportResizeListener();
      this.updateViewportSize();
    } else if (prevState.showExpand && !this.state.showExpand) {
      this.removeViewportResizeListener();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.state, nextState)) {
      return true;
    }

    return (
      !_.isEqual(this.props.rows, nextProps.rows) ||
      !_.isEqual(this.props.cellErrors, nextProps.cellErrors) ||
      !_.isEqual(this.props.mobileIsEdit, nextProps.mobileIsEdit) ||
      !_.isEqual(this.props.control.relationControls, nextProps.control.relationControls) ||
      !_.isEqual(this.props.control.fieldPermission, nextProps.control.fieldPermission) ||
      !_.isEqual(this.props.filterControls, nextProps.filterControls) ||
      this.props.refreshFlag !== nextProps.refreshFlag ||
      this.props.recordId !== nextProps.recordId ||
      !_.isEqual(this.props.control.value, nextProps.control.value) ||
      this.props.control.controlId !== nextProps.control.controlId ||
      !_.isEqual(this.props.control.showControls, nextProps.control.showControls) ||
      !_.isEqual(this.props.lastAction, nextProps.lastAction)
    );
  }

  componentWillUnmount() {
    const { mode, control } = this.props;

    if (mode !== 'dialog' && _.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, undefined);
    }

    this.abortController && this.abortController.abort && this.abortController.abort();
    this.dataFormatCacheMap.clear();
    this.removeViewportResizeListener();
    clearTimeout(this.viewportResizeTimer);
    window.cancelAnimationFrame && window.cancelAnimationFrame(this.expandPaginationFrame);
  }

  searchRef = React.createRef();

  addViewportResizeListener = () => {
    window.addEventListener('resize', this.handleViewportResize);
    window.addEventListener('orientationchange', this.handleViewportResize);
    window.visualViewport && window.visualViewport.addEventListener('resize', this.handleViewportResize);
  };

  removeViewportResizeListener = () => {
    window.removeEventListener('resize', this.handleViewportResize);
    window.removeEventListener('orientationchange', this.handleViewportResize);
    window.visualViewport && window.visualViewport.removeEventListener('resize', this.handleViewportResize);
  };

  handleViewportResize = () => {
    clearTimeout(this.viewportResizeTimer);
    this.viewportResizeTimer = setTimeout(this.updateViewportSize, 100);
  };

  updateViewportSize = () => {
    const viewportSize = getViewportSize();

    if (_.isEqual(viewportSize, this.state.viewportSize)) return;

    this.setState({ viewportSize });
  };

  updateExpandPagination = showExpand => {
    const { updatePagination = () => {} } = this.props;

    if (window.cancelAnimationFrame && this.expandPaginationFrame) {
      window.cancelAnimationFrame(this.expandPaginationFrame);
      this.expandPaginationFrame = null;
    }

    updatePagination({ pageIndex: 1, pageSize: DEFAULT_TABLE_PAGE_SIZE });

    if (!showExpand) return;

    const updateLargePage = () => {
      this.expandPaginationFrame = null;
      updatePagination({ pageIndex: 1, pageSize: EXPAND_TABLE_PAGE_SIZE });
    };

    if (window.requestAnimationFrame) {
      this.expandPaginationFrame = window.requestAnimationFrame(() => {
        this.expandPaginationFrame = window.requestAnimationFrame(updateLargePage);
      });
    } else {
      updateLargePage();
    }
  };

  get settings() {
    const { control = {} } = this.props;
    const parsedSettings = parseAdvancedSetting(control.advancedSetting);
    let { min, max, rownum, enablelimit } = parsedSettings;
    let minCount;
    let maxCount = _.get(window, 'shareState.isPublicForm') ? 200 : MAX_COUNT;

    if (enablelimit) {
      minCount = min;
      maxCount = max;
    }

    return { ...parsedSettings, minCount, maxCount, rownum };
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
      const control = { ...c };
      const resetedControl = _.find(relationControls.concat(systemControls), { controlId: control.controlId });

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
    updateBase({ controls: result });
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
    this.requestPool = createRequestPool({ abortController: this.abortController });
    this.dataFormatCacheMap.clear();
  };

  getControl(controlId) {
    return _.find(this.state.controls, { controlId });
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

  loadRows = (nextProps, { needResetControls, isRefresh } = {}) => {
    const { control, recordId, masterData, loadRows, from, base = {} } = nextProps || this.props;
    const { instanceId, workId, worksheetInfo, originControls } = base;
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
      setLoadingInfo: control.setLoadingInfo,
      callback: res => {
        // 子表刷新没有重置 dataForm 的错误状态
        if (_.isFunction(get(control, 'dataFormat.current.revalidateControl'))) {
          control.dataFormat.current.revalidateControl(control.controlId);
        }

        if (res === null) {
          this.setState({ error: _l('没有权限') });
          return;
        }

        const state = { loading: false };

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
            state.controls = this.getControls(nextProps, { newControls });
          }
        }

        this.setState(state, () => {
          if (isWorkflow && isRefresh) {
            if (!_.isEmpty(originControls) && _.isFunction(control.updateRelationControls)) {
              control.updateRelationControls(control.controlId, originControls);
            }
          }
        });
      },
    });
  };

  refresh = (nextProps, { needResetControls = true } = {}) => {
    const { updatePagination = () => {} } = nextProps || this.props;
    const { showExpand } = this.state;

    this.setState({ loading: true, keywords: undefined, pageIndex: 1 });

    updatePagination({ pageIndex: 1, pageSize: showExpand ? EXPAND_TABLE_PAGE_SIZE : DEFAULT_TABLE_PAGE_SIZE });
    this.loadRows(nextProps, { needResetControls, isRefresh: true });
    if (get(this, 'searchRef.current.clear')) {
      this.searchRef.current.clear();
    }

    this.dataFormatCacheMap.clear();
  };

  openAppFilter = columns => {
    const { appId, control = {}, recordId, setFilterControls, updatePagination = () => {} } = this.props;
    const { showControls } = control;
    const { appFilterId, showExpand } = this.state;
    const worksheetInfo = {
      ...this.worksheetInfo,
      appId: this.worksheetInfo.appId || appId,
      worksheetId: this.worksheetInfo.worksheetId || control.dataSource,
      template: {
        ...this.worksheetInfo.template,
        controls: columns.filter(v =>
          _.isArray(showControls) && showControls.length ? _.includes(showControls, v.controlId) : true,
        ),
      },
    };

    compatibleMDJS('customizeFilterForWorksheet', {
      filterId: appFilterId,
      item: worksheetInfo,
      viewId: control.viewId,
      canReset: true,
      success: res => {
        const filterId = get(res, 'filterId');
        const filterControls = normalizeSDKFilterControls(safeParse(get(res, 'filter'), 'array'));

        setFilterControls(filterControls);
        if (!recordId) return;

        updatePagination({ pageIndex: 1, pageSize: showExpand ? EXPAND_TABLE_PAGE_SIZE : DEFAULT_TABLE_PAGE_SIZE });
        this.setState(
          {
            appFilterId: filterId || appFilterId,
            loading: true,
            keywords: '',
            pageIndex: 1,
            isMobileSearchFocus: false,
          },
          () => {
            if (get(this, 'searchRef.current.clear')) {
              this.searchRef.current.clear();
            }

            this.loadRows(undefined, { needResetControls: false });
          },
        );
        this.dataFormatCacheMap.clear();
      },
      cancel: res => {
        console.log('cancel', res);
      },
    });
  };

  triggerCustomEvent = () => {
    if (_.isFunction(get(this, 'props.control.triggerCustomEvent'))) {
      get(this, 'props.control.triggerCustomEvent')(ADD_EVENT_ENUM.CHANGE);
    }
  };

  getShowColumns() {
    const { control } = this.props;
    const { controls } = this.state;
    const hiddenTypes = window.isPublicWorksheet ? [48] : [];
    const { h5showtype } = parseAdvancedSetting(control.advancedSetting);
    let columns = !controls.length
      ? [{}]
      : controls
          .filter(c =>
            h5showtype == '2'
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

    return columns;
  }

  newRow = (defaultRow, { isDefaultValue, isCreate, isQueryWorksheetFill, isImportFromExcel } = {}) => {
    const tempRowId = !isDefaultValue ? `temp-${uuidv4()}` : `default-${uuidv4()}`;
    const row = this.rowUpdate(
      { row: defaultRow, rowId: tempRowId },
      { isCreate, isQueryWorksheetFill, isImportFromExcel },
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

  copyRow = row => {
    const { maxCount } = this.settings;
    const { rows, control = {} } = this.props;
    const isExceed = filterEmptyChildTableRows(rows).length >= maxCount;
    const parsedSettings = parseAdvancedSetting(control.advancedSetting);
    let { enablelimit } = parsedSettings;

    if (isExceed) {
      alert(enablelimit ? _l('已超过子表最大行数') : _l('最多输入%0条记录', maxCount), 3);
      return;
    }

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
    this.handleSwitch({ next: true });
    this.triggerCustomEvent();
  };

  rowUpdate(
    { row, controlId, value, rowId } = {},
    { isCreate = false, isQueryWorksheetFill = false, isImportFromExcel } = {},
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
          row: { rowid: rowId || (row || {}).rowid },
        },
        {
          isQueryWorksheetFill,
          asyncUpdate: true,
          userTriggerChange: false,
          updateSuccessCb: needUpdateRow => {
            this.handleRowDetailSave(needUpdateRow);
          },
        },
      );
    };

    const formdata = new DataFormat({
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

    if (controlId) {
      formdata.updateDataSource({ controlId, value });
    }

    return [
      {
        ...(row || {}),
        rowid: row ? row.rowid : rowId,
        updatedControlIds: _.uniqBy(((row && row.updatedControlIds) || []).concat(formdata.getUpdateControlIds())),
      },
      ..._.filter(formdata.getDataSource(), c => c.controlId !== 'rowid'),
    ].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
  }

  handleAddRowByLine = () => {
    const { from, control, addRow, rows } = this.props;
    const maxCount = this.settings.maxCount;
    const controlPermission = controlState(control, from);
    const disabled = !controlPermission.editable || control.disabled;
    let { allowadd } = parseAdvancedSetting(control.advancedSetting);
    const filteredRows = filterEmptyChildTableRows(rows);
    const disabledNew = filteredRows.length >= maxCount || disabled || !allowadd;

    if (disabledNew) {
      return;
    }

    this.updateDefsourceOfControl();
    const row = this.newRow();
    addRow(row);
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

    mobileSelectRecord({
      layerId: `mobileSelectRecord-${control.controlId}`,
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
      formData: controls.map(c => ({ ...c, value: tempRow[c.controlId] })).concat(this.props.masterData.formData),
      onOk: selectedRecords => {
        const rowsLength = filterEmptyChildTableRows(rows).length;

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
        this.triggerCustomEvent();
        setTimeout(() => {
          try {
            const ele = document.querySelector('.mobileSheetRowRecord .recordScroll');

            if (ele) {
              const itemHeight =
                h5showtype === '2' ? 36 * ((_.isEmpty(h5abstractids) ? 3 : h5abstractids.length) + 1) : 36;
              ele.scrollTop = ele.scrollTop + (selectedRecords.length - 1) * itemHeight;
            }
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
    const newRow = this.rowUpdate(
      { row: rowData, controlId: cell.controlId, value },
      {
        ...options,
        control,
      },
    );

    function update() {
      if (_.isFunction(options.updateSuccessCb)) {
        options.updateSuccessCb(newRow);
      }

      updateRow({ rowid: row.rowid, value: newRow }, { asyncUpdate: options.asyncUpdate });
    }

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
    this.triggerCustomEvent();
  }

  handleClearCellError = (rowid, updatedControlIds = [], { validateAll } = {}) => {
    const { cellErrors, updateCellErrors } = this.props;

    if (!rowid || _.isEmpty(cellErrors)) {
      return;
    }

    const newCellErrors = validateAll
      ? _.omitBy(cellErrors, (value, key) => key.startsWith(`${rowid}-`))
      : _.omit(
          cellErrors,
          updatedControlIds.map(controlId => `${rowid}-${controlId}`),
        );

    if (!_.isEqual(newCellErrors, cellErrors)) {
      updateCellErrors(newCellErrors);
    }
  };

  handleRowDetailSave = (row, updatedControlIds, saveOptions = {}) => {
    const { updateRow, addRow } = this.props;
    const { previewRowIndex, controls } = this.state;
    const newControls = updateOptionsOfControls(
      controls.map(c => ({ ...{}, ...c, value: row[c.controlId] })),
      row,
    );
    this.setState(
      {
        controls: controls.map(c => {
          const newControl = _.find(newControls, { controlId: c.controlId });
          return newControl ? { ...newControl, value: c.value } : c;
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

        if (!saveOptions.hasError) {
          this.handleClearCellError(row.rowid, updatedControlIds, saveOptions);
        }

        if (previewRowIndex > -1) {
          updateRow({ rowid: row.rowid, value: row });
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
    const checkControl = _.find(controls, { controlId });
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
              // 不唯一
              updateCellErrors({ [`${rowId}-${controlId}`]: FORM_ERROR_TYPE_TEXT.UNIQUE(checkControl, true) });
            } else if (res.isSuccess) {
              // 唯一
            }
          });
      }
    } else {
      return true;
    }
  };

  // 删除记录
  deleteRecord = (rowid, callback = () => {}) => {
    const { deleteRow } = this.props;
    this.deleteConformAction = ActionSheet.show({
      popupClassName: 'md-adm-actionSheet',
      actions: [],
      extra: (
        <div className="flexColumn w100">
          <div className="bold textPrimary Font17 pTop10">{_l('确定删除此记录 ?')}</div>
          <div className="valignWrapper flexRow confirm mTop24">
            <Button
              className="flex mRight6 bold textSecondary flex ellipsis Font13"
              onClick={() => this.deleteConformAction.close()}
            >
              {_l('取消')}
            </Button>
            <Button
              className="flex mLeft6 bold flex ellipsis Font13"
              color="danger"
              onClick={() => {
                this.deleteConformAction.close();
                deleteRow(rowid);
                callback();
              }}
            >
              {_l('确定')}
            </Button>
          </div>
        </div>
      ),
    });
  };

  // 设置行高（一次性）
  renderSettingRowHeight = () => {
    const { showRowHeightModal, h5height } = this.state;
    if (!showRowHeightModal) return null;
    return (
      <Popup
        className="mobileModal settingRowHeightModal"
        bodyStyle={{ 'border-radius': '8px' }}
        visible={showRowHeightModal}
        onMaskClick={() => this.setState({ showRowHeightModal: false })}
      >
        <div className="flexRow header">
          <div className="Font13 textTertiary flex">{_l('表格行高')}</div>
          <div className="closeIcon" onClick={() => this.setState({ showRowHeightModal: false })}>
            <i className="icon icon-close Font17 textTertiary bold" />
          </div>
        </div>
        {[
          { value: '0', text: _l('紧凑') },
          { value: '1', text: _l('中等') },
          { value: '2', text: _l('高') },
          { value: '3', text: _l('自适应') },
        ].map(item => (
          <div
            key={item.value}
            className="rowHeightItem flexRow alignItemsCenter"
            onClick={() => this.setState({ h5height: item.value, showRowHeightModal: false })}
          >
            <div className="flex">{item.text}</div>
            {h5height === item.value && <i className="icon icon-done colorPrimary Font20" />}
          </div>
        ))}
      </Popup>
    );
  };

  render() {
    const {
      cellErrors,
      from,
      recordId,
      control,
      rows,
      deleteRow,
      mobileIsEdit,
      appId,
      sheetSwitchPermit,
      showSearch,
      masterData,
      isDraft,
      filterControls = [],
      pagination = {},
      updatePagination = () => {},
    } = this.props;
    const { projectId, rules } = this.worksheetInfo;
    const { searchConfig } = this;
    let {
      allowcancel,
      allowedit,
      batchcids,
      allowsingle,
      hidenumber,
      h5showtype,
      h5abstractids,
      titleWrap,
      allowCopy,
    } = parseAdvancedSetting(control.advancedSetting);

    const { useUserPermission } = this;
    let allowadd = parseAdvancedSetting(control.advancedSetting).allowadd;
    allowadd = allowadd && (useUserPermission ? this.worksheetInfo.allowAdd : true);
    const { maxCount } = this.settings;
    const {
      loading,
      error,
      previewRowIndex,
      recordVisible,
      controls,
      keywords,
      isEditCurrentRow,
      isMobileSearchFocus,
      isAddRowByLine,
      h5height,
      showExpand,
      expandShowType,
      viewportSize,
    } = this.state;

    const batchAddControls = batchcids.map(id => _.find(controls, { controlId: id })).filter(_.identity);
    const addRowFromRelateRecords = !!batchAddControls.length;
    const allowAddByLine =
      (_.isUndefined(_.get(control, 'advancedSetting.allowsingle')) && !addRowFromRelateRecords) || allowsingle;
    const controlPermission = controlState(control, from);
    let tableRows = rows.map(row => {
      if (/^temp/.test(row.rowid)) {
        return row;
      } else if (/^empty/.test(row.rowid)) {
        return { ...row, allowedit: allowadd };
      } else {
        return { ...row, allowedit: allowedit && (useUserPermission ? row.allowedit : true) };
      }
    });
    const originRows = tableRows;
    const disabled = !controlPermission.editable || control.disabled;
    const noColumns = !controls.length;
    const columns = this.getShowColumns();
    const isExceed = filterEmptyChildTableRows(originRows).length >= maxCount;
    const disabledNew = noColumns || disabled || !allowadd;

    if (!columns.length) {
      return <div className="childTableEmptyTag"></div>;
    }

    if (keywords) {
      tableRows = filterRowsByKeywords({ rows: tableRows, controls: controls, keywords });
    }

    let tableData = tableRows;

    const currentRow = previewRowIndex > -1 && previewRowIndex < tableData.length ? tableData[previewRowIndex] : null;

    const expandH5ShowType = showExpand && expandShowType === 'table' ? '3' : h5showtype;
    const Component =
      expandH5ShowType === '3' ? TableComponent : expandH5ShowType === '2' ? ChildTableFlatComp : MobileTable;
    const isExpandTable = showExpand && expandH5ShowType === '3';
    const isHorizontalPortrait = isExpandTable && viewportSize.width <= viewportSize.height;

    const renderOperateComp = () => (
      <div className="operates">
        {showSearch && (
          <SearchInput
            ref={this.searchRef}
            inputWidth={100}
            searchIcon={
              <div className="operateBtnBox">
                <i className="icon icon-search" />
              </div>
            }
            keywords={keywords}
            focusedClass={cx({ mRight10: !isMobileSearchFocus })}
            onOk={value => {
              const searchResult = filterRowsByKeywords({ rows: tableRows, controls: controls, keywords: value });
              updatePagination({
                count: !value ? rows.length : searchResult.length,
                pageIndex: tableRows.length <= pagination.count ? 1 : pagination.pageIndex,
              });
              this.setState({ keywords: value, pageIndex: 1 });
            }}
            onClear={() => {
              this.setState({ keywords: '', pageIndex: 1, isMobileSearchFocus: false });

              updatePagination({ count: rows.length, pageIndex: 1 });
            }}
            onFocus={() => this.setState({ isMobileSearchFocus: true })}
            onBlur={() => this.setState({ isMobileSearchFocus: false })}
          />
        )}
        {!isMobileSearchFocus && window.isMingDaoApp && !mobileIsEdit && (
          <span className="mLeft12" onClick={() => this.openAppFilter(columns)}>
            <div className="operateBtnBox">
              <i className={cx('icon icon-worksheet_filter', { colorPrimaryLight: !_.isEmpty(filterControls) })} />
            </div>
          </span>
        )}
        {!isMobileSearchFocus && recordId && (
          <span className="mLeft12" onClick={() => this.refresh()}>
            <div className="operateBtnBox">
              <i className="icon icon-task-later" />
            </div>
          </span>
        )}
        {/* 设置行高 */}
        {!isMobileSearchFocus && !mobileIsEdit && !this.props.disabled && expandH5ShowType === '3' && (
          <span className="mLeft12" onClick={() => this.setState({ showRowHeightModal: true })}>
            <div className="operateBtnBox">
              <i
                className={cx('icon icon-row_height', {
                  colorPrimary: h5height !== _.get(control, 'advancedSetting.h5height'),
                })}
              />
            </div>
          </span>
        )}
        {!isMobileSearchFocus && !mobileIsEdit && !keywords && (
          <Fragment>
            {!showExpand && h5showtype !== '3' && (
              <span
                className="mLeft12"
                onClick={() => {
                  const nextShowExpand = !(showExpand && expandShowType === 'table');
                  this.setState({
                    showExpand: nextShowExpand,
                    expandShowType: 'table',
                    viewportSize: getViewportSize(),
                  });
                  this.updateExpandPagination(nextShowExpand);
                }}
              >
                <div className="operateBtnBox">
                  <i
                    className={cx('icon', {
                      'themeIcon icon-zoom_out2': showExpand && expandShowType === 'table',
                      'icon-table': !showExpand || expandShowType !== 'table',
                    })}
                  />
                </div>
              </span>
            )}
            <span
              className="mLeft12"
              onClick={() => {
                this.setState({
                  showExpand: !showExpand,
                  expandShowType: 'current',
                  viewportSize: getViewportSize(),
                });
                this.updateExpandPagination(!showExpand);
              }}
            >
              <div className="operateBtnBox">
                <i className={cx('icon', { 'themeIcon icon-zoom_out2': showExpand, 'icon-enlarge1': !showExpand })} />
              </div>
            </span>
          </Fragment>
        )}
      </div>
    );

    const content = (
      <div className={cx('mobileChildTableCon', { 'flex flexColumn': expandH5ShowType === '3' && showExpand })}>
        {!_.isEmpty(cellErrors) && (
          <span className="errorTip ellipsis" style={{ top: -31 }}>
            {_l('请正确填写%0', control.controlName)}{' '}
          </span>
        )}
        {!showExpand && renderOperateComp()}
        {!loading && (
          <Component
            sheetSwitchPermit={sheetSwitchPermit}
            allowcancel={allowcancel}
            allowadd={allowadd}
            disabled={disabled}
            controlPermission={controlPermission}
            rows={tableRows}
            tableRows={tableRows}
            controls={columns.map(c => ({
              ...c,
              hidden: !_.includes(control.showControls, c.controlId) ? true : c.hidden,
            }))}
            onOpen={this.openDetail}
            isEdit={mobileIsEdit}
            onDelete={this.deleteRecord}
            showNumber={!hidenumber}
            h5abstractids={h5abstractids}
            appId={appId}
            worksheetId={control.dataSource}
            rules={rules}
            // 平铺子表内部的 CustomFields 需要查询默认值配置来触发查询工作表回填
            searchConfig={searchConfig}
            cellErrors={cellErrors}
            projectId={projectId}
            allowedit={allowedit}
            titleWrap={titleWrap}
            isAddRowByLine={isAddRowByLine}
            from={from}
            isDraft={isDraft}
            showControls={control.showControls}
            h5height={h5height} //表格行高
            masterData={masterData}
            getMasterFormData={() => this.props.masterData.formData}
            useUserPermission={useUserPermission}
            recordId={recordId}
            showExpand={showExpand}
            control={control}
            widgetStyle={this.worksheetInfo.advancedSetting}
            updateIsAddByLine={value => this.setState({ isAddRowByLine: value })}
            onSave={this.handleRowDetailSave}
            submitChildTableCheckData={control.submitChildTableCheckData}
            loadRows={this.loadRows}
          />
        )}
        {loading &&
          (error ? (
            <div className="center textTertiary">{error}</div>
          ) : (
            <div style={{ padding: 10 }}>
              <Skeleton
                style={{ flex: 1 }}
                direction="column"
                widths={['30%', '40%', '90%', '60%']}
                active
                itemStyle={{ marginBottom: '10px' }}
              />
            </div>
          ))}

        <div className="operate valignWrapper mTop12">
          {mobileIsEdit && !disabledNew && !isExceed && addRowFromRelateRecords && (
            <span
              className="addRowByDialog h5 ellipsis mRight10"
              onClick={() => this.handleAddRowsFromRelateRecord(batchAddControls)}
            >
              <i className="icon icon-done_all mRight5 Font16"></i>
              <span className="content ellipsis" style={{ maxWidth: 200 }}>
                {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
              </span>
            </span>
          )}
          {mobileIsEdit && !disabledNew && !isExceed && allowAddByLine && (
            <span
              className="addRowByLine h5 customFormButton"
              onClick={() => {
                this.handleAddRowByLine();
                this.setState({
                  previewRowIndex: keywords ? originRows.length : tableRows.length,
                  recordVisible: h5showtype === '2' ? false : true,
                  isAddRowByLine: true,
                });
              }}
            >
              <i className="icon icon-add mRight5 Font16"></i>
              {_l('添加')}
            </span>
          )}
        </div>

        {recordVisible && (
          <RowDetailMobile
            widgetStyle={this.worksheetInfo.advancedSetting}
            isEditCurrentRow={isEditCurrentRow}
            masterData={masterData}
            isWorkflow
            ignoreLock={/^(temp|default|empty)/.test((currentRow || {}).rowid)}
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
                <Fragment>
                  <div className="ellipsis">{control.controlName}</div>
                  <div>#{previewRowIndex + 1}</div>
                </Fragment>
              ) : (
                _l('创建%0', control.controlName)
              )
            }
            disabled={disabled || (!/^temp/.test((currentRow || {}).rowid) && !allowedit)}
            isExceed={isExceed}
            mobileIsEdit={mobileIsEdit}
            allowDelete={
              /^temp/.test((currentRow || {}).rowid) ||
              (allowcancel && (useUserPermission && !!recordId ? _.get(currentRow, 'allowdelete') : true))
            }
            allowCopy={allowadd && allowCopy && isEditCurrentRow && !disabled}
            controls={controls.map(c => ({
              ...c,
              hidden: !_.includes(control.showControls, c.controlId) ? true : c.hidden,
            }))}
            data={currentRow || this.newRow()}
            switchDisabled={{
              prev: previewRowIndex === 0,
              next: previewRowIndex === filterEmptyChildTableRows(tableData.filter(r => !r.isSubListFooter)).length - 1,
            }}
            getMasterFormData={() => this.props.masterData.formData}
            handleUniqueValidate={this.handleUniqueValidate}
            onSwitch={this.handleSwitch}
            onSave={this.handleRowDetailSave}
            onDelete={this.deleteRecord}
            deleteRow={deleteRow}
            onClose={() => this.setState({ recordVisible: false, isEditCurrentRow: false })}
            rules={rules}
            copyRow={this.copyRow}
            openNextRecord={() => {
              this.handleAddRowByLine();
              this.setState({
                previewRowIndex: keywords ? originRows.length : tableRows.length,
                recordVisible: true,
              });
            }}
          />
        )}

        {this.renderSettingRowHeight()}
      </div>
    );

    return (
      <Fragment>
        {!showExpand && content}
        {showExpand && (
          <Popup
            className="mobileModal full expandChildTable"
            position="left"
            visible={showExpand}
            onMaskClick={() => this.setState({ showExpand: false })}
          >
            <HorizontalChildTableContent
              $isHorizontal={isExpandTable}
              $isHorizontalPortrait={isHorizontalPortrait}
              $height={isExpandTable ? (isHorizontalPortrait ? viewportSize.width : viewportSize.height) : undefined}
              $width={isExpandTable ? (isHorizontalPortrait ? viewportSize.height : viewportSize.width) : undefined}
            >
              <div className={cx('Relative w100 h100 flexColumn', { expandChildTableCon: expandH5ShowType !== '3' })}>
                <div className="expandChildTableHeader">
                  <div className="controlLabelName flex ellipsis">
                    {control.controlName}
                    {`(${pagination.count})`}
                  </div>
                  {renderOperateComp()}
                </div>
                <div className={cx('horizontalScrollContent', { horizontalTableContent: expandH5ShowType === '3' })}>
                  {content}
                </div>
              </div>
            </HorizontalChildTableContent>
          </Popup>
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  baseLoading: state.baseLoading,
  base: state.base,
  rows: state.rows,
  lastAction: state.lastAction,
  cellErrors: state.cellErrors,
  pagination: state.pagination,
  filterControls: state.filterControls,
});

const mapDispatchToProps = dispatch => ({
  loadRows: bindActionCreators(actions.loadRows, dispatch),
  initRows: bindActionCreators(actions.initRows, dispatch),
  addRow: bindActionCreators(actions.addRow, dispatch),
  addRows: bindActionCreators(actions.addRows, dispatch),
  updateRow: bindActionCreators(actions.updateRow, dispatch),
  deleteRow: bindActionCreators(actions.deleteRow, dispatch),
  exportSheet: bindActionCreators(actions.exportSheet, dispatch),
  updateCellErrors: bindActionCreators(actions.updateCellErrors, dispatch),
  updateBase: bindActionCreators(actions.updateBase, dispatch),
  updatePagination: bindActionCreators(actions.updatePagination, dispatch),
  setFilterControls: bindActionCreators(actions.setFilterControls, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChildTable);
