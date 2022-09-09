import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Collapse, Checkbox, Switch } from 'antd';
import { Count, Location } from './components/Count';
import DataFilter from './components/DataFilter';
import Label from './components/Label';
import XAxis from './components/XAxis';
import yAxisPanelGenerator from './components/YAxis';
import unitPanelGenerator from './components/Unit';
import Color from './components/Color/index';
import FontSize from './components/FontSize';
import { reportTypes, LegendTypeData } from 'statistics/Charts/common';
import { isTimeControl } from 'statistics/common';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'statistics/redux/actions';
import './index.less';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'reportData', 'worksheetInfo'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ChartStyle extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeDisplaySetup = (data, isRequest = false) => {
    this.props.changeCurrentReport({
      displaySetup: data
    }, isRequest);
  }
  handleChangeDisplayValue = (key, value, isRequest) => {
    const { displaySetup } = this.props.currentReport;
    this.handleChangeDisplaySetup(
      {
        ...displaySetup,
        [key]: value,
      },
      isRequest,
    );
  }
  handleChangeStyle = (data, isRequest = false) => {
    const { style } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        style: {
          ...style,
          ...data
        }
      },
      isRequest
    );
  }
  renderCount() {
    const { reportType, displaySetup, summary, yaxisList, rightY, pivotTable = {} } = this.props.currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const dualAxesSwitchChecked = summary.showTotal || (rightY ? rightY.summary.showTotal : null);
    const switchChecked = isDualAxes ? dualAxesSwitchChecked : displaySetup.showTotal;
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
              if (isDualAxes) {
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
              isDualAxes ? (
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
                  {_l('Y轴')}
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
          {isDualAxes && (
            <Count
              smallTitle={
                isDualAxes ? (
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
                    {_l('辅助Y轴')}
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
  renderPivotTableLineCount() {
    const { reportType, displaySetup, yaxisList, pivotTable = {} } = this.props.currentReport;
    const { showLineTotal, lineSummary = {} } = pivotTable;
    const { controlList = [] } = lineSummary;
    return (
      <Collapse.Panel
        key="lineCount"
        header={_l('行总计')}
        className={cx({ collapsible: !showLineTotal })}
        extra={
          <Switch
            size="small"
            checked={showLineTotal}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.props.changeCurrentReport(
                {
                  pivotTable: {
                    ...pivotTable,
                    showLineTotal: checked
                  },
                },
                true,
              );
            }}
          />
        }
      >
        <Fragment>
          {yaxisList.map(item => (
            <Count
              key={item.controlId}
              isPivotTable={true}
              extra={
                <Checkbox
                  className="mLeft0 mBottom15"
                  checked={!!_.find(controlList, { controlId: item.controlId })}
                  onChange={(event) => {
                    const id = item.controlId;
                    if (event.target.checked) {
                      const data = {
                        controlId: id,
                        name: '',
                        sum: 0,
                        type: 1
                      }
                      this.props.changeCurrentReport(
                        {
                          pivotTable: {
                            ...pivotTable,
                            lineSummary: {
                              ...lineSummary,
                              controlList: controlList.concat(data)
                            }
                          },
                        },
                        true,
                      );
                    } else {
                      this.props.changeCurrentReport(
                        {
                          pivotTable: {
                            ...pivotTable,
                            lineSummary: {
                              ...lineSummary,
                              controlList: controlList.filter(item => item.controlId !== id)
                            }
                          },
                        },
                        true,
                      );
                    }
                  }}
                >
                  {item.controlName}
                </Checkbox>
              }
              summary={_.find(controlList, { controlId: item.controlId }) || { type: 1 }}
              onChangeSummary={(data, isRequest = true) => {
                const id = item.controlId;
                const newControlList = controlList.map(item => {
                  if (id === item.controlId) {
                    return {
                      ...item,
                      ...data
                    }
                  } else {
                    return item;
                  }
                });
                this.props.changeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      lineSummary: {
                        ...lineSummary,
                        controlList: newControlList
                      }
                    },
                  },
                  isRequest,
                );
              }}
            />
          ))}
          <Location
            summary={lineSummary}
            locationType="line"
            onChangeSummary={(data) => {
              this.props.changeCurrentReport(
                {
                  pivotTable: {
                    ...pivotTable,
                    lineSummary: {
                      ...pivotTable.lineSummary,
                      ...data,
                    },
                  },
                },
                true
              );
            }}
          />
        </Fragment>
      </Collapse.Panel>
    );
  }
  renderPivotTableColumnCount() {
    const { reportType, displaySetup, yaxisList, pivotTable = {} } = this.props.currentReport;
    const { showColumnTotal, columnSummary = {} } = pivotTable;
    const { controlList = [] } = columnSummary;
    return (
      <Collapse.Panel
        key="columnCount"
        header={_l('列总计')}
        className={cx({ collapsible: !showColumnTotal })}
        extra={
          <Switch
            size="small"
            checked={showColumnTotal}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.props.changeCurrentReport(
                {
                  pivotTable: {
                    ...pivotTable,
                    showColumnTotal: checked
                  },
                },
                true,
              );
            }}
          />
        }
      >
        <Fragment>
          {yaxisList.map(item => (
            <Count
              key={item.controlId}
              isPivotTable={true}
              extra={
                <Checkbox
                  className="mLeft0 mBottom15"
                  checked={!!_.find(controlList, { controlId: item.controlId })}
                  onChange={(event) => {
                    const id = item.controlId;
                    if (event.target.checked) {
                      const data = {
                        controlId: id,
                        name: '',
                        sum: 0,
                        type: 1
                      }
                      this.props.changeCurrentReport(
                        {
                          pivotTable: {
                            ...pivotTable,
                            columnSummary: {
                              ...columnSummary,
                              controlList: controlList.concat(data)
                            }
                          },
                        },
                        true,
                      );
                    } else {
                      this.props.changeCurrentReport(
                        {
                          pivotTable: {
                            ...pivotTable,
                            columnSummary: {
                              ...columnSummary,
                              controlList: controlList.filter(item => item.controlId !== id)
                            }
                          },
                        },
                        true,
                      );
                    }
                  }}
                >
                  {item.controlName}
                </Checkbox>
              }
              summary={_.find(controlList, { controlId: item.controlId }) || { type: 1 }}
              onChangeSummary={(data, isRequest = true) => {
                const id = item.controlId;
                const newControlList = controlList.map(item => {
                  if (id === item.controlId) {
                    return {
                      ...item,
                      ...data
                    }
                  } else {
                    return item;
                  }
                });
                this.props.changeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      columnSummary: {
                        ...columnSummary,
                        controlList: newControlList
                      }
                    },
                  },
                  isRequest,
                );
              }}
            />
          ))}
          <Location
            summary={columnSummary}
            locationType="column"
            onChangeSummary={(data) => {
              this.props.changeCurrentReport(
                {
                  pivotTable: {
                    ...pivotTable,
                    columnSummary: {
                      ...pivotTable.columnSummary,
                      ...data,
                    },
                  },
                },
                true
              );
            }}
          />
        </Fragment>
      </Collapse.Panel>
    );
  }
  renderLineHeight() {
    const { currentReport } = this.props;
    const { style } = currentReport;
    const unilineShow = style.pivotTableUnilineShow;
    return (
      <Collapse.Panel
        key="lienHeight"
        header={_l('单行显示')}
        className={cx('hideArrowIcon', { collapsible: !unilineShow })}
        extra={
          <Switch
            size="small"
            checked={unilineShow}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeStyle({ pivotTableUnilineShow: checked });
            }}
          />
        }
      >
      </Collapse.Panel>
    );
  }
  renderTableHeaderFreeze() {
    const { style = {} } = this.props.currentReport;
    const { pivotTableLineFreeze, pivotTableColumnFreeze } = style;
    const freezeChecked = pivotTableLineFreeze || pivotTableColumnFreeze;
    return (
      <Collapse.Panel
        key="headerFreeze"
        header={_l('表头冻结')}
        className={cx({ collapsible: !freezeChecked })}
        extra={
          <Switch
            size="small"
            checked={freezeChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeStyle({
                pivotTableLineFreeze: checked,
                pivotTableColumnFreeze: checked,
              });
            }}
          />
        }
      >
        <div className="flexColumn">
          <div className="Gray_75 mBottom15">{_l('表头冻结配置只对桌面端有效')}</div>
          <Checkbox
            className="mLeft0 mBottom15"
            checked={pivotTableLineFreeze}
            onChange={() => {
              this.handleChangeStyle({ pivotTableLineFreeze: !pivotTableLineFreeze });
            }}
          >
            {_l('冻结维度(行)')}
          </Checkbox>
          <Checkbox
            className="mLeft0 mBottom15"
            checked={pivotTableColumnFreeze}
            onChange={() => {
              this.handleChangeStyle({ pivotTableColumnFreeze: !pivotTableColumnFreeze });
            }}
          >
            {_l('冻结维度(列)')}
          </Checkbox>
        </div>
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
    const { currentReport } = this.props;
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
              this.handleChangeDisplaySetup({
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
          onUpdateDisplaySetup={this.handleChangeDisplaySetup}
        />
      </Collapse.Panel>
    );
  }
  renderXAxis() {
    const { currentReport } = this.props;
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
              this.handleChangeDisplaySetup({
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
    return unitPanelGenerator(this.props);
  }
  renderColor() {
    const { currentReport, changeCurrentReport, worksheetInfo } = this.props;
    return (
      <Collapse.Panel header={_l('图形颜色')} key="color">
        <Color
          columns={worksheetInfo.columns}
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
        />
      </Collapse.Panel>
    );
  }
  renderFontSize() {
    const { currentReport, changeCurrentReport } = this.props;
    return (
      <Collapse.Panel header={_l('字体大小')} key="fontSize">
        <FontSize
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    )
  }
  renderExportType() {
    const { currentReport, changeCurrentReport } = this.props;
    const { exportType } = currentReport.displaySetup;
    return (
      <Collapse.Panel
        key="exportType"
        header={_l('导出Excel数据格式')}
        extra={
          <Switch
            size="small"
            checked={exportType}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplaySetup({
                ...currentReport.displaySetup,
                exportType: checked ? 1 : 0
              });
            }}
          />
        }
      >
        <div className="Gray_75 mBottom20">{_l('按统计显示单位导出')}</div>
      </Collapse.Panel>
    );
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
    const { currentReport } = this.props;
    const { reportType, xaxes } = currentReport;
    const xAxisisTime = isTimeControl(xaxes.controlType);
    return (
      <div className="chartStyle">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost>
          {reportTypes.NumberChart !== reportType && (
            reportTypes.PivotTable === reportType ? (
              <Fragment key="pivotTableCount">
                {this.renderPivotTableLineCount()}
                {this.renderPivotTableColumnCount()}
              </Fragment>
            ) : (
              this.renderCount()
            )
          )}
          {[reportTypes.PivotTable].includes(reportType) && this.renderLineHeight()}
          {[reportTypes.PivotTable].includes(reportType) && this.renderTableHeaderFreeze()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable].includes(reportType) &&
            this.renderLegend()}
          {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.DualAxes].includes(reportType) &&
            this.renderXAxis()}
          {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.DualAxes].includes(reportType) &&
            this.renderYAxis()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable].includes(reportType) &&
            this.renderLabel()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.DualAxes].includes(reportType) &&
            this.renderDataFilter()}
          {this.renderUnit()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable].includes(reportType) &&
            this.renderColor()}
          {[reportTypes.NumberChart].includes(reportType) && this.renderFontSize()}
          {/*{this.renderExportType()}*/}
        </Collapse>
      </div>
    );
  }
}
