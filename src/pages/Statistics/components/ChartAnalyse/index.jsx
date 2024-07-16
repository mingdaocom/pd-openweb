import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Collapse, Switch } from 'antd';
import OriginalData from './components/OriginalData';
import DataContrast from './components/DataContrast';
import PeriodTarget from './components/PeriodTarget';
import AuxiliaryLine from './components/AuxiliaryLine';
import AutoLinkage from './components/AutoLinkage';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'statistics/redux/actions';
import { isTimeControl } from 'statistics/common';
import { reportTypes } from 'statistics/Charts/common';
import { ContrastValue, defaultNumberChartStyle } from 'statistics/components/ChartStyle/components/NumberStyle';
import _ from 'lodash';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'worksheetInfo', 'reportData', 'base']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ChartAnalyse extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeDisplaySetup = (data, isRequest = false) => {
    const { displaySetup } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        displaySetup: {
          ...displaySetup,
          ...data
        }
      },
      isRequest
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
  renderAutoLinkage() {
    const { reportId, worksheetInfo, currentReport } = this.props;
    return (
      <Collapse.Panel
        key="autoLinkage"
        header={_l('联动筛选')}
      >
        <AutoLinkage
          reportId={reportId}
          worksheetInfo={worksheetInfo}
          currentReport={currentReport}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderOriginalData() {
    const { worksheetInfo, currentReport, base } = this.props;
    const { displaySetup, filter, style } = currentReport;

    if (base.appType === 2) {
      return null;
    }

    return (
      <Collapse.Panel
        key="originalData"
        header={_l('查看原始数据')}
        className={cx({ collapsible: !displaySetup.showRowList })}
        extra={(
          <Switch
            size="small"
            checked={displaySetup.showRowList}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplaySetup({
                showRowList: checked
              });
            }}
          />
        )}
      >
        <OriginalData
          worksheetInfo={worksheetInfo}
          displaySetup={displaySetup}
          viewId={filter.viewId}
          style={style || {}}
          onChangeDisplaySetup={this.handleChangeDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderAuxiliaryLine() {
    const { currentReport } = this.props;
    return (
      <Collapse.Panel
        key="auxiliaryLine"
        header={_l('辅助线')}
      >
        <AuxiliaryLine
          currentReport={currentReport}
          onChangeDisplaySetup={this.handleChangeDisplaySetup}
        />
      </Collapse.Panel>
    );
  }
  renderDataContrast() {
    const { currentReport, reportData, base } = this.props;
    const { reportType, displaySetup, filter, style } = currentReport;
    const { rangeType } = filter || {};
    const isNumberChart = reportType === reportTypes.NumberChart;
    const mapKeys = Object.keys(reportData.map || []);
    // const xAxisisTime = isTimeControl(xaxes.controlType);
    // const contrastVisible = ((mapKeys.length < 2 && xAxisisTime) || [reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType));
    const contrastVisible = mapKeys.length < 2 || [reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType);
    const switchChecked = displaySetup.contrastType || displaySetup.contrast;
    const { numberChartStyle = defaultNumberChartStyle } = style;

    if (!contrastVisible || base.appType === 2) {
      return null;
    }

    return (
      <Collapse.Panel
        header={_l('数据对比')}
        key="dataContrast"
        className={cx({ collapsible: isNumberChart ? !switchChecked : false })}
        extra={(
          isNumberChart ? (
            <Switch
              size="small"
              checked={switchChecked}
              disabled={!rangeType}
              onClick={(checked, event) => {
                event.stopPropagation();
              }}
              onChange={checked => {
                this.handleChangeDisplaySetup({
                  ...displaySetup,
                  contrastType: checked ? 2 : 0,
                  contrast: checked ? true : false
                }, true);
              }}
            />
          ) : null
        )}
      >
        <DataContrast
          isNumberChart={isNumberChart}
          contrastVisible={contrastVisible}
          currentReport={currentReport}
          onUpdateDisplaySetup={this.handleChangeDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
          onChangeCurrentReport={this.props.changeCurrentReport}
        />
        {isNumberChart && (
          <ContrastValue
            numberChartStyle={numberChartStyle}
            onChangeNumberStyle={(data) => {
              this.handleChangeStyle({
                numberChartStyle: {
                  ...numberChartStyle,
                  ...data
                }
              });
            }}
          />
        )}
      </Collapse.Panel>
    );
  }
  renderPeriodTarget() {
    const { currentReport } = this.props;
    const { displaySetup } = currentReport;

    if (!displaySetup.lifecycleValue) {
      return null;
    }

    return (
      <Collapse.Panel
        key="periodTarget"
        header={_l('周期目标')}
      >
        <PeriodTarget
          currentReport={currentReport}
          onUpdateDisplaySetup={this.handleChangeDisplaySetup}
        />
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
    const { sourceType, currentReport } = this.props;
    const { reportType, xaxes } = currentReport;
    return (
      <div className="chartAdvanced">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost>
          {sourceType === 1 && this.renderAutoLinkage()}
          {[reportTypes.LineChart, reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType) &&
            this.renderDataContrast()}
          {reportType === reportTypes.LineChart && this.renderPeriodTarget()}
          {this.renderOriginalData()}
          {[reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes].includes(reportType) && this.renderAuxiliaryLine()}
        </Collapse>
      </div>
    );
  }
}
