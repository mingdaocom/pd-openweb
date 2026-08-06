import _ from 'lodash';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { getTranslateInfo } from 'src/utils/app';
import { reportTypes } from '../Charts/reportTypes';
import { normTypes } from '../enum';
import { isOptionControl, isTimeControl } from './controlUtils';

export function getIsAlienationColor(currentReport) {
  const { reportType, xaxes, yaxisList, split } = currentReport;
  const splitId = split ? split.controlId : null;
  return (
    [reportTypes.BarChart, reportTypes.PieChart].includes(reportType) &&
    !_.isEmpty(xaxes.options) &&
    !isTimeControl(xaxes.controlType) &&
    yaxisList.length === 1 &&
    _.isEmpty(splitId)
  );
}

/**
 * 过滤 x 轴的 controls 数据
 */

export const fillMapKey = result => {
  const { map } = result;
  result.map = (map || []).map(item => {
    item.key = !item.key || item.key === 'null' ? _l('空') : item.key;
    return item;
  });
  return result;
};

/**
 * 把 valueMap 的 key 填充到 map 和 contrastMap
 */
export const fillValueMap = (result, pageId) => {
  if (result.status <= 0) {
    return result;
  }

  if (_.isNull(result.style)) {
    result.style = {};
  }

  const { valueMap = {}, reportType, xaxes, split, rightY } = fillTranslate(result, pageId);
  const splitId = split ? split.controlId : '';

  if ([reportTypes.PivotTable].includes(reportType)) {
    result.map = [];
    return result;
  }

  const xaxisValueMap = valueMap[xaxes.controlId];
  const splitIdValueMap = valueMap[splitId];

  if (reportType === reportTypes.PieChart && xaxes.controlId) {
    result.map = result.map.map(data => {
      const value = data.value.map(item => {
        return {
          ...item,
          originalX: item.x,
          x: _.isEmpty(xaxisValueMap) ? item.x : xaxisValueMap[item.x] || item.x,
        };
      });
      return {
        ...data,
        value,
      };
    });

    return fillDealMaskValueMap(result);
  }

  if ([reportTypes.FunnelChart, reportTypes.LineChart].includes(reportType)) {
    result.contrastMap.forEach(control => {
      control.originalKey = control.key;
      control.value.forEach(item => {
        item.originalX = item.x;
        item.x = _.isEmpty(xaxisValueMap) ? item.x : xaxisValueMap[item.x] || item.x;
      });
      return control;
    });
  }

  if ([reportTypes.NumberChart].includes(reportType)) {
    result.contrast.forEach(control => {
      control.value.forEach(item => {
        item.originalX = item.x;
        item.x = _.isEmpty(xaxisValueMap) ? item.x : xaxisValueMap[item.x] || item.x;
      });
      return control;
    });
    result.contrastMap.forEach(control => {
      control.value.forEach(item => {
        item.originalX = item.x;
        item.x = _.isEmpty(xaxisValueMap) ? item.x : xaxisValueMap[item.x] || item.x;
      });
      return control;
    });
  }

  if ([reportTypes.CountryLayer, reportTypes.WorldMap].includes(reportType)) {
    result.contrastMap = [];
    result.map.forEach(item => {
      item.name = _.isEmpty(xaxisValueMap) ? item.code : xaxisValueMap[item.code] || item.code;
    });
    return result;
  }

  if ([reportTypes.DualAxes, reportTypes.BidirectionalBarChart].includes(reportType)) {
    const rightSplitIdValueMap = valueMap[rightY.split.controlId];
    result.contrastMap.forEach(control => {
      control.originalKey = control.key;
      control.key = _.isEmpty(rightSplitIdValueMap) ? control.key : rightSplitIdValueMap[control.key] || control.key;
      control.value.forEach(item => {
        item.originalX = item.x;
        item.x = _.isEmpty(xaxisValueMap) ? item.x : xaxisValueMap[item.x] || item.x;
      });
      return control;
    });
  }

  if ([reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType)) {
    return result;
  }

  result.map.forEach(control => {
    control.originalKey = control.key;
    control.key = _.isEmpty(splitIdValueMap) ? control.key : splitIdValueMap[control.key] || control.key;
    control.value.forEach(item => {
      item.originalX = item.x;
      item.x = _.isEmpty(xaxisValueMap) ? item.x : xaxisValueMap[item.x] || item.x;
    });
    return control;
  });

  return fillDealMaskValueMap(result);
};

