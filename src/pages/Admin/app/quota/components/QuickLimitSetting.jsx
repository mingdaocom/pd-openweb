import React, { useState } from 'react';
import _ from 'lodash';
import LimitModeInput from './LimitModeInput';

/** 应用/工作表选择弹层底部的快捷额度输入，多个实体统一应用该值。 */
export default function QuickLimitSetting({ businessType, defaultValue, min, max, unit, onChange }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flexRow alignItemsCenter">
      <span className="mRight8">{_l('设置上限：')}</span>
      <LimitModeInput
        className="quickLimitValue"
        businessType={businessType}
        value={value}
        min={min}
        max={max}
        unit={unit}
        onChange={nextValue => {
          if (!_.isNumber(nextValue)) return;
          setValue(nextValue);
          onChange(nextValue);
        }}
      />
    </div>
  );
}
