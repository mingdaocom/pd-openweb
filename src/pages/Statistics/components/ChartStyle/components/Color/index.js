import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Tooltip } from 'ming-ui';
import { colorGroup, reportTypes } from 'statistics/Charts/common';
import { getIsAlienationColor } from 'statistics/common';
import styled from 'styled-components';
import BaseColor from './BaseColor';
import RuleColor from './RuleColor';
import _ from 'lodash';

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
      ruleColorModalVisible: false
    }
  }
  getRuleVisible() {
    const { currentReport } = this.props;
    const { reportType, yaxisList, split, yreportType } = currentReport;
    if ([reportTypes.BarChart].includes(reportType)) {
      return yaxisList.length === 1 && _.isEmpty(split.controlId);
    }
    if ([reportTypes.DualAxes].includes(reportType)) {
      return yaxisList.length === 1 && _.isEmpty(split.controlId) && yreportType === reportTypes.BarChart;
    }
    if ([reportTypes.ScatterChart].includes(reportType)) {
      return _.isEmpty(split.controlId);
    }
    return [reportTypes.FunnelChart, reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType);
  }
  getColorName() {
    const { style = {}, reportType, split } = this.props.currentReport;
    const isBarChart = reportType === reportTypes.BarChart;
    const defaultColorName = `${colorGroup[0].name}${_l('配色')}`;
    const isAlienationColor = getIsAlienationColor(this.props.currentReport) || (isBarChart && _.get(split, 'options.length'));
    if (_.isUndefined(style.colorType)) {
      return defaultColorName;
    } else {
      const { colorType, colorGroupIndex } = style;
      if (colorType === 0) {
        return isAlienationColor ? _l('选项配色') : defaultColorName;
      } else if (colorType === 1) {
        const data = colorGroup[colorGroupIndex] || colorGroup[0];
        return `${data.name}${_l('配色')}`;
      } else {
        return _l('自定义配色');
      }
    }
  }
  renderBaseColorModal() {
    const { columns, currentReport, onChangeCurrentReport } = this.props;
    const { baseColorModalVisible } = this.state;
    return (
      <BaseColor
        visible={baseColorModalVisible}
        columns={columns}
        currentReport={currentReport}
        onChange={(data) => {
          onChangeCurrentReport(data, true);
          this.setState({
            baseColorModalVisible: false
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
    }
    return (
      <RuleColor
        visible={ruleColorModalVisible}
        yaxisList={currentReport.yaxisList}
        reportType={currentReport.reportType}
        colorRule={colorRules.length ? _.get(colorRules[0], 'dataBarRule') || {} : {}}
        onSave={(data) => {
          const rule = {
            controlId: '',
            dataBarRule: data
          }
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
          className="flex flexRow valignWrapper pointer pLeft10"
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
        {ruleVisible && (
          colorRules.length ? (
            <EntranceWrapper
              className="ruleIcon flexRow valignWrapper pointer"
              onClick={() => {
                this.props.onChangeDisplayValue('colorRules', []);
              }}
            >
              <Icon className="Font16 Gray_9e" icon="delete2" />
            </EntranceWrapper>
          ) : (
            <Tooltip text={<span>{_l('颜色规则')}</span>}>
              <EntranceWrapper
                className="ruleIcon flexRow valignWrapper pointer"
                onClick={() => { this.setState({ ruleColorModalVisible: true }); }}
              >
                <Icon className="Font16 Gray_9e" icon="formula" />
              </EntranceWrapper>
            </Tooltip>
          )
        )}
        {this.renderBaseColorModal()}
        {this.renderRuleColorModal()}
      </div>
    );
  }
}
