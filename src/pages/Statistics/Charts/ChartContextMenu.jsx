import React from 'react';
import { Icon } from 'ming-ui';

export const getChartContextMenuItems = () => [
  {
    key: 'autoLinkage',
    icon: <Icon icon="link1" className="textTertiary Font20" style={{ transform: 'rotateZ(-45deg)' }} />,
    label: _l('联动'),
  },
  {
    key: 'viewOriginalData',
    icon: <Icon icon="table" className="textTertiary Font18" />,
    label: _l('查看原始数据'),
  },
];

export const chartContextMenuProps = {
  style: { width: 160 },
};
