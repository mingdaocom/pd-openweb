import React, { Component } from 'react';
import { getLegendType, formatrChartValue, formatYaxisList, getChartColors, getStyleColor } from './common';
import { formatSummaryName, isFormatNumber } from 'statistics/common';
import { Icon } from 'ming-ui';
import { Dropdown, Menu } from 'antd';
import { toFixed } from 'src/util';
import { TinyColor } from '@ctrl/tinycolor';
import _ from 'lodash';

const mergeDataTime = (data, contrastData) => {
  const maxLengthData = data.length > contrastData.length ? data : contrastData;
  const maxLength = maxLengthData.length;
  const newData = (maxLength !== data.length ? data.concat(Array.from({ length: maxLength - data.length })) : data).map(
    (item, index) => {
      if (item) {
        item.name = maxLengthData[index].name;
        return item;
      } else {
        return {
          groupName: maxLengthData[index].groupName,
          name: maxLengthData[index].name,
          value: 0,
        };
      }
    },
  );
  const newContrastData = (maxLength !== contrastData.length
    ? contrastData.concat(Array.from({ length: maxLength - contrastData.length }))
    : contrastData
  ).map((item, index) => {
    let groupName = _l('上一期');
    if (item) {
      item.groupName = groupName;
      item.originalName = item.name;
      item.isContrast = true;
      item.name = maxLengthData[index].name;
      return item;
    } else {
      return {
        groupName,
        name: maxLengthData[index].name,
        value: 0,
      };
    }
  });
  return newData.concat(newContrastData);
};

// 调整空值位置
const formatEmptyDataPosition = (data, isAccumulate, xaxisEmpty) => {
  const cloneData = _.cloneDeep(data);

  if (xaxisEmpty) {
    cloneData.forEach(item => {
      const { value } = item;
      const last = value[value.length - 1];
      value.pop();
      if (isAccumulate && last.x == '空') {
        last.x = _l('全部');
      }
      value.unshift(last);
    });
  }

  return cloneData;
}

// 兼容多数值显示
const fillMapValue = map => {
  const data = map.map(data => {
    const value = data.value.map(item => {
      return {
        ...item,
        x: data.key,
        originalX: data.c_id
      }
    });
    return {
      ...data,
      value
    }
  });
  const value = data.map(item => item.value[0]);
  data[0].value = value;
  return [data[0]];
}

const formatChartData = (data, { isAccumulate, showOptionIds = [] }, { controlId, xaxisEmpty }, yaxisList) => {
  const result = [];
  const cloneData = formatEmptyDataPosition(controlId ? data : fillMapValue(data), isAccumulate, xaxisEmpty);
  const { value } = cloneData[0] || { value: [] };
  if (isAccumulate) {
    cloneData.map(item => {
      item.value.reverse().map((n, index) => {
        const lastn = item.value[index - 1];
        n.v = n.v + (lastn ? lastn.v : 0);
        return n;
      });
      item.value.reverse();
      return item;
    });
  }

  value.forEach((item, index) => {
    const name = item.x;
    cloneData.forEach(element => {
      const target = element.value.filter(n => n.x === name);
      const { rename, emptyShowType } = _.find(yaxisList, { controlId: element.c_id }) || yaxisList[0];
      const hideEmptyValue = !emptyShowType && !target[0].v;
      if (target.length && !hideEmptyValue) {
        result.push({
          id: target[0].originalX,
          groupName: element.key,
          index: value.length - index,
          value: target[0].v,
          name: rename || name || _l('空'),
        });
      }
    });
  });

  if (showOptionIds.length) {
    return result.filter(item => showOptionIds.includes(item.id));
  }

  return result;
};

