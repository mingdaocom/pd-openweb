import React, { useState, useEffect } from 'react';
import Components from './inputTypes';
import { getControlType } from './util';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import DateInput from './inputTypes/DateInput';
import { Tooltip } from 'ming-ui';

const {
  TextInput,
  PhoneInput,
  DepartmentInput,
  EmailInput,
  NumberInput,
  UserInput,
  OptionInput,
  SingleRelateSheet,
  ScoreInput,
} = Components;

const TYPE_TO_COMP = {
  text: TextInput,
  number: NumberInput,
  phone: PhoneInput,
  email: EmailInput,
  department: DepartmentInput,
  date: DateInput,
  user: UserInput,
  relateSheet: SingleRelateSheet,
  score: ScoreInput,
  option: OptionInput,
};

export default function DynamicDefaultValue(props) {
  const { data, allControls, onChange } = props;
  const { dataSource, enumDefault } = data;
  const type = getControlType(data);
  if (!type) return null;
  // 选项集才有默认值
  if (type === 'option' && !dataSource) return null;
  // 部门多选没有动态默认值
  if (type === 'department' && enumDefault === 1) return null;
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
      <div className="settingItemTitle">
        {_l('默认值')}
        {type === 'department' && (
          <Tooltip text={<span>{_l('默认值为成员字段时，取成员所在的主部门')}</span>}>
            <span className="Gray_9e pointer Font15">
              <i className="icon-help"></i>
            </span>
          </Tooltip>
        )}
      </div>
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
