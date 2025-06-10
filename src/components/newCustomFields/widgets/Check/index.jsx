import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Checkbox, RadioGroup, Switch } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import { getSwitchItemNames } from 'src/utils/control';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  shouldComponentUpdate(nextProps) {
    if (!_.isEqual(_.pick(nextProps, ['value', 'disabled']), _.pick(this.props, ['value', 'disabled']))) {
      return true;
    }
    return false;
  }

  onChange = checked => {
    const value = checked ? '0' : '1';
    this.props.onChange(value);
  };

  renderContent = () => {
    const { disabled, value, advancedSetting = {}, hint = '', switchSize } = this.props;
    const itemnames = getSwitchItemNames(this.props);

    const isChecked = value === 1 || value === '1';
    let isMobile = browserIsMobile();

    if (advancedSetting.showtype === '1') {
      const text = isChecked ? _.get(itemnames[0], 'value') : _.get(itemnames[1], 'value');
      return (
        <div className={cx('flexCenter w100', { flexRow: browserIsMobile() })}>
          <Switch
            disabled={disabled}
            checked={isChecked}
            onClick={this.onChange}
            size={switchSize || 'default'}
            className={cx({ mobileFormSwitchDisabled: disabled })}
          />
          {text && (
            <span className={cx('mLeft6 flex overflow_ellipsis', { LineHeight24: browserIsMobile() })}>{text}</span>
          )}
        </div>
      );
    }

    if (advancedSetting.showtype === '2') {
      if (isMobile && disabled) {
        let radioLabel = (itemnames || []).filter(item => item.key === value).length
          ? itemnames.filter(item => item.key === value)[0].value
          : '';
        return <div className="mobileDisableChaeckRadio ellipsis">{radioLabel}</div>;
      }

      return (
        <RadioGroup
          size="middle"
          disabled={disabled}
          className={cx('customFormCheck', { mobileCustomFormRadio: isMobile })}
          checkedValue={`${value}`}
          data={itemnames.map(item => ({ text: item.value, value: item.key }))}
          onChange={type => this.onChange(type !== '1')}
        />
      );
    }

    return (
      <Checkbox
        className="customFormCheck"
        disabled={disabled}
        checked={isChecked}
        onClick={this.onChange}
        size={switchSize || 'default'}
      >
        {hint}
      </Checkbox>
    );
  };

  render() {
    const { disabled, advancedSetting = {} } = this.props;

    return (
      <div
        className={cx('customFormControlBox customFormButton flexRow customFormControlSwitch', {
          controlDisabled: disabled,
          customFormSwitchColumn: advancedSetting.showtype === '2', // 详情排列格式
        })}
        style={{ height: 'auto' }}
      >
        {this.renderContent()}
      </div>
    );
  }
}
