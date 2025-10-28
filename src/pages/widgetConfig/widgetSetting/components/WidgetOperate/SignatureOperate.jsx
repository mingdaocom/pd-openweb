import React from 'react';
import { Checkbox } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

// 操作设置
export default function SignatureOperate(props) {
  const { data, onChange } = props;
  const { allowappupload = '1' } = getAdvanceSetting(data);

  return (
    <div className="labelWrap">
      <Checkbox
        size="small"
        text={_l('允许从移动设备输入')}
        checked={allowappupload !== '0'}
        onClick={checked => onChange(handleAdvancedSettingChange(data, { allowappupload: String(+!checked) }))}
      />
    </div>
  );
}
