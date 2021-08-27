import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { CityPicker, Icon, MobileCityPicker } from 'ming-ui';
import cx from 'classnames';
import { FROM } from '../../tools/config';
import { browserIsMobile } from 'src/util';

const HINT_TEXT = {
  19: _l('省'),
  23: _l('省-市'),
  24: _l('省-市-县'),
};

export default class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    type: PropTypes.number,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
  }

  onChange = data => {
    const code = data[data.length - 1].id;
    const name = data.map(item => item.name).join(' / ');
    this.props.onChange(JSON.stringify({ code, name }));
  };

  render() {
    const { disabled, type, from, value, onChange } = this.props;

    let city;
    try {
      city = JSON.parse(value);
    } catch (err) {}

    const Comp = browserIsMobile() ? MobileCityPicker : CityPicker;

    return (
      <Comp
        level={type === 19 ? 1 : type === 23 ? 2 : 3}
        disabled={disabled}
        callback={this.onChange}
        onClear={() => onChange('')}
      >
        <button
          type="button"
          className={cx('customFormControlBox customFormButton flexRow', { controlDisabled: disabled })}
          disabled={disabled}
        >
          <span className={cx('flex mRight20 ellipsis', { Gray_bd: !city })}>{city ? city.name : HINT_TEXT[type]}</span>
          {!disabled && (
            <Fragment>
              {!!city && !_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && (
                <Icon
                  icon="workflow_cancel"
                  className="Font12 Gray_9e customFormButtoDel"
                  onClick={e => {
                    onChange('');
                    e.stopPropagation();
                  }}
                />
              )}
              <Icon
                icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'sp_pin_drop_white'}
                className="Font16 Gray_bd"
              />
            </Fragment>
          )}
        </button>
      </Comp>
    );
  }
}
