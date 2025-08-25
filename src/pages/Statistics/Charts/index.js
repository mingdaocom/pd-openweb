import BarChart from './BarChart';
import BidirectionalBarChart from './BidirectionalBarChart';
import { reportTypes } from './common';
import CountryLayer from './CountryLayer';
import DualAxes from './DualAxes';
import FunnelChart from './FunnelChart';
import GaugeChart from './GaugeChart';
import LineChart from './LineChart';
import NumberChart from './NumberChart';
import PieChart from './PieChart';
import PivotTable from './PivotTable';
import ProgressChart from './ProgressChart';
import RadarChart from './RadarChart';
import ScatterChart from './ScatterChart';
import TopChart from './TopChart';
import VerificationDataLength from './VerificationDataLength';
import WordCloudChart from './WordCloudChart';

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
  [reportTypes.WordCloudChart]: VerificationDataLength(WordCloudChart),
  [reportTypes.GaugeChart]: GaugeChart,
  [reportTypes.ProgressChart]: ProgressChart,
  [reportTypes.TopChart]: TopChart,
};

export default charts;
