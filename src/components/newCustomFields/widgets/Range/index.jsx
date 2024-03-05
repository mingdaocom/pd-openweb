import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { CustomScore } from 'ming-ui';
import cx from 'classnames';
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

  renderContent() {
    const { disabled, value = 0, type } = this.props;
    const isMobile = browserIsMobile();
    return (
      <div
        className={cx('customFormControlBox customFormButton flexRow customFormControlScore', {
          controlDisabled: disabled,
        })}
      >
        <CustomScore
          from={isMobile ? '' : 'recordInfo'}
          data={this.props}
          hideText={isMobile ? !disabled : false}
          score={parseInt(value)}
          disabled={disabled}
          callback={this.onChange}
        />
      </div>
    );
  }

  render() {
    return this.renderContent();
  }
}
