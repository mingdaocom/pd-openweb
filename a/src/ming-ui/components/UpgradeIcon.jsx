import React from 'react';
import Tooltip from './Tooltip';

export default function UpgradeIcon(props) {
  const { className } = props;

  return (
    <Tooltip popupPlacement="right" text={<span>{_l('当前版本无法使用此功能，请购买或者升级')}</span>}>
      <i className={`icon-auto_awesome Font16 mLeft6 Hand ${className}`} style={{ color: '#fdb432' }} />
    </Tooltip>
  );
}
