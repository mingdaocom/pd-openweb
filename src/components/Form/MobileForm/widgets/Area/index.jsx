import React, { memo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { CityPicker, Icon } from 'ming-ui';
import { getAreaHintText } from 'src/pages/widgetConfig/util/setting';

const Area = props => {
  const { disabled, value, advancedSetting = {}, recordId, controlId, formDisabled, enumDefault2, projectId } = props;
  const { anylevel, chooserange = 'CN', commcountries } = advancedSetting;
  const city = value ? JSON.parse(value) : null;

  const onChange = data => {
    const last = _.last(data);
    const index = last.path.split('/').length;

    // 必须选择最后一级
    if (anylevel === '1' && !last.last && enumDefault2 < index) {
      return;
    }

    props.onChange(JSON.stringify({ code: last.id, name: last.path }));
  };

  const getShowText = () => {
    if (city) return city.name;

    return getAreaHintText(props);
  };

  return (
    <CityPicker
      id={`customFields-cityPicker-${controlId}-${recordId}`}
      defaultValue={city ? city.name : ''}
      level={enumDefault2}
      chooserange={chooserange}
      commcountries={commcountries}
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
