import React from 'react';
import CellControl from 'worksheet/components/CellControls';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { Checkbox, Switch, Radio } from 'ming-ui';
import { getSwitchItemNames } from 'src/pages/widgetConfig/util';
import _ from 'lodash';

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

export const renderContent = data => {
  const { value, advancedSetting = {} } = data;
  const { showtype } = advancedSetting;
  const itemnames = getSwitchItemNames(data);
  const isChecked = '1' === value + '';
  if (showtype === '1') {
    const text = isChecked ? _.get(itemnames[0], 'value') : _.get(itemnames[1], 'value');
    return (
      <div className="flexCenter">
        <Switch checked={isChecked} size="small" />
        {text && <span className="mLeft6">{text}</span>}
      </div>
    );
  }
  if (showtype === '2') {
    return (
      <div className="ming RadioGroup">
        {itemnames.map((o, index) => {
          return <Radio text={o.value} value={o.key} key={index} checked={`${value}` === o.key} size={'middle'} />;
        })}
      </div>
    );
  }
  return <Checkbox className="TxtCenter InlineBlock Hand" text={''} checked={isChecked} />;
};

export const renderText = o => {
  if ([1, 2, 23].includes(o.type)) {
    return renderCellText({ ...o });
  } else {
    return <CellControl cell={{ ...o }} from={4} mode="portal" />;
  }
};
