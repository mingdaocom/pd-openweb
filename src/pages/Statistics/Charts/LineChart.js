import React, { Component, Fragment } from 'react';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { formatSummaryName, formatterTooltipTitle, isFormatNumber, isTimeControl } from 'statistics/common';
import { toFixed } from 'src/utils/control';
import {
  formatControlInfo,
  formatrChartAxisValue,
  formatrChartValue,
  formatYaxisList,
  getAuxiliaryLineConfig,
  getChartColors,
  getEmptyChartData,
  getLegendType,
  getMaxValue,
  getMinValue,
  reportTypes,
} from './common';

const lastDateText = _l('上一期');

const mergeDataTime = (data, contrastData) => {
  const maxLengthData = data.length > contrastData.length ? data : contrastData;
  const newData = data.map((item, index) => {
    item.originalName = item.originalId;
    item.originalId = maxLengthData[index].originalId;
    return item;
  });
  const newcontrastData = contrastData.map((item, index) => {
    item.originalName = item.originalId;
    item.originalId = maxLengthData[index].originalId;
    item.isContrast = true;
    return item;
  });
  return newData.concat(newcontrastData);
};

const mergeData = (data, contrastData) => {
  const longData = data.length >= contrastData.length ? data : contrastData;
  const shortData = data.length < contrastData.length ? data : contrastData;
  const newData = longData.map(item => {
    const { originalId } = item;
    const shortItem = _.find(shortData, { originalId });
    return data.length >= contrastData.length ? [item, shortItem] : [shortItem, item];
  });
  const result = _.flatten(newData).filter(_ => _);
  const notFindData = shortData.filter(item => {
    return !_.find(result, { originalId: item.originalId });
  });
  return notFindData.concat(result);
};

export const formatChartData = (data, yaxisList, { isPile, isAccumulate }, splitControlId) => {
  if (_.isEmpty(data)) return [];
  const result = [];
  const cloneData = _.cloneDeep(data);
  const { value } = cloneData[0];
  if (isAccumulate) {
    cloneData.map(item => {
      item.value.map((n, index) => {
        const lastn = item.value[index - 1];
        n.v = n.v + (lastn ? lastn.v : 0);
        return n;
      });
      return item;
    });
  }
  value.forEach(item => {
    const name = item.originalX;
    cloneData.forEach((element, index) => {
      const lastElement = cloneData[index - 1];
      const lastValue = lastElement && isPile ? lastElement.value.filter(n => n.originalX === item.originalX)[0].v : 0;
      const current = element.value.filter(n => {
        if (isPile && n.originalX === name) {
          n.v = n.v + lastValue;
        }
        return n.originalX === name;
      });
      if (current.length) {
        const { rename, emptyShowType } = element.c_id
          ? _.find(yaxisList, { controlId: element.c_id }) || {}
          : yaxisList[0];
        const hideEmptyValue = !emptyShowType && current[0].v === null;
        if (!hideEmptyValue && element.originalKey) {
          result.push({
            controlId: element.c_id,
            groupName: `${splitControlId ? element.key : rename || element.key}-md-${reportTypes.LineChart}-chart-${element.c_id || index}`,
            groupKey: element.originalKey,
            value: current[0].v || (emptyShowType ? 0 : null),
            name: item.x,
            originalId: item.originalX || item.x,
          });
        }
      }
    });
  });
  return result;
};