const fillTranslate = (result, pageId) => {
  const appId = _.get(window.appInfo, 'id');

  if (!appId) {
    return result;
  }

  const parentId = pageId ? pageId : result.appId;

  const getParentId = control => {
    if (control.dataSource && control.dataSource.length === 24) {
      return control.dataSource;
    } else {
      return result.appId;
    }
  };

  const translateValueMap = (dataSource, controlId, displayMode) => {
    const isFieldStyle = displayMode === 'fieldStyle';
    const valueMapTranslateInfo = getTranslateInfo(appId, null, dataSource);

    if (!_.isEmpty(valueMapTranslateInfo)) {
      const map = result.valueMap[controlId] || {};

      for (let key in map) {
        if (map[key] && valueMapTranslateInfo[key]) {
          if (isFieldStyle) {
            const object = window.safeParse(map[key]);
            map[key] = JSON.stringify({
              ...object,
              value: valueMapTranslateInfo[key],
            });
          } else {
            map[key] = valueMapTranslateInfo[key];
          }
        }
      }
    }
  };

  const chartTranslateInfo = getTranslateInfo(appId, parentId, result.reportId);

  if (result.xaxes && result.xaxes.controlId) {
    result.xaxes.rename = result.xaxes.rename
      ? chartTranslateInfo[`xaxes-${result.xaxes.controlId}-name`] || result.xaxes.rename
      : '';
    result.xaxes.controlName =
      getTranslateInfo(appId, parentId, result.xaxes.controlId).name || result.xaxes.controlName;
    if (result.map && result.map.length) {
      result.map.forEach(item => {
        item.key = getTranslateInfo(appId, parentId, item.c_id).name || item.key;
      });
    }

    if (result.contrastMap && result.contrastMap.length) {
      result.contrastMap.forEach(item => {
        item.key = getTranslateInfo(appId, parentId, item.c_id).name || item.key;
      });
    }
  }

  if (result.yaxisList && result.yaxisList.length) {
    result.yaxisList.forEach(item => {
      item.rename = item.rename ? chartTranslateInfo[`yaxis-${item.controlId}-name`] || item.rename : '';
      item.controlName = getTranslateInfo(appId, getParentId(item), item.controlId).name || item.controlName;
    });
  }

  if (result.rightY && _.get(result.rightY, 'yaxisList.length')) {
    result.rightY.yaxisList.forEach(item => {
      item.rename = item.rename ? chartTranslateInfo[`rightYaxis-${item.controlId}-name`] || item.rename : '';
      item.controlName = getTranslateInfo(appId, getParentId(item), item.controlId).name || item.controlName;
    });
    if (result.rightY.summary) {
      result.rightY.summary.name = result.rightY.summary.name
        ? chartTranslateInfo.rightYSummaryName || result.rightY.summary.name
        : '';
      (result.rightY.summary.controlList || []).forEach(item => {
        item.name = item.name ? chartTranslateInfo[`rightYSummaryControl-${item.controlId}-name`] || item.name : '';
      });
    }

    if (result.rightY.display && result.rightY.display.ydisplay.title) {
      result.rightY.display.ydisplay.title =
        chartTranslateInfo.rightYdisplayTitle || result.rightY.display.ydisplay.title;
    }
  }

  if (result.lines && result.lines.length) {
    result.lines.forEach(item => {
      item.rename = item.rename ? chartTranslateInfo[`line-${item.controlId}-name`] || item.rename : '';
      if (item.fields) {
        item.fields = item.fields.map(f => {
          return {
            ...f,
            controlName: getTranslateInfo(appId, getParentId(item), f.controlId).name || f.controlName,
          };
        });
      }

      if (item.dataSource) {
        translateValueMap(
          item.dataSource,
          item.controlId,
          isOptionControl(item.controlType) ? item.displayMode : undefined,
        );
        item.controlName = getTranslateInfo(appId, null, item.dataSource).name || item.controlName;
      } else {
        item.controlName = getTranslateInfo(appId, null, item.controlId).name || item.controlName;
      }
    });
    result.lineSummary.rename = result.lineSummary.rename
      ? chartTranslateInfo.lineSummaryName || result.lineSummary.rename
      : '';
    (result.lineSummary.controlList || []).forEach(item => {
      item.name = item.name ? chartTranslateInfo[`lineSummaryControl-${item.controlId}-name`] || item.name : '';
    });
  }

  if (result.columns && result.columns.length) {
    result.columns.forEach(item => {
      item.rename = item.rename ? chartTranslateInfo[`column-${item.controlId}-name`] || item.rename : '';
      if (item.dataSource) {
        translateValueMap(item.dataSource, item.controlId);
        item.controlName = getTranslateInfo(appId, null, item.dataSource).name || item.controlName;
      } else {
        item.controlName = getTranslateInfo(appId, null, item.controlId).name || item.controlName;
      }
    });
    result.columnSummary.rename = result.columnSummary.rename
      ? chartTranslateInfo.columnSummaryName || result.columnSummary.rename
      : '';
    (result.columnSummary.controlList || []).forEach(item => {
      item.name = item.name ? chartTranslateInfo[`columnSummaryControl-${item.controlId}-name`] || item.name : '';
    });
  }

  if (result.name) {
    result.name = chartTranslateInfo.name || result.name;
  }

  if (result.desc) {
    result.desc = chartTranslateInfo.description || result.desc;
  }

  if (result.summary) {
    result.summary.name = chartTranslateInfo.summaryName || result.summary.name;
    (result.summary.controlList || []).forEach(item => {
      item.name = chartTranslateInfo[`summaryControl-${item.controlId}-name`] || item.name;
    });
  }

  if (result.displaySetup.ydisplay && result.displaySetup.ydisplay.title) {
    result.displaySetup.ydisplay.title = chartTranslateInfo.ydisplayTitle || result.displaySetup.ydisplay.title;
  }

  if (result.reportType === reportTypes.ScatterChart && result.style.quadrant) {
    const quadrant = result.style.quadrant;
    quadrant.topRightText = quadrant.topRightText
      ? chartTranslateInfo.quadrantTopRightText || quadrant.topRightText
      : undefined;
    quadrant.topLeftText = quadrant.topLeftText
      ? chartTranslateInfo.quadrantTopLeftText || quadrant.topLeftText
      : undefined;
    quadrant.bottomLeftText = quadrant.bottomLeftText
      ? chartTranslateInfo.quadrantBottomLeftText || quadrant.bottomLeftText
      : undefined;
    quadrant.bottomRightText = quadrant.bottomRightText
      ? chartTranslateInfo.quadrantBottomRightText || quadrant.bottomRightText
      : undefined;
  }

  if (result.reportType === reportTypes.FunnelChart) {
    result.style.funnelConversionText = result.style.funnelConversionText
      ? chartTranslateInfo.funnelConversionText || result.style.funnelConversionText
      : undefined;
  }

  if (result.reportType === reportTypes.ProgressChart) {
    result.style.currentValueName = result.style.currentValueName
      ? chartTranslateInfo.currentValueName || result.style.currentValueName
      : undefined;
    result.style.targetValueName = result.style.targetValueName
      ? chartTranslateInfo.targetValueName || result.style.targetValueName
      : undefined;
  }

  if (_.get(result, 'split.dataSource')) {
    const splitId = result.split.controlId;
    const relationControl = _.get(result.split, 'relationControl');

    if (relationControl) {
      const relationControlDataSource = _.get(relationControl, 'dataSource');

      // 他表字段
      if (relationControlDataSource) {
        // 选项集
        translateValueMap(relationControlDataSource, splitId);
      } else {
        // 普通
        translateValueMap(_.get(relationControl, 'controlId'), splitId);
      }
    } else {
      // 本表
      translateValueMap(_.get(result, 'split.dataSource'), splitId);
    }
  }

  if (_.get(result, 'xaxes.dataSource')) {
    const xaxesId = result.xaxes.controlId;
    const relationControl = _.get(result, 'xaxes.relationControl');

    if (relationControl) {
      const relationControlDataSource = _.get(relationControl, 'dataSource');

      if (relationControlDataSource) {
        translateValueMap(relationControlDataSource, xaxesId);
      } else {
        translateValueMap(_.get(relationControl, 'controlId'), xaxesId);
      }
    } else {
      translateValueMap(_.get(result, 'xaxes.dataSource'), xaxesId);
    }
  }

  if (result.valueMap) {
    for (let controlId in result.valueMap) {
      const valueMapTranslateInfo = getTranslateInfo(appId, result.appId, controlId);

      if (!_.isEmpty(valueMapTranslateInfo)) {
        const map = result.valueMap[controlId];

        for (let key in map) {
          if (map[key] && valueMapTranslateInfo[key]) {
            map[key] = valueMapTranslateInfo[key];
          }
        }
      }
    }
  }

  return result;
};

