import React, { memo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { CityPicker, Icon } from 'ming-ui';

const HINT_TEXT = {
  1: _l('省'),
  2: _l('省-市'),
  3: _l('省-市-县'),
};

const SPECIAL_HINT_TEXT = {
  1: _l('市'),
  2: _l('市-县'),
};

const Area = props => {
  const {
    disabled,
    type,
    value,
    advancedSetting = {},
    recordId,
    controlId,
    formDisabled,
    enumDefault,
    enumDefault2,
    projectId,
  } = props;
  const { anylevel, chooserange = 'CN' } = advancedSetting;
  const city = value ? JSON.parse(value) : null;

  const onChange = data => {
    const last = _.last(data);
    const index = last.path.split('/').length;

    // 必须选择最后一级
    if (anylevel === '1' && !last.last && (enumDefault === 1 || enumDefault2 > index)) {
      return;
    }

    props.onChange(JSON.stringify({ code: last.id, name: last.path }));
  };

  const getShowText = () => {
    if (city) return city.name;

    if (enumDefault === 1 || !_.includes(['CN', 'TW', 'MO', 'HK'], chooserange)) {
      return _l('请选择');
    }

    return _.includes(['TW', 'MO', 'HK'], chooserange) ? SPECIAL_HINT_TEXT[enumDefault2] : HINT_TEXT[enumDefault2];
  };

  return (
    <CityPicker
      id={`customFields-cityPicker-${controlId}-${recordId}`}
      defaultValue={city ? city.name : ''}
      level={enumDefault2}
      chooserange={chooserange}
      disabled={disabled}
      mustLast={anylevel === '1'}
      callback={onChange}
      projectId={projectId}
      showConfirmBtn={anylevel !== '1'}
      onClear={() => props.onChange('')}
    >
      <div
        className={cx('customFormControlBox flexRow flexCenter', {
          controlEditReadonly: !formDisabled && value && disabled,
          controlDisabled: formDisabled,
        })}
      >
        <span className={cx('flex ellipsis', { customFormPlaceholder: !value })}>{getShowText()}</span>
        {(!disabled || !formDisabled) && <Icon icon="arrow-right-border" className="Font16 Gray_bd" />}
      </div>
    </CityPicker>
  );
};

export default memo(Area);
