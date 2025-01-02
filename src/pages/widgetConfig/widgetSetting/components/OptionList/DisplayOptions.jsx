import React, { Fragment, useEffect, useState } from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../../styled';
import { handleAdvancedSettingChange, getAdvanceSetting } from '../../../util/setting';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import { isCustomWidget } from 'src/pages/widgetConfig/util';

const MULTI_SELECT_DISPLAY = [
  {
    value: '2',
    text: _l('横向排列'),
  },
  {
    value: '1',
    text: _l('纵向排列'),
  },
  {
    value: '0',
    text: _l('矩阵排列'),
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
      <SettingItem hide={isCustomWidget(data)}>
        <div className="settingItemTitle">{_l('排列方式')}</div>
        <Dropdown
          border
          value={direction}
          data={MULTI_SELECT_DISPLAY}
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
