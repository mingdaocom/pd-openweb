import React, { useEffect, useRef } from 'react';
import { InputNumber } from 'ming-ui/antd-components';

export default function NumInput(props) {
  const { maxNum, minNum, onBlur, onChange, onStep, value, ...restProps } = props;
  const pendingValue = useRef(value);

  useEffect(() => {
    pendingValue.current = value;
  }, [value]);

  const changeNum = num => {
    pendingValue.current = num;
    onChange(num);
  };

  const handleBlur = event => {
    const parsedValue = Number(pendingValue.current);
    const nextValue = Number.isFinite(parsedValue) ? Math.min(maxNum, Math.max(minNum, parsedValue)) : minNum;

    changeNum(nextValue);
    onBlur?.(event);
  };

  return (
    <InputNumber
      key={value}
      {...restProps}
      defaultValue={value}
      min={minNum}
      max={maxNum}
      precision={0}
      onChange={nextValue => {
        pendingValue.current = nextValue;
      }}
      onBlur={handleBlur}
      onStep={(nextValue, info) => {
        changeNum(nextValue);
        onStep?.(nextValue, info);
      }}
    />
  );
}
