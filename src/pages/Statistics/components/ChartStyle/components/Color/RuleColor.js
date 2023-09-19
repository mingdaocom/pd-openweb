import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Modal, ConfigProvider, Button, Radio, Input, Select, Checkbox } from 'antd';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { Icon } from 'ming-ui';
import { colorGroup, reportTypes } from 'statistics/Charts/common';
import { getIsAlienationColor } from 'statistics/common';
import { formatNumberFromInput } from 'src/util';
import { getGradientColors, isNumberControl, textNormTypes } from 'statistics/common';
import './RuleColor.less';

const SortableItem = SortableElement(({ item, ruleIndex, rulesLength, isPercent, ...otherProps }) => {
  const { type, and, min, max, value, color } = item;
  return (
    <div className="flexRow valignWrapper scopeRule" key={ruleIndex}>
      <div className="flexRow valignWrapper flex">
        <Icon icon="drag" className="Font18 Gray_9e pointer" />
        <div className="mRight10">{_l('如果值')}</div>
        <Select
          style={{ width: 80 }}
          className="chartSelect mRight10"
          value={type}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          onChange={(type) => {
            otherProps.onSetRule({ type }, ruleIndex);
          }}
        >
          <Select.Option className="selectOptionWrapper" value={1}>{'>'}</Select.Option>
          <Select.Option className="selectOptionWrapper" value={2}>{'>='}</Select.Option>
          <Select.Option className="selectOptionWrapper" value={3}>{'='}</Select.Option>
          <Select.Option className="selectOptionWrapper" value={4}>{_l('为空')}</Select.Option>
        </Select>
        {[1, 2].includes(type) && (
          <Fragment>
            <Input
              style={{ width: isPercent ? 90 : 115 }}
              value={min}
              placeholder={_l('最小值')}
              className="chartInput"
              onChange={(e) => {
                const value = formatNumberFromInput(event.target.value);
                otherProps.onSetRule({ min: value ? value : undefined }, ruleIndex);
              }}
              onBlur={() => {
                otherProps.onSetRule({ min: min ? Number(min) : undefined }, ruleIndex);
              }}
            />
            {isPercent && <div className="mLeft5">%</div>}
          </Fragment>
        )}
        {[3].includes(type) && (
          <Fragment>
            <Input
              style={{ width: isPercent ? 90 : 115 }}
              value={value}
              placeholder={_l('值')}
              className="chartInput"
              onChange={(e) => {
                const value = formatNumberFromInput(event.target.value);
                otherProps.onSetRule({ value: value ? value : undefined }, ruleIndex);
              }}
              onBlur={() => {
                otherProps.onSetRule({ value: value ? Number(value) : undefined }, ruleIndex);
              }}
            />
            {isPercent && <div className="mLeft5">%</div>}
          </Fragment>
        )}
        {[1, 2].includes(type) && (
          <Fragment>
            <div className="mLeft10 mRight10">{_l('和')}</div>
            <Select
              style={{ width: 80 }}
              className="chartSelect mRight10"
              value={and}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={(and) => {
                otherProps.onSetRule({ and }, ruleIndex);
              }}
            >
              <Select.Option className="selectOptionWrapper" value={5}>{'<'}</Select.Option>
              <Select.Option className="selectOptionWrapper" value={6}>{'<='}</Select.Option>
            </Select>
            <Input
              style={{ width: isPercent ? 90 : 115 }}
              value={max}
              placeholder={_l('最大值')}
              className="chartInput"
              onChange={(e) => {
                const value = formatNumberFromInput(event.target.value);
                otherProps.onSetRule({ max: value ? value : undefined }, ruleIndex);
              }}
              onBlur={() => {
                otherProps.onSetRule({ max: max ? Number(max) : undefined }, ruleIndex);
              }}
            />
            {isPercent && <div className="mLeft5">%</div>}
          </Fragment>
        )}
      </div>
      <div className="mLeft10 mRight10">{_l('则为')}</div>
      <div className="palette valignWrapper">
        <div className="colorBox" style={{ backgroundColor: color }}></div>
        <input
          type="color"
          className="colorInput pointer"
          value={color}
          onChange={(event) => {
            otherProps.onSetRule({ color: event.target.value }, ruleIndex);
          }}
        />
        <Icon icon="expand_more" className="Gray_9e Font20" />
      </div>
      <Icon
        className={cx('pointer Font20 mLeft5', rulesLength === 1 ? 'Gray_d' : 'Gray_bd')}
        icon="close"
        onClick={() => {
          if (rulesLength === 1) return;
          otherProps.onDeleteRule(ruleIndex);
        }}
      />
    </div>
  );
});

