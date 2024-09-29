import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import styled from 'styled-components';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

const EmailWrap = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: ${props => (props.isEditing ? 2 : -1)};
`;

export default class Widgets extends Component {
  static propTypes = {
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

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (this.text && nextProps.value !== this.text.value) {
      this.text.value = nextProps.value || '';
    }
    if (nextProps.flag !== this.props.flag) {
      this.setState({ maskStatus: _.get(nextProps, 'advancedSetting.datamask') === '1' });
    }
  }

  handleFocus = event => {
    this.setState({ originValue: event.target.value.trim() });
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  onChange = event => {
    const value = event.target.value;
    this.props.onChange(value);
  };

  getShowValue = () => {
    const { hint } = this.props;
    const value = this.text ? (this.text.value || '').replace(/ /g, '') : this.props.value || '';
    return this.state.maskStatus && value ? dealMaskValue({ ...this.props, value }) : value || hint;
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  render() {
    const { disabled, hint, value, onBlur, onChange, maskPermissions } = this.props;
    const { originValue, maskStatus, isEditing } = this.state;
    const isMask = maskPermissions && value && maskStatus;

    return (
      <Fragment>
        <div
          className={cx(
            'customFormControlBox',
            { Gray_bd: !value },
            { controlDisabled: disabled },
            { Visibility: isEditing },
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
        <EmailWrap isEditing={isEditing}>
          <input
            type="text"
            className={cx('customFormControlBox', { controlDisabled: disabled })}
            ref={text => {
              this.text = text;
            }}
            placeholder={hint}
            disabled={disabled}
            defaultValue={value}
            onChange={this.onChange}
            onFocus={this.handleFocus}
            onBlur={event => {
              if (event.target.value.trim() !== value) {
                onChange(event.target.value.trim());
              }
              this.setState({ isEditing: false });

              onBlur(originValue);
            }}
          />
        </EmailWrap>
      </Fragment>
    );
  }
}
