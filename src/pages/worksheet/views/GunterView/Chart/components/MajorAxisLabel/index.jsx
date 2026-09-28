import React from 'react';
import styled from 'styled-components';
import { PERIOD_TYPE } from 'worksheet/views/GunterView/config';

const AxisLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  background: var(--color-background-primary);
`;
const isGunterExport = location.href.includes('gunterExport');

function getLabelName(item, periodType) {
  const [, m] = item.time.split('-');

  if (m === '01' || ![PERIOD_TYPE.day, PERIOD_TYPE.week].includes(periodType) || isGunterExport) {
    return item.time;
  }

  return m;
}

function MajorAxisLabel(props) {
  const { item, periodType, hiddenTime } = props;
  const hidden = !isGunterExport && item.time === hiddenTime;

  return (
    <AxisLabel
      style={{
        width: item.width,
      }}
    >
      {hidden ? null : getLabelName(item, periodType)}
    </AxisLabel>
  );
}

export default MajorAxisLabel;
