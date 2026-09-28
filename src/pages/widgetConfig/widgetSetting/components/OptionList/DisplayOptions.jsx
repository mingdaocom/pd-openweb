import React, { Fragment, useEffect, useState } from 'react';
import { Select } from 'ming-ui/antd-components';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { isCustomWidget } from 'src/utils/domain/control/metadata';
import { SettingItem } from '../../../styled';

const MULTI_SELECT_DISPLAY = [
  {
    value: '2',
    label: _l('横向排列'),
  },
  {
    value: '1',
    label: _l('纵向排列'),
  },
  {
    value: '0',
    label: _l('矩阵排列'),
  },
];

export default function DisplayOptions({ data, onChange }) {
  const { direction = '2', width = '200' } = getAdvanceSetting(data);
  const [tempWidth, setTempWidth] = useState(width);

  useEffect(() => {
    if (width !== tempWidth) {
      setTempWidth(width);
    }
  }, [width]);

  return (
    <Fragment>
      <SettingItem $hide={isCustomWidget(data)}>
        <div className="settingItemTitle">{_l('排列方式')}</div>
        <Select
          className="w100"
          value={direction}
          options={MULTI_SELECT_DISPLAY}
          onChange={value => onChange(handleAdvancedSettingChange(data, { direction: value }))}
        />
      </SettingItem>
      {direction === '0' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('标签长度')}</div>
          <div className="labelWrap flexCenter">
            <InputValue
              className="mRight12 Width180"
              type={2}
              value={tempWidth.toString()}
              onChange={setTempWidth}
              onBlur={value => {
                if (value < 80) {
                  value = 80;
                }

                setTempWidth(value);
                onChange(handleAdvancedSettingChange(data, { width: value }));
              }}
            />
            <span>px</span>
          </div>
        </SettingItem>
      )}
    </Fragment>
  );
}
