import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { FILTER_CONDITION_TYPE } from '../../enum';

export default class Number extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.number,
    maxValue: PropTypes.number,
    minValue: PropTypes.number,
    type: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      minValue: props.minValue,
      maxValue: props.maxValue,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.value !== this.props.value ||
      nextProps.minValue !== this.props.minValue ||
      nextProps.maxValue !== this.props.maxValue
    ) {
      this.setState(
        Object.assign(this.state, {
          value: nextProps.value,
          minValue: nextProps.minValue,
          maxValue: nextProps.maxValue,
        }),
      );
    }
  }
  @autobind
  handleChange() {
    const { onChange } = this.props;
    let { value, maxValue, minValue } = this.state;
    function isEmpty(v) {
      return _.isUndefined(v) || v === '';
    }
    const changes = {};
    if (isEmpty(value) && isEmpty(minValue) && isEmpty(maxValue)) {
      // alert(_l('请填写值'), 3);
      return;
    }
    if (minValue && isEmpty(maxValue)) {
      // alert(_l('请填写最大值'), 3);
      return;
    }
    if (isEmpty(minValue) && maxValue) {
      // alert(_l('请填写最小值'), 3);
      return;
    }
    minValue = parseFloat(minValue);
    maxValue = parseFloat(maxValue);
    if (!_.isNumber(minValue) || !_.isNumber(maxValue)) {
      alert(_l('请输入正确的数字'));
      return;
    }
    if (minValue && maxValue && maxValue < minValue) {
      changes.minValue = maxValue;
      changes.maxValue = minValue;
      this.setState({
        minValue: maxValue,
        maxValue: minValue,
      });
    } else {
      changes.maxValue = maxValue;
      changes.minValue = minValue;
      changes.value = value;
    }
    if (value !== this.props.value || minValue !== this.props.minValue || maxValue !== this.props.maxValue) {
      onChange(_.pick(changes, a => !_.isUndefined(a)));
    }
  }
  @autobind
  setValue(key, value) {
    const newValues = {
      value: this.state.value,
      minValue: this.state.minValue,
      maxValue: this.state.maxValue,
    };
    value = value.trim().replace(/[^-\d.]/g, '');
    newValues[key] = value;
    this.setState(newValues);
  }
  render() {
    const { type, disabled } = this.props;
    const { value = '', maxValue = '', minValue = '' } = this.state;
    return (
      <div className="worksheetFilterNumberCondition">
        {type === FILTER_CONDITION_TYPE.BETWEEN || type === FILTER_CONDITION_TYPE.NBETWEEN ? (
          <div className="numberRange flexRow">
            <div>
              <input
                disabled={disabled}
                type="text"
                className="ming Input"
                value={minValue}
                placeholder={_l('最小值')}
                onChange={e => this.setValue('minValue', e.target.value)}
                onBlur={this.handleChange}
              />
            </div>
            <span className="split">-</span>
            <div>
              <input
                disabled={disabled}
                type="text"
                className="ming Input"
                value={maxValue}
                placeholder={_l('最大值')}
                onChange={e => this.setValue('maxValue', e.target.value)}
                onBlur={this.handleChange}
              />
            </div>
          </div>
        ) : (
          <input
            disabled={disabled}
            type="text"
            className="ming Input w100"
            value={value}
            placeholder={_l('请输入数值')}
            onChange={e => this.setValue('value', e.target.value)}
            onBlur={this.handleChange}
          />
        )}
      </div>
    );
  }
}
