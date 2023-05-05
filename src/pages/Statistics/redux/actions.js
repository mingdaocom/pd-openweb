
import worksheetAjax from 'src/api/worksheet';
import reportConfigAjax from '../api/reportConfig';
import reportRequestAjax from '../api/report';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

import {
  initConfigDetail,
  fillValueMap,
  getNewReport,
  mergeReportData,
  isAreaControl,
  isTimeControl,
  isNumberControl,
  isXAxisControl,
  areaParticleSizeDropdownData,
  filterDisableParticleSizeTypes,
  filterTimeParticleSizeDropdownData
} from '../common';
import { reportTypes } from 'statistics/Charts/common';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import {
  formatValuesOfOriginConditions,
  redefineComplexControl,
} from 'worksheet/common/WorkSheetFilter/util';
import { getAppFeaturesPath } from 'src/util';
import _ from 'lodash';

export const changeBase = (data) => {
  return (dispatch, getState) => {
    dispatch({
      type: 'CHANGE_STATISTICS_BASE',
      data: data
    });
  }
}

let reportConfigDetailRequest = null;
export const getReportConfigDetail = (data, callBack) => {
  return (dispatch, getState) => {
    const { reportId, reportType, appId } = data;
    const { currentReport: oldReport, base } = getState().statistics;
    const { viewId, permissions } = base;
    const isPublicShare = location.href.includes('public/chart') || location.href.includes('public/page') || window.shareAuthor;

    if (reportType) {
      dispatch({
        type: 'CHANGE_STATISTICS_LOADING',
        data: true
      });
    } else {
      dispatch({
        type: 'CHANGE_STATISTICS_DETAIL_LOADING',
        data: false
      });
    }

    if (!permissions) {
      if (isPublicShare) {
        dispatch(getReportData());
      } else {
        dispatch(getWorksheetInfo(appId));
      }
      return;
    }

    if (reportConfigDetailRequest && reportConfigDetailRequest.state() === 'pending') {
      reportConfigDetailRequest.abort();
    }
    reportConfigDetailRequest = reportConfigAjax.getReportConfigDetail(data);
    reportConfigDetailRequest.then(result => {
      const { currentReport, axisControls } = initConfigDetail(reportId, result, oldReport);
      if (viewId && !reportId && !_.get(currentReport, ['filter', 'viewId'])) {
        currentReport.filter.viewId = viewId;
      }
      if (currentReport.reportType === reportTypes.BarChart) {
        currentReport.displaySetup.showChartType = _.get(oldReport, 'displaySetup.showChartType') || currentReport.displaySetup.showChartType;
      }
      dispatch({
        type: 'CHANGE_STATISTICS_CURRENT_REPORT',
        data: currentReport
      });
      dispatch({
        type: 'CHANGE_STATISTICS_AXIS_CONTROLS',
        data: axisControls
      });
      if (callBack) {
        callBack();
        return
      }
      if (reportType) {
        dispatch(getReportData());
      } else {
        const worksheetId = result.appId;
        dispatch(getWorksheetInfo(worksheetId));
      }
    });
  }
}

let reportConfigRequest = null;
let reportRequest = null;
export const getReportData = () => {
  return (dispatch, getState) => {
    const { base, currentReport, reportData } = getState().statistics;
    const { permissions, report, settingVisible, sheetVisible, filters, filtersGroup } = base;
    const data = getNewReport(getState().statistics);
    const success = (result) => {
      const data = fillValueMap(result);
      if (permissions) {
        const param = mergeReportData(currentReport, result, report.id);
        dispatch({
          type: 'CHANGE_STATISTICS_CURRENT_REPORT',
          data: {
            ...currentReport,
            ...param
          }
        });
      } else {
        if (data.reportType === reportTypes.PivotTable) {
          data.pivotTable = {
            columnSummary: data.columnSummary,
            lineSummary: data.lineSummary,
            columns: data.columns,
            lines: data.lines,
            showColumnTotal: data.showColumnTotal,
            showLineTotal: data.showLineTotal
          }
        }
        dispatch({
          type: 'CHANGE_STATISTICS_CURRENT_REPORT',
          data: _.isEmpty(currentReport) ? data : currentReport
        });
      }
      dispatch({
        type: 'CHANGE_STATISTICS_REPORT_DATA',
        data: data
      });
      dispatch({
        type: 'CHANGE_STATISTICS_LOADING',
        data: false
      });
    }
    const fail = () => {
      dispatch({
        type: 'CHANGE_STATISTICS_REPORT_DATA',
        data: { status: 0 }
      });
      dispatch({
        type: 'CHANGE_STATISTICS_LOADING',
        data: false
      });
    }
    dispatch({
      type: 'CHANGE_STATISTICS_LOADING',
      data: true
    });
    if (settingVisible) {
      if (!data.reportType) {
        fail();
        return;
      }
      if (reportConfigRequest && reportConfigRequest.state() === 'pending') {
        reportConfigRequest.abort();
      }
      data.filter.filterId = null;
      reportConfigRequest = reportConfigAjax.getData(data, { fireImmediately: false });
      reportConfigRequest.then(result => {
        success(result);
      }).fail(fail);
    } else {
      if (reportRequest && reportRequest.state() === 'pending') {
        reportRequest.abort();
      }
      const { filter = {}, sorts, version, particleSizeType } = data;
      const params = {
        reportId: report.id,
        version,
        reload: true,
        filters: []
      }
      if (!_.isEmpty(filters)) {
        params.filters.push(filters);
      }
      if (!_.isEmpty(filter.filterControls)) {
        params.filters.push(filter.filterControls);
      }
      if (!_.isEmpty(filtersGroup)) {
        params.filters.push(filtersGroup);
      }
      if (!_.isEmpty(reportData)) {
        Object.assign(params, {
          particleSizeType,
          filterRangeId: filter.filterRangeId,
          rangeType: filter.rangeType,
          rangeValue: filter.rangeValue,
          today: filter.today,
          dynamicFilter: filter.dynamicFilter,
          sorts,
        })
      }
      reportRequest = reportRequestAjax.getData(params, { fireImmediately: false });
      reportRequest.then(result => {
        success(result);
      }).fail(fail);
    }
    if (sheetVisible && settingVisible) {
      dispatch(changeBase({
        reportSingleCacheId: null,
        apkId: null
      }));
      dispatch(getTableData());
    }
  }
}

