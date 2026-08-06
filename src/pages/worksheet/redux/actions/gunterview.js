import _ from 'lodash';
import moment from 'moment';
import sheetAjax from 'src/api/worksheet';
import { getDynamicValue } from 'src/components/Form/core/formUtils';
import { PERIOD_TYPE } from 'src/pages/worksheet/views/GunterView/config';
import {
  changeViewConfig,
  fillRecordsTimeBlockColor,
  fillRecordTimeBlockColor,
  formatRecordTime,
  formatWeekDay,
  getDays,
  getMaxTime,
  getMonths,
  getQuarters,
  getRecordIndex,
  getRowsTime,
  getWeeks,
  getWorkDays,
  getYears,
  groupingTimeBlock,
  sortGrouping,
} from 'src/pages/worksheet/views/GunterView/util';
import { getFilledRequestParams } from 'src/utils/common';
import { controlState, isTimeStyle } from 'src/utils/control';
import { formatQuickFilter } from 'src/utils/filter';
import { dateConvertToServerZone, dateConvertToUserZone } from 'src/utils/project';
import { handleRecordError } from 'src/utils/record';

const updatePeriodList = ({ result, parent }) => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const grouping = groupingTimeBlock(gunterView.grouping, result, gunterView.viewConfig);
    dispatch({ type: 'CHANGE_GUNTER_GROUPING', data: grouping });
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

let viewRequest = new WeakMap();
let fetchRowsRequestSeq = new WeakMap();

