import React, { useEffect, useRef } from 'react';
import { InputNumber } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';

export default function AttachmentConfig({ data = {}, minCount = 1, maxNum, onChange, attr }) {
  const maxcount = getAdvanceSetting(data, attr);
  const maximum = maxNum || (data.type === 28 ? 10 : 20);
  const inputMaximum = data.type === 50 ? undefined : maximum;
  const pendingValue = useRef(maxcount);

  useEffect(() => {
    pendingValue.current = maxcount;
  }, [maxcount]);

  const dealValue = value => {
    const parsedValue = parseFloat(value);
    if (!value) return minCount;
    const fixedValue = Number(parsedValue).toFixed(0);
    const compareData = data.type === 50 ? fixedValue : Math.min(maximum, fixedValue);
    return Math.max(minCount, compareData);
  };

  const commitValue = value => {
    const nextValue = dealValue(value);
    pendingValue.current = nextValue;
    onChange(handleAdvancedSettingChange(data, { [attr]: nextValue }));
  };

  return (
    <InputNumber
      key={maxcount}
      defaultValue={maxcount}
      min={minCount}
      max={inputMaximum}
      precision={0}
      onChange={value => {
        pendingValue.current = value;
      }}
      onBlur={() => commitValue(pendingValue.current)}
      onStep={commitValue}
    />
  );
}
