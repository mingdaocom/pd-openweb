import sheetAjax from 'src/api/worksheet';
import {
  getDays,
  getWorkDays,
  getWeeks,
  getMonths,
  getQuarters,
  getYears,
  changeViewConfig,
  getRowsTime,
  formatRecordTime,
  groupingTimeBlock,
  fillRecordsTimeBlockColor,
  fillRecordTimeBlockColor,
  getRecordIndex,
  formatWeekDay,
  sortGrouping,
} from 'src/pages/worksheet/views/GunterView/util';
import { getDynamicValue } from 'src/components/newCustomFields/tools/DataFormat';
import { formatQuickFilter, getFilledRequestParams, handleRecordError } from 'worksheet/util';
import { PERIOD_TYPE } from 'src/pages/worksheet/views/GunterView/config';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { dateConvertToUserZone, dateConvertToServerZone } from 'src/util';
import _ from 'lodash';
import moment from 'moment';

const updatePeriodList = ({ result, parent }) => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    groupingTimeBlock(gunterView.grouping, result, gunterView.viewConfig);
    dispatch({ type: 'CHANGE_GUNTER_GROUPING', data: gunterView.grouping });
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_LIST', data: result });
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_PARENT_LIST', data: parent });
  };
};

const getExportPeriodList = (type, { startTime, endTime }, viewConfig) => {
  const { onlyWorkDay } = viewConfig;
  startTime = moment(startTime);
  endTime = moment(endTime);
  if (type === PERIOD_TYPE.day) {
    return onlyWorkDay
      ? getWorkDays(startTime.add(-5, 'd'), endTime.add(14, 'd'), null, viewConfig)
      : getDays(startTime.add(-5, 'd'), endTime.add(14, 'd'), null, viewConfig);
  } else if (type === PERIOD_TYPE.week) {
    return getWeeks(startTime.startOf('w'), endTime.endOf('w').add(onlyWorkDay ? 4 : 2, 'w'), null, viewConfig);
  } else if (type === PERIOD_TYPE.month) {
    return getMonths(startTime.startOf('M'), endTime.endOf('M').add(onlyWorkDay ? 4 : 2, 'M'), null, viewConfig);
  } else if (type === PERIOD_TYPE.quarter) {
    return getQuarters(startTime.startOf('Q'), endTime.endOf('Q').add(onlyWorkDay ? 4 : 2, 'Q'), null, viewConfig);
  } else if (type === PERIOD_TYPE.year) {
    return getYears(startTime.startOf('Y'), endTime.endOf('Y').add(onlyWorkDay ? 2 : 1, 'Y'), null, viewConfig);
  }
};

