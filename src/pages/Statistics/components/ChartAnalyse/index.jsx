import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Collapse, Switch } from 'ming-ui/antd-components';
import { ContrastValue } from 'statistics/components/ChartStyle/components/NumberStyle';
import * as actions from 'statistics/redux/actions';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';
import { defaultNumberChartStyle } from '../.../../../enum';
import AutoLinkage from './components/AutoLinkage';
import AuxiliaryLine from './components/AuxiliaryLine';
import DataContrast from './components/DataContrast';
import OriginalData from './components/OriginalData';
import PeriodTarget from './components/PeriodTarget';

let ChartAnalyse = class ChartAnalyse extends Component {
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
  handleChangeStyle = (data, isRequest = false) => {
    const { style } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        style: { ...style, ...data },
      },
      isRequest,
    );
  };

  renderAutoLinkage() {
    const { reportId, worksheetInfo, currentReport } = this.props;
    return {
      key: 'autoLinkage',
      label: _l('联动筛选'),
      children: (
        <AutoLinkage
          reportId={reportId}
          worksheetInfo={worksheetInfo}
          currentReport={currentReport}
          onChangeStyle={this.handleChangeStyle}
        />
      ),
    };
  }

  renderOriginalData() {
    const { worksheetInfo, currentReport, base } = this.props;
    const { displaySetup, filter, style } = currentReport;
    const aggregationSheet = base.appType === 2;
    return {
      key: 'originalData',
      label: _l('查看原始数据'),
      className: cx({
        collapsible: !displaySetup.showRowList,
        hideArrowIcon: aggregationSheet,
      }),
      extra: (
        <Switch
          size="small"
          checked={displaySetup.showRowList}
          onClick={(checked, event) => {
            event.stopPropagation();
          }}
          onChange={checked => {
            this.handleChangeDisplaySetup({
              showRowList: checked,
            });
          }}
        />
      ),
      children: !aggregationSheet && (
        <OriginalData
          worksheetInfo={worksheetInfo}
          displaySetup={displaySetup}
          viewId={filter.viewId}
          style={style || {}}
          onChangeDisplaySetup={this.handleChangeDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
        />
      ),
    };
  }

  renderAuxiliaryLine() {
    const { currentReport } = this.props;
    return {
      key: 'auxiliaryLine',
      label: _l('辅助线'),
      children: <AuxiliaryLine currentReport={currentReport} onChangeDisplaySetup={this.handleChangeDisplaySetup} />,
    };
  }

  renderDataContrast() {
    const { currentReport, reportData, base } = this.props;
    const { reportType, displaySetup, filter, style } = currentReport;
    const { rangeType } = filter || {};
    const isNumberChart = reportType === reportTypes.NumberChart;
    const mapKeys = Object.keys(reportData.map || []); // const xAxisisTime = isTimeControl(xaxes.controlType);
    // const contrastVisible = ((mapKeys.length < 2 && xAxisisTime) || [reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType));

    const contrastVisible =
      mapKeys.length < 2 || [reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType);
    const switchChecked = displaySetup.contrastType || displaySetup.contrast;
    const { numberChartStyle = defaultNumberChartStyle } = style;

    if (!contrastVisible || base.appType === 2) {
      return null;
    }

    return {
      key: 'dataContrast',
      label: _l('数据对比'),
      className: cx({
        collapsible: isNumberChart ? !switchChecked : false,
      }),
      extra: isNumberChart ? (
        <Switch
          size="small"
          checked={switchChecked}
          disabled={!rangeType}
          onClick={(checked, event) => {
            event.stopPropagation();
          }}
          onChange={checked => {
            this.handleChangeDisplaySetup(
              {
                contrastType: checked ? 2 : 0,
                contrast: checked ? true : false,
              },
              true,
            );
          }}
        />
      ) : null,
      children: (
        <React.Fragment>
          <DataContrast
            isNumberChart={isNumberChart}
            contrastVisible={contrastVisible}
            currentReport={currentReport}
            onChangeDisplaySetup={this.handleChangeDisplaySetup}
            onChangeStyle={this.handleChangeStyle}
            onChangeCurrentReport={this.props.changeCurrentReport}
          />
          {isNumberChart && (
            <ContrastValue
              numberChartStyle={numberChartStyle}
              onChangeNumberStyle={data => {
                this.handleChangeStyle({
                  numberChartStyle: { ...numberChartStyle, ...data },
                });
              }}
            />
          )}
        </React.Fragment>
      ),
    };
  }

  renderPeriodTarget() {
    const { currentReport } = this.props;
    const { displaySetup } = currentReport;

    if (!displaySetup.lifecycleValue) {
      return null;
    }

    return {
      key: 'periodTarget',
      label: _l('周期目标'),
      children: <PeriodTarget currentReport={currentReport} onChangeDisplaySetup={this.handleChangeDisplaySetup} />,
    };
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
    const { sourceType, currentReport } = this.props;
    const { reportType } = currentReport;
    const items = [
      sourceType === 1 && this.renderAutoLinkage(),
      [reportTypes.LineChart, reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType) &&
        this.renderDataContrast(),
      reportType === reportTypes.LineChart && this.renderPeriodTarget(),
      this.renderOriginalData(),
      [reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes].includes(reportType) &&
        this.renderAuxiliaryLine(),
    ].filter(Boolean);

    return (
      <div className="chartAdvanced">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost items={items} />
      </div>
    );
  }
};
ChartAnalyse = connect(
  state => ({ ..._.pick(state.statistics, ['currentReport', 'worksheetInfo', 'reportData', 'base']) }),
  dispatch => bindActionCreators(actions, dispatch),
)(ChartAnalyse);
export default ChartAnalyse;
