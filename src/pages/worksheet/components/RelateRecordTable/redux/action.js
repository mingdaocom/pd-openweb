import {
  get,
  includes,
  isEmpty,
  find,
  isUndefined,
  last,
  pick,
  isFunction,
  isObject,
  assign,
  omit,
  isArray,
} from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import { getFilter, formatValuesOfCondition } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { WIDGETS_TO_API_TYPE_ENUM, SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { replaceByIndex, replaceControlsTranslateInfo } from 'worksheet/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { updateRecordControl, updateRelateRecords, deleteRecord } from 'src/pages/worksheet/common/recordInfo/crtl';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { handleRowData } from 'src/util/transControlDefaultValue';
import { parseNumber } from 'src/util';
import { treeDataUpdater, handleUpdateTreeNodeExpansion } from 'worksheet/common/TreeTableHelper';

export function updateTreeNodeExpansion(row = {}, { expandAll, forceUpdate, getNewRows, updateRows } = {}) {
  return (dispatch, getState) => {
    const { base = {}, records = [], changes = {}, treeTableViewData } = getState();
    const { control, recordId } = base;
    const { addedRecords = [] } = changes;
    const allRecords = recordId ? records.concat(addedRecords) : records;
    const { treeMap, maxLevel } = treeTableViewData;
    let controlIdForGetRelationRows;
    try {
      controlIdForGetRelationRows = control.relationControls.filter(
        c => c.sourceControlId === control.advancedSetting.layercontrolid,
      )[0].controlId;
    } catch (err) {
      console.log(err);
    }

    const getNewRowsFn =
      getNewRows ||
      (() =>
        worksheetAjax
          .getRowRelationRows({
            worksheetId: control.dataSource,
            rowId: row.rowid,
            controlId: controlIdForGetRelationRows,
            pageIndex: 1,
            pageSize: 50,
          })
          .then(res => {
            const newRows = res.data.map(r => ({ ...r, pid: row.rowid }));
            dispatch(appendRecords(newRows));
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

export const updateTreeTableViewData = () => (dispatch, getState) => {
  const { base, changes = {}, records } = getState();
  const { addedRecords = [] } = changes;
  if (!base.isTreeTableView) {
    return;
  }
  const allRecords = base.recordId ? records.concat(addedRecords) : records;
  const { treeMap, maxLevel } = treeDataUpdater(
    {},
    { rootRows: allRecords.filter(r => !r.pid), rows: allRecords, levelLimit: 10 },
  );
  dispatch({
    type: 'UPDATE_TREE_TABLE_VIEW_DATA',
    value: { maxLevel, treeMap },
  });
};

function loadRecords({ pageIndex, pageSize, keywords, getRules, getWorksheet } = {}) {
  return async (dispatch, getState) => {
    const state = getState();
    const { base = {}, tableState = {}, changes = {} } = state;
    const { addedRecords = [], deletedRecordIds = [] } = changes;
    const { filterControls } = tableState;
    const { from, worksheetId, control, recordId, allowEdit, isTreeTableView } = base;
    pageIndex = pageIndex || tableState.pageIndex;
    pageSize = pageSize || tableState.pageSize;
    keywords = !isUndefined(keywords) ? keywords : tableState.keywords;
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { tableLoading: true },
    });
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
      getType: from === RECORD_INFO_FROM.DRAFT ? from : undefined,
    });
    const records = !base.isTab && recordId ? res.data.filter(r => !includes(deletedRecordIds, r.rowid)) : res.data;
    dispatch({
      type: 'UPDATE_RECORDS',
      records,
    });
    dispatch(updateTreeTableViewData());
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
  };
}

export function updatePageIndex(pageIndex) {
  return async (dispatch, getState) => {
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { pageIndex },
    });
    dispatch(loadRecords({ pageIndex }));
  };
}