export const fetchRows = () => {
  return (dispatch, getState) => {
    const { base, controls, views, filters, quickFilter = [] } = getState().sheet;
    const { filterControls } = getState().mobile;

    if (window.isMingDaoApp) {
      filters.filterControls = filterControls;
    }

    const view = base.viewId ? (_.find(views, { viewId: base.viewId }) || views[0]) : views[0];
    const selectControl = _.find(controls, item => item.controlId === (view || {}).viewControl);
    dispatch({ type: 'CHANGE_GUNTER_LOADINNG', data: true });
    sheetAjax
      .getFilterRows(
        getFilledRequestParams({
          appId: base.appId,
          viewId: base.viewId,
          worksheetId: base.worksheetId,
          relationWorksheetId: selectControl && selectControl.type === 29 ? selectControl.dataSource : null,
          ...filters,
          fastFilters: formatQuickFilter(quickFilter),
        }),
      )
      .then(({ data, count, resultCode }) => {
        const isLocalhost = location.href.includes('localhost');
        const isGunterExport = location.href.includes('gunterExport');
        setTimeout(
          () => {
            const { gunterView } = getState().sheet;
            const { colorId, startId, endId, startType, endType } = gunterView.viewConfig;
            const startFormat = startType === 16 ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
            const endFormat = endType === 16 ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
            const grouping = sortGrouping(
              data.map(item => {
                const rows = (item.rows || []).map(row => {
                  const data = formatRecordTime(JSON.parse(row), gunterView.viewConfig);
                  const startTime = data.startTime
                    ? moment(dateConvertToUserZone(data.startTime)).format(startFormat)
                    : data.startTime;
                  const endTime = data.endTime
                    ? moment(dateConvertToUserZone(data.endTime)).format(endFormat)
                    : data.endTime;
                  data[startId] = startTime;
                  data[endId] = endTime;
                  data.startTime = startTime;
                  data.endTime = endTime;
                  return {
                    ...data,
                    groupId: item.key,
                  };
                });
                const times = getRowsTime(rows);
                const key = `gunter-sub-visible-${item.key}`;
                return {
                  ...item,
                  ...times,
                  rows,
                  subVisible: localStorage.getItem(key) ? true : isGunterExport,
                };
              }),
              view,
              controls,
            );
            if (isGunterExport) {
              const { calendartype } = view.advancedSetting;
              const gunterViewType = localStorage.getItem('gunterViewType');
              const type = gunterViewType
                ? Number(gunterViewType)
                : calendartype
                ? Number(calendartype)
                : PERIOD_TYPE.day;
              dispatch({ type: 'CHANGE_GUNTER_PERIOD_TYPE', data: type });
              dispatch({ type: 'CHANGE_GUNTER_VIEW_CONFIG', data: changeViewConfig(type, gunterView.viewConfig) });
              const periodList = getExportPeriodList(type, getRowsTime(grouping), gunterView.viewConfig);
              groupingTimeBlock(grouping, periodList.result, gunterView.viewConfig);
              dispatch(updatePeriodList(periodList));
            } else {
              groupingTimeBlock(grouping, gunterView.periodList, gunterView.viewConfig);
            }
            dispatch(updateGroupingData(fillRecordsTimeBlockColor(grouping, _.find(controls, { controlId: colorId }))));
            dispatch({ type: 'CHANGE_GUNTER_LOADINNG', data: false });
            gunterView.chartScroll.enable && gunterView.chartScroll.enable();
          },
          isLocalhost || isGunterExport ? 1000 : 0,
        );
      });
  };
};

/**
 * 更新组和记录top和index数据
 */
export const updateGroupingData = grouping => {
  return (dispatch, getState) => {
    const { gunterView, views = [], controls = [], base = {} } = getState().sheet;
    const { viewConfig, withoutArrangementVisible } = gunterView;
    const { viewControl } = viewConfig;
    grouping.forEach((item, index) => {
      const rowLength = withoutArrangementVisible ? item.rows.length : item.rows.filter(item => item.diff > 0).length;
      const count = 1 + (item.subVisible ? rowLength : 0);
      if (index) {
        item.openCount = count + grouping[index - 1].openCount;
      } else {
        item.openCount = count;
      }
      if (_.isEmpty(viewControl)) {
        item.subVisible = true;
        item.hide = true;
        item.openCount = rowLength;
      } else if (item.key == '-1' && _.isEmpty(item.rows)) {
        item.hide = true;
        item.openCount = item.openCount - 1;
      } else {
        item.hide = false;
      }
      item.groupingIndex = item.openCount - (item.subVisible ? rowLength : 0) - 1;
    });
    dispatch({ type: 'CHANGE_GUNTER_GROUPING', data: grouping });
  };
};

export const updateRecordTimeBlockColor = () => {
  return (dispatch, getState) => {
    const { gunterView, controls } = getState().sheet;
    const { grouping, viewConfig } = gunterView;
    const { colorId } = viewConfig;
    const colorControl = _.find(controls, { controlId: colorId });
    dispatch({ type: 'CHANGE_GUNTER_GROUPING', data: fillRecordsTimeBlockColor(grouping, colorControl) });
  };
};

export const updateGroupingVisible = () => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const value = !gunterView.groupingVisible;
    safeLocalStorageSetItem('gunterGroupingVisible', value);
    dispatch({ type: 'CHANGE_GUNTER_GROUPING_VISIBLE', data: value });
  };
};

