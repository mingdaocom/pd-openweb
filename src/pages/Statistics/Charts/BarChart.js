import React, { Component, Fragment } from 'react';
import {
  getLegendType,
  formatControlInfo,
  formatrChartValue,
  formatrChartAxisValue,
  reportTypes,
  getMaxValue,
  getMinValue,
  formatYaxisList,
  getChartColors,
  getAlienationColor,
  getAuxiliaryLineConfig,
  getControlMinAndMax,
  getStyleColor,
  getEmptyChartData,
  formatNumberValue
} from './common';
import { Icon } from 'ming-ui';
import { Dropdown, Menu } from 'antd';
import { formatSummaryName, getIsAlienationColor, isFormatNumber, formatterTooltipTitle } from 'statistics/common';
import { toFixed } from 'src/util';
import { TinyColor } from '@ctrl/tinycolor';
import _ from 'lodash';

export const formatDataCount = (data, isVertical, newYaxisList) => {
  const result = _.toArray(_.groupBy(data, 'originalId'));
  const emptyShow = newYaxisList.length === newYaxisList.map(data => data.emptyShowType).filter(n => n === 2).length;
  return result.map(item => {
    const { originalId, name } = item[0];
    const count = item.reduce((count, item) => count + item.value, 0);
    const value = formatrChartValue(count, false, newYaxisList);
    const data = {
      type: 'text',
      position: {
        originalId,
        name,
        value: count,
      },
      content: emptyShow && !value ? '--' : value,
      style: {
        textAlign: 'center',
      },
    };
    if (isVertical) {
      data.offsetY = -15;
    } else {
      data.offsetX = 15;
    }
    return data;
  });
};

