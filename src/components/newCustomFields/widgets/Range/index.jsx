import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { CustomScore } from 'ming-ui';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.any,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
  };

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  shouldComponentUpdate(nextProps) {
    if (!_.isEqual(_.pick(nextProps, ['value', 'disabled']), _.pick(this.props, ['value', 'disabled']))) {
      return true;
    }
    return false;
  }

  onChange = value => {
    this.props.onChange(value);
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

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
