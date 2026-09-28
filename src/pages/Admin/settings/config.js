import CustomChart from './images/customChart.png';
import CustomTheme from './images/customTheme.png';

const CUSTOM_ILLUSTRATION_TEXT = {
  chart: {
    title: _l('自定义图表配色'),
    desc: _l('主题和图表配色联动，实现风格的一致性'),
  },
  theme: {
    title: _l('自定义主题颜色'),
    desc: _l('方便快速选择应用的主题颜色，满足个性化需求'),
  },
};

export const CUSTOM_ILLUSTRATION = {
  chart: {
    title: CUSTOM_ILLUSTRATION_TEXT.chart.title,
    desc: CUSTOM_ILLUSTRATION_TEXT.chart.desc,
    image: CustomChart,
  },
  theme: {
    title: CUSTOM_ILLUSTRATION_TEXT.theme.title,
    desc: CUSTOM_ILLUSTRATION_TEXT.theme.desc,
    image: CustomTheme,
  },
};
