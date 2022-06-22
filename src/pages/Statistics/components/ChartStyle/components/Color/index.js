import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { ConfigProvider, Modal, Button, Input } from 'antd';
import { Icon, Tooltip } from 'ming-ui';
import { colorGroup } from 'statistics/Charts/common';
import { getIsAlienationColor } from 'statistics/common';
import styled from 'styled-components';
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
    const { style } = this.props.currentReport;
    const defaultColorName = `${colorGroup[0].name}${_l('配色')}`;
    const isAlienationColor = getIsAlienationColor(this.props.currentReport);
    if (_.isEmpty(style)) {
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
  renderBaseColorFooter() {
    return (
      <div className="mTop15 mBottom20 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={() => {
              this.setState({
                baseColorModalVisible: false,
              });
            }}
          >
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={() => { this.baseColorEl.handleSave(); }}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  renderBaseColorModal() {
    const { columns, currentReport, onChangeCurrentReport } = this.props;
    const { baseColorModalVisible } = this.state;
    return (
      <Modal
        title={_l('图形颜色')}
        width={480}
        className="chartModal chartBaseColorModal"
        visible={baseColorModalVisible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderBaseColorFooter()}
        onCancel={() => {
          this.setState({
            baseColorModalVisible: false,
          });
        }}
      >
        <BaseColor
          ref={el => {
            this.baseColorEl = el;
          }}
          columns={columns}
          currentReport={currentReport}
          onChange={(data) => {
            onChangeCurrentReport(data, true);
            this.setState({
              baseColorModalVisible: false
            });
          }}
        />
      </Modal>
    );
  }
  renderRuleColorFooter() {
    return (
      <div className="mTop15 mBottom20 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={() => {
              this.setState({
                ruleColorModalVisible: false,
              });
            }}
          >
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={() => { this.ruleColorEl.handleSave(); }}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  renderRuleColorModal() {
    const { ruleColorModalVisible } = this.state;
    return (
      <Modal
        title={_l('颜色规则')}
        width={580}
        className="chartModal chartRuleColorModal"
        visible={ruleColorModalVisible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderRuleColorFooter()}
        onCancel={() => {
          this.setState({
            ruleColorModalVisible: false,
          });
        }}
      >
        <RuleColor
          ref={el => {
            this.ruleColorEl = el;
          }}
        />
      </Modal>
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
