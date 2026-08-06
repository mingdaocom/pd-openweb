import _, {
  assign,
  find,
  get,
  includes,
  isArray,
  isEmpty,
  isFunction,
  isObject,
  isUndefined,
  last,
  omit,
  pick,
} from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { batchEditRecord } from 'worksheet/common/BatchEditRecord';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { getTreeExpandSize, handleUpdateTreeNodeExpansion, treeDataUpdater } from 'worksheet/common/TreeTableHelper';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import DataFormat from 'src/components/Form/core/DataFormat';
import { SYSTEM_CONTROL, WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import { deleteRecord, updateRecordControl, updateRelateRecords } from 'src/pages/worksheet/common/recordInfo/crtl';
import { formatValuesOfCondition, getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getTranslateInfo } from 'src/utils/app';
import { getFilledRequestParams } from 'src/utils/common';
import { controlState, replaceByIndex } from 'src/utils/control';
import { handleRowData } from 'src/utils/record';
import { replaceAdvancedSettingTranslateInfo, replaceControlsTranslateInfo } from 'src/utils/translate';
import { getVisibleControls } from '../utils';

/**
 * 解析字符串为数字
 * @param {string} numStr - 要解析的字符串
 * @returns {number|undefined} - 解析结果，如果解析失败则返回 undefined
 */
const parseNumber = numStr => {
  const result = Number(numStr);
  return isFinite(result) ? result : undefined;
};

/**
 * 计算树形表格的根节点
 * 关联记录的父子关系既可能由子记录的 pid 表达，也可能仅由父记录的 childrenids 表达
 * （如复制记录时接口返回的子记录 pid 为空，仅父记录的 childrenids 引用了它）。
 * 仅按 `!r.pid` 判定会让这类子记录既作为根节点、又被父节点嵌套，从而重复显示。
 * 这里额外排除被其他记录 childrenids 引用的记录，保证子记录只出现在父节点下。
 * @param {Array} records 全部记录
 * @param {boolean} requireDefinedPid 是否要求 pid 字段已定义（初始接口数据用）
 */
function getTreeRootRows(records = [], { requireDefinedPid = false } = {}) {
  const childIds = new Set();
  records.forEach(r => {
    safeParse(r.childrenids, 'array').forEach(id => id && childIds.add(id));
  });
  return records.filter(r => !r.pid && !childIds.has(r.rowid) && (!requireDefinedPid || typeof r.pid !== 'undefined'));
}

export function updateTreeNodeExpansion(row = {}, { expandAll, forceUpdate, getNewRows, updateRows } = {}) {
  return (dispatch, getState) => {
    const { base = {}, records = [], changes = {}, treeTableViewData } = getState();
    const { control, recordId, worksheetId, instanceId, workId, from, isDraft } = base;
    const { addedRecords = [] } = changes;
    const allRecords = recordId ? records.concat(addedRecords) : records;
    const { treeMap, maxLevel } = treeTableViewData;

    // 异步展开下层节点：仍走主记录的关联字段（control.controlId）拉取——关联字段本就平铺挂着整棵树的所有节点，
    // 通过 fastFilters 按 rowid 筛出当前展开节点的子记录（与 ChildTable 树形展开同一取数方式）。
    // 这样深层级与默认展开同一取数口径，保留主表关联配置的结果过滤与权限。
    const getNewRowsFn =
      getNewRows ||
      (() =>
        worksheetAjax
          .getRowRelationRows({
            worksheetId,
            rowId: recordId,
            controlId: control.controlId,
            pageIndex: 1,
            pageSize: 200,
            fastFilters: [
              {
                controlId: 'rowid',
                value: row.rowid,
              },
            ],
            // 草稿箱下需与首屏取数同口径，传 getType: 21，否则异步展开拉取子节点接口取数不对
            getType: from === RECORD_INFO_FROM.DRAFT || isDraft ? 21 : undefined,
            instanceId,
            workId,
          })
          .then(res => {
            const newRows = (res.data || []).map(r => ({ ...r, pid: row.rowid }));
            dispatch(appendFakeRecords(newRows));
            return newRows;
          }));
    dispatch(
      handleUpdateTreeNodeExpansion(row, {
        expandAll,
        forceUpdate,
        treeMap,
        maxLevel,
        rows: allRecords,
        getNewRows: getNewRowsFn,
        updateRows,
      }),
    );
  };
}

export const updateTreeTableViewData =
  ({ pageIndexStart = 0, resetExpansion = false } = {}) =>
  (dispatch, getState) => {
    const { base, changes = {}, records, treeTableViewData = {} } = getState();
    const { addedRecords = [] } = changes;

    if (!base.isTreeTableView) {
      return;
    }

    const allRecords = base.recordId ? records.concat(addedRecords) : records;
    const expandSize = getTreeExpandSize(base.control);
    const { treeMap, maxLevel } = treeDataUpdater(
      {},
      {
        rootRows: getTreeRootRows(allRecords),
        rows: allRecords,
        levelLimit: 20,
        pageIndexStart,
        expandSize,
        // 复用当前展开状态：新增/编辑关联记录后重建树形时，保留用户手动展开的层级，
        // 否则新建子级、关闭弹窗后会重置为默认层级，导致已展开的根节点收起、渲染异常。
        // 取消变更（resetExpansion）时必须丢弃旧 treeMap，基于还原后的 records 干净重建，
        // 否则会复用撤销前残留的展开 / childrenIds 状态，导致树形结构错乱
        prevTreeMap: resetExpansion ? undefined : treeTableViewData.treeMap,
      },
    );
    dispatch({
      type: 'UPDATE_TREE_TABLE_VIEW_DATA',
      value: { maxLevel, treeMap },
    });
  };

export function loadRecords({ pageIndex, pageSize, keywords, getRules, getWorksheet } = {}) {
  return async (dispatch, getState) => {
    const state = getState();
    const { base = {}, tableState = {}, changes = {} } = state;
    const { addedRecords = [], deletedRecordIds = [] } = changes;
    const { filterControls } = tableState;
    const { from, worksheetId, control, recordId, instanceId, workId, isDraft, isTab, direction } = base;
    pageIndex = pageIndex || tableState.pageIndex;
    pageSize = pageSize || tableState.pageSize;
    if (!isTab) {
      pageSize = 30;
    }

    if (direction === 'vertical') {
      pageSize = 50;
    }

    keywords = !isUndefined(keywords) ? keywords : tableState.keywords;
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { tableLoading: true },
    });
    let args = {};
    args.discussId = control.discussId;
    const res = await worksheetAjax.getRowRelationRows({
      worksheetId,
      rowId: recordId,
      controlId: control.controlId,
      pageIndex,
      keywords,
      pageSize,
      getWorksheet,
      getRules,
      filterControls: filterControls || [],
      sortId: (tableState.sortControl || {}).controlId,
      isAsc: (tableState.sortControl || {}).isAsc,
      getType: from === RECORD_INFO_FROM.DRAFT || isDraft ? 21 : undefined,
      instanceId,
      workId,
      ...args,
    });

    if (res.resultCode !== 1) {
      dispatch({
        type: 'UPDATE_TABLE_STATE',
        value: { error: _l('工作表已删除或无权限') },
      });
      return;
    }

    const records =
      !base.isTab && recordId
        ? res.data.filter(r => !includes(deletedRecordIds.concat(addedRecords), r.rowid))
        : res.data;
    dispatch({
      type: 'UPDATE_RECORDS',
      records: records || [],
    });
    dispatch(updateTreeTableViewData({ pageIndexStart: pageSize * (pageIndex - 1) }));
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { tableLoading: false, pageIndex, pageSize, keywords },
    });
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: {
        count: res.count,
        ...(base.saveSync ? {} : { countForShow: res.count - deletedRecordIds.length + addedRecords.length }),
      },
    });
    dispatch(getRelateRecordSummary());
  };
}

