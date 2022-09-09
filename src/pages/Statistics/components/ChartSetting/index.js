import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import XAxis from './components/XAxis';
import YAxis from './components/YAxis';
import GroupingAxis from './components/GroupingAxis';
import PivotTableAxis from './components/PivotTableAxis';
import Filter from './components/Filter';
import AreaScope from './components/AreaScope';
import { chartType, getAxisText, isTimeControl, filterDisableParticleSizeTypes } from '../../common';
import { reportTypes } from '../../Charts/common';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'statistics/redux/actions';
import './index.less';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'axisControls', 'worksheetInfo', 'filterItem'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ChartSetting extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeFilterItem = (filterItem, conditions) => {
    const { currentReport } = this.props;
    this.props.changeFilterItem(filterItem);
    this.props.changeCurrentReport(
      {
        filter: {
          ...currentReport.filter,
          filterControls: conditions,
        }
      },
      true,
    );
  }
  renderChartType() {
    const { reportType, displaySetup } = this.props.currentReport;
    return (
      <div className="mBottom20">
        <div className="mBottom10 Bold Font13">{_l('图形')}</div>
        <div className="chartTypeSelect flexRow valignWrapper">
          {
            chartType[reportType].items.map(item => (
              <div
                key={item.value}
                className={cx('flex centerAlign pointer Gray_75', { active: displaySetup.showChartType == item.value })}
                onClick={() => {
                  if (displaySetup.showChartType !== item.value) {
                    this.props.changeCurrentReport({
                      displaySetup: {
                        ...displaySetup,
                        showChartType: item.value,
                        isPerPile: [reportTypes.LineChart].includes(reportType) ? false : displaySetup.isPerPile,
                      }
                    });
                  }
                }}
              >
                {item.name}
              </div>
            ))
          }
        </div>
      </div>
    );
  }
  renderPivotTableAxis(x, y) {
    const { currentReport, axisControls, worksheetInfo, changeCurrentReport } = this.props;
    const { lines = [], columns = [] } = currentReport.pivotTable || {};
    const disableParticleSizeTypes = [...lines, ...columns].filter(item => item.particleSizeType).map(item => `${item.controlId}-${item.particleSizeType}`);
    return (
      <Fragment>
        <PivotTableAxis
          name={x}
          type="lines"
          axisControls={axisControls}
          allControls={worksheetInfo.columns}
          list={lines}
          disableParticleSizeTypes={disableParticleSizeTypes}
          onUpdateList={(lines, id) => {
            changeCurrentReport({
              pivotTable: {
                ...currentReport.pivotTable,
                lines,
              },
              sorts: currentReport.sorts.filter(item => _.findKey(item) !== id)
            }, true);
          }}
          onAdd={this.props.addLines}
          onRemove={this.props.removeLines}
        />
        <PivotTableAxis
          name={y}
          type="columns"
          axisControls={axisControls}
          allControls={worksheetInfo.columns}
          list={columns}
          disableParticleSizeTypes={disableParticleSizeTypes}
          onUpdateList={(columns, id) => {
            changeCurrentReport({
              pivotTable: {
                ...currentReport.pivotTable,
                columns,
              },
              sorts: currentReport.sorts.filter(item => _.findKey(item) !== id)
            }, true);
          }}
          onAdd={this.props.addColumns}
          onRemove={this.props.removeColumns}
        />
        <PivotTableAxis
          name={_l('数值')}
          verifyNumber={true}
          disableParticleSizeTypes={[]}
          axisControls={axisControls.concat(currentReport.formulas)}
          allControls={worksheetInfo.columns}
          list={currentReport.yaxisList}
          onUpdateList={(yaxisList, id) => {
            changeCurrentReport({
              yaxisList,
              sorts: currentReport.sorts.filter(item => _.findKey(item) !== id)
            }, true);
          }}
          onAdd={this.props.addYaxisList}
          onRemove={({ controlId }) => {
            this.props.removeYaxisList(controlId);
          }}
        />
      </Fragment>
    );
  }
  renderChartAxis(x, y) {
    const { currentReport, axisControls, worksheetInfo, changeCurrentReport } = this.props;
    const { reportType, displaySetup, xaxes, split, rightY, formulas = [] } = currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const disableParticleSizeTypes = [xaxes, split, rightY ? rightY.split : {}].filter(item => item.particleSizeType).map(item => `${item.controlId}-${item.particleSizeType}`);
    return (
      <Fragment>
        {
          reportType && ![reportTypes.NumberChart].includes(reportType) && (
            <XAxis
              name={x}
              disableParticleSizeTypes={filterDisableParticleSizeTypes(xaxes.controlId, disableParticleSizeTypes)}
              currentReport={currentReport}
              onChangeCurrentReport={changeCurrentReport}
              allControls={worksheetInfo.columns}
              axisControls={axisControls}
              addXaxes={this.props.addXaxes}
              removeXaxes={this.props.removeXaxes}
            />
          )
        }
        <YAxis
          name={isDualAxes ? _l('数值(Y轴)') : y}
          split={currentReport.split}
          yaxisList={currentReport.yaxisList}
          currentReport={currentReport}
          axisControls={axisControls.concat(formulas)}
          allControls={worksheetInfo.columns}
          onChangeCurrentReport={this.props.changeYaxisList}
          onRemoveAxis={this.props.removeYaxisList}
          onAddAxis={this.props.addYaxisList}
        />
        {
          isDualAxes && (
            <YAxis
              name={_l('数值(辅助Y轴)')}
              split={rightY.split}
              yaxisList={rightY.yaxisList}
              currentReport={currentReport}
              axisControls={axisControls.concat(formulas)}
              allControls={worksheetInfo.columns}
              onChangeCurrentReport={this.props.changeRightYaxisList}
              onRemoveAxis={this.props.removeRightYaxisList}
              onAddAxis={this.props.addRightYaxisList}
            />
          )
        }
        {
          [reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes, reportTypes.RadarChart].includes(reportType) && (
            <GroupingAxis
              name={isDualAxes ? _l('分组(Y轴)') : _l('分组')}
              split={currentReport.split}
              yaxisList={currentReport.yaxisList}
              disableParticleSizeTypes={disableParticleSizeTypes}
              axisControls={axisControls}
              allControls={worksheetInfo.columns}
              onChangeCurrentReport={this.props.changeSplit}
            />
          )
        }
        {
          isDualAxes && (
            <GroupingAxis
              name={_l('分组(辅助Y轴)')}
              split={currentReport.rightY.split}
              yaxisList={currentReport.rightY.yaxisList}
              disableParticleSizeTypes={disableParticleSizeTypes}
              axisControls={axisControls}
              allControls={worksheetInfo.columns}
              onChangeCurrentReport={this.props.changeRightSplit}
            />
          )
        }
        {
          (reportType === reportTypes.CountryLayer && currentReport.xaxes.controlId) && (
            <AreaScope
              xaxes={currentReport.xaxes}
              country={currentReport.country}
              style={currentReport.style || {}}
              controls={axisControls}
              onChangeCurrentReport={changeCurrentReport}
            />
          )
        }
      </Fragment>
    );
  }
  render() {
    const { currentReport, axisControls, projectId, worksheetInfo, filterItem } = this.props;
    const { reportType, displaySetup } = currentReport;
    const { x, y } = getAxisText(reportType, displaySetup ? displaySetup.showChartType : null);
    const isPivotTable = reportType === reportTypes.PivotTable;
    return (
      <div className="chartSetting">
        {
          isPivotTable ? (
            this.renderPivotTableAxis(x, y)
          ) : (
            this.renderChartAxis(x, y)
          )
        }
        {(chartType[reportType] && displaySetup) && this.renderChartType()}
        <Filter
          projectId={projectId}
          filterItem={filterItem}
          axisControls={axisControls}
          worksheetInfo={worksheetInfo}
          onChangeFilterItem={this.handleChangeFilterItem}
        />
      </div>
    );
  }
}
