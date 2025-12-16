import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import * as actions from 'statistics/redux/actions';
import { reportTypes } from '../../Charts/common';
import {
  chartType,
  filterDisableParticleSizeTypes,
  funnelCurvatureList,
  funnelShapeList,
  getAxisText,
} from '../../common';
import Accumulate from './components/Accumulate';
import AreaScope from './components/AreaScope';
import Filter from './components/Filter';
import GroupingAxis from './components/GroupingAxis';
import PivotTableAxis from './components/PivotTableAxis';
import ValueAxis from './components/ValueAxis';
import WithoutFidldItem from './components/WithoutFidldItem';
import XAxis from './components/XAxis';
import YAxis from './components/YAxis';
import './index.less';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'reportData', 'axisControls', 'worksheetInfo', 'filterItem']),
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
        },
      },
      true,
    );
  };
  renderChartType() {
    const { reportType, displaySetup } = this.props.currentReport;
    const isFunnelChart = reportType == reportTypes.FunnelChart;
    const handleClick = item => {
      if (displaySetup.showChartType !== item.value) {
        this.props.changeCurrentReport({
          displaySetup: {
            ...displaySetup,
            showChartType: item.value,
            isPerPile: [reportTypes.LineChart].includes(reportType) ? false : displaySetup.isPerPile,
          },
        });
      }
    };
    return (
      <div className={isFunnelChart ? 'mBottom15' : 'mBottom20'}>
        {isFunnelChart && <div className="mBottom15 Bold Font13">{_l('图形')}</div>}
        <div className={cx('mBottom10 Font13', isFunnelChart ? 'mBottom8' : 'mBottom10', { Bold: !isFunnelChart })}>
          {chartType[reportType].title}
        </div>
        {[reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType) ? (
          <div className="chartTypeImageSelect flexRow valignWrapper mBottom16">
            {chartType[reportType].items.map(item => (
              <div
                key={item.value}
                className={cx('flex styleItem centerAlign pointer Gray_75', {
                  active: displaySetup.showChartType == item.value,
                })}
                onClick={() => handleClick(item)}
              >
                <div className="iconWrap">
                  <img src={displaySetup.showChartType == item.value ? item.activeIcon : item.icon} />
                </div>
                {item.name}
              </div>
            ))}
          </div>
        ) : (
          <div className="chartTypeSelect flexRow valignWrapper">
            {chartType[reportType].items.map(item => (
              <div
                key={item.value}
                className={cx('flex centerAlign pointer Gray_75', { active: displaySetup.showChartType == item.value })}
                onClick={() => handleClick(item)}
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  renderShape() {
    const { style } = this.props.currentReport;
    return (
      <div className="mBottom15">
        <div className="mBottom8 Font13">{_l('形状')}</div>
        <div className="chartTypeSelect flexRow valignWrapper">
          {funnelShapeList.map(item => (
            <div
              key={item.value}
              className={cx('flex centerAlign pointer Gray_75', {
                active: (style.funnelShape || 'funnel') == item.value,
              })}
              onClick={() => {
                this.props.changeCurrentReport({
                  style: {
                    ...style,
                    funnelShape: item.value,
                  },
                });
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderCurvature() {
    const { style } = this.props.currentReport;
    return (
      <div className="mBottom15">
        <div className="mBottom8 Font13">{_l('曲率')}</div>
        <div className="chartTypeSelect flexRow valignWrapper">
          {funnelCurvatureList.map(item => (
            <div
              key={item.value}
              className={cx('flex centerAlign pointer Gray_75', { active: (style.funnelCurvature || 2) == item.value })}
              onClick={() => {
                this.props.changeCurrentReport({
                  style: {
                    ...style,
                    funnelCurvature: item.value,
                  },
                });
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderAccumulate() {
    const { reportData, currentReport, worksheetInfo, changeCurrentReport } = this.props;
    return (
      <Accumulate
        reportData={reportData}
        allControls={worksheetInfo.columns}
        currentReport={currentReport}
        changeCurrentReport={changeCurrentReport}
      />
    );
  }
  renderPivotTableAxis(x, y) {
    const { currentReport, axisControls, worksheetInfo, changeCurrentReport } = this.props;
    const { lines = [], columns = [] } = currentReport.pivotTable || {};
    const disableParticleSizeTypes = [...lines, ...columns]
      .filter(item => item.particleSizeType)
      .map(item => `${item.controlId}-${item.particleSizeType}`);
    return (
      <Fragment>
        <PivotTableAxis
          name={x}
          type="lines"
          axisControls={axisControls}
          allControls={worksheetInfo.columns}
          list={lines}
          axisList={[...lines, ...columns]}
          disableParticleSizeTypes={disableParticleSizeTypes}
          onUpdateList={(lines, id) => {
            changeCurrentReport(
              {
                pivotTable: {
                  ...currentReport.pivotTable,
                  lines,
                },
                sorts: currentReport.sorts.filter(item => _.findKey(item) !== id),
              },
              true,
            );
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
          axisList={[...lines, ...columns]}
          disableParticleSizeTypes={disableParticleSizeTypes}
          onUpdateList={(columns, id) => {
            changeCurrentReport(
              {
                pivotTable: {
                  ...currentReport.pivotTable,
                  columns,
                },
                sorts: currentReport.sorts.filter(item => _.findKey(item) !== id),
              },
              true,
            );
          }}
          onAdd={this.props.addColumns}
          onRemove={this.props.removeColumns}
        />
        <PivotTableAxis
          name={_l('值')}
          verifyNumber={true}
          disableParticleSizeTypes={[]}
          axisControls={axisControls.concat(currentReport.formulas)}
          allControls={worksheetInfo.columns}
          list={currentReport.yaxisList}
          onUpdateList={(yaxisList, id) => {
            changeCurrentReport(
              {
                yaxisList,
                sorts: currentReport.sorts.filter(item => _.findKey(item) !== id),
              },
              true,
            );
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
    const { reportType, xaxes = {}, yaxisList, split = {}, rightY, formulas = [] } = currentReport;
    const isMultiaxis = [reportTypes.DualAxes, reportTypes.BidirectionalBarChart].includes(reportType);
    const isDualAxes = reportTypes.DualAxes === reportType;
    const xAxisVisible = reportType && ![reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType);
    const disableParticleSizeTypes = [xaxes, split, rightY ? rightY.split : {}]
      .filter(item => item.particleSizeType)
      .map(item => `${item.controlId}-${item.particleSizeType}`);

    const renderYAxis = () => {
      if (reportTypes.ScatterChart === reportType) {
        return (
          <Fragment>
            <YAxis
              name={_l('X轴(数值)')}
              yaxisList={_.isEmpty(yaxisList[0]) ? [] : [yaxisList[0]]}
              currentReport={currentReport}
              axisControls={axisControls.concat(formulas)}
              allControls={worksheetInfo.columns}
              onChangeCurrentReport={data => {
                yaxisList[0] = data.yaxisList[0];
                this.props.changeYaxisList({
                  ...data,
                  yaxisList,
                });
              }}
              onRemoveAxis={() => {
                yaxisList[0] = {};
                this.props.changeYaxisList({
                  yaxisList,
                });
              }}
              onAddAxis={data => {
                this.props.addIndexYaxisList(data, 0);
              }}
            />
            <YAxis
              name={_l('Y轴(数值)')}
              yaxisList={_.isEmpty(yaxisList[1]) ? [] : [yaxisList[1]]}
              currentReport={currentReport}
              axisControls={axisControls.concat(formulas)}
              allControls={worksheetInfo.columns}
              onChangeCurrentReport={data => {
                yaxisList[1] = data.yaxisList[0];
                this.props.changeYaxisList({
                  ...data,
                  yaxisList,
                });
              }}
              onRemoveAxis={() => {
                yaxisList[1] = {};
                this.props.changeYaxisList({
                  yaxisList,
                });
              }}
              onAddAxis={data => {
                this.props.addIndexYaxisList(data, 1);
              }}
            />
            <YAxis
              name={_l('点大小')}
              yaxisList={_.isEmpty(yaxisList[2]) ? [] : [yaxisList[2]]}
              currentReport={currentReport}
              axisControls={axisControls.concat(formulas)}
              allControls={worksheetInfo.columns}
              onChangeCurrentReport={data => {
                yaxisList[2] = data.yaxisList[0];
                this.props.changeYaxisList({
                  ...data,
                  yaxisList,
                });
              }}
              onRemoveAxis={() => {
                yaxisList[2] = null;
                this.props.changeYaxisList({
                  yaxisList: yaxisList.filter(_ => _),
                });
              }}
              onAddAxis={data => {
                this.props.addIndexYaxisList(data, 2);
              }}
            />
          </Fragment>
        );
      }
      if (reportTypes.WorldMap === reportType) {
        return (
          <Fragment>
            <YAxis
              name={y}
              yaxisList={_.isEmpty(yaxisList[0]) ? [] : [yaxisList[0]]}
              currentReport={currentReport}
              axisControls={axisControls.concat(formulas)}
              allControls={worksheetInfo.columns}
              onChangeCurrentReport={data => {
                yaxisList[0] = data.yaxisList[0];
                this.props.changeYaxisList({
                  ...data,
                  yaxisList,
                });
              }}
              onRemoveAxis={() => {
                yaxisList[0] = {};
                this.props.changeYaxisList({
                  yaxisList,
                });
              }}
              onAddAxis={data => {
                this.props.addIndexYaxisList(data, 0);
              }}
            />
            <YAxis
              name={_l('点大小')}
              yaxisList={_.isEmpty(yaxisList[1]) ? [] : [yaxisList[1]]}
              currentReport={currentReport}
              axisControls={axisControls.concat(formulas)}
              allControls={worksheetInfo.columns}
              onChangeCurrentReport={data => {
                yaxisList[1] = data.yaxisList[0];
                this.props.changeYaxisList({
                  ...data,
                  yaxisList,
                });
              }}
              onRemoveAxis={() => {
                yaxisList[1] = null;
                this.props.changeYaxisList({
                  yaxisList: yaxisList.filter(_ => _),
                });
              }}
              onAddAxis={data => {
                this.props.addIndexYaxisList(data, 1);
              }}
            />
          </Fragment>
        );
      }
      return (
        <YAxis
          name={y}
          split={split}
          yaxisList={yaxisList}
          currentReport={currentReport}
          axisControls={axisControls.concat(formulas)}
          allControls={worksheetInfo.columns}
          onChangeCurrentReport={this.props.changeYaxisList}
          onRemoveAxis={this.props.removeYaxisList}
          onAddAxis={this.props.addYaxisList}
        />
      );
    };

    return (
      <Fragment>
        {xAxisVisible && (
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
        )}
        {renderYAxis()}
        {isMultiaxis && (
          <YAxis
            name={isDualAxes ? _l('辅助Y轴(数值)') : _l('方向2(数值)')}
            split={rightY.split}
            yaxisList={rightY.yaxisList}
            currentReport={currentReport}
            axisControls={axisControls.concat(formulas)}
            allControls={worksheetInfo.columns}
            onChangeCurrentReport={this.props.changeRightYaxisList}
            onRemoveAxis={this.props.removeRightYaxisList}
            onAddAxis={this.props.addRightYaxisList}
          />
        )}
        {[
          reportTypes.BarChart,
          reportTypes.LineChart,
          reportTypes.DualAxes,
          reportTypes.RadarChart,
          reportTypes.ScatterChart,
          reportTypes.WorldMap,
        ].includes(reportType) && (
          <GroupingAxis
            reportType={reportType}
            split={currentReport.split}
            xaxes={currentReport.xaxes}
            yaxisList={currentReport.yaxisList}
            disableParticleSizeTypes={disableParticleSizeTypes}
            axisControls={axisControls}
            allControls={worksheetInfo.columns}
            onChangeCurrentReport={this.props.changeSplit}
          />
        )}
        {isDualAxes && (
          <GroupingAxis
            name={isDualAxes ? _l('分组(辅助Y轴)') : _l('分组(数值2)')}
            split={currentReport.rightY.split}
            xaxes={currentReport.xaxes}
            yaxisList={currentReport.rightY.yaxisList}
            disableParticleSizeTypes={disableParticleSizeTypes}
            axisControls={axisControls}
            allControls={worksheetInfo.columns}
            onChangeCurrentReport={this.props.changeRightSplit}
          />
        )}
        {reportType === reportTypes.CountryLayer && currentReport.xaxes.controlId && (
          <AreaScope
            xaxes={currentReport.xaxes}
            country={currentReport.country}
            style={currentReport.style || {}}
            controls={axisControls}
            onChangeCurrentReport={changeCurrentReport}
          />
        )}
      </Fragment>
    );
  }
  renderChartValueAxis() {
    const { currentReport, axisControls, worksheetInfo, changeCurrentReport } = this.props;
    const { config, formulas = [] } = currentReport;
    return (
      <Fragment>
        <ValueAxis
          name={_l('最小值')}
          valueAxis={config.min || {}}
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
          allControls={worksheetInfo.columns}
          axisControls={axisControls.concat(formulas)}
          addValueAxis={data => {
            this.props.addValueAxis('min', data);
          }}
          changeValueAxis={(data, isRequest) => {
            this.props.changeConfig(
              {
                min: {
                  ...config.min,
                  ...data,
                },
              },
              isRequest,
            );
          }}
          removeValueAxis={() => {
            this.props.changeConfig({
              min: null,
            });
          }}
        />
        <ValueAxis
          name={_l('最大值')}
          valueAxis={config.max || {}}
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
          allControls={worksheetInfo.columns}
          axisControls={axisControls.concat(formulas)}
          addValueAxis={data => {
            this.props.addValueAxis('max', data);
          }}
          changeValueAxis={(data, isRequest) => {
            this.props.changeConfig(
              {
                max: {
                  ...config.max,
                  ...data,
                },
              },
              isRequest,
            );
          }}
          removeValueAxis={() => {
            this.props.changeConfig({
              max: null,
            });
          }}
        />
      </Fragment>
    );
  }
  renderTargetValueAxis() {
    const { currentReport, axisControls, worksheetInfo, changeCurrentReport } = this.props;
    const { yaxisList, config = {}, formulas = [] } = currentReport;
    const targetList = config.targetList || [];
    return (
      <div className="fieldWrapper targetValueAxis mBottom20">
        <div className="Bold mBottom12">{_l('目标值')}</div>
        {!yaxisList.length && (
          <Fragment>
            <div className="mBottom12 Gray_75">{_l('请先配置数值')}</div>
            <WithoutFidldItem disable={true} allowInput={true} />
          </Fragment>
        )}
        {yaxisList.map((data, index) => (
          <ValueAxis
            key={data.controlId}
            name={data.controlName}
            valueAxis={targetList[index] || {}}
            currentReport={currentReport}
            onChangeCurrentReport={changeCurrentReport}
            allControls={worksheetInfo.columns}
            axisControls={axisControls.concat(formulas)}
            addValueAxis={data => {
              this.props.addTargetValueAxis(index, data);
            }}
            changeValueAxis={(data, isRequest) => {
              const current = targetList[index] || {};
              targetList[index] = {
                ...current,
                ...data,
              };
              this.props.changeConfig({ targetList }, isRequest);
            }}
            removeValueAxis={() => {
              this.props.removeTargetValueAxis(index);
            }}
          />
        ))}
      </div>
    );
  }
  render() {
    const { currentReport, axisControls, projectId, worksheetInfo, filterItem, sourceType } = this.props;
    const { reportType, displaySetup, filter } = currentReport;
    const { x, y } = getAxisText(reportType, displaySetup ? displaySetup.showChartType : null);
    const isPivotTable = reportType === reportTypes.PivotTable;
    return (
      <div className="chartSetting">
        {isPivotTable ? this.renderPivotTableAxis(x, y) : this.renderChartAxis(x, y)}
        {[reportTypes.GaugeChart].includes(reportType) && this.renderChartValueAxis()}
        {[reportTypes.ProgressChart].includes(reportType) && this.renderTargetValueAxis()}
        {chartType[reportType] && displaySetup && this.renderChartType()}
        {reportType === reportTypes.FunnelChart && this.renderShape()}
        {reportType === reportTypes.FunnelChart && this.renderCurvature()}
        {reportType === reportTypes.FunnelChart && this.renderAccumulate()}
        <Filter
          filterResigned={false}
          filter={filter}
          projectId={projectId}
          filterItem={filterItem}
          sourceType={sourceType}
          axisControls={axisControls}
          worksheetInfo={worksheetInfo}
          onChangeFilterItem={this.handleChangeFilterItem}
        />
      </div>
    );
  }
}
