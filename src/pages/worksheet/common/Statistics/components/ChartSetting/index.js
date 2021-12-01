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
import './index.less';

export default class ChartSetting extends Component {
  constructor(props) {
    super(props);
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
                    this.props.onUpdateDisplaySetup({
                      ...displaySetup,
                      showChartType: item.value,
                      isPerPile: [reportTypes.LineChart].includes(reportType) ? false : displaySetup.isPerPile,
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
    const { currentReport, axisControls, onChangeCurrentReport } = this.props;
    const { lines, columns } = currentReport.pivotTable;
    const disableParticleSizeTypes = [...lines, ...columns].filter(item => item.particleSizeType).map(item => `${item.controlId}-${item.particleSizeType}`);
    return (
      <Fragment>
        <PivotTableAxis
          name={x}
          axisControls={axisControls}
          list={lines}
          disableParticleSizeTypes={disableParticleSizeTypes}
          onUpdateList={(lines, id) => {
            onChangeCurrentReport({
              pivotTable: {
                ...currentReport.pivotTable,
                lines,
              },
              sorts: currentReport.sorts.filter(item => _.findKey(item) !== id)
            }, true);
          }}
        />
        <PivotTableAxis
          name={y}
          axisControls={axisControls}
          list={columns}
          disableParticleSizeTypes={disableParticleSizeTypes}
          onUpdateList={(columns, id) => {
            onChangeCurrentReport({
              pivotTable: {
                ...currentReport.pivotTable,
                columns,
              },
              sorts: currentReport.sorts.filter(item => _.findKey(item) !== id)
            }, true);
          }}
        />
        <PivotTableAxis
          name={_l('数值')}
          verifyNumber={true}
          disableParticleSizeTypes={[]}
          axisControls={axisControls.concat(currentReport.formulas)}
          list={currentReport.yaxisList}
          onUpdateList={(yaxisList, id) => {
            onChangeCurrentReport({
              yaxisList,
              sorts: currentReport.sorts.filter(item => _.findKey(item) !== id)
            }, true);
          }}
        />
      </Fragment>
    );
  }
  renderChartAxis(x, y) {
    const { currentReport, axisControls, onChangeCurrentReport } = this.props;
    const { reportType, displaySetup, xaxes, split, rightY } = currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const disableParticleSizeTypes = [xaxes, split, rightY ? rightY.split : {}].filter(item => item.particleSizeType).map(item => `${item.controlId}-${item.particleSizeType}`);
    return (
      <Fragment>
        {
          ![reportTypes.NumberChart].includes(reportType) && (
            <XAxis
              name={x}
              disableParticleSizeTypes={filterDisableParticleSizeTypes(xaxes.controlId, disableParticleSizeTypes)}
              currentReport={currentReport}
              onChangeCurrentReport={onChangeCurrentReport}
            />
          )
        }
        <YAxis
          name={isDualAxes ? _l('数值(左Y轴)') : y}
          split={currentReport.split}
          yaxisList={currentReport.yaxisList}
          currentReport={currentReport}
          onChangeCurrentReport={(data) => {
            const { yaxisList } = data;
            const title = yaxisList.length ? yaxisList[0].controlName : null;
            onChangeCurrentReport({
              ...data,
              displaySetup: {
                ...displaySetup,
                ydisplay: {
                  ...displaySetup.ydisplay,
                  title
                },
                isPerPile: yaxisList.length <= 1 ? false : displaySetup.isPerPile,
                isPile: yaxisList.length <= 1 ? false : displaySetup.isPile
              }
            }, true);
          }}
        />
        {
          isDualAxes && (
            <YAxis
              name={_l('数值(右Y轴)')}
              split={rightY.split}
              yaxisList={rightY.yaxisList}
              currentReport={currentReport}
              onChangeCurrentReport={(data) => {
                const { yaxisList } = data;
                const title = yaxisList.length ? yaxisList[0].controlName : null;
                onChangeCurrentReport({
                  rightY: {
                    ...rightY,
                    ...data,
                    display: {
                      ...rightY.display,
                      ydisplay: {
                        ...rightY.display.ydisplay,
                        title
                      }
                    }
                  }
                }, true);
              }}
            />
          )
        }
        {
          [reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes].includes(reportType) && (
            <GroupingAxis
              name={isDualAxes ? _l('分组(左Y轴)') : _l('分组')}
              split={currentReport.split}
              yaxisList={currentReport.yaxisList}
              disableParticleSizeTypes={disableParticleSizeTypes}
              axisControls={axisControls}
              onChangeCurrentReport={(data, deleteId) => {
                onChangeCurrentReport({
                  splitId: null,
                  split: data,
                  sorts: currentReport.sorts.filter(item => _.findKey(item) !== deleteId)
                }, true);
              }}
            />
          )
        }
        {
          isDualAxes && (
            <GroupingAxis
              name={_l('分组(右Y轴)')}
              split={currentReport.rightY.split}
              yaxisList={currentReport.rightY.yaxisList}
              disableParticleSizeTypes={disableParticleSizeTypes}
              axisControls={axisControls}
              onChangeCurrentReport={(data, deleteId) => {
                onChangeCurrentReport({
                  rightY: {
                    ...currentReport.rightY,
                    splitId: null,
                    split: data,
                  },
                  sorts: currentReport.sorts.filter(item => _.findKey(item) !== deleteId)
                }, true);
              }}
            />
          )
        }
        {
          (reportType === reportTypes.CountryLayer && currentReport.xaxes.controlId) && (
            <AreaScope
              xaxes={currentReport.xaxes}
              country={currentReport.country}
              controls={axisControls}
              onChangeCurrentReport={onChangeCurrentReport}
            />
          )
        }
      </Fragment>
    );
  }
  render() {
    const { currentReport, axisControls, onChangeCurrentReport, onChangeFilterItem, projectId, worksheetInfo, filterItem } = this.props;
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
          onChangeFilterItem={onChangeFilterItem}
        />
      </div>
    );
  }
}