export const getTableData = () => {
  return (dispatch, getState) => {
    const { base, reportData } = getState().statistics;
    const { report, match, settingVisible, activeData, filters, filtersGroup } = base;
    const data = getNewReport(getState().statistics);

    dispatch({
      type: 'CHANGE_STATISTICS_TABLE_DATA',
      data: {}
    });

    const formatYaxisList = (data) => {
      const { yaxisList = [] } = data;
      const leftYaxisList = reportData.yaxisList || [];
      const rightYaxisList = _.get(reportData, ['rightY', 'yaxisList']) || [];
      if (yaxisList.length > 1) {
        yaxisList.forEach(item => {
          const isRight = _.find(rightYaxisList, { controlId: item.controlId });
          const { magnitude, ydot, suffix, dot } = isRight ? rightYaxisList[0] : leftYaxisList[0];
          item.magnitude = magnitude;
          item.ydot = ydot;
          item.suffix = suffix;
          item.dot = dot;
        });
      }
      return data;
    }

    if (settingVisible) {
      reportConfigAjax.getTableData(data, { fireImmediately: true }).then(result => {
        dispatch({
          type: 'CHANGE_STATISTICS_TABLE_DATA',
          data: formatYaxisList(result)
        });
      });
    } else {
      const { filter = {}, sorts, version, particleSizeType, country } = data;
      const params = {
        reportId: report.id,
        version: data.version,
        reload: true,
        filters: []
      }
      if (!_.isEmpty(filters)) {
        params.filters.push(filters);
      }
      if (!_.isEmpty(filter.filterControls)) {
        params.filters.push(filter.filterControls);
      }
      if (!_.isEmpty(filtersGroup)) {
        params.filters.push(filtersGroup);
      }
      if (!_.isEmpty(reportData)) {
        Object.assign(params, {
          particleSizeType,
          filterRangeId: filter.filterRangeId,
          rangeType: filter.rangeType,
          rangeValue: filter.rangeValue,
          today: filter.today,
          dynamicFilter: filter.dynamicFilter,
          sorts,
        });
      }
      if (!_.isEmpty(country)) {
        Object.assign(params, {
          filterCode: country.drillFilterCode,
          particleSizeType: country.drillParticleSizeType
        });
      }
      reportRequestAjax.getTableData(params, { fireImmediately: true }).then(result => {
        dispatch({
          type: 'CHANGE_STATISTICS_TABLE_DATA',
          data: formatYaxisList(result)
        });
      });
    }
  }
}

export const getReportSingleCacheId = (data) => {
  return (dispatch, getState) => {
    const { base, worksheetInfo, currentReport } = getState().statistics;
    const { report, sheetId, filters = [], filtersGroup = [] } = base;
    const { viewId, filterControls = [], filterRangeId, rangeType, rangeValue, dynamicFilter } = currentReport.filter || {};
    const { drillParticleSizeType } = currentReport.country || {};
    const { isPersonal, match, contrastType } = data;

    if (!isPersonal) {
      dispatch({
        type: 'CHANGE_STATISTICS_REPORTSINGLECACHE_LOADING',
        data: true
      });
    }

    reportRequestAjax.getReportSingleCacheId({
      isPersonal,
      match,
      contrastType,
      reportId: report.id,
      particleSizeType: drillParticleSizeType,
      appId: sheetId,
      filters: [[...filters], [...filterControls], [...filtersGroup]].filter(_ => _.length),
      filterRangeId,
      rangeType,
      rangeValue,
      dynamicFilter
    }, {
      fireImmediately: true
    }).then(result => {
      if (!result.id) return;
      if (isPersonal) {
        window.open(`/worksheet/${worksheetInfo.worksheetId}/view/${viewId}?chartId=${result.id}&${getAppFeaturesPath()}`);
      } else {
        dispatch(changeBase({
          reportSingleCacheId: result.id,
          apkId: result.apkId
        }));
        if (!isPersonal) {
          dispatch({
            type: 'CHANGE_STATISTICS_REPORTSINGLECACHE_LOADING',
            data: false
          });
        }
      }
    });
  }
}

