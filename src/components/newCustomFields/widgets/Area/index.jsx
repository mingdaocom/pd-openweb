import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { CityPicker, Icon, Input } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import { FROM } from '../../tools/config';

const HINT_TEXT = {
  1: _l('省'),
  2: _l('省-市'),
  3: _l('省-市-县'),
};

const SPECIAL_HINT_TEXT = {
  1: _l('市'),
  2: _l('市-县'),
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
    const { advancedSetting = {}, enumDefault, enumDefault2 } = this.props;
    const { anylevel } = advancedSetting;
    const last = _.last(data);
    this.state.search && this.setState({ search: undefined, keywords: '' });

    const index = last.path.split('/').length;

    // 必须选择最后一级
    if (anylevel === '1' && !last.last && (enumDefault === 1 ? true : enumDefault2 > index)) {
      return;
    }

    this.props.onChange(JSON.stringify({ code: last.id, name: last.path }));
  };

  onFetchData = _.debounce(keywords => {
    this.setState({ keywords });
  }, 500);

  render() {
    const {
      disabled,
      type,
      from,
      value,
      onChange,
      advancedSetting,
      recordId,
      controlId,
      enumDefault2,
      enumDefault,
      projectId,
    } = this.props;
    const { anylevel, chooserange = 'CN' } = advancedSetting || {};
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
        level={enumDefault2}
        chooserange={chooserange}
        disabled={disabled}
        mustLast={anylevel === '1'}
        callback={this.onChange}
        projectId={projectId}
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
            placeholder={
              city
                ? city.name
                : enumDefault === 1 || !_.includes(['CN', 'TW', 'MO', 'HK'], chooserange)
                  ? _l('请选择')
                  : _.includes(['TW', 'MO', 'HK'], chooserange)
                    ? SPECIAL_HINT_TEXT[enumDefault2]
                    : HINT_TEXT[enumDefault2]
            }
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
