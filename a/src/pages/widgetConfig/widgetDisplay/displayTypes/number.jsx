import React from 'react';
import { CommonDisplay } from '../../styled';
import { Slider } from 'ming-ui';
import NumberUtil from 'src/util/number';
import { getAdvanceSetting, levelSafeParse } from '../../util';
import { get, head } from 'lodash';

export default function FormulaNumber({ data }) {
  const { hint } = data;
  const { showtype, min, max, numinterval, showinput } = getAdvanceSetting(data);

  if (showtype === '2') {
    const itemnames = getAdvanceSetting(data, 'itemnames');
    const itemcolor = getAdvanceSetting(data, 'itemcolor');
    const defaultValue = getAdvanceSetting(data, 'defsource');
    const defValue = get(head(defaultValue), 'staticValue');
    return (
      <Slider
        disabled={true}
        showTip={false}
        itemnames={itemnames}
        itemcolor={itemcolor}
        showInput={showinput === '1'}
        min={NumberUtil.parseFloat(min)}
        max={NumberUtil.parseFloat(max)}
        step={NumberUtil.parseFloat(numinterval)}
        value={levelSafeParse(defValue)}
      />
    );
  }

  return (
    <CommonDisplay>
      <div className="hint overflow_ellipsis">{hint}</div>
    </CommonDisplay>
  );
}
