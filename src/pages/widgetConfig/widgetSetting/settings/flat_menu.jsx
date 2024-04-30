import React, { Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';
import OptionList from '../components/OptionList';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import DisplayOptions from '../components/OptionList/DisplayOptions';

const OPTIONS_DISPLAY = [
  {
    value: '0',
    text: _l('下拉菜单'),
    type: 11,
  },
  {
    value: '1',
    text: _l('平铺'),
    type: 9,
  },
  {
    value: '2',
    text: _l('进度'),
    type: 11,
  },
];

export default function FlatMenu(props) {
  const { data, onChange, globalSheetInfo, fromPortal, fromExcel } = props;
  const FILTER_OPTIONS_DISPLAY = fromPortal ? OPTIONS_DISPLAY.filter(i => i.value !== '2') : OPTIONS_DISPLAY;
  const { showtype = '0' } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <div className="labelWrap">
          <Dropdown
            border
            data={FILTER_OPTIONS_DISPLAY}
            value={showtype}
            onChange={value => {
              onChange({
                ...handleAdvancedSettingChange(data, { showtype: value, allowadd: '0' }),
                type: _.get(
                  _.find(OPTIONS_DISPLAY, i => i.value === value),
                  'type',
                ),
                // 进度清除其他选项
                ...(value === '2' ? { options: (data.options || []).filter(i => i.key !== 'other') } : {}),
              });
            }}
          />
        </div>
      </SettingItem>
      <DisplayOptions {...props} />
      {!fromExcel && (
        <OptionList.SelectOptions
          data={data}
          globalSheetInfo={globalSheetInfo}
          onChange={onChange}
          fromPortal={fromPortal}
        />
      )}
    </Fragment>
  );
}