export const requestOriginalData = (data) => {
  return (dispatch, getState) => {
    const { base, worksheetInfo, currentReport } = getState().statistics;
    const { filter = {} } = currentReport;
    const style = currentReport.style || {};
    const viewDataType = style.viewDataType || 1;
    const { viewId } = filter;
    const view = _.find(worksheetInfo.views, { viewId });
    if (viewDataType === 2 && view && [VIEW_DISPLAY_TYPE.sheet].includes(view.viewType.toString())) {
      data.isPersonal = true;
    } else {
      dispatch(changeBase({
        sheetVisible: true,
        match: data.match
      }));
    }
    dispatch(getReportSingleCacheId(data));
  }
}

let worksheetInfoRequest = null;
let worksheetFilterByIdRequest = null;
export const getWorksheetInfo = (worksheetId) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { filter } = currentReport;
    const filterId = _.get(filter, 'filterId');

    if (worksheetInfoRequest && worksheetInfoRequest.state() === 'pending') {
      worksheetInfoRequest.abort();
    }
    if (worksheetFilterByIdRequest && worksheetFilterByIdRequest.state() === 'pending') {
      worksheetFilterByIdRequest.abort();
    }
    worksheetInfoRequest = worksheetAjax.getWorksheetInfo({
      worksheetId,
      getTemplate: true,
      getViews: true,
      getSwitchPermit: true,
    });
    worksheetFilterByIdRequest = filterId ? worksheetAjax.getWorksheetFilterById({ filterId }) : null;

    Promise.all([worksheetInfoRequest, worksheetFilterByIdRequest]).then(result => {
      const [ worksheetResult, filterResult ] = result;
      dispatch({
        type: 'CHANGE_STATISTICS_DETAIL_LOADING',
        data: false
      });
      dispatch({
        type: 'CHANGE_STATISTICS_WORKSHEET_INFO',
        data: {
          worksheetId,
          appId: worksheetResult.appId,
          name: worksheetResult.name,
          views: worksheetResult.views,
          switches: worksheetResult.switches,
          columns: (_.get(worksheetResult, ['template', 'controls']) || []).map(item => redefineComplexControl(item))
        }
      });
      if (filterResult) {
        const newCurrentReport = {
          ...currentReport,
          filter: {
            ...filter,
            filterControls: formatValuesOfOriginConditions(filterResult.items)
          }
        }
        dispatch({
          type: 'CHANGE_STATISTICS_CURRENT_REPORT',
          data: newCurrentReport
        });
        dispatch({
          type: 'CHANGE_STATISTICS_FILTER_ITEM',
          data: filterResult.items
        });
      }
      dispatch(getReportData());
    });
  }
}

export const changeFilterItem = (data) => {
  return (dispatch, getState) => {
    dispatch({
      type: 'CHANGE_STATISTICS_FILTER_ITEM',
      data
    });
  }
}

export const changeCurrentReport = (data, isRequest) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    dispatch({
      type: 'CHANGE_STATISTICS_CURRENT_REPORT',
      data: {
        ...currentReport,
        ...data,
      }
    });
    if (isRequest) {
      dispatch(getReportData());
    }
  }
}

export const closeCurrentReport = () => {
  return (dispatch, getState) => {
    dispatch({
      type: 'CHANGE_STATISTICS_CURRENT_REPORT',
      data: {}
    });
  }
}

export const changeSheetId = (activeSheetId) => {
  return (dispatch, getState) => {
    const { currentReport, base } = getState().statistics;
    dispatch({
      type: 'CHANGE_STATISTICS_CURRENT_REPORT',
      data: {}
    });
    dispatch({
      type: 'CHANGE_STATISTICS_REPORT_DATA',
      data: {}
    });
    dispatch({
      type: 'CHANGE_STATISTICS_FILTER_ITEM',
      data: []
    });
    dispatch(getReportConfigDetail({
      appId: activeSheetId,
      reportType: null,
      reportId: null
    }));
  }
}

