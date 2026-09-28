import React from 'react';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { CommonDisplay } from '../../styled';

export default function SubTotal({ data }) {
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
