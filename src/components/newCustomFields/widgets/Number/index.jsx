import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';

export default class Widgets extends Component {
  static propTypes = {
    type: PropTypes.number,
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    dot: PropTypes.number,
    unit: PropTypes.string,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
    advancedSetting: PropTypes.object,
  };

  state = {
    isEditing: false,
  };

  onChange = event => {
    let value = event.target.value
      .replace(/[^-\d.]/g, '')
      .replace(/^\./g, '')
      .replace(/^-/, '$#$')
      .replace(/-/g, '')
      .replace('$#$', '-')
      .replace(/^-\./, '-')
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.');

    if (value === '.') {
      value = '';
    }

    this.number.value = value;
    this.props.onChange(value);
  };

  onBlur = () => {
    let { value, dot } = this.props;
    this.setState({ isEditing: false });

    if (value === '-') {
      value = '';
    } else if (value) {
      value = parseFloat(value).toFixed(dot);
    }

    this.props.onChange(value);
    if (navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0) {
      // 处理微信webview键盘收起 网页未撑开
      window.scrollTo(0, 0);
    }
  };

  render() {
    let { value } = this.props;
    const { type, disabled, hint, dot, unit, enumDefault, advancedSetting } = this.props;
    const { isEditing } = this.state;
    const prefix = advancedSetting.prefix;
    const suffix = advancedSetting.suffix || unit;

    if (!isEditing) {
      const number = value ? parseFloat(value).toFixed(dot) : '';

      if (type !== 6 || enumDefault !== 1) {
        const reg = number.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
        value = number.replace(reg, '$1,');
      }

      return (
        <div
          className={cx('customFormControlBox LineHeight36 flexRow', { controlDisabled: disabled })}
          onClick={() => !disabled && this.setState({ isEditing: true })}
        >
          {prefix && (
            <div className="ellipsis Font13 mRight15" style={{ maxWidth: 80 }}>
              {prefix}
            </div>
          )}

          <div className={cx('flex ellipsis', { Gray_bd: !value })}>
            {value || hint}
            {value ? suffix : ''}
          </div>

          {!value && (
            <div className="ellipsis Font13" style={{ maxWidth: 80 }}>
              {suffix}
            </div>
          )}
        </div>
      );
    }

    return (
      <Fragment>
        <input
          type="text"
          className="customFormControlBox Gray"
          style={{ paddingRight: suffix ? 92 : 12, paddingTop: 1 }}
          ref={number => {
            this.number = number;
          }}
          autoFocus
          placeholder={hint}
          disabled={disabled}
          defaultValue={value}
          maxLength={16}
          onBlur={this.onBlur}
          onChange={this.onChange}
        />
        {suffix && (
          <div className="ellipsis Gray_9e Font13" style={{ maxWidth: 80, position: 'absolute', top: 9, right: 13 }}>
            {suffix}
          </div>
        )}
      </Fragment>
    );
  }
}
