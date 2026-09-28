import React from 'react';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { CommonDisplay } from '../../styled';

export default function FormulaNumber({ data }) {
  const { hint, unit } = data;
  const { prefix, suffix } = getAdvanceSetting(data);
  return (
    <CommonDisplay>
      {prefix && <div className="prefix unit">{prefix}</div>}
      <div className="hint">{hint}</div>
      {(unit || suffix) && <div className="unit">{suffix || unit}</div>}
    </CommonDisplay>
  );
}
