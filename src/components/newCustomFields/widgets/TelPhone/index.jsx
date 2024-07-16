import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { FROM } from '../../tools/config';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

export default class Widgets extends Component {
  static propTypes = {
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    from: PropTypes.number,
  };

  state = {
    originValue: '',
    isEditing: false,
  };

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (this.text && nextProps.value !== this.text.value) {
      this.text.value = nextProps.value || '';
    }
  }

  onFocus = e => {
    this.setState({ originValue: e.target.value.trim(), isEditing: true });
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  onChange = event => {
    const value = event.target.value;
    this.props.onChange(value);
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  render() {
    const { disabled, hint, value, onBlur, onChange, from } = this.props;
    const { originValue, isEditing } = this.state;

    return (
      <Fragment>
        <input
          type="text"
          className={cx('customFormControlBox', {
            controlDisabled: disabled,
            customFormControlTelPhone: !isEditing && value,
          })}
          ref={text => {
            this.text = text;
          }}
          placeholder={hint}
          disabled={disabled}
          defaultValue={value}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={event => {
            if (event.target.value.trim() !== value) {
              onChange(event.target.value.trim());
            }
            onBlur(originValue);
            this.setState({ isEditing: false });
          }}
        />

        {(_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) || (browserIsMobile() && from === FROM.SHARE)) && !!value && (
          <a
            href={`tel:${value.replace(/-/g, '')}`}
            className="Absolute customFormControlTelBtn"
            style={{ right: 0, top: 10 }}
          >
            <Icon icon="phone22" className="Font16 ThemeColor3" />
          </a>
        )}
      </Fragment>
    );
  }
}
