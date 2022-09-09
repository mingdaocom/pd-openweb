import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Radio, Input } from 'antd';
import { Icon } from 'ming-ui';
import { colorGroup } from 'statistics/Charts/common';
import { getIsAlienationColor } from 'statistics/common';
import './BaseColor.less';

export default class BaseColor extends Component {
  constructor(props) {
    super(props);
    const { style, xaxes } = props.currentReport;
    const { colorType, colorGroupIndex, customColors } = style ? style : {};
    const defaultColors = colorGroup[0].value;
    const defaultCustomColors = defaultColors.map(item => defaultColors[0]);
    const storeCustomColors = JSON.parse(localStorage.getItem('chartCustomColors'));
    const controlColors = xaxes.options ? xaxes.options.map(item => item.color) : [];
    this.isAlienationColor = getIsAlienationColor(props.currentReport);
    const type = [1, 2].includes(colorType) ? colorType : ((_.isEmpty(controlColors) || !this.isAlienationColor) ? 1 : 0);
    const defaultType = _.isEmpty(style) ? 1 : type;
    this.state = {
      type: defaultType,
      colorGroupIndex: colorGroupIndex || 0,
      colorIndex: 0,
      customColors: customColors || storeCustomColors || defaultCustomColors,
      controlColors: this.isAlienationColor ? controlColors : []
    }
  }
  handleSave = () => {
    const { currentReport, onChange } = this.props;
    const { type, colorGroupIndex, customColors } = this.state;
    const param = {};
    if (type === 1) {
      param.colorGroupIndex = colorGroupIndex;
    } else {
      param.colorGroupIndex = null;
      param.customColors = customColors;
      safeLocalStorageSetItem('chartCustomColors', JSON.stringify(customColors));
    }
    param.colorType = type;
    onChange({
      style: {
        ...currentReport.style,
        ...param
      }
    });
  }
  handleChangeType = (e) => {
    const { colorGroupIndex } = this.state;
    const { value } = e.target;
    this.setState({
      type: value,
      colorIndex: 0,
    });
  }
  renderColorGroup({ name, value }, index) {
    const { colorGroupIndex } = this.state;
    return (
      <div
        key={index}
        className={cx('flexRow valignWrapper colorItem', { active: index == colorGroupIndex })}
        onClick={() => {
          this.setState({
            colorGroupIndex: index
          });
        }}
      >
        <div className="flexRow valignWrapper flex wrap">
          {
            value.map((item, index) => (
              <div
                key={index}
                className="item narrow"
                style={{
                  backgroundColor: item
                }}
              >
              </div>
            ))
          }
        </div>
        <div className="flexRow valignWrapper">
          <div className="Font13 mLeft10 colorName">{name}</div>
          <Icon className={cx('mLeft10 Font20', { Visibility: index !== colorGroupIndex })} icon="done" />
        </div>
      </div>
    );
  }
  renderColor(item, index) {
    const { customColors, colorIndex } = this.state;
    return (
      <div
        key={index}
        className={cx('flexRow valignWrapper colorItem', { active: index == colorIndex })}
        onClick={() => {
          this.setState({
            colorIndex: index
          });
        }}
      >
        <div
          className="item"
          style={{
            backgroundColor: item
          }}
        >
          <input
            type="color"
            className="colorInput pointer"
            value={item}
            onChange={(event) => {
              this.setState({
                customColors: customColors.map((item, i) => {
                  if (index === i) {
                    return event.target.value;
                  }
                  return item;
                })
              });
            }}
          />
        </div>
        <div className="Font13 mLeft5">{_l('色值%0', index + 1)}</div>
      </div>
    );
  }
  render() {
    const { type, colorGroupIndex, customColors, controlColors } = this.state;
    const length = Array.from({ length: Object.keys(colorGroup).length });
    const isOptionColor = !_.isEmpty(controlColors);
    return (
      <Fragment>
        <div className="mBottom16">{_l('配色方案')}</div>
        <Radio.Group onChange={this.handleChangeType} value={type}>
          {isOptionColor && <Radio value={0}>{_l('选项色')}</Radio>}
          <Radio value={1}>{_l('色板')}</Radio>
          <Radio value={2}>{_l('自定义')}</Radio>
        </Radio.Group>
        {
          type === 0 && (
            <div className="mTop20 Gray_75">
              {_l('选项色是使用工作表该选项字段所配置的颜色')}
            </div>
          )
        }
        {
          type === 1 && (
            <div className="colorSwatches">
              {
                length.map((item, index) => (
                  this.renderColorGroup(colorGroup[index], index)
                ))
              }
            </div>
          )
        }
        {
          type === 2 && (
            <div className="colorSwatches">
              {
                customColors.map((item, index) => (
                  this.renderColor(item, index)
                ))
              }
            </div>
          )
        }
      </Fragment>
    );
  }
}
