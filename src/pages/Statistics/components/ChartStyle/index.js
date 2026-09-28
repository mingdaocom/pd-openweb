import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Checkbox, Collapse, InputNumber, Segmented, Switch, Tooltip } from 'ming-ui/antd-components';
import { LegendTypeData } from 'statistics/Charts/common';
import * as actions from 'statistics/redux/actions';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';
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

let ChartStyle = class ChartStyle extends Component {
  constructor(props) {
    super(props);
  }

  handleChangeDisplaySetup = (data, isRequest = false) => {
    const { displaySetup } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        displaySetup: { ...displaySetup, ...data },
      },
      isRequest,
    );
  };
  handleChangeYDisplaySetup = (data, isRequest = false) => {
    const { rightY } = this.props.currentReport;
    const { display } = rightY;
    this.props.changeCurrentReport(
      {
        rightY: { ...rightY, display: { ...display, ydisplay: { ...display.ydisplay, ...data } } },
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
        style: { ...style, ...data },
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
    return {
      key: 'count',
      label: _l('总计'),
      className: cx({
        collapsible: !switchChecked,
      }),
      extra: (
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
                  displaySetup: { ...displaySetup, showTotal: false },
                  summary: { ...summary, showTotal: checked },
                  rightY: { ...rightY, summary: { ...rightY.summary, showTotal: checked } },
                },
                true,
              );
            } else {
              this.handleChangeDisplayValue('showTotal', checked, true);
            }
          }}
        />
      ),
      children: (
        <Fragment>
          <Count
            reportType={reportType}
            smallTitle={
              isMultiaxis ? (
                <Checkbox
                  className="mLeft0 mBottom15"
                  checked={summary.showTotal}
                  onChange={() => {
                    this.props.changeCurrentReport(
                      {
                        displaySetup: { ...displaySetup, showTotal: false },
                        summary: { ...summary, showTotal: !summary.showTotal },
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
                  summary: { ...summary, ...data },
                },
                isRequest,
              );
            }}
          />
          {isMultiaxis && (
            <Count
              reportType={reportType}
              smallTitle={
                isMultiaxis ? (
                  <Checkbox
                    className="mLeft0 mBottom15"
                    checked={rightY.summary.showTotal}
                    onChange={() => {
                      this.props.changeCurrentReport(
                        {
                          displaySetup: { ...displaySetup, showTotal: false },
                          rightY: { ...rightY, summary: { ...rightY.summary, showTotal: !rightY.summary.showTotal } },
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
                    rightY: { ...rightY, summary: { ...rightY.summary, ...data } },
                  },
                  isRequest,
                );
              }}
            />
          )}
        </Fragment>
      ),
    };
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

    if (reportTypes.WorldMap === reportType) {
      return null;
    }

    return {
      key: 'legend',
      label: _l('图例'),
      className: cx({
        collapsible: !displaySetup.showLegend,
      }),
      extra: (
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
      ),
      children: (
        <Fragment>
          <div className="mBottom8">{_l('位置')}</div>
          <Segmented
            block
            className="bgDisabled mBottom16"
            value={LegendTypeData.find(item => displaySetup.legendType == item.value)?.value ?? ''}
            options={LegendTypeData.map(item => ({
              value: item.value,
              label: (
                <span className="ellipsis" title={item.text}>
                  {item.text}
                </span>
              ),
            }))}
            onChange={value => this.handleChangeDisplayValue('legendType', value)}
          />
        </Fragment>
      ),
    };
  }

  renderLabel() {
    const { currentReport } = this.props;
    return {
      key: 'label',
      label: _l('数据标签'),
      children: (
        <Label
          currentReport={currentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
          onChangeDisplaySetup={this.handleChangeDisplaySetup}
          onChangeYDisplaySetup={this.handleChangeYDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
          onChangeCurrentReport={this.props.changeCurrentReport}
        />
      ),
    };
  }

  renderGaugeColor() {
    return gaugeColorPanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle,
      onChangeDisplayValue: this.handleChangeDisplayValue,
    });
  }

  renderScale() {
    return scalePanelGenerator({ ...this.props, onChangeStyle: this.handleChangeStyle });
  }

  renderIndicator() {
    return indicatorPanelGenerator({ ...this.props, onChangeStyle: this.handleChangeStyle });
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

      this.handleChangeStyle({
        columnCount: value,
      });
    }, 100);

    return {
      key: 'layout',
      label: _l('布局'),
      children: (
        <div>
          <div className="flexRow valignWrapper mBottom12">
            <div
              style={{
                width: 90,
              }}
            >
              {_l('每行显示个数')}
            </div>
            <InputNumber
              min={1}
              max={4}
              precision={0}
              style={{
                width: 78,
              }}
              value={columnCount}
              onChange={changeColumnCount}
            />
          </div>
          <div className="flexRow valignWrapper mTop16 mBottom16">
            <Checkbox
              checked={style.allowScroll}
              onChange={e => {
                this.handleChangeStyle({
                  allowScroll: e.target.checked,
                });
              }}
            >
              {_l('允许容器内滚动')}
            </Checkbox>
            <Tooltip
              title={_l('当统计项较多时，勾选此配置可以在容器内滚动查看')}
              placement="bottom"
              arrow={{ pointAtCenter: true }}
            >
              <Icon className="textTertiary Font18 pointer" icon="info" />
            </Tooltip>
          </div>
        </div>
      ),
    };
  }

  renderXAxis() {
    const { currentReport } = this.props;
    const { xdisplay, fontStyle, showChartType } = currentReport.displaySetup;
    const switchChecked = !!fontStyle || xdisplay.showDial || xdisplay.showTitle;
    const isBarChart = currentReport.reportType === reportTypes.BarChart;
    const isBidirectionalBarChart = currentReport.reportType === reportTypes.BidirectionalBarChart;
    const isVertical = isBarChart && showChartType === 2;
    return {
      key: 'xAxis',
      label: isVertical ? _l('Y轴') : isBidirectionalBarChart ? _l('维度轴') : _l('X轴'),
      className: cx({
        collapsible: !switchChecked,
      }),
      extra: (
        <Switch
          size="small"
          checked={switchChecked}
          onClick={(checked, event) => {
            event.stopPropagation();
          }}
          onChange={checked => {
            this.handleChangeDisplaySetup({
              fontStyle: checked ? 1 : 0,
              xdisplay: { ...xdisplay, showDial: checked, showTitle: checked },
            });
            this.handleChangeStyle({
              showXAxisSlider: checked,
            });
          }}
        />
      ),
      children: (
        <XAxis
          currentReport={currentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
          onChangeStyle={this.handleChangeStyle}
        />
      ),
    };
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
    return {
      key: 'quadrant',
      label: _l('四象限'),
      className: cx({
        collapsible: !quadrant.visible,
      }),
      extra: (
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
              quadrant: { ...(_.isEmpty(quadrant) ? defaultQuadrant : quadrant), visible: checked },
            });
          }}
        />
      ),
      children: (
        <Quadrant
          quadrant={quadrant}
          onChangeQuadrant={data => {
            this.handleChangeStyle({
              quadrant: { ...quadrant, ...data },
            });
          }}
        />
      ),
    };
  }

  renderMeasureAxis() {
    const { currentReport } = this.props;
    return {
      key: 'measureAxis',
      label: _l('测量轴'),
      children: <MeasureAxis currentReport={currentReport} onChangeDisplayValue={this.handleChangeDisplayValue} />,
    };
  }

  renderTopChart() {
    return topChartPanelGenerator({ ...this.props, onChangeStyle: this.handleChangeStyle });
  }

  renderWordCloudFontSize() {
    const { currentReport } = this.props;
    return {
      key: 'wordCloudFontSize',
      label: _l('词大小范围'),
      children: <MeasureAxis currentReport={currentReport} onChangeDisplayValue={this.handleChangeDisplayValue} />,
    };
  }

  renderDataFilter() {
    const { currentReport } = this.props;
    const { displaySetup, reportType, pivotTable } = currentReport;
    return {
      key: 'dataFilter',
      label: _l('数据过滤'),
      children:
        reportType === reportTypes.PivotTable ? (
          <Fragment>
            <DataFilter
              className="mBottom10"
              name={_l('行数据')}
              showXAxisCount={pivotTable.showLineCount}
              reportType={reportType}
              onChange={count => {
                this.props.changeCurrentReport(
                  {
                    pivotTable: { ...pivotTable, showLineCount: count },
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
                    pivotTable: { ...pivotTable, showColumnCount: count },
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
        ),
    };
  }

  renderUnit() {
    return unitPanelGenerator({ ...this.props, onChangeStyle: this.handleChangeStyle });
  }

  renderTitle() {
    const { currentReport, changeCurrentReport } = this.props;
    const { showTitle = true } = currentReport.displaySetup;
    return {
      key: 'title',
      label: _l('标题'),
      className: cx({
        collapsible: !showTitle,
      }),
      extra: (
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
      ),
      children: (
        <TitleStyles
          {...this.props}
          onChangeCurrentReport={changeCurrentReport}
          onChangeStyle={this.handleChangeStyle}
        />
      ),
    };
  }

  renderColor() {
    const { changeCurrentReport } = this.props;
    return {
      key: 'color',
      label: _l('图形颜色'),
      children: (
        <Color
          {...this.props}
          onChangeCurrentReport={changeCurrentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
        />
      ),
    };
  }

  renderPivotTableFieldColor() {
    const { currentReport, changeCurrentReport } = this.props;
    return {
      key: 'pivotTableFieldColor',
      label: _l('颜色'),
      className: 'pivotTableFieldColorPanel',
      children: (
        <PivotTableFieldColor
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
        />
      ),
    };
  }

  renderCountConfig() {
    const { currentReport, changeCurrentReport } = this.props;
    const { reportType } = currentReport;

    if ([reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType)) {
      return null;
    }

    if (reportTypes.PivotTable === reportType) {
      return pivotTableCountPanelGenerator({ ...this.props, onChangeStyle: this.handleChangeStyle });
    }

    if (reportTypes.NumberChart === reportType) {
      return this.renderNumberCount();
    }

    if ([reportTypes.BarChart, reportTypes.LineChart].includes(reportType)) {
      const { summary, yaxisList } = currentReport;
      return allCountPanelGenerator({ ...this.props, key: 'allCount', title: _l('总计'), summary, yaxisList });
    }

    if (reportTypes.DualAxes === reportType) {
      const { summary, yaxisList, rightY } = currentReport;
      return [
        allCountPanelGenerator({
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
        }),
        allCountPanelGenerator({
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
                rightY: { ...rightY, summary: { ...summary, showTotal } },
              },
              isRequest,
            );
          },
        }),
      ];
    }

    return this.renderCount();
  }

  renderExpandIcon(panelProps) {
    return (
      <Icon
        className={cx('Font18 mRight5 textTertiary', {
          'icon-arrow-active': panelProps.isActive,
        })}
        icon="arrow-down-border"
      />
    );
  }

  render() {
    const { currentReport, sourceType } = this.props;
    const { reportType } = currentReport;
    const items = _.compact(
      _.flatten([
        this.renderCountConfig(),
        reportTypes.NumberChart === reportType && this.renderNumberStyle(),
        sourceType && this.renderTitle(),
        [reportTypes.WordCloudChart].includes(reportType) && this.renderWordCloudFontSize(),
        ![
          reportTypes.NumberChart,
          reportTypes.CountryLayer,
          reportTypes.PivotTable,
          reportTypes.WordCloudChart,
          reportTypes.TopChart,
          reportTypes.GaugeChart,
          reportTypes.ProgressChart,
        ].includes(reportType) && this.renderLegend(),
        [
          reportTypes.LineChart,
          reportTypes.BarChart,
          reportTypes.DualAxes,
          reportTypes.BidirectionalBarChart,
          reportTypes.ScatterChart,
        ].includes(reportType) && this.renderXAxis(),
        [
          reportTypes.LineChart,
          reportTypes.BarChart,
          reportTypes.DualAxes,
          reportTypes.BidirectionalBarChart,
          reportTypes.ScatterChart,
        ].includes(reportType) && this.renderYAxis(),
        reportTypes.ScatterChart === reportType && this.renderQuadrant(),
        [reportTypes.RadarChart].includes(reportType) && this.renderMeasureAxis(),
        ![
          reportTypes.NumberChart,
          reportTypes.CountryLayer,
          reportTypes.PivotTable,
          reportTypes.WordCloudChart,
          reportTypes.TopChart,
          reportTypes.WorldMap,
        ].includes(reportType) && this.renderLabel(),
        reportTypes.GaugeChart === reportType && [this.renderGaugeColor(), this.renderScale(), this.renderIndicator()],
        [reportTypes.ProgressChart].includes(reportType) && this.renderLayout(),
        [reportTypes.TopChart].includes(reportType) && this.renderTopChart(),
        ![reportTypes.WordCloudChart].includes(reportType) && this.renderUnit(),
        ![
          reportTypes.NumberChart,
          reportTypes.CountryLayer,
          reportTypes.DualAxes,
          reportTypes.BidirectionalBarChart,
          reportTypes.WordCloudChart,
          reportTypes.GaugeChart,
          reportTypes.ProgressChart,
          reportTypes.ScatterChart,
          reportTypes.WorldMap,
        ].includes(reportType) && this.renderDataFilter(),
        ![reportTypes.NumberChart, reportTypes.PivotTable, reportTypes.GaugeChart].includes(reportType) &&
          this.renderColor(),
        reportTypes.PivotTable === reportType && this.renderPivotTableFieldColor(),
      ]),
    );

    return (
      <div className="chartStyle">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost items={items} />
      </div>
    );
  }
};
ChartStyle = connect(
  state => ({ ..._.pick(state.statistics, ['currentReport', 'reportData', 'worksheetInfo']) }),
  dispatch => bindActionCreators(actions, dispatch),
)(ChartStyle);
export default ChartStyle;
