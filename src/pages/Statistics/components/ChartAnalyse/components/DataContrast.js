import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Select } from 'antd';
import { formatContrastTypes } from 'statistics/common';
import { reportTypes } from 'statistics/Charts/common';

const colorList = [{
  name: _l('绿升红降'),
  value: 0
}, {
  name: _l('红升绿降'),
  value: 1
}];

export default class DataContrast extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeLifecycle = checked => {
    const { displaySetup } = this.props.currentReport;
    this.props.onUpdateDisplaySetup({
      ...displaySetup,
      isLifecycle: checked,
      lifecycleValue: 0,
    });
  }
  handleChangeDropdown = value => {
    const { displaySetup } = this.props.currentReport;
    this.props.onUpdateDisplaySetup(
      {
        ...displaySetup,
        contrastType: value,
      },
      true,
    );
  }
  renderContrast() {
    const { currentReport } = this.props;
    const { displaySetup, filter } = currentReport;
    return (
      <div className="mBottom16">
        <div className="mBottom8">{_l('对比')}</div>
        <Select
          className="chartSelect w100"
          value={displaySetup.contrastType}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          onChange={this.handleChangeDropdown}
        >
          {formatContrastTypes(filter).map(item => (
            <Select.Option
              className="selectOptionWrapper"
              disabled={item.disabled}
              key={item.value}
              value={item.value}
            >
              {item.text}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }
  renderContrastColor() {
    const { currentReport, onChangeStyle } = this.props;
    const { style } = currentReport;
    return (
      <div className="mBottom16">
        <div className="mBottom8">{_l('颜色')}</div>
        <div className="chartTypeSelect flexRow valignWrapper">
          {
            colorList.map(item => (
              <div
                key={item.value}
                className={cx('flex centerAlign pointer Gray_75', { active: (style.contrastColor || 0) === item.value })}
                onClick={() => {
                  onChangeStyle({
                    contrastColor: item.value
                  }, true);
                }}
              >
                {item.name}
              </div>
            ))
          }
        </div>
      </div>
    );
  }
  render() {
    const { contrastVisible, contrastColorVisible } = this.props;
    return (
      <Fragment>
        {contrastVisible && (
          this.renderContrast()
        )}
        {contrastColorVisible && (
          this.renderContrastColor()
        )}
      </Fragment>
    );
  }
}