export const changeControlCheckbox = (event, item) => {
  return (dispatch, getState) => {
    const { currentReport, base } = getState().statistics;
    const { reportType, xaxes, yaxisList, rightY, split, pivotTable, config } = currentReport;
    const targetList = _.get(config, 'targetList') || [];
    const rightYaxisList = _.get(rightY, ['yaxisList']) || [];
    const rightSplit = _.get(rightY, ['split']);
    const lines = _.get(pivotTable, ['lines']) || [];
    const columns = _.get(pivotTable, ['columns']) || [];
    const { checked } = event.target;
    if (checked) {
      const isNumber = isNumberControl(item.type);
      const isSplit = [reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes].includes(reportType);
      if (reportType === reportTypes.PivotTable) {
        if (isNumber) {
          dispatch(addYaxisList(item));
          return;
        }
        if (lines.length <= columns.length) {
          dispatch(addLines(item));
        } else {
          dispatch(addColumns(item));
        }
        return
      }
      if (reportType === reportTypes.DualAxes) {
        if (isNumber) {
          if (yaxisList.length && split.controlId && rightSplit && _.isEmpty(rightSplit.controlId)) {
            dispatch(addRightYaxisList(item));
            return
          }
          if (_.isEmpty(split.controlId)) {
            if (yaxisList.length <= rightYaxisList.length) {
              dispatch(addYaxisList(item));
            } else {
              dispatch(addRightYaxisList(item));
            }
            return
          }
        }
        if (yaxisList.length === 1) {
          if (isSplit && _.isEmpty(split.controlId)) {
            dispatch(changeSplit(item));
            return
          }
        }
        if (rightYaxisList.length === 1) {
          if (isSplit && rightSplit && _.isEmpty(rightSplit.controlId)) {
            dispatch(changeRightSplit(item));
            return
          }
        }
        dispatch(getReportConfigDetail({
          reportId: base.report.id,
          appId: base.sheetId,
          reportType: reportTypes.PivotTable
        }, () => {
          if (split.controlId) {
            dispatch(addLines(split, false));
          }
          if (rightSplit && rightSplit.controlId) {
            dispatch(addColumns(rightSplit));
          }
          rightYaxisList.forEach(item => {
            dispatch(addYaxisList(item));
          });
          if (isNumber) {
            dispatch(addYaxisList(item));
          } else {
            dispatch(addColumns(item));
          }
        }));
        return;
      }
      if (reportType === reportTypes.NumberChart && yaxisList.length) {
        dispatch(getReportConfigDetail({
          reportId: base.report.id,
          appId: base.sheetId,
          reportType: reportTypes.BarChart
        }, () => {
          if (isNumber) {
            dispatch(addYaxisList(item));
          } else {
            dispatch(addXaxes(item));
          }
        }));
        return
      }
      if ([reportTypes.PieChart, reportTypes.FunnelChart, reportTypes.WordCloudChart]) {
        if (_.isEmpty(xaxes.controlId) && !isNumber) {
          dispatch(addXaxes(item));
          return;
        }
        if ((yaxisList.length && xaxes.controlId) || yaxisList.length >= 1) {
          dispatch(getReportConfigDetail({
            reportId: base.report.id,
            appId: base.sheetId,
            reportType: reportTypes.PivotTable
          }, () => {
            dispatch(addColumns(item));
          }));
          return;
        }
      }
      if (_.isEmpty(xaxes.controlId) && !isNumber) {
        if (
          ([reportTypes.CountryLayer].includes(reportType) && !isAreaControl(item.type)) ||
          ([reportTypes.RadarChart, reportTypes.FunnelChart].includes(reportType) && isTimeControl(item.type)) ||
          !isXAxisControl(item.type)
        ) {
          dispatch(getReportConfigDetail({
            reportId: base.report.id,
            appId: base.sheetId,
            reportType: reportTypes.BarChart
          }, () => {
            dispatch(addXaxes(item));
          }));
        } else {
          dispatch(addXaxes(item));
        }
        if (!reportType) {
          dispatch(getReportConfigDetail({
            reportId: base.report.id,
            appId: base.sheetId,
            reportType: reportTypes.BarChart
          }));
        }
      }
      if (xaxes.controlId && !isNumber) {
        if (yaxisList.length > 1) {
          dispatch(getReportConfigDetail({
            reportId: base.report.id,
            appId: base.sheetId,
            reportType: reportTypes.DualAxes
          }, () => {
            dispatch(changeSplit(item, false));
            dispatch(changeYaxisList({ yaxisList: [yaxisList[0]] }, false));
            dispatch(changeRightYaxisList({ yaxisList: [yaxisList[1]] }));
          }));
          return
        }
        if (yaxisList.length) {
          if (isSplit && _.isEmpty(split.controlId)) {
            dispatch(changeSplit(item));
            return
          }
        }
        dispatch(getReportConfigDetail({
          reportId: base.report.id,
          appId: base.sheetId,
          reportType: reportTypes.PivotTable
        }, () => {
          if (split.controlId) {
            dispatch(addLines(split, false));
          }
          dispatch(addColumns(item));
        }));
      }
      if (isNumber) {
        if (split.controlId) {
          dispatch(getReportConfigDetail({
            reportId: base.report.id,
            appId: base.sheetId,
            reportType: reportTypes.DualAxes
          }, () => {
            dispatch(changeSplit(split, false));
            dispatch(addRightYaxisList(item));
          }));
          return;
        }
        dispatch(addYaxisList(item));
        if (!reportType) {
          dispatch(getReportConfigDetail({
            reportId: base.report.id,
            appId: base.sheetId,
            reportType: reportTypes.NumberChart
          }));
        }
      }
    } else {
      if (item.controlId === xaxes.controlId) {
        dispatch(removeXaxes());
      }
      if (_.find(yaxisList, { controlId: item.controlId })) {
        dispatch(removeYaxisList(item.controlId));
      }
      if (_.find(rightYaxisList, { controlId: item.controlId })) {
        dispatch(removeRightYaxisList(item.controlId));
      }
      if (split && item.controlId === split.controlId) {
        dispatch(changeSplit({ controlId: null, particleSizeType: 0 }));
      }
      if (rightSplit && item.controlId === rightSplit.controlId) {
        dispatch(changeRightSplit({ controlId: null, particleSizeType: 0 }));
      }
      if (item.controlId === _.get(config, 'min.controlId')) {
        dispatch(changeConfig({ min: null }));
      }
      if (item.controlId === _.get(config, 'max.controlId')) {
        dispatch(changeConfig({ max: null }));
      }
      if (_.find(targetList, { controlId: item.controlId })) {
        const index = _.findIndex(targetList, { controlId: item.controlId });
        dispatch(removeTargetValueAxis(index));
      }
      const lineItem = _.find(lines, { controlId: item.controlId });
      const columnItem = _.find(columns, { controlId: item.controlId });
      if (lineItem) {
        dispatch(removeLines(lineItem));
      }
      if (columnItem) {
        dispatch(removeColumns(columnItem));
      }
    }
  }
}

