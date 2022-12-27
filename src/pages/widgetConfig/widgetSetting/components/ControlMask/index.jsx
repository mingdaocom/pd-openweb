import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { Checkbox, Icon } from 'ming-ui';
import { SettingItem, EditInfo } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { DISPLAY_MASK, CUSTOM_DISPLAY } from 'src/pages/widgetConfig/config/setting';
import MaskSettingDialog from './MaskSettingDialog';

export default function ControlMask(props) {
  const { data = {}, onChange } = props;
  const { datamask, masktype } = getAdvanceSetting(data);
  const [visible, setVisible] = useState(false);

  return (
    <SettingItem>
      <div className="settingItemTitle labelBetween">{_l('安全')}</div>
      <div className="labelWrap">
        <Checkbox
          className="customWidgetCheckbox"
          size="small"
          checked={datamask === '1'}
          onClick={checked => {
            if (!checked) {
              setVisible(true);
            } else {
              onChange(
                handleAdvancedSettingChange(data, {
                  datamask: String(+!checked),
                }),
              );
            }
          }}
        >
          <span style={{ marginRight: '4px' }}>{_l('掩码显示')}</span>
          <Tooltip
            placement="bottom"
            title={_l(
              '将字段值显示为掩码，应用管理员和有解密权限的用户可以点击后解密查看（解密权限需要在用户-角色-字段权限中配置）。在对外公开分享时始终掩盖',
            )}
          >
            <Icon icon="help" className="Font16 Gray_9e" />
          </Tooltip>
        </Checkbox>
      </div>

      {datamask === '1' && (
        <EditInfo style={{ marginTop: '12px' }} onClick={() => setVisible({ visible: true })}>
          <div className="text overflow_ellipsis Gray">
            <span className="Bold">{_l('掩码方式： ')}</span>
            {_.get(
              DISPLAY_MASK.concat(CUSTOM_DISPLAY).find(item => item.value === masktype),
              'text',
            )}
          </div>
          <div className="edit">
            <i className="icon-edit"></i>
          </div>
        </EditInfo>
      )}

      {visible && <MaskSettingDialog {...props} onCancel={() => setVisible(false)} />}
    </SettingItem>
  );
}
