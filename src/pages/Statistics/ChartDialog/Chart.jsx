import React, { Component, Fragment, createRef } from 'react';
import cx from 'classnames';
import { reportTypes } from '../Charts/common';
import { WithoutData } from '../components/ChartStatus';
import { Loading, Abnormal } from '../components/ChartStatus';
import { LoadDiv } from 'ming-ui';
import { isOptionControl } from 'statistics/common';
import DragMask from 'worksheet/common/DragMask';
import styled from 'styled-components';
import charts from '../Charts';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions.js';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

const isMobile = browserIsMobile();

const VerticalDrag = styled.div(
  ({ value }) => `
  position: absolute;
  z-index: 2;
  top: ${value}px;
  width: 100%;
  height: 2px;
  cursor: ns-resize;
  background-color: #ccc;
  &:hover {
    background-color: #ddd;
  }
`,
);

const HorizontalDrag = styled.div(
  ({ value }) => `
  position: absolute;
  z-index: 2;
  left: ${value}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  background-color: #ccc;
  &:hover {
    background-color: #ddd;
  }
`,
);

@connect(
  state => ({
    ..._.pick(state.statistics, ['loading', 'currentReport', 'worksheetInfo', 'reportData', 'base', 'direction']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      min: 0,
      max: 0,
      dragValue: 0,
      sheetSize: 0,
      dragMaskVisible: false,
      Component: null
    };
    this.$chartRef = createRef(null);
  }
  componentDidMount() {
    this.changeDragValue(this.props.direction);
    import('./Sheet').then(component => {
      this.setState({
        Component: component.default
      });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.scopeVisible !== this.props.scopeVisible || nextProps.direction !== this.props.direction) {
      setTimeout(() => {
        this.changeDragValue(nextProps.direction);
      }, 0);
    }
  }
  changeDragValue(direction) {
    const { offsetHeight, offsetWidth } = this.$chartRef.current || {};
    const value = direction === 'vertical' ? offsetHeight : offsetWidth;
    const storeSheetSize = Number(localStorage.getItem(`${direction}ChartSheetSheetSize`) || 0);
    this.setState({
      dragValue: storeSheetSize ? value - storeSheetSize : value / 2,
      sheetSize: storeSheetSize ? storeSheetSize : value / 2,
      min: (20 / 100) * value,
      max: (80 / 100) * value,
    });
  }
  renderChart() {
    const { projectId, themeColor, customPageConfig, reportData, currentReport, base, direction, getReportSingleCacheId, requestOriginalData, changeCurrentReport } = this.props;
    const { settingVisible, report = {}, sourceType } = base;
    const reportId = report.id;
    const { xaxes = {}, reportType, valueMap, yvalueMap } = reportData;
    const Chart = charts[reportType];
    const isPublicShareChart = location.href.includes('public/chart');
    const isPublicSharePage = window.shareAuthor || _.get(window, 'shareState.shareId');

    const props = {
      projectId,
      sourceType,
      isViewOriginalData: !settingVisible && !isMobile && !isPublicShareChart && !isPublicSharePage,
      requestOriginalData,
      direction,
      themeColor,
      customPageConfig
    };
    const isDisplayEmptyData = [reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes, reportTypes.RadarChart, reportTypes.PieChart, reportTypes.BidirectionalBarChart].includes(reportType) && isOptionControl(xaxes.controlType);

    if ([reportTypes.PivotTable].includes(reportType)) {
      const { data, columns, ylist, lines } = reportData;
      return _.isEmpty(data.data) ? (
        <WithoutData />
      ) : (
        <Chart
          {...props}
          settingVisible={settingVisible}
          onChangeCurrentReport={changeCurrentReport}
          reportData={{
            ...currentReport,
            reportId,
            data,
            columns,
            ylist,
            lines: currentReport.pivotTable ? _.merge(lines, currentReport.pivotTable.lines) : lines,
            valueMap,
            yvalueMap
          }}
        />
      );
    }
    if (reportTypes.CountryLayer === reportType) {
      const { map, country, summary } = reportData;
      return map.length ? (
        <Chart
          {...props}
          reportData={{
            ...currentReport,
            map,
            country,
            summary: settingVisible ? currentReport.summary : summary,
          }}
        />
      ) : (
        <WithoutData />
      );
    }
    if ([reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType)) {
      const { map } = reportData;
      return (
        <Chart
          {...props}
          reportData={{
            ...currentReport,
            map,
          }}
        />
      );
    }
    if (
      [
        reportTypes.BarChart,
        reportTypes.LineChart,
        reportTypes.RadarChart,
        reportTypes.FunnelChart,
        reportTypes.DualAxes,
        reportTypes.BidirectionalBarChart,
        reportTypes.ScatterChart,
        reportTypes.WordCloudChart,
        reportTypes.TopChart,
      ].includes(reportType)
    ) {
      const { map, contrastMap, summary, rightY = {} } = reportData;
      return map.length || contrastMap.length || isDisplayEmptyData ? (
        <Chart
          {...props}
          reportData={{
            ...currentReport,
            map,
            contrastMap,
            valueMap,
            summary: settingVisible ? currentReport.summary : summary,
            rightY: settingVisible ? currentReport.rightY : rightY,
            reportId,
          }}
        />
      ) : (
        <WithoutData />
      );
    }
    if ([reportTypes.PieChart].includes(reportType)) {
      const { map, summary } = reportData;
      return map.length || isDisplayEmptyData ? (
        <Chart
          {...props}
          reportData={{
            ...currentReport,
            map,
            summary: settingVisible ? currentReport.summary : summary,
            reportId,
          }}
        />
      ) : (
        <WithoutData />
      );
    }
    if ([reportTypes.NumberChart].includes(reportType)) {
      const { map, contrast, contrastMap } = reportData;
      const params = {
        ...currentReport,
        map,
        contrast,
        contrastMap
      };
      return <Chart {...props} reportData={params} />;
    }
  }
  render() {
    const {
      loading,
      base,
      isCharge,
      sheetVisible,
      settingVisible,
      worksheetInfo,
      reportData,
      currentReport,
      onChangeSheetVisible,
      renderHeaderDisplaySetup,
    } = this.props;
    const { createdBy = {}, lastModifiedBy = {} } = reportData;
    const viewId = _.get(currentReport, ['filter', 'viewId']);
    const view = _.find(worksheetInfo.views, { viewId });
    const { direction, scopeVisible } = this.props;
    const { dragMaskVisible, min, max, sheetSize, Component } = this.state;
    const dragValue = this.state.dragValue - (scopeVisible && direction === 'horizontal' ? 320 : 0);
    const { sourceType, permissions, report } = base;
    const idVisible = sourceType === 1 ? isCharge : permissions;

    return (
      <div
        className={cx('chartBody Relative flex', {
          flexColumn: direction === 'vertical',
          flexRow: direction === 'horizontal',
        })}
        ref={this.$chartRef}
      >
        <div className={cx('chart flexColumn', direction)}>
          {reportData.status > 0 ? renderHeaderDisplaySetup() : null}
          {loading ? (
            <Loading />
          ) : reportData.status > 0 ? (
            <Fragment>
              {this.renderChart()}
              {idVisible && !_.get(window, 'shareState.shareId') && (
                <div className="flexRow mTop10 Gray_9e Font13 userInfo">
                  <span className="mRight25">{_l('创建人')}: {createdBy.fullName}</span>
                  <span className="mRight25">{_l('最后修改人')}: {lastModifiedBy.fullName}</span>
                  {report.id && <span>{_l('图表ID')}: {report.id}</span>}
                </div>
              )}
            </Fragment>
          ) : (
            <Abnormal isEdit={settingVisible ? !(viewId && _.isEmpty(view)) : false} status={reportData.status} />
          )}
        </div>
        {sheetVisible && (
          <Fragment>
            {dragMaskVisible && (
              <DragMask
                direction={direction}
                value={dragValue}
                min={min}
                max={max}
                onChange={value => {
                  const { offsetHeight, offsetWidth } = this.$chartRef.current;
                  const sheetSize = (direction === 'vertical' ? offsetHeight : offsetWidth) - value;
                  const dragValue = value + (scopeVisible ? 320 : 0);
                  this.setState({
                    dragMaskVisible: false,
                    dragValue,
                    sheetSize,
                  }, () => {
                    const { style } = reportData;
                    if (
                      direction === 'vertical' &&
                      reportData.reportType === reportTypes.PivotTable &&
                      (style.pivotTableColumnFreeze || style.pivotTableLineFreeze) &&
                      style.paginationVisible
                    ) {
                      this.props.getReportData();
                    }
                  });
                  safeLocalStorageSetItem(`${direction}ChartSheetSheetSize`, sheetSize);
                }}
              />
            )}
            {Component ? (
              <Component
                direction={direction}
                settingVisible={settingVisible}
                isSmall={direction === 'horizontal' ? sheetSize < 540 : false}
                style={{
                  height: direction === 'vertical' ? sheetSize : '100%',
                  width: direction === 'horizontal' ? sheetSize : '100%',
                }}
                onClose={() => {
                  onChangeSheetVisible(false);
                }}
              />
            ) : (
              <LoadDiv />
            )}
            {direction === 'vertical' && (
              <VerticalDrag value={dragValue} onMouseDown={() => this.setState({ dragMaskVisible: true })} />
            )}
            {direction === 'horizontal' && (
              <HorizontalDrag value={dragValue} onMouseDown={() => this.setState({ dragMaskVisible: true })} />
            )}
          </Fragment>
        )}
      </div>
    );
  }
}
