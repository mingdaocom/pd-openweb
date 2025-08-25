import React, { Fragment } from 'react';
import _ from 'lodash';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';
import { isCustomWidget } from '../../util';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import DisplayOptions from '../components/OptionList/DisplayOptions';
import SelectOptions from '../components/OptionList/SelectOptions';

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
  const { showtype = '0', readonlyshowall } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem hide={isCustomWidget(data)}>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <div className="labelWrap">
          <Dropdown
            border
            data={FILTER_OPTIONS_DISPLAY}
            value={showtype}
            onChange={value => {
              onChange({
                ...handleAdvancedSettingChange(data, {
                  showtype: value,
                  allowadd: '0',
                  readonlyshowall: value === '1' ? readonlyshowall : '',
                }),
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
        <SelectOptions data={data} globalSheetInfo={globalSheetInfo} onChange={onChange} fromPortal={fromPortal} />
      )}
    </Fragment>
  );
}
