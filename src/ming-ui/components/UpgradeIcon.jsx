import React from 'react';
import { Tooltip } from 'ming-ui/antd-components';

export default function UpgradeIcon(props) {
  const { className } = props;

  return (
    <Tooltip placement="right" title={_l('当前版本无法使用此功能，请购买或者升级')}>
      <i className={`icon-auto_awesome Font16 mLeft6 Hand ${className}`} style={{ color: '#fdb432' }} />
    </Tooltip>
  );
}
