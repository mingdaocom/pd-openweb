import React, { Fragment } from 'react';
import { Radio } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { isCustomWidget } from 'src/utils/domain/control/metadata';
import { SettingItem } from '../../styled';
import DisplayOptions from '../components/OptionList/DisplayOptions';
import SelectOptions from '../components/OptionList/SelectOptions';

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
  const { checktype = '0', readonlyshowall } = getAdvanceSetting(data);

  return (
    <Fragment>
      <SettingItem $hide={isCustomWidget(data)}>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <Radio.Group
          size="middle"
          value={checktype}
          options={(OPTIONS_DISPLAY || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={event => {
            const type = event.target.value;

            if (type !== checktype) {
              onChange(
                handleAdvancedSettingChange(data, {
                  checktype: type,
                  allowadd: '0',
                  readonlyshowall: type === '1' ? '' : readonlyshowall,
                }),
              );
            }
          }}
        />
      </SettingItem>

      {checktype !== '1' && <DisplayOptions {...props} />}

      {!fromExcel && (
        <SelectOptions data={data} globalSheetInfo={globalSheetInfo} onChange={onChange} fromPortal={fromPortal} />
      )}
    </Fragment>
  );
}
