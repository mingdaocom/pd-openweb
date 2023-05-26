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
    const { currentReport } = this.props;
    const { ruleColorModalVisible } = this.state;
    return (
      <RuleColor
        visible={ruleColorModalVisible}
        yaxisList={currentReport.yaxisList}
        onCancel={() => {
          this.setState({
            ruleColorModalVisible: false,
          });
        }}
      />
    );
  }
  render() {
    const name = this.getColorName();
    return (
      <div className="mBottom16 flexRow valignWrapper">
        <EntranceWrapper
          className="flex flexRow valignWrapper pointer pLeft10"
          onClick={() => { this.setState({ baseColorModalVisible: true }); }}
        >
          <span>{name}</span>
        </EntranceWrapper>
        {/*
        <Tooltip text={<span>{_l('颜色规则')}</span>}>
          <EntranceWrapper
            className="ruleIcon flexRow valignWrapper pointer"
            onClick={() => { this.setState({ ruleColorModalVisible: true }); }}
          >
            <Icon className="Gray_9e Font16" icon="formula" />
          </EntranceWrapper>
        </Tooltip>
        */}
        {this.renderBaseColorModal()}
        {this.renderRuleColorModal()}
      </div>
    );
  }
}