export const updateGroupingScroll = scroll => {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_GUNTER_GROUPING_SCROLL', data: scroll });
  };
};

export const updateChartScroll = scroll => {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_GUNTER_CHART_SCROLL', data: scroll });
  };
};

export const destroyGunterView = () => {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_TYPE', data: null });
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_LIST', data: [] });
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_PARENT_LIST', data: [] });
    dispatch({ type: 'CHANGE_GUNTER_GROUPING', data: [] });
    dispatch({ type: 'CHANGE_GUNTER_SEARCH_RECORD_ID', data: null });
  };
};

export const refreshGunterView = time => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    dispatch(updataPeriodType(gunterView.periodType || PERIOD_TYPE.day, time));
    dispatch({ type: 'CHANGE_GUNTER_IS_REFRESH', data: !gunterView.isRefresh });
  };
};

export const resetLoadGunterView = () => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const { chartScroll } = gunterView;
    if (chartScroll && chartScroll.disable) {
      chartScroll.disable();
    }
    dispatch(refreshGunterView());
    dispatch(fetchRows());
  };
};

export const zoomGunterView = () => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    dispatch(updataPeriodType(gunterView.periodType));
    dispatch({ type: 'CHANGE_GUNTER_ZOOM', data: Date.now() });
  };
};

export const updataPeriodType = (value, time) => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const { viewConfig } = gunterView;
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_TYPE', data: value });
    dispatch({ type: 'CHANGE_GUNTER_VIEW_CONFIG', data: changeViewConfig(value, viewConfig) });
    safeLocalStorageSetItem('gunterViewType', value);
    let data = {};
    if (value === PERIOD_TYPE.day) {
      const { onlyWorkDay } = viewConfig;
      data = onlyWorkDay ? getWorkDays(null, null, time, viewConfig) : getDays(null, null, time, viewConfig);
    } else if (value === PERIOD_TYPE.week) {
      data = getWeeks(null, null, time, viewConfig);
    } else if (value === PERIOD_TYPE.month) {
      data = getMonths(null, null, time, viewConfig);
    } else if (value === PERIOD_TYPE.quarter) {
      data = getQuarters(null, null, time, viewConfig);
    } else if (value === PERIOD_TYPE.year) {
      data = getYears(null, null, time, viewConfig);
    }
    dispatch(updatePeriodList(data));
  };
};

export const updateViewConfig = view => {
  return (dispatch, getState) => {
    const { base, views, gunterView, controls } = getState().sheet;
    const { advancedSetting, viewControl, displayControls } = base.viewId
      ? (_.find(views, { viewId: base.viewId }) || views[0])
      : views[0];
    const { unweekday, begindate, enddate, colorid, calendartype, milepost, clicktype } = advancedSetting;
    const titleControl = _.find(controls, { attribute: 1 }) || {};
    const startControl = _.find(controls, { controlId: begindate }) || {};
    const endControl = _.find(controls, { controlId: enddate }) || {};
    if (_.get(window, 'shareState.shareId')) {
      startControl.disabled = true;
      endControl.disabled = true;
      titleControl.disabled = true;
    }
    const newConfig = {
      ...gunterView.viewConfig,
      periodType: calendartype ? Number(calendartype) : PERIOD_TYPE.day,
      milepost,
      onlyWorkDay: unweekday ? true : false,
      dayOff: formatWeekDay(unweekday),
      startId: begindate,
      endId: enddate,
      viewControl,
      displayControls: displayControls.map(c => _.find(controls, { controlId: c })).filter(_ => _),
      colorId: colorid,
      startFormat: startControl.type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
      endFormat: endControl.type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
      endZeroFormat: endControl.type === 16 ? 'YYYY-MM-DD 00:00' : 'YYYY-MM-DD',
      startType: startControl.type,
      endType: endControl.type,
      startDisable: startControl.disabled || !controlState(startControl, 3).editable,
      endDisable: endControl.disabled || !controlState(endControl, 3).editable,
      titleDisable: titleControl.disabled || !controlState(titleControl, 3).editable,
      clickType: clicktype || '0',
    };
    dispatch({ type: 'CHANGE_GUNTER_VIEW_CONFIG', data: newConfig });
  };
};