const SortableList = SortableContainer(({ rules, ...otherProps }) => {
  return (
    <div className="scopeRulesWrap">
      {rules.map((item, index) => (
        <SortableItem
          key={index}
          index={index}
          ruleIndex={index}
          rulesLength={rules.length}
          item={item}
          {...otherProps}
        />
      ))}
    </div>
  );
});

class ColorLevel extends Component {
  constructor(props) {
    super(props);
    const { yaxisList, colorRule = {} } = props;
    this.state = {
      min: colorRule.min || {
        value: undefined,
        color: '#0096fe',
      },
      center: colorRule.center || {
        value: undefined,
        color: '#ffa330',
      },
      max: colorRule.max || {
        value: undefined,
        color: '#3bb057'
      },
      controlId: colorRule.controlId || _.get(yaxisList[0], 'controlId') || null,
      applyValue: colorRule.applyValue || 1,
      centerVisible: colorRule.centerVisible || false,
      colors: []
    }
  }
  getGradientColors = () => {
    const { min, max, center, centerVisible } = this.state;
    if (centerVisible) {
      const colors1 = getGradientColors(min.color, center.color, 50);
      const colors2 = getGradientColors(center.color, max.color, 50);
      return colors1.concat(colors2);
    } else {
      const colors = getGradientColors(min.color, max.color, 100);
      return colors;
    }
  }
  getSaveData = () => {
    const { reportType } = this.props;
    const { min, center, max, controlId, applyValue, centerVisible } = this.state;
    const colors = this.getGradientColors();
    return {
      min,
      center,
      max,
      controlId,
      applyValue: reportType === reportTypes.PivotTable ? applyValue : 2,
      centerVisible,
      colors
    }
  }
  handleChangeMin = (data) => {
    this.setState({
      min: data
    });
  }
  handleChangeCenter = (data) => {
    this.setState({
      center: data
    });
  }
  handleChangeMax = (data) => {
    this.setState({
      max: data
    });
  }
  renderItem(name, placeholder, data, onChange) {
    const { value, color } = data;
    return (
      <Fragment>
        <div className="mTop16 mBottom8">{name}</div>
        <div className="flexRow valignWrapper">
          <div className="palette valignWrapper mRight10">
            <div className="colorBox" style={{ backgroundColor: color }}></div>
            <input
              type="color"
              className="colorInput pointer"
              value={color}
              onChange={(event) => {
                onChange({
                  ...data,
                  color: event.target.value
                });
              }}
            />
            <Icon icon="expand_more" className="Gray_9e Font20" />
          </div>
          <Input
            value={value}
            placeholder={placeholder}
            className="chartInput flex mRight10"
            onChange={(e) => {
              let value = formatNumberFromInput(event.target.value);
              onChange({
                ...data,
                value: value ? value : undefined
              });
            }}
            onBlur={() => {
              onChange({
                ...data,
                value: value ? Number(value) : undefined
              });
            }}
          />
        </div>
      </Fragment>
    );
  }
  render() {
    const { yaxisList, reportType } = this.props;
    const { min, center, max, centerVisible, controlId, applyValue } = this.state;
    const filterYaxisList = _.uniqBy(yaxisList, 'controlId').filter(data => data.normType !== 7);
    const renderOption = data => {
      const norm = _.find(textNormTypes, { value: data.normType });
      return (
        <Select.Option className="selectOptionWrapper" key={data.controlId} value={data.controlId}>
          {data.controlName}
          {!isNumberControl(data.controlType) && norm && ` (${norm.text})`}
        </Select.Option>
      );
    }
    return (
      <Fragment>
        <div className="flexRow valignWrapper mTop16">
          <div className="mRight20">
            <div className="mBottom8">{_l('选择依据的字段')}</div>
            <Select
              style={{ width: 130 }}
              className={cx('chartSelect mRight10', { Red: controlId && !_.find(filterYaxisList, { controlId }) })}
              value={controlId ? (_.find(filterYaxisList, { controlId }) ? controlId : _l('已删除')) : undefined}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={(controlId) => {
                this.setState({ controlId });
              }}
            >
              {filterYaxisList.map(renderOption)}
            </Select>
          </div>
          {reportType === reportTypes.PivotTable && (
            <div>
              <div className="mBottom8">{_l('应用内容')}</div>
              <Select
                style={{ width: 130 }}
                className="chartSelect mRight10"
                value={applyValue}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={(applyValue) => {
                  this.setState({ applyValue });
                }}
              >
                <Select.Option className="selectOptionWrapper" value={1}>{_l('仅值')}</Select.Option>
                <Select.Option className="selectOptionWrapper" value={2}>{_l('值和总计')}</Select.Option>
                <Select.Option className="selectOptionWrapper" value={3}>{_l('仅总计')}</Select.Option>
              </Select>
            </div>
          )}
        </div>
        <div className="flexRow valignWrapper">
          <div className="flex mRight10">
            {this.renderItem(_l('开始'), _l('最小值'), min, this.handleChangeMin)}
          </div>
          {centerVisible && (
            <div className="flex mRight10">
              {this.renderItem(_l('中间'), _l('中间值'), center, this.handleChangeCenter)}
            </div>
          )}
          <div className="flex">
            {this.renderItem(_l('结束'), _l('最大值'), max, this.handleChangeMax)}
          </div>
        </div>
        <div className="flexRow valignWrapper mTop16">
          <Checkbox
            checked={centerVisible}
            onChange={(e) => {
              this.setState({ centerVisible: e.target.checked });
            }}
          >
            {_l('中间值')}
          </Checkbox>
        </div>
        <div className="gradientColor mTop16" style={{ background: `linear-gradient(90deg, ${min.color}, ${ centerVisible ? `${center.color},` : '' } ${max.color})` }}></div>
      </Fragment>
    );
  }
}