export function updatePageIndex(pageIndex) {
  return async dispatch => {
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { pageIndex },
    });
    dispatch(loadRecords({ pageIndex }));
  };
}

export function updateRowsWithChanges(rowIds, changes) {
  return {
    type: 'UPDATE_ROWS_WITH_CHANGES',
    rowIds,
    changes,
  };
}

export function updatePageSize(pageSize) {
  return async dispatch => {
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { pageIndex: 1, pageSize },
    });
    dispatch(loadRecords({ pageIndex: 1, pageSize }));
  };
}

function getTableConfigFromControl(control, { allowEdit, relateWorksheetInfo, recordId } = {}) {
  const controlPermission = controlState(control, recordId ? 3 : 2);
  const allowRemoveRelation =
    typeof control.advancedSetting.allowcancel === 'undefined' ? true : control.advancedSetting.allowcancel === '1';
  const [isHiddenOtherViewRecord, , onlyRelateByScanCode] = (control.strDefault || '').split('').map(b => !!+b);
  const disabledManualWrite = onlyRelateByScanCode && control.advancedSetting.dismanual === '1';
  let fixedColumnCount;

  if (typeof control.advancedSetting.freezeids !== 'undefined') {
    fixedColumnCount = Number(safeParse(control.advancedSetting.freezeids, 'array')[0] || '0');
  } else if (typeof control.advancedSetting.fixedcolumncount !== 'undefined') {
    fixedColumnCount = Number(control.advancedSetting.fixedcolumncount) || 0;
  }

  const showNumber = control.advancedSetting.hidenumber !== '1';
  const editable = !control.disabled && allowEdit && controlPermission.editable;
  const addVisible =
    editable &&
    !isEmpty(relateWorksheetInfo) &&
    relateWorksheetInfo.allowAdd &&
    control.enumDefault2 !== 1 &&
    control.enumDefault2 !== 11 &&
    !disabledManualWrite &&
    !(!recordId && control.type === 51) &&
    !get(window, 'shareState.isPublicForm');
  const selectVisible =
    editable &&
    !isEmpty(relateWorksheetInfo) &&
    control.enumDefault2 !== 10 &&
    control.enumDefault2 !== 11 &&
    !disabledManualWrite &&
    control.type !== 51;
  const allowBatchFromSetting = get(control, 'advancedSetting.allowbatch') === '1';
  const allowDeleteFromSetting = get(control, 'advancedSetting.allowdelete') === '1';
  const allowBatchEdit = editable && allowBatchFromSetting;
  const allowExportFromSetting = get(control, 'advancedSetting.allowexport') === '1';
  const searchMaxCount = parseNumber((control.advancedSetting || {}).maxcount || undefined);
  return {
    showNumber,
    fixedColumnCount,
    controlPermission,
    addVisible,
    selectVisible,
    allowBatchEdit,
    allowRemoveRelation,
    allowDeleteFromSetting,
    allowExportFromSetting,
    searchMaxCount,
    isHiddenOtherViewRecord,
  };
}

