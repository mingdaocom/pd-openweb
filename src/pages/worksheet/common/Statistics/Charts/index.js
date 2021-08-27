
import { reportTypes } from './common';
import BarChart from './BarChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import NumberChart from './NumberChart';
import RadarChart from './RadarChart';
import FunnelChart from './FunnelChart';
import DualAxes from './DualAxes';
import PivotTable from './PivotTable';
import CountryLayer from './CountryLayer';

const charts = {
  [reportTypes.LineChart]: LineChart,
  [reportTypes.BarChart]: BarChart,
  [reportTypes.PieChart]: PieChart,
  [reportTypes.NumberChart]: NumberChart,
  [reportTypes.RadarChart]: RadarChart,
  [reportTypes.FunnelChart]: FunnelChart,
  [reportTypes.DualAxes]: DualAxes,
  [reportTypes.PivotTable]: PivotTable,
  [reportTypes.CountryLayer]: CountryLayer,
}

export default charts;
