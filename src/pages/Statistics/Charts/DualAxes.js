import React, { Component, Fragment } from 'react';
import { Dropdown, Menu } from 'antd';
import { TinyColor } from '@ctrl/tinycolor';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { formatSummaryName, formatterTooltipTitle, isFormatNumber } from 'statistics/common';
import { formatChartData as formatBarChartData, formatDataCount } from './BarChart';
import {
  formatControlInfo,
  formatrChartAxisValue,
  formatrChartValue,
  formatYaxisList,
  getAuxiliaryLineConfig,
  getChartColors,
  getControlMinAndMax,
  getEmptyChartData,
  getLegendType,
  getStyleColor,
  reportTypes,
} from './common';
import { formatChartData as formatLineChartData } from './LineChart';

const getLineChartXAxis = (controlId, data) => {
  if (controlId) {
    const result = [];
    data.forEach(item => {
      const { id } = formatControlInfo(item.groupName);
      if (id === controlId) {
        result.push(item);
      }
    });
    return result.map(item => item.name);
  } else {
    return _.uniqBy(data.map(item => item.name));
  }
};

const filterAuxiliaryLines = (location, auxiliaryLines = [], yaxisList) => {
  return auxiliaryLines.filter(item => {
    if (item.type === 'constantLine') {
      return item.location === location;
    } else {
      return _.find(yaxisList, { controlId: item.controlId }) ? true : false;
    }
  });
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newYaxisList: [],
      newRightYaxisList: [],
      dropdownVisible: false,
      offset: {},
      match: null,
      linkageMatch: null,
    };
    this.DualAxes = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.DualAxesComponent = data.DualAxes;
      this.renderDualAxesChart(this.props);
    });
  }
  componentWillUnmount() {
    this.DualAxes && this.DualAxes.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, rightY, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, rightY: oldRightY, style: oldStyle } = this.props.reportData;

    if (_.isEmpty(rightY)) {
      return;
    }

    const rightYDisplay = rightY.display.ydisplay;
    const oldRightYDisplay = oldRightY.display.ydisplay;

    // 显示设置
    if (
      displaySetup.fontStyle !== oldDisplaySetup.fontStyle ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.hideOverlapText !== oldDisplaySetup.hideOverlapText ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      displaySetup.showPileTotal !== oldDisplaySetup.showPileTotal ||
      displaySetup.xdisplay.showDial !== oldDisplaySetup.xdisplay.showDial ||
      displaySetup.xdisplay.showTitle !== oldDisplaySetup.xdisplay.showTitle ||
      displaySetup.xdisplay.title !== oldDisplaySetup.xdisplay.title ||
      displaySetup.ydisplay.showDial !== oldDisplaySetup.ydisplay.showDial ||
      displaySetup.ydisplay.showTitle !== oldDisplaySetup.ydisplay.showTitle ||
      displaySetup.ydisplay.title !== oldDisplaySetup.ydisplay.title ||
      displaySetup.ydisplay.minValue !== oldDisplaySetup.ydisplay.minValue ||
      displaySetup.ydisplay.maxValue !== oldDisplaySetup.ydisplay.maxValue ||
      displaySetup.ydisplay.lineStyle !== oldDisplaySetup.ydisplay.lineStyle ||
      rightYDisplay.showDial !== oldRightYDisplay.showDial ||
      rightYDisplay.showTitle !== oldRightYDisplay.showTitle ||
      rightYDisplay.title !== oldRightYDisplay.title ||
      rightYDisplay.minValue !== oldRightYDisplay.minValue ||
      rightYDisplay.maxValue !== oldRightYDisplay.maxValue ||
      !_.isEqual(displaySetup.auxiliaryLines, oldDisplaySetup.auxiliaryLines) ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      style.showXAxisSlider !== oldStyle.showXAxisSlider ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(
        _.pick(nextProps.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
        _.pick(this.props.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
      ) ||
      nextProps.themeColor !== this.props.themeColor ||
      !_.isEqual(nextProps.linkageMatch, this.props.linkageMatch)
    ) {
      const config = this.getComponentConfig(nextProps);
      this.DualAxes.update(config);
    }
    // 堆叠 & 累计
    if (
      displaySetup.isPile !== oldDisplaySetup.isPile ||
      displaySetup.isAccumulate !== oldDisplaySetup.isAccumulate ||
      rightY.display.isAccumulate !== oldRightY.display.isAccumulate ||
      rightY.display.isPile !== oldRightY.display.isPile ||
      nextProps.isLinkageData !== this.props.isLinkageData
    ) {
      this.DualAxes.destroy();
      this.renderDualAxesChart(nextProps);
    }
  }
  renderDualAxesChart(props) {
    const { reportData } = props;
    const { displaySetup, style, xaxes, split } = reportData;
    const config = this.getComponentConfig(props);
    if (this.chartEl) {
      this.DualAxes = new this.DualAxesComponent(this.chartEl, config);
      this.isViewOriginalData = displaySetup.showRowList && props.isViewOriginalData;
      this.isLinkageData =
        props.isLinkageData &&
        !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) &&
        (xaxes.controlId || split.controlId);
      if (this.isViewOriginalData || this.isLinkageData) {
        this.DualAxes.on('element:click', this.handleClick);
      }
      this.DualAxes.render();
    }
  }
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, linkageMatch, isThumbnail } = props;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light', widgetBgColor } = customPageConfig;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const { map, contrastMap, displaySetup, yaxisList, rightY, yreportType, xaxes, split, sorts } = reportData;
    const styleConfig = reportData.style || {};
    const style =
      chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0)
        ? { ...styleConfig, ...chartColor }
        : styleConfig;
    const splitId = split.controlId;
    const xaxesId = xaxes.controlId;
    const { xdisplay, ydisplay, showPileTotal, isPile, legendType, auxiliaryLines, colorRules } = displaySetup;
    const { position } = getLegendType(legendType);
    const sortsKey = sorts.map(n => _.findKey(n));
    const leftSorts = yaxisList.filter(item => sortsKey.includes(item.controlId));
    const rightSorts = rightY.yaxisList.filter(item => sortsKey.includes(item.controlId));
    const isLeftSort = splitId || !_.isEmpty(leftSorts);
    const isRightSort = rightY.splitId || !_.isEmpty(rightSorts);
    const rightYDisplay = rightY.display.ydisplay;
    const colors = getChartColors(style, themeColor, projectId);
    const rightYColors = _.clone(colors).reverse();

    let sortLineXAxis = [];
    let data =
      yreportType === reportTypes.LineChart
        ? formatLineChartData(map, yaxisList, displaySetup, splitId)
        : formatBarChartData(map, yaxisList, splitId, xaxesId);
    let lineData = _.isEmpty(contrastMap)
      ? []
      : formatLineChartData(contrastMap, rightY.yaxisList, { ...rightY.display }, _.get(rightY, 'split.controlId'));
    let names = [];

    const newYaxisList = formatYaxisList(data, yaxisList);
    const newRightYaxisList = formatYaxisList(lineData, rightY.yaxisList);

    const countConfig =
      showPileTotal && isPile && (yaxisList.length > 1 || splitId) ? formatDataCount(data, true, newYaxisList) : [];

    if (isLeftSort) {
      names = data.map(item => item.name);
      sortLineXAxis = getLineChartXAxis(splitId ? null : leftSorts[0].controlId, data);
    }
    if (isRightSort) {
      names = _.uniqBy(lineData.map(item => item.name));
      sortLineXAxis = getLineChartXAxis(rightY.splitId ? null : rightSorts[0].controlId, lineData);
    }
    if (!(isLeftSort || isRightSort)) {
      names = data.map(item => item.name);
      sortLineXAxis = getLineChartXAxis(null, data);
    }
    if (sortLineXAxis.length) {
      data = data
        .filter(item => {
          return sortLineXAxis.includes(item.name);
        })
        .map(item => {
          item.sortIndex = names.indexOf(item.name);
          return item;
        })
        .sort((a, b) => a.sortIndex - b.sortIndex);
      lineData = lineData
        .filter(item => {
          return sortLineXAxis.includes(item.name);
        })
        .map(item => {
          item.sortIndex = names.indexOf(item.name);
          return item;
        })
        .sort((a, b) => a.sortIndex - b.sortIndex);
    }

    this.setState({ newYaxisList, newRightYaxisList });

    this.lineData = lineData;

    const leftAuxiliaryLines = filterAuxiliaryLines('left', auxiliaryLines, yaxisList);
    const leftAuxiliaryLineConfig = getAuxiliaryLineConfig(leftAuxiliaryLines, data, { yaxisList, colors });
    const rightAuxiliaryLines = filterAuxiliaryLines('right', auxiliaryLines, rightY.yaxisList);
    const rightAuxiliaryLineConfig = getAuxiliaryLineConfig(rightAuxiliaryLines, lineData, {
      yaxisList: rightY.yaxisList,
      colors: rightYColors,
    });
    const rule = _.get(colorRules[0], 'dataBarRule') || {};
    const isRuleColor = yaxisList.length === 1 && _.isEmpty(split.controlId) && !_.isEmpty(rule);
    const controlMinAndMax = isRuleColor ? getControlMinAndMax(yaxisList, data) : {};

    const getRuleColor = value => {
      const color = getStyleColor({
        value,
        controlMinAndMax,
        rule,
        controlId: yaxisList[0].controlId,
      });
      return color || colors[0];
    };

    const columnConfig = {
      geometry: 'column',
      isGroup: !displaySetup.isPile,
      isStack: displaySetup.isPile,
      seriesField: 'groupName',
      rawFields: ['groupName', 'controlId', 'originalId'].concat(split.controlId ? undefined : 'value'),
      theme: {
        background: isDark ? widgetBgColor : '#ffffffcc',
      },
      color: data => {
        const controlId = formatControlInfo(data.groupName).id;
        const controlIndex = _.findIndex(yaxisList, { controlId });
        let color = colors[controlIndex % colors.length];
        if (isRuleColor) {
          color = getRuleColor(data.value);
        }
        if (split.controlId) {
          const splitIndex = _.findIndex(map, { originalKey: controlId });
          color = colors[splitIndex % colors.length] || colors[0];
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
      label: displaySetup.showNumber
        ? {
            position: displaySetup.isPile ? 'middle' : 'top',
            layout: [
              displaySetup.hideOverlapText ? { type: 'hide-overlap' } : null,
              displaySetup.isPile ? { type: 'adjust-color' } : null,
              { type: 'limit-in-plot' },
            ],
            content: ({ value, controlId }) => {
              const id = split.controlId ? newYaxisList[0].controlId : controlId;
              return formatrChartValue(value, false, newYaxisList, value ? undefined : id);
            },
            style: {
              fill: isDark ? '#ffffffb0' : undefined,
            },
          }
        : false,
    };

    const lineConfig = {
      connectNulls: true,
      smooth: true,
      geometry: 'line',
      seriesField: 'groupName',
      lineStyle: {
        lineWidth: 3,
      },
      color: rightYColors,
      point: displaySetup.showNumber
        ? {
            shape: 'point',
            size: 3,
          }
        : false,
      label: displaySetup.showNumber
        ? {
            layout: [displaySetup.hideOverlapText ? { type: 'hide-overlap' } : null],
            content: ({ rightValue, value, groupName }) => {
              const { id } = formatControlInfo(groupName);
              const contentValue = rightValue || value;
              const yaxisList = rightValue ? newRightYaxisList : newYaxisList;
              const controlId = _.get(rightY, 'split.controlId') ? yaxisList[0].controlId : id;
              return formatrChartValue(contentValue, false, yaxisList, contentValue ? undefined : controlId);
            },
            style: {
              fill: isDark ? '#ffffff61' : undefined,
            },
          }
        : false,
    };

    lineData.forEach(item => {
      item.rightValue = item.value;
    });

    const topPadding = position === 'bottom' ? 20 : 15;

    const baseConfig = {
      data: data.length || lineData.length ? [data, lineData] : [getEmptyChartData(reportData), []],
      appendPadding: [topPadding, 0, 5, 0],
      xField: 'name',
      yField: ['value', 'rightValue'],
      yAxis: {
        value: {
          min: _.isNumber(ydisplay.minValue) ? ydisplay.minValue : null,
          max: _.isNumber(ydisplay.maxValue) ? ydisplay.maxValue : null,
          title:
            ydisplay.showTitle && ydisplay.title
              ? {
                  text: ydisplay.title,
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
          label: ydisplay.showDial
            ? {
                formatter: value => {
                  return value ? formatrChartAxisValue(Number(value), false, newYaxisList) : null;
                },
                style: {
                  fill: isDark ? '#ffffffb0' : undefined,
                },
              }
            : null,
        },
        rightValue: {
          // min: rightMinValue > 0 ? 0 : rightMinValue,
          min: _.isNumber(rightYDisplay.minValue) ? rightYDisplay.minValue : null,
          max: _.isNumber(rightYDisplay.maxValue) ? rightYDisplay.maxValue : null,
          title:
            rightYDisplay.showTitle && rightYDisplay.title
              ? {
                  text: rightYDisplay.title,
                  style: {
                    fill: isDark ? '#ffffffb0' : undefined,
                  },
                }
              : null,
          // grid: {
          //   line: {
          //     style: {
          //       lineDash: rightYDisplay.lineStyle === 1 ? [] : [4, 5]
          //     }
          //   }
          // },
          label: rightYDisplay.showDial
            ? {
                formatter: value => {
                  return value ? formatrChartAxisValue(Number(value), false, newRightYaxisList) : null;
                },
                style: {
                  fill: isDark ? '#ffffffb0' : undefined,
                },
              }
            : null,
        },
      },
      meta: {
        name: {
          type: 'cat',
          ...(sortLineXAxis.length ? { values: sortLineXAxis } : {}),
          formatter: value => value || _l('空'),
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
      },
      tooltip: {
        title: formatterTooltipTitle(xaxes),
        formatter: data => {
          const { value, rightValue, groupName } = data;
          const { name, id } = formatControlInfo(groupName);
          if (_.isNumber(value)) {
            const { dot } = _.find(yaxisList, { controlId: id }) || {};
            const labelValue = formatrChartValue(value, false, newYaxisList, value ? undefined : id);
            return {
              name,
              value: _.isNumber(value)
                ? style.tooltipValueType
                  ? labelValue
                  : value.toLocaleString('zh', { minimumFractionDigits: dot })
                : '--',
            };
          }
          if (_.isNumber(rightValue)) {
            const { dot } = _.find(rightY.yaxisList, { controlId: id }) || {};
            const labelValue = formatrChartValue(rightValue, false, newRightYaxisList, value ? undefined : id);
            return {
              name,
              value: _.isNumber(rightValue)
                ? style.tooltipValueType
                  ? labelValue
                  : rightValue.toLocaleString('zh', { minimumFractionDigits: dot })
                : '--',
            };
          }
          const { emptyShowType, dot } = _.find(yaxisList.concat(rightY.yaxisList), { controlId: id }) || {};
          return {
            name,
            value: emptyShowType === 2 ? '--' : (0).toFixed(dot),
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
      // slider: style.showXAxisSlider ? {
      //   start: 0,
      //   end: 0.5,
      //   formatter: () => null
      // } : undefined,
      legend: displaySetup.showLegend
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
      annotations: {
        value: [...countConfig, ...leftAuxiliaryLineConfig],
        rightValue: rightAuxiliaryLineConfig,
      },
    };

    if (yreportType === reportTypes.BarChart) {
      baseConfig.geometryOptions = [columnConfig, lineConfig];
    }
    if (yreportType === reportTypes.LineChart) {
      baseConfig.geometryOptions = [Object.assign({}, lineConfig, { color: colors }), lineConfig];
    }

    return baseConfig;
  }
  handleClick = data => {
    const { xaxes, split, rightY, appId, reportId, name, reportType, style } = this.props.reportData;
    const rightYSplit = rightY.split;
    const event = data.gEvent;
    const currentData = data.data;
    const isRight = 'rightValue' in currentData.data;
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
      const value = currentData.data.originalId;
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
      linkageMatch.value = value;
      linkageMatch.filters.push({
        controlId: xaxes.controlId,
        values: [param[xaxes.cid]],
        controlName: xaxes.controlName,
        controlValue: currentData.data.name,
        type: xaxes.controlType,
        control: xaxes,
      });
    }
    if (split.controlId && !isRight) {
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
        control: split,
      });
    }
    if (rightYSplit.controlId && isRight) {
      const isNumber = isFormatNumber(rightYSplit.controlType);
      const value = currentData.data.groupKey;
      param[rightYSplit.cid] = isNumber && value ? Number(value) : value;
      if (!xaxes.cid) {
        linkageMatch.value = currentData.data.originalId;
      }
      linkageMatch.filters.push({
        controlId: rightYSplit.controlId,
        values: [param[rightYSplit.cid]],
        controlName: rightYSplit.controlName,
        controlValue: formatControlInfo(currentData.data.groupName).name,
        type: rightYSplit.controlType,
        control: rightYSplit,
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
          x: event.x + 20,
          y: event.y,
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
    this.setState({ dropdownVisible: false });
    const data = {
      isPersonal: false,
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
        const config = this.getComponentConfig(this.props);
        this.DualAxes.update(config);
      },
    );
  };
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
  renderCount(summary, yaxisList) {
    const get = value => {
      const count = formatrChartValue(value, false, yaxisList);
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
                name: data.name || _.get(_.find(yaxisList, { controlId: data.controlId }), 'controlName'),
              })}
            </div>
          ))}
        </div>
      );
    } else {
      return <div>{renderItem(summary)}</div>;
    }
  }
  render() {
    const { dropdownVisible, offset, newYaxisList, newRightYaxisList } = this.state;
    const { rightY, summary = {}, displaySetup } = this.props.reportData;
    const dualAxesSwitchChecked = displaySetup.showTotal || (rightY ? rightY.summary.showTotal : null);
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
        {dualAxesSwitchChecked && (
          <div className="flexRow spaceBetween summaryWrap pBottom10">
            {displaySetup.showTotal ? this.renderCount(summary, newYaxisList) : <div></div>}
            {rightY && rightY.summary.showTotal ? this.renderCount(rightY.summary, newRightYaxisList) : <div></div>}
          </div>
        )}
        <div className="h100" ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
