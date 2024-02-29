import React, { Component } from 'react';
import { getLegendType, formatrChartValue, formatYaxisList, getChartColors, getAlienationColor } from './common';
import { formatSummaryName, getIsAlienationColor, isFormatNumber } from 'statistics/common';
import { Dropdown, Menu } from 'antd';
import { browserIsMobile } from 'src/util';
import { toFixed } from 'src/util';
import _ from 'lodash';

const formatChartData = data => {
  const result = data
    .map(item => {
      return {
        name: item.x,
        originalId: item.originalX,
        value: Math.abs(item.v),
        originalValue: item.v,
      };
    })
    .filter(item => item.originalValue);
  return result;
};

const formatChartMap = (data, yaxisList) => {
  return data.map(data => {
    const control = _.find(yaxisList, { controlId: data.c_id }) || {};
    return {
      name: control.rename || control.controlName,
      originalId: data.c_id,
      value: Math.abs(data.value[0].v),
      originalValue: data.value[0].v,
    }
  });
}

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalCount: 0,
      count: 0,
      dropdownVisible: false,
      offset: {},
      match: null,
    };
    this.PieChart = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.PieComponent = data.Pie;
      this.renderPieChart();
    });
  }
  componentWillUnmount() {
    this.PieChart && this.PieChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    const chartColor = _.get(nextProps, 'customPageConfig.chartColor');
    const oldChartColor = _.get(this.props, 'customPageConfig.chartColor');
    if (
      displaySetup.showTotal !== oldDisplaySetup.showTotal ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showDimension !== oldDisplaySetup.showDimension ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.showPercent !== oldDisplaySetup.showPercent ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(chartColor, oldChartColor) ||
      nextProps.themeColor !== this.props.themeColor
    ) {
      const pieConfig = this.getPieConfig(nextProps);
      this.PieChart.update(pieConfig);
    }
    if (displaySetup.showChartType !== oldDisplaySetup.showChartType) {
      this.PieChart.destroy();
      this.PieChart = new this.PieComponent(this.chartEl, this.getPieConfig(nextProps));
      this.PieChart.render();
    }
  }
  renderPieChart() {
    const { reportData, isViewOriginalData } = this.props;
    const { displaySetup } = reportData;
    this.PieChart = new this.PieComponent(this.chartEl, this.getPieConfig(this.props));
    if (displaySetup.showRowList && isViewOriginalData) {
      this.PieChart.on('element:click', this.handleClick);
    }
    this.PieChart.render();
  }
  handleClick = data => {
    const { xaxes } = this.props.reportData;
    const event = data.gEvent;
    const currentData = data.data;
    const param = {};
    if (xaxes.cid) {
      const isNumber = isFormatNumber(xaxes.controlType);
      const value = currentData.data.originalId;
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
    }
    this.setState({
      dropdownVisible: true,
      offset: {
        x: event.x + 20,
        y: event.y,
      },
      match: param,
    });
  }
  handleRequestOriginalData = () => {
    const { isThumbnail } = this.props;
    const { match } = this.state;
    const data = {
      isPersonal: false,
      match,
    };
    this.setState({ dropdownVisible: false });
    if (isThumbnail) {
      this.props.onOpenChartDialog(data);
    } else {
      this.props.requestOriginalData(data);
    }
  }
  interactions(isAnnular) {
    if (browserIsMobile()) {
      return [
        { type: 'element-single-selected' },
        {
          type: 'pie-statistic-active',
          cfg: {
            start: [{ trigger: 'element:click', action: 'pie-statistic:change' }],
            end: [
              {
                trigger: 'element:click',
                isEnable: context => {
                  const element = context.event.gEvent.target.get('element');
                  return !element || !element.getStates().includes('selected');
                },
                action: 'pie-statistic:reset',
              },
            ],
          },
        },
      ];
    } else {
      return [{ type: isAnnular ? 'pie-statistic-active' : 'element-active' }];
    }
  }
  getPieConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData } = props;
    const { chartColor, chartColorIndex = 1 } = customPageConfig;
    const { map, displaySetup, yaxisList, summary, xaxes, reportId } = reportData;
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const data = xaxes.controlId ? formatChartData(map[0].value) : formatChartMap(map, yaxisList);
    const { position } = getLegendType(displaySetup.legendType);
    const isLabelVisible = displaySetup.showDimension || displaySetup.showNumber || displaySetup.showPercent;
    const newYaxisList = formatYaxisList(data, yaxisList);
    const isAnnular = displaySetup.showChartType === 1;
    const colors = getChartColors(style, themeColor, projectId);
    const isNewChart = _.isUndefined(reportId) && _.isEmpty(style);
    const isAlienationColor = getIsAlienationColor(reportData);
    const isOptionsColor = isNewChart ? isAlienationColor : style ? style.colorType === 0 && isAlienationColor : false;
    const { clientWidth, clientHeight } = this.chartEl;
    const height = clientHeight / 2;
    this.setCount(newYaxisList);

    const findName = value => {
      const item = _.find(data, { originalId: value });
      return item ? item.name || _l('空') : value;
    };

    const titleSize = height / 150;
    const titleScale = titleSize > 1 ? 1 : titleSize;
    const contentSize = height / 180;
    const contentScale = contentSize > 1 ? 1 : contentSize;

    const baseConfig = {
      data,
      appendPadding: [10, 0, 10, 0],
      radius: 0.7,
      innerRadius: isAnnular ? 0.6 : 0,
      angleField: 'value',
      colorField: 'originalId',
      meta: {
        originalId: {
          type: 'cat',
          formatter: findName,
        },
      },
      color: isOptionsColor ? getAlienationColor.bind(this, xaxes) : colors,
      legend: displaySetup.showLegend
        ? {
            position,
            flipPage: true,
            itemHeight: 20,
            radio: { style: { r: 6 } },
          }
        : false,
      tooltip: isAnnular
        ? null
        : {
            shared: true,
            showCrosshairs: false,
            showMarkers: true,
            formatter: ({ value, originalId }) => {
              const name = findName(originalId);
              const { dot } = yaxisList[0] || {};
              const labelValue = formatrChartValue(value, false, newYaxisList, value ? undefined : originalId);
              return {
                name,
                value: _.isNumber(value) ? style.tooltipValueType ? labelValue : value.toLocaleString('zh', { minimumFractionDigits: dot }) : '--',
              };
            },
          },
      statistic: displaySetup.showTotal
        ? {
            title: {
              offsetY: titleScale > 0.65 ? -10 : titleScale * 5,
              style: {
                fontSize: 14,
                fontWeight: 300,
                transform: `translate(-50%, -100%) scale(${titleScale})`,
              },
              formatter: datum => (datum ? datum.name || datum.originalId : formatSummaryName(summary)),
            },
            content: {
              style: {
                fontSize: 22,
                fontWeight: 500,
                transform: `translate(-50%, 0px) scale(${contentScale})`,
                width: `${_.min([clientWidth, clientHeight]) / 3}px`
              },
              formatter: datum => {
                const value = datum ? datum.originalValue : summary.sum;
                return formatrChartValue(value, false, newYaxisList);
              },
            },
          }
        : false,
      label: isLabelVisible
        ? {
            type: 'outer',
            formatter: item => {
              const dimensionText = displaySetup.showDimension ? `${findName(item.originalId)}` : '';
              const numberText = displaySetup.showNumber
                ? `${displaySetup.showDimension ? ` ` : ''}${formatrChartValue(
                    item.originalValue,
                    false,
                    newYaxisList,
                    null,
                    false
                  )}`
                : '';
              const percentText = displaySetup.showPercent ? `(${toFixed(item.percent * 100, 2)}%)` : '';
              return `${dimensionText} ${numberText} ${percentText}`;
            },
          }
        : false,
      interactions: this.interactions(isAnnular),
      // events: {
      //   onRingMouseenter: (event) => {
      //     if (event.data.value !== event.data.originalValue) {
      //       event.data._value = event.data.value;
      //       event.data.value = event.data.originalValue;
      //     }
      //   },
      //   onRingMouseleave: (event) => {
      //     if (event.data._value) {
      //       event.data.value = event.data._value;
      //       delete event.data._value;
      //     }
      //   }
      // }
    };
    return baseConfig;
  }
  setCount(yaxisList) {
    const { summary } = this.props.reportData;
    const value = summary.sum;
    const count = formatrChartValue(value, false, yaxisList);
    this.setState({
      originalCount: value.toLocaleString() == count ? 0 : value.toLocaleString(),
      count,
    });
  }
  renderOverlay() {
    return (
      <Menu className="chartMenu" style={{ width: 160 }}>
        <Menu.Item onClick={this.handleRequestOriginalData} key="viewOriginalData">
          <div className="flexRow valignWrapper">
            <span>{_l('查看原始数据')}</span>
          </div>
        </Menu.Item>
      </Menu>
    );
  }
  render() {
    const { count, originalCount, dropdownVisible, offset } = this.state;
    const { summary, displaySetup } = this.props.reportData;
    const showTotal = displaySetup ? displaySetup.showTotal : false;
    const showChartType = displaySetup ? displaySetup.showChartType : 0;
    return (
      <div className="flex flexColumn chartWrapper">
        <Dropdown
          visible={dropdownVisible}
          onVisibleChange={dropdownVisible => {
            this.setState({ dropdownVisible });
          }}
          trigger={['click']}
          placement="bottomLeft"
          overlay={this.renderOverlay()}
        >
          <div className="Absolute" style={{ left: offset.x, top: offset.y }}></div>
        </Dropdown>
        {showTotal && showChartType === 2 ? (
          <div className="pBottom10">
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">
              {count}
            </span>
          </div>
        ) : null}
        <div className={showTotal && showChartType === 2 ? 'showTotalHeight' : 'h100'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
