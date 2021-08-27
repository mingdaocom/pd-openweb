import React, { Fragment } from 'react';
import { Checkbox, Dropdown } from 'ming-ui';
import { Tooltip } from 'antd';
import SheetDealDataType from './SheetDealDataType';
import { SettingItem } from '../../styled';
import { updateConfig, handleAdvancedSettingChange } from '../../util/setting';

const SCAN_CODE_CONFIG = [
  {
    text: _l('扫描条形码/二维码'),
    value: 0,
  },
  {
    text: _l('扫描条形码'),
    value: 1,
  },
  {
    text: _l('扫描二维码'),
    value: 2,
  },
];

export default ({ data, onChange }) => {
  let { strDefault, type, advancedSetting = {} } = data;
  strDefault = strDefault || '00';
  const { scantype = 0, dismanual = 0 } = advancedSetting;
  const [disableAlbum, onlyAllowMobileInput] = strDefault.split('');
  return (
    <Fragment>
      <SettingItem className="withSplitLine">
        <div className="settingItemTitle">{_l('移动端输入')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={!!+onlyAllowMobileInput}
            onClick={checked =>
              onChange({
                ...handleAdvancedSettingChange(data, { dismanual: '' }),
                strDefault: updateConfig({ config: strDefault, value: +!checked, index: 1 }),
              })
            }>
            <Tooltip placement={'right'} title={_l('扫码功能只对App或企业微信/Welink移动端有效')}>
              {_.includes([1, 2], type) ? _l('启用扫码输入') : _l('只允许移动端输入')}
              <i className="icon-help Gray_9e Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
      </SettingItem>
      {!!+onlyAllowMobileInput && (
        <Fragment>
          <Dropdown
            border
            value={+scantype}
            className="mobileInputTypeDropdown"
            menuStyle={{ width: '100%' }}
            style={{ width: '100%', marginTop: '10px' }}
            data={SCAN_CODE_CONFIG}
            selectClose
            onChange={value => {
              onChange(handleAdvancedSettingChange(data, { scantype: value }));
            }}
          />
          <SettingItem>
            <div className="settingItemTitle" style={{ fontWeight: 'normal' }}>
              {_l('App额外功能')}
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                style={{ marginTop: '6px' }}
                checked={dismanual === '1'}
                onClick={checked => onChange(handleAdvancedSettingChange(data, { dismanual: String(+!checked) }))}
                text={_l('禁止手动输入')}
              />
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                style={{ marginTop: '6px' }}
                checked={disableAlbum === '1'}
                onClick={checked =>
                  onChange({ strDefault: updateConfig({ config: strDefault, value: +!checked, index: 0 }) })
                }
                text={_l('禁用相册')}
              />
            </div>
            <SheetDealDataType data={data} onChange={onChange} />
          </SettingItem>
        </Fragment>
      )}
    </Fragment>
  );
};