export function updateTableConfigByControl(control) {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {} } = state;
    const { from, allowEdit, relateWorksheetInfo, recordId } = base;

    if (typeof control === 'undefined') {
      control = base.control;
    }

    if (!control) return;
    const tableConfig = getTableConfigFromControl(control, { from, allowEdit, relateWorksheetInfo, recordId });
    dispatch({
      type: 'UPDATE_BASE',
      value: {
        control,
        ...tableConfig,
      },
    });
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { fixedColumnCount: tableConfig.fixedColumnCount },
    });
  };
}

export const updateBase = value => ({
  type: 'UPDATE_BASE',
  value,
});

export function init() {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.initialized) return;
    const { base = {}, tableState } = state;
    const { from, worksheetId, control, recordId, allowEdit, isTreeTableView, instanceId, workId, direction } = base;
    let { pageSize } = tableState;
    const isTab = [String(RELATE_RECORD_SHOW_TYPE.LIST), String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE)].includes(
      get(control, 'advancedSetting.showtype'),
    );

    if (!isTab) {
      pageSize = 30;
    }

    if (direction === 'vertical') {
      pageSize = 50;
    }

    const isNewRecord = !recordId;
    let relateWorksheetInfo;

    if (isNewRecord || control.type === 51) {
      relateWorksheetInfo = await worksheetAjax
        .getWorksheetInfo({
          worksheetId: control.dataSource,
          getTemplate: true,
          getRules: true,
          langType: window.shareState.shareId ? window.getCurrentLangCode() : undefined,
        })
        .catch(err => {
          dispatch({
            type: 'UPDATE_TABLE_STATE',
            value: { error: err.errorMessage },
          });
          return;
        });
      if (!relateWorksheetInfo || relateWorksheetInfo.resultCode !== 1) {
        if (relateWorksheetInfo) {
          dispatch({
            type: 'UPDATE_TABLE_STATE',
            value: { error: _l('没有可查询内容') },
          });
        }

        return;
      }
    } else {
      let args = {};
      args.discussId = control.discussId;
      const res = await worksheetAjax
        .getRowRelationRows({
          worksheetId,
          rowId: recordId,
          controlId: control.controlId,
          pageIndex: 1,
          pageSize,
          getWorksheet: true,
          getRules: true,
          getType: from === RECORD_INFO_FROM.DRAFT ? from : undefined,
          instanceId,
          workId,
          langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
          ...args,
        })
        .catch(() => {
          dispatch({
            type: 'UPDATE_TABLE_STATE',
            value: { error: _l('没有可查询内容') },
          });
        });
      if (!res) return;
      if (res.resultCode !== 1) {
        dispatch({
          type: 'UPDATE_TABLE_STATE',
          value: { error: _l('工作表已删除或无权限') },
        });
        return;
      }

      relateWorksheetInfo = res.worksheet;
      if (!relateWorksheetInfo) return;
      const { addedRecordIds, deletedRecordIds, isDeleteAll } = get(getState(), 'changes');

      if (isEmpty(addedRecordIds) && isEmpty(deletedRecordIds) && !isDeleteAll) {
        dispatch({
          type: 'UPDATE_RECORDS',
          records: res.data,
        });
        dispatch({
          type: 'INIT_FIRST_PAGE_RESULT',
          value: {
            count: res.count,
            records: res.data,
          },
        });
        if (isTreeTableView) {
          const expandSize = getTreeExpandSize(control);
          const { treeMap, maxLevel } = treeDataUpdater(
            {},
            {
              rootRows: getTreeRootRows(res.data, { requireDefinedPid: true }),
              rows: res.data,
              levelLimit: 5,
              pageIndexStart: 0,
              expandSize,
            },
          );
          dispatch({
            type: 'UPDATE_TREE_TABLE_VIEW_DATA',
            value: { maxLevel, treeMap },
          });
        }

        dispatch({
          type: 'UPDATE_TABLE_STATE',
          value: { count: res.count, pageSize },
        });
      }
    }

    const translateInfo = getTranslateInfo(base.appId, null, relateWorksheetInfo.worksheetId);
    relateWorksheetInfo.entityName = translateInfo.recordName || relateWorksheetInfo.entityName;
    relateWorksheetInfo.advancedSetting = replaceAdvancedSettingTranslateInfo(
      base.appId,
      relateWorksheetInfo.worksheetId,
      relateWorksheetInfo.advancedSetting || {},
    );
    if (_.get(relateWorksheetInfo, 'template.controls')) {
      relateWorksheetInfo.template.controls = replaceControlsTranslateInfo(
        base.appId,
        relateWorksheetInfo.worksheetId,
        relateWorksheetInfo.template.controls,
      );
    }

    const sheetSwitchPermit = await worksheetAjax.getSwitchPermit({ worksheetId: control.dataSource });
    const sheetQuery = await worksheetAjax.getQueryBySheetId({ worksheetId: control.dataSource });
    const searchConfig = formatSearchConfigs(sheetQuery);
    const tableConfig = getTableConfigFromControl(get(getState(), 'base.control'), {
      from,
      allowEdit,
      relateWorksheetInfo,
      recordId,
    });
    const controls = (get(relateWorksheetInfo, 'template.controls') || []).concat(SYSTEM_CONTROL).filter(
      c =>
        c &&
        controlState({
          ...c,
          fieldPermission: '111',
          controlPermissions: tableConfig.isHiddenOtherViewRecord
            ? c.controlPermissions
            : replaceByIndex(control.controlPermissions || '111', 0, '1'),
        }).visible,
    );
    dispatch({
      type: 'UPDATE_CONTROLS',
      controls: controls,
    });
    if (control.type === 51) {
      dispatch(updateFilter());
    }

    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { fixedColumnCount: tableConfig.fixedColumnCount },
    });
    dispatch({
      type: 'UPDATE_BASE',
      value: {
        ...tableConfig,
        isTab,
        isInForm: String(RELATE_RECORD_SHOW_TYPE.TABLE) === get(control, 'advancedSetting.showtype'),
        relateWorksheetInfo,
        sheetSwitchPermit,
        searchConfig,
      },
    });
    dispatch({
      type: 'UPDATE_LOADING',
      value: false,
    });
    dispatch({
      type: 'UPDATE_INIT_STATE',
      value: true,
    });
    // 按 merge 口径拉统计（不 reset）：普通加载时 rowsSummary.types 为空，结果与配置默认值一致；
    // 全屏新建 store 时已从 window 缓存 seed 用户运行时选的统计方式，需保留而非被配置默认值覆盖。
    dispatch(getRelateRecordSummary());
  };
}

