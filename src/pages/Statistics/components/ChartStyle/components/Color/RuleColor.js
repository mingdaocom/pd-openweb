import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Radio, Input, Select, Checkbox } from 'antd';
import { Icon } from 'ming-ui';
import { colorGroup } from 'statistics/Charts/common';
import { getIsAlienationColor } from 'statistics/common';
import { formatNumberFromInput } from 'src/util';
import { getGradientColors } from 'statistics/common';
import './RuleColor.less';

class ColorLevel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      min: {
        value: 0,
        type: 1,
        color: '#0096fe',
      },
      center: {
        value: 0,
        type: 1,
        color: '#ffa330',
      },
      max: {
        value: 0,
        type: 1,
        color: '#3bb057'
      },
      centerVisible: false,
      colors: []
    }
  }
  getGradientColors = () => {
    const { min, max, center, centerVisible } = this.state;
    if (centerVisible) {
      const colors1 = getGradientColors(min.color, center.color, 50);
      const colors2 = getGradientColors(center.color, max.color, 50);
      this.setState({ colors: colors1.concat(colors2) });
    } else {
      const colors = getGradientColors(min.color, max.color, 100);
      this.setState({ colors });
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
  renderItem(name, data, onChange) {
    const { value, type, color } = data;
    return (
      <Fragment>
        <div className="mTop16 mBottom8">{name}</div>
        <div className="flexRow valignWrapper">
          <Select
            style={{ width: 230 }}
            className="chartSelect mRight10"
            value={type}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={(type) => {
              onChange({
                ...data,
                type
              });
            }}
          >
            <Select.Option className="selectOptionWrapper" value={1}>{name}</Select.Option>
            <Select.Option className="selectOptionWrapper" value={2}>{_l('自定义')}</Select.Option>
          </Select>
          {type === 2 && (
            <Input
              style={{ width: 230 }}
              value={value}
              className="chartInput mRight10"
              onChange={(e) => {
                let value = event.target.value;
                onChange({
                  ...data,
                  value: formatNumberFromInput(value)
                });
              }}
            />
          )}
          <div className="palette valignWrapper">
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
        </div>
      </Fragment>
    );
  }
  render() {
    const { min, center, max, centerVisible, colors } = this.state;
    return (
      <Fragment>
        {this.renderItem(_l('最小值'), min, this.handleChangeMin)}
        {centerVisible && this.renderItem(_l('中间值'), center, this.handleChangeCenter)}
        {this.renderItem(_l('最大值'), max, this.handleChangeMax)}
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
        <div className="flexRow valignWrapper mTop16" style={{ flexWrap: 'wrap' }}>
          {colors.map((item, index) => (
            <div key={index} className="mBottom5" style={{ background: item, width: 5.3, height: 10 }}></div>
          ))}
        </div>
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
  handleChangeType = () => {

  }
  handleSave = () => {
    this.colorLevelEl.getGradientColors();
  }
  render() {
    const { model } = this.state;
    return (
      <Fragment>
        <div className="mBottom16">{_l('格式模式')}</div>
        <Radio.Group onChange={this.handleChangeType} value={model}>
          <Radio value={1}>{_l('按色阶')}</Radio>
          <Radio value={2}>{_l('按范围')}</Radio>
        </Radio.Group>
        <ColorLevel
          ref={el => {
            this.colorLevelEl = el;
          }}
        />
      </Fragment>
    );
  }
}
