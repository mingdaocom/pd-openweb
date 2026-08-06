import React, { lazy, Suspense } from 'react';
import { Loading } from '../components/ChartStatus';
import { reportTypes } from './reportTypes';
import VerificationDataLength from './VerificationDataLength';

const createChart = (loader, { verifyLength = false } = {}) => {
  const LazyChart = lazy(() =>
    loader().then(component => ({
      default: verifyLength ? VerificationDataLength(component.default) : component.default,
    })),
  );

  return props => (
    <Suspense fallback={<Loading />}>
      <LazyChart {...props} />
    </Suspense>
  );
};

const charts = {
  [reportTypes.LineChart]: createChart(() => import('./LineChart'), { verifyLength: true }),
  [reportTypes.BarChart]: createChart(() => import('./BarChart'), { verifyLength: true }),
  [reportTypes.PieChart]: createChart(() => import('./PieChart'), { verifyLength: true }),
  [reportTypes.NumberChart]: createChart(() => import('./NumberChart')),
  [reportTypes.RadarChart]: createChart(() => import('./RadarChart'), { verifyLength: true }),
  [reportTypes.FunnelChart]: createChart(() => import('./FunnelChart'), { verifyLength: true }),
  [reportTypes.DualAxes]: createChart(() => import('./DualAxes'), { verifyLength: true }),
  [reportTypes.PivotTable]: createChart(() => import('./PivotTable')),
  [reportTypes.CountryLayer]: createChart(() => import('./CountryLayer')),
  [reportTypes.BidirectionalBarChart]: createChart(() => import('./BidirectionalBarChart')),
  [reportTypes.ScatterChart]: createChart(() => import('./ScatterChart')),
  [reportTypes.WordCloudChart]: createChart(() => import('./WordCloudChart'), { verifyLength: true }),
  [reportTypes.GaugeChart]: createChart(() => import('./GaugeChart')),
  [reportTypes.ProgressChart]: createChart(() => import('./ProgressChart')),
  [reportTypes.TopChart]: createChart(() => import('./TopChart')),
  [reportTypes.WorldMap]: createChart(() => import('./WorldMap')),
};

export default charts;