export function refresh({ doNotResetPageIndex, doNotClearKeywords } = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {}, tableState = {} } = state;
    const { control = {} } = base;
    const { pageIndex, filterControls } = tableState;
    dispatch({ type: 'RESET', doNotClearKeywords });
    if (control.type === 51) {
      dispatch({
        type: 'UPDATE_TABLE_STATE',
        value: { filterControls },
      });
      if (!filterControls) {
        dispatch({
          type: 'UPDATE_RECORDS',
          records: [],
        });
        return;
      }
    }

    dispatch(loadRecords(doNotResetPageIndex ? { pageIndex } : {}));
  };
}

export function search(keywords) {
  return dispatch => {
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { keywords, pageIndex: 1 },
    });
    dispatch(loadRecords());
  };
}

export function updateRecord(newRecord) {
  return {
    type: 'UPDATE_RECORD',
    newRecord,
  };
}

export function updateRecordByRecordId(recordId, changes = {}) {
  return {
    type: 'UPDATE_RECORD_BY_RECORD_ID',
    recordId,
    changes,
  };
}

export function appendRecords(records = [], { afterRecordId } = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {} } = state;
    dispatch({
      type: 'APPEND_RECORDS',
      records,
      recordId: base.recordId,
      saveSync: base.saveSync,
      afterRecordId,
    });
    dispatch(updateTreeTableViewData());
    // saveSync 模式下新记录已写入服务端（handleAddRelation 走 updateRelateRecords、onNew 走 addRecord 携带 masterRecord 直接落库），需重拉统计；非 saveSync 模式记录仅暂存本地，刷新只会拿到不含新记录的旧值，反而误导。
    if (base.saveSync) {
      dispatch(getRelateRecordSummary());
    }
  };
}

