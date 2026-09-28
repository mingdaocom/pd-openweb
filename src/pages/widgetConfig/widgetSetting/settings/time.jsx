import React, { Fragment } from 'react';
import { Radio } from 'ming-ui/antd-components';
import { TIME_DISPLAY_TYPE } from 'src/utils/domain/control/setting';
import { SettingItem } from '../../styled';

export default function Text(props) {
  const { data = {}, onChange } = props;
  const { unit } = data;
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <Radio.Group
          size="middle"
          value={unit}
          options={(TIME_DISPLAY_TYPE || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={event =>
            onChange({
              unit: event.target.value,
            })
          }
        />
      </SettingItem>
    </Fragment>
  );
}
