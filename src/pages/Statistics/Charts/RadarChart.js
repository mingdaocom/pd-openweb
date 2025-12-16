import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { formatSummaryName, formatterTooltipTitle, isFormatNumber } from 'statistics/common';
import {
  formatControlInfo,
  formatrChartAxisValue,
  formatrChartValue,
  formatYaxisList,
  getAuxiliaryLineConfig,
  getChartColors,
  getEmptyChartData,
  getLegendType,
  reportTypes,
} from './common';

const formatChartData = (data, yaxisList, splitControlId, xaxesControlId, minValue, maxValue) => {
  if (!data.length) return [];
  let result = [];
  const { value } = data[0];
  const formatValue = value => {
    if (_.isNumber(minValue) && value < minValue) return minValue;
    if (_.isNumber(maxValue) && value > maxValue) return maxValue;
    return value;
  };
  value.forEach(item => {
    const name = item.x;
    data.forEach((element, index) => {
      const target = element.value.filter(n => n.x === name);
      if (target.length) {
        const { rename, emptyShowType } = element.c_id
          ? _.find(yaxisList, { controlId: element.c_id }) || {}
          : yaxisList[0];
        const hideEmptyValue = !emptyShowType && !target[0].v;
        if (!hideEmptyValue) {
          const value = target[0].v;
          result.push({
            groupName: `${splitControlId ? element.key : rename || element.key}-md-${reportTypes.RadarChart}-chart-${element.c_id || index}`,
            groupKey: element.originalKey,
            value: formatValue(value) || (emptyShowType ? 0 : null),
            originalValue: value,
            name: name || (!splitControlId && !xaxesControlId ? element.originalKey : undefined),
            originalId: item.originalX || name || element.originalKey,
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
            groupName: data.key,
            groupKey: data.originalKey,
            value: formatValue(value.m[yaxis.controlId]),
            originalValue: value.m[yaxis.controlId],
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
      originalCount: 0,
      count: 0,
      dropdownVisible: false,
      offset: {},
      match: null,
      linkageMatch: null,
    };
    this.RadarChart = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.RadarComponent = data.Radar;
      this.renderRadarChart(this.props);
    });
  }
  componentWillUnmount() {
    this.RadarChart && this.RadarChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    // 显示设置
    if (
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      displaySetup.ydisplay.minValue !== oldDisplaySetup.ydisplay.minValue ||
      displaySetup.ydisplay.maxValue !== oldDisplaySetup.ydisplay.maxValue ||
      !_.isEqual(displaySetup.auxiliaryLines, oldDisplaySetup.auxiliaryLines) ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(
        _.pick(nextProps.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
        _.pick(this.props.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
      ) ||
      nextProps.themeColor !== this.props.themeColor ||
      !_.isEqual(nextProps.linkageMatch, this.props.linkageMatch)
    ) {
      const config = this.getComponentConfig(nextProps);
      this.RadarChart && this.RadarChart.update(config);
    }
    if (nextProps.isLinkageData !== this.props.isLinkageData) {
      this.RadarChart && this.RadarChart.destroy();
      this.renderRadarChart(nextProps);
    }
  }
  renderRadarChart(props) {
    const { reportData } = props;
    const { displaySetup, style, xaxes, split } = reportData;
    const config = this.getComponentConfig(props);
    if (this.chartEl) {
      this.RadarChart = new this.RadarComponent(this.chartEl, config);
      this.isViewOriginalData = displaySetup.showRowList && props.isViewOriginalData;
      this.isLinkageData =
        props.isLinkageData &&
        !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) &&
        (xaxes.controlId || split.controlId);
      if (this.isViewOriginalData || this.isLinkageData) {
        this.RadarChart.on('element:click', this.handleClick);
      }
      this.RadarChart.render();
    }
  }
  handleClick = ({ data, gEvent }) => {
    const { xaxes, split, appId, reportId, name, reportType, style } = this.props.reportData;
    const currentData = data.data;
    const param = {};
    const linkageMatch = {
      sheetId: appId,
      reportId,
      reportName: name,
      reportType,
      filters: [],
    };
    if (_.isArray(currentData)) {
      return;
    }
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
      const value = currentData.groupKey;
      param[split.cid] = isNumber && value ? Number(value) : value;
      if (!xaxes.cid) {
        linkageMatch.value = currentData.originalId;
      }
      linkageMatch.filters.push({
        controlId: split.controlId,
        values: [param[split.cid]],
        controlName: split.controlName,
        controlValue: formatControlInfo(currentData.groupName).name,
        type: split.controlType,
        control: split,
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
          x: gEvent.x + 20,
          y: gEvent.y,
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
        this.RadarChart.update(config);
      },
    );
  };
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, isThumbnail } = props;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light', widgetBgColor } = customPageConfig;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const { map, displaySetup, yaxisList, split, xaxes } = reportData;
    const styleConfig = reportData.style || {};
    const style =
      chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0)
        ? { ...styleConfig, ...chartColor }
        : styleConfig;
    const { position } = getLegendType(displaySetup.legendType);
    const { ydisplay, auxiliaryLines } = displaySetup;
    const data = formatChartData(
      map,
      yaxisList,
      split.controlId,
      xaxes.controlId,
      ydisplay.minValue,
      ydisplay.maxValue,
    );
    const newYaxisList = formatYaxisList(data, yaxisList);
    const colors = getChartColors(style, themeColor, projectId);
    const auxiliaryLineConfig = getAuxiliaryLineConfig(auxiliaryLines, data, { yaxisList, colors });

    const baseConfig = {
      data: data.length ? data : getEmptyChartData(reportData),
      appendPadding: [5, 0, 5, 0],
      xField: 'originalId',
      yField: 'value',
      seriesField: 'groupName',
      meta: {
        originalId: {
          type: 'cat',
          formatter: value => {
            const item = _.find(data, { originalId: value });
            return item ? item.name || _l('空') : value;
          },
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
        value: {
          min: 0,
        },
      },
      xAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            style: {
              lineDash: null,
            },
          },
        },
        label: {
          offset: 23,
          autoHide: false,
          autoEllipsis: true,
          style: {
            fill: isDark ? '#ffffffb0' : undefined,
          },
        },
        verticalLimitLength: 120,
      },
      yAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            type: 'line',
            style: {
              lineDash: null,
              stroke: isDark ? '#ffffff6b' : undefined,
            },
          },
          alternateColor: isDark ? undefined : 'rgba(250, 250, 250, 0.7)',
        },
        label: {
          formatter: value => {
            return formatrChartAxisValue(Number(value), false, newYaxisList);
          },
          style: {
            fill: isDark ? '#ffffffb0' : undefined,
          },
        },
        minLimit: ydisplay.minValue || null,
        maxLimit: ydisplay.maxValue || (data.length ? null : 5),
      },
      limitInPlot: true,
      area: {},
      theme: {
        background: isDark || widgetBgColor === 'transparent' ? widgetBgColor : '#ffffffcc',
      },
      color: colors,
      tooltip: {
        shared: true,
        showCrosshairs: false,
        showMarkers: true,
        title: formatterTooltipTitle(xaxes),
        formatter: ({ originalId, groupName }) => {
          const { name, id } = formatControlInfo(groupName);
          const { dot } = _.find(yaxisList, { controlId: id }) || {};
          const { originalValue } = _.find(data, { originalId, groupName }) || {};
          const labelValue = formatrChartValue(originalValue, false, newYaxisList, originalValue ? undefined : id);
          return {
            name,
            value: _.isNumber(originalValue)
              ? style.tooltipValueType
                ? labelValue
                : originalValue.toLocaleString('zh', { minimumFractionDigits: dot })
              : '--',
          };
        },
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
      legend:
        displaySetup.showLegend && (yaxisList.length > 1 || split.controlId)
          ? {
              position,
              flipPage: true,
              itemHeight: 20,
              radio: { style: { r: 6 } },
              itemName: {
                style: {
                  fill: isDark ? '#ffffffb0' : undefined,
                },
              },
            }
          : false,
      point: displaySetup.showNumber
        ? {
            shape: 'circle',
            size: 3,
          }
        : false,
      label: displaySetup.showNumber
        ? {
            content: ({ originalValue, controlId }) => {
              const id = split.controlId ? newYaxisList[0].controlId : controlId;
              return formatrChartValue(originalValue, false, newYaxisList, originalValue ? undefined : id);
            },
            style: {
              fill: isDark ? '#ffffffb0' : undefined,
            },
          }
        : false,
      annotations: _.flatten(
        auxiliaryLineConfig.map(item => {
          const { start, text } = item;
          const textConfig = {
            type: 'text',
            offsetX: 5,
            position: [0, start[1]],
            content: text ? text.content : '',
            style: text ? text.style : undefined,
          };

          return [textConfig];
        }),
      ),
    };

    this.setCount(newYaxisList);

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
          <div className="summaryWrap">
            <span>{formatSummaryName(summary)}: </span>
            <Tooltip title={originalCount ? originalCount : null}>
              <span className="count">{count}</span>
            </Tooltip>
          </div>
        ) : null}
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'h100'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
