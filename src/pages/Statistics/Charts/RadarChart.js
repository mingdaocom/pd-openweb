import React, { Component, Fragment } from 'react';
import { Radar } from '@antv/g2plot';
import {
  formatControlInfo,
  formatrChartValue,
  formatrChartAxisValue,
  getLegendType,
  reportTypes,
  formatYaxisList,
  getChartColors
} from './common';
import { Dropdown, Menu } from 'antd';
import { formatSummaryName, isFormatNumber } from 'statistics/common';

const formatChartData = (data, yaxisList) => {
  const result = [];
  const { value } = data[0];
  value.forEach(item => {
    const name = item.x;
    data.forEach((element, index) => {
      const target = element.value.filter(n => n.x === name);
      if (target.length) {
        const { rename } = _.find(yaxisList, { controlId: element.c_id }) || {};
        result.push({
          groupName: `${rename || element.key}-md-${reportTypes.RadarChart}-chart-${element.c_id || index}`,
          groupKey: element.originalKey,
          value: target[0].v,
          name,
        });
      }
    });
  });
  return result;
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalCount: 0,
      count: 0,
      dropdownVisible: false,
      dropdownMenu: [],
      offset: {},
      match: null
    }
    this.RadarChart = null;
  }
  componentDidMount() {
    const { reportData, isViewOriginalData } = this.props;
    const { displaySetup } = reportData;
    const config = this.getComponentConfig(this.props);
    this.RadarChart = new Radar(this.chartEl, config);
    if (displaySetup.showRowList && isViewOriginalData) {
      this.RadarChart.on('element:click', this.handleClick);
    }
    this.RadarChart.render();
  }
  componentWillUnmount() {
    this.RadarChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup } = this.props.reportData;
    // 显示设置
    if (
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag
    ) {
      const config = this.getComponentConfig(nextProps);
      this.RadarChart.update(config);
    }
  }
  handleClick = ({ data, gEvent }) => {
    const { xaxes, split } = this.props.reportData;
    const currentData = data.data;
    const isNumber = isFormatNumber(xaxes.controlType);
    const param = {
      [xaxes.cid]: isNumber ? Number(currentData.name) : currentData.name
    }
    if (split.controlId) {
      const isNumber = isFormatNumber(split.controlType);
      param[split.cid] = isNumber ? Number(currentData.groupKey) : currentData.groupKey;
    }
    this.setState({
      dropdownVisible: true,
      offset: {
        x: gEvent.x + 20,
        y: gEvent.y
      },
      match: param,
      dropdownMenu: _.isArray(currentData) ? currentData : []
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
  getComponentConfig(props) {
    const { map, displaySetup, yaxisList, style } = props.reportData;
    const data = formatChartData(map, yaxisList);
    const { position } = getLegendType(displaySetup.legendType);
    const newYaxisList = formatYaxisList(data, yaxisList);
    const colors = getChartColors(style);
    const baseConfig = {
      data,
      appendPadding: [5, 0, 5, 0],
      xField: 'name',
      yField: 'value',
      seriesField: 'groupName',
      meta: {
        name: {
          type: 'cat',
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
        },
        verticalLimitLength: 100
      },
      yAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            type: 'line',
            style: {
              lineDash: null,
            },
          },
          alternateColor: 'rgba(250, 250, 250, 0.7)',
        },
        label: {
          formatter: value => {
            return formatrChartAxisValue(Number(value), false, newYaxisList);
          },
        },
      },
      limitInPlot: true,
      area: {},
      color: colors,
      tooltip: {
        shared: true,
        showCrosshairs: false,
        showMarkers: true,
        formatter: ({ value, groupName }) => {
          const { name, id } = formatControlInfo(groupName);
          const { dot } = _.find(yaxisList, { controlId: id }) || {};
          return {
            name,
            value: _.isNumber(value) ? value.toLocaleString('zh', { minimumFractionDigits: dot }) : '--',
          };
        },
      },
      legend: displaySetup.showLegend
        ? {
            position,
            flipPage: true,
            itemHeight: 20,
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
            content: ({ value }) => {
              return formatrChartValue(value, false, newYaxisList);
            },
          }
        : false,
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
      count
    });
  }
  renderOverlay() {
    const { dropdownMenu } = this.state;
    return (
      <Menu className="chartMenu" style={{ width: 160 }}>
        {dropdownMenu.length ? (
          <Fragment>
            <div className="Gray_75 pLeft15 pRight15 pTop10 pBottom10">{_l('查看原始数据')}</div>
            {dropdownMenu.map((item, index) => (
              <Menu.Item
                key={index}
                onClick={() => {
                  const { xaxes, split } = this.props.reportData;
                  const isNumber = isFormatNumber(xaxes.controlType);
                  const param = {
                    [xaxes.cid]: isNumber ? Number(item.name) : item.name
                  }
                  if (split.controlId) {
                    param[split.controlId] = item.groupKey;
                  }
                  this.setState({ match: param }, this.handleRequestOriginalData);
                }}
              >
                <div className="flexRow valignWrapper">
                  <span>{item.name}</span>
                </div>
              </Menu.Item>
            ))}
          </Fragment>
        ) : (
          <Menu.Item onClick={this.handleRequestOriginalData}>
            <div className="flexRow valignWrapper">
              <span>{_l('查看原始数据')}</span>
            </div>
          </Menu.Item>
        )}
      </Menu>
    );
  }
  render() {
    const { count, originalCount, dropdownVisible, offset } = this.state;
    const { summary, displaySetup } = this.props.reportData;
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
