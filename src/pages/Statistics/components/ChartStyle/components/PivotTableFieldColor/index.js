import React, { Component } from 'react';
import { Dropdown, Menu, Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import RuleColor from '../Color/RuleColor';
import DataBarColor from './DataBarColor';

const AddLine = styled.div`
  color: #1677ff;
  &:hover {
    color: #0484fb;
  }
`;

const EntranceWrapper = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  height: 30px;
  background-color: #fff;
  position: relative;
  &.ruleIcon {
    width: 30px;
    margin-left: 5px;
    justify-content: center;
    &:hover {
      background-color: #f5f5f5;
    }
    .icon-cancel:hover {
      color: #1677ff !important;
    }
  }
  &:hover {
    .close {
      display: block;
    }
  }
  .close {
    position: absolute;
    right: -6px;
    top: -6px;
    display: none;
  }
`;

const ColorRuleItem = styled.div`
  position: relative;
  &:hover .deleteColorRule {
    display: block;
  }
  .deleteColorRule {
    position: absolute;
    top: 0;
    left: -37px;
    padding: 7px;
    display: none;
    &:hover {
      color: #1677ff !important;
      display: block;
    }
  }
`;

export default class PivotTableFieldColor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editControlId: null,
      applyType: null,
      dataBarColorModalVisible: false,
      ruleColorModalVisible: false,
    };
  }
  renderDataBarModal() {
    const { dataBarColorModalVisible, editControlId, applyType } = this.state;
    const { onChangeDisplayValue, currentReport } = this.props;
    const { displaySetup } = currentReport;
    const { colorRules = [] } = displaySetup;
    const colorRule = _.find(colorRules, { controlId: editControlId });
    const onCancel = () => {
      this.setState({
        applyType: null,
        editControlId: null,
        dataBarColorModalVisible: false,
      });
    };
    return (
      <DataBarColor
        visible={dataBarColorModalVisible}
        colorRule={_.get(colorRule, applyType) || {}}
        onSave={data => {
          const rules = colorRules.map(rule => {
            if (rule.controlId === editControlId) {
              rule[applyType] = data;
            }
            return rule;
          });
          onChangeDisplayValue('colorRules', rules);
          onCancel();
        }}
        onCancel={onCancel}
      />
    );
  }
  renderRuleColorModal() {
    const { ruleColorModalVisible, editControlId, applyType } = this.state;
    const { onChangeDisplayValue, currentReport } = this.props;
    const { yaxisList, displaySetup, reportType } = currentReport;
    const { colorRules = [] } = displaySetup;
    const colorRule = _.find(colorRules, { controlId: editControlId });
    const onCancel = () => {
      this.setState({
        applyType: null,
        editControlId: null,
        ruleColorModalVisible: false,
      });
    };
    return (
      <RuleColor
        visible={ruleColorModalVisible}
        reportType={reportType}
        yaxisList={yaxisList}
        colorRule={_.get(colorRule, applyType) || {}}
        onSave={data => {
          const rules = colorRules.map(rule => {
            if (rule.controlId === editControlId) {
              rule[applyType] = data;
            }
            return rule;
          });
          onChangeDisplayValue('colorRules', rules);
          onCancel();
        }}
        onCancel={onCancel}
      />
    );
  }
  renderAddDropdown() {
    const { onChangeDisplayValue, currentReport } = this.props;
    const { yaxisList, displaySetup } = currentReport;
    const { colorRules = [] } = displaySetup;
    const selectIds = colorRules.map(data => data.controlId);
    const data = yaxisList.filter(data => !selectIds.includes(data.controlId)).filter(data => data.normType !== 7);
    if (data.length) {
      return (
        <Dropdown
          placement="topLeft"
          trigger={['click']}
          overlay={
            <Menu className="chartMenu">
              {data.map(data => (
                <Menu.Item
                  key={data.controlId}
                  className="pTop7 pBottom7 pLeft20"
                  onClick={() => {
                    const rules = colorRules.concat({
                      controlId: data.controlId,
                    });
                    onChangeDisplayValue('colorRules', rules);
                  }}
                >
                  {data.controlName}
                </Menu.Item>
              ))}
            </Menu>
          }
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
    const { onChangeDisplayValue, currentReport } = this.props;
    const { yaxisList, displaySetup } = currentReport;
    const { colorRules = [] } = displaySetup;
    const selectIds = colorRules.map(data => data.controlId);
    const filterYaxisList = yaxisList.filter(data => data.normType !== 7);
    return (
      <div className="mBottom16">
        {colorRules.map(data => (
          <ColorRuleItem key={data.controlId} className="flexRow valignWrapper mBottom10">
            <Icon
              icon="trash"
              className="Gray_9e Font18 pointer mLeft5 deleteColorRule"
              onClick={() => {
                const rules = colorRules.filter(item => item.controlId !== data.controlId);
                onChangeDisplayValue('colorRules', rules);
              }}
            />
            <Select
              className={cx('chartSelect flex mRight5', {
                Red: data.controlId && !_.find(filterYaxisList, { controlId: data.controlId }),
              })}
              style={{ minWidth: 0 }}
              value={
                data.controlId
                  ? _.find(filterYaxisList, { controlId: data.controlId })
                    ? data.controlId
                    : _l('已删除')
                  : undefined
              }
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                const rules = colorRules.map(item => {
                  if (item.controlId === data.controlId) {
                    item.controlId = value;
                  }
                  return item;
                });
                onChangeDisplayValue('colorRules', rules);
              }}
            >
              {filterYaxisList.map(item => (
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
                onClick={() => {
                  this.setState({
                    ruleColorModalVisible: true,
                    editControlId: data.controlId,
                    applyType: 'textColorRule',
                  });
                }}
              >
                <Icon className={cx('Font16', data.textColorRule ? 'ThemeColor' : 'Gray_9e')} icon="text_bold2" />
                {data.textColorRule && (
                  <Icon
                    icon="cancel"
                    className="Gray_9e Font15 pointer close"
                    onClick={e => {
                      e.stopPropagation();
                      const rules = colorRules.map(item => {
                        if (item.controlId === data.controlId) {
                          item.textColorRule = undefined;
                        }
                        return item;
                      });
                      onChangeDisplayValue('colorRules', rules);
                    }}
                  />
                )}
              </EntranceWrapper>
            </Tooltip>
            <Tooltip text={<span>{_l('背景色')}</span>}>
              <EntranceWrapper
                className="ruleIcon flexRow valignWrapper pointer"
                onClick={() => {
                  this.setState({
                    ruleColorModalVisible: true,
                    editControlId: data.controlId,
                    applyType: 'bgColorRule',
                  });
                }}
              >
                <Icon className={cx('Font18', data.bgColorRule ? 'ThemeColor' : 'Gray_9e')} icon="background_color" />
                {data.bgColorRule && (
                  <Icon
                    icon="cancel"
                    className="Gray_9e Font15 pointer close"
                    onClick={e => {
                      e.stopPropagation();
                      const rules = colorRules.map(item => {
                        if (item.controlId === data.controlId) {
                          item.bgColorRule = undefined;
                        }
                        return item;
                      });
                      onChangeDisplayValue('colorRules', rules);
                    }}
                  />
                )}
              </EntranceWrapper>
            </Tooltip>
            <Tooltip text={<span>{_l('数据条')}</span>}>
              <EntranceWrapper
                className="ruleIcon flexRow valignWrapper pointer"
                onClick={() => {
                  this.setState({
                    dataBarColorModalVisible: true,
                    editControlId: data.controlId,
                    applyType: 'dataBarRule',
                  });
                }}
              >
                <Icon className={cx('Font16', data.dataBarRule ? 'ThemeColor' : 'Gray_9e')} icon="data_bar" />
                {data.dataBarRule && (
                  <Icon
                    icon="cancel"
                    className="Gray_9e Font15 pointer close"
                    onClick={e => {
                      e.stopPropagation();
                      const rules = colorRules.map(item => {
                        if (item.controlId === data.controlId) {
                          item.dataBarRule = undefined;
                        }
                        return item;
                      });
                      onChangeDisplayValue('colorRules', rules);
                    }}
                  />
                )}
              </EntranceWrapper>
            </Tooltip>
          </ColorRuleItem>
        ))}
        {this.renderAddDropdown()}
        {this.renderRuleColorModal()}
        {this.renderDataBarModal()}
      </div>
    );
  }
}
