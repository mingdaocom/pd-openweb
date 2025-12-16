import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { colorGroup, getPorjectChartColors, reportTypes } from 'statistics/Charts/common';
import { getIsAlienationColor } from 'statistics/common';
import BaseColor from './BaseColor';
import RuleColor from './RuleColor';

const EntranceWrapper = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  height: 30px;
  background-color: #fff;
  &.ruleIcon {
    width: 30px;
    margin-left: 10px;
    justify-content: center;
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

export default class ColorEntrance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      baseColorModalVisible: false,
      ruleColorModalVisible: false,
    };
  }
  getRuleVisible() {
    const { currentReport } = this.props;
    const { reportType, yaxisList, split, yreportType, displaySetup } = currentReport;
    if ([reportTypes.BarChart].includes(reportType)) {
      return yaxisList.length === 1 && _.isEmpty(split.controlId);
    }
    if ([reportTypes.DualAxes].includes(reportType)) {
      return yaxisList.length === 1 && _.isEmpty(split.controlId) && yreportType === reportTypes.BarChart;
    }
    if ([reportTypes.ScatterChart].includes(reportType)) {
      return _.isEmpty(split.controlId);
    }
    if ([reportTypes.CountryLayer].includes(reportType)) {
      return displaySetup.showChartType !== 2;
    }
    return [reportTypes.FunnelChart, reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType);
  }
  getColorName() {
    const { projectId } = this.props.worksheetInfo;
    const { style = {}, reportType, split } = this.props.currentReport;
    const isBarChart = reportType === reportTypes.BarChart;
    const defaultColorName = `${colorGroup[0].name}${_l('配色')}`;
    const isAlienationColor =
      getIsAlienationColor(this.props.currentReport) || (isBarChart && _.get(split, 'options.length'));
    if (_.isUndefined(style.colorType)) {
      return defaultColorName;
    } else {
      const { chartColor, chartColorIndex = 1 } = this.props.customPageConfig;
      const newStyle = chartColorIndex >= (style.chartColorIndex || 0) ? { ...style, ...chartColor } : style;
      const { colorType, colorGroupIndex, colorGroupId } = newStyle;
      if (colorType === 0) {
        return isAlienationColor ? _l('选项配色') : defaultColorName;
      } else if (colorType === 1) {
        let name = null;
        const chartColors = getPorjectChartColors(projectId);
        if (colorGroupId === 'adaptThemeColor') {
          name = _l('适应主题');
        } else if (colorGroupId && colorGroupId.includes('personColor')) {
          const { personColor } = newStyle;
          name = personColor.name;
        } else if (colorGroupId) {
          name = (_.find(chartColors, { id: colorGroupId }) || chartColors[0]).name;
        } else if (colorGroup[colorGroupIndex]) {
          name = colorGroup[colorGroupIndex].name;
        } else {
          name = chartColors[0].name;
        }
        return `${name}${_l('配色')}`;
      } else {
        return _l('自定义配色');
      }
    }
  }
  renderBaseColorModal() {
    const { worksheetInfo, currentReport, onChangeCurrentReport, customPageConfig } = this.props;
    const { chartColor, chartColorIndex = 1 } = customPageConfig;
    const { baseColorModalVisible } = this.state;
    // const newStyle = chartColorIndex >= (style.chartColorIndex || 0) ? { ...style, ...chartColor } : style;
    return (
      <BaseColor
        visible={baseColorModalVisible}
        projectId={worksheetInfo.projectId}
        currentReport={currentReport}
        // currentReport={{
        //   ...currentReport,
        //   style: newStyle,
        // }}
        onChange={data => {
          if (chartColor) {
            data.style.chartColorIndex = chartColorIndex + 1;
          }
          onChangeCurrentReport(data, true);
          this.setState({
            baseColorModalVisible: false,
          });
        }}
        onCancel={() => {
          this.setState({
            baseColorModalVisible: false,
          });
        }}
      />
    );
  }
  renderRuleColorModal() {
    const { currentReport, onChangeDisplayValue } = this.props;
    const { ruleColorModalVisible } = this.state;
    const { colorRules } = currentReport.displaySetup;
    const onCancel = () => {
      this.setState({
        ruleColorModalVisible: false,
      });
    };
    return (
      <RuleColor
        visible={ruleColorModalVisible}
        yaxisList={currentReport.yaxisList}
        reportType={currentReport.reportType}
        colorRule={colorRules.length ? _.get(colorRules[0], 'dataBarRule') || {} : {}}
        onSave={data => {
          const rule = {
            controlId: '',
            dataBarRule: data,
          };
          onChangeDisplayValue('colorRules', [rule]);
          onCancel();
        }}
        onCancel={onCancel}
      />
    );
  }
  render() {
    const name = this.getColorName();
    const { displaySetup } = this.props.currentReport;
    const ruleVisible = this.getRuleVisible();
    const colorRules = ruleVisible ? displaySetup.colorRules : [];
    return (
      <div className="mBottom16 flexRow valignWrapper">
        <EntranceWrapper
          style={{ height: 'auto', padding: '5px 10px' }}
          className="flex flexRow valignWrapper pointer"
          onClick={() => {
            if (colorRules.length) {
              this.setState({ ruleColorModalVisible: true });
            } else {
              this.setState({ baseColorModalVisible: true });
            }
          }}
        >
          {colorRules.length ? (
            <Fragment>
              <Icon className="Font16 Gray_9e mRight10" icon="formula" />
              <span>{_l('规则')}</span>
            </Fragment>
          ) : (
            <span>{name}</span>
          )}
        </EntranceWrapper>
        {ruleVisible &&
          (colorRules.length ? (
            <EntranceWrapper
              className="ruleIcon flexRow valignWrapper pointer"
              onClick={() => {
                this.props.onChangeDisplayValue('colorRules', []);
              }}
            >
              <Icon className="Font16 Gray_9e" icon="trash" />
            </EntranceWrapper>
          ) : (
            <Tooltip title={_l('颜色规则')}>
              <EntranceWrapper
                className="ruleIcon flexRow valignWrapper pointer"
                onClick={() => {
                  this.setState({ ruleColorModalVisible: true });
                }}
              >
                <Icon className="Font16 Gray_9e" icon="formula" />
              </EntranceWrapper>
            </Tooltip>
          ))}
        {this.renderBaseColorModal()}
        {this.renderRuleColorModal()}
      </div>
    );
  }
}
