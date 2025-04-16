import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Slider } from 'ming-ui';
import { getAdvanceSetting } from '../../tools/utils';
import Numeric from './Numeric';

const Number = props => {
  const {
    disabled,
    advancedSetting: { showtype, numinterval, showinput, min, max, numshow, datamask },
    value,
    onChange = () => {},
  } = props;

  if (showtype === '2') {
    const itemnames = getAdvanceSetting(props, 'itemnames');
    const itemcolor = getAdvanceSetting(props, 'itemcolor');
    return (
      <Slider
        from="recordInfo"
        inputClassName="controlValueHeight"
        disabled={disabled}
        itemnames={itemnames}
        itemcolor={itemcolor}
        showInput={disabled ? false : showinput === '1'} // h5非编辑状态显示数值
        showAsPercent={numshow === '1'}
        barStyle={{ margin: '15px 0' }}
        min={parseFloat(min)}
        max={parseFloat(max)}
        value={parseFloat(value)}
        step={parseFloat(numinterval)}
        onChange={value => onChange(value)}
      />
    );
  }

  return <Numeric {...props} />;
};

Number.propTypes = {
  disabled: PropTypes.bool,
  advancedSetting: PropTypes.object,
  value: PropTypes.string,
  triggerCustomEvent: PropTypes.func,
  onChange: PropTypes.func,
};

export default memo(Number);
