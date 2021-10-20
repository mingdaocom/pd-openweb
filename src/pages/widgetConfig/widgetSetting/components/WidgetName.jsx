import React, { useEffect, useRef } from 'react';
import { string } from 'prop-types';
import { Input } from 'antd';
import { SettingItem } from '../../styled';

export default function WidgetName(props) {
  const { title = _l('字段名称'), data = {}, onChange } = props;
  const { type, controlName, controlId = '' } = data;
  const $ref = useRef(null);

  useEffect(() => {
    if ($ref.current && controlId.includes('-')) {
      const $dom = $ref.current.input;
      $dom.setSelectionRange(0, $dom.value.length);
      $dom.focus();
    }
  }, [data.controlId]);

  return (
    <SettingItem>
      <div className="settingItemTitle">{title}</div>
      <Input
        ref={$ref}
        data-editcomfirm="true"
        autoFocus
        type="text"
        value={controlName}
        onBlur={() => {
          if (!controlName && !_.includes([22], type)) {
            onChange({ controlName: '字段名称' });
          }
        }}
        onChange={e => onChange({ controlName: e.target.value })}
        maxLength="100"
      />
    </SettingItem>
  );
}
