import React from 'react';
import { UNIT_TO_TEXT } from '../../config/setting';
import { CommonDisplay } from '../../styled';
import { getAdvanceSetting } from '../../util';

export default function FormulaDate({ data }) {
  const { hint, unit, enumDefault } = data;
  const { prefix, suffix } = getAdvanceSetting(data);

  const isHaveSuffix = () => {
    if (prefix || enumDefault === 2) return false;
    return suffix || unit;
  };

  return (
    <CommonDisplay>
      {prefix && <div className="prefix unit">{prefix}</div>}
      <div className="hint">{hint}</div>
      {isHaveSuffix() && <div className="unit">{suffix || UNIT_TO_TEXT[unit]}</div>}
    </CommonDisplay>
  );
}
