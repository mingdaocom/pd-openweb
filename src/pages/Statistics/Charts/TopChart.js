import React, { Component, Fragment } from 'react';
import { Dropdown, Menu } from 'antd';
import { ScrollView } from 'ming-ui';
import { formatYaxisList, formatrChartValue, formatControlInfo, getChartColors } from './common';
import { formatSummaryName, isFormatNumber } from 'statistics/common';
import styled from 'styled-components';
import cx from 'classnames';
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
    width: 110px;
    margin-left: 8px;
    text-align: right;
  }
  .valueProgressWrap {
    flex: 1;
    height: 12px;
    background: #efedee;
    border-radius: 2px;
    overflow: hidden;
    .progress {
      width: 0;
      height: 100%;
      background: ${props => props.progressBgColor};
    }
  }
  &.noneValueProportion {
    .item:hover {
      background-color: #f7f7f7;
    }
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
    const { xaxes, split } = this.props.reportData;
    const param = {};
    if (xaxes.cid) {
      const isNumber = isFormatNumber(xaxes.controlType);
      const value = data.originalX;
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
    }
    const { left, top } = this.chartWrapEl.getBoundingClientRect();
    this.setState({
      dropdownVisible: true,
      offset: {
        x: event.clientX - left,
        y: event.clientY - top
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
        <Menu.Item onClick={this.handleRequestOriginalData} key="viewOriginalData">
          <div className="flexRow valignWrapper">
            <span>{_l('查看原始数据')}</span>
          </div>
        </Menu.Item>
      </Menu>
    );
  }
  renderHeader() {
    const { xaxes, yaxisList } = this.props.reportData;
    return (
      <div className="flexRow valignWrapper item">
        <div className="index alignItemsCenter justifyContentCenter flexRow Gray_9e">{_l('排行')}</div>
        <div className="name Gray_9e flex ellipsis">{xaxes.rename || xaxes.controlName}</div>
        {yaxisList.map(item => (
          <div key={item.controlId} className="value ellipsis Gray_9e">
            {item.rename || item.controlName}
          </div>
        ))}
      </div>
    );
  }
  renderItem(data, index, maxValue) {
    const { reportData, isViewOriginalData } = this.props;
    const { style = {}, yaxisList, displaySetup, sorts } = reportData;
    const sortId = sorts[0] ? Object.keys(sorts[0])[0] : null;
    const { valueProgressVisible } = style;
    return (
      <div
        className="flexRow valignWrapper item"
        key={index}
        onClick={(event) => {
          if (displaySetup.showRowList && isViewOriginalData) {
            this.handleClick(event, data);
          }
        }}
      >
        <div className="index alignItemsCenter justifyContentCenter flexRow Gray_75">{this.renderIndex(index + 1)}</div>
        <div className="name ellipsis mRight8" style={valueProgressVisible ? { width: '30%' } : { flex: 1 }} title={data.name}>{data.name}</div>
        {valueProgressVisible && (
          <div className="valueProgressWrap">
            <div className="progress" style={{ width: `${data[_.find(yaxisList, { controlId: sortId }) ? sortId : _.get(yaxisList[0], 'controlId')] / maxValue * 100}%` }}></div>
          </div>
        )}
        {yaxisList.map(item => (
          <div key={item.controlId} className="value ellipsis">
            {formatrChartValue(data[item.controlId], false, yaxisList, item.controlId, false)}
          </div>
        ))}
      </div>
    );
  }
  renderTopChart() {
    const { themeColor, projectId, customPageConfig, reportData } = this.props;
    const { chartColor } = customPageConfig;
    const { map, yaxisList, style } = reportData;
    const data = formatTopChartData(map);
    const maxValue = _.max(data.map(data => data[_.get(yaxisList[0], 'controlId')]));
    const colors = getChartColors(chartColor || style, themeColor, projectId);
    return (
      <TopChartContent className="h100 topChart noneValueProportion" progressBgColor={colors[0]}>
        <ScrollView>
          <Fragment>
            {yaxisList.length > 1 && this.renderHeader()}
            {data.map((data, index) => (
              this.renderItem(data, index, maxValue || 0)
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
      <div className="flex flexColumn chartWrapper Relative" ref={el => (this.chartWrapEl = el)}>
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
          <div className="pBottom10">
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">{count}</span>
          </div>
        ) : null}
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'h100'}>{this.renderTopChart()}</div>
      </div>
    );
  }
}