export const createRecord = (id, isMilepost = false) => {
  return (dispatch, getState) => {
    const { controls, gunterView } = getState().sheet;
    const { grouping, viewConfig, periodList } = gunterView;
    const { startId, endId, startType, endType, milepost } = viewConfig;
    const titleControl = _.find(controls, { attribute: 1 }) || {};
    let editIndex = null;
    const newGrouping = grouping.map(group => {
      if (group.key === id) {
        const row = group.rows[0];
        editIndex = group.openCount;
        const record = {
          isEdit: true,
          [titleControl.controlId]: null,
          [startId]: '',
          [endId]: '',
          startTime: moment().format(startType === 16 ? 'YYYY-MM-DD 00:00' : 'YYYY-MM-DD'),
          endTime: moment().format(endType === 16 ? 'YYYY-MM-DD 00:00' : 'YYYY-MM-DD'),
          diff: 1,
          rowid: `createrowid-${Date.now()}`,
          left: null,
          right: null,
          width: null,
          groupId: id,
          isMilepost,
        };
        if (isMilepost) {
          record[milepost] = '1';
        }
        group.rows.push(record);
      }
      return group;
    });
    groupingTimeBlock(newGrouping, periodList, viewConfig);
    dispatch(updateEditIndex(editIndex));
    dispatch(updateGroupingData(newGrouping));
  };
};

export const addRecord = (cell, row) => {
  return (dispatch, getState) => {
    const { base, controls, gunterView, worksheetInfo } = getState().sheet;
    const { grouping, viewConfig } = gunterView;
    const { startId, endId, viewControl, milepost } = viewConfig;
    const titleControl = _.find(controls, { attribute: 1 });
    const startControl = _.find(controls, { controlId: startId });
    const endControl = _.find(controls, { controlId: endId });

    const receiveControls = [
      cell,
      {
        controlId: startId,
        controlName: startControl.controlName,
        dot: startControl.dot,
        type: startControl.type,
        value: dateConvertToServerZone(moment().format('YYYY-MM-DD')),
      },
      {
        controlId: endId,
        controlName: endControl.controlName,
        dot: endControl.dot,
        type: endControl.type,
        value: dateConvertToServerZone(moment().format('YYYY-MM-DD')),
      },
    ];

    if (viewControl && row.groupId !== '-1') {
      const groupControl = _.find(controls, { controlId: viewControl });
      let { key: value, name } = _.find(grouping, { key: row.groupId });
      if ([29].includes(groupControl.type)) {
        value = JSON.stringify([{ sid: value, name }]);
      }
      if ([9, 11].includes(groupControl.type)) {
        const { key } = _.find(groupControl.options, { key: row.groupId });
        value = JSON.stringify([key]);
      }
      if (value === '-1') {
        value = '';
      }
      receiveControls.push({
        controlId: viewControl,
        controlName: groupControl.controlName,
        dot: groupControl.dot,
        type: groupControl.type,
        value,
      });
    }

    if (milepost && row.isMilepost) {
      const milepostControl = _.find(controls, { controlId: milepost });
      receiveControls.push({
        controlId: milepost,
        controlName: milepostControl.controlName,
        dot: milepostControl.dot,
        type: milepostControl.type,
        value: '1',
      });
    }

    dispatch(updateGroupingRow({ [cell.controlId]: cell.value }, row.rowid));

    controls.forEach(c => {
      if (
        c.advancedSetting &&
        c.advancedSetting.defsource &&
        c.type !== 30 &&
        !_.find(receiveControls, { controlId: c.controlId })
      ) {
        const value = getDynamicValue(row, c);
        receiveControls.push({
          controlId: c.controlId,
          controlName: c.controlName,
          dot: c.dot,
          type: c.type,
          value,
        });
      }
    });

    sheetAjax
      .addWorksheetRow({
        addType: 1,
        appId: base.appId,
        projectId: worksheetInfo.projectId,
        silent: true,
        viewId: base.viewId,
        worksheetId: base.worksheetId,
        receiveControls,
      })
      .then(data => {
        if (data.resultCode === 1) {
          dispatch(updateGroupingRow(data.data, row.rowid));
        }
        if (data.resultCode === 11) {
          alert(_l('创建失败，%0不允许重复', titleControl.controlName || ''), 3);
          const newGrouping = grouping.map(item => {
            const newRows = item.rows.filter(item => item.rowid !== row.rowid);
            return {
              ...item,
              rows: newRows,
            };
          });
          dispatch(updateGroupingData(newGrouping));
        }
      });
  };
};