export function updatePageSize(pageSize) {
  return async (dispatch, getState) => {
    dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { pageIndex: 1, pageSize },
    });
    dispatch(loadRecords({ pageIndex: 1, pageSize }));
  };
}
function getTableConfigFromControl(control, { from, allowEdit, relateWorksheetInfo, recordId } = {}) {
  const controlPermission = controlState(control, recordId ? 3 : 2);
  const allowRemoveRelation =
    typeof control.advancedSetting.allowcancel === 'undefined' ? true : control.advancedSetting.allowcancel === '1';
  const [isHiddenOtherViewRecord, , onlyRelateByScanCode] = (control.strDefault || '').split('').map(b => !!+b);
  const disabledManualWrite = onlyRelateByScanCode && control.advancedSetting.dismanual === '1';
  const fixedColumnCount = Number(control.advancedSetting.fixedcolumncount || 0);
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
  const allowBatchEdit = editable && allowBatchFromSetting && from !== RECORD_INFO_FROM.DRAFT;
  const allowExportFromSetting = get(control, 'advancedSetting.allowexport') === '1';
  const searchMaxCount = parseNumber((control.advancedSetting || {}).maxcount || undefined);
  return {
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
    const tableConfig = getTableConfigFromControl(control, { from, allowEdit, relateWorksheetInfo, recordId });
    dispatch({
      type: 'UPDATE_BASE',
      value: {
        control,
        ...tableConfig,
      },
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
    const { from, mode, worksheetId, control, recordId, allowEdit, isTreeTableView } = base;
    const { pageSize } = tableState;
    const isNewRecord = !recordId;
    let relateWorksheetInfo;
    if (isNewRecord || control.type === 51) {
      relateWorksheetInfo = await worksheetAjax.getWorksheetInfo({
        worksheetId: control.dataSource,
        getTemplate: true,
        getRules: true,
      });
      if (relateWorksheetInfo && relateWorksheetInfo.resultCode !== 1) {
        dispatch({
          type: 'UPDATE_TABLE_STATE',
          value: { error: _l('没有权限') },
        });
        return;
      }
    } else {
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
        })
        .catch(err => {
          dispatch({
            type: 'UPDATE_TABLE_STATE',
            value: { error: _l('没有权限') },
          });
        });
      relateWorksheetInfo = res.worksheet;
      const { addedRecordIds, deletedRecordIds, isDeleteAll } = get(getState(), 'changes');
      if (isEmpty(addedRecordIds) && isEmpty(deletedRecordIds) && !isDeleteAll) {
        dispatch({
          type: 'UPDATE_RECORDS',
          records: res.data,
        });
        if (!!isTreeTableView) {
          const { treeMap, maxLevel } = treeDataUpdater(
            {},
            { rootRows: res.data.filter(r => typeof r.pid !== 'undefined' && !r.pid), rows: res.data, levelLimit: 5 },
          );
          dispatch({
            type: 'UPDATE_TREE_TABLE_VIEW_DATA',
            value: { maxLevel, treeMap },
          });
        }
        dispatch({
          type: 'UPDATE_TABLE_STATE',
          value: { count: res.count },
        });
      }
    }
    const sheetSwitchPermit = await worksheetAjax.getSwitchPermit({ worksheetId: control.dataSource });
    const sheetQuery = await worksheetAjax.getQueryBySheetId({ worksheetId: control.dataSource });
    const searchConfig = formatSearchConfigs(sheetQuery);
    const tableConfig = getTableConfigFromControl(control, { from, allowEdit, relateWorksheetInfo, recordId });
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
      controls: replaceControlsTranslateInfo(base.appId, get(relateWorksheetInfo, 'worksheetId'), controls),
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
        isTab: [String(RELATE_RECORD_SHOW_TYPE.LIST), String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE)].includes(
          get(control, 'advancedSetting.showtype'),
        ),
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
  return (dispatch, getState) => {
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
export function handleRecreateRecord(record, { openRecord = () => {} } = {}) {
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
        columns.map(c => ({ ...columnWidthsOfSetting, ...sheetColumnWidths }[c.controlId] || 160)),
      );
      newControl.advancedSetting.widths = newWidths;
    }
    if (!isUndefined(fixedColumnCount)) {
      newControl.advancedSetting.fixedcolumncount = fixedColumnCount;
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
      .then(res => {
        if (isFunction(updateWorksheetControls)) {
          updateWorksheetControls([newControl]);
        }
        dispatch(updateTableState({ layoutChanged: false }));
      });
  };
}

export function handleRemoveRelation(recordIds) {
  return async (dispatch, getState) => {
    const { base = {}, tableState = {}, records = [] } = getState();
    const { from, saveSync, recordId, appId, viewId, worksheetId, control, instanceId, workId } = base;
    if (recordIds && !isArray(recordIds)) {
      recordIds = [recordIds];
    }
    if (recordId && from !== RECORD_INFO_FROM.DRAFT && saveSync) {
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
    if (recordId && from !== RECORD_INFO_FROM.DRAFT && saveSync) {
      try {
        await updateRelateRecords({
          worksheetId,
          appId,
          viewId,
          recordId,
          controlId: control.controlId,
          isAdd: true,
          recordIds: records.map(c => c.rowid),
          updateType: from,
          instanceId,
          workId,
        });
        dispatch(appendRecords(records));
        alert(_l('添加记录成功！'));
      } catch (err) {
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
      .then(res => {
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
      .catch(err => {
        alert(_l('删除失败！'), 3);
      });
  };
}

export function updateFilter() {
  return (dispatch, getState) => {
    const state = getState();
    const { base = {}, controls } = state;
    const { control, formData, recordId } = base;
    const filterControls = getFilter({
      control: { ...control, relationControls: controls, recordId },
      formData,
      filterKey: 'resultfilters',
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
