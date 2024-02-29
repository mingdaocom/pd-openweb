import React, { Fragment } from 'react';
import { string } from 'prop-types';
import { Dropdown, RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import OptionList from '../components/OptionList';
import DisplayOptions from '../components/OptionList/DisplayOptions';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

const OPTIONS_DISPLAY = [
  {
    value: '1',
    text: _l('下拉菜单'),
  },
  {
    value: '0',
    text: _l('平铺'),
  },
];
export default function MultiSelect(props) {
  const { data, onChange, globalSheetInfo, fromPortal, fromExcel } = props;
  const { checktype = '0' } = getAdvanceSetting(data);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <RadioGroup
          size="middle"
          checkedValue={checktype}
          data={OPTIONS_DISPLAY}
          onChange={type => {
            if (type !== checktype) {
              onChange(handleAdvancedSettingChange(data, { checktype: type, allowadd: '0' }));
            }
          }}
        />
      </SettingItem>

      {checktype !== '1' && <DisplayOptions {...props} />}

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
