import React, { memo } from 'react';
import { Icon, CityPicker } from 'ming-ui';
import cx from 'classnames';

const HINT_TEXT = {
  19: _l('省'),
  23: _l('省-市'),
  24: _l('省-市-县'),
};

const Area = props => {
  const { disabled, type, value, advancedSetting = {}, recordId, controlId, formDisabled } = props;
  const { anylevel } = advancedSetting;
  const city = value ? JSON.parse(value) : null;

  const onChange = (data, panelIndex) => {
    const { anylevel } = _.get(props, 'advancedSetting') || {};
    const last = _.last(data);

    const level = type === 19 ? 1 : type === 23 ? 2 : 3;
    const index = last.path.split('/').length;

    // 必须选择最后一级
    if (anylevel === '1' && !last.last && level > index) {
      return;
    }

    props.onChange(JSON.stringify({ code: last.id, name: last.path }));
  };

  return (
    <CityPicker
      id={`customFields-cityPicker-${controlId}-${recordId}`}
      defaultValue={city ? city.name : ''}
      level={type === 19 ? 1 : type === 23 ? 2 : 3}
      disabled={disabled}
      mustLast={anylevel === '1'}
      callback={onChange}
      showConfirmBtn={anylevel !== '1'}
      onClear={() => props.onChange('')}
    >
      <div
        className={cx('customFormControlBox flexRow flexCenter', {
          controlEditReadonly: !formDisabled && value && disabled,
          controlDisabled: formDisabled,
        })}
      >
        <span className={cx('flex ellipsis', { customFormPlaceholder: !value })}>
          {(city || { name: '' }).name || HINT_TEXT[type]}
        </span>
        {(!disabled || !formDisabled) && <Icon icon="arrow-right-border" className="Font16 Gray_bd" />}
      </div>
    </CityPicker>
  );
};

export default memo(Area);
