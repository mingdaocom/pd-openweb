import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { FROM } from '../../tools/config';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

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

  componentWillReceiveProps(nextProps, nextState) {
    if (this.text && nextProps.value !== this.text.value) {
      this.text.value = nextProps.value || '';
    }
  }

  onFocus = e => {
    this.setState({ originValue: e.target.value.trim(), isEditing: true });
  };

  onChange = event => {
    const value = event.target.value;
    this.props.onChange(value);
  };

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
