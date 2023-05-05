
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
import BidirectionalBarChart from './BidirectionalBarChart';
import ScatterChart from './ScatterChart';
import WordCloudChart from './WordCloudChart';
import GaugeChart from './GaugeChart';
import ProgressChart from './ProgressChart';
import TopChart from './TopChart';
import VerificationDataLength from './VerificationDataLength';

const charts = {
  [reportTypes.LineChart]: VerificationDataLength(LineChart),
  [reportTypes.BarChart]: VerificationDataLength(BarChart),
  [reportTypes.PieChart]: VerificationDataLength(PieChart),
  [reportTypes.NumberChart]: NumberChart,
  [reportTypes.RadarChart]: VerificationDataLength(RadarChart),
  [reportTypes.FunnelChart]: VerificationDataLength(FunnelChart),
  [reportTypes.DualAxes]: VerificationDataLength(DualAxes),
  [reportTypes.PivotTable]: PivotTable,
  [reportTypes.CountryLayer]: CountryLayer,
  [reportTypes.BidirectionalBarChart]: BidirectionalBarChart,
  [reportTypes.ScatterChart]: ScatterChart,
  [reportTypes.WordCloudChart]: WordCloudChart,
  [reportTypes.GaugeChart]: GaugeChart,
  [reportTypes.ProgressChart]: ProgressChart,
  [reportTypes.TopChart]: TopChart,
}

export default charts;
