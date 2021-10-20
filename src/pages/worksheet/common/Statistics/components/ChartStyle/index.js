import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Collapse, Checkbox, Switch } from 'antd';
import Count from './components/Count';
import DataContrast from './components/DataContrast';
import DataFilter from './components/DataFilter';
import Label from './components/Label';
import XAxis from './components/XAxis';
import yAxisPanelGenerator from './components/YAxis';
import unitPanelGenerator from './components/Unit';
import Color from './components/Color';
import FontSize from './components/FontSize';
import { reportTypes, LegendTypeData } from 'src/pages/worksheet/common/Statistics/Charts/common';
import './index.less';

export default class ChartStyle extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeDisplayValue = (key, value, isRequest) => {
    const { displaySetup } = this.props.currentReport;
    this.props.onUpdateDisplaySetup(
      {
        ...displaySetup,
        [key]: value,
      },
      isRequest,
    );
  };
  renderCount() {
    const { reportType, displaySetup, summary, yaxisList, rightY, pivotTable } = this.props.currentReport;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const dualAxesSwitchChecked = summary.showTotal || (rightY ? rightY.summary.showTotal : null);
    const switchChecked = isPivotTable
      ? pivotTable.showLineTotal || pivotTable.showColumnTotal
      : isDualAxes
      ? dualAxesSwitchChecked
      : displaySetup.showTotal;
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
              if (isPivotTable) {
                this.props.onChangeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      showLineTotal: checked,
                      showColumnTotal: checked,
                    },
                  },
                  true,
                );
              } else if (isDualAxes) {
                this.props.onChangeCurrentReport(
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
        {isPivotTable ? (
          <Fragment>
            <Count
              isPivotTable={true}
              locationType="line"
              extra={
                <Checkbox
                  className="mLeft0 mBottom15"
                  checked={pivotTable.showLineTotal}
                  onChange={() => {
                    this.props.onChangeCurrentReport(
                      {
                        pivotTable: {
                          ...pivotTable,
                          showLineTotal: !pivotTable.showLineTotal,
                        },
                      },
                      true,
                    );
                  }}
                >
                  {_l('行汇总')}
                </Checkbox>
              }
              summary={pivotTable.lineSummary}
              yaxisList={yaxisList}
              onChangeSummary={(data, isRequest = true) => {
                this.props.onChangeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      lineSummary: {
                        ...pivotTable.lineSummary,
                        ...data,
                      },
                    },
                  },
                  isRequest,
                );
              }}
            />
            <Count
              isPivotTable={true}
              locationType="column"
              extra={
                <Checkbox
                  className="mLeft0 mBottom15"
                  checked={pivotTable.showColumnTotal}
                  onChange={() => {
                    this.props.onChangeCurrentReport(
                      {
                        pivotTable: {
                          ...pivotTable,
                          showColumnTotal: !pivotTable.showColumnTotal,
                        },
                      },
                      true,
                    );
                  }}
                >
                  {_l('列汇总')}
                </Checkbox>
              }
              summary={pivotTable.columnSummary}
              yaxisList={yaxisList}
              onChangeSummary={(data, isRequest = true) => {
                this.props.onChangeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      columnSummary: {
                        ...pivotTable.columnSummary,
                        ...data,
                      },
                    },
                  },
                  isRequest,
                );
              }}
            />
          </Fragment>
        ) : (
          <Fragment>
            <Count
              smallTitle={
                isDualAxes ? (
                  <Checkbox
                    className="mLeft0 mBottom15"
                    checked={summary.showTotal}
                    onChange={() => {
                      this.props.onChangeCurrentReport(
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
                    {_l('左Y轴')}
                  </Checkbox>
                ) : null
              }
              summary={summary || {}}
              yaxisList={yaxisList}
              onChangeSummary={(data, isRequest = true) => {
                this.props.onChangeCurrentReport(
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
            {isDualAxes && (
              <Count
                smallTitle={
                  isDualAxes ? (
                    <Checkbox
                      className="mLeft0 mBottom15"
                      checked={rightY.summary.showTotal}
                      onChange={() => {
                        this.props.onChangeCurrentReport(
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
                      {_l('右Y轴')}
                    </Checkbox>
                  ) : null
                }
                summary={rightY.summary || {}}
                yaxisList={rightY.yaxisList}
                onChangeSummary={(data, isRequest = true) => {
                  this.props.onChangeCurrentReport(
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
        )}
      </Collapse.Panel>
    );
  }
  renderLegend() {
    const { displaySetup } = this.props.currentReport;
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
    const { currentReport, onUpdateDisplaySetup } = this.props;
    const { showNumber, showPileTotal, hideOverlapText } = currentReport.displaySetup;
    const switchChecked = showNumber || showPileTotal || hideOverlapText;
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
              onUpdateDisplaySetup({
                ...currentReport.displaySetup,
                showNumber: checked,
                showDimension: checked,
                showPercent: checked,
                showPileTotal: checked,
                hideOverlapText: checked,
              });
            }}
          />
        }
      >
        <Label
          currentReport={currentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
          onUpdateDisplaySetup={onUpdateDisplaySetup}
        />
      </Collapse.Panel>
    );
  }
  renderXAxis() {
    const { currentReport, onUpdateDisplaySetup } = this.props;
    const { xdisplay, fontStyle, showChartType } = currentReport.displaySetup;
    const switchChecked = !!fontStyle || xdisplay.showDial || xdisplay.showTitle;
    const isBarChart = currentReport.reportType === reportTypes.BarChart;
    const isVertical = isBarChart && showChartType === 2;
    return (
      <Collapse.Panel
        key="xAxis"
        header={isVertical ? _l('Y轴') : _l('X轴')}
        className={cx({ collapsible: !switchChecked })}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              onUpdateDisplaySetup({
                ...currentReport.displaySetup,
                fontStyle: checked ? 1 : 0,
                xdisplay: {
                  ...xdisplay,
                  showDial: checked,
                  showTitle: checked,
                },
              });
            }}
          />
        }
      >
        <XAxis currentReport={currentReport} onChangeDisplayValue={this.handleChangeDisplayValue} />
      </Collapse.Panel>
    );
  }
  renderYAxis() {
    return yAxisPanelGenerator(this.props);
  }
  renderDataContrast() {
    const { xAxisisTime, currentReport, reportData, onUpdateDisplaySetup } = this.props;
    return (
      <Collapse.Panel header={_l('数据对比')} key="dataContrast">
        <DataContrast
          xAxisisTime={xAxisisTime}
          currentReport={currentReport}
          mapKeys={Object.keys(reportData.map || [])}
          onUpdateDisplaySetup={onUpdateDisplaySetup}
        />
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
              showXAxisCount={currentReport.showLineCount}
              reportType={reportType}
              onChange={count => {
                this.props.onChangeCurrentReport(
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
              showXAxisCount={currentReport.showColumnCount}
              reportType={reportType}
              onChange={count => {
                this.props.onChangeCurrentReport(
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
    return unitPanelGenerator(this.props);
  }
  renderColor() {
    const { currentReport, onChangeCurrentReport, worksheetInfo } = this.props;
    return (
      <Collapse.Panel header={_l('图形颜色')} key="color">
        <Color
          columns={worksheetInfo.columns}
          currentReport={currentReport}
          onChangeCurrentReport={onChangeCurrentReport}
        />
      </Collapse.Panel>
    );
  }
  renderFontSize() {
    const { currentReport, onChangeCurrentReport } = this.props;
    return (
      <Collapse.Panel header={_l('字体大小')} key="fontSize">
        <FontSize
          currentReport={currentReport}
          onChangeCurrentReport={onChangeCurrentReport}
        />
      </Collapse.Panel>
    )
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
    const { xAxisisTime, currentReport } = this.props;
    const { reportType } = currentReport;
    return (
      <div className="chartStyle">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost>
          {reportTypes.NumberChart !== reportType && this.renderCount()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable].includes(reportType) &&
            this.renderLegend()}
          {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.DualAxes].includes(reportType) &&
            this.renderXAxis()}
          {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.DualAxes].includes(reportType) &&
            this.renderYAxis()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable].includes(reportType) &&
            this.renderLabel()}
          {((reportType === reportTypes.LineChart && xAxisisTime) ||
            [reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType)) &&
            this.renderDataContrast()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.DualAxes].includes(reportType) &&
            this.renderDataFilter()}
          {this.renderUnit()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable].includes(reportType) &&
            this.renderColor()}
          {[reportTypes.NumberChart].includes(reportType) && this.renderFontSize()}
        </Collapse>
      </div>
    );
  }
}
