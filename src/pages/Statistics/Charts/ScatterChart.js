import React, { Component } from 'react';
import { Scatter } from '@antv/g2plot';
import { uniq } from '@antv/util';
import { Dropdown, Menu } from 'antd';
import { formatYaxisList, formatrChartValue, formatControlInfo, formatrChartAxisValue, getLegendType, getChartColors } from './common';
import { formatSummaryName, isFormatNumber } from 'statistics/common';

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
          [splitId]: element.key,
          ...target.m
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
}

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalCount: 0,
      count: 0,
      dropdownVisible: false,
      offset: {},
      match: null
    }
    this.ScatterChart = null;
  }
  componentDidMount() {
    this.renderScatterChart(this.props);
  }
  componentWillUnmount() {
    this.ScatterChart && this.ScatterChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup } = this.props.reportData;
    if (
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      !_.isEqual(displaySetup.xdisplay, oldDisplaySetup.xdisplay) ||
      !_.isEqual(displaySetup.ydisplay, oldDisplaySetup.ydisplay)
    ) {
      const config = this.getComponentConfig(nextProps);
      this.ScatterChart.update(config);
      this.setCount(nextProps);
      // this.ScatterChart.destroy();
      // this.renderScatterChart(nextProps);
    }
  }
  renderScatterChart(props) {
    const { reportData, isViewOriginalData } = props;
    const { displaySetup } = reportData;
    const config = this.getComponentConfig(props);
    this.ScatterChart = new Scatter(this.chartEl, config);
    if (displaySetup.showRowList && isViewOriginalData) {
      this.ScatterChart.on('element:click', this.handleClick);
    }
    this.ScatterChart.render();
    this.setCount(props);
  }
  handleClick = (event) => {
    const { xaxes, split } = this.props.reportData;
    const currentData = event.data.data;
    const gEvent = event.gEvent;
    const isNumber = isFormatNumber(xaxes.controlType);
    const param = {};
    if (xaxes.cid) {
      param[xaxes.cid] = isNumber ? Number(currentData.originalId) : currentData.originalId;
    }
    if (split.controlId) {
      const isNumber = isFormatNumber(split.controlType);
      param[split.cid] = isNumber ? Number(currentData[split.controlId]) : currentData[split.controlId];
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
  getComponentConfig(props) {
    const { map, displaySetup, xaxes, yaxisList, split, style = {} } = props.reportData;
    const { xdisplay, ydisplay } = displaySetup;
    const data = formatChartData(map, split.controlId);
    const { position } = getLegendType(displaySetup.legendType);
    const colors = getChartColors();
    const xField = _.get(yaxisList[0], 'controlId');
    const yField = _.get(yaxisList[1], 'controlId');
    const sizeField = _.get(yaxisList[2], 'controlId');
    const base = {
      appendPadding: [20, 20, 0, 0],
      data,
      shapeField: 'originalId',
      xField,
      yField,
      sizeField,
      colorField: split.controlId,
      size: [5, 20],
      colors,
      legend: displaySetup.showLegend && split.controlId ? {
        position
      } : false,
      shapeLegend: false,
      shape: ({ originalId }) => {
        // const shapes = ['circle', 'square', 'triangle', 'hexagon', 'diamond', 'bowtie'];
        // const idx = uniq(data.map((d) => d.originalId)).indexOf(originalId);
        // return shapes[idx] || 'circle';
        return 'circle';
      },
      meta: {
        originalId: {
          alias: xaxes.rename || xaxes.controlName || _l('维度'),
          formatter: value => {
            const item = _.find(data, { originalId: value });
            return item ? item.name || _l('空') : value;
          }
        },
        [xField]: {
          alias: _.get(yaxisList[0], 'rename') || _.get(yaxisList[0], 'controlName')
        },
        [yField]: {
          alias: _.get(yaxisList[1], 'rename') || _.get(yaxisList[1], 'controlName')
        },
        [sizeField]: {
          alias: _.get(yaxisList[2], 'rename') || _.get(yaxisList[2], 'controlName')
        },
        [split.controlId]: {
          alias: split.controlName
        }
      },
      label: displaySetup.showNumber ? {
        layout: [
          { type: 'interval-hide-overlap' },
          { type: 'adjust-color' },
          { type: 'limit-in-plot' }
        ],
        content: ({ originalId }) => {
          const item = _.find(data, { originalId });
          return item ? item.name || _l('空') : originalId;
        },
      } : null,
      tooltip: {
        shared: true,
        showMarkers: false,
        showTitle: true,
        title: 'originalId',
        fields: [
          _.get(yaxisList[0], 'controlId'),
          _.get(yaxisList[1], 'controlId'),
          _.get(yaxisList[2], 'controlId'),
          split.controlId
        ]
      },
      yAxis: {
        nice: true,
        min: _.isNumber(ydisplay.minValue) ? ydisplay.minValue : null,
        max: _.isNumber(ydisplay.maxValue) ? ydisplay.maxValue : null,
        title: ydisplay.showTitle && ydisplay.title ? { text: ydisplay.title } : null,
        label: ydisplay.showDial ? {
          formatter: (value) => {
            return value ? formatrChartAxisValue(Number(value), false, yaxisList) : null;
          }
        } : null,
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
        label: xdisplay.showDial ? {
          autoHide: true,
          autoEllipsis: true
        } : null,
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
    }
    return base;
  }
  setCount(props) {
    const { summary, yaxisList } = props.reportData;
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
          <div className="pBottom10">
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">{count}</span>
          </div>
        ) : null}
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'h100'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