const getLineValue = value => {
  if (value) {
    return [
      {
        type: 'line',
        start: ['min', value],
        end: ['max', value],
        style: {
          stroke: '#151515',
        },
      },
    ];
  } else {
    return [];
  }
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newYaxisList: [],
      dropdownVisible: false,
      offset: {},
      contrastType: false,
      match: null,
      linkageMatch: null,
    };
    this.LineChart = null;
    this.g2plotComponent = {};
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderLineChart(this.props);
    });
  }
  componentWillUnmount() {
    this.LineChart && this.LineChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    // 显示设置
    if (
      displaySetup.fontStyle !== oldDisplaySetup.fontStyle ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.lifecycleValue !== oldDisplaySetup.lifecycleValue ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.hideOverlapText !== oldDisplaySetup.hideOverlapText ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
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
      style.showXAxisSlider !== oldStyle.showXAxisSlider ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(style.chartShowLabelIds, oldStyle.chartShowLabelIds) ||
      !_.isEqual(
        _.pick(nextProps.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
        _.pick(this.props.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
      ) ||
      nextProps.themeColor !== this.props.themeColor ||
      !_.isEqual(nextProps.linkageMatch, this.props.linkageMatch)
    ) {
      const { LineChartConfig } = this.getComponentConfig(nextProps);
      if (this.LineChart) {
        this.LineChart.update(LineChartConfig);
        this.LineChart.render();
      }
    }
    // 切换图表类型 & 堆叠 & 累计 & 百分比
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.isPile !== oldDisplaySetup.isPile ||
      displaySetup.isAccumulate !== oldDisplaySetup.isAccumulate ||
      displaySetup.isPerPile !== oldDisplaySetup.isPerPile ||
      nextProps.isLinkageData !== this.props.isLinkageData
    ) {
      this.LineChart && this.LineChart.destroy();
      this.renderLineChart(nextProps);
    }
  }
  renderLineChart(props) {
    const { reportData } = props;
    const { displaySetup, style, xaxes, split } = reportData;
    const { LineChartComponent, LineChartConfig } = this.getComponentConfig(props);
    if (this.chartEl) {
      this.LineChart = new LineChartComponent(this.chartEl, LineChartConfig);
      this.isViewOriginalData = displaySetup.showRowList && props.isViewOriginalData;
      this.isLinkageData =
        props.isLinkageData &&
        !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) &&
        (xaxes.controlId || split.controlId);
      if (this.isViewOriginalData || this.isLinkageData) {
        this.LineChart.on('element:click', this.handleClick);
      }
      this.LineChart.render();
    }
  }
  handleClick = ({ data, gEvent }) => {
    const { xaxes, split, displaySetup, appId, reportId, name, reportType, style } = this.props.reportData;
    const { contrastType } = displaySetup;
    const currentData = data.data;
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
      param[xaxes.cid] = contrastType ? currentData.originalName : isNumber && value ? Number(value) : value;
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
        controlValue: _.get(formatControlInfo(currentData.groupName), 'name'),
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
        contrastType: currentData.isContrast ? contrastType : undefined,
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
    const { match, contrastType } = this.state;
    this.setState({ dropdownVisible: false });
    const data = {
      isPersonal: false,
      contrastType,
      match,
    };
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
        const { LineChartConfig } = this.getComponentConfig(this.props);
        this.LineChart.update(LineChartConfig);
      },
    );
  };
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, isThumbnail } = props;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light', widgetBgColor } = customPageConfig;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const { map, contrastMap, displaySetup, xaxes, yaxisList, split } = reportData;
    const { isPile, isPerPile, isAccumulate, xdisplay, ydisplay, legendType, auxiliaryLines } = displaySetup;
    const styleConfig = reportData.style || {};
    const style =
      chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0)
        ? { ...styleConfig, ...chartColor }
        : styleConfig;
    const { position } = getLegendType(legendType);
    const { length = 0 } = _.isEmpty(map) ? _.get(contrastMap[0], 'value') || {} : _.get(map[0], 'value') || {};
    const { chartShowLabelIds = ['all'] } = style;
    const isPercentStackedArea = displaySetup.showChartType == 2 && isPerPile;
    const LineValue = isPercentStackedArea
      ? 0
      : (displaySetup.lifecycleValue / length) * (displaySetup.isAccumulate ? length : 1);
    const sortData = formatChartData(map, yaxisList, displaySetup, split.controlId);
    const newYaxisList = formatYaxisList(sortData, yaxisList);
    const maxValue = getMaxValue(
      sortData,
      contrastMap.length ? formatChartData(contrastMap, yaxisList, displaySetup, split.controlId) : null,
    );
    const minValue = getMinValue(
      sortData,
      contrastMap.length ? formatChartData(contrastMap, yaxisList, displaySetup, split.controlId) : null,
    );
    const { Line, Area } = this.g2plotComponent;
    const ChartComponent = displaySetup.showChartType === 2 ? Area : Line;
    const colors = getChartColors(style, themeColor, projectId);
    const auxiliaryLineConfig = getAuxiliaryLineConfig(auxiliaryLines, sortData, {
      yaxisList: isPile || isPerPile || isAccumulate ? [] : yaxisList,
      colors,
    });

    this.setState({ newYaxisList });

    const baseConfig = {
      appendPadding: [15, 15, 5, 0],
      seriesField: 'groupName',
      xField: 'originalId',
      yField: 'value',
      meta: {
        originalId: {
          type: 'cat',
          range: [0, 1],
          formatter: value => {
            const item = _.find(sortData, { originalId: value });
            return item ? item.name || _l('空') : value;
          },
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
        value: {
          nice: false,
        },
      },
      theme: {
        background: isDark ? widgetBgColor : '#ffffffcc',
      },
      connectNulls: xaxes.emptyType !== 3,
      smooth: displaySetup.showChartType,
      animation: true,
      slider: style.showXAxisSlider
        ? {
            start: 0,
            end: 0.5,
            formatter: () => null,
          }
        : undefined,
      legend:
        displaySetup.showLegend && (yaxisList.length > 1 || split.controlId || contrastMap.length)
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
      yAxis: {
        minLimit: _.isNumber(ydisplay.minValue) ? ydisplay.minValue : null,
        maxLimit: ydisplay.maxValue || (LineValue > maxValue ? parseInt(LineValue) + parseInt(LineValue / 5) : null),
        title:
          ydisplay.showTitle && ydisplay.title
            ? {
                text: ydisplay.title,
                style: {
                  fill: isDark ? '#ffffffb0' : undefined,
                },
              }
            : null,
        label: ydisplay.showDial
          ? {
              formatter: value => {
                return value ? formatrChartAxisValue(Number(value), isPercentStackedArea, newYaxisList) : null;
              },
              style: {
                fill: isDark ? '#ffffffb0' : undefined,
              },
            }
          : null,
        grid: {
          line: ydisplay.showDial
            ? {
                style: {
                  stroke: isDark ? '#ffffff6b' : undefined,
                  lineDash: ydisplay.lineStyle === 1 ? [] : [4, 5],
                },
              }
            : null,
        },
      },
      xAxis: {
        title:
          xdisplay.showTitle && xdisplay.title
            ? {
                text: xdisplay.title,
                style: {
                  fill: isDark ? '#ffffffb0' : undefined,
                },
              }
            : null,
        label: xdisplay.showDial
          ? {
              autoRotate: displaySetup.fontStyle ? true : false,
              autoHide: true,
              formatter: name => {
                return xaxes.particleSizeType === 6 && xaxes.showFormat === '0' ? _l('%0时', name) : name;
              },
              style: {
                fill: isDark ? '#ffffffb0' : undefined,
              },
            }
          : null,
        line: ydisplay.lineStyle === 1 ? {} : null,
      },
      tooltip: {
        shared: true,
        showCrosshairs: true,
        title: formatterTooltipTitle(xaxes),
        formatter: ({ value, groupName }) => {
          const { name, id } = formatControlInfo(groupName);
          const labelValue = formatrChartValue(value, isPerPile, newYaxisList, value ? undefined : id);
          if (isPercentStackedArea) {
            return {
              name,
              value: style.tooltipValueType ? labelValue : `${toFixed(value * 100, Number.isInteger(value) ? 0 : 2)}%`,
            };
          } else {
            const { dot } = _.find(yaxisList, { controlId: id }) || {};
            return {
              name,
              value: _.isNumber(value)
                ? style.tooltipValueType
                  ? labelValue
                  : value.toLocaleString('zh', { minimumFractionDigits: dot })
                : '--',
            };
          }
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
      point: displaySetup.showNumber
        ? {
            shape: 'point',
            size: 3,
          }
        : false,
      label: displaySetup.showNumber
        ? {
            layout: [
              displaySetup.hideOverlapText ? { type: 'hide-overlap' } : null,
              (ydisplay.maxValue && ydisplay.maxValue < maxValue) || (ydisplay.minValue && ydisplay.minValue > minValue)
                ? { type: 'limit-in-plot' }
                : null,
            ],
            content: ({ value, controlId }) => {
              const render = () => {
                const id = split.controlId ? newYaxisList[0].controlId : controlId;
                return formatrChartValue(value, isPercentStackedArea, newYaxisList, value ? undefined : id);
              };
              if (chartShowLabelIds.length && chartShowLabelIds.includes('all')) {
                return render();
              }
              if (chartShowLabelIds.length && !chartShowLabelIds.includes(controlId)) {
                return;
              }
              return render();
            },
            style: {
              fill: isDark ? '#ffffffb0' : undefined,
            },
          }
        : false,
      annotations: [...getLineValue(LineValue), ...auxiliaryLineConfig],
    };
    if ([0, 1].includes(displaySetup.showChartType)) {
      baseConfig.lineStyle = {
        lineWidth: 3,
      };
    }
    if (displaySetup.showChartType == 2) {
      baseConfig.isStack = displaySetup.isPerPile;
      baseConfig.isPercent = displaySetup.isPerPile;
      baseConfig.line = {
        size: 2,
      };
    }

    if (_.isEmpty(contrastMap)) {
      return {
        LineChartComponent: ChartComponent,
        LineChartConfig: Object.assign({}, baseConfig, {
          data: sortData.length ? sortData : getEmptyChartData(reportData),
          color: colors,
        }),
      };
    } else {
      const contrastData = formatChartData(
        contrastMap.map(item => {
          item.key = lastDateText;
          return item;
        }),
        yaxisList,
        displaySetup,
        split.controlId,
      );
      const isTime = isTimeControl(xaxes.controlType);
      const newData = isTime ? mergeDataTime(sortData, contrastData) : mergeData(sortData, contrastData);
      const data = sortData.length >= contrastData.length ? sortData : contrastData;
      baseConfig.meta.originalId.formatter = value => {
        const item = _.find(data, { originalId: value });
        return item ? item.name || _l('空') : value;
      };
      return {
        LineChartComponent: ChartComponent,
        LineChartConfig: Object.assign({}, baseConfig, {
          data: newData,
          color: ['#64B5F6', '#CCC'],
          tooltip: {
            showTitle: false,
            shared: true,
            showCrosshairs: true,
            formatter: ({ value, groupName, originalId: xName }) => {
              const { name, id } = formatControlInfo(groupName);
              const { dot } = _.find(yaxisList, { controlId: id }) || {};
              const newValue = _.isNumber(value) ? value.toLocaleString('zh', { minimumFractionDigits: dot }) : '--';
              if (name === lastDateText) {
                const item = _.find(contrastData, { originalId: xName }) || {};
                const xAxisName = isTime ? item.originalName : item.name;
                return {
                  name: xAxisName ? `${name} ${xAxisName} ` : name,
                  value: newValue,
                };
              } else {
                const item = _.find(sortData, { originalId: xName }) || {};
                const xAxisName = isTime ? item.originalName : item.name;
                return {
                  name: xAxisName ? `${name} ${xAxisName} ` : name,
                  value: newValue,
                };
              }
            },
          },
        }),
      };
    }
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
        originalCount,
      };
    };
    const renderItem = data => {
      const { count, originalCount } = get(data.sum);
      return (
        <Fragment>
          <span>{formatSummaryName(data)}: </span>
          <span data-tip={originalCount ? originalCount : null} className="count Font22">
            {count || 0}
          </span>
        </Fragment>
      );
    };

    if ('all' in summary) {
      const { all, controlList = [] } = summary;
      return (
        <div className="flexRow summaryWrap" style={{ flexWrap: 'wrap' }}>
          {all && (
            <div className="flexRow mRight10" style={{ alignItems: 'baseline' }}>
              {renderItem(summary)}
            </div>
          )}
          {controlList.map(data => (
            <div className="flexRow mRight10" style={{ alignItems: 'baseline' }}>
              {renderItem({
                ...data,
                name: data.name || _.get(_.find(yaxisList, { controlId: data.controlId }), 'controlName'),
              })}
            </div>
          ))}
        </div>
      );
    } else {
      return <div className="pBottom10">{renderItem(summary)}</div>;
    }
  }
  render() {
    const { dropdownVisible, offset } = this.state;
    const { displaySetup = {} } = this.props.reportData;
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
        {displaySetup.showTotal && this.renderCount()}
        <div className="h100" ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
