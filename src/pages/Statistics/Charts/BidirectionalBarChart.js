import React, { Component } from 'react';
import {
  formatControlInfo,
  formatrChartValue,
  formatrChartAxisValue,
  reportTypes,
  getLegendType,
  formatYaxisList,
  getMinValue,
  getChartColors,
  getAuxiliaryLineConfig
} from './common';
import { formatChartData as formatBarChartData, formatDataCount } from './BarChart';
import { formatSummaryName, isFormatNumber } from 'statistics/common';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';

const mergeChartData = (data, contrastData) => {
  const result = [];
  data.forEach(item => {
    const target = _.find(contrastData, { originalId: item.originalId }) || {};
    result.push({
      originalId: item.originalId,
      name: item.name,
      [item.controlId]: item.value,
      [target.controlId]: target.value
    });
  });
  return result;
}

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalLeftCount: 0,
      leftCount: 0,
      originalRightCount: 0,
      rightCount: 0,
      dropdownVisible: false,
      offset: {},
      match: null
    }
    this.BidirectionalBarChart = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderBidirectionalBarChart(this.props);
    });
  }
   componentWillUnmount() {
    this.BidirectionalBarChart && this.BidirectionalBarChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { map, displaySetup, rightY, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, rightY: oldRightY, style: oldStyle } = this.props.reportData;
    const chartColor = _.get(nextProps, 'customPageConfig.chartColor');
    const oldChartColor = _.get(this.props, 'customPageConfig.chartColor');

    if (_.isEmpty(rightY)) {
      return;
    }

    const rightYDisplay = rightY.display.ydisplay;
    const oldRightYDisplay = oldRightY.display.ydisplay;

    if (
      displaySetup.fontStyle !== oldDisplaySetup.fontStyle ||
      displaySetup.hideOverlapText !== oldDisplaySetup.hideOverlapText ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      !_.isEqual(displaySetup.xdisplay, oldDisplaySetup.xdisplay) ||
      !_.isEqual(displaySetup.ydisplay, oldDisplaySetup.ydisplay) ||
      !_.isEqual(displaySetup.auxiliaryLines, oldDisplaySetup.auxiliaryLines) ||
      !_.isEqual(rightYDisplay, oldRightYDisplay) ||
      style.showLabelPercent !== oldStyle.showLabelPercent ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(chartColor, oldChartColor) ||
      nextProps.themeColor !== this.props.themeColor
    ) {
      const config = this.getComponentConfig(nextProps);
      this.BidirectionalBarChart.update(config);
    }
  }
  renderBidirectionalBarChart(props) {
    const { reportData, isViewOriginalData } = props;
    const { displaySetup } = reportData;
    const config = this.getComponentConfig(props);
    const { BidirectionalBar } = this.g2plotComponent;
    this.BidirectionalBarChart = new BidirectionalBar(this.chartEl, config);
    if (displaySetup.showRowList && isViewOriginalData) {
      this.BidirectionalBarChart.on('element:click', this.handleClick);
    }
    this.BidirectionalBarChart.render();
  }
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData } = props;
    const { chartColor, chartColorIndex = 1 } = customPageConfig;
    const { map, contrastMap, displaySetup, yaxisList, summary, rightY, yreportType, xaxes, split, sorts } = reportData;
    const { xdisplay, ydisplay, showPileTotal, isPile, legendType, auxiliaryLines, showLegend, showChartType } = displaySetup;
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const rightYDisplay = rightY.display.ydisplay;
    const splitId = split.controlId;
    const xaxesId = xaxes.controlId;
    const rightSplitId = _.get(rightY, 'split.controlId');
    const { position } = getLegendType(legendType);
    const isVertical = showChartType === 1;
    const sortsKey = sorts.map(n => _.findKey(n));
    const leftSorts = yaxisList.filter(item => sortsKey.includes(item.controlId));
    const rightSorts = rightY.yaxisList.filter(item => sortsKey.includes(item.controlId));
    const data = formatBarChartData(map, yaxisList, splitId, xaxesId);
    const contrastData = formatBarChartData(contrastMap, rightY.yaxisList, rightSplitId, xaxesId);
    const mergeData = rightSorts.length ? mergeChartData(contrastData, data) : mergeChartData(data, contrastData);
    const control = yaxisList[0] || {};
    const contrastControl = rightY.yaxisList[0] || {};
    const colors = getChartColors(style, themeColor, projectId);

    const lineConfig = {
      style: {
        lineDash: ydisplay.lineStyle === 1 ? [] : [4, 5],
      }
    }

    const base = {
      data: mergeData,
      appendPadding: isVertical ? 10 : [10, 20, 10, 40],
      layout: isVertical ? 'vertical' : null,
      xField: 'originalId',
      yField: [control.controlId, contrastControl.controlId],
      meta: {
        [control.controlId]: {
          alias: control.rename || control.controlName
        },
        [contrastControl.controlId]: {
          alias: contrastControl.rename || contrastControl.controlName
        },
        originalId: {
          type: 'cat',
          formatter: value => {
            const item = _.find(mergeData, { originalId: value });
            return item ? item.name || _l('空') : value;
          }
        }
      },
      interactions: [{ type: 'active-region' }],
      label: displaySetup.showNumber ? {
        position: isVertical ? 'top' : 'right',
        layout: [
          displaySetup.hideOverlapText ? { type: 'hide-overlap' } : null,
          { type: 'adjust-color' }
        ],
        offset: 0,
        content: (data) => {
          if (data['series-field-key'] === control.controlId) {
            const value = data[control.controlId] || 0;
            const labelValue = formatrChartValue(value, false, yaxisList);
            if (style.showLabelPercent && summary.showTotal && summary.sum) {
              return `${labelValue} (${(value / summary.sum * 100).toFixed(2)}%)`;
            }
            return labelValue;
          }
          if (data['series-field-key'] === contrastControl.controlId) {
            const value = data[contrastControl.controlId] || 0;
            const labelValue = formatrChartValue(value, false, rightY.yaxisList);
            if (style.showLabelPercent && _.get(rightY, 'summary.showTotal') && _.get(rightY, 'summary.sum')) {
              return `${labelValue} (${(value / _.get(rightY, 'summary.sum') * 100).toFixed(2)}%)`;
            }
            return labelValue;
          }
        }
      } : null,
      xAxis: {
        position: 'bottom',
        label: xdisplay.showDial ? {
              autoRotate: displaySetup.fontStyle ? true : false,
              autoHide: true,
              autoEllipsis: true
            } : null,
      },
      yAxis: {
        [control.controlId]: {
          nice: true,
          minLimit: _.isNumber(ydisplay.minValue) ? ydisplay.minValue : null,
          maxLimit: _.isNumber(ydisplay.maxValue) ? ydisplay.maxValue : null,
          // title: ydisplay.showTitle && ydisplay.title ? { text: ydisplay.title } : null,
          label: ydisplay.showDial ? {
            formatter: (value) => {
              return value ? formatrChartAxisValue(Number(value), false, yaxisList) : null;
            }
          } : null,
          grid: {
            line: ydisplay.showDial ? lineConfig : null,
          }
        },
        [contrastControl.controlId]: {
          nice: true,
          minLimit: _.isNumber(rightYDisplay.minValue) ? rightYDisplay.minValue : null,
          maxLimit: _.isNumber(rightYDisplay.maxValue) ? rightYDisplay.maxValue : null,
          // title: rightYDisplay.showTitle && rightYDisplay.title ? { text: rightYDisplay.title } : null,
          label: ydisplay.showDial ? {
            formatter: (value) => {
              return value ? formatrChartAxisValue(Number(value), false, rightY.yaxisList) : null;
            }
          } : null,
          grid: {
            line: ydisplay.showDial ? lineConfig : null,
          }
        },
      },
      color: colors,
      legend: showLegend
        ? {
            position,
            flipPage: true,
            itemHeight: 20,
            radio: { style: { r: 6 } },
          }
        : false,
      tooltip: {
        shared: true,
        showMarkers: false,
        formatter: (data) => {
          if (data['series-field-key'] === control.controlId) {
            const value = data[control.controlId] || 0;
            const labelValue = formatrChartValue(value, false, yaxisList);
            if (style.showLabelPercent && summary.showTotal && summary.sum) {
              const item = _.find(mergeData, { originalId: data.originalId });
              return {
                name: item.name || item.originalId,
                value: `${style.tooltipValueType ? labelValue : value} (${(value / summary.sum * 100).toFixed(2)}%)`
              }
            }
            return {
              name: control.rename || control.controlName,
              value: style.tooltipValueType ? labelValue : value
            };
          }
          if (data['series-field-key'] === contrastControl.controlId) {
            const value = data[contrastControl.controlId] || 0;
            const labelValue = formatrChartValue(value, false, rightY.yaxisList);
            if (style.showLabelPercent && _.get(rightY, 'summary.showTotal') && _.get(rightY, 'summary.sum')) {
              const item = _.find(mergeData, { originalId: data.originalId });
              return {
                name: item.name || item.originalId,
                value: `${style.tooltipValueType ? labelValue : value} (${(value / _.get(rightY, 'summary.sum') * 100).toFixed(2)}%)`
              };
            }
            return {
              name: contrastControl.rename || contrastControl.controlName,
              value: style.tooltipValueType ? labelValue : value
            };
          }
        }
      }
    }

    this.setCount(yaxisList, rightY.yaxisList);

    return base;
  }
  handleClick = (event) => {
    const { xaxes } = this.props.reportData;
    const currentData = event.data.data;
    const gEvent = event.gEvent;
    const param = {};
    if (xaxes.cid) {
      const isNumber = isFormatNumber(xaxes.controlType);
      const value = currentData.originalId;
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
    }
    this.setState({
      dropdownVisible: true,
      offset: {
        x: gEvent.x,
        y: gEvent.y + 20
      },
      match: param
    });
  }
  handleRequestOriginalData = () => {
    const { isThumbnail } = this.props;
    const { match } = this.state;
    const data = {
      isPersonal: false,
      match
    }
    this.setState({ dropdownVisible: false });
    if (isThumbnail) {
      this.props.onOpenChartDialog(data);
    } else {
      this.props.requestOriginalData(data);
    }
  }
  setCount(yaxisList, rightYaxisList) {
    const { summary, rightY } = this.props.reportData;
    const leftValue = summary.sum;
    const rightValue = rightY ? rightY.summary.sum : 0;
    const leftCount = formatrChartValue(leftValue, false, yaxisList, null, false);
    const rightCount = formatrChartValue(rightValue, false, rightYaxisList, null, false);
    this.setState({
      originalLeftCount: leftValue.toLocaleString() == leftCount ? 0 : leftValue.toLocaleString(),
      leftCount,
      originalRightCount: rightValue.toLocaleString() == rightCount ? 0 : rightValue.toLocaleString(),
      rightCount,
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
    const { leftCount, originalLeftCount, rightCount, originalRightCount, dropdownVisible, offset } = this.state;
    const { rightY, summary = {} } = this.props.reportData;
    const dualAxesSwitchChecked = summary.showTotal || (rightY ? rightY.summary.showTotal : null);
    return (
      <div className="flex flexColumn chartWrapper">
        <Dropdown
          visible={dropdownVisible}
          onVisibleChange={(dropdownVisible) => {
            this.setState({ dropdownVisible });
          }}
          trigger={['click']}
          placement="bottomLeft"
          overlay={this.renderOverlay()}
        >
          <div className="Absolute" style={{ left: offset.x, top: offset.y }}></div>
        </Dropdown>
        {dualAxesSwitchChecked && (
          <div className="flexRow spaceBetween pBottom10">
            {summary.showTotal ? (
              <div>
                <span>{formatSummaryName(summary)}: </span>
                <span data-tip={originalLeftCount ? originalLeftCount : null} className="count">{leftCount}</span>
              </div>
            ) : (
              <div></div>
            )}
            {rightY && rightY.summary.showTotal ? (
              <div>
                <span>{formatSummaryName(rightY.summary)}: </span>
                <span data-tip={originalRightCount ? originalRightCount : null} className="count">{rightCount}</span>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        )}
        <div className={dualAxesSwitchChecked ? 'showTotalHeight' : 'h100'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
