import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import { TinyColor } from '@ctrl/tinycolor';
import { Icon } from 'ming-ui';
import { formatSummaryName, formatterTooltipTitle, isFormatNumber } from 'statistics/common';
import { formatNumberFromInput } from 'src/utils/control';
import {
  formatControlInfo,
  formatrChartAxisValue,
  formatrChartValue,
  formatYaxisList,
  getChartColors,
  getLegendType,
  getStyleColor,
} from './common';

const formatChartData = (data, splitId) => {
  if (_.isEmpty(data)) {
    return [];
  }
  const result = [];
  const { value } = data[0];
  if (splitId) {
    value.forEach(item => {
      const name = item.x;
      data.forEach((element, index) => {
        const target = element.value.filter(n => n.originalX === item.originalX)[0];
        result.push({
          name,
          originalId: item.originalX,
          [splitId]: element.originalKey,
          ...target.m,
        });
      });
    });
  } else {
    value.forEach(item => {
      const name = item.x;
      let obj = {};
      data.forEach((element, index) => {
        const target = element.value.filter(n => n.originalX === item.originalX)[0];
        if (target) {
          obj[element.c_id] = target.v;
        }
      });
      result.push({
        name,
        originalId: item.originalX,
        ...obj,
      });
    });
  }
  return result;
};

const getControlMinAndMax = (yaxisList, data) => {
  const result = {};

  const get = id => {
    let values = [];
    for (let i = 0; i < data.length; i++) {
      if (id in data[i]) {
        values.push(data[i][id]);
      }
    }
    const min = _.min(values) || 0;
    const max = _.max(values);
    return {
      min,
      max,
      center: (max + min) / 2,
    };
  };

  yaxisList.forEach(item => {
    result[item.controlId] = get(item.controlId);
  });

  return result;
};

