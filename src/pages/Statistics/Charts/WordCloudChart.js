import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { formatSummaryName, isFormatNumber } from 'statistics/common';
import { formatChartData } from './BarChart';
import { formatrChartValue, formatYaxisList, getChartColors } from './common';

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
    this.WordCloudChart = null;
    this.g2plotComponent = {};
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderWordCloudChart(this.props);
    });
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
      displaySetup.ydisplay.maxValue !== oldDisplaySetup.ydisplay.maxValue ||
      !_.isEqual(
        _.pick(nextProps.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
        _.pick(this.props.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
      ) ||
      nextProps.themeColor !== this.props.themeColor ||
      !_.isEqual(nextProps.linkageMatch, this.props.linkageMatch)
    ) {
      const WordCloudChartConfig = this.getComponentConfig(nextProps);
      this.WordCloudChart.update(WordCloudChartConfig);
    }
    if (nextProps.isLinkageData !== this.props.isLinkageData) {
      this.WordCloudChart.destroy();
      this.renderWordCloudChart(nextProps);
    }
  }
  renderWordCloudChart(props) {
    const { reportData } = props;
    const { displaySetup, style } = reportData;
    const WordCloudChartConfig = this.getComponentConfig(props);
    const { WordCloud } = this.g2plotComponent;
    if (this.chartEl) {
      this.WordCloudChart = new WordCloud(this.chartEl, WordCloudChartConfig);
      this.isViewOriginalData = displaySetup.showRowList && props.isViewOriginalData;
      this.isLinkageData =
        props.isLinkageData &&
        !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0);
      if (this.isViewOriginalData || this.isLinkageData) {
        this.WordCloudChart.on('element:click', this.handleClick);
      }
      this.WordCloudChart.render();
    }
  }
  handleClick = data => {
    const { xaxes, appId, reportId, name, reportType, style } = this.props.reportData;
    const event = data.gEvent;
    const currentData = data.data.data;
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
      const value = currentData.datum.originalId;
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
      linkageMatch.value = value;
      linkageMatch.filters.push({
        controlId: xaxes.controlId,
        values: [param[xaxes.cid]],
        controlName: xaxes.controlName,
        controlValue: currentData.datum.name,
        type: xaxes.controlType,
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
        const WordCloudChartConfig = this.getComponentConfig(this.props);
        this.WordCloudChart.update(WordCloudChartConfig);
      },
    );
  };
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, isThumbnail } = props;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light', widgetBgColor } = customPageConfig;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const { map, displaySetup, yaxisList } = reportData;
    const styleConfig = reportData.style || {};
    const style =
      chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0)
        ? { ...styleConfig, ...chartColor }
        : styleConfig;
    const data = formatChartData(map, yaxisList);
    const newYaxisList = formatYaxisList(data, yaxisList);
    const { ydisplay } = displaySetup;
    const colors = getChartColors(style, themeColor, projectId);
    const baseConfig = {
      data,
      wordField: 'name',
      weightField: 'value',
      colorField: 'name',
      spiral: displaySetup.showChartType === 1 ? 'rectangular' : 'archimedean',
      wordStyle: {
        fontSize: [ydisplay.minValue || 20, ydisplay.maxValue || 60],
      },
      theme: {
        background: isDark ? widgetBgColor : '#ffffffcc',
      },
      tooltip: {
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
      color: ({ datum }) => {
        if (datum) {
          const index = _.findIndex(data, { originalId: datum.originalId });
          let color = colors[index % colors.length];
          return color;
        } else {
          return colors[0];
        }
      },
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