export const removeXaxes = () => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { xaxes, sorts, reportType } = currentReport;
    const id = xaxes.particleSizeType ? `${xaxes.controlId}-${xaxes.particleSizeType}` : xaxes.controlId;
    const data = {
      xaxes: {
        ...xaxes,
        controlId: null,
        controlName: null,
        controlType: null,
        emptyType: 0,
        particleSizeType: 0,
        xaxisEmpty: false,
      },
      sorts: sorts.filter(item => _.findKey(item) !== id)
    }
    if (reportType === reportTypes.FunnelChart) {
      data.displaySetup = {
        ...currentReport.displaySetup,
        showOptionIds: []
      }
    }
    dispatch(changeCurrentReport(data, true));
  }
}

export const addXaxes = (control, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { xaxes, displaySetup, reportType } = currentReport;
    const isTime = isTimeControl(control.type);
    const isArea = isAreaControl(control.type);
    const showtype = _.get(control, 'advancedSetting.showtype');

    const data = {
      xaxes: {
        ...xaxes,
        controlId: control.controlId,
        controlName: control.controlName,
        controlType: control.type,
        particleSizeType: isTime || isArea ? 1 : 0,
        emptyType: 0,
        xaxisEmpty: false,
      },
      displaySetup: {
        ...displaySetup,
        xdisplay: {
          ...displaySetup.xdisplay,
          title: reportType === reportTypes.ScatterChart ? displaySetup.xdisplay.title : control.controlName,
        }
      }
    }
    if (isTime && showtype === '4') {
      data.xaxes.particleSizeType = 3;
    }
    if (isTime && showtype === '5') {
      data.xaxes.particleSizeType = 5;
    }
    if (control.type === WIDGETS_TO_API_TYPE_ENUM.TIME) {
      data.xaxes.particleSizeType = 6;
    }
    if (isArea) {
      data.country = {
        filterCode: "",
        filterCodeName: "",
        municipality: false,
        particleSizeType: 1
      }
    }
    dispatch(changeCurrentReport(data, isRequest));
  }
}

export const addValueAxis = (key, control, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { advancedSetting = {} } = control;
    const isPercent = advancedSetting.numshow === '1';
    const isNumber = isNumberControl(control.type, false);
    const { config } = currentReport;
    const data = {
      config: {
        ...config,
        [key]: {
          controlId: control.controlId,
          controlName: control.controlName,
          controlType: control.type,
          magnitude: isPercent ? 7 : 0,
          suffix: isPercent ? '%' : '',
          ydot: isPercent ? 0 : 2,
          normType: isNumber ? 1 : 5,
          emptyShowType: 0,
          dot: control.dot,
          rename: '',
          value: undefined
        }
      }
    }
    dispatch(changeCurrentReport(data, isRequest));
  }
}