class ColorScope extends Component {
  constructor(props) {
    super(props);
    const { scopeRules } = props.colorRule;
    this.state = {
      scopeRules: scopeRules || [
        {
          type: 2,
          and: 6,
          min: undefined,
          max: undefined,
          value: undefined,
          color: '#0097ef'
        }
      ]
    }
  }
  handleAddRule = () => {
    const { scopeRules } = this.state;
    this.setState({
      scopeRules: scopeRules.concat({
        type: 2,
        and: 6,
        min: undefined,
        max: undefined,
        value: undefined,
        color: '#3bb057'
      })
    });
  }
  getSaveData = () => {
    return {
      scopeRules: this.state.scopeRules
    };
  }
  handleSetRule = (data, index) => {
    const { scopeRules } = this.state;
    this.setState({
      scopeRules: scopeRules.map((rule, i) => {
        if (index === i) {
          return {
            ...rule,
            ...data
          }
        } else {
          return rule;
        }
      })
    });
  }
  handleDeleteRule = (index) => {
    const { scopeRules } = this.state;
    this.setState({
      scopeRules: scopeRules.filter((_, i) => i !== index)
    });
  }
  handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const { scopeRules } = this.state;
    this.setState({
      scopeRules: arrayMove(scopeRules, oldIndex, newIndex)
    });
  }
  render() {
    const { isPercent } = this.props;
    const { scopeRules } = this.state;
    return (
      <Fragment>
        <div className="flexRow valignWrapper mTop16 mBottom8">
          <div className="flex">{_l('规则')}</div>
          <div className="flexRow valignWrapper ThemeColor pointer addRuleColor" onClick={this.handleAddRule}>
            <Icon icon="add" />
            {_l('添加规则')}
          </div>
        </div>
        <SortableList
          axis="y"
          rules={scopeRules}
          isPercent={isPercent}
          helperClass="sortableScopeRuleWrap"
          shouldCancelStart={e => !e.target.classList.contains('icon-drag')}
          onSortEnd={this.handleSortEnd}
          onSetRule={this.handleSetRule}
          onDeleteRule={this.handleDeleteRule}
        />
      </Fragment>
    );
  }
}

export default class RuleColor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      model: 1
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      const { model = 1 } = nextProps.colorRule || {};
      this.setState({ model });
    }
  }
  handleChangeType = (event) => {
    const { value } = event.target;
    this.setState({
      model: value
    });
  }
  handleSave = () => {
    const { model } = this.state;
    const data = this.colorLevelEl.getSaveData();
    this.props.onSave({
      ...data,
      model
    });
  }
  renderRuleColorFooter() {
    const { onCancel } = this.props;
    return (
      <div className="mTop20 mBottom10 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={onCancel}
          >
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={this.handleSave}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  render() {
    const { visible, onCancel, isPercent = false, yaxisList = [], colorRule, reportType } = this.props;
    const { model } = this.state;
    return (
      <Modal
        title={_l('颜色规则')}
        width={680}
        className="chartModal chartRuleColorModal"
        visible={visible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderRuleColorFooter()}
        onCancel={onCancel}
      >
        <div className="mBottom16">{_l('格式模式')}</div>
        <Radio.Group onChange={this.handleChangeType} value={model}>
          <Radio value={1}>{_l('色阶')}</Radio>
          <Radio value={2}>{_l('范围')}</Radio>
        </Radio.Group>
        {model === 1 && (
          <ColorLevel
            reportType={reportType}
            yaxisList={yaxisList}
            colorRule={colorRule}
            ref={el => {
              this.colorLevelEl = el;
            }}
          />
        )}
        {model === 2 && (
          <ColorScope
            isPercent={isPercent}
            colorRule={colorRule}
            ref={el => {
              this.colorLevelEl = el;
            }}
          />
        )}
      </Modal>
    );
  }
}