export function appendFakeRecords(records) {
  return {
    type: 'APPEND_FAKE_RECORDS',
    records,
  };
}

export function deleteRecords(recordIds = []) {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {} } = state;
    dispatch({
      type: 'DELETE_RECORDS',
      recordIds: typeof recordIds === 'string' ? [recordIds] : recordIds,
      saveSync: base.saveSync,
    });
  };
}

// 更新单元格控件
export function updateCell({ cell, row }, options = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {}, controls } = state;
    const { relateWorksheetInfo, searchConfig } = base;

    function handleUpdateCell(cells) {
      updateRecordControl({
        appId: relateWorksheetInfo.appId,
        worksheetId: get(relateWorksheetInfo, 'worksheetId'),
        recordId: row.rowid,
        cells,
        cell,
        rules: relateWorksheetInfo.rules,
      }).then(updatedRow => {
        if (isFunction(options.updateSuccessCb)) {
          options.updateSuccessCb(updatedRow);
        }

        // 处理新增自定义选项
        const updatedControl = find(controls, { controlId: cell.controlId });

        if (
          updatedControl &&
          includes([WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN], cell.type) &&
          /{/.test(cell.value)
        ) {
          const newOption = {
            index: updatedControl.options.length + 1,
            isDeleted: false,
            key: last(JSON.parse(updatedRow[cell.controlId])),
            ...JSON.parse(last(JSON.parse(cell.value))),
          };
          dispatch({
            type: 'UPDATE_CONTROLS',
            controls: controls.map(c =>
              c.controlId === cell.controlId ? { ...c, options: [...c.options, newOption] } : c,
            ),
          });
        }

        dispatch(updateRecord({ ...updatedRow, allowedit: true, allowdelete: true }));
        dispatch(getRelateRecordSummary());
      });
    }

    const dataFormat = new DataFormat({
      data: (get(relateWorksheetInfo, 'template.controls') || controls)
        .filter(c => c.advancedSetting)
        .map(c => ({ ...c, value: (row || {})[c.controlId] || c.value })),
      projectId: relateWorksheetInfo.projectId,
      searchConfig,
      rules: relateWorksheetInfo.rules || [],
      onAsyncChange: changes => {
        let needUpdateCells = [];

        if (!isEmpty(changes.controlIds)) {
          changes.controlIds.forEach(cid => {
            needUpdateCells.push({
              controlId: cid,
              value: changes.value,
            });
          });
        } else if (changes.controlId) {
          const control = _.find(get(relateWorksheetInfo, 'template.controls') || controls, {
            controlId: changes.controlId,
          });

          if (control && control.type === 34) {
            return;
          }

          if (changes.value === 'deleteRowIds: all') {
            changes.value = '';
          }

          needUpdateCells.push(changes);
        }

        handleUpdateCell(needUpdateCells);
      },
    });
    dataFormat.updateDataSource(cell);
    const data = dataFormat.getDataSource();
    const updatedIds = dataFormat.getUpdateControlIds();
    const updatedCells = data
      .filter(c => includes(updatedIds, c.controlId))
      .map(c => pick(c, ['controlId', 'controlName', 'type', 'value']));
    updatedCells.forEach(c => {
      if (c.controlId === cell.controlId) {
        c.editType = cell.editType;
      }
    });
    handleUpdateCell(updatedCells);
  };
}