export const fetchRows = callBackFun => {
  return (dispatch, getState) => {
    const { base, controls, views, filters, quickFilter = [] } = getState().sheet;
    const { filterControls } = getState().mobile;
    const requestViewId = base.viewId;
    const requestWorksheetId = base.worksheetId;
    const requestKey = `${requestWorksheetId}-${requestViewId}`;
    const currentViewRequest = viewRequest.get(dispatch) || {};
    const currentRequestSeq = fetchRowsRequestSeq.get(dispatch) || {};
    const requestSeq = (currentRequestSeq[requestKey] || 0) + 1;

    fetchRowsRequestSeq.set(dispatch, {
      ...currentRequestSeq,
      [requestKey]: requestSeq,
    });

    if (window.isMingDaoApp) {
      filters.filterControls = filterControls;
    }

    const view = requestViewId ? _.find(views, { viewId: requestViewId }) || views[0] : views[0];
    const selectControl = _.find(controls, item => item.controlId === (view || {}).viewControl);

    dispatch({ type: 'CHANGE_GUNTER_LOADINNG', data: true });

    let request = currentViewRequest[requestKey];

    if (request && request.abort) {
      request.abort();
    }

    const isStaleRequest = () => {
      const { base: currentBase } = getState().sheet;
      const storeRequestSeq = fetchRowsRequestSeq.get(dispatch) || {};
      return (
        currentBase.viewId !== requestViewId ||
        currentBase.worksheetId !== requestWorksheetId ||
        requestSeq !== storeRequestSeq[requestKey]
      );
    };

    const currentRequest = sheetAjax.getFilterRows(
      getFilledRequestParams({
        appId: base.appId,
        viewId: requestViewId,
        worksheetId: requestWorksheetId,
        relationWorksheetId: selectControl && selectControl.type === 29 ? selectControl.dataSource : null,
        ...filters,
        fastFilters: formatQuickFilter(quickFilter),
        langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
      }),
    );
    viewRequest.set(dispatch, {
      ...currentViewRequest,
      [requestKey]: currentRequest,
    });

    currentRequest.then(({ data }) => {
      const storeViewRequest = viewRequest.get(dispatch) || {};

      if (storeViewRequest[requestKey] === currentRequest) {
        viewRequest.set(dispatch, {
          ...storeViewRequest,
          [requestKey]: undefined,
        });
      }

      if (isStaleRequest()) {
        return;
      }

      const isLocalhost = location.href.includes('localhost');
      const isGunterExport = location.href.includes('gunterExport');
      setTimeout(
        () => {
          if (isStaleRequest()) {
            return;
          }

          const { gunterView } = getState().sheet;
          const { viewId, colorId, startId, endId, startFormat, endFormat, showgroupcolor, startControl, endControl } =
            gunterView.viewConfig;
          const selectControlOptions = _.get(selectControl, 'options') || [];
          const isStartTimeStyle = isTimeStyle(startControl);
          const isEndTimeStyle = isTimeStyle(endControl);
          const grouping = sortGrouping(
            data.map(item => {
              const rows = (item.rows || []).map(row => {
                const data = formatRecordTime(safeParse(row || '{}'), gunterView.viewConfig);
                const startTime =
                  data.startTime && isStartTimeStyle
                    ? moment(dateConvertToUserZone(data.startTime)).format(startFormat)
                    : data.startTime;
                const endTime =
                  data.endTime && isEndTimeStyle
                    ? moment(dateConvertToUserZone(data.endTime)).format(endFormat)
                    : data.endTime;
                data.originalStartTime = data.startTime;
                data.originalEndTime = data.endTime;
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
              const name = _.get(selectControl, 'options.length')
                ? _.get(_.find(selectControl.options, { key: item.key }), 'value') || item.name
                : item.name;

              return {
                ...item,
                name,
                ...times,
                color:
                  showgroupcolor === '1'
                    ? _.get(_.find(selectControlOptions, { key: item.key }), 'color') || '#B1C4D5'
                    : '#B1C4D5',
                rows,
                subVisible: localStorage.getItem(key) ? true : isGunterExport,
              };
            }),
            view,
            controls,
          );

          let groupingWithTime = grouping;

          if (isGunterExport) {
            const { calendartype } = view.advancedSetting;
            const gunterViewType = localStorage.getItem(`gunterViewType-${viewId}`);
            const type = gunterViewType
              ? Number(gunterViewType)
              : calendartype
                ? Number(calendartype)
                : PERIOD_TYPE.day;
            const exportViewConfig = changeViewConfig(type, gunterView.viewConfig);
            dispatch({ type: 'CHANGE_GUNTER_PERIOD_TYPE', data: type });
            dispatch({ type: 'CHANGE_GUNTER_VIEW_CONFIG', data: exportViewConfig });
            const periodList = getExportPeriodList(type, getRowsTime(grouping), exportViewConfig);
            dispatch(updatePeriodList(periodList));
            groupingWithTime = groupingTimeBlock(grouping, periodList.result, exportViewConfig);
          } else {
            groupingWithTime = groupingTimeBlock(grouping, gunterView.periodList, gunterView.viewConfig);
          }

          const groupingWithColor = fillRecordsTimeBlockColor(
            groupingWithTime,
            _.find(controls, { controlId: colorId }),
          );
          dispatch(updateGroupingData(groupingWithColor));
          callBackFun && callBackFun(groupingWithColor);
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
    const { gunterView } = getState().sheet;
    const { viewConfig, withoutArrangementVisible } = gunterView;
    const { viewControl } = viewConfig;
    let lastOpenCount = 0;
    const newGrouping = grouping.map(item => {
      const rowLength = withoutArrangementVisible ? item.rows.length : item.rows.filter(item => item.diff > 0).length;
      const count = 1 + (item.subVisible ? rowLength : 0);
      let openCount = lastOpenCount ? count + lastOpenCount : count;
      let subVisible = item.subVisible;
      let hide = false;

      if (_.isEmpty(viewControl)) {
        subVisible = true;
        hide = true;
        openCount = rowLength;
      } else if (item.key == '-1' && _.isEmpty(item.rows)) {
        hide = true;
        openCount = openCount - 1;
      } else {
        hide = false;
      }

      lastOpenCount = openCount;

      return {
        ...item,
        subVisible,
        hide,
        openCount,
        groupingIndex: openCount - (subVisible ? rowLength : 0) - 1,
      };
    });
    dispatch({ type: 'CHANGE_GUNTER_GROUPING', data: newGrouping });
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

export const updateGroupingVisible = data => {
  return (dispatch, getState) => {
    const { base, gunterView } = getState().sheet;
    const value = _.isBoolean(data) ? data : !gunterView.groupingVisible;
    safeLocalStorageSetItem(`gunterGroupingVisible-${base.viewId}`, value);
    dispatch({ type: 'CHANGE_GUNTER_GROUPING_VISIBLE', data: value });
  };
};

export const updateGroupingScroll = scroll => {
  return dispatch => {
    dispatch({ type: 'CHANGE_GUNTER_GROUPING_SCROLL', data: scroll });
  };
};

export const updateChartScroll = scroll => {
  return dispatch => {
    dispatch({ type: 'CHANGE_GUNTER_CHART_SCROLL', data: scroll });
  };
};

export const destroyGunterView = () => {
  return dispatch => {
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_TYPE', data: null });
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_LIST', data: [] });
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_PARENT_LIST', data: [] });
    dispatch({ type: 'CHANGE_GUNTER_GROUPING', data: [] });
    dispatch({ type: 'CHANGE_GUNTER_SEARCH_RECORD_ID', data: null });
  };
};

export const refreshGunterView = time => {
  return (dispatch, getState) => {
    const { base, gunterView } = getState().sheet;
    const gunterViewType = localStorage.getItem(`gunterViewType-${base.viewId}`) || gunterView.periodType;
    dispatch(updataPeriodType(Number(gunterViewType) || PERIOD_TYPE.day, time));
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

    dispatch(
      fetchRows(grouping => {
        dispatch(refreshGunterView(getMaxTime(grouping)));
      }),
    );
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
    const { base, gunterView } = getState().sheet;
    const { viewConfig } = gunterView;
    const newViewConfig = changeViewConfig(value, viewConfig);
    dispatch({ type: 'CHANGE_GUNTER_PERIOD_TYPE', data: value });
    dispatch({ type: 'CHANGE_GUNTER_VIEW_CONFIG', data: newViewConfig });
    safeLocalStorageSetItem(`gunterViewType-${base.viewId}`, value);
    let data = {};

    if (value === PERIOD_TYPE.day) {
      const { onlyWorkDay } = newViewConfig;
      data = onlyWorkDay ? getWorkDays(null, null, time, newViewConfig) : getDays(null, null, time, newViewConfig);
    } else if (value === PERIOD_TYPE.week) {
      data = getWeeks(null, null, time, newViewConfig);
    } else if (value === PERIOD_TYPE.month) {
      data = getMonths(null, null, time, newViewConfig);
    } else if (value === PERIOD_TYPE.quarter) {
      data = getQuarters(null, null, time, newViewConfig);
    } else if (value === PERIOD_TYPE.year) {
      data = getYears(null, null, time, newViewConfig);
    }

    dispatch(updatePeriodList(data));
  };
};

export const updateViewConfig = () => {
  return (dispatch, getState) => {
    const { base, views, gunterView, controls } = getState().sheet;
    const {
      advancedSetting,
      viewControl,
      displayControls = [],
    } = base.viewId ? _.find(views, { viewId: base.viewId }) || views[0] : views[0];
    const {
      unweekday,
      begindate,
      enddate,
      colorid,
      calendartype,
      milepost,
      clicktype,
      viewtitle,
      showgroupcolor,
      navtitle,
    } = advancedSetting;
    const titleControlData = _.find(controls, { attribute: 1 }) || {};
    const startControlData = _.find(controls, { controlId: begindate }) || {};
    const endControlData = _.find(controls, { controlId: enddate }) || {};
    const isShareView = _.get(window, 'shareState.shareId');
    const titleControl = {
      ...titleControlData,
      disabled: isShareView ? true : titleControlData.disabled,
    };
    const startControl = {
      ...startControlData,
      disabled: isShareView || [30, 38].includes(startControlData.type) ? true : startControlData.disabled,
    };
    const endControl = {
      ...endControlData,
      disabled: isShareView || [30, 38].includes(endControlData.type) ? true : endControlData.disabled,
    };

    const getFormat = control => {
      if (control.type === 16 || (control.type === 38 && control.unit == '1')) {
        return 'YYYY-MM-DD HH:mm';
      } else {
        return 'YYYY-MM-DD';
      }
    };

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
      startControl,
      endControl,
      startFormat: getFormat(startControl),
      endFormat: getFormat(endControl),
      endZeroFormat: endControl.type === 16 ? 'YYYY-MM-DD 00:00' : 'YYYY-MM-DD',
      startType: startControl.type,
      endType: endControl.type,
      startDisable: startControl.disabled || !controlState(startControl, 3).editable,
      endDisable: endControl.disabled || !controlState(endControl, 3).editable,
      titleDisable: titleControl.disabled || !controlState(titleControl, 3).editable,
      navTitle: navtitle,
      clickType: clicktype || '0',
      advancedSetting,
      viewtitle,
      showgroupcolor,
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
    let newGrouping = grouping.map(group => {
      if (group.key === id) {
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

        return {
          ...group,
          rows: group.rows.concat(record),
        };
      }

      return group;
    });
    newGrouping = groupingTimeBlock(newGrouping, periodList, viewConfig);
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

      if ([26, 48].includes(groupControl.type)) {
        value = JSON.stringify([safeParse(name || '{}')]);
      }

      if ([27].includes(groupControl.type)) {
        value = JSON.stringify([{ departmentId: value, departmentName: name }]);
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
        let value = getDynamicValue(
          controls.map(i => ({ ...i, value: row[i.controlId] })),
          { ...c, value: row[c.controlId] },
        );

        if (c.type === 34) {
          try {
            const records = safeParse(value || '[]');

            if (records.length) {
              const tempValue = records.map(staticRow => {
                const rows = [];
                Object.keys(staticRow).forEach(key => {
                  rows.push({ controlId: key === 'rowid' ? 'tempRowId' : key, value: staticRow[key] });
                });
                return rows;
              });
              value = JSON.stringify(tempValue);
            }
          } catch (err) {
            console.log(err);
          }
        }

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

        const errors = {
          11: _l('创建失败，%0不允许重复', titleControl.controlName || ''),
          22: _l('创建失败，子表字段存在重复数据'),
        };

        if (errors[data.resultCode]) {
          alert(errors[data.resultCode], 3);
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
          let newGrouping = gunterView.grouping.map(item => {
            const newRows = item.rows.filter(row => row.rowid !== id);
            const times = getRowsTime(newRows);
            return {
              ...item,
              ...times,
              rows: newRows,
            };
          });
          newGrouping = groupingTimeBlock(newGrouping, gunterView.periodList, gunterView.viewConfig);
          dispatch(updateGroupingData(newGrouping));
        }
      });
  };
};

export const hideRecord = id => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    let newGrouping = gunterView.grouping.map(item => {
      const newRows = item.rows.filter(row => row.rowid !== id);
      const times = getRowsTime(newRows);
      return {
        ...item,
        ...times,
        rows: newRows,
      };
    });
    newGrouping = groupingTimeBlock(newGrouping, gunterView.periodList, gunterView.viewConfig);
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
        const data = safeParse(viewControl || '[]', 'array')[0];
        newKey = data ? data.sid : '-1';
      }

      if ([9, 11].includes(groupControl.type)) {
        const data = viewControl ? safeParse(viewControl, 'array')[0] : '-1';
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
    const { startId, endId } = gunterView.viewConfig;
    const startControl = _.find(controls, { controlId: startId });
    const endControl = _.find(controls, { controlId: endId });
    const { allowweek: startAllowweek } = startControl.advancedSetting || {};
    const { allowweek: endAllowweek } = endControl.advancedSetting || {};
    const startAllowDays = formatWeekDay(startAllowweek);
    const endAllowDays = formatWeekDay(endAllowweek);
    const newOldControl = [];
    let updatedRow = { ...row };

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
      updatedRow = {
        ...updatedRow,
        [startId]: start,
        startTime: start,
      };
    }

    if (!_.isNull(end)) {
      newOldControl.push({
        controlId: endId,
        controlName: endControl.controlName,
        dot: endControl.dot,
        type: endControl.type,
        value: dateConvertToServerZone(end),
      });
      updatedRow = {
        ...updatedRow,
        [endId]: end,
        endTime: end,
      };
    }

    updatedRow = {
      ...updatedRow,
      dragStartTime: null,
      dragEndTime: null,
      dragBeforeStartTime: null,
      dragBeforeEndTime: null,
    };

    dispatch(updateGroupingRow(formatRecordTime(updatedRow, gunterView.viewConfig), row.rowid));

    sheetAjax.updateWorksheetRow({
      appId: base.appId,
      rowId: row.rowid,
      viewId: base.viewId,
      worksheetId: base.worksheetId,
      newOldControl: newOldControl,
    });
  };
};

export const updateRecordDragTime = (row, start, end, value) => {
  return dispatch => {
    const dragStartTime = row.dragStartTime
      ? moment(row.dragStartTime).add(value, 'd').format('YYYY-MM-DD')
      : moment(start).add(value, 'd').format('YYYY-MM-DD');
    const dragEndTime = row.dragEndTime
      ? moment(row.dragEndTime).add(value, 'd').format('YYYY-MM-DD')
      : moment(end).add(value, 'd').format('YYYY-MM-DD');
    const data = {
      ...row,
      dragStartTime,
      dragEndTime,
      dragBeforeStartTime: row.dragStartTime ? row.dragBeforeStartTime : row.startTime,
      dragBeforeEndTime: row.dragEndTime ? row.dragBeforeEndTime : row.endTime,
      startTime: dragStartTime,
      endTime: dragEndTime,
    };
    dispatch(updateGroupingRow(data, row.rowid));
  };
};

export const updateRecordTitle = (control, record) => {
  return (dispatch, getState) => {
    const { base } = getState().sheet;

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
      .then(({ data }) => {
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
    let newGrouping = grouping.map(item => {
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
    newGrouping = groupingTimeBlock(newGrouping, periodList, viewConfig);
    dispatch({ type: 'CHANGE_GUNTER_GROUPING', data: newGrouping });
  };
};

export const moveGroupingRow = (data, newKey, oldKey) => {
  return (dispatch, getState) => {
    const { gunterView } = getState().sheet;
    const { grouping, periodList, viewConfig } = gunterView;
    let newGrouping = grouping.map(item => {
      let newRows = item.rows;

      if (item.key === oldKey) {
        newRows = item.rows.filter(item => item.rowid !== data.rowid);
      }

      if (item.key === newKey) {
        newRows = item.rows.concat({
          ...data,
          groupId: newKey,
        });
      }

      const times = getRowsTime(newRows);
      return {
        ...item,
        ...times,
        rows: newRows,
      };
    });
    newGrouping = groupingTimeBlock(newGrouping, periodList, viewConfig);
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
      const data = safeParse(viewControl || '[]', 'array')[0];
      groupKey = data ? data.sid : '-1';
    }

    if ([9, 11].includes(groupControl.type)) {
      const data = viewControl ? safeParse(viewControl, 'array')[0] : '-1';
      groupKey = data;
    }

    const colorControl = _.find(controls, { controlId: viewConfig.colorId });
    let newGrouping = grouping.map(item => {
      if (item.key === groupKey) {
        const newRecord = formatRecordTime(
          fillRecordTimeBlockColor({ ...record, groupId: groupKey }, colorControl),
          viewConfig,
        );
        const newRows = addIndex
          ? item.rows.slice(0, addIndex).concat(newRecord, item.rows.slice(addIndex))
          : item.rows.concat(newRecord);

        return {
          ...item,
          rows: newRows,
        };
      }

      return item;
    });
    newGrouping = groupingTimeBlock(newGrouping, periodList, viewConfig);
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
    safeLocalStorageSetItem('gunterViewWithoutArrangementVisible', value);
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
    const startValue = _.get(periodList, '[0].time');
    const endValue = _.get(periodList, `[${periodList.length - 1 - movePeriodCount}].time`);
    let data = null;

    if (!startValue || !endValue) {
      return;
    }

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
    const startValue = _.get(periodList, `[${movePeriodCount}].time`);
    const endValue = _.get(periodList, `[${periodList.length - 1}].time`);
    let data = null;

    if (!startValue || !endValue) {
      return;
    }

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
