import React, { memo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Radio } from 'ming-ui';
import { isLightColor } from 'src/util';
import { getCheckAndOther } from '../../../core/utils';
import OtherInput from '../Checkbox/OtherInput';

const RadioWidget = props => {
  const { disabled, value, advancedSetting = {}, enumDefault2, options, vertical } = props;
  const { direction = '2' } = advancedSetting;
  const { checkIds } = getCheckAndOther(value);
  const displayOptions = options.filter(
    item => !item.isDeleted && (_.includes(checkIds, item.key) || (!item.hide && !disabled)),
  );

  const renderItem = (item, checkIds) => {
    const { otherValue } = getCheckAndOther(value);
    return (
      <span
        className={cx({
          customFormCapsule: enumDefault2 === 1,
          White: enumDefault2 === 1 && !isLightColor(item.color),
        })}
        style={{ background: enumDefault2 === 1 ? item.color : checkIds.length > 1 ? 'var(--gray-f3)' : '' }}
      >
        {otherValue && disabled ? otherValue : item.value}
      </span>
    );
  };

  const onChange = key => {
    const { checkIds } = getCheckAndOther(value);

    if (_.includes(checkIds, key)) {
      key = '';
    }

    props.onChange(JSON.stringify(key ? [key] : []));
  };

  return (
    <div
      className={cx('customFormControlBox customFormControlNoBorder RadioGroupCon', {
        flexColumn: vertical,
        horizonArrangement: direction === '0' || direction === '2',
        verticalArrangement: direction === '1',
      })}
    >
      {displayOptions.map((item, index) => {
        return (
          <div
            className="flexColumn"
            style={{ width: item.key === 'other' && checkIds.includes('other') && !disabled ? '100%' : 'auto' }}
          >
            <Radio
              needDefaultUpdate
              key={index}
              disabled={disabled}
              text={renderItem(item, checkIds)}
              value={item.key}
              checked={_.includes(checkIds, item.key)}
              title={item.value}
              onClick={onChange}
            />
            {!disabled && item.key === 'other' && <OtherInput {...props} isSelect />}
          </div>
        );
      })}
    </div>
  );
};

RadioWidget.propTypes = {
  from: PropTypes.number,
  disabled: PropTypes.bool,
  options: PropTypes.any,
  value: PropTypes.string,
  enumDefault2: PropTypes.number,
  onChange: PropTypes.func,
  advancedSetting: PropTypes.object,
  width: PropTypes.number,
  direction: PropTypes.string,
  vertical: PropTypes.bool,
};

export default memo(RadioWidget, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'width', 'disabled']),
    _.pick(nextProps, ['value', 'width', 'disabled']),
  );
});