export function updateSort({ newIsAsc, controlId, newDefaultScrollLeft } = {}) {
  return dispatch => {
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: {
        pageIndex: 1,
        sortControl: isUndefined(newIsAsc)
          ? {}
          : {
              controlId,
              isAsc: newIsAsc,
            },
        defaultScrollLeft: newDefaultScrollLeft,
      },
    });
    dispatch(loadRecords({ pageIndex: 1 }));
  };
}

export function updateTableState(changes = {}) {
  return {
    type: 'UPDATE_TABLE_STATE',
    value: changes,
  };
}

function getStatisticsSettingTypes(control) {
  const list = safeParse(get(control, 'advancedSetting.statisticsseting') || '[]', 'array');
  return list.reduce((acc, curr) => {
    if (curr && curr.id) {
      acc[curr.id] = parseInt(curr.type, 10) || 0;
    }

    return acc;
  }, {});
}

export function getRelateRecordSummary({ reset = false } = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {}, tableState = {}, rowsSummary = { types: {}, values: {} } } = state;
    const { control = {}, worksheetId, recordId, appId, viewId } = base;

    if (get(control, 'advancedSetting.openstatistics') !== '1') return;
    if (!worksheetId || !recordId) return;

    const savedTypes = getStatisticsSettingTypes(control);
    const types = reset ? savedTypes : { ...savedTypes, ...rowsSummary.types };
    const columnRpts = Object.keys(types)
      .filter(controlId => types[controlId])
      .map(controlId => ({
        controlId,
        rptType: parseInt(types[controlId], 10),
      }));

    if (!columnRpts.length) {
      dispatch({ type: 'UPDATE_ROWS_SUMMARY', types, values: {} });
      return;
    }

    worksheetAjax
      .getFilterRowsReport(
        getFilledRequestParams({
          worksheetId,
          appId,
          viewId,
          rowId: recordId,
          controlId: control.controlId,
          columnRpts,
          filterControls: tableState.filterControls || [],
          keyWords: tableState.keywords || '',
          searchType: 1,
          getType: 7,
          requestParams: { controlId: control.controlId, rowId: recordId },
        }),
      )
      .then(data => {
        dispatch({
          type: 'UPDATE_ROWS_SUMMARY',
          types,
          values:
            data && data.length ? [{}, ...data].reduce((a, b) => Object.assign({}, a, { [b.controlId]: b.value })) : {},
        });
      });
  };
}

// 全屏 Dialog ↔ 内联 表格共用的统计方式缓存 key（按记录 + 关联控件唯一）
function getSummaryCacheKey(base = {}) {
  return `${base.recordId}_${get(base, 'control.controlId')}`;
}

export function changeRelateRecordSummaryType({ controlId, value }) {
  return (dispatch, getState) => {
    const { base = {}, rowsSummary = { types: {}, values: {} } } = getState();
    const newTypes = { ...rowsSummary.types };

    if (!value) {
      delete newTypes[controlId];
    } else {
      newTypes[controlId] = value;
    }

    // 全屏 Dialog 里改的统计方式写回 window 缓存，关闭后由内联表格读回（syncRelateRecordSummaryFromCache），保持两边一致
    if (base.isDialog) {
      window.relateRecordSummaryTypesCache = {
        ...(window.relateRecordSummaryTypesCache || {}),
        [getSummaryCacheKey(base)]: newTypes,
      };
    }

    if (!value) {
      dispatch({ type: 'UPDATE_ROWS_SUMMARY', types: newTypes });
      return;
    }

    dispatch({ type: 'UPDATE_ROWS_SUMMARY', types: newTypes, values: {} });
    dispatch(getRelateRecordSummary());
  };
}

// 全屏关闭后，内联表格读回全屏写入的统计方式并刷新（读一次即清除）
export function syncRelateRecordSummaryFromCache() {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    const key = getSummaryCacheKey(base);
    const summaryCache = window.relateRecordSummaryTypesCache;

    if (!summaryCache || !(key in summaryCache)) return;
    const types = summaryCache[key];
    delete summaryCache[key];
    dispatch({ type: 'UPDATE_ROWS_SUMMARY', types: types || {}, values: {} });
    dispatch(getRelateRecordSummary());
  };
}

