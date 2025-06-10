import React, { Component } from 'react';
import { formatYaxisList, formatrChartValue, formatControlInfo, getChartColors, getStyleColor, formatNumberValue } from './common';
import { formatSummaryName, isFormatNumber } from 'statistics/common';
import { SYS_CHART_COLORS } from 'src/pages/Admin/settings/config';
import { generate } from '@ant-design/colors';

const initRegisterShape = (G2) => {
  const { Util, registerShape } = G2;
  registerShape('point', 'custom-gauge-indicator', {
    draw(cfg, container) {
      // 使用 customInfo 传递参数
      const { indicator, defaultColor } = cfg.customInfo;
      const { pointer, pin } = indicator;

      const group = container.addGroup();
      // 获取极坐标系下画布中心点
      const center = this.parsePoint({ x: 0, y: 0 });

      if (pin) {
        const pinStyle = pin.style || {};
        const { lineWidth = 2, fill = defaultColor } = pinStyle;
        const r = 6;
        group.addShape('circle', {
          name: 'pin-outer',
          attrs: {
            x: center.x,
            y: center.y,
            ...pin.style,
            fill,
            r: r * 1.5,
            lineWidth,
          },
        });
      }
      // 绘制指针
      if (pointer) {
        const { startAngle, endAngle } = Util.getAngle(cfg, this.coordinate);
        const radius = this.coordinate.getRadius();
        const midAngle = (startAngle + endAngle) / 2;
        const { x: x1, y: y1 } = Util.polarToCartesian(center.x, center.y, radius / 15, midAngle + 1 / Math.PI);
        const { x: x2, y: y2 } = Util.polarToCartesian(center.x, center.y, radius / 15, midAngle - 1 / Math.PI);
        const { x, y } = Util.polarToCartesian(center.x, center.y, radius * 0.65, midAngle);
        const { x: x0, y: y0 } = Util.polarToCartesian(center.x, center.y, radius * 0.1, midAngle + Math.PI);
        const sa = Math.PI / 2 + midAngle;
        const r1 = 5.5;
        const p1 = {
          x: center.x + Math.cos(sa) * r1,
          y: center.y + Math.sin(sa) * r1,
        };
        const p2 = {
          x: center.x - Math.cos(sa) * r1,
          y: center.y - Math.sin(sa) * r1,
        };
        const r2 = r1 / 4;
        const p11 = {
          x: x + Math.cos(sa) * r2,
          y: y + Math.sin(sa) * r2,
        };
        const p21 = {
          x: x - Math.cos(sa) * r2,
          y: y - Math.sin(sa) * r2,
        };

        const path = [
          ['M', p21.x, p21.y],
          // 参数信息: cx, cy, .., .., .., endPointX, endPointY
          ['A', r2, r2, 0, 0, 1, p11.x, p11.y],
          ['L', p1.x, p1.y],
          ['A', r1, r1, 0, 0, 1, p2.x, p2.y],
          ['Z'],
        ];
        // pointer
        group.addShape('path', {
          name: 'pointer',
          attrs: {
            path,
            fill: defaultColor,
            lineCap: 'round',
            ...pointer.style,
          },
        });
        // pointer
        group.addShape('circle', {
          name: 'pointer-center',
          attrs: {
            x: center.x,
            y: center.y,
            r: 2,
            fill: '#ffffffcc',
          },
        });
      }

      return group;
    }
  });
}

let isInitRegisterShape = false;

export const replaceColor = (gaugeColor, themeColor) => {
  if (gaugeColor === 'DARK_COLOR') {
    return themeColor;
  }
  if (gaugeColor === 'LIGHT_COLOR') {
    const lightColor = generate(themeColor)[0];
    return lightColor;
  }
  return gaugeColor;
}

