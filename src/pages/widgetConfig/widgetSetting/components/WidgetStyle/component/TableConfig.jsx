import React, { Fragment } from 'react';
import cx from 'classnames';
import { Icon, RadioGroup } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { DisplayMode, SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import WidgetRowHeight from '../../WidgetRowHeight';

const DIRECTION_DISPLAY_TYPE = [
  { value: '0', text: _l('常规'), img: 'table_chart_horizontal' },
  { value: '1', text: _l('行列转置'), img: 'table_chart' },
];

const SHEETTYPE_DISPLAY_LIST = [
  {
    text: _l('经典模式'),
    value: '0',
  },
  {
    text: _l('电子表格模式'),
    value: '1',
  },
];

export default function TableConfig(props) {
  const { data, onChange } = props;
  const {
    direction = '0',
    layercontrolid,
    freezeids,
    titlewrap,
    sheettype: sheettypeFromSetting,
  } = getAdvanceSetting(data);
  const sheettype = sheettypeFromSetting === undefined ? (data.type === 34 ? '1' : '0') : sheettypeFromSetting;

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <DisplayMode>
          {DIRECTION_DISPLAY_TYPE.map(item => {
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

      <SettingItem>
        <div className="settingItemTitle">
          {_l('交互方式')}{' '}
          <Tooltip
            placement="bottom"
            title={
              <span>
                {_l('经典模式：点整行打开记录')}
                <br />
                {_l('电子表格模式：点单元格选中字段，按空格键打开记录')}
              </span>
            }
          >
            <i className="icon-help textTertiary Font16"></i>
          </Tooltip>
        </div>
        <RadioGroup
          size="middle"
          checkedValue={sheettype}
          data={SHEETTYPE_DISPLAY_LIST}
          onChange={value => onChange(handleAdvancedSettingChange(data, { sheettype: value }))}
        />
      </SettingItem>

      <WidgetRowHeight {...props} />
    </Fragment>
  );
}
