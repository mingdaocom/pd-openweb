import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Score } from 'ming-ui';
import cx from 'classnames';
import { Picker } from 'antd-mobile';
import { browserIsMobile } from 'src/util';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.any,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
  };

  onChange = value => {
    this.props.onChange(value);
  };

  getLineColor = score => {
    const { enumDefault } = this.props;

    if (enumDefault === 1) {
      return false;
    }

    let foregroundColor = '#f44336';
    if (score >= 5 && score <= 7) {
      foregroundColor = '#fed156';
    } else if (score >= 8) {
      foregroundColor = '#4caf50';
    }

    return foregroundColor;
  };

  renderContent() {
    const { disabled, value = 0, enumDefault } = this.props;

    return (
      <div className={cx('customFormControlBox customFormButton flexRow', { controlDisabled: disabled })}>
        {enumDefault !== 1 && (
          <span className="mRight12" style={{ width: 35, color: disabled ? '#c1c1c1' : '#333' }}>
            {(value || 0) > 10 ? 10 : value}/10
          </span>
        )}
        <div className="flex">
          <Score
            type={enumDefault === 1 ? 'star' : 'line'}
            score={parseInt(value)}
            foregroundColor={enumDefault === 1 ? '#fed156' : this.getLineColor(parseInt(value))}
            backgroundColor={disabled ? '#eaeaea' : '#bdbdbd'}
            disabled={disabled || browserIsMobile()}
            hover={this.getLineColor}
            callback={this.onChange}
            count={enumDefault === 1 ? 5 : 10}
          />
        </div>
      </div>
    );
  }

  render() {
    const { disabled, value = 0, enumDefault } = this.props;
    const data =
      enumDefault === 1
        ? [
            { label: _l('1星'), value: 1 },
            { label: _l('2星'), value: 2 },
            { label: _l('3星'), value: 3 },
            { label: _l('4星'), value: 4 },
            { label: _l('5星'), value: 5 },
          ]
        : [
            { label: _l('1级'), value: 1 },
            { label: _l('2级'), value: 2 },
            { label: _l('3级'), value: 3 },
            { label: _l('4级'), value: 4 },
            { label: _l('5级'), value: 5 },
            { label: _l('6级'), value: 6 },
            { label: _l('7级'), value: 7 },
            { label: _l('8级'), value: 8 },
            { label: _l('9级'), value: 9 },
            { label: _l('10级'), value: 10 },
          ];

    if (browserIsMobile()) {
      return (
        <Picker
          disabled={disabled}
          data={data}
          value={[parseInt(value)]}
          cols={1}
          onChange={([val]) => this.onChange(val)}
        >
          {this.renderContent()}
        </Picker>
      );
    }

    return this.renderContent();
  }
}