export const removeRecord = id => {
  return (dispatch, getState) => {
    const { base, gunterView } = getState().sheet;
    sheetAjax
      .deleteWorksheetRows({
        appId: base.appId,
        viewId: base.viewId,
        worksheetId: base.worksheetId,
        rowIds: [id],
      })
      .then(data => {
        if (data.isSuccess) {
          const newGrouping = gunterView.grouping.map(item => {
            const newRows = item.rows.filter(row => row.rowid !== id);
            const times = getRowsTime(newRows);
            return {
              ...item,
              ...times,
              rows: newRows,
            };
          });
          groupingTimeBlock(newGrouping, gunterView.periodList, gunterView.viewConfig);
          dispatch(updateGroupingData(newGrouping));
        }
      });
  };
};

export const hideRecord = id => {
  return (dispatch, getState) => {
    const { base, gunterView } = getState().sheet;
    const newGrouping = gunterView.grouping.map(item => {
      const newRows = item.rows.filter(row => row.rowid !== id);
      const times = getRowsTime(newRows);
      return {
        ...item,
        ...times,
        rows: newRows,
      };
    });
    groupingTimeBlock(newGrouping, gunterView.periodList, gunterView.viewConfig);
    dispatch(updateGroupingData(newGrouping));
  };
};

export const updateRecord = (row, updateControls, newItem) => {
  return (dispatch, getState) => {
    const { gunterView, controls } = getState().sheet;
    const { viewConfig } = gunterView;

    const viewControl = updateControls[viewConfig.viewControl];
    const colorControl = _.find(controls, { controlId: viewConfig.colorId });
    const record = fillRecordTimeBlockColor({ ...row, ...formatRecordTime(newItem, viewConfig) }, colorControl);

    if (_.isString(viewControl)) {
      const groupControl = _.find(controls, { controlId: viewConfig.viewControl });
      let newKey = '';
      if ([29].includes(groupControl.type)) {
        const data = JSON.parse(viewControl)[0];
        newKey = data ? data.sid : '-1';
      }
      if ([9, 11].includes(groupControl.type)) {
        const data = viewControl ? JSON.parse(viewControl)[0] : '-1';
        newKey = data;
      }
      if (newKey && newKey.includes('other:')) {
        newKey = 'other';
      }
      dispatch(moveGroupingRow(record, newKey, row.groupId));
      dispatch(updateEditIndex(null));
    } else {
      dispatch(updateGroupingRow(record, newItem.rowid));
    }
  };
};