export const addTargetValueAxis = (index, control) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { advancedSetting = {} } = control;
    const isPercent = advancedSetting.numshow === '1';
    const isNumber = isNumberControl(control.type, false);
    const { config } = currentReport;
    const targetList = config.targetList || [];
    const data = {
      controlId: control.controlId,
      controlName: control.controlName,
      controlType: control.type,
      magnitude: isPercent ? 7 : 0,
      suffix: isPercent ? '%' : '',
      ydot: isPercent ? 0 : 2,
      normType: isNumber ? 1 : 5,
      emptyShowType: 0,
      dot: control.dot,
      rename: '',
    }
    targetList[index] = data;
    dispatch(changeConfig({
      targetList
    }));
  }
}

export const removeTargetValueAxis = (index, control) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { targetList } = currentReport.config;
    targetList[index] = null;
    dispatch(changeConfig({
      targetList
    }));
  }
}

export const changeConfig = (data, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const config = {
      ...currentReport.config,
      ...data,
    }
    dispatch(changeCurrentReport({ config }, isRequest));
  }
}

export const addYaxisList = (data, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { yaxisList, reportType, pivotTable } = currentReport;
    const { advancedSetting = {} } = data;
    const isPercent = advancedSetting.numshow === '1';
    const isNumber = isNumberControl(data.type, false);
    const axis = {
      controlId: data.controlId,
      controlName: data.controlName,
      controlType: data.type,
      magnitude: isPercent ? 7 : 0,
      suffix: isPercent ? '%' : '',
      ydot: isPercent ? 0 : 2,
      normType: isNumber ? 1 : 5,
      emptyShowType: 0,
      dot: data.dot,
      rename: '',
    }
    const newYaxisList = yaxisList.concat(axis);
    if (reportType === reportTypes.PivotTable) {
      const { lineSummary, columnSummary } = pivotTable;
      const sumData = {
        controlId: data.controlId,
        name: '',
        sum: 0,
        type: 1
      }
      const columnControlList = columnSummary.controlList || [];
      const lineControlList = lineSummary.controlList || [];
      dispatch(changeYaxisList({
        pivotTable: {
          ...pivotTable,
          columnSummary: {
            ...columnSummary,
            controlList: columnControlList.concat(sumData)
          },
          lineSummary: {
            ...lineSummary,
            controlList: lineControlList.concat(sumData)
          }
        },
        yaxisList: newYaxisList
      }, isRequest));
    } else {
      dispatch(changeYaxisList({ yaxisList: newYaxisList }, isRequest));
    }
  }
}

export const addIndexYaxisList = (data, index, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { yaxisList, displaySetup } = currentReport;
    const { advancedSetting = {} } = data;
    const isPercent = advancedSetting.numshow === '1';
    const isNumber = isNumberControl(data.type, false);
    const axis = {
      controlId: data.controlId,
      controlName: data.controlName,
      controlType: data.type,
      magnitude: isPercent ? 7 : 0,
      suffix: isPercent ? '%' : '',
      ydot: isPercent ? 0 : 2,
      normType: isNumber ? 1 : 5,
      emptyShowType: 0,
      dot: data.dot,
      rename: '',
    }
    if (index === 0) {
      displaySetup.xdisplay.title = data.controlName;
    }
    if (index === 1) {
      displaySetup.ydisplay.title = data.controlName;
    }
    yaxisList[index] = axis;
    dispatch(changeYaxisList({
      yaxisList,
      displaySetup
    }, isRequest));
  }
}


export const changeYaxisList = (data, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { reportType, displaySetup } = currentReport;
    const { yaxisList = [], sorts = [] } = data;
    const title = yaxisList.length ? _.get(yaxisList[0], 'controlName') : null;
    if (reportType === reportTypes.TopChart) {
      const defaultSorts = yaxisList.length ? [{ [yaxisList[0].controlId]: 2 }] : [];
      data.sorts = sorts.length ? sorts : defaultSorts;
    }
    dispatch(changeCurrentReport({
      ...data,
      displaySetup: {
        ...displaySetup,
        ydisplay: {
          ...displaySetup.ydisplay,
          title: reportType === reportTypes.ScatterChart ? displaySetup.ydisplay.title : title,
        },
        isPerPile: yaxisList.length <= 1 ? false : displaySetup.isPerPile,
        isPile: yaxisList.length <= 1 ? false : displaySetup.isPile
      }
    }, isRequest));
  }
}