export const formatChartData = (data, yaxisList, splitControlId, xaxesControlId) => {
  if (_.isEmpty(data)) return [];
  let result = [];
  const { value } = data[0];
  value.forEach(item => {
    const name = item.x;
    data.forEach((element, index) => {
      const target = element.value.filter(n => n.originalX === item.originalX);
      if (target.length) {
        const { rename, emptyShowType } = element.c_id ? (_.find(yaxisList, { controlId: element.c_id }) || {}) : yaxisList[0];
        const hideEmptyValue = !emptyShowType && !target[0].v;
        if (!hideEmptyValue && element.originalKey) {
          result.push({
            controlId: element.c_id,
            groupName: `${splitControlId ? element.key : (rename || element.key)}-md-${reportTypes.BarChart}-chart-${element.c_id || element.originalKey}`,
            groupKey: element.originalKey,
            value: target[0].v || (emptyShowType ? 0 : null),
            name: name || (!splitControlId && !xaxesControlId ? element.originalKey : undefined),
            originalId: item.originalX || (xaxesControlId ? '' : name || element.originalKey),
          });
        }
      }
    });
  });
  if (!xaxesControlId && splitControlId && yaxisList.length) {
    if (yaxisList.length === 1) {
      result.forEach(data => {
        data.name = yaxisList[0].controlName;
        data.originalId = '';
      });
    } else {
      result = [];
      yaxisList.forEach(yaxis => {
        data.forEach(data => {
          const value = data.value[0];
          result.push({
            groupName: `${data.key}-md-${reportTypes.BarChart}-chart-${data.originalKey}`,
            groupKey: data.originalKey,
            value: (value.m && value.m[yaxis.controlId]) || 0,
            name: yaxis.controlName,
            originalId: yaxis.controlName,
          });
        });
      });
    }
  }
  return result;
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newYaxisList: [],
      dropdownVisible: false,
      offset: {},
      match: null,
      linkageMatch: null,
    }
    this.BarChart = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderBarChart(this.props);
    });
  }
  componentWillUnmount() {
    this.BarChart && this.BarChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    const chartColor = _.get(nextProps, 'customPageConfig.chartColor');
    const oldChartColor = _.get(this.props, 'customPageConfig.chartColor');
    // 显示设置
    if (
      displaySetup.fontStyle !== oldDisplaySetup.fontStyle ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      displaySetup.showPileTotal !== oldDisplaySetup.showPileTotal ||
      displaySetup.hideOverlapText !== oldDisplaySetup.hideOverlapText ||
      displaySetup.xdisplay.showDial !== oldDisplaySetup.xdisplay.showDial ||
      displaySetup.xdisplay.showTitle !== oldDisplaySetup.xdisplay.showTitle ||
      displaySetup.xdisplay.title !== oldDisplaySetup.xdisplay.title ||
      displaySetup.ydisplay.showDial !== oldDisplaySetup.ydisplay.showDial ||
      displaySetup.ydisplay.showTitle !== oldDisplaySetup.ydisplay.showTitle ||
      displaySetup.ydisplay.title !== oldDisplaySetup.ydisplay.title ||
      displaySetup.ydisplay.minValue !== oldDisplaySetup.ydisplay.minValue ||
      displaySetup.ydisplay.maxValue !== oldDisplaySetup.ydisplay.maxValue ||
      displaySetup.ydisplay.lineStyle !== oldDisplaySetup.ydisplay.lineStyle ||
      !_.isEqual(displaySetup.auxiliaryLines, oldDisplaySetup.auxiliaryLines) ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      !_.isEqual(displaySetup.percent, oldDisplaySetup.percent) ||
      style.showXAxisSlider !== oldStyle.showXAxisSlider ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(chartColor, oldChartColor) ||
      nextProps.themeColor !== this.props.themeColor ||
      !_.isEqual(nextProps.linkageMatch, this.props.linkageMatch)
    ) {
      const { BarChartConfig } = this.getComponentConfig(nextProps);
      this.BarChart.update(BarChartConfig);
    }
    // 切换图表类型 & 堆叠 & 百分比
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.isPile !== oldDisplaySetup.isPile ||
      displaySetup.isPerPile !== oldDisplaySetup.isPerPile ||
      nextProps.isLinkageData !== this.props.isLinkageData
    ) {
      this.BarChart && this.BarChart.destroy();
      this.renderBarChart(nextProps);
    }
  }
  renderBarChart(props) {
    const { reportData } = props;
    const { displaySetup, style, xaxes, split } = reportData;
    const { BarChartComponent, BarChartConfig } = this.getComponentConfig(props);
    if (this.chartEl) {
      this.BarChart = new BarChartComponent(this.chartEl, BarChartConfig);
      this.isViewOriginalData = displaySetup.showRowList && props.isViewOriginalData;
      this.isLinkageData = props.isLinkageData && !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) && (xaxes.controlId || split.controlId);
      if (this.isViewOriginalData || this.isLinkageData) {
        this.BarChart.on('element:click', this.handleClick);
      }
      this.BarChart && this.BarChart.render();
    }
  }
  handleClick = (data) => {
    const { xaxes, split, appId, reportId, name, reportType, style } = this.props.reportData;
    const event = data.gEvent;
    const currentData = data.data;
    const param = {};
    const linkageMatch = {
      sheetId: appId,
      reportId,
      reportName: name,
      reportType,
      filters: []
    };
    if (xaxes.cid) {
      const isNumber = isFormatNumber(xaxes.controlType);
      const value = currentData.data.name ? currentData.data.originalId : '';
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
      linkageMatch.value = value;
      linkageMatch.filters.push({
        controlId: xaxes.controlId,
        values: [param[xaxes.cid]],
        controlName: xaxes.controlName,
        controlValue: currentData.data.name,
        type: xaxes.controlType,
        control: xaxes
      });
    }
    if (split.controlId) {
      const isNumber = isFormatNumber(split.controlType);
      const value = currentData.data.groupKey;
      param[split.cid] = isNumber && value ? Number(value) : value;
      if (!xaxes.cid) {
        linkageMatch.value = currentData.data.originalId;
      }
      linkageMatch.filters.push({
        controlId: split.controlId,
        values: [param[split.cid]],
        controlName: split.controlName,
        controlValue: formatControlInfo(currentData.data.groupName).name,
        type: split.controlType,
        control: split
      });
    }
    if (_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length) {
      linkageMatch.onlyChartIds = style.autoLinkageChartObjectIds;
    }
    const isAll = this.isViewOriginalData && this.isLinkageData;
    this.setState({
      dropdownVisible: isAll,
      offset: {
        x: event.x + 20,
        y: event.y
      },
      match: param,
      linkageMatch
    }, () => {
      if (!isAll && this.isViewOriginalData) {
        this.handleRequestOriginalData();
      }
      if (!isAll && this.isLinkageData) {
        this.handleAutoLinkage();
      }
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
  handleAutoLinkage = () => {
    const { linkageMatch } = this.state;
    this.props.onUpdateLinkageFiltersGroup(linkageMatch);
    this.setState({
      dropdownVisible: false,
    }, () => {
      const { BarChartConfig } = this.getComponentConfig(this.props);
      this.BarChart.update(BarChartConfig);
    });
  }
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, linkageMatch } = props;
    const { chartColor, chartColorIndex = 1 } = customPageConfig;
    const { map, displaySetup, xaxes, yaxisList, split, reportId, summary } = reportData;
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const {
      isPile,
      isPerPile,
      showPileTotal,
      hideOverlapText,
      fontStyle,
      legendType,
      showChartType,
      showLegend,
      showNumber,
      ydisplay,
      auxiliaryLines,
      colorRules,
      percent,
    } = displaySetup;
    const showPercent = percent.enable;
    const { position } = getLegendType(legendType);
    const data = formatChartData(map, yaxisList, split.controlId, xaxes.controlId);
    const isVertical = showChartType === 1;
    const newYaxisList = formatYaxisList(data, yaxisList);
    const countConfig = showPileTotal && isPile && (yaxisList.length > 1 || split.controlId) ? formatDataCount(data, isVertical, newYaxisList) : [];
    const maxValue = getMaxValue(data);
    const minValue = getMinValue(data);
    const colors = getChartColors(style, themeColor, projectId);
    const isNewChart = _.isUndefined(reportId) && _.isEmpty(style);
    const isAlienationColor = getIsAlienationColor(props.reportData);
    const isOptionsColor = isNewChart ? isAlienationColor : (style ? (style.colorType === 0 && isAlienationColor) : false);
    const isCustomColor = style ? (style.colorType === 2 && isAlienationColor) : false;
    const auxiliaryLineConfig = getAuxiliaryLineConfig(auxiliaryLines, data, { yaxisList: isPile || isPerPile ? [] : yaxisList, colors });
    const rule = _.get(colorRules[0], 'dataBarRule') || {};
    const isRuleColor = yaxisList.length === 1 && _.isEmpty(split.controlId) && !_.isEmpty(rule);
    const controlMinAndMax = isRuleColor ? getControlMinAndMax(yaxisList, data) : {};

    const getRuleColor = value => {
      const color = getStyleColor({
        value,
        controlMinAndMax,
        rule,
        controlId: yaxisList[0].controlId
      });
      return color || colors[0];
    }

    const baseConfig = {
      data: data.length ? data : getEmptyChartData(reportData),
      appendPadding: isVertical ? [25, 0, 5, 0] : [10, 70, 0, 0],
      seriesField: (isOptionsColor || isCustomColor) ? 'originalId' : 'groupName',
      meta: {
        originalId: {
          type: 'cat',
          formatter: value => {
            const item = _.find(data, { originalId: value });
            return item ? item.name || _l('空') : value;
          }
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
      },
      xField: isVertical ? 'originalId' : 'value',
      yField: isVertical ? 'value' : 'originalId',
      xAxis: isVertical
        ? this.getxAxis(displaySetup, xaxes)
        : this.getyAxis(displaySetup, newYaxisList),
      yAxis: isVertical
        ? this.getyAxis(displaySetup, newYaxisList)
        : this.getxAxis(displaySetup, xaxes),
      animation: true,
      slider: style.showXAxisSlider ? {
        start: 0,
        end: 0.5,
        formatter: () => null
      } : undefined,
      rawFields: ['groupName', 'controlId', 'originalId'].concat(split.controlId ? undefined : 'value'),
      theme: {
        styleSheet: {
          backgroundColor: '#fff'
        }
      },
      color: data => {
        const controlId = formatControlInfo(data.groupName).id;
        const controlIndex = _.findIndex(yaxisList, { controlId });
        let color = colors[controlIndex % colors.length];
        if (isRuleColor) {
          const item = _.find(baseConfig.data, { originalId: data.originalId });
          color = getRuleColor(item.value);
        }
        if (split.controlId) {
          const splitIndex = _.findIndex(map, { originalKey: controlId });
          color = colors[splitIndex % colors.length] || colors[0];
        }
        if (isOptionsColor) {
          color = getAlienationColor(xaxes, data);
        }
        if (isCustomColor) {
          const index = _.findIndex(baseConfig.data, { originalId: data.originalId });
          color = colors[index % colors.length];
        }
        if (split.controlId && style.colorType === 0 && _.get(split, 'options.length')) {
          const optionsColors = split.options.map(c => c.color).filter(c => c);
          if (optionsColors.length) {
            const option = _.find(split.options, { key: controlId }) || {};
            color = option.color;
          }
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
      legend: showLegend && (yaxisList.length > 1 || split.controlId)
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
        title: formatterTooltipTitle(xaxes),
        formatter: (item) => {
          const { value, groupName } = item;
          const { name, id } = formatControlInfo(groupName);
          const getLabelPercent = value => {
            const { originalId } = item;
            if (showPercent) {
              if (yaxisList.length > 1) {
                const result = _.filter(data, { originalId });
                const count = _.reduce(result, (total, item) => total + item.value, 0);
                const percentValue = value && count ? formatNumberValue((value / count * 100), percent) : undefined;
                return (percentValue && count) ? `(${percentValue}%)` : '';
              }
              if (displaySetup.showTotal) {
                const controlId = split.controlId ? newYaxisList[0].controlId : id;
                const count = summary.all ? summary.sum : _.get((summary.controlList ? _.find(summary.controlList, { controlId }) : summary), 'sum');
                const percentValue = formatNumberValue(value / count * 100, percent);
                return (percentValue && count) ? `(${percentValue}%)` : '';
              }
              return '';
            }
            return '';
          }
          if (isOptionsColor || isCustomColor) {
            const { value } = item;
            const name = yaxisList[0].controlName;
            return {
              name,
              value: _.isNumber(value) ? `${value} ${getLabelPercent(value)}` : '--'
            }
          }
          const labelValue = `${formatrChartValue(value, isPerPile, newYaxisList, value ? undefined : id)} ${getLabelPercent(value)}`;
          if (isPerPile) {
            return {
              name,
              value: style.tooltipValueType ? labelValue : `${toFixed(value * 100, Number.isInteger(value) ? 0 : 2)}%`
            }
          } else {
            const { dot } = _.find(yaxisList, { controlId: id }) || {};
            return {
              name,
              value: _.isNumber(value) ? style.tooltipValueType ? labelValue : `${value.toLocaleString('zh', { minimumFractionDigits: dot })} ${getLabelPercent(value)}` : '--'
            }
          }
        }
      },
      label: showNumber || showPercent
        ? {
            position: isPile || isPerPile ? 'middle' : isVertical ? 'top' : 'right',
            layout: [
              hideOverlapText ? { type: 'hide-overlap' } : null,
              { type: 'adjust-color' },
              (ydisplay.maxValue && ydisplay.maxValue < maxValue) || (ydisplay.minValue && ydisplay.minValue > minValue) ? { type: 'limit-in-plot' } : null,
            ],
            content: (labelData) => {
              const { value, groupName, controlId, originalId } = labelData;
              const id = split.controlId ? newYaxisList[0].controlId : controlId;
              const labelValue = formatrChartValue(value, isPerPile, newYaxisList, value ? undefined : id);
              if (showPercent && !isPerPile) {
                if (yaxisList.length > 1) {
                  const result = _.filter(data, { originalId });
                  const count = _.reduce(result, (total, item) => total + item.value, 0);
                  const percentValue = value && count ? formatNumberValue((value / count * 100), percent) : undefined;
                  if (showNumber && showPercent && count) {
                    return `${labelValue} ${percentValue ? `(${percentValue}%)` : ''}`;
                  }
                  if (showPercent && percentValue && count) {
                    return `${percentValue}%`;
                  }
                  return labelValue;
                }
                if (displaySetup.showTotal) {
                  const count = summary.all ? summary.sum : _.get((summary.controlList ? _.find(summary.controlList, { controlId: id }) : summary), 'sum');
                  const percentValue = formatNumberValue(value / count * 100, percent);
                  if (showNumber && showPercent && count) {
                    return `${labelValue} ${percentValue ? `(${percentValue}%)` : ''}`;
                  }
                  if (showPercent && percentValue && count) {
                    return `${percentValue}%`;
                  }
                }
                return labelValue;
              } else {
                return labelValue;
              }
            },
          }
        : false,
      annotations: [
        ...countConfig,
        ...auxiliaryLineConfig
      ],
    };

    this.setState({ newYaxisList });

    if (isVertical) {
      baseConfig.maxColumnWidth = 160;
    } else {
      baseConfig.maxBarWidth = 160;
    }

    if (isPile) {
      // 堆叠
      baseConfig.isStack = true;
    } else if (isPerPile) {
      // 百分比
      baseConfig.isPercent = true;
      baseConfig.isStack = true;
    } else {
      const splitList = split.controlId ? _.uniqBy(data, 'name') : [];
      // 分组
      baseConfig.isGroup = (isOptionsColor || isCustomColor || splitList.length === data.length) ? false : true;
    }

    const { Column, Bar } = this.g2plotComponent;

    return {
      BarChartComponent: isVertical ? Column : Bar,
      BarChartConfig: baseConfig,
    };
  }
  getyAxis(displaySetup, yaxisList) {
    const { isPerPile, ydisplay } = displaySetup;
    return {
      minLimit: _.isNumber(ydisplay.minValue) ? ydisplay.minValue : null,
      maxLimit: isPerPile ? 1 : ydisplay.maxValue || null,
      title:
        ydisplay.showTitle && ydisplay.title
          ? {
              text: ydisplay.title,
            }
          : null,
      label: ydisplay.showDial
        ? {
            formatter: (value) => {
              return value ? formatrChartAxisValue(Number(value), isPerPile, yaxisList) : null;
            },
          }
        : null,
      grid: {
        line: ydisplay.showDial
          ? {
              style: {
                lineDash: ydisplay.lineStyle === 1 ? [] : [4, 5],
              },
            }
          : null,
      },
    };
  }
  getxAxis(displaySetup, { particleSizeType, showFormat = '0' }) {
    const { fontStyle, xdisplay, ydisplay } = displaySetup;
    return {
      title:
        xdisplay.showTitle && xdisplay.title
          ? {
              text: xdisplay.title,
            }
          : null,
      label: xdisplay.showDial
        ? {
            autoRotate: fontStyle ? true : false,
            autoHide: true,
            autoEllipsis: true,
            formatter: (name, item) => {
              return particleSizeType === 6 && showFormat === '0' ? _l('%0时', name) : name;
            },
          }
        : null,
      line: ydisplay.lineStyle === 1 ? {} : null,
    };
  }
  setCount(yaxisList) {
    const { summary } = this.props.reportData;
    const value = summary.sum;
    const count = formatrChartValue(value, false, yaxisList);
    this.setState({
      originalCount: value.toLocaleString() == count ? 0 : value.toLocaleString(),
      count
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
  renderCount() {
    const { newYaxisList } = this.state;
    const { summary, yaxisList } = this.props.reportData;
    const get = value => {
      const count = formatrChartValue(value, false, newYaxisList);
      const originalCount = value.toLocaleString() == count ? 0 : value.toLocaleString();
      return {
        count,
        originalCount
      }
    }
    const renderItem = data => {
      const { count, originalCount } = get(data.sum);
      return (
        <Fragment>
          <span>{formatSummaryName(data)}: </span>
          <span data-tip={originalCount ? originalCount : null} className="count Font22">{count || 0}</span>
        </Fragment>
      );
    }

    if ('all' in summary) {
      const { all, controlList = [] } = summary;
      return (
        <div className="flexRow" style={{ flexWrap: 'wrap' }}>
          {all && (
            <div className="flexRow mRight10" style={{ alignItems: 'baseline' }}>
              {renderItem(summary)}
            </div>
          )}
          {controlList.map(data => (
            <div className="flexRow mRight10" style={{ alignItems: 'baseline' }}>
              {renderItem({
                ...data,
                name: data.name || _.get(_.find(yaxisList, { controlId: data.controlId }), 'controlName')
              })}
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="pBottom10">
          {renderItem(summary)}
        </div>
      );
    }
  }
  render() {
    const { dropdownVisible, offset } = this.state;
    const { summary, displaySetup = {} } = this.props.reportData;
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
        {displaySetup.showTotal && this.renderCount()}
        <div className="h100" ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
