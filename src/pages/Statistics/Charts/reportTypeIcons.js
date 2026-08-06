import { reportTypes } from './reportTypes';

export const REPORT_TYPE_ICONS = {
  [reportTypes.BarChart]: 'stats_bar_chart',
  [reportTypes.LineChart]: 'stats_line_chart',
  [reportTypes.PieChart]: 'stats_pie_chart',
  [reportTypes.RadarChart]: 'stats_radar_chart',
  [reportTypes.FunnelChart]: 'stats_funnel_chart',
  [reportTypes.DualAxes]: 'stats_biaxial_chart',
  [reportTypes.PivotTable]: 'table',
  [reportTypes.CountryLayer]: 'map',
  [reportTypes.NumberChart]: 'stats_numerical_chart',
  [reportTypes.BidirectionalBarChart]: 'stats_symmetric_graph_chart',
  [reportTypes.ScatterChart]: 'stats_bubble_chart',
  [reportTypes.WordCloudChart]: 'stats_word_cloud_chart',
  [reportTypes.GaugeChart]: 'stats_instrument_panel_chart',
  [reportTypes.ProgressChart]: 'stats_progress_bar_chart',
  [reportTypes.TopChart]: 'stats_ranking_list_chart',
  [reportTypes.WorldMap]: 'public',
};

export const getReportTypeIcon = reportType => REPORT_TYPE_ICONS[reportType] || 'insert_chart';
