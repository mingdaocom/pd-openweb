import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { reportTypes } from './Charts/common';
import report from 'src/pages/worksheet/common/Statistics/api/report';

/**
 * 图表类型数据
 */
export const chartNav = [
  {
    name: _l('柱图'),
    type: reportTypes.BarChart,
    icon: 'stats_bar_chart',
  },
  {
    name: _l('折线图'),
    type: reportTypes.LineChart,
    icon: 'stats_line_chart',
  },
  {
    name: _l('双轴图'),
    type: reportTypes.DualAxes,
    icon: 'stats_biaxial_chart',
  },
  {
    name: _l('雷达图'),
    type: reportTypes.RadarChart,
    icon: 'stats_radar_chart',
  },
  {
    name: _l('饼图'),
    type: reportTypes.PieChart,
    icon: 'stats_pie_chart',
  },
  {
    name: _l('漏斗图'),
    type: reportTypes.FunnelChart,
    icon: 'stats_funnel_chart',
  },
  {
    name: _l('透视表'),
    type: reportTypes.PivotTable,
    icon: 'stats_table_chart',
  },
  {
    name: _l('数值图'),
    type: reportTypes.NumberChart,
    icon: 'stats_numerical_chart',
  },
  {
    name: _l('行政区划'),
    type: reportTypes.CountryLayer,
    icon: 'stats_district_chart',
  },
];

/**
 * 处理 reportConfig.getReportConfigDetail 接口返回的数据
 */
export function initConfigDetail(id, data, currentReport) {
  const { account, createdDate, controls, ...result } = data;
  const { xaxes, displaySetup, summary, yaxisList, rightY, reportType, formulas } = result;

  // 图表 axis 需要的 controls
  const axisControls = controls.map(item => {
    if (item.type === 30) {
      item.type = item.sourceControlType;
    }
    if (item.type === 38) {
      if (item.enumDefault === 1) {
        item.type = 8;
      }
      if (item.enumDefault === 2) {
        item.type = 16;
      }
    } else if (item.type === 37) {
      item.type = item.enumDefault2;
    }
    return item;
  });

  // 兼容双轴排序
  if (reportType === reportTypes.DualAxes && result.sorts.length > 1) {
    result.sorts = result.sorts.map((item, index) => {
      if (index) {
        const key = _.findKey(item);
        return {
          [`${key}-right`]: item[key],
        };
      }
      return item;
    });
  }

  if (id) {
    if (xaxes.controlId) {
      const data = _.find(axisControls, { controlId: xaxes.controlId }) || {};
      xaxes.controlName = data.controlName;
      xaxes.controlType = data.type;
    }
    yaxisList.forEach(item => {
      const control = _.find(axisControls.concat(formulas), { controlId: item.controlId }) || {};;
      item.controlName = control.controlName;
      item.controlType = control.type;
      if (isNumberControl(control.type)) {
        item.dot = control ? control.dot : 0;
      }
    });
    if (rightY) {
      rightY.yaxisList.forEach(item => {
        const control = _.find(axisControls.concat(formulas), { controlId: item.controlId }) || {};;
        item.controlName = control.controlName;
        item.controlType = control.type;
        if (isNumberControl(control.type)) {
          item.dot = control ? control.dot : 0;
        }
      });
      if (_.isEmpty(rightY.display.ydisplay.title) && rightY.yaxisList.length) {
        const { controlName } = rightY.yaxisList[0];
        rightY.display.ydisplay.title = controlName;
      }
    }
    if (displaySetup) {
      if (_.isEmpty(displaySetup.xdisplay.title)) {
        displaySetup.xdisplay.title = xaxes.rename || xaxes.controlName;
      }
      if (_.isEmpty(displaySetup.ydisplay.title) && yaxisList.length) {
        const { controlName } = yaxisList[0];
        displaySetup.ydisplay.title = controlName;
      }
    }
  } else {
    result.name = _l('未命名图表');
    result.filter = {
      filterRangeId: 'ctime',
      filterRangeName: _l('创建时间'),
      rangeType: defaultDropdownScopeData,
    };
  }

  if (summary && _.isEmpty(summary.name)) {
    summary.name = _.find(normTypes, { value: summary.type }).text;
  }
  if (rightY) {
    if (rightY.summary && _.isEmpty(rightY.summary.name)) {
      rightY.summary.name = _.find(normTypes, { value: rightY.summary.type }).text;
    }
    if (_.isEmpty(rightY.summary)) {
      rightY.summary = {
        name: _.find(normTypes, { value: 1 }).text,
      };
    }
  }

  if (!_.isEmpty(currentReport)) {
    result.name = currentReport.name;
    result.filter = currentReport.filter;
    result.yaxisList = currentReport.yaxisList.length ? [currentReport.yaxisList[0]] : [];
    result.formulas = currentReport.formulas;
    const defaultXaxes = {
      controlName: _l('拥有者'),
      controlId: 'ownerid',
      controlType: 0,
      isEmpty: true,
      particleSizeType: 1,
      rename: '',
      sortType: 0,
    };
    if (reportType === reportTypes.DualAxes) {
      rightY.yaxisList = currentReport.yaxisList.length ? [currentReport.yaxisList[0]] : [];
    }
    if ([reportTypes.RadarChart, reportTypes.FunnelChart].includes(reportType)) {
      if (currentReport.xaxes && isTimeControl(currentReport.xaxes.controlType)) {
        result.xaxes = defaultXaxes;
      } else {
        result.xaxes = currentReport.xaxes;
      }
    } else if (reportTypes.CountryLayer === reportType) {
      const areaAxisControls = axisControls.filter(item => isAreaControl(item.type));
      if (areaAxisControls.length) {
        const xaxis = areaAxisControls[0];
        result.xaxes = {
          ...defaultXaxes,
          controlName: xaxis.controlName,
          controlId: xaxis.controlId,
        };
      } else {
        result.xaxes = {};
      }
    } else if (reportTypes.PivotTable === reportType) {
      result.pivotTable.lines = currentReport.xaxes.controlId ? [currentReport.xaxes] : [];
    } else if (reportTypes.NumberChart === reportType) {
      result.xaxes = {};
    } else {
      result.xaxes = currentReport.xaxes;
    }
    if (result.displaySetup) {
      result.displaySetup.xdisplay.title = result.xaxes ? result.xaxes.controlName : null;
      result.displaySetup.ydisplay.title = result.yaxisList.length ? result.yaxisList[0].controlName : '';
    }
  }

  return {
    currentReport: result,
    axisControls,
  };
}

