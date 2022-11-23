import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { accMul, accDiv, toFixed } from 'src/util';

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
    originValue: '',
  };

  onFocus = e => {
    this.setState({ originValue: e.target.value.trim() });
  };

  onChange = event => {
    let { advancedSetting = {} } = this.props;
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

    if (advancedSetting.numshow === '1' && !isNaN(parseFloat(value))) {
      value = accDiv(parseFloat(value), 100);
    }

    this.props.onChange(value);
  };

  onBlur = () => {
    let { value, dot, onChange, onBlur, advancedSetting = {} } = this.props;
    const { originValue } = this.state;
    this.setState({ isEditing: false });

    if (value === '-') {
      value = '';
    } else if (value) {
      value = toFixed(parseFloat(value), advancedSetting.numshow === '1' ? dot + 2 : dot);
    }

    onChange(value);
    onBlur(originValue);

    if (navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0) {
      // 处理微信webview键盘收起 网页未撑开
      window.scrollTo(0, 0);
    }
  };

  render() {
    let { value } = this.props;
    const { type, disabled, hint, dot, unit, enumDefault, advancedSetting = {} } = this.props;
    const { isEditing } = this.state;
    const { prefix, suffix = unit, thousandth, numshow } = advancedSetting;
    if (numshow === '1' && value) {
      value = accMul(value, 100);
    }

    if (!isEditing) {
      value = value || value === 0 ? toFixed(parseFloat(value), dot) : '';
      // 数值兼容老的千分位配置enumDefault
      if (type !== 6 || _.isUndefined(thousandth) ? enumDefault !== 1 : thousandth !== '1') {
        const reg = value.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
        value = value.replace(reg, '$1,');
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
          style={{ paddingRight: suffix ? 92 : 12, paddingTop: 2 }}
          ref={number => {
            this.number = number;
          }}
          autoFocus
          placeholder={hint}
          disabled={disabled}
          defaultValue={value}
          maxLength={16}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={this.onChange}
        />
        {suffix && (
          <div className="ellipsis Gray_9e Font13" style={{ maxWidth: 80, position: 'absolute', top: 11, right: 13 }}>
            {suffix}
          </div>
        )}
      </Fragment>
    );
  }
}
