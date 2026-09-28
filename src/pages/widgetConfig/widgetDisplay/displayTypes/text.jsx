import React from 'react';
import _ from 'lodash';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { CommonDisplay } from '../../styled';

export default function Text({ data }) {
  const { hint, enumDefault } = data;
  const minHeight = getAdvanceSetting(data, 'minheight') || 90;

  return (
    <CommonDisplay style={_.includes([1, 3], enumDefault) ? { height: minHeight, alignItems: 'baseline' } : {}}>
      <div className="hint overflow_ellipsis">{hint}</div>
    </CommonDisplay>
  );
}