export const removeYaxisList = (id) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { yaxisList, split, sorts, reportType, pivotTable, summary, config } = currentReport;
    const newYaxisList = yaxisList.filter(item => item.controlId !== id);
    const data = {
      yaxisList: newYaxisList,
      split: {
        ...split,
        controlId: newYaxisList.length ? split.controlId : ''
      },
      sorts: sorts.filter(item => _.findKey(item) !== id)
    }
    if (reportType === reportTypes.PivotTable) {
      const { lineSummary, columnSummary } = pivotTable;
      const columnControlList = columnSummary.controlList || [];
      const lineControlList = lineSummary.controlList || [];
      data.pivotTable = {
        ...pivotTable,
        columnSummary: {
          ...columnSummary,
          controlList: columnControlList.filter(item => item.controlId !== id)
        },
        lineSummary: {
          ...lineSummary,
          controlList: lineControlList.filter(item => item.controlId !== id)
        }
      }
    }
    if (id === summary.controlId) {
      data.summary = {
        ...summary,
        controlId: ''
      }
    }
    if (reportType === reportTypes.ProgressChart) {
      const targetList = config.targetList || [];
      const index = _.findIndex(yaxisList, { controlId: id });
      data.config = {
        ...config,
        targetList: targetList.filter((_, i) => i !== index)
      }
    }
    dispatch(changeYaxisList(data));
  }
}

export const changeSplit = (data, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { sorts, split } = currentReport;
    const showtype = _.get(split, 'advancedSetting.showtype');
    const deleteId = split.controlId ? (split.particleSizeType ? `${split.controlId}-${split.particleSizeType}` : split.controlId) : null;
    const param = {
      splitId: null,
      split: {
        ...split,
        ...data
      }
    }
    if (data.controlId) {
      param.split.controlId = data.controlId;
      param.split.controlName = data.controlName;
      param.split.controlType = data.type;
      const isTime = isTimeControl(data.type);
      const isArea = isAreaControl(data.type);
      if (isTime) {
        if (data.type === WIDGETS_TO_API_TYPE_ENUM.TIME) {
          param.split.particleSizeType = 11;
        } else {
          param.split.particleSizeType = 10;
        }
      }
      if (isArea) {
        param.split.particleSizeType = 1;
      }
    }
    if (deleteId) {
      param.sorts = sorts.filter(item => _.findKey(item) !== deleteId);
    }
    dispatch(changeCurrentReport(param, isRequest));
  }
}

export const addRightYaxisList = (data, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { rightY } = currentReport;
    const { yaxisList } = rightY;
    const isNumber = isNumberControl(data.type, false);
    const axis = {
      controlId: data.controlId,
      controlName: data.controlName,
      controlType: data.type,
      magnitude: 0,
      suffix: '',
      ydot: 2,
      normType: isNumber ? 1 : 5,
      emptyShowType: 0,
      dot: data.dot,
      rename: '',
    }
    const newYaxisList = yaxisList.concat(axis);
    dispatch(changeRightYaxisList({ yaxisList: newYaxisList }, isRequest));
  }
}

export const changeRightYaxisList = (data, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { rightY } = currentReport;
    const { yaxisList, split, sorts } = data;
    const title = yaxisList.length ? yaxisList[0].controlName : null;
    dispatch(changeCurrentReport({
      sorts: sorts ? sorts : currentReport.sorts,
      rightY: {
        ...rightY,
        yaxisList,
        split: split ? split : rightY.split,
        display: {
          ...rightY.display,
          ydisplay: {
            ...rightY.display.ydisplay,
            title
          }
        }
      }
    }, isRequest));
  }
}

export const removeRightYaxisList = (id) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { sorts, rightY } = currentReport;
    const { yaxisList, split } = rightY;
    const newYaxisList = yaxisList.filter(item => item.controlId !== id);
    dispatch(changeRightYaxisList({
      yaxisList: newYaxisList,
      split: {
        ...split,
        controlId: newYaxisList.length ? split.controlId : ''
      },
      sorts: sorts.filter(item => _.findKey(item) !== id)
    }));
  }
}

export const changeRightSplit = (data, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { sorts, rightY } = currentReport;
    const split = rightY.split;
    const deleteId = split.controlId ? (split.particleSizeType ? `${split.controlId}-${split.particleSizeType}` : split.controlId) : null;
    const param = {
      rightY: {
        ...rightY,
        splitId: null,
        split: {
          ...split,
          ...data
        }
      }
    }
    if (deleteId) {
      param.sorts = sorts.filter(item => _.findKey(item) !== deleteId);
    }
    dispatch(changeCurrentReport(param, isRequest));
  }
}

