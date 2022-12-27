import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/ControlMask/util';
import styled from 'styled-components';

const IDWrap = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: ${props => (props.isEditing ? 2 : -1)};
`;

export default class Widgets extends Component {
  static propTypes = {
    enumDefault: PropTypes.number,
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  };

  state = {
    originValue: '',
    isEditing: false,
    maskStatus: _.get(this.props, 'advancedSetting.datamask') === '1',
  };

  componentWillReceiveProps(nextProps, nextState) {
    if (this.text && nextProps.value !== this.text.value) {
      this.text.value = this.formatValue(nextProps.value || '');
    }
  }

  formatValue = val => {
    return (val || '').toUpperCase();
  };

  onChange = event => {
    const value = this.formatValue(event.target.value);
    this.props.onChange(value);
  };

  getShowValue = () => {
    const value = this.text ? (this.text.value || '').replace(/ /g, '') : this.props.value || '';
    return this.state.maskStatus && value ? dealMaskValue({ ...this.props, value }) : value;
  };

  render() {
    const { disabled, hint, value, onBlur, onChange, maskPermissions } = this.props;
    const { originValue, isEditing, maskStatus } = this.state;
    const isMask = maskPermissions && value && maskStatus;
    const defaultValue = this.formatValue(value);

    return (
      <Fragment>
        <div
          className={cx(
            'customFormControlBox customFormTextareaBox',
            { Gray_bd: !value },
            { controlDisabled: disabled },
          )}
          onClick={() => {
            if (!disabled) {
              this.setState({ isEditing: true }, () => this.text && this.text.focus());
            }
          }}
        >
          <span
            className={cx({ maskHoverTheme: disabled && isMask })}
            onClick={() => {
              if (disabled && isMask) this.setState({ maskStatus: false });
            }}
          >
            {this.getShowValue()}
            {isMask && <Icon icon="eye_off" className={cx('Gray_bd', disabled ? 'mLeft7' : 'maskIcon')} />}
          </span>
        </div>
        <IDWrap isEditing={isEditing}>
          <input
            type="text"
            className={cx('customFormControlBox', { controlDisabled: disabled })}
            ref={text => {
              this.text = text;
            }}
            placeholder={hint}
            disabled={disabled}
            defaultValue={defaultValue}
            maxLength={18}
            onChange={this.onChange}
            onFocus={e => this.setState({ originValue: e.target.value.trim() })}
            onBlur={event => {
              const newVal = this.formatValue(event.target.value.trim());
              if (newVal !== defaultValue) {
                onChange(newVal);
              }
              this.setState({ isEditing: false });

              onBlur(originValue);
            }}
          />
        </IDWrap>
      </Fragment>
    );
  }
}