/**
 * 只有满足柱图、x轴非时间控件、y数值只有一个、没有拆分时才能异化颜色配置
 */
export function getIsAlienationColor(currentReport) {
  const { reportType, xaxes, yaxisList, splitId } = currentReport;
  return [reportTypes.BarChart, reportTypes.PieChart].includes(reportType) && !_.isEmpty(xaxes.options) && !isTimeControl(xaxes.controlType) && yaxisList.length === 1 && _.isEmpty(splitId);
}

/**
 * 过滤 x 轴的 controls 数据
 */
export function filterXAxisControls(controls) {
  return controls.filter(
    item =>
      item.type !== WIDGETS_TO_API_TYPE_ENUM.NUMBER &&
      item.type !== WIDGETS_TO_API_TYPE_ENUM.MONEY &&
      item.type !== WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER &&
      item.type !== WIDGETS_TO_API_TYPE_ENUM.REMARK &&
      item.type !== WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT &&
      item.type !== 10000000 &&
      item.type !== 0,
  );
}

/**
 * 判断能否作为 x 轴的字段
 */
export function isXAxisControl(type) {
  return (
    // type !== WIDGETS_TO_API_TYPE_ENUM.NUMBER &&
    // type !== WIDGETS_TO_API_TYPE_ENUM.MONEY &&
    // type !== WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER &&
    type !== WIDGETS_TO_API_TYPE_ENUM.REMARK &&
    type !== WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT &&
    type !== 10000000 &&
    type !== 10000001 &&
    type !== 0
  );
}

/**
 * 获取字段排序图表数据
 */
