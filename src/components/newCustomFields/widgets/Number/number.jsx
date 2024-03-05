import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { accMul, accDiv, toFixed, formatStrZero } from 'src/util';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import styled from 'styled-components';

const NumWrap = styled.span`
  ${props => (props.isMaskReadonly ? 'display: inline-block' : 'flex: 1')}
  position: relative
  .maskIcon {
    right: 0px !important;
  }
`;

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
    maskStatus: _.get(this.props, 'advancedSetting.datamask') === '1',
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

  getAutoValue = val => {
    if (_.get(this.props, 'advancedSetting.dotformat') === '1') {
      return formatStrZero(val);
    }
    return val;
  };

  render() {
    let { value } = this.props;
    const { type, disabled, hint, dot, unit, enumDefault, advancedSetting = {}, maskPermissions } = this.props;
    const { isEditing, maskStatus } = this.state;
    const { prefix, suffix = unit, thousandth, numshow } = advancedSetting;
    if (numshow === '1' && value) {
      value = accMul(value, 100);
    }

    value = this.getAutoValue(value);

    if (!isEditing) {
      value = value || value === 0 ? this.getAutoValue(toFixed(parseFloat(value), dot)) : '';

      // 数值、金额字段掩码时，不显示千分位
      if (maskStatus && value) {
        value = dealMaskValue({ ...this.props, value });
      } else {
        // 数值兼容老的千分位配置enumDefault
        if (type !== 6 || _.isUndefined(thousandth) ? enumDefault !== 1 : thousandth !== '1') {
          const reg = value.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
          value = value.replace(reg, '$1,');
        }
      }

      const isMask = maskPermissions && value && maskStatus;

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

          <NumWrap
            isMaskReadonly={disabled && isMask}
            className={cx('ellipsis', {
              maskHoverTheme: disabled && isMask,
              Gray_bd: !value,
            })}
            onClick={() => {
              if (disabled && isMask) this.setState({ maskStatus: false });
            }}
          >
            {value || hint}
            {value ? suffix : ''}
            {isMask && <Icon icon="eye_off" className={cx('Gray_bd', disabled ? 'mLeft7' : 'maskIcon')} />}
          </NumWrap>

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
          style={{ paddingRight: suffix ? 32 : 12, paddingTop: 2 }}
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
          <div className="ellipsis Gray_9e Font13" style={{ maxWidth: 80, position: 'absolute', top: 9, right: 13 }}>
            {suffix}
          </div>
        )}
      </Fragment>
    );
  }
}