export const updateRecordTime = (row, start, end) => {
  return (dispatch, getState) => {
    const { base, gunterView, controls } = getState().sheet;
    const { startId, endId, milepost } = gunterView.viewConfig;
    const startControl = _.find(controls, { controlId: startId });
    const endControl = _.find(controls, { controlId: endId });
    const { allowweek: startAllowweek } = startControl.advancedSetting || {};
    const { allowweek: endAllowweek } = endControl.advancedSetting || {};
    const startAllowDays = formatWeekDay(startAllowweek);
    const endAllowDays = formatWeekDay(endAllowweek);
    const newOldControl = [];

    if (
      (start && startAllowDays.length && !startAllowDays.includes(moment(start).days())) ||
      (end && endAllowDays.length && !endAllowDays.includes(moment(end).days()))
    ) {
      dispatch(
        updateGroupingRow(
          {
            ...row,
            resetTime: Date.now(),
          },
          row.rowid,
        ),
      );
      return;
    }

    if (!_.isNull(start)) {
      newOldControl.push({
        controlId: startId,
        controlName: startControl.controlName,
        dot: startControl.dot,
        type: startControl.type,
        value: dateConvertToServerZone(start),
      });
      row[startId] = start;
      row.startTime = start;
    }

    if (!_.isNull(end)) {
      newOldControl.push({
        controlId: endId,
        controlName: endControl.controlName,
        dot: endControl.dot,
        type: endControl.type,
        value: dateConvertToServerZone(end),
      });
      row[endId] = end;
      row.endTime = end;
    }

    row.dragStartTime = null;
    row.dragEndTime = null;
    row.dragBeforeStartTime = null;
    row.dragBeforeEndTime = null;

    dispatch(updateGroupingRow(formatRecordTime(row, gunterView.viewConfig), row.rowid));

    sheetAjax
      .updateWorksheetRow({
        appId: base.appId,
        rowId: row.rowid,
        viewId: base.viewId,
        worksheetId: base.worksheetId,
        newOldControl: newOldControl,
      })
      .then(({ data, resultCode }) => {
        if (resultCode) {
        }
      });
  };
};

export const updateRecordDragTime = (row, start, end, value) => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    if (row.dragStartTime) {
      row.dragStartTime = moment(row.dragStartTime).add(value, 'd').format('YYYY-MM-DD');
    } else {
      row.dragStartTime = moment(start).add(value, 'd').format('YYYY-MM-DD');
      row.dragBeforeStartTime = row.startTime;
    }
    if (row.dragEndTime) {
      row.dragEndTime = moment(row.dragEndTime).add(value, 'd').format('YYYY-MM-DD');
    } else {
      row.dragEndTime = moment(end).add(value, 'd').format('YYYY-MM-DD');
      row.dragBeforeEndTime = row.endTime;
    }

    const data = {
      ...row,
      startTime: row.dragStartTime,
      endTime: row.dragEndTime,
    };
    dispatch(updateGroupingRow(data, row.rowid));
  };
};

export const updateRecordTitle = (control, record) => {
  return (dispatch, getState) => {
    const { base, gunterView } = getState().sheet;
    const { startId, endId, colorId, milepost } = gunterView.viewConfig;
    dispatch(
      updateGroupingRow(
        {
          [control.controlId]: control.value,
          groupId: record.groupId,
        },
        record.rowid,
      ),
    );
    sheetAjax
      .updateWorksheetRow({
        appId: base.appId,
        rowId: record.rowid,
        viewId: base.viewId,
        worksheetId: base.worksheetId,
        newOldControl: [control],
      })
      .then(({ data, resultCode }) => {
        if (!data) {
          handleRecordError(data.resultCode, control);
          dispatch(
            updateGroupingRow(
              {
                [control.controlId]: record[control.controlId],
                groupId: record.groupId,
              },
              record.rowid,
            ),
          );
        }
      });
  };
};

export const updateGroupingRow = (data, id) => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const { grouping, periodList, viewConfig } = gunterView;
    const { groupId } = data;
    const newGrouping = grouping.map(item => {
      if (groupId && item.key !== groupId) {
        return item;
      }
      const newRows = item.rows.map(row => {
        if (id === row.rowid) {
          return {
            ...row,
            ...data,
          };
        }
        return row;
      });
      const times = getRowsTime(newRows);
      return {
        ...item,
        ...times,
        rows: newRows,
      };
    });
    groupingTimeBlock(newGrouping, periodList, viewConfig);
    dispatch({ type: 'CHANGE_GUNTER_GROUPING', data: newGrouping });
  };
};

