import React from 'react';
import { getControlType, dealIds } from './util';
import { TYPE_TO_COMP } from './inputTypes';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import { DEFAULT_TYPES } from './config';
import { Tooltip } from 'ming-ui';
import _ from 'lodash';
import cx from 'classnames';

export default function DynamicDefaultValue(props) {
  const { data, allControls, onChange, from, hideTitle } = props;
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
    let tempValue = value;
    if (_.isArray(value) && _.get(_.last(value), 'cid') === 'empty') {
      tempValue = [{ rcid: '', cid: 'empty', staticValue: '' }];
    } else {
      tempValue = value.filter(i => !(i.cid === 'empty'));
    }
    onChange(
      handleAdvancedSettingChange(data, {
        defsource: JSON.stringify(tempValue),
        defaulttype: '',
        defaultfunc: '',
        dynamicsrc: '',
      }),
    );
  };

  const clearOldDefault = (para = { default: '' }) => {
    onChange(para);
  };

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