/**
 * 配置掩码
 */
const fillDealMaskValueMap = result => {
  const { xaxes } = result;
  const advancedSetting = xaxes.advancedSetting || {};

  if (advancedSetting.datamask === '1') {
    result.map.forEach(control => {
      control.value.forEach(item => {
        item.x = dealMaskValue({ value: item.x, advancedSetting });
      });
      return control;
    });
  }

  return result;
};

/**
 * 合并拿一些后端计算后的值
 */
export const mergeReportData = (currentReport, result, id) => {
  const isBarChart = result.reportType === reportTypes.BarChart;
  const isPivotTable = result.reportType === reportTypes.PivotTable;
  const param = {};

  if (result.status > 0) {
    if (isPivotTable) {
      param.pivotTable = {
        showColumnCount: result.showColumnCount,
        showColumnTotal: result.showColumnTotal,
        showLineCount: result.showLineCount,
        showLineTotal: result.showLineTotal,
        columns: result.columns,
        columnSummary: result.columnSummary,
        lines: result.lines,
        lineSummary: result.lineSummary,
      };
      if (_.isUndefined(_.get(result, 'style.paginationVisible'))) {
        param.style = {
          ...result.style,
          paginationVisible: true,
        };
      }
    } else {
      param.xaxes = result.xaxes;
      param.summary = result.summary;
      if ([reportTypes.DualAxes, reportTypes.BidirectionalBarChart].includes(result.reportType)) {
        param.rightY = {
          ...currentReport.rightY,
          summary: result.rightY.summary,
        };
      }

      const { style, split } = result;
      const isOptionColor = getIsAlienationColor(result) || (isBarChart && _.get(split, 'options.length'));

      if (_.isEmpty(id) && _.isEmpty(style) && isOptionColor) {
        param.style = {
          colorType: 0,
        };
      }
    }
  }

  return param;
};

/**
 * 根据配置信息获取已经选择的控件id
 */

export const formatSummaryName = data => {
  if (_.isEmpty(data.name)) {
    return _.find(normTypes, { value: data.type }).text;
  } else {
    return data.name;
  }
};

/**
 * 为已选的 dropdown item 添加颜色
 */
