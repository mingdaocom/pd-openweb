import React, { useState, useEffect } from 'react';
import { TextInput, NumberInput, DateInput, UserInput, OptionInput, SingleRelateSheet, ScoreInput } from './inputTypes';
import { getControlType } from './util';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import { includes } from 'lodash';

const TYPE_TO_COMP = {
  text: TextInput,
  number: NumberInput,
  date: DateInput,
  user: UserInput,
  relateSheet: SingleRelateSheet,
  score: ScoreInput,
  option: OptionInput,
};

export default function DynamicDefaultValue(props) {
  const { data, allControls, onChange } = props;
  const { dataSource } = data;
  const type = getControlType(data);
  if (!type) return null;
  // 选项集才有默认值
  if (type === 'option' && !dataSource) return null;
  const Comp = TYPE_TO_COMP[type];

  const dynamicValue = getAdvanceSetting(data, 'defsource') || [];

  // 更新data
  const handleDynamicValueChange = value => {
    onChange(handleAdvancedSettingChange(data, { defsource: JSON.stringify(value) }));
  };

  const clearOldDefault = (para = { default: '' }) => {
    onChange(para);
  };

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('默认值')}</div>
      <Comp
        {...props}
        data={data}
        controls={allControls}
        dynamicValue={dynamicValue}
        clearOldDefault={clearOldDefault}
        onDynamicValueChange={handleDynamicValueChange}
      />
    </SettingItem>
  );
}
