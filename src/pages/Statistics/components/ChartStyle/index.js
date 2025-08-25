import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Checkbox, Collapse, Input, Switch, Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { LegendTypeData, reportTypes } from 'statistics/Charts/common';
import * as actions from 'statistics/redux/actions';
import allCountPanelGenerator from './components/AllCount';
import Color from './components/Color/index';
import { Count } from './components/Count';
import DataFilter from './components/DataFilter';
import { gaugeColorPanelGenerator, indicatorPanelGenerator, scalePanelGenerator } from './components/GaugeChartConfig';
import Label from './components/Label';
import MeasureAxis from './components/MeasureAxis';
import numberStylePanelGenerator, { numberSummaryPanelGenerator } from './components/NumberStyle';
import pivotTableCountPanelGenerator from './components/PivotTableCount';
import PivotTableFieldColor from './components/PivotTableFieldColor/index';
import Quadrant from './components/Quadrant';
import TitleStyles from './components/TitleStyles';
import topChartPanelGenerator from './components/TopChartPanel';
import unitPanelGenerator from './components/Unit';
import XAxis from './components/XAxis';
import yAxisPanelGenerator, { bidirectionalBarChartYAxisPanelGenerator } from './components/YAxis';
import './index.less';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'reportData', 'worksheetInfo']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ChartStyle extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeDisplaySetup = (data, isRequest = false) => {
    const { displaySetup } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        displaySetup: {
          ...displaySetup,
          ...data,
        },
      },
      isRequest,
    );
  };
  handleChangeDisplayValue = (key, value, isRequest) => {
    this.handleChangeDisplaySetup(
      {
        [key]: value,
      },
      isRequest,
    );
  };
  handleChangeStyle = (data, isRequest = false) => {
    const { style } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        style: {
          ...style,
          ...data,
        },
      },
      isRequest,
    );
  };
  renderCount() {
    const { reportType, displaySetup, summary, yaxisList, rightY } = this.props.currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const isMultiaxis = [reportTypes.DualAxes, reportTypes.BidirectionalBarChart].includes(reportType);
    const dualAxesSwitchChecked = summary.showTotal || (rightY ? rightY.summary.showTotal : null);
    const switchChecked = isMultiaxis ? dualAxesSwitchChecked : displaySetup.showTotal;
    return (
      <Collapse.Panel
        key="count"
        header={_l('总计')}
        className={cx({ collapsible: !switchChecked })}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              if (isMultiaxis) {
                this.props.changeCurrentReport(
                  {
                    displaySetup: {
                      ...displaySetup,
                      showTotal: false,
                    },
                    summary: {
                      ...summary,
                      showTotal: checked,
                    },
                    rightY: {
                      ...rightY,
                      summary: {
                        ...rightY.summary,
                        showTotal: checked,
                      },
                    },
                  },
                  true,
                );
              } else {
                this.handleChangeDisplayValue('showTotal', checked, true);
              }
            }}
          />
        }
      >
        <Fragment>
          <Count
            smallTitle={
              isMultiaxis ? (
                <Checkbox
                  className="mLeft0 mBottom15"
                  checked={summary.showTotal}
                  onChange={() => {
                    this.props.changeCurrentReport(
                      {
                        displaySetup: {
                          ...displaySetup,
                          showTotal: false,
                        },
                        summary: {
                          ...summary,
                          showTotal: !summary.showTotal,
                        },
                      },
                      true,
                    );
                  }}
                >
                  {isDualAxes ? _l('Y轴') : _l('数值(1)')}
                </Checkbox>
              ) : null
            }
            summary={summary || {}}
            yaxisList={yaxisList}
            onChangeSummary={(data, isRequest = true) => {
              this.props.changeCurrentReport(
                {
                  summary: {
                    ...summary,
                    ...data,
                  },
                },
                isRequest,
              );
            }}
          />
          {isMultiaxis && (
            <Count
              smallTitle={
                isMultiaxis ? (
                  <Checkbox
                    className="mLeft0 mBottom15"
                    checked={rightY.summary.showTotal}
                    onChange={() => {
                      this.props.changeCurrentReport(
                        {
                          displaySetup: {
                            ...displaySetup,
                            showTotal: false,
                          },
                          rightY: {
                            ...rightY,
                            summary: {
                              ...rightY.summary,
                              showTotal: !rightY.summary.showTotal,
                            },
                          },
                        },
                        true,
                      );
                    }}
                  >
                    {isDualAxes ? _l('辅助Y轴') : _l('数值(2)')}
                  </Checkbox>
                ) : null
              }
              summary={rightY.summary || {}}
              yaxisList={rightY.yaxisList}
              onChangeSummary={(data, isRequest = true) => {
                this.props.changeCurrentReport(
                  {
                    rightY: {
                      ...rightY,
                      summary: {
                        ...rightY.summary,
                        ...data,
                      },
                    },
                  },
                  isRequest,
                );
              }}
            />
          )}
        </Fragment>
      </Collapse.Panel>
    );
  }
  renderNumberCount() {
    return numberSummaryPanelGenerator({ ...this.props, onChangeDisplayValue: this.handleChangeDisplayValue });
  }
  renderNumberStyle() {
    return numberStylePanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle,
      onChangeDisplayValue: this.handleChangeDisplayValue,
      handleChangeDisplaySetup: this.handleChangeDisplaySetup,
    });
  }
  renderLegend() {
    const { displaySetup, yaxisList, split, reportType } = this.props.currentReport;

    if (
      [reportTypes.LineChart, reportTypes.BarChart, reportTypes.RadarChart].includes(reportType) &&
      !(yaxisList.length > 1 || split.controlId || displaySetup.contrastType)
    ) {
      return null;
    }

    if (reportTypes.ScatterChart === reportType && !split.controlId) {
      return null;
    }

    return (
      <Collapse.Panel
        key="legend"
        header={_l('图例')}
        className={cx({ collapsible: !displaySetup.showLegend })}
        extra={
          <Switch
            size="small"
            checked={displaySetup.showLegend}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplayValue('showLegend', checked, true);
            }}
          />
        }
      >
        <div className="mBottom8">{_l('位置')}</div>
        <div className="chartTypeSelect flexRow valignWrapper mBottom16">
          {LegendTypeData.map(item => (
            <div
              key={item.value}
              className={cx('flex centerAlign pointer Gray_75', { active: displaySetup.legendType == item.value })}
              onClick={() => {
                this.handleChangeDisplayValue('legendType', item.value);
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      </Collapse.Panel>
    );
  }
  renderLabel() {
    const { currentReport } = this.props;
    const { showNumber, showPileTotal, hideOverlapText, percent } = currentReport.displaySetup;
    const switchChecked = showNumber || showPileTotal || hideOverlapText || percent.enable;
    return (
      <Collapse.Panel
        key="label"
        header={_l('数据标签')}
        className={cx({ collapsible: !switchChecked })}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplaySetup({
                showNumber: checked,
                showDimension: checked,
                showPercent: checked,
                showPileTotal: checked,
                hideOverlapText: checked,
                percent: {
                  ...percent,
                  enable: checked,
                },
              });
            }}
          />
        }
      >
        <Label
          currentReport={currentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
          onChangeDisplaySetup={this.handleChangeDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderGaugeColor() {
    return gaugeColorPanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle,
      onChangeDisplayValue: this.handleChangeDisplayValue,
    });
  }
  renderScale() {
    return scalePanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle,
    });
  }
  renderIndicator() {
    return indicatorPanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle,
    });
  }
  renderLayout() {
    const { currentReport } = this.props;
    const { style } = currentReport;
    const columnCount = style.columnCount || 1;

    const changeColumnCount = _.debounce(value => {
      if (value) {
        value = parseInt(value);
        value = isNaN(value) ? 0 : value;
        value = value > 4 ? 4 : value;
      } else {
        value = 1;
      }
      this.handleChangeStyle({ columnCount: value });
    }, 100);

    return (
      <Collapse.Panel key="layout" header={_l('布局')}>
        <div>
          <div className="flexRow valignWrapper mBottom12">
            <div style={{ width: 90 }}>{_l('每行显示个数')}</div>
            <Input
              className="chartInput columnCountInput"
              style={{ width: 78 }}
              value={columnCount}
              onChange={event => {
                changeColumnCount(event.target.value);
              }}
              suffix={
                <div className="flexColumn">
                  <Icon
                    icon="expand_less"
                    className={cx('Font20 pointer mBottom2', columnCount === 4 ? 'disabled' : 'Gray_9e')}
                    onClick={() => {
                      let value = Number(columnCount);
                      changeColumnCount(value + 1);
                    }}
                  />
                  <Icon
                    icon="expand_more"
                    className={cx('Font20 pointer mBottom2', columnCount === 1 ? 'disabled' : 'Gray_9e')}
                    onClick={() => {
                      let value = Number(columnCount);
                      changeColumnCount(value - 1);
                    }}
                  />
                </div>
              }
            />
          </div>
          <div className="flexRow valignWrapper mTop16 mBottom16">
            <Checkbox
              checked={style.allowScroll}
              onChange={e => {
                this.handleChangeStyle({ allowScroll: e.target.checked });
              }}
            >
              {_l('允许容器内滚动')}
            </Checkbox>
            <Tooltip title={_l('当统计项较多时，勾选此配置可以在容器内滚动查看')} placement="bottom" arrowPointAtCenter>
              <Icon className="Gray_9e Font18 pointer" icon="info" />
            </Tooltip>
          </div>
        </div>
      </Collapse.Panel>
    );
  }
  renderXAxis() {
    const { currentReport } = this.props;
    const { xdisplay, fontStyle, showChartType } = currentReport.displaySetup;
    const switchChecked = !!fontStyle || xdisplay.showDial || xdisplay.showTitle;
    const isBarChart = currentReport.reportType === reportTypes.BarChart;
    const isBidirectionalBarChart = currentReport.reportType === reportTypes.BidirectionalBarChart;
    const isVertical = isBarChart && showChartType === 2;
    return (
      <Collapse.Panel
        key="xAxis"
        header={isVertical ? _l('Y轴') : isBidirectionalBarChart ? _l('维度轴') : _l('X轴')}
        className={cx({ collapsible: !switchChecked })}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplaySetup({
                fontStyle: checked ? 1 : 0,
                xdisplay: {
                  ...xdisplay,
                  showDial: checked,
                  showTitle: checked,
                },
              });
              this.handleChangeStyle({
                showXAxisSlider: checked,
              });
            }}
          />
        }
      >
        <XAxis
          currentReport={currentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderYAxis() {
    const { currentReport } = this.props;
    const isBidirectionalBarChart = currentReport.reportType === reportTypes.BidirectionalBarChart;
    return isBidirectionalBarChart
      ? bidirectionalBarChartYAxisPanelGenerator(this.props)
      : yAxisPanelGenerator(this.props);
  }
  renderQuadrant() {
    const { style } = this.props.currentReport;
    const { quadrant = {} } = style;
    return (
      <Collapse.Panel
        key="quadrant"
        header={_l('四象限')}
        className={cx({ collapsible: !quadrant.visible })}
        extra={
          <Switch
            size="small"
            checked={quadrant.visible}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              const defaultQuadrant = {
                axisColor: '#9e9e9e',
                topRightBgColor: '#F44336',
                topRightText: _l('右上象限'),
                topLeftBgColor: '#FFA340',
                topLeftText: _l('左上象限'),
                bottomLeftBgColor: '#4CAF50',
                bottomLeftText: _l('左下象限'),
                bottomRightBgColor: '#1677ff',
                bottomRightText: _l('右下象限'),
                textColor: '#9e9e9e',
              };
              this.handleChangeStyle({
                quadrant: {
                  ...(_.isEmpty(quadrant) ? defaultQuadrant : quadrant),
                  visible: checked,
                },
              });
            }}
          />
        }
      >
        <Quadrant
          quadrant={quadrant}
          onChangeQuadrant={data => {
            this.handleChangeStyle({
              quadrant: {
                ...quadrant,
                ...data,
              },
            });
          }}
        />
      </Collapse.Panel>
    );
  }
  renderMeasureAxis() {
    const { currentReport } = this.props;
    return (
      <Collapse.Panel key="measureAxis" header={_l('测量轴')}>
        <MeasureAxis currentReport={currentReport} onChangeDisplayValue={this.handleChangeDisplayValue} />
      </Collapse.Panel>
    );
  }
  renderTopChart() {
    return topChartPanelGenerator({ ...this.props, onChangeStyle: this.handleChangeStyle });
  }
  renderWordCloudFontSize() {
    const { currentReport } = this.props;
    return (
      <Collapse.Panel key="wordCloudFontSize" header={_l('词大小范围')}>
        <MeasureAxis currentReport={currentReport} onChangeDisplayValue={this.handleChangeDisplayValue} />
      </Collapse.Panel>
    );
  }
  renderDataFilter() {
    const { currentReport } = this.props;
    const { displaySetup, reportType, pivotTable } = currentReport;
    return (
      <Collapse.Panel header={_l('数据过滤')} key="dataFilter">
        {reportType === reportTypes.PivotTable ? (
          <Fragment>
            <DataFilter
              className="mBottom10"
              name={_l('行数据')}
              showXAxisCount={pivotTable.showLineCount}
              reportType={reportType}
              onChange={count => {
                this.props.changeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      showLineCount: count,
                    },
                  },
                  true,
                );
              }}
            />
            <DataFilter
              name={_l('列数据')}
              showXAxisCount={pivotTable.showColumnCount}
              reportType={reportType}
              onChange={count => {
                this.props.changeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      showColumnCount: count,
                    },
                  },
                  true,
                );
              }}
            />
          </Fragment>
        ) : (
          <DataFilter
            showXAxisCount={displaySetup.showXAxisCount}
            reportType={reportType}
            onChange={count => {
              this.handleChangeDisplayValue('showXAxisCount', count, true);
            }}
          />
        )}
      </Collapse.Panel>
    );
  }
  renderUnit() {
    return unitPanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle,
    });
  }
  renderTitle() {
    const { currentReport, changeCurrentReport } = this.props;
    const { showTitle = true } = currentReport.displaySetup;
    return (
      <Collapse.Panel
        key="title"
        header={_l('标题')}
        className={cx({ collapsible: !showTitle })}
        extra={
          <Switch
            size="small"
            checked={showTitle}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplayValue('showTitle', checked);
            }}
          />
        }
      >
        <TitleStyles
          {...this.props}
          onChangeCurrentReport={changeCurrentReport}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderColor() {
    const { changeCurrentReport } = this.props;
    return (
      <Collapse.Panel header={_l('图形颜色')} key="color">
        <Color
          {...this.props}
          onChangeCurrentReport={changeCurrentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
        />
      </Collapse.Panel>
    );
  }
  renderPivotTableFieldColor() {
    const { currentReport, changeCurrentReport } = this.props;
    return (
      <Collapse.Panel header={_l('颜色')} key="pivotTableFieldColor" className="pivotTableFieldColorPanel">
        <PivotTableFieldColor
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
        />
      </Collapse.Panel>
    );
  }
  renderCountConfig() {
    const { currentReport, changeCurrentReport } = this.props;
    const { reportType } = currentReport;

    if ([reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType)) {
      return null;
    }

    if (reportTypes.PivotTable === reportType) {
      return pivotTableCountPanelGenerator({
        ...this.props,
        onChangeStyle: this.handleChangeStyle,
      });
    }

    if (reportTypes.NumberChart === reportType) {
      return this.renderNumberCount();
    }

    if ([reportTypes.BarChart, reportTypes.LineChart].includes(reportType)) {
      const { summary, yaxisList } = currentReport;
      return allCountPanelGenerator({
        ...this.props,
        key: 'allCount',
        title: _l('总计'),
        summary,
        yaxisList,
      });
    }

    if (reportTypes.DualAxes === reportType) {
      const { summary, yaxisList, rightY } = currentReport;
      return (
        <Fragment>
          {allCountPanelGenerator({
            ...this.props,
            key: 'allCount',
            title: _l('总计'),
            summary,
            yaxisList,
            changeCurrentReport: (data, isRequest) => {
              const { displaySetup, summary } = data;
              const result = {
                summary,
              };
              if (displaySetup) {
                result.displaySetup = displaySetup;
              }
              changeCurrentReport(result, isRequest);
            },
          })}
          {allCountPanelGenerator({
            ...this.props,
            key: 'rightAllCount',
            title: _l('辅助Y轴总计'),
            summary: rightY.summary,
            yaxisList: rightY.yaxisList,
            changeCurrentReport: (data, isRequest) => {
              const { displaySetup = {}, summary } = data;
              const { showTotal } = displaySetup;
              changeCurrentReport(
                {
                  rightY: {
                    ...rightY,
                    summary: {
                      ...summary,
                      showTotal,
                    },
                  },
                },
                isRequest,
              );
            },
          })}
        </Fragment>
      );
    }

    return this.renderCount();
  }
  renderExpandIcon(panelProps) {
    return (
      <Icon
        className={cx('Font18 mRight5 Gray_9e', { 'icon-arrow-active': panelProps.isActive })}
        icon="arrow-down-border"
      />
    );
  }
  render() {
    const { currentReport, sourceType } = this.props;
    const { reportType } = currentReport;

    return (
      <div className="chartStyle">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost>
          {this.renderCountConfig()}
          {reportTypes.NumberChart === reportType && this.renderNumberStyle()}
          {sourceType && this.renderTitle()}
          {[reportTypes.WordCloudChart].includes(reportType) && this.renderWordCloudFontSize()}
          {![
            reportTypes.NumberChart,
            reportTypes.CountryLayer,
            reportTypes.PivotTable,
            reportTypes.WordCloudChart,
            reportTypes.TopChart,
            reportTypes.GaugeChart,
            reportTypes.ProgressChart,
          ].includes(reportType) && this.renderLegend()}
          {[
            reportTypes.LineChart,
            reportTypes.BarChart,
            reportTypes.DualAxes,
            reportTypes.BidirectionalBarChart,
            reportTypes.ScatterChart,
          ].includes(reportType) && this.renderXAxis()}
          {[
            reportTypes.LineChart,
            reportTypes.BarChart,
            reportTypes.DualAxes,
            reportTypes.BidirectionalBarChart,
            reportTypes.ScatterChart,
          ].includes(reportType) && this.renderYAxis()}
          {reportTypes.ScatterChart === reportType && this.renderQuadrant()}
          {[reportTypes.RadarChart].includes(reportType) && this.renderMeasureAxis()}
          {![
            reportTypes.NumberChart,
            reportTypes.CountryLayer,
            reportTypes.PivotTable,
            reportTypes.WordCloudChart,
            reportTypes.TopChart,
          ].includes(reportType) && this.renderLabel()}
          {reportTypes.GaugeChart === reportType && (
            <Fragment key="gaugeChart">
              {this.renderGaugeColor()}
              {this.renderScale()}
              {this.renderIndicator()}
            </Fragment>
          )}
          {[reportTypes.ProgressChart].includes(reportType) && this.renderLayout()}
          {[reportTypes.TopChart].includes(reportType) && this.renderTopChart()}
          {![reportTypes.WordCloudChart].includes(reportType) && this.renderUnit()}
          {![
            reportTypes.NumberChart,
            reportTypes.CountryLayer,
            reportTypes.DualAxes,
            reportTypes.BidirectionalBarChart,
            reportTypes.WordCloudChart,
            reportTypes.GaugeChart,
            reportTypes.ProgressChart,
            reportTypes.ScatterChart,
          ].includes(reportType) && this.renderDataFilter()}
          {![reportTypes.NumberChart, reportTypes.PivotTable, reportTypes.GaugeChart].includes(reportType) &&
            this.renderColor()}
          {reportTypes.PivotTable === reportType && this.renderPivotTableFieldColor()}
        </Collapse>
      </div>
    );
  }
}
