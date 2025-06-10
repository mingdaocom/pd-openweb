import React, { Component, Fragment } from 'react';
import { Dropdown, Menu } from 'antd';
import { ScrollView, Icon } from 'ming-ui';
import { formatYaxisList, formatrChartValue, formatControlInfo, getChartColors } from './common';
import { formatSummaryName, isFormatNumber } from 'statistics/common';
import styled from 'styled-components';
import cx from 'classnames';
import { TinyColor } from '@ctrl/tinycolor';
import gold_medal from 'statistics/assets/topChart/gold_medal.png';
import silver_medal from 'statistics/assets/topChart/silver_medal.png';
import copper_medal from 'statistics/assets/topChart/copper_medal.png';
import gold_crown from 'statistics/assets/topChart/gold_crown.png';
import silver_crown from 'statistics/assets/topChart/silver_crown.png';
import copper_crown from 'statistics/assets/topChart/copper_crown.png';
import one from 'statistics/assets/topChart/one.png';
import two from 'statistics/assets/topChart/two.png';
import there from 'statistics/assets/topChart/there.png';

const formatTopChartData = (map) => {
  const data = _.get(map[0], 'value') || [];
  const result = [];
  const getValues = (index) => {
    const obj = {};
    map.forEach(data => {
      obj[data.c_id] = data.value[index].v;
    });
    return obj;
  }
  for(let i = 0; i < data.length; i++) {
    const { x, originalX } = data[i];
    result.push({
      name: x,
      originalX,
      ...getValues(i)
    });
  }
  return result;
}

