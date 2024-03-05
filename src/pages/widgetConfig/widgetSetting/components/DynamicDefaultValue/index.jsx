import React, { useEffect } from 'react';
import Components from './inputTypes';
import SubSheet from './inputTypes/SubSheet';
import { getControlType, dealIds } from './util';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import { DEFAULT_TYPES } from './config';
import { Tooltip } from 'ming-ui';
import _ from 'lodash';
import cx from 'classnames';

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
  TimeInput,
  RoleInput,
  RichInput,
  ArrayInput,
  ObjectInput,
  AttachmentInput,
} = Components;

const TYPE_TO_COMP = {
  text: TextInput,
  number: NumberInput,
  phone: PhoneInput,
  email: EmailInput,
  cred: EmailInput,
  department: DepartmentInput,
  date: DateInput,
  user: UserInput,
  relateSheet: RelateSheet,
  score: ScoreInput,
  option: OptionInput,
  area: AreaInput,
  subList: SubSheet,
  switch: SwitchInput,
  time: TimeInput,
  role: RoleInput,
  cascader: RelateSheet,
  richtext: RichInput,
  array: ArrayInput,
  array_object: ObjectInput,
  attachment: AttachmentInput,
};

export default function DynamicDefaultValue(props) {
  const { data, allControls, onChange, queryConfig = {}, from, updateQueryConfigs, hideTitle } = props;
  const { enumDefault, advancedSetting = {} } = data;
  const type = getControlType(data);
  const showtype = advancedSetting.showtype || String(enumDefault);
  if (!type) return null;

  const Comp = TYPE_TO_COMP[type];

  const dynamicValue = dealIds(data.type, getAdvanceSetting(data, 'defsource') || []);
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
    <SettingItem className={cx({ mTop0: hideTitle })}>
      {!hideTitle && (
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
      )}
      <Comp
        {...props}
        data={data}
        controls={allControls}
        dynamicValue={dynamicValue}
        defaultType={defaultType}
        dynamicData={dynamicData}
        clearOldDefault={clearOldDefault}
        onDynamicValueChange={handleDynamicValueChange}
        {...(from === 'subList' ? { fromCondition: 'relateSheet' } : {})}
      />
    </SettingItem>
  );
}
