import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Tooltip } from 'ming-ui';
import { Menu, Dropdown, Select } from 'antd';
import styled from 'styled-components';
import DataItemColor from './DataItemColor';
import RuleColor from '../Color/RuleColor';

const AddLine = styled.div`
  color: #2196F3;
  &:hover {
    color: #0484fb;
  }
`;

const EntranceWrapper = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  height: 30px;
  background-color: #fff;
  &.ruleIcon {
    width: 30px;
    margin-left: 5px;
    justify-content: center;
  }
`;

export default class PivotTableFieldColor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editControlId: null,
      applyType: null,
      dataItemColorModalVisible: false,
      ruleColorModalVisible: false,
    }
  }
  renderDataItemModal() {
    const { dataItemColorModalVisible, editControlId, applyType } = this.state;
    const { onChangeStyle, currentReport } = this.props;
    const { yaxisList, style } = currentReport;
    const { pivotTableFieldColorRule = [] } = style;
    return (
      <DataItemColor
        visible={dataItemColorModalVisible}
        onSave={(data) => {
          onChangeStyle({
            pivotTableFieldColorRule: pivotTableFieldColorRule.map(rule => {
              if (rule.controlId === editControlId) {
                rule[applyType] = data;
              }
              return rule;
            })
          });
        }}
        onCancel={() => {
          this.setState({
            applyType: null,
            editControlId: null,
            dataItemColorModalVisible: false,
          });
        }}
      />
    );
  }
  renderRuleColorModal() {
    const { ruleColorModalVisible, editControlId, applyType } = this.state;
    const { onChangeStyle, currentReport } = this.props;
    const { yaxisList, style } = currentReport;
    const { pivotTableFieldColorRule = [] } = style;
    return (
      <RuleColor
        visible={ruleColorModalVisible}
        yaxisList={yaxisList}
        onSave={(data) => {
          onChangeStyle({
            pivotTableFieldColorRule: pivotTableFieldColorRule.map(rule => {
              if (rule.controlId === editControlId) {
                rule[applyType] = data;
              }
              return rule;
            })
          });
        }}
        onCancel={() => {
          this.setState({
            applyType: null,
            editControlId: null,
            ruleColorModalVisible: false,
          });
        }}
      />
    );
  }
  renderAddDropdown() {
    const { onChangeStyle, currentReport } = this.props;
    const { yaxisList, style } = currentReport;
    const { pivotTableFieldColorRule = [] } = style;
    const selectIds = pivotTableFieldColorRule.map(data => data.controlId);
    const data = yaxisList.filter(data => !selectIds.includes(data.controlId));
    if (data.length) {
      return (
        <Dropdown
          placement="topLeft"
          trigger={['click']}
          overlay={(
            <Menu>
              {data.map(data => (
                <Menu.Item
                  key={data.controlId}
                  className="pTop7 pBottom7 pLeft20"
                  onClick={() => {
                    onChangeStyle({
                      pivotTableFieldColorRule: pivotTableFieldColorRule.concat({
                        controlId: data.controlId
                      })
                    });
                  }}
                >
                  {data.controlName}
                </Menu.Item>
              ))}
            </Menu>
          )}
        >
          <AddLine className="Font13 valignWrapper pointer" onClick={e => e.preventDefault()}>
            <Icon icon="add" />
            {_l('添加字段')}
          </AddLine>
        </Dropdown>
      );
    } else {
      return null;
    }
  }
  render() {
    const { onChangeStyle, currentReport } = this.props;
    const { yaxisList, style } = currentReport;
    const { pivotTableFieldColorRule = [] } = style;
    const selectIds = pivotTableFieldColorRule.map(data => data.controlId);
    return (
      <div className="mBottom16">
        {pivotTableFieldColorRule.map(data => (
          <div key={data.controlId} className="flexRow valignWrapper mBottom10">
            <Select
              className="chartSelect flex mRight5"
              value={data.controlId}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={(value) => {
                onChangeStyle({
                  pivotTableFieldColorRule: pivotTableFieldColorRule.map(item => {
                    if (item.controlId === data.controlId) {
                      item.controlId = value;
                    }
                    return item;
                  })
                });
              }}
            >
              {yaxisList.map(item => (
                <Select.Option
                  key={item.controlId}
                  className="selectOptionWrapper"
                  value={item.controlId}
                  disabled={item.controlId !== data.controlId && selectIds.includes(item.controlId)}
                >
                  {item.controlName}
                </Select.Option>
              ))}
            </Select>
            <Tooltip text={<span>{_l('字体色')}</span>}>
              <EntranceWrapper
                className="ruleIcon flexRow valignWrapper pointer"
                onClick={() => { this.setState({ ruleColorModalVisible: true, editControlId: data.controlId, applyType: 'textColorRule' }); }}
              >
                <Icon className="Gray_9e Font16" icon="letter_a" />
              </EntranceWrapper>
            </Tooltip>
            <Tooltip text={<span>{_l('背景色')}</span>}>
              <EntranceWrapper
                className="ruleIcon flexRow valignWrapper pointer"
                onClick={() => { this.setState({ ruleColorModalVisible: true, editControlId: data.controlId, applyType: 'bgColorRule' }); }}
              >
                <Icon className="Gray_9e Font16" icon="letter_a" />
              </EntranceWrapper>
            </Tooltip>
            <Tooltip text={<span>{_l('数据条')}</span>}>
              <EntranceWrapper
                className="ruleIcon flexRow valignWrapper pointer"
                onClick={() => { this.setState({ dataItemColorModalVisible: true, editControlId: data.controlId, applyType: 'dataItemRule' }) }}
              >
                <Icon className="Gray_9e Font16" icon="letter_a" />
              </EntranceWrapper>
            </Tooltip>
          </div>
        ))}
        {this.renderAddDropdown()}
        {this.renderRuleColorModal()}
        {this.renderDataItemModal()}
      </div>
    );
  }
}
