import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import _ from 'lodash';
import styled from 'styled-components';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

const TelPhoneWrap = styled.div`
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
    from: PropTypes.number,
  };

  state = {
    originValue: '',
    isEditing: false,
    maskStatus: _.get(this.props, 'advancedSetting.datamask') === '1',
  };

  componentWillReceiveProps(nextProps, nextState) {
    if (this.text && nextProps.value !== this.text.value) {
      this.text.value = nextProps.value || '';
    }
    if (nextProps.flag !== this.props.flag) {
      this.setState({ maskStatus: _.get(nextProps, 'advancedSetting.datamask') === '1' });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !_.isEqual(_.pick(nextProps, ['value', 'disabled']), _.pick(this.props, ['value', 'disabled'])) ||
      !_.isEqual(_.pick(nextState, ['isEditing', 'maskStatus']), _.pick(this.state, ['isEditing', 'maskStatus']))
    ) {
      return true;
    }
    return false;
  }

  onFocus = e => {
    this.setState({ originValue: e.target.value.trim(), isEditing: true });
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  onChange = _.debounce(event => {
    const value = event.target.value;
    this.props.onChange(value);
  }, 300);

  getShowValue = () => {
    const value = this.text ? (this.text.value || '').replace(/ /g, '') : this.props.value || '';
    if (value) {
      return this.state.maskStatus ? dealMaskValue({ ...this.props, value }) : value;
    }
    return this.props.hint;
  };

  render() {
    const { disabled, hint, value, onBlur, onChange, from, maskPermissions } = this.props;
    const { originValue, isEditing, maskStatus } = this.state;
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
        <TelPhoneWrap isEditing={isEditing}>
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
        </TelPhoneWrap>
      </Fragment>
    );
  }
}
