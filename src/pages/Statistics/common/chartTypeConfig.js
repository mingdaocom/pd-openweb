import fanShaped from '../assets/gaugeChart/fan_shaped.png';
import fanShapedColor from '../assets/gaugeChart/fan_shaped_color.png';
import scale from '../assets/gaugeChart/scale.png';
import scaleColor from '../assets/gaugeChart/scale_color.png';
import standard from '../assets/gaugeChart/standard.png';
import standardColor from '../assets/gaugeChart/standard_color.png';
import annular from '../assets/progressChart/annular.png';
import annularColor from '../assets/progressChart/annular_color.png';
import progressBar from '../assets/progressChart/progress_bar.png';
import progressBarColor from '../assets/progressChart/progress_bar_color.png';
import rippleChart from '../assets/progressChart/ripple_chart.png';
import rippleChartColor from '../assets/progressChart/ripple_chart_color.png';
import { reportTypes } from '../Charts/reportTypes';

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
  [reportTypes.BidirectionalBarChart]: {
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
  [reportTypes.ScatterChart]: {
    title: _l('图形'),
    items: [
      {
        name: _l('圆形'),
        value: 1,
      },
      {
        name: _l('多图形'),
        value: 2,
      },
    ],
  },
  [reportTypes.WordCloudChart]: {
    title: _l('图形'),
    items: [
      {
        name: _l('矩形'),
        value: 1,
      },
      {
        name: _l('椭圆'),
        value: 2,
      },
    ],
  },
  [reportTypes.GaugeChart]: {
    title: _l('图形'),
    items: [
      {
        name: _l('标准'),
        value: 1,
        icon: standard,
        activeIcon: standardColor,
      },
      {
        name: _l('扇形'),
        value: 2,
        icon: fanShaped,
        activeIcon: fanShapedColor,
      },
      {
        name: _l('刻度'),
        value: 3,
        icon: scale,
        activeIcon: scaleColor,
      },
    ],
  },
  [reportTypes.ProgressChart]: {
    title: _l('图形'),
    items: [
      {
        name: _l('进度条'),
        value: 1,
        icon: progressBar,
        activeIcon: progressBarColor,
      },
      {
        name: _l('环形'),
        value: 2,
        icon: annular,
        activeIcon: annularColor,
      },
      {
        name: _l('水波图'),
        value: 3,
        icon: rippleChart,
        activeIcon: rippleChartColor,
      },
    ],
  },
};

/**
 * 漏斗图图形样式
 */
export const funnelShapeList = [
  {
    name: _l('平底'),
    value: 'funnel',
  },
  {
    name: _l('尖底'),
    value: 'pyramid',
  },
];

/**
 * 漏斗图曲率样式
 */
export const funnelCurvatureList = [
  {
    name: _l('平滑'),
    value: 1,
  },
  {
    name: _l('实际'),
    value: 2,
  },
];
