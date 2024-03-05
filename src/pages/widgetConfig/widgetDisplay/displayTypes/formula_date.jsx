import React from 'react';
import { CommonDisplay } from '../../styled';
import { getAdvanceSetting } from '../../util';

const UNIT_TO_TEXT = {
  '1': _l('分钟'),
  '2': _l('小时'),
  '3': _l('天'),
  '4': _l('月'),
  '5': _l('年'),
};

export default function FormulaDate({ data }) {
  const { hint, unit, enumDefault } = data;
  const { prefix, suffix } = getAdvanceSetting(data);

  const isHaveSuffix = () => {
    if (prefix || enumDefault === 2) return false;
    return unit || suffix;
  };

  return (
    <CommonDisplay>
      {prefix && <div className="prefix unit">{prefix}</div>}
      <div className="hint">{hint}</div>
      {isHaveSuffix() && <div className="unit">{suffix || UNIT_TO_TEXT[unit]}</div>}
    </CommonDisplay>
  );
}
