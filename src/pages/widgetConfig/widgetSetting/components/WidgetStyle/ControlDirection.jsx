import React from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { DisplayMode, SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';

const DISPLAY_TYPE = [
  { value: '0', text: _l('常规'), img: 'table_chart_horizontal' },
  { value: '1', text: _l('行列转置'), img: 'table_chart' },
];

export default function ControlDirection(props) {
  const { data, onChange } = props;
  const { direction = '0', layercontrolid, freezeids, titlewrap } = getAdvanceSetting(data);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('类型')}</div>
      <DisplayMode>
        {DISPLAY_TYPE.map(item => {
          const isActive = direction === item.value;
          return (
            <div
              className={cx('displayItem', { active: isActive })}
              onClick={() => {
                if (isActive) return;
                if (data.type === 34) {
                  onChange(
                    handleAdvancedSettingChange(data, {
                      direction: item.value,
                      showtype: '2',
                      blankrow: '0',
                      rownum: '15',
                      ...(freezeids ? { freezeids: '' } : {}),
                      ...(layercontrolid ? { layercontrolid: '' } : {}),
                      ...(titlewrap ? { titlewrap: '0' } : {}),
                    }),
                  );

                  return;
                }
                onChange(
                  handleAdvancedSettingChange(data, {
                    direction: item.value,
                    sheettype: '1',
                    ...(freezeids ? { freezeids: '' } : {}),
                    ...(layercontrolid ? { layercontrolid: '' } : {}),
                    ...(titlewrap ? { titlewrap: '0' } : {}),
                  }),
                );
              }}
            >
              <div className="mBottom4">
                <Icon icon={item.img} className="Font30" />
              </div>
              <span className="text">{item.text}</span>
            </div>
          );
        })}
      </DisplayMode>
    </SettingItem>
  );
}
