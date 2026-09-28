import React, { Fragment } from 'react';
import _ from 'lodash';
import { Select } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { isCustomWidget } from 'src/utils/domain/control/metadata';
import { SettingItem } from '../../styled';
import DisplayOptions from '../components/OptionList/DisplayOptions';
import SelectOptions from '../components/OptionList/SelectOptions';

const OPTIONS_DISPLAY = [
  {
    value: '0',
    label: _l('下拉菜单'),
    type: 11,
  },
  {
    value: '1',
    label: _l('平铺'),
    type: 9,
  },
  {
    value: '2',
    label: _l('进度'),
    type: 11,
  },
];

export default function FlatMenu(props) {
  const { data, onChange, globalSheetInfo, fromPortal, fromExcel } = props;
  const FILTER_OPTIONS_DISPLAY = fromPortal ? OPTIONS_DISPLAY.filter(i => i.value !== '2') : OPTIONS_DISPLAY;
  const { showtype = '0', readonlyshowall } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem $hide={isCustomWidget(data)}>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <div className="labelWrap">
          <Select
            className="w100"
            options={FILTER_OPTIONS_DISPLAY}
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
