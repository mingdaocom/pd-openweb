import React from 'react';
import _, { isUndefined } from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown, Select } from 'ming-ui/antd-components';
import { COVER_DISPLAY_FILL } from 'src/pages/worksheet/common/ViewConfig/config.js';

const MENU_STYLE = { width: 'auto', minWidth: 110 };
const SELECTED_ICON = <Icon icon="done" className="Font18 colorPrimary" />;

export default function BatchShowtypeSelect({ data, control, info, changeValue }) {
  const type = control.type === 30 ? control.sourceControlType : control.type;
  const showtype = isUndefined(info.showtype)
    ? type === 14
      ? 6
      : _.get(control, 'advancedSetting.showtype') === '2'
        ? 2
        : 0
    : info.showtype;
  const menuItems = data
    .map(({ value, text }) => ({
      key: `showtype-${value}`,
      label: text,
      extra: showtype === value ? SELECTED_ICON : undefined,
      onClick: () => changeValue({ ...info, cid: control.controlId, showtype: value }),
    }))
    .concat(
      type === 14 && showtype !== 6
        ? [
            { key: 'coverFillTypeDivider', type: 'divider' },
            {
              key: 'coverFillType',
              label: _l('图片填充方式'),
              children: COVER_DISPLAY_FILL.map(({ value, text }) => ({
                key: `coverFillType-${value}`,
                label: text,
                extra: info.coverFillType === value ? SELECTED_ICON : undefined,
                onClick: () => changeValue({ ...info, cid: control.controlId, coverFillType: value }),
              })),
            },
          ]
        : [],
    );

  return (
    <Dropdown trigger={['click']} placement="bottomLeft" menu={{ items: menuItems, style: MENU_STYLE }}>
      <Select
        className="w100"
        placeholder={_l('样式')}
        value={showtype}
        options={data.map(({ value, text }) => ({ value, label: text }))}
        open={false}
        showSearch={false}
      />
    </Dropdown>
  );
}
