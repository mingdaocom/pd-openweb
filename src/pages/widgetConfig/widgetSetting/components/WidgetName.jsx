import React, { useEffect, useRef } from 'react';
import { Input, Tooltip } from 'antd';
import { Checkbox } from 'ming-ui';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import _ from 'lodash';
import { isSheetDisplay } from '../../util';

export default function WidgetName(props) {
  const { title = _l('字段名称'), data = {}, onChange, isRecycle } = props;
  const { type, controlName, controlId = '' } = data;
  const hidetitle = getAdvanceSetting(data, 'hidetitle');
  const $ref = useRef(null);
  const showHiden = !(isSheetDisplay(data) || type === 52);

  useEffect(() => {
    if ($ref.current && !isRecycle) {
      const $dom = $ref.current.input;
      if (controlId.includes('-')) {
        $dom.setSelectionRange(0, $dom.value.length);
      }
      $dom.focus();
    }
  }, [data.controlId]);

  return (
    <SettingItem>
      <div className="settingItemTitle labelBetween">
        {title}
        {showHiden && (
          <Tooltip title={_l('勾选后，在表单中隐藏字段名称')}>
            <div className="flexCenter Normal">
              <Checkbox
                size="small"
                checked={hidetitle === 1}
                onClick={checked => onChange(handleAdvancedSettingChange(data, { hidetitle: String(+!checked) }))}
                text={_l('隐藏')}
              />
            </div>
          </Tooltip>
        )}
      </div>
      <Input
        ref={$ref}
        data-editcomfirm="true"
        type="text"
        value={controlName}
        onBlur={() => {
          if (!controlName && !_.includes([22, 10010], type)) {
            onChange({ controlName: _l('字段名称') });
          }
        }}
        onChange={e => onChange({ controlName: e.target.value })}
        maxLength="100"
      />
    </SettingItem>
  );
}
