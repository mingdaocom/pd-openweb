import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Tooltip } from 'ming-ui';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import { getAdvanceSetting as getAdvanceSettingByKey } from 'src/utils/control';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import { DEFAULT_TYPES } from './config';
import { TYPE_TO_COMP } from './inputTypes';
import { dealIds, getControlType } from './util';

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

  const isDYForFaster =
    (getAdvanceSettingByKey(data, 'defsource') || []).filter(o => ['url', 'dateRange'].includes(o.rcid)).length > 0;
  return (
    <SettingItem className={cx({ mTop0: hideTitle })}>
      {!hideTitle && (
        <div className="settingItemTitle">
          {_l('默认值')}
          {type === 'department' && from !== DYNAMIC_FROM_MODE.FAST_FILTER && (
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
        defaultType={defaultType || isDYForFaster}
        dynamicData={dynamicData}
        clearOldDefault={clearOldDefault}
        onDynamicValueChange={handleDynamicValueChange}
        {...(from === 'subList' ? { fromCondition: 'relateSheet' } : {})}
      />
    </SettingItem>
  );
}
