import React from 'react';
import { Checkbox } from 'ming-ui';
import { updateConfig } from '../../../util/setting';

// 移动端设置
export default function WidgetOcr({ data, onChange }) {
  const { strDefault } = data;
  const [disableAlbum] = (strDefault || '00').split('');

  return (
    <div className="labelWrap">
      <Checkbox
        size="small"
        checked={disableAlbum === '1'}
        onClick={checked =>
          onChange({ strDefault: updateConfig({ config: strDefault || '00', value: +!checked, index: 0 }) })
        }
        text={_l('禁用相册')}
      />
    </div>
  );
}
