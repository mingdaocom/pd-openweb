import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { isFormatNumber } from 'statistics/common/controlUtils';
import { formatSummaryName } from 'statistics/common/reportDataUtils';
import { formatChartData } from './BarChart';
import { formatrChartValue, formatYaxisList, getChartColors } from './common';
import loadG2Plot from './loadG2Plot';

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
    this.g2plotComponent = null;
    this.isUnmounted = false;
  }
  componentDidMount() {
    loadG2Plot().then(data => {
      if (this.isUnmounted) {
        return;
      }

      this.g2plotComponent = data;
      this.renderWordCloudChart(this.props);
    });
  }
  componentWillUnmount() {
    this.isUnmounted = true;
    this.destroyWordCloudChart();
  }
  componentDidUpdate(prevProps) {
    const { displaySetup } = this.props.reportData;
    const { displaySetup: oldDisplaySetup } = prevProps.reportData;
    const shouldRecreate = this.props.isLinkageData !== prevProps.isLinkageData;
    const shouldUpdate =
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.ydisplay.minValue !== oldDisplaySetup.ydisplay.minValue ||
      displaySetup.ydisplay.maxValue !== oldDisplaySetup.ydisplay.maxValue ||
      !_.isEqual(
        _.pick(this.props.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
        _.pick(prevProps.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
      ) ||
      this.props.themeColor !== prevProps.themeColor ||
      !_.isEqual(this.props.linkageMatch, prevProps.linkageMatch);

    if (!this.g2plotComponent) {
      return;
    }

    if (shouldRecreate) {
      this.renderWordCloudChart(this.props);
      return;
    }

    if (shouldUpdate && this.WordCloudChart) {
      const WordCloudChartConfig = this.getComponentConfig(this.props);
      this.WordCloudChart.update(WordCloudChartConfig);
    }
  }
  destroyWordCloudChart = () => {
    if (this.WordCloudChart) {
      this.WordCloudChart.destroy();
      this.WordCloudChart = null;
    }
  };
  renderWordCloudChart(props) {
    const { reportData } = props;
    const { displaySetup, style } = reportData;

    if (!this.chartEl || !this.g2plotComponent) {
      return;
    }

    const WordCloudChartConfig = this.getComponentConfig(props);
    const { WordCloud } = this.g2plotComponent;

    this.destroyWordCloudChart();
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
  handleClick = data => {
    const { reportData, isMobile } = this.props;
    const { xaxes, appId, reportId, name, reportType, style } = reportData;
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
          x: event.x + (isMobile ? -100 : 20),
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

    if (!this.WordCloudChart || !this.g2plotComponent) {
      return;
    }

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
    const isDark = window.themeMode === 'dark' || (pageStyleType === 'dark' && isThumbnail);
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
        background: isDark || widgetBgColor === 'transparent' ? widgetBgColor : '#ffffffcc',
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
            <Icon icon="link1" className="mRight8 textTertiary Font20 autoLinkageIcon" />
            <span>{_l('联动')}</span>
          </div>
        </Menu.Item>
        <Menu.Item onClick={this.handleRequestOriginalData} key="viewOriginalData">
          <div className="flexRow valignWrapper">
            <Icon icon="table" className="mRight8 textTertiary Font18" />
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
