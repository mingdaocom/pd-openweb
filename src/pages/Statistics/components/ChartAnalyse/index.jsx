import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Collapse, Checkbox, Switch } from 'antd';
import OriginalData from './components/OriginalData';
import DataContrast from './components/DataContrast';
import PeriodTarget from './components/PeriodTarget';
import AuxiliaryLine from './components/AuxiliaryLine';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'statistics/redux/actions';
import { isTimeControl, formatContrastTypes } from 'statistics/common';
import { reportTypes } from 'statistics/Charts/common';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'worksheetInfo', 'reportData'])
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
  renderOriginalData() {
    const { worksheetInfo, currentReport } = this.props;
    const { displaySetup, filter, style } = currentReport;
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
  renderDataContrast(xAxisisTime) {
    const { currentReport, reportData } = this.props;
    const { reportType, displaySetup, filter } = currentReport;
    const { rangeType } = filter || {};
    const isNumberChart = reportType === reportTypes.NumberChart;
    const mapKeys = Object.keys(reportData.map || []);
    const contrastVisible = ((mapKeys.length < 2 && xAxisisTime) || [reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType));
    const contrastColorVisible = reportTypes.NumberChart === reportType && displaySetup.contrastType !== 0;

    if (!contrastVisible && !contrastColorVisible) {
      return null;
    }

    return (
      <Collapse.Panel
        header={_l('数据对比')}
        key="dataContrast"
        className={cx({ collapsible: isNumberChart ? !displaySetup.contrastType : false })}
        extra={(
          isNumberChart ? (
            <Switch
              size="small"
              checked={displaySetup.contrastType}
              disabled={!rangeType}
              onClick={(checked, event) => {
                event.stopPropagation();
              }}
              onChange={checked => {
                const list = formatContrastTypes(filter);
                const first = list[1];
                this.handleChangeDisplaySetup({
                  ...displaySetup,
                  contrastType: checked ? first.value : 0
                }, true);
              }}
            />
          ) : null
        )}
      >
        <DataContrast
          contrastVisible={contrastVisible}
          contrastColorVisible={contrastColorVisible}
          currentReport={currentReport}
          onUpdateDisplaySetup={this.handleChangeDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
        />
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
    const { currentReport } = this.props;
    const { reportType, xaxes } = currentReport;
    const xAxisisTime = isTimeControl(xaxes.controlType);
    return (
      <div className="chartAdvanced">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost>
          {((reportType === reportTypes.LineChart && xAxisisTime) ||
            [reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType)) &&
            this.renderDataContrast(xAxisisTime)}
          {reportType === reportTypes.LineChart && this.renderPeriodTarget()}
          {this.renderOriginalData()}
          {[reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes].includes(reportType) && this.renderAuxiliaryLine()}
        </Collapse>
      </div>
    );
  }
}
