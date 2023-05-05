import React, { Component } from 'react';
import { WordCloud } from '@antv/g2plot';
import { formatChartData } from './BarChart';
import { Dropdown, Menu } from 'antd';
import { formatYaxisList, formatrChartValue, formatControlInfo } from './common';
import { formatSummaryName, isFormatNumber } from 'statistics/common';

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
    this.WordCloudChart = null;
  }
  componentDidMount() {
    this.renderWordCloudChart(this.props);
  }
  componentWillUnmount() {
    this.WordCloudChart && this.WordCloudChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup } = this.props.reportData;
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.ydisplay.minValue !== oldDisplaySetup.ydisplay.minValue ||
      displaySetup.ydisplay.maxValue !== oldDisplaySetup.ydisplay.maxValue
    ) {
      const WordCloudChartConfig = this.getComponentConfig(nextProps);
      this.WordCloudChart.update(WordCloudChartConfig);
    }
  }
  renderWordCloudChart(props) {
    const { reportData, isViewOriginalData } = props;
    const { displaySetup } = reportData;
    const WordCloudChartConfig = this.getComponentConfig(props);
    this.WordCloudChart = new WordCloud(this.chartEl, WordCloudChartConfig);
    if (displaySetup.showRowList && isViewOriginalData) {
      this.WordCloudChart.on('element:click', this.handleClick);
    }
    this.WordCloudChart.render();
  }
  handleClick = (data) => {
    const { xaxes } = this.props.reportData;
    const event = data.gEvent;
    const currentData = data.data.data;
    const isNumber = isFormatNumber(xaxes.controlType);
    const param = {};
    if (xaxes.cid) {
      param[xaxes.cid] = isNumber ? Number(currentData.datum.originalId) : currentData.datum.originalId;
    }
    this.setState({
      dropdownVisible: true,
      offset: {
        x: event.x + 20,
        y: event.y
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
    const { map, displaySetup, xaxes, yaxisList, style = {}, reportId } = props.reportData;
    const data = formatChartData(map, yaxisList);
    const newYaxisList = formatYaxisList(data, yaxisList);
    const { ydisplay } = displaySetup;
    const baseConfig = {
      data,
      // meta: {
      //   originalId: {
      //     formatter: value => {
      //       const item = _.find(data, { originalId: value });
      //       return item ? item.name || _l('空') : value;
      //     }
      //   },
      //   groupName: {
      //     formatter: value => formatControlInfo(value).name,
      //   },
      // },
      wordField: 'name',
      weightField: 'value',
      colorField: 'name',
      spiral: displaySetup.showChartType === 1 ? 'rectangular' : 'archimedean',
      wordStyle: {
        fontSize: [ydisplay.minValue || 20, ydisplay.maxValue || 60],
      },
    }

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
