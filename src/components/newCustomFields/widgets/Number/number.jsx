import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import {
  accMul,
  accDiv,
  accAdd,
  accSub,
  toFixed,
  formatStrZero,
  browserIsMobile,
  formatNumberThousand,
} from 'src/util';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import styled from 'styled-components';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

const NumWrap = styled.span`
  ${props => (props.isMaskReadonly ? 'display: inline-block;' : 'flex: 1;')}
  position: relative;
  .maskIcon {
    right: 0px !important;
  }
`;

const MobileAction = styled.div`
  width: 36px;
  height: 36px;
  text-align: center;
  line-height: 36px;
  cursor: pointer;
  margin-right: ${props => (props.type === 'subtract' ? 6 : 0)}px;
  margin-left: ${props => (props.type === 'add' ? 6 : 0)}px;
  border: 1px solid #e0e0e0;
  .icon {
    color: #2196f3;
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
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  onChange = (event, tempValue) => {
    let { advancedSetting = {} } = this.props;

    let value =
      tempValue ||
      event.target.value
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

    if (this.number) {
      this.number.value = value;
    }

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

    if (window.isWeiXin) {
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

  handleControl = action => {
    let { advancedSetting = {}, value, disabled } = this.props;
    const { numinterval = '1' } = advancedSetting;

    if (!numinterval || disabled) return null;

    if (advancedSetting.numshow === '1' && !isNaN(parseFloat(value))) {
      value = accMul(value, 100);
    }

    if (action === 'add') {
      value = accAdd(parseFloat(value || 0), parseFloat(numinterval));
    } else {
      value = accSub(parseFloat(value || 0), parseFloat(numinterval));
    }
    this.onChange({}, `${value}`);
  };

  renderNumberControl = () => {
    const { advancedSetting = {}, disabled } = this.props;

    if (advancedSetting.showtype !== '3' || disabled) return null;

    return (
      <div className={cx('numberControlBox', { disabled: !advancedSetting.numinterval })}>
        {['add', 'subtract'].map(item => {
          return (
            <div className="iconWrap" onClick={() => this.handleControl(item)}>
              <i className={cx(item === 'add' ? 'icon-arrow-up' : 'icon-arrow-down')} />
            </div>
          );
        })}
      </div>
    );
  };

  renderMobileNumberControl = type => {
    const { advancedSetting = {}, disabled } = this.props;

    if (advancedSetting.showtype !== '3' || disabled) return null;

    return (
      <MobileAction type={type} onClick={() => this.handleControl(type === 'subtract' ? 'subtract' : 'add')}>
        <i className={`icon icon-${type === 'subtract' ? 'minus' : 'add1'}`} />
      </MobileAction>
    );
  };

  render() {
    let { value } = this.props;
    const { type, disabled, hint, dot, unit, enumDefault, advancedSetting = {}, maskPermissions } = this.props;
    const { isEditing, maskStatus } = this.state;
    const { prefix, suffix = unit, thousandth, numshow, showtype } = advancedSetting;
    const isStepNumber = showtype === '3';
    if (numshow === '1' && value) {
      value = accMul(value, 100);
    }

    value = this.getAutoValue(value);

    const isMobile = browserIsMobile();

    if (!isEditing || (isMobile && disabled)) {
      value = value || value === 0 ? this.getAutoValue(toFixed(parseFloat(value), dot)) : '';

      // 数值、金额字段掩码时，不显示千分位
      if (maskStatus && value) {
        value = dealMaskValue({ ...this.props, value });
      } else {
        // 数值兼容老的千分位配置enumDefault
        if (type !== 6 || _.isUndefined(thousandth) ? enumDefault !== 1 : thousandth !== '1') {
          value = formatNumberThousand(value);
        }
      }

      const isMask = maskPermissions && value && maskStatus;

      return (
        <div className="flexCenter flexRow">
          {isMobile && this.renderMobileNumberControl('subtract')}
          <div
            className={cx('customFormControlBox LineHeight36 flexRow flex', { controlDisabled: disabled })}
            onClick={() => !disabled && this.setState({ isEditing: true })}
          >
            {!value && prefix && (
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
              {value ? prefix : ''}
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
          {!isMobile ? this.renderNumberControl() : this.renderMobileNumberControl('add')}
        </div>
      );
    }

    return (
      <div className="flexCenter flexRow">
        {isMobile && this.renderMobileNumberControl('subtract')}
        <input
          type="text"
          className="customFormControlBox Gray flex"
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
          onKeyDown={e => {
            if (isStepNumber && _.includes([38, 40], e.keyCode)) {
              e.preventDefault();
              this.handleControl(e.keyCode === 38 ? 'add' : 'subtract');
            }
          }}
        />
        {suffix && !isMobile && (
          <div
            className="ellipsis Gray_9e Font13"
            style={{
              maxWidth: 80,
              position: 'absolute',
              top: 10,
              right: isStepNumber ? (isMobile ? 42 + 13 : 36 + 13) : 13,
            }}
          >
            {suffix}
          </div>
        )}
        {!isMobile ? this.renderNumberControl() : this.renderMobileNumberControl('add')}
      </div>
    );
  }
}
