import React from 'react';
import { Checkbox } from 'ming-ui';
import { SettingItem } from '../../../styled';
import { handleAdvancedSettingChange } from '../../../util/setting';
import _ from 'lodash';

export default function NumberConfig(props) {
  const { data, onChange } = props;
  const { type, enumDefault, advancedSetting: { numshow, thousandth } = {} } = data;
  const isNumShow = _.includes([6, 31], type) || (type === 37 && _.includes([1, 2, 3, 5], enumDefault));

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('设置')}</div>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={thousandth !== '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { thousandth: checked ? '1' : '0' }))}
          text={_l('显示千分位')}
        />
      </div>
      {isNumShow && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={numshow === '1'}
            onClick={checked =>
              onChange(
                handleAdvancedSettingChange(data, {
                  suffix: checked ? '' : '%',
                  prefix: '',
                  numshow: checked ? '0' : '1',
                }),
              )
            }
            text={_l('按百分比显示')}
          />
        </div>
      )}
    </SettingItem>
  );
}
