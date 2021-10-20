import React from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../../styled';
import { handleAdvancedSettingChange } from '../../../util/setting';

const FORMULA_TYPES = [
  {
    value: 31,
    text: _l('数字'),
  },
  {
    value: 38,
    text: _l('日期'),
  },
];
export default function SwitchType({ data, onChange }) {
  const handleChange = type => {
    if (type === data.type) return;
    // const { changeFormulaEditStatus } = props;
    const nextData = {
      type,
      sourceControlId: '',
      dataSource: '',
    };
    if (type === 31) {
      onChange(
        handleAdvancedSettingChange(
          { ...nextData, enumDefault: 2, enumDefault2: 2, unit: '', dot: 2 },
          { suffix: '', prefix: '' },
        ),
      );
    } else {
      onChange(
        handleAdvancedSettingChange(
          { ...nextData, enumDefault: 1, enumDefault2: 0, unit: '3', strDefault: '0', dot: 0 },
          { suffix: _l('天'), prefix: '', dot: 0 },
        ),
      );
      // changeFormulaEditStatus(false);
    }
  };

  return (
    <SettingItem>
      <RadioGroup size="middle" checkedValue={data.type} data={FORMULA_TYPES} onChange={handleChange} />
    </SettingItem>
  );
}
