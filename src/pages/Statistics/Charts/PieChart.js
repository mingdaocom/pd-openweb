import React, { Component } from 'react';
import { getLegendType, formatrChartValue, formatYaxisList, getChartColors, getAlienationColor, formatNumberValue } from './common';
import { formatSummaryName, getIsAlienationColor, isFormatNumber } from 'statistics/common';
import { Icon } from 'ming-ui';
import { Dropdown, Menu } from 'antd';
import { browserIsMobile } from 'src/util';
import { toFixed } from 'src/util';
import { TinyColor } from '@ctrl/tinycolor';
import _ from 'lodash';

const formatChartData = (data = []) => {
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

const formatChartMap = (data = [], yaxisList) => {
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
    if (
      displaySetup.showTotal !== oldDisplaySetup.showTotal ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showDimension !== oldDisplaySetup.showDimension ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(_.pick(nextProps.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']), _.pick(this.props.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor'])) ||
      !_.isEqual(displaySetup.percent, oldDisplaySetup.percent) ||
      nextProps.themeColor !== this.props.themeColor ||
      !_.isEqual(nextProps.linkageMatch, this.props.linkageMatch)
    ) {
      const pieConfig = this.getPieConfig(nextProps);
      this.PieChart.update(pieConfig);
    }
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      nextProps.isLinkageData !== this.props.isLinkageData
    ) {
      this.PieChart.destroy();
      this.PieChart = new this.PieComponent(this.chartEl, this.getPieConfig(nextProps));
      this.PieChart.render();
    }
  }
  renderPieChart() {
    const { reportData } = this.props;
    const { map, displaySetup, style, xaxes } = reportData;
    if (this.chartEl) {
      this.PieChart = new this.PieComponent(this.chartEl, this.getPieConfig(this.props));
      this.isViewOriginalData = displaySetup.showRowList && this.props.isViewOriginalData && map.length;
      this.isLinkageData = this.props.isLinkageData && !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) && xaxes.controlId && map.length;
      if (this.isViewOriginalData || this.isLinkageData) {
        this.PieChart.on('element:click', this.handleClick);
      }
      this.PieChart.render();
    }
  }
  handleClick = data => {
    const { xaxes, appId, reportId, name, reportType, style } = this.props.reportData;
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
      const value = currentData.data.originalId;
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
    if (_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length) {
      linkageMatch.onlyChartIds = style.autoLinkageChartObjectIds;
    }
    const isAll = this.isViewOriginalData && this.isLinkageData;
    this.setState({
      dropdownVisible: isAll,
      offset: {
        x: event.x + 20,
        y: event.y,
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
      match,
    };
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
      const pieConfig = this.getPieConfig(this.props);
      this.PieChart.update(pieConfig);
    });
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
      if (isAnnular) {
        return [{ type: 'pie-statistic-active' }, { type: 'element-active' }];
      } else {
        return [{ type: 'element-active' }];
      }
    }
  }
  getPieConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, linkageMatch, isThumbnail } = props;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light', widgetBgColor } = customPageConfig;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const { map, displaySetup, yaxisList, summary, xaxes, reportId } = reportData;
    const { percent } = displaySetup;
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const data = xaxes.controlId ? formatChartData(_.get(map[0], 'value')) : formatChartMap(map, yaxisList);
    const { position } = getLegendType(displaySetup.legendType);
    const isLabelVisible = displaySetup.showDimension || displaySetup.showNumber || percent.enable;
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
      data: data.length ? data : [{ originalId: '', value: 0 }],
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
      theme: {
        background: isDark ? widgetBgColor : '#ffffffcc',
      },
      color: (data) => {
        const index = _.findIndex(baseConfig.data, { originalId: data.originalId });
        let color = colors[index % colors.length];
        if (!map.length) {
          return '#f0f0f0';
        }
        if (isOptionsColor) {
          color = getAlienationColor(xaxes, data);
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
      legend: displaySetup.showLegend && data.length
        ? {
            position,
            flipPage: true,
            itemHeight: 20,
            radio: { style: { r: 6 } },
            itemName: {
              style: {
                fill: isDark ? '#ffffffcc' : undefined
              }
            }
          }
        : false,
      tooltip: isAnnular || !data.length
        ? false
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
            domStyles: isDark ? {
              'g2-tooltip': {
                color: '#ffffffcc',
                backgroundColor: widgetBgColor,
                boxShadow: `${widgetBgColor} 0px 0px 10px`
              },
              'g2-tooltip-list-item': {
                color: '#ffffffcc',
              }
            } : undefined
          },
      statistic: displaySetup.showTotal || !data.length
        ? {
            title: {
              offsetY: titleScale > 0.65 ? -10 : titleScale * 5,
              style: {
                fontSize: 14,
                fontWeight: 300,
                transform: `translate(-50%, -100%) scale(${titleScale})`,
                color: isDark ? '#ffffffcc' : undefined
              },
              formatter: datum => (datum ? datum.name || datum.originalId : formatSummaryName(summary)),
            },
            content: {
              style: {
                fontSize: 22,
                fontWeight: 500,
                transform: `translate(-50%, 0px) scale(${contentScale})`,
                width: `${_.min([clientWidth, clientHeight]) / 3}px`,
                color: isDark ? '#ffffffcc' : undefined
              },
              formatter: datum => {
                const value = datum ? datum.originalValue : summary.sum;
                return formatrChartValue(value, false, newYaxisList, '', false);
              },
            },
          }
        : false,
      label: isLabelVisible && data.length
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
              const percentText = percent.enable ? `(${formatNumberValue(item.percent * 100, percent)}%)` : '';
              return `${dimensionText} ${numberText} ${percentText}`;
            },
            style: {
              fill: isDark ? '#ffffffcc' : undefined
            }
          }
        : false,
      interactions: data.length && this.interactions(isAnnular),
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