export function getDefaultRelatedSheetValue(formData = [], recordId) {
  const titleControl = formData.filter(c => c.attribute === 1) || {};
  return {
    name: titleControl.value,
    sid: recordId,
    type: 8,
    sourcevalue: JSON.stringify({
      ...assign(
        ...formData.map(c => ({
          [c.controlId]:
            c.type === 29 && isObject(c.value) && c.value.records
              ? JSON.stringify(
                  // 子表使用双向关联字段作为默认值 RELATERECORD_OBJECT
                  c.value.records.map(r => ({ sid: r.rowid, sourcevalue: JSON.stringify(r) })),
                )
              : c.value,
        })),
      ),
      [titleControl.controlId]: titleControl.value,
      rowid: recordId,
    }),
  };
}

export function handleRecreateRecord(record, { openRecord = () => {}, isDraft } = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {}, controls } = state;
    const { worksheetId, control, recordId, relateWorksheetInfo, formData } = base;
    const pid = record.pid;
    handleRowData({
      rowId: record.rowid,
      worksheetId: get(relateWorksheetInfo, 'worksheetId'),
      columns: controls,
    }).then(res => {
      const { defaultData, defcontrols } = res;
      addRecord({
        worksheetId: control.dataSource,
        masterRecord: {
          rowId: recordId,
          controlId: control.controlId,
          worksheetId,
        },
        defaultRelatedSheet: control.type !== 51 && {
          worksheetId,
          relateSheetControlId: control.controlId,
          value: getDefaultRelatedSheetValue(formData, recordId),
        },
        directAdd: true,
        showFillNext: true,
        defaultFormData: defaultData,
        defaultFormDataEditable: true,
        writeControls: defcontrols,
        isDraft,
        onAdd: record => {
          if (record) {
            dispatch(appendRecords([_.assign(record, { pid })]));
          }
        },
        openRecord,
      });
    });
  };
}

export function handleSaveSheetLayout({ updateWorksheetControls, columns, columnWidthsOfSetting } = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {}, tableState = {} } = state;
    const { worksheetId } = base;
    const { sheetColumnWidths, fixedColumnCount, sheetHiddenColumnIds } = tableState;
    const newControl = omit(base.control, ['relationControls']);

    if (!isEmpty(sheetColumnWidths)) {
      const newWidths = JSON.stringify(
        pick(
          { ...columnWidthsOfSetting, ...sheetColumnWidths },
          columns.map(c => c.controlId),
        ),
      );
      newControl.advancedSetting.widths = newWidths;
    }

    if (!isUndefined(fixedColumnCount)) {
      newControl.advancedSetting.freezeids = JSON.stringify([String(fixedColumnCount)]);
      delete newControl.advancedSetting['fixedcolumncount'];
    }

    if (!isEmpty(sheetHiddenColumnIds)) {
      newControl.showControls = newControl.showControls.filter(id => !includes(sheetHiddenColumnIds, id));
    }

    // 筛选条件保存时values处理一下;
    if (get(newControl, 'advancedSetting.resultfilters')) {
      const tempResultFilters = safeParse(get(newControl, 'advancedSetting.resultfilters'), 'array');
      newControl.advancedSetting.resultfilters = isEmpty(tempResultFilters)
        ? ''
        : JSON.stringify(tempResultFilters.map(formatValuesOfCondition));
    }

    worksheetAjax
      .editWorksheetControls({
        worksheetId,
        controls: [{ ...pick(newControl, ['controlId', 'advancedSetting']), editattrs: ['advancedSetting'] }],
      })
      .then(() => {
        if (isFunction(updateWorksheetControls)) {
          updateWorksheetControls([omit(newControl, ['value', 'store'])]);
        }

        dispatch(updateTableState({ layoutChanged: false }));
      });
  };
}

