import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { Checkbox } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { NumberRange } from '../../../styled';
import InputValue from './InputValue';

export default function SubListVerify(props) {
  const { data, onChange } = props;
  const { enablelimit, min = '0', max = '200' } = getAdvanceSetting(data);
  const [tempMin, setMin] = useState(min);
  const [tempMax, setMax] = useState(max);

  useEffect(() => {
    setMin(min);
    setMax(max);
    if (min === '' && max === '' && enablelimit === '1') {
      onChange(handleAdvancedSettingChange(data, { enablelimit: '0' }));
    }
  }, [data.controlId, min, max]);

  return (
    <div className="widgetDisplaySettingWrap">
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={enablelimit === '1'}
          onClick={checked => {
            onChange(
              handleAdvancedSettingChange(
                data,
                checked ? { enablelimit: '0', min: '', max: '' } : { enablelimit: '1', min: '0', max: '200' },
              ),
            );
          }}
        >
          <span>
            {_l('限制添加行数')}
            <Tooltip placement={'bottom'} title={_l('未勾选时，最大支持输入1000行')}>
              <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
            </Tooltip>
          </span>
        </Checkbox>
      </div>
      {enablelimit === '1' && (
        <NumberRange>
          <InputValue
            type={2}
            value={tempMin.toString()}
            placeholder={_l('最小')}
            onChange={value => setMin(value)}
            onBlur={value => {
              if (value > 1000) {
                value = 1000;
              } else if (max && value > Number(max)) {
                value = max;
              }
              setMin(value);
              onChange(handleAdvancedSettingChange(data, { min: value }));
            }}
          />
          <span>~</span>
          <InputValue
            type={2}
            value={tempMax.toString()}
            placeholder={_l('最大')}
            onChange={value => setMax(value)}
            onBlur={value => {
              if (value > 1000) {
                value = 1000;
              } else if (min && value <= Number(min)) {
                value = Number(min) + 1;
              } else if (value === 0) {
                value = 1;
              }
              setMax(value);
              onChange(handleAdvancedSettingChange(data, { max: value }));
            }}
          />
        </NumberRange>
      )}
    </div>
  );
}
