import React, { Fragment, useEffect } from 'react';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import Components from '../components';
import NumberConfig from '../components/ControlSetting/NumberConfig';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import WidgetVerify from '../components/WidgetVerify';

export default function Number(props) {
  const { data, onChange } = props;
  const { numshow, thousandth } = getAdvanceSetting(data);

  useEffect(() => {
    // 初始化用老数据unit覆盖suffix
    if (data.unit) {
      onChange(handleAdvancedSettingChange({ ...data, unit: '' }, { suffix: data.unit }));
    }
    if (_.isUndefined(thousandth)) {
      onChange(handleAdvancedSettingChange(data, { thousandth: data.enumDefault === 1 ? '1' : '0' }));
    }
  }, [data.controlId]);

  return (
    <Fragment>
      <Components.PointerConfig {...props} />
      <DynamicDefaultValue {...props} />
      <WidgetVerify {...props} />
      <NumberConfig {...props} />
      {numshow !== '1' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('单位')}</div>
          <Components.PreSuffix {...props} />
        </SettingItem>
      )}
    </Fragment>
  );
}
