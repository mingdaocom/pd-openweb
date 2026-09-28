import React from 'react';
import { Checkbox } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';

// 操作设置
export default function SignatureOperate(props) {
  const { data, onChange } = props;
  const { allowappupload = '1' } = getAdvanceSetting(data);

  return (
    <div className="labelWrap">
      <Checkbox
        checked={allowappupload !== '0'}
        onChange={event =>
          onChange(
            handleAdvancedSettingChange(data, {
              allowappupload: String(+event.target.checked),
            }),
          )
        }
        size="small"
      >
        {_l('允许从移动设备扫码上传')}
      </Checkbox>
    </div>
  );
}
