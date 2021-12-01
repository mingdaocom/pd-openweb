import React, { useEffect } from 'react';
import Components from './inputTypes';
import SubSheet from './inputTypes/SubSheet';
import { getControlType } from './util';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import { DEFAULT_TYPES } from './config';
import { Tooltip } from 'ming-ui';

const {
  TextInput,
  PhoneInput,
  DepartmentInput,
  DateInput,
  EmailInput,
  NumberInput,
  UserInput,
  OptionInput,
  RelateSheet,
  ScoreInput,
  AreaInput,
  SwitchInput,
} = Components;

const TYPE_TO_COMP = {
  text: TextInput,
  number: NumberInput,
  phone: PhoneInput,
  email: EmailInput,
  department: DepartmentInput,
  date: DateInput,
  user: UserInput,
  relateSheet: RelateSheet,
  score: ScoreInput,
  option: OptionInput,
  area: AreaInput,
  subList: SubSheet,
  switch: SwitchInput,
};

export default function DynamicDefaultValue(props) {
  const { data, allControls, onChange, queryConfig = {}, updateQueryConfigs } = props;
  const { dataSource, enumDefault, advancedSetting = {} } = data;
  const type = getControlType(data);
  const showtype = advancedSetting.showtype || String(enumDefault);
  if (!type) return null;
  // 选项集才有默认值
  if (type === 'option' && !dataSource) return null;
  //关联多条列表没有默认值
  if (data.type === 29 && enumDefault === 2 && showtype === '2') return null;
  const Comp = TYPE_TO_COMP[type];

  const dynamicValue = getAdvanceSetting(data, 'defsource') || [];
  //工作表或函数
  const { defaulttype = '' } = getAdvanceSetting(data);
  let defaultType = DEFAULT_TYPES[defaulttype] || '';
  let dynamicData = defaultType ? getAdvanceSetting(data, defaultType) || {} : {};
  //子表自定义类型异化
  if (dynamicValue.length > 0 && type === 'subList' && defaultType === 'dynamiccustom') {
    dynamicData = dynamicValue[0] || {};
  }

  // 更新data
  const handleDynamicValueChange = value => {
    onChange(
      handleAdvancedSettingChange(data, {
        defsource: JSON.stringify(value),
        defaulttype: '',
        defaultfunc: '',
        dynamicsrc: '',
      }),
    );
  };

  const clearOldDefault = (para = { default: '' }) => {
    onChange(para);
  };

  useEffect(() => {
    //清空查询配置
    if (!_.get(dynamicData, 'id') && queryConfig.id) {
      updateQueryConfigs(queryConfig, 'delete');
    }
  }, [defaultType]);

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
        defaultType={defaultType}
        dynamicData={dynamicData}
        clearOldDefault={clearOldDefault}
        onDynamicValueChange={handleDynamicValueChange}
      />
    </SettingItem>
  );
}
