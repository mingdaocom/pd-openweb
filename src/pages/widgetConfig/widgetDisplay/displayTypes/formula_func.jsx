import React from 'react';
import { CommonDisplay } from '../../styled';
import { getAdvanceSetting } from '../../util';

export default function FormulaFunc({ data }) {
  const { hint } = data;
  const { prefix, suffix } = getAdvanceSetting(data);
  return (
    <CommonDisplay>
      {prefix && <div className="prefix unit">{prefix}</div>}
      <div className="hint">{hint}</div>
      {suffix && <div className="unit">{suffix}</div>}
    </CommonDisplay>
  );
}
