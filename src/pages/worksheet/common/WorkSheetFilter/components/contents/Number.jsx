import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { FILTER_CONDITION_TYPE } from '../../enum';
import _ from 'lodash';

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
      return;
    }
    if (minValue && maxValue && parseFloat(maxValue) < parseFloat(minValue)) {
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
      onChange(changes);
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
            <div className="flex">
              <input
                disabled={disabled}
                type="text"
                className="ming Input"
                value={minValue}
                placeholder={_l('最小值')}
                onChange={e => this.setValue('minValue', e.target.value)}
                onBlur={this.handleChange}
                maxlength={18}
              />
            </div>
            <span className="split">-</span>
            <div className="flex">
              <input
                disabled={disabled}
                type="text"
                className="ming Input"
                value={maxValue}
                placeholder={_l('最大值')}
                onChange={e => this.setValue('maxValue', e.target.value)}
                onBlur={this.handleChange}
                maxlength={18}
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
            maxlength={18}
          />
        )}
      </div>
    );
  }
}
