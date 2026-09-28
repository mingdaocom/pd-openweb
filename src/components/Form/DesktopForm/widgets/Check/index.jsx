import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Checkbox, Radio, Switch } from 'ming-ui/antd-components';
import { getSwitchItemNames } from 'src/utils/domain/control/options';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const CheckWidgets = props => {
  const { disabled, value, onChange, advancedSetting = {}, hint = '', switchSize, formItemId } = props;
  const [isChecked, setIsChecked] = useState(false);

  // 使用 ref 存储最新的值
  const checkRef = useRef(isChecked);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    setIsChecked(value === 1 || value === '1');
  }, [value]);

  useEffect(() => {
    checkRef.current = isChecked;
  }, [isChecked]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleChange = () => {
    const newValue = isChecked ? '0' : '1';
    onChange(newValue);
  };

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;

      switch (triggerType) {
        case 'Enter':
          const newValue = checkRef.current ? '0' : '1';
          onChangeRef.current && onChangeRef.current(newValue);
          break;
        default:
          break;
      }
    }, []),
  );

  const renderContent = () => {
    const itemnames = getSwitchItemNames(props);

    if (advancedSetting.showtype === '1') {
      const text = isChecked ? _.get(itemnames[0], 'value') : _.get(itemnames[1], 'value');
      return (
        <div className="flexCenter w100">
          <Switch
            disabled={disabled}
            checked={isChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
              return handleChange(!checked, event);
            }}
            size={switchSize || 'default'}
            className={cx({ mobileFormSwitchDisabled: disabled })}
          />
          {text && <span className="mLeft6 flex overflow_ellipsis">{text}</span>}
        </div>
      );
    }

    if (advancedSetting.showtype === '2') {
      return (
        <Radio.Group
          size="middle"
          disabled={disabled}
          className="customFormCheck"
          value={`${value}`}
          options={(itemnames.map(item => ({ text: item.value, value: item.key })) || []).map(
            ({ text, ...option }) => ({ ...option, label: text }),
          )}
          onChange={event => handleChange(event.target.value)}
        />
      );
    }

    return (
      <Checkbox
        className="customFormCheck mTop8"
        disabled={disabled}
        checked={isChecked}
        onChange={event => handleChange(!event.target.checked, undefined, event)}
        size={switchSize || 'default'}
      >
        {hint}
      </Checkbox>
    );
  };

  return (
    <div
      className={cx('customFormControlBox customFormButton flexRow customFormControlSwitch', {
        controlDisabled: disabled,
        customFormSwitchColumn: advancedSetting.showtype === '2', // 详情排列格式
      })}
      style={{ height: 'auto' }}
    >
      {renderContent()}
    </div>
  );
};

CheckWidgets.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default memo(CheckWidgets, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'disabled']), _.pick(nextProps, ['value', 'disabled']));
});