const getControlMedianValue = data => {
  const min = _.min(data);
  const max = _.max(data);
  const middle = (min + max) / 2;
  return middle;
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalCount: 0,
      count: 0,
      dropdownVisible: false,
      offset: {},
      match: null,
      linkageMatch: null,
    };
    this.ScatterChart = null;
    this.g2plotComponent = {};
  }
  componentDidMount() {
    Promise.all([import('@antv/g2plot'), import('@antv/util')]).then(data => {
      this.g2plotComponent = data[0];
      this.uniq = data[1].uniq;
      this.renderScatterChart(this.props);
    });
  }
  componentWillUnmount() {
    this.ScatterChart && this.ScatterChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    if (
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      !_.isEqual(displaySetup.xdisplay, oldDisplaySetup.xdisplay) ||
      !_.isEqual(displaySetup.ydisplay, oldDisplaySetup.ydisplay) ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      !_.isEqual(style.quadrant, oldStyle.quadrant) ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(
        _.pick(nextProps.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
        _.pick(this.props.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
      ) ||
      nextProps.themeColor !== this.props.themeColor ||
      !_.isEqual(nextProps.linkageMatch, this.props.linkageMatch)
    ) {
      const config = this.getComponentConfig(nextProps);
      this.ScatterChart.update(config);
    }
    if (nextProps.isLinkageData !== this.props.isLinkageData) {
      this.ScatterChart.destroy();
      this.renderScatterChart(nextProps);
    }
  }
  renderScatterChart(props) {
    const { reportData } = props;
    const { displaySetup, style, xaxes, split } = reportData;
    const config = this.getComponentConfig(props);
    const { Scatter } = this.g2plotComponent;
    if (this.chartEl) {
      this.ScatterChart = new Scatter(this.chartEl, config);
      this.isViewOriginalData = displaySetup.showRowList && props.isViewOriginalData;
      this.isLinkageData =
        props.isLinkageData &&
        !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) &&
        (xaxes.controlId || split.controlId);
      if (this.isViewOriginalData || this.isLinkageData) {
        this.ScatterChart.on('element:click', this.handleClick);
      }
      this.ScatterChart.render();
    }
  }
  handleClick = event => {
    const { xaxes, split, appId, reportId, name, reportType, style, map } = this.props.reportData;
    const currentData = event.data.data;
    const gEvent = event.gEvent;
    const param = {};
    const linkageMatch = {
      sheetId: appId,
      reportId,
      reportName: name,
      reportType,
      filters: [],
    };
    if (xaxes.cid) {
      const isNumber = isFormatNumber(xaxes.controlType);
      const value = currentData.originalId;
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
      linkageMatch.value = value;
      linkageMatch.filters.push({
        controlId: xaxes.controlId,
        values: [param[xaxes.cid]],
        controlName: xaxes.controlName,
        controlValue: currentData.name,
        type: xaxes.controlType,
        control: xaxes,
      });
    }
    if (split.controlId) {
      const isNumber = isFormatNumber(split.controlType);
      const value = currentData[split.controlId];
      param[split.cid] = isNumber && value ? Number(value) : value;
      linkageMatch.filters.push({
        controlId: split.controlId,
        values: [param[split.cid]],
        controlName: split.controlName,
        controlValue: _.get(_.find(map, { originalKey: value }), 'key'),
        type: split.controlType,
        control: xaxes,
      });
    }
    if (_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length) {
      linkageMatch.onlyChartIds = style.autoLinkageChartObjectIds;
    }
    const isAll = this.isViewOriginalData && this.isLinkageData;
    this.setState(
      {
        dropdownVisible: isAll,
        offset: {
          x: gEvent.x,
          y: gEvent.y + 20,
        },
        match: param,
        linkageMatch,
      },
      () => {
        if (!isAll && this.isViewOriginalData) {
          this.handleRequestOriginalData();
        }
        if (!isAll && this.isLinkageData) {
          this.handleAutoLinkage();
        }
      },
    );
  };
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
  };
  handleAutoLinkage = () => {
    const { linkageMatch } = this.state;
    this.props.onUpdateLinkageFiltersGroup(linkageMatch);
    this.setState(
      {
        dropdownVisible: false,
      },
      () => {
        const config = this.getComponentConfig(this.props);
        this.ScatterChart.update(config);
      },
    );
  };
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, linkageMatch, isThumbnail } = props;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light', widgetBgColor } = customPageConfig;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const { map, displaySetup, xaxes, yaxisList, split, valueMap = {} } = reportData;
    const { xdisplay, ydisplay, colorRules, showChartType } = displaySetup;
    const styleConfig = reportData.style || {};
    const style =
      chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0)
        ? { ...styleConfig, ...chartColor }
        : styleConfig;
    const { quadrant = {} } = style;
    const data = formatChartData(map, split.controlId);
    const { position } = getLegendType(displaySetup.legendType);
    const colors = getChartColors(style, themeColor, projectId);
    const rule = _.get(colorRules[0], 'dataBarRule') || {};
    const isRuleColor = _.isEmpty(split.controlId) && !_.isEmpty(rule);
    const controlMinAndMax = isRuleColor ? getControlMinAndMax(yaxisList, data) : {};
    const getRuleColor = value => {
      const color = getStyleColor({
        value,
        controlMinAndMax,
        rule,
        controlId: rule.controlId || yaxisList[0].controlId,
      });
      return color || colors[0];
    };
    const xField = _.get(yaxisList[0], 'controlId');
    const yField = _.get(yaxisList[1], 'controlId');
    const sizeField = _.get(yaxisList[2], 'controlId');
    const base = {
      appendPadding: [20, 20, 5, 0],
      data,
      shapeField: 'originalId',
      xField,
      yField,
      sizeField,
      colorField: split.controlId,
      size: [5, 20],
      rawFields: ['originalId', xField],
      theme: {
        background: isDark ? widgetBgColor : '#ffffffcc',
      },
      color: data => {
        const controlId = data[split.controlId];
        let color = colors[0];
        if (isRuleColor) {
          const value = data[_.get(yaxisList[0], 'controlId')] || 0;
          color = getRuleColor(value);
        }
        if (split.controlId) {
          const splitIndex = _.findIndex(map, { originalKey: controlId });
          color = colors[splitIndex % colors.length] || colors[0];
        }
        if (!_.isEmpty(linkageMatch)) {
          if (linkageMatch.value === data.originalId) {
            return color;
          } else {
            return new TinyColor(color).setAlpha(0.3).toRgbString();
          }
        }
        return color;
      },
      legend:
        displaySetup.showLegend && split.controlId
          ? {
              position,
              itemName: {
                style: {
                  fill: isDark ? '#ffffffcc' : undefined,
                },
              },
            }
          : false,
      shapeLegend: false,
      shape: ({ originalId }) => {
        if (showChartType === 1) {
          return 'circle';
        } else {
          const shapes = ['circle', 'square', 'triangle', 'hexagon', 'diamond', 'bowtie'];
          const idx = this.uniq(data.map(d => d.originalId)).indexOf(originalId);
          return shapes[idx] || 'circle';
        }
      },
      meta: {
        originalId: {
          alias: xaxes.rename || xaxes.controlName || _l('维度'),
          formatter: value => {
            const item = _.find(data, { originalId: value });
            return item ? item.name || _l('空') : value;
          },
        },
        [xField]: {
          alias: _.get(yaxisList[0], 'rename') || _.get(yaxisList[0], 'controlName'),
          formatter: value => {
            return style.tooltipValueType ? formatrChartValue(value, false, yaxisList) : value;
          },
        },
        [yField]: {
          alias: _.get(yaxisList[1], 'rename') || _.get(yaxisList[1], 'controlName'),
          formatter: value => {
            return style.tooltipValueType ? formatrChartValue(value, false, yaxisList) : value;
          },
        },
        [sizeField]: {
          alias: _.get(yaxisList[2], 'rename') || _.get(yaxisList[2], 'controlName'),
          formatter: value => {
            return style.tooltipValueType ? formatrChartValue(value, false, yaxisList) : value;
          },
        },
        [split.controlId]: {
          alias: split.controlName,
          formatter: value => {
            const map = valueMap[split.controlId];
            return map ? map[value] || value : value;
          },
        },
      },
      label: displaySetup.showNumber
        ? {
            layout: [
              { type: 'interval-hide-overlap' },
              // { type: 'adjust-color' },
              { type: 'limit-in-plot' },
            ],
            content: ({ originalId }) => {
              const item = _.find(data, { originalId });
              return item ? item.name || _l('空') : originalId;
            },
            style: {
              fill: isDark ? '#ffffffcc' : undefined,
            },
          }
        : null,
      tooltip: {
        shared: true,
        showMarkers: false,
        showTitle: true,
        title: formatterTooltipTitle(xaxes, 'originalId') || 'originalId',
        fields: [
          _.get(yaxisList[0], 'controlId'),
          _.get(yaxisList[1], 'controlId'),
          _.get(yaxisList[2], 'controlId'),
          split.controlId,
        ],
        domStyles: isDark
          ? {
              'g2-tooltip': {
                color: '#ffffffcc',
                backgroundColor: widgetBgColor,
                boxShadow: `${widgetBgColor} 0px 0px 10px`,
              },
              'g2-tooltip-list-item': {
                color: '#ffffffcc',
              },
            }
          : undefined,
      },
      yAxis: {
        nice: true,
        min: _.isNumber(ydisplay.minValue) ? ydisplay.minValue : null,
        max: _.isNumber(ydisplay.maxValue) ? ydisplay.maxValue : null,
        title: ydisplay.showTitle && ydisplay.title ? { text: ydisplay.title } : null,
        label: ydisplay.showDial
          ? {
              formatter: value => {
                return value ? formatrChartAxisValue(Number(formatNumberFromInput(value)), false, yaxisList) : null;
              },
              style: {
                fill: isDark ? '#ffffffcc' : undefined,
              },
            }
          : null,
        line: {
          style: {
            stroke: '#aaa',
          },
        },
      },
      xAxis: {
        min: _.isNumber(xdisplay.minValue) ? xdisplay.minValue : null,
        max: _.isNumber(xdisplay.maxValue) ? xdisplay.maxValue : null,
        title: xdisplay.showTitle && xdisplay.title ? { text: xdisplay.title } : null,
        label: xdisplay.showDial
          ? {
              autoHide: true,
              autoEllipsis: true,
              formatter: value => {
                return value ? formatrChartAxisValue(Number(formatNumberFromInput(value)), false, yaxisList) : null;
              },
              style: {
                fill: isDark ? '#ffffffcc' : undefined,
              },
            }
          : null,
        grid: {
          line: {
            style: {
              stroke: '#eee',
            },
          },
        },
        line: {
          style: {
            stroke: '#aaa',
          },
        },
      },
      quadrant: quadrant.visible
        ? {
            xBaseline: _.isNumber(quadrant.xValue)
              ? quadrant.xValue
              : getControlMedianValue(data.map(data => data[xField])),
            yBaseline: _.isNumber(quadrant.yValue)
              ? quadrant.yValue
              : getControlMedianValue(data.map(data => data[yField])),
            lineStyle: {
              stroke: quadrant.axisColor,
            },
            regionStyle: [
              {
                fill: quadrant.topRightBgColor,
                fillOpacity: 0.1,
              },
              {
                fill: quadrant.topLeftBgColor,
                fillOpacity: 0.1,
              },
              {
                fill: quadrant.bottomLeftBgColor,
                fillOpacity: 0.1,
              },
              {
                fill: quadrant.bottomRightBgColor,
                fillOpacity: 0.1,
              },
            ],
            labels: [
              {
                content: quadrant.topRightText,
                style: {
                  fill: quadrant.textColor,
                },
              },
              {
                content: quadrant.topLeftText,
                style: {
                  fill: quadrant.textColor,
                },
              },
              {
                content: quadrant.bottomLeftText,
                style: {
                  fill: quadrant.textColor,
                },
              },
              {
                content: quadrant.bottomRightText,
                style: {
                  fill: quadrant.textColor,
                },
              },
            ],
          }
        : null,
    };
    this.setCount(props);
    return base;
  }
  setCount(props) {
    const { summary, yaxisList } = props.reportData;
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
        <Menu.Item onClick={this.handleAutoLinkage} key="autoLinkage">
          <div className="flexRow valignWrapper">
            <Icon icon="link1" className="mRight8 Gray_9e Font20 autoLinkageIcon" />
            <span>{_l('联动')}</span>
          </div>
        </Menu.Item>
        <Menu.Item onClick={this.handleRequestOriginalData} key="viewOriginalData">
          <div className="flexRow valignWrapper">
            <Icon icon="table" className="mRight8 Gray_9e Font18" />
            <span>{_l('查看原始数据')}</span>
          </div>
        </Menu.Item>
      </Menu>
    );
  }
  render() {
    const { count, originalCount, dropdownVisible, offset } = this.state;
    const { summary, displaySetup = {} } = this.props.reportData;
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
        {displaySetup.showTotal ? (
          <div className="summaryWrap pBottom10">
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">
              {count}
            </span>
          </div>
        ) : null}
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'h100'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