export function getSortData(control) {
  const { type, enumDefault } = control;
  const descendingValue = 1;
  const ascendingValue = 2;
  if (
    type === WIDGETS_TO_API_TYPE_ENUM.NUMBER ||
    type === WIDGETS_TO_API_TYPE_ENUM.MONEY ||
    type === WIDGETS_TO_API_TYPE_ENUM.AUTO_ID ||
    type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST ||
    type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER ||
    (type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET && enumDefault === 2) ||
    type === 10000000
  ) {
    return [
      {
        text: '1 - 9',
        value: descendingValue,
      },
      {
        text: '9 - 1',
        value: ascendingValue,
      },
    ];
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.DATE || type === WIDGETS_TO_API_TYPE_ENUM.DATE_TIME) {
    return [
      {
        text: _l('从早到晚'),
        value: descendingValue,
      },
      {
        text: _l('从晚到早'),
        value: ascendingValue,
      },
    ];
  } else if (
    type === WIDGETS_TO_API_TYPE_ENUM.TEXT ||
    type === WIDGETS_TO_API_TYPE_ENUM.CONCATENATE ||
    type === WIDGETS_TO_API_TYPE_ENUM.AUTO_ID ||
    type === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT ||
    type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER ||
    (type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET && enumDefault === 1)
  ) {
    return [
      {
        text: 'A → Z',
        value: descendingValue,
      },
      {
        text: 'Z → A',
        value: ascendingValue,
      },
    ];
  } else if (
    type === WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT ||
    type === WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN ||
    type === WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU ||
    type === WIDGETS_TO_API_TYPE_ENUM.SCORE
  ) {
    return [
      {
        text: _l('正序'),
        value: descendingValue,
      },
      {
        text: _l('倒序'),
        value: ascendingValue,
      },
    ];
  }
  return null;
}

/**
 * 调整 sorts 顺序
 */
export const formatSorts = (sorts, ids, ySameList = []) => {
  const reuslt = [];
  ids
    .filter(id => id)
    .forEach(id => {
      const item = _.find(sorts, id);
      if (item) {
        const key = _.findKey(item);
        const newKey = key.replace('-right', '');
        const value = item[key];
        // 兼容双轴相同维度的情况
        if (ySameList.includes(newKey)) {
          if (key.includes('-right')) {
            reuslt.push(
              {
                [newKey]: 0,
              },
              {
                [newKey]: value,
              },
            );
          } else {
            reuslt.push(
              {
                [newKey]: value,
              },
              {
                [newKey]: 0,
              },
            );
          }
        } else {
          if (key.includes('-right')) {
            reuslt.push({
              [newKey]: value,
            });
          } else {
            reuslt.push(item);
          }
        }
      }
    });
  return reuslt;
};

/**
 * 判断是否自定义排序（只有文本和选项字段能自定义）
 */
export const isCustomSort = ({ type, enumDefault }) => {
  if (
    type === WIDGETS_TO_API_TYPE_ENUM.TEXT ||
    type === WIDGETS_TO_API_TYPE_ENUM.CONCATENATE ||
    type === WIDGETS_TO_API_TYPE_ENUM.AUTO_ID ||
    type === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT ||
    type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER ||
    type === WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT ||
    type === WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN ||
    type === WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU ||
    (type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET && enumDefault === 1)
  ) {
    return true;
  } else {
    return false;
  }
};

/**
 * 导出透视表
 */
export const exportPivotTable = (reportId, pageId) => {
  report
    .export({
      reportId,
      pageId,
    })
    .then(result => {
      if (!result) {
        alert(_l('导出错误'), 2);
      }
    })
    .fail(error => {
      alert(error, 2);
    });
};

export const defaultDropdownScopeData = 8;

/**
 * 处理数据对比的周期文案
 */
