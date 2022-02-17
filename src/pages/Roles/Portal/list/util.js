import React from 'react';
import CellControl from 'worksheet/components/CellControls';
import { renderCellText } from 'worksheet/components/CellControls';
import { Icon, Checkbox, Dialog, Dropdown } from 'ming-ui';

export const pageSize = 20;
export const COLORS = [
  '#F5F5F5',
  '#FDE3EC',
  '#FFF3E0',
  '#E9F5EA',
  '#E0F7FA',
  '#E4F2FE',
  '#F3E4F5',
  '#E7EAF6',
  '#E8EBEC', //
  '#848484',
  '#E91E63',
  '#FF9800',
  '#4CAF50',
  '#00BCD4',
  '#2196F3',
  '#9C26AF',
  '#3F51B5',
  '#455A64', //
];
export const BGTYPE = [_l('颜色'), _l('背景图')];

export const SYSPORTAL = ['name', 'mobilephone', 'avatar', 'firstLoginTime', 'roleid', 'status'];

export const renderText = o => {
  if ([1, 2, 23].includes(o.type)) {
    return renderCellText({ ...o });
  } else {
    if (o.type === 36) {
      return <Checkbox className="TxtCenter InlineBlock Hand" text={''} checked={o.value === '1'} />;
    } else {
      return <CellControl cell={{ ...o }} />;
    }
  }
};
