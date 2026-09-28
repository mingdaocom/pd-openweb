import React from 'react';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { UNIT_TO_TEXT } from 'src/utils/domain/control/setting';
import { CommonDisplay } from '../../styled';

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