export function handleRemoveRelation(recordIds) {
  return async (dispatch, getState) => {
    const { base = {}, records = [] } = getState();
    const { from, saveSync, recordId, appId, viewId, worksheetId, control, instanceId, workId } = base;

    if (recordIds && !isArray(recordIds)) {
      recordIds = [recordIds];
    }

    if (recordId && saveSync) {
      try {
        await updateRelateRecords({
          worksheetId,
          appId,
          viewId,
          recordId,
          instanceId,
          workId,
          controlId: control.controlId,
          isAdd: false,
          recordIds: recordIds,
          updateType: from,
        });
        dispatch(deleteRecords(recordIds));
        dispatch(refresh({ doNotResetPageIndex: records.length - recordIds.length > 0, doNotClearKeywords: true }));
      } catch (err) {
        console.log(err);
        alert(_l('取消关联失败！'), 2);
      }
    } else {
      dispatch(deleteRecords(recordIds));
    }

    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: {
        selectedRowIds: [],
        isBatchEditing: false,
      },
    });
    dispatch(updateTreeTableViewData());
  };
}

export function handleAddRelation(records) {
  return async (dispatch, getState) => {
    const { base = {} } = getState();
    const { from, saveSync, recordId, appId, viewId, worksheetId, control, instanceId, workId } = base;

    if (records && !isArray(records)) {
      records = [records];
    }

    if (recordId && saveSync) {
      try {
        await updateRelateRecords({
          worksheetId,
          appId,
          viewId,
          recordId,
          controlId: control.controlId,
          isAdd: true,
          recordIds: records.map(c => c.rowid),
          instanceId,
          workId,
          updateType: from === RECORD_INFO_FROM.DRAFT ? from : undefined,
        });
        dispatch(appendRecords(records));
        alert(_l('添加记录成功！'));
      } catch (err) {
        console.log(err);
        alert(_l('添加记录失败！'), 2);
      }
    } else {
      dispatch(appendRecords(records));
    }
  };
}

export function deleteOriginalRecords({ recordIds = [] } = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {}, records, tableState = {} } = state;
    const { relateWorksheetInfo } = base;
    const { count, pageSize } = tableState;
    const allowDeleteRowIds = recordIds.filter(rowId => {
      const selectedRow = find(records, { rowid: rowId });
      return selectedRow && selectedRow.allowdelete;
    });

    if (!allowDeleteRowIds.length) {
      alert(_l('没有有权限删除的记录'), 3);
      return;
    }

    deleteRecord({
      worksheetId: get(relateWorksheetInfo, 'worksheetId'),
      recordIds: allowDeleteRowIds,
    })
      .then(() => {
        dispatch(deleteRecords(allowDeleteRowIds));
        if (allowDeleteRowIds.length < recordIds.length) {
          alert(_l('存在无权限删除的记录，有权限的已删除'), 3);
        }

        dispatch(
          updateTableState({
            selectedRowIds: [],
            isBatchEditing: false,
          }),
        );
        if (count > pageSize) {
          dispatch(refresh());
        }
      })
      .catch(() => {
        alert(_l('删除失败！'), 3);
      });
  };
}

export function updateFilter() {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {}, controls } = state;
    const { control, formData, recordId, appId } = base;
    const filterControls = getFilter({
      control: { ...control, relationControls: controls, recordId },
      formData,
      filterKey: 'resultfilters',
      appId,
    });
    dispatch(
      updateTableState({
        filterControls,
      }),
    );
    if (filterControls) {
      dispatch(loadRecords({ pageIndex: 1, keywords: '' }));
    } else {
      dispatch({
        type: 'UPDATE_RECORDS',
        records: [],
      });
    }
  };
}

export function batchUpdateRecords({ selectedRowIds = [], records = [], activeControl } = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const { isCharge, base = {}, controls } = state;
    const { control, relateWorksheetInfo } = base;

    if (!selectedRowIds.length) {
      return;
    }

    const selectedRows = selectedRowIds
      .map(rowId => find(records, { rowid: rowId }))
      .filter(_.identity)
      .filter(row => row.allowedit);

    if (!selectedRows.length) {
      return;
    }

    const columns = getVisibleControls(control, controls);
    batchEditRecord({
      appId: relateWorksheetInfo.appId,
      worksheetId: control.dataSource,
      projectId: relateWorksheetInfo.projectId,
      isCharge,
      selectedRows,
      activeControl,
      defaultWorksheetInfo: {
        entityName: _l('记录'),
        template: { controls: columns },
      },
      onUpdate: ({ needUpdateControls } = {}) => {
        const changes = needUpdateControls.reduce((acc, control) => {
          acc[control.controlId] = control.sourceValue || control.value;
          return acc;
        }, {});
        dispatch(
          updateRowsWithChanges(
            selectedRows.map(r => r.rowid),
            changes,
          ),
        );
      },
    });
  };
}