export const formatContrastTypes = ({ rangeType, rangeValue }) => {
  const base = [{ text: _l('无'), value: 0 }];
  const last = { text: _l('与上一年相比'), value: 2 };
  const contrast = dropdownScopeData.filter(item => item.value === rangeType)[0];
  const { text } = contrast;
  switch (rangeType) {
    case 0:
      // 全部
      base.push(Object.assign(last, { disabled: true }));
      break;
    case 1:
      // 今天
      base.push({ text: _l('与昨天相比'), value: 1 }, last);
      break;
    case 2:
      // 昨天
      base.push({ text: _l('与前一天相比'), value: 1 }, last);
      break;
    case 3:
      // 明天
      base.push({ text: _l('与今天相比'), value: 1 }, last);
      break;
    case 4:
    case 5:
    case 6:
      // 周
      base.push({ text: _l('与上周相比'), value: 1 }, last);
      break;
    case 8:
    case 9:
    case 10:
      // 月
      base.push({ text: _l('与上个月相比'), value: 1 }, last);
      break;
    case 11:
    case 12:
    case 13:
      // 季度
      base.push({ text: _l('与上个季度相比'), value: 1 }, last);
      break;
    case 15:
    case 16:
    case 17:
      // 年
      base.push(last);
      break;
    case 18:
    case 19:
      base.push({ text: _l('与之前的%0天相比', rangeValue), value: 1 }, last);
      break;
    case 20:
      const [start, end] = rangeValue.split('-');
      const startDate = moment(start.replace(/\//gi, '-'));
      const endDate = moment(end.replace(/\//gi, '-'));
      const diff = endDate.diff(startDate, 'days');
      base.push({ text: _l('与之前的%0天相比', diff), value: 1 }, last);
      break;
    default:
      break;
  }
  return base;
};

/**
 * 统计范围
 */
export const dropdownScopeData = [
  {
    text: _l('全部'),
    value: 0,
  },
  {
    text: _l('今天'),
    value: 1,
  },
  {
    text: _l('昨天'),
    value: 2,
  },
  {
    text: _l('明天'),
    value: 3,
  },
  {
    text: _l('本周'),
    value: 4,
  },
  {
    text: _l('上周'),
    value: 5,
  },
  {
    text: _l('下周'),
    value: 6,
  },
  {
    text: _l('本月'),
    value: 8,
  },
  {
    text: _l('上月'),
    value: 9,
  },
  {
    text: _l('下月'),
    value: 10,
  },
  {
    text: _l('本季度'),
    value: 11,
  },
  {
    text: _l('上季度'),
    value: 12,
  },
  {
    text: _l('下季度'),
    value: 13,
  },
  {
    text: _l('本年'),
    value: 15,
  },
  {
    text: _l('上一年'),
    value: 16,
  },
  {
    text: _l('下一年'),
    value: 17,
  },
  {
    text: _l('过去...天'),
    value: 18,
  },
  {
    text: _l('未来...天'),
    value: 19,
  },
  {
    text: _l('自定义时间'),
    value: 20,
    type: 'hr',
  },
];

/**
 * 是否是 过去...天 & 未来...天
 */
export const isPastAndFuture = value => {
  return value === 18 || value === 19;
};

/**
 * 是否是时间控件
 */
export const isTimeControl = (value, controls = []) => {
  const data = _.find(controls, { controlId: value });
  if (_.isEmpty(data)) {
    return value === WIDGETS_TO_API_TYPE_ENUM.DATE || value === WIDGETS_TO_API_TYPE_ENUM.DATE_TIME;
  } else {
    return data.type === WIDGETS_TO_API_TYPE_ENUM.DATE || data.type === WIDGETS_TO_API_TYPE_ENUM.DATE_TIME;
  }
};

/**
 * 是否是数值和公式控件
 */
export const isNumberControl = (type, isIncludeRecord = true) => {
  if (
    type === WIDGETS_TO_API_TYPE_ENUM.NUMBER ||
    type === WIDGETS_TO_API_TYPE_ENUM.MONEY ||
    type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER ||
    (isIncludeRecord && type === 10000000) ||
    (isIncludeRecord && type === 10000001)
  ) {
    return true;
  } else {
    return false;
  }
};

/**
 * 是否是关联记录
 */
export const isRelateSheetControl = type => {
  return type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET;
}

/**
 * 是否是地区控件
 */
export const isAreaControl = type => {
  return (
    type === WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE ||
    type === WIDGETS_TO_API_TYPE_ENUM.AREA_CITY ||
    type === WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY
  );
};

/**
 * 是否是选项控件
 */
export const isOptionControl = type => {
  return (
    type === WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU ||
    type === WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT ||
    type === WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN ||
    type === WIDGETS_TO_API_TYPE_ENUM.SCORE
  );
};

/**
 * 获取图表 axis 文案
 */
export const getAxisText = (reportType, showChartType) => {
  const isBarChart = reportType === reportTypes.BarChart && showChartType === 2;
  if (
    [
      reportTypes.RadarChart,
      reportTypes.FunnelChart,
      reportTypes.PieChart,
      reportTypes.NumberChart,
      reportTypes.CountryLayer,
    ].includes(reportType)
  ) {
    return {
      x: _l('维度'),
      y: _l('数值'),
    };
  }
  if ([reportTypes.PivotTable].includes(reportType)) {
    return {
      x: _l('维度(行)'),
      y: _l('维度(列)'),
    };
  }
  return {
    x: isBarChart ? _l('维度(Y轴)') : _l('维度(X轴)'),
    y: isBarChart ? _l('数值(X轴)') : _l('数值(Y轴)'),
  };
};

/**
 * 图表二级类型
 */
export const chartType = {
  [reportTypes.LineChart]: {
    title: _l('图形'),
    items: [
      {
        name: _l('折线'),
        value: 0,
      },
      {
        name: _l('曲线'),
        value: 1,
      },
      {
        name: _l('面积'),
        value: 2,
      },
    ],
  },
  [reportTypes.BarChart]: {
    title: _l('方向'),
    items: [
      {
        name: _l('竖向'),
        value: 1,
      },
      {
        name: _l('横向'),
        value: 2,
      },
    ],
  },
  [reportTypes.FunnelChart]: {
    title: _l('方向'),
    items: [
      {
        name: _l('竖向'),
        value: 1,
      },
      {
        name: _l('横向'),
        value: 2,
      },
    ],
  },
  [reportTypes.CountryLayer]: {
    title: _l('图形'),
    items: [
      {
        name: _l('填充'),
        value: 1,
      },
      {
        name: _l('气泡'),
        value: 2,
      },
    ],
  },
  [reportTypes.PieChart]: {
    title: _l('图形'),
    items: [
      {
        name: _l('环形'),
        value: 1,
      },
      {
        name: _l('饼形'),
        value: 2,
      },
    ],
  },
};

/**
 * 为图表的空数据添加空key值
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
export const fillValueMap = result => {
  const { map, valueMap, reportType, xaxes, splitId, rightY, status } = result;

  if (!status) {
    return result;
  }

  if ([reportTypes.PivotTable, reportTypes.NumberChart].includes(reportType)) {
    result.map = [];
    return result;
  }

  const xaxisValueMap = valueMap[xaxes.controlId];
  const splitIdValueMap = valueMap[splitId];

  if (reportType === reportTypes.PieChart) {
    result.map = [];
    result.aggregations.forEach(item => {
      item.originalX = item.x;
      item.x = _.isEmpty(xaxisValueMap) ? item.x : xaxisValueMap[item.x] || item.x;
    });
    return result;
  }

  if ([reportTypes.FunnelChart, reportTypes.LineChart].includes(reportType)) {
    result.contrastMap.forEach(control => {
      control.value.forEach(item => {
        item.originalX = item.x;
        item.x = _.isEmpty(xaxisValueMap) ? item.x : xaxisValueMap[item.x] || item.x;
      });
      return control;
    });
  }

  if (reportType === reportTypes.CountryLayer) {
    result.contrastMap = [];
    result.map.forEach(item => {
      item.name = _.isEmpty(xaxisValueMap) ? item.code : xaxisValueMap[item.code] || item.code;
    });
    return result;
  }

  if (reportType === reportTypes.DualAxes) {
    const rightSplitIdValueMap = valueMap[rightY.splitId];
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

  result.map.forEach(control => {
    control.originalKey = control.key;
    control.key = _.isEmpty(splitIdValueMap) ? control.key : splitIdValueMap[control.key] || control.key;
    control.value.forEach(item => {
      item.originalX = item.x;
      item.x = _.isEmpty(xaxisValueMap) ? item.x : xaxisValueMap[item.x] || item.x;
    });
    return control;
  });

  return result;
};

/**
 * 合并拿一些后端计算后的值
 */
export const mergeReportData = (currentReport, result, id) => {
  const param = {
    displaySetup: result.displaySetup,
  }
  if (result.status) {
    if (result.reportType === reportTypes.PivotTable) {
      param.pivotTable = {
        showColumnCount: result.showColumnCount,
        showColumnTotal: result.showColumnTotal,
        showLineCount: result.showLineCount,
        showLineTotal: result.showLineTotal,
        columns: result.columns,
        columnSummary: result.columnSummary,
        lines: result.lines,
        lineSummary: result.lineSummary,
      }
    } else {
      param.xaxes = result.xaxes;
      param.summary = result.summary;
      if (result.reportType === reportTypes.DualAxes) {
        param.rightY = {
          ...currentReport.rightY,
          summary: result.rightY.summary,
        };
      }
      if (_.isEmpty(id) && _.isEmpty(result.style) && getIsAlienationColor(result)) {
        param.style = {
          colorType: 0,
        }
      }
    }
    return param;
  } else {
    return param;
  }
}

/**
 * 统计图表默认 controls
 */
export const systemControls = [
  {
    controlId: 'ownerid',
    controlName: _l('拥有者'),
    type: 26,
  },
  {
    controlId: 'caid',
    controlName: _l('创建人'),
    type: 26,
  },
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    type: 16,
  },
  {
    controlId: 'utime',
    controlName: _l('最近修改时间'),
    type: 16,
  },
];

/**
 * 是否是系统控件
 */
export function isSystemControl(controlId) {
  return !_.isEmpty(_.find(systemControls, { controlId }));
}

/**
 * 统计范围中的过去*天&未来*天
 */
export const dropdownDayData = [
  {
    text: _l('7天'),
    value: 7,
  },
  {
    text: _l('14天'),
    value: 14,
  },
  {
    text: _l('30天'),
    value: 30,
  },
  {
    text: _l('90天'),
    value: 90,
  },
  {
    text: _l('180天'),
    value: 180,
  },
  {
    text: _l('365天'),
    value: 365,
  },
];

/**
 * 时间控件的粒度
 */
export const timeParticleSizeDropdownData = [
  { text: _l('分'), value: 7 },
  { text: _l('时'), value: 6 },
  { text: _l('天'), value: 1 },
  { text: _l('周'), value: 2 },
  { text: _l('月'), value: 3 },
  { text: _l('季'), value: 4 },
  { text: _l('年'), value: 5 },
];

/**
 * 地区控件的粒度
 */
export const areaParticleSizeDropdownData = [
  { text: _l('省'), value: 1 },
  { text: _l('市'), value: 2 },
  { text: _l('区/县'), value: 3 },
];

/**
 * 数值控件的计算类型
 */
export const normTypes = [
  {
    text: _l('总计'),
    alias: _l('求和'),
    value: 1,
  },
  {
    text: _l('最大值'),
    value: 2,
  },
  {
    text: _l('最小值'),
    value: 3,
  },
  {
    text: _l('平均值'),
    value: 4,
  },
];

/**
 * 老数据补充默认的 summary.name
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
export const checkedDropdownItem = (value, list) => {
  if (_.isEmpty(list)) {
    return [];
  } else {
    return list.map(item => {
      item.className = item.value === value ? 'ThemeColor3' : '';
      return item;
    });
  }
};

/**
 * 格式化统计范围时间文案
 */
export const formatrChartTimeText = ({ rangeType, rangeValue }) => {
  const typeName = _.find(dropdownScopeData, { value: rangeType }) || {};
  const text = isPastAndFuture(rangeType) ? typeName.text.replace(/(\...)/i, rangeValue) : typeName.text;
  return rangeType === 20 ? rangeValue : text;
};

/**
 * 根据文字内容获取尺寸
 */
function getFontRect(sum, el, px) {
  var span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.lineHeight = '1';
  span.style.letterSpacing = "0";
  span.style.whiteSpace = 'nowrap';
  span.style.fontSize = px + 'px';
  el.appendChild(span),
  span.innerText = sum || '';
  let size = span.getBoundingClientRect();
  el.removeChild(span);
  return size;
}

/**
 * 根据父节点高宽计算适合的文字大小
 */
export function getPerfectFontSize(el, sum, size) {
  let width = el.clientWidth;
  let height = 0;
  switch (size) {
    case 0:
        height = $(el).parent().height() / 3;
        break;
    case 1:
        height = $(el).parent().height() / 2;
        break;
    case 2:
        height = $(el).parent().height() - 30;
        break;
    default:
        height = $(el).parent().height() / 3
    }
  let defaultProportion = 24;
  let sumSize = getFontRect(sum, el, 14);
  let proportion = sumSize.width / sumSize.height;
  let fontSize = width < height * proportion ? height < (proportion = width / proportion) ? defaultProportion : Math.max(proportion, defaultProportion) : Math.max(height, defaultProportion);
  return Math.floor(fontSize);
}