export const moveGroupingRow = (data, newKey, oldKey) => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const { grouping, periodList, viewConfig } = gunterView;
    const newGrouping = grouping.map(item => {
      let newRows = item.rows;
      if (item.key === oldKey) {
        newRows = item.rows.filter(item => item.rowid !== data.rowid);
      }
      if (item.key === newKey) {
        data.groupId = newKey;
        item.rows.push(data);
        newRows = item.rows;
      }
      const times = getRowsTime(newRows);
      return {
        ...item,
        ...times,
        rows: newRows,
      };
    });
    groupingTimeBlock(newGrouping, periodList, viewConfig);
    dispatch(updateGroupingData(newGrouping));
  };
};

export const addNewRecord = (record, addIndex) => {
  return (dispatch, getState) => {
    const { gunterView, controls } = getState().sheet;
    const { grouping, periodList, viewConfig } = gunterView;
    const viewControl = record[viewConfig.viewControl];
    const groupControl = _.find(controls, { controlId: viewConfig.viewControl }) || {};
    let groupKey = '-1';
    if ([29].includes(groupControl.type)) {
      const data = JSON.parse(viewControl)[0];
      groupKey = data ? data.sid : '-1';
    }
    if ([9, 11].includes(groupControl.type)) {
      const data = viewControl ? JSON.parse(viewControl)[0] : '-1';
      groupKey = data;
    }
    const colorControl = _.find(controls, { controlId: viewConfig.colorId });
    const newGrouping = grouping.map(item => {
      if (item.key === groupKey) {
        record.groupId = groupKey;
        const newRecord = formatRecordTime(fillRecordTimeBlockColor(record, colorControl), viewConfig);
        if (addIndex) {
          item.rows.splice(addIndex, 0, newRecord);
        } else {
          item.rows.push(newRecord);
        }
        return { ...item };
      }
      return item;
    });
    groupingTimeBlock(newGrouping, periodList, viewConfig);
    dispatch(updateGroupingData(newGrouping));
  };
};

export const updateEditIndex = index => {
  return (dispatch, getState) => {
    if (_.isString(index)) {
      const { gunterView } = getState().sheet;
      const { grouping, withoutArrangementVisible } = gunterView;
      index = getRecordIndex(index, grouping, withoutArrangementVisible);
    }
    dispatch({ type: 'CHANGE_GUNTER_EDIT_INDEX', data: index });
  };
};

export const updateWithoutArrangementVisible = value => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    localStorage.setItem('gunterViewWithoutArrangementVisible', value);
    dispatch({ type: 'CHANGE_GUNTER_WITHOUT_ARRANGEMENT_VISIBLE', data: value });
    dispatch(updateGroupingData(gunterView.grouping));
  };
};

export const changeViewType = value => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const { chartScroll, periodList } = gunterView;
    const scrollCenter = Math.abs(chartScroll.x) + chartScroll.wrapperWidth / 2;
    let leftValue = 0;
    let conterTime = null;
    for (let i = 0; i < periodList.length; i++) {
      if (scrollCenter > leftValue) {
        leftValue = leftValue + periodList[i].width;
      } else {
        conterTime = periodList[i - 1].time;
        break;
      }
    }
    dispatch(updataPeriodType(value, conterTime));
  };
};

export const updateGroupSubVisible = id => {
  return (dispatch, getState) => {
    const { grouping } = getState().sheet.gunterView;
    const newGrouping = grouping.map(item => {
      if (item.key === id) {
        const subVisible = !item.subVisible;
        const key = `gunter-sub-visible-${id}`;
        if (subVisible) {
          safeLocalStorageSetItem(key, true);
        } else {
          localStorage.removeItem(key);
        }
        return {
          ...item,
          subVisible,
        };
      } else {
        return item;
      }
    });
    dispatch(updateEditIndex(null));
    dispatch(updateGroupingData(newGrouping));
  };
};