export const addLines = (data, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { pivotTable } = currentReport;
    const { lines, columns } = pivotTable;
    const isTime = isTimeControl(data.type);
    const isArea = isAreaControl(data.type);
    const showtype = _.get(data, 'advancedSetting.showtype');
    const axis = {
      controlId: data.controlId,
      controlName: data.controlName,
      controlType: data.type,
    }
    if (isTime || isArea) {
      const disableParticleSizeTypes = [...lines, ...columns].filter(item => item.particleSizeType).map(item => `${item.controlId}-${item.particleSizeType}`);
      const dropdownData = isTime ? filterTimeParticleSizeDropdownData(showtype, data.type) : areaParticleSizeDropdownData;
      const newDisableParticleSizeTypes = filterDisableParticleSizeTypes(data.controlId, disableParticleSizeTypes);
      const allowTypes = dropdownData.map(item => item.value).filter(item => !newDisableParticleSizeTypes.includes(item));
      if (allowTypes.length) {
        axis.particleSizeType = allowTypes[0];
      } else {
        alert(_l('不允许添加重复粒度'), 2);
        return;
      }
    }
    dispatch(changeCurrentReport({
      pivotTable: {
        ...currentReport.pivotTable,
        lines: lines.concat(axis),
      }
    }, isRequest));
  }
}

export const removeLines = ({ controlId, particleSizeType }) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { pivotTable, sorts } = currentReport;
    const { lines } = pivotTable;
    const id = particleSizeType ? `${controlId}-${particleSizeType}` : controlId;
    const list = lines.filter(item => {
      if (item.particleSizeType) {
        return item.controlId == controlId ? item.particleSizeType !== particleSizeType : true;
      } else {
        return item.controlId !== controlId;
      }
    });
    dispatch(changeCurrentReport({
      pivotTable: {
        ...pivotTable,
        lines: list
      },
      sorts: sorts.filter(item => _.findKey(item) !== id)
    }, true));
  }
}

export const addColumns = (data, isRequest = true) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { pivotTable } = currentReport;
    const { lines, columns } = pivotTable;
    const isTime = isTimeControl(data.type);
    const isArea = isAreaControl(data.type);
    const showtype = _.get(data, 'advancedSetting.showtype');
    const axis = {
      controlId: data.controlId,
      controlName: data.controlName,
      controlType: data.type,
    }
    if (isTime || isArea) {
      const disableParticleSizeTypes = [...lines, ...columns].filter(item => item.particleSizeType).map(item => `${item.controlId}-${item.particleSizeType}`);
      const dropdownData = isTime ? filterTimeParticleSizeDropdownData(showtype, data.type) : areaParticleSizeDropdownData;
      const newDisableParticleSizeTypes = filterDisableParticleSizeTypes(data.controlId, disableParticleSizeTypes);
      const allowTypes = dropdownData.map(item => item.value).filter(item => !newDisableParticleSizeTypes.includes(item));
      if (allowTypes.length) {
        axis.particleSizeType = allowTypes[0];
      } else {
        alert(_l('不允许添加重复粒度'), 2);
        return;
      }
    }
    dispatch(changeCurrentReport({
      pivotTable: {
        ...currentReport.pivotTable,
        columns: columns.concat(axis),
      }
    }, isRequest));
  }
}

export const removeColumns = ({ controlId, particleSizeType }) => {
  return (dispatch, getState) => {
    const { currentReport } = getState().statistics;
    const { pivotTable, sorts } = currentReport;
    const { columns } = pivotTable;
    const id = particleSizeType ? `${controlId}-${particleSizeType}` : controlId;
    const list = columns.filter(item => {
      if (item.particleSizeType) {
        return item.controlId == controlId ? item.particleSizeType !== particleSizeType : true;
      } else {
        return item.controlId !== controlId;
      }
    });
    dispatch(changeCurrentReport({
      pivotTable: {
        ...pivotTable,
        columns: list
      },
      sorts: sorts.filter(item => _.findKey(item) !== id)
    }, true));
  }
}

export const changeDirection = (value) => {
  return (dispatch, getState) => {
    const { direction, reportData } = getState().statistics;
    const style = reportData.style || {};
    const newDirection = value ? value : (direction === 'vertical' ? 'horizontal' : 'vertical');
    sessionStorage.setItem('chartSheetDirection', newDirection);
    dispatch({
      type: 'CHANGE_STATISTICS_DIRECTION',
      data: newDirection
    });
    if (newDirection === 'vertical' && style.pivotTableColumnFreeze) {
      dispatch(getReportData());
    }
  }
}

export const destroy = () => {
  if (reportConfigDetailRequest && reportConfigDetailRequest.state() === 'pending') {
    reportConfigDetailRequest.abort();
  }
  if (reportConfigRequest && reportConfigRequest.state() === 'pending') {
    reportConfigRequest.abort();
  }
  if (reportRequest && reportRequest.state() === 'pending') {
    reportRequest.abort();
  }
  if (worksheetInfoRequest && worksheetInfoRequest.state() === 'pending') {
    worksheetInfoRequest.abort();
  }
  if (worksheetFilterByIdRequest && worksheetFilterByIdRequest.state() === 'pending') {
    worksheetFilterByIdRequest.abort();
  }
  return (dispatch, getState) => {
    dispatch({
      type: 'CHANGE_STATISTICS_RESET',
      data: null
    });
  }
}