const TopChartContent = styled.div`
  .nano-content {
    background-color: transparent !important;
  }
  .item {
    padding: 6px 12px 6px 0;
    border-radius: 4px;
  }
  .index {
    width: 50px;
  }
  .value {
    margin-left: 8px;
    text-align: right;
  }
  .valueProgressWrap {
    flex: 1;
    height: 12px;
    background-color: ${props => props.isDark ? '#ffffff99' : '#efedee'}
    border-radius: 2px;
    overflow: hidden;
    .progress {
      width: 0;
      height: 100%;
    }
  }
  .item:hover {
    background-color: ${props => props.isDark ? '#ffffff1a' : '#f7f7f7'}
  }
  .top {
    width: 20px;
    height: 20px;
    background-size: cover;
  }
  &.topChart {
    .medal {
      &-1 {
        background-image: url(${gold_medal});
      }
      &-2 {
        background-image: url(${silver_medal});
      }
      &-3 {
        background-image: url(${copper_medal});
      }
    }
    .crown {
      &-1 {
        background-image: url(${gold_crown});
      }
      &-2 {
        background-image: url(${silver_crown});
      }
      &-3 {
        background-image: url(${copper_crown});
      }
    }
    .number {
      &-1 {
        background-image: url(${one});
      }
      &-2 {
        background-image: url(${two});
      }
      &-3 {
        background-image: url(${there});
      }
    }
  }
`;

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
      newYaxisList: []
    }
  }
  componentDidMount() {
    this.setCount(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.reportData.yaxisList, this.props.reportData.yaxisList)) {
      this.setCount(nextProps);
    }
  }
  setCount(props) {
    const { map, yaxisList } = props.reportData;
    const newYaxisList = formatYaxisList(map, yaxisList);
    const { summary } = this.props.reportData;
    const value = summary.sum;
    const count = formatrChartValue(value, false, newYaxisList);
    this.setState({
      newYaxisList,
      originalCount: value.toLocaleString() == count ? 0 : value.toLocaleString(),
      count
    });
  }
  handleClick = (event, data) => {
    const { xaxes, split, appId, reportId, name, reportType, style } = this.props.reportData;
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
      const value = data.originalX;
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
      linkageMatch.value = value;
      linkageMatch.filters.push({
        controlId: xaxes.controlId,
        values: [param[xaxes.cid]],
        controlName: xaxes.controlName,
        controlValue: data.name,
        type: xaxes.controlType,
        control: xaxes
      });
    }
    if (_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length) {
      linkageMatch.onlyChartIds = style.autoLinkageChartObjectIds;
    }
    const isAll = this.isViewOriginalData && this.isLinkageData;
    const { left, top } = this.chartWrapEl.getBoundingClientRect();
    this.setState({
      dropdownVisible: isAll,
      offset: {
        x: event.clientX - left,
        y: event.clientY - top
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
      match
    }
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
    });
  }
  getBgColor = (data) => {
    const { themeColor, projectId, reportData, linkageMatch, customPageConfig = {} } = this.props;
    const { chartColor, chartColorIndex = 1 } = customPageConfig;
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const colors = getChartColors(style, themeColor, projectId);
    let color = colors[0];
    if (!_.isEmpty(linkageMatch)) {
      if (linkageMatch.value === data.originalX) {
        return color;
      } else {
        return new TinyColor(color).setAlpha(0.3).toRgbString();
      }
    }
    return color;
  }
  renderIndex(index) {
    const { style } = this.props.reportData;
    const { topStyle } = style;
    if ([1, 2, 3].includes(index) && topStyle) {
      return <div className={cx('top', `${topStyle}-${index}`)}></div>;
    }
    return <span>{index}</span>;
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
  renderHeader(isDark) {
    const { xaxes, yaxisList, style = {} } = this.props.reportData;
    const { valueProgressVisible } = style;
    return (
      <div className={cx('flexRow valignWrapper item', isDark ? 'White' : 'Gray_9e')}>
        <div className="index alignItemsCenter justifyContentCenter flexRow">{_l('排行')}</div>
        <div className="name ellipsis mRight8" style={valueProgressVisible ? { width: '20%' } : { flex: 1 }}>{xaxes.rename || xaxes.controlName}</div>
        {valueProgressVisible && <div className="valueProgressWrap" />}
        <div className="flexRow valignWrapper flex">
          {yaxisList.map(item => (
            <div key={item.controlId} className="value ellipsis" style={{ width: `${100 / yaxisList.length}%` }}>
              {item.rename || item.controlName}
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderItem(data, index, maxValue, isDark) {
    const { reportData, isViewOriginalData, isLinkageData } = this.props;
    const { style = {}, yaxisList, displaySetup, sorts } = reportData;
    const sortId = sorts[0] ? Object.keys(sorts[0])[0] : null;
    const { valueProgressVisible } = style;
    return (
      <div
        className="flexRow valignWrapper item"
        key={index}
        onClick={(event) => {
          this.isViewOriginalData = displaySetup.showRowList && isViewOriginalData;
          this.isLinkageData = isLinkageData && !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0);
          if (this.isViewOriginalData || this.isLinkageData) {
            this.handleClick(event, data);
          }
        }}
      >
        <div className={cx('index alignItemsCenter justifyContentCenter flexRow', isDark ? 'White' : 'Gray_75')}>{this.renderIndex(index + 1)}</div>
        <div className={cx('name ellipsis mRight8', isDark ? 'White' : 'Gray')} style={valueProgressVisible ? { width: '20%' } : { flex: 1 }} title={data.name}>{data.name}</div>
        {valueProgressVisible && (
          <div className="valueProgressWrap">
            <div
              className="progress"
              style={{
                width: `${data[_.find(yaxisList, { controlId: sortId }) ? sortId : _.get(yaxisList[0], 'controlId')] / maxValue * 100}%`,
                backgroundColor: this.getBgColor(data)
              }}
            />
          </div>
        )}
        <div className="flexRow valignWrapper flex">
          {yaxisList.map(item => (
            <div
              key={item.controlId}
              className={cx('value ellipsis', isDark ? 'White' : 'Gray')}
              style={{ width: `${100 / yaxisList.length}%` }}
            >
              {formatrChartValue(data[item.controlId], false, yaxisList, item.controlId, false)}
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderTopChart() {
    const { customPageConfig = {}, reportData, isThumbnail } = this.props;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light' } = customPageConfig;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const { map, yaxisList } = reportData;
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const data = formatTopChartData(map);
    const maxValue = _.max(data.map(data => data[_.get(yaxisList[0], 'controlId')]));
    return (
      <TopChartContent className="h100 topChart" isDark={isDark}>
        <ScrollView>
          <Fragment>
            {yaxisList.length > 1 && this.renderHeader(isDark)}
            {data.map((data, index) => (
              this.renderItem(data, index, maxValue || 0, isDark)
            ))}
          </Fragment>
        </ScrollView>
      </TopChartContent>
    );
  }
  render() {
    const { count, originalCount, dropdownVisible, offset } = this.state;
    const { summary, displaySetup = {} } = this.props.reportData;
    return (
      <div className="flex flexColumn chartWrapper topChart Relative" ref={el => (this.chartWrapEl = el)}>
        <Dropdown
          visible={dropdownVisible}
          onVisibleChange={(dropdownVisible) => {
            this.setState({ dropdownVisible });
          }}
          trigger={['click']}
          placement="bottomLeft"
          overlay={this.renderOverlay()}
        >
          <div className="Absolute" style={{ width: 1, height: 1, left: offset.x, top: offset.y }}></div>
        </Dropdown>
        {displaySetup.showTotal ? (
          <div className="summaryWrap pBottom10">
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">{count}</span>
          </div>
        ) : null}
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'h100'}>{this.renderTopChart()}</div>
      </div>
    );
  }
}