export const updateGunterSearchRecord = record => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const { grouping, withoutArrangementVisible, chartScroll, groupingScroll } = gunterView;
    if (record) {
      let time = 0;
      const group = _.find(grouping, { key: record.groupId });
      if (!group.subVisible) {
        dispatch(updateGroupSubVisible(record.groupId));
        time = 100;
      }
      setTimeout(() => {
        const index = getRecordIndex(record.rowid, grouping, withoutArrangementVisible);
        const top = index * 32;
        const percentage = (top / chartScroll.scrollerHeight) * 100;
        const value = (percentage / 100) * Math.abs(chartScroll.maxScrollY);
        chartScroll.scrollTo(chartScroll.x, -value);
        groupingScroll && groupingScroll.scrollTo(groupingScroll.x, -value);
        chartScroll._execEvent('scroll');
        dispatch(updateEditIndex(index));
        dispatch(refreshGunterView(record.startTime));
        dispatch({ type: 'CHANGE_GUNTER_SEARCH_RECORD_ID', data: record.rowid });
      }, time);
    } else {
      dispatch(updateEditIndex(null));
      dispatch({ type: 'CHANGE_GUNTER_SEARCH_RECORD_ID', data: null });
    }
  };
};

export const loadLeftPeriodList = () => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const { periodType, periodList, viewConfig } = gunterView;
    const { periodCount, onlyWorkDay } = viewConfig;
    const movePeriodCount = periodCount / 2;
    const startValue = periodList[0].time;
    const endValue = periodList[periodList.length - 1 - movePeriodCount].time;
    let data = null;

    if (periodType === PERIOD_TYPE.day) {
      const start = moment(startValue).add(-movePeriodCount, 'd');
      const end = moment(endValue);
      data = onlyWorkDay ? getWorkDays(startValue, null, null, viewConfig) : getDays(start, end, null, viewConfig);
    } else if (periodType === PERIOD_TYPE.week) {
      const start = moment(startValue).add(-movePeriodCount, 'w');
      const end = moment(endValue);
      data = getWeeks(start, end, null, viewConfig);
    } else if (periodType === PERIOD_TYPE.month) {
      const start = moment(startValue).add(-movePeriodCount, 'M');
      const end = moment(endValue);
      data = getMonths(start, end, null, viewConfig);
    } else if (periodType === PERIOD_TYPE.quarter) {
      const start = moment(startValue).add(-movePeriodCount, 'Q');
      const end = moment(endValue);
      data = getQuarters(start, end, null, viewConfig);
    } else if (periodType === PERIOD_TYPE.year) {
      const start = moment(startValue).add(-(movePeriodCount / 2), 'Y');
      const end = moment(endValue);
      data = getYears(start, end, null, viewConfig);
    }

    dispatch(updatePeriodList(data));
  };
};

export const loadRightPeriodList = () => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const { periodType, periodList, viewConfig } = gunterView;
    const { periodCount, onlyWorkDay } = viewConfig;
    const movePeriodCount = periodCount / 2;
    const startValue = periodList[movePeriodCount].time;
    const endValue = periodList[periodList.length - 1].time;
    let data = null;

    if (periodType === PERIOD_TYPE.day) {
      const start = moment(startValue);
      const end = moment(endValue).add(movePeriodCount, 'd');
      data = onlyWorkDay ? getWorkDays(null, endValue, null, viewConfig) : getDays(start, end, null, viewConfig);
    } else if (periodType === PERIOD_TYPE.week) {
      const start = moment(startValue);
      const end = moment(endValue).add(movePeriodCount, 'w');
      data = getWeeks(start, end, null, viewConfig);
    } else if (periodType === PERIOD_TYPE.month) {
      const start = moment(startValue);
      const end = moment(endValue).add(movePeriodCount, 'M');
      data = getMonths(start, end, null, viewConfig);
    } else if (periodType === PERIOD_TYPE.quarter) {
      const start = moment(startValue);
      const end = moment(endValue).add(movePeriodCount, 'Q');
      data = getQuarters(start, end, null, viewConfig);
    } else if (periodType === PERIOD_TYPE.year) {
      const start = moment(startValue);
      const end = moment(endValue).add(movePeriodCount / 2, 'Y');
      data = getYears(start, end, null, viewConfig);
    }

    dispatch(updatePeriodList(data));
  };
};
