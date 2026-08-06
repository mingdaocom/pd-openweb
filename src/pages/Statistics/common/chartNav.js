import { getReportTypeIcon } from '../Charts/reportTypeIcons';
import { reportTypes } from '../Charts/reportTypes';

/**
 * 图表类型数据
 */
export const chartNav = [
  {
    name: _l('柱图'),
    type: reportTypes.BarChart,
    icon: getReportTypeIcon(reportTypes.BarChart),
  },
  {
    name: _l('对称条形图'),
    type: reportTypes.BidirectionalBarChart,
    icon: getReportTypeIcon(reportTypes.BidirectionalBarChart),
  },
  {
    name: _l('折线图'),
    type: reportTypes.LineChart,
    icon: getReportTypeIcon(reportTypes.LineChart),
  },
  {
    name: _l('双轴图'),
    type: reportTypes.DualAxes,
    icon: getReportTypeIcon(reportTypes.DualAxes),
  },
  {
    name: _l('散点图'),
    type: reportTypes.ScatterChart,
    icon: getReportTypeIcon(reportTypes.ScatterChart),
  },
  {
    name: _l('雷达图'),
    type: reportTypes.RadarChart,
    icon: getReportTypeIcon(reportTypes.RadarChart),
  },
  {
    name: _l('饼图'),
    type: reportTypes.PieChart,
    icon: getReportTypeIcon(reportTypes.PieChart),
  },
  {
    name: _l('漏斗图'),
    type: reportTypes.FunnelChart,
    icon: getReportTypeIcon(reportTypes.FunnelChart),
  },
  {
    name: _l('词云'),
    type: reportTypes.WordCloudChart,
    icon: getReportTypeIcon(reportTypes.WordCloudChart),
  },
  {
    name: _l('数值图'),
    type: reportTypes.NumberChart,
    icon: getReportTypeIcon(reportTypes.NumberChart),
  },
  {
    name: _l('仪表盘'),
    type: reportTypes.GaugeChart,
    icon: getReportTypeIcon(reportTypes.GaugeChart),
  },
  {
    name: _l('进度条'),
    type: reportTypes.ProgressChart,
    icon: getReportTypeIcon(reportTypes.ProgressChart),
  },
  {
    name: _l('排行榜'),
    type: reportTypes.TopChart,
    icon: getReportTypeIcon(reportTypes.TopChart),
  },
  {
    name: _l('行政区划'),
    type: reportTypes.CountryLayer,
    icon: getReportTypeIcon(reportTypes.CountryLayer),
  },
  {
    name: _l('地图'),
    type: reportTypes.WorldMap,
    icon: getReportTypeIcon(reportTypes.WorldMap),
  },
  {
    name: _l('透视表'),
    type: reportTypes.PivotTable,
    icon: getReportTypeIcon(reportTypes.PivotTable),
  },
];
