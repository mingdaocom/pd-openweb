import React from 'react';
import { Checkbox } from 'ming-ui/antd-components';
import { updateConfig } from 'src/utils/domain/control/editorSetting';

// 移动端设置
export default function WidgetOcr({ data, onChange }) {
  const { strDefault } = data;
  const [disableAlbum] = (strDefault || '00').split('');

  return (
    <div className="labelWrap">
      <Checkbox
        checked={disableAlbum === '1'}
        onChange={event =>
          onChange({
            strDefault: updateConfig({
              config: strDefault || '00',
              value: +event.target.checked,
              index: 0,
            }),
          })
        }
        size="small"
      >
        {_l('禁用相册')}
      </Checkbox>
    </div>
  );
}