function findNthValueInRange(minValue, maxValue, n) {
  const interval = (maxValue - minValue) / 99;
  const nthValue = minValue + (n - 1) * interval;
  return Math.ceil(nthValue);
}

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownVisible: false,
      offset: {},
      match: null
    }
    this.GaugeChart = null;
    this.g2plotComponent = {};
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderGaugeChart(this.props);
    });
  }
  componentWillUnmount() {
    this.GaugeChart && this.GaugeChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    if (
      displaySetup.showDimension !== oldDisplaySetup.showDimension ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      !_.isEqual(displaySetup.percent, oldDisplaySetup.percent) ||
      !_.isEqual(style, oldStyle) ||
      !_.isEqual(_.pick(nextProps.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']), _.pick(this.props.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor'])) ||
      nextProps.themeColor !== this.props.themeColor
    ) {
      const GaugeChartConfig = this.getComponentConfig(nextProps);
      this.GaugeChart.update(GaugeChartConfig);
    }
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      nextProps.direction !== this.props.direction
    ) {
      this.GaugeChart.destroy();
      setTimeout(() => {
        this.renderGaugeChart(nextProps);
      }, 0);
    }
  }
  renderGaugeChart(props) {
    const { reportData } = props;
    const GaugeChartConfig = this.getComponentConfig(props);
    const { Gauge, G2 } = this.g2plotComponent;
    if (!isInitRegisterShape) {
      isInitRegisterShape = true;
      initRegisterShape(G2);
    }
    if (this.chartEl) {
      this.GaugeChart = new Gauge(this.chartEl, GaugeChartConfig);
      this.GaugeChart.render();
    }
  }
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, isThumbnail } = props;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light', widgetBgColor } = customPageConfig;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const { map, yaxisList, displaySetup } = reportData;
    const { showChartType, showDimension, showNumber, colorRules } = displaySetup;
    const showPercent = displaySetup.percent.enable;
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const { indicatorVisible, fontColor = 'rgba(0, 0, 0, 1)', gaugeColorType = 1, sectionColorConfig = {}, isApplyGaugeColor, applySectionScale } = style;
    const scaleType = _.isUndefined(style.scaleType) ? 1 : style.scaleType;
    const isNumberScale = _.isUndefined(style.isNumberScale) ? scaleType === 1 : style.isNumberScale;
    const isProgressScale = _.isUndefined(style.isProgressScale) ? scaleType === 2 : style.isProgressScale;
    const numberControlId = _.get(yaxisList[0], 'controlId');
    const numberControlName = _.get(yaxisList[0], 'rename') || _.get(yaxisList[0], 'controlName');
    const data = map[numberControlId] || { value: 0, min: 0, max: 0 };
    const { clientHeight } = this.chartEl;
    const colors = getChartColors(style, themeColor, projectId);
    const gaugeColor = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? colors[0] : replaceColor(style.gaugeColor, themeColor) || colors[0];
    const fontColorRule = _.get(colorRules[0], 'dataBarRule') || {};
    const gaugeColorRule = _.get(colorRules[1], 'dataBarRule') || {};
    const maxValue = data.max || 1;
    const percent = data.value <= data.min ? 0 : (data.value - data.min) / (maxValue - data.min);
    const getOffset = () => {
      if (showChartType === 1) {
        return clientHeight / 7;
      }
      if (showChartType === 2) {
        return 0;
      }
      return clientHeight / 9;
    }
    const getFontColor = () => {
      if (isApplyGaugeColor) {
        if (gaugeColorType === 1) {
          return getGaugeColor();
        } else {
          const ticks = getTicks();
          const sectionColors = getSectionColors();
          const getIndex = () => {
            let index = null;
            ticks.forEach((n, i) => {
              if (n >= percent && _.isNull(index)) {
                index = i;
              }
            });
            return index - 1;
          }
          return sectionColors[getIndex()];
        }
      } else if (_.isEmpty(fontColorRule)) {
        return fontColor;
      } else {
        const controlId = yaxisList[0].controlId;
        const color = getStyleColor({
          value: data.value,
          controlMinAndMax: {
            [controlId]: {
              min: data.min,
              max: data.max,
              center: (data.max + data.min) / 2
            }
          },
          rule: fontColorRule,
          controlId
        });
        return color || fontColor;
      }
    }
    const getGaugeColor = () => {
      if (_.isEmpty(gaugeColorRule)) {
        return gaugeColor;
      } else {
        const controlId = yaxisList[0].controlId;
        const color = getStyleColor({
          value: Number((percent * 100).toFixed(0)),
          controlMinAndMax: {
            [controlId]: {
              min: data.min,
              max: data.max,
              center: (data.max + data.min) / 2
            }
          },
          rule: gaugeColorRule,
          controlId
        });
        return color || gaugeColor;
      }
    }
    const getSectionColors = () => {
      const colors = SYS_CHART_COLORS[0].colors;
      const { sectionColors = [] } = sectionColorConfig;
      return sectionColors.map((data, index) => data.color || colors[index % colors.length]).reverse();
    }
    const getTicks = () => {
      const { sectionColors = [] } = sectionColorConfig;
      return [0].concat(_.cloneDeep(sectionColors).reverse().map(data => data.value / 100));
    }
    const renderNumberLabel = value => {
      if (value == 0) {
        return formatrChartValue(data.min, false, yaxisList, null, false);
      }
      if (value == 1) {
        return formatrChartValue(data.max, false, yaxisList, null, false);
      }
      const rangeValue = findNthValueInRange(data.min, data.max, value * 100);
      return formatrChartValue(rangeValue, false, yaxisList, null, false);
    }
    const base = {
      percent,
      appendPadding: [10, 10, showChartType == 2 ? 65 : 50, 10],
      range: {
        color: gaugeColorType === 2 && !_.isEmpty(sectionColorConfig) ? getSectionColors() : getGaugeColor(),
        ticks: gaugeColorType === 2 && !_.isEmpty(sectionColorConfig) ? getTicks() : undefined,
        width: 32
      },
      indicator: {
        shape: 'custom-gauge-indicator',
        pointer: {
          style: {
            stroke: '#D0D0D0',
            lineWidth: 1,
            fill: '#151515',
          },
        },
        pin: {
          style: {
            lineWidth: 2,
            stroke: '#D0D0D0',
            fill: '#D0D0D0',
          },
        },
      },
      axis: {
        label: {
          // offset: scaleType === 2 ? -24 : (isThumbnail ? getOffset() : 60),
          offset: isNumberScale && isProgressScale ? -50 : -30,
          // style: (value, index) => {
          //   return {}
          // },
          formatter(value) {
            value = Number(value);
            if (scaleType === null) {
              return undefined;
            }
            const { isFloor } = sectionColorConfig;
            const numberLabel = renderNumberLabel(value);
            const progressLable = `${(value * 100).toFixed(isFloor ? 0 : 2)}%`;
            if (isNumberScale && isProgressScale) {
              return `${numberLabel} (${progressLable})`;
            }
            if (isNumberScale) {
              return numberLabel;
            }
            if (isProgressScale) {
              return progressLable;
            }
          },
          style: {
            fill: isDark ? '#ffffffcc' : undefined
          }
        },
        tickMethod: applySectionScale ? () => getTicks() : undefined,
        tickLine: isNumberScale || isProgressScale || scaleType !== null ? {} : false,
        subTickLine: {
          count: 0,
        },
      },
      statistic: {
        content: (showNumber || showPercent) ? {
          formatter: ({ percent }) => {
            const value = formatrChartValue(data.value, false, yaxisList);
            const percentValue = `(${formatNumberValue(percent * 100, displaySetup.percent)}%)`;
            return `${showNumber ? value : ''} ${showPercent ? percentValue : ''}`;
          },
          style: {
            color: isDark ? '#ffffffcc' : getFontColor(),
            fontSize: '20px',
            lineHeight: '24px',
            width: '50%',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: 'block',
          },
          offsetY: showChartType == 2 ? clientHeight / 2 : 40
        } : null,
        title: showDimension ? {
          formatter: ({ percent }) => `${numberControlName}`,
          style: {
            color: isDark ? '#ffffffcc' : '#9e9e9e',
            lineHeight: 4,
            fontSize: '13px',
          },
          offsetY: showChartType == 2 ? clientHeight / 2 : 43
        } : null
      },
    }
    if (indicatorVisible === false) {
      base.indicator.pointer = null;
      base.indicator.pin = null;
    }
    if (showChartType == 2) {
      base.startAngle = Math.PI + 0.6;
      base.endAngle = 2 * Math.PI - 0.6;
      base.range.width = isThumbnail ? 44 : 64;
      base.axis.label.offset = -24;
    }
    if (showChartType === 3) {
      base.type = 'meter';
      base.meter = {
        stepRatio: 0.7
      }
    }
    return base;
  }
  render() {
    const { displaySetup = {} } = this.props.reportData;
    return (
      <div className="flex flexColumn chartWrapper">
        <div className="h100" ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
