import React from 'react';
import { CommonDisplay } from '../../styled';
import { getAdvanceSetting } from '../../util';

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
