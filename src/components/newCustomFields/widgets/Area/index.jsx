import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Icon, CityPicker, Input } from 'ming-ui';
import cx from 'classnames';
import { FROM } from '../../tools/config';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

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

    this.state = {
      search: undefined,
      keywords: '',
      visible: false,
    };
  }

  onChange = (data, panelIndex) => {
    const { anylevel } = _.get(this.props, 'advancedSetting') || {};
    const last = _.last(data);
    this.state.search && this.setState({ search: undefined, keywords: '' });

    const level = this.props.type === 19 ? 1 : this.props.type === 23 ? 2 : 3;
    const index = last.path.split('/').length;

    // 必须选择最后一级
    if (anylevel === '1' && !last.last && level > index) {
      return;
    }

    this.props.onChange(JSON.stringify({ code: last.id, name: last.path }));
  };

  onFetchData = _.debounce(keywords => {
    this.setState({ keywords });
  }, 500);

  render() {
    const { disabled, type, from, value, onChange, advancedSetting, recordId, controlId } = this.props;
    const { anylevel } = advancedSetting || {};
    const { search, keywords, visible } = this.state;

    let city;
    try {
      city = JSON.parse(value);
    } catch (err) {}

    const isMobile = browserIsMobile();

    return (
      <CityPicker
        id={`customFields-cityPicker-${controlId}-${recordId}`}
        search={keywords}
        defaultValue={city ? city.name : ''}
        level={type === 19 ? 1 : type === 23 ? 2 : 3}
        disabled={disabled}
        mustLast={anylevel === '1'}
        callback={this.onChange}
        destroyPopupOnHide={true}
        showConfirmBtn={anylevel !== '1'}
        onClear={() => {
          onChange('');
          search && this.setState({ search: '', keywords: '' });
        }}
        handleVisible={value => {
          this.setState({ visible: value });
        }}
      >
        <button
          type="button"
          className={cx('customFormControlBox customFormButton flexRow', {
            controlDisabled: disabled,
            mobileCustomFormButton: isMobile,
            Border0: !isMobile && recordId,
          })}
          disabled={disabled}
        >
          <Input
            className={cx('flex minWidth0 mRight20 ellipsis CityPicker-input-textCon')}
            placeholder={city ? city.name : HINT_TEXT[type]}
            value={visible ? search || '' : (city || { name: '' }).name}
            title={(disabled && _.get(city, 'name')) || ''}
            onChange={value => {
              this.setState({ search: value });
              this.onFetchData(value);
            }}
            disabled={disabled}
            readOnly={disabled || isMobile}
          />
          {!disabled && (
            <Fragment>
              {!!city && !_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && (
                <Icon
                  icon="workflow_cancel"
                  className="Font12 Gray_9e customFormButtoDel"
                  onClick={e => {
                    onChange('');
                    this.setState({ search: undefined, keywords: '' });
                    e.stopPropagation();
                  }}
                />
              )}
              <Icon
                icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'text_map'}
                className="Font16 Gray_bd"
              />
            </Fragment>
          )}
        </button>
      </CityPicker>
    );
  }
}