const getControlMinAndMax = (yaxisList, data) => {
  const result = {};

  const get = (id) => {
    let values = [];
    for (let i = 0; i < data.length; i++) {
      values.push(data[i].value);
    }
    const min = _.min(values) || 0;
    const max = _.max(values);
    return {
      min,
      max,
      center: (max + min) / 2
    }
  }

  yaxisList.forEach(item => {
    result[item.controlId] = get(item.controlId);
  });

  return result;
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
      linkageMatch: null,
    }
    this.contrastData = null;
    this.FunnelChart = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.FunnelComponent = data.Funnel;
      this.renderFunnelChart(this.props);
    });
  }
  componentWillUnmount() {
    this.FunnelChart && this.FunnelChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { map, displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    const chartColor = _.get(nextProps, 'customPageConfig.chartColor');
    const oldChartColor = _.get(this.props, 'customPageConfig.chartColor');
    // 显示设置
    if (
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      style.funnelShape !== oldStyle.funnelShape ||
      style.funnelCurvature !== oldStyle.funnelCurvature ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(chartColor, oldChartColor) ||
      nextProps.themeColor !== this.props.themeColor ||
      !_.isEqual(nextProps.linkageMatch, this.props.linkageMatch)
    ) {
      const config = this.getComponentConfig(nextProps);
      this.FunnelChart && this.FunnelChart.update(config);
    }
    // 切换图表类型 & 累计
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.isAccumulate !== oldDisplaySetup.isAccumulate ||
      nextProps.isLinkageData !== this.props.isLinkageData
    ) {
      this.FunnelChart && this.FunnelChart.destroy();
      this.renderFunnelChart(nextProps);
    }
  }
  renderFunnelChart(props) {
    const { reportData } = props;
    const { displaySetup, style, xaxes } = reportData;
    const config = this.getComponentConfig(props);
    if (this.chartEl) {
      this.FunnelChart = new this.FunnelComponent(this.chartEl, config);
      this.isViewOriginalData = displaySetup.showRowList && props.isViewOriginalData;
      this.isLinkageData = props.isLinkageData && !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) && xaxes.controlId;
      if (this.isViewOriginalData || this.isLinkageData) {
        this.FunnelChart.on('element:click', this.handleClick);
      }
      this.FunnelChart.render();
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
      filters: []
    };
    if (xaxes.cid) {
      const isNumber = isFormatNumber(xaxes.controlType);
      const value = currentData.id;
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
      linkageMatch.value = value;
      linkageMatch.filters.push({
        controlId: xaxes.controlId,
        values: [param[xaxes.cid]],
        controlName: xaxes.controlName,
        controlValue: currentData.name,
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
        x: gEvent.x + 20,
        y: gEvent.y
      },
      contrastType: currentData.isContrast ? contrastType : undefined,
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
    const { match, contrastType } = this.state;
    this.setState({ dropdownVisible: false });
    const data = {
      isPersonal: false,
      match,
      contrastType
    }
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
      const config = this.getComponentConfig(this.props);
      this.FunnelChart && this.FunnelChart.update(config);
    });
  }
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, linkageMatch } = props;
    const { chartColor, chartColorIndex = 1 } = customPageConfig;
    const { map, contrastMap, displaySetup, yaxisList, xaxes } = reportData;
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const data = formatChartData(map, displaySetup, xaxes, yaxisList);
    const { position } = getLegendType(displaySetup.legendType);
    const newYaxisList = formatYaxisList(data, yaxisList);
    const colors = getChartColors(style, themeColor, projectId);
    const rule = _.get(displaySetup.colorRules[0], 'dataBarRule') || {};
    const isRuleColor = !_.isEmpty(rule);
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

    this.setCount(newYaxisList);

    const baseConfig = {
      appendPadding: displaySetup.showChartType === 2 ? [50, 0, 50, 0] : [0, 150, 0, 150],
      xField: 'name',
      yField: style.funnelCurvature === 1 ? 'index' : 'value',
      meta: {
        name: {
          type: 'cat',
        },
      },
      tooltip: {
        formatter: (item) => {
          if (style.funnelCurvature == 1) {
            item.value = _.find(data, { index: item.index }).value;
          }
          const { name, value } = item;
          const { dot } = yaxisList[0] || {};
          const labelValue = formatrChartValue(value, false, newYaxisList);
          return {
            name,
            value: _.isNumber(value) ? style.tooltipValueType ? labelValue : value.toLocaleString('zh', { minimumFractionDigits: dot }) : '--',
          };
        },
      },
      isTransposed: displaySetup.showChartType === 2,
      shape: style.funnelShape,
      color: ({ name }) => {
        const index = _.findIndex(data, { name });
        const { id, value } = _.find(data, { name }) || {};
        let color = colors[index % colors.length];;
        if (isRuleColor) {
          color = getRuleColor(value);
        }
        if (!_.isEmpty(linkageMatch)) {
          if (linkageMatch.value === id) {
            return color;
          } else {
            return new TinyColor(color).setAlpha(0.3).toRgbString();
          }
        }
        return color;
      },
      legend: displaySetup.showLegend
        ? {
            position: position == 'top-left' ? 'top' : position,
            flipPage: true,
            itemHeight: 20,
            radio: { style: { r: 6 } },
          }
        : false,
      conversionTag: displaySetup.showNumber && style.funnelCurvature !== 1
        ? {
            formatter: data => {
              const { CONVERSATION_FIELD, PERCENT_FIELD } = this.FunnelComponent;
              let percentage = 0;
              if (displaySetup.isAccumulate) {
                percentage = data[PERCENT_FIELD] * 100
              } else {
                if (data[CONVERSATION_FIELD][0] === 0) {
                  percentage = 0;
                } else {
                  percentage = (data[CONVERSATION_FIELD][1] / data[CONVERSATION_FIELD][0]) * 100;
                }
              }
              return _l('转化率%0', `${toFixed(percentage, 2)}%`);
            },
          }
        : false,
      label: {
        callback: (xField, yField) => {
          if (style.funnelCurvature == 1) {
            yField = _.find(data, { index: yField }).value;
          }
          return {
            content: `${xField} ${formatrChartValue(yField, false, newYaxisList)}`,
          };
        },
        layout: [{ type: 'adjust-color' }],
      },
    };

    if (_.isEmpty(contrastMap)) {
      this.contrastData = null;
      baseConfig.data = data;
    } else {
      const contrastData = formatChartData(contrastMap, displaySetup, xaxes, yaxisList);
      const newData = mergeDataTime(data, contrastData);
      this.contrastData = newData;
      baseConfig.compareField = 'groupName';
      baseConfig.data = newData;
    }

    return baseConfig;
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
  render() {
    const { count, originalCount, dropdownVisible, offset } = this.state;
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
        {displaySetup.showTotal ? (
          <div>
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">{count}</span>
          </div>
        ) : null}
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'h100'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
