import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { CustomScore } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.any,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
  };

  shouldComponentUpdate(nextProps) {
    if (!_.isEqual(_.pick(nextProps, ['value', 'disabled']), _.pick(this.props, ['value', 'disabled']))) {
      return true;
    }
    return false;
  }

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
