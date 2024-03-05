import React, { Fragment } from 'react';
import { Checkbox, Dropdown } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../../styled';
import SheetDealDataType from '../SheetDealDataType';
import { formatControlsToDropdown } from '../../../util';
import { updateConfig, getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';

const TEXT_TYPE_CONTROL = [2, 3, 4, 5, 7, 32, 33];

// 移动端设置
export default function WidgetRelate(props) {
  const { data, onChange } = props;
  const { strDefault, relationControls = [] } = data;
  let { dismanual = 0, scanlink = '1', scancontrol = '1', scancontrolid } = getAdvanceSetting(data);
  const [isHiddenOtherViewRecord, disableAlbum, onlyRelateByScanCode] = strDefault.split('');

  const scanControls = formatControlsToDropdown(relationControls.filter(item => TEXT_TYPE_CONTROL.includes(item.type)));
  const isScanControlDelete = scancontrolid && _.find(scanControls, s => s.value === scancontrolid) === -1;

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('移动端输入')}
          <Tooltip
            placement={'bottom'}
            title={_l('通过启用设备摄像头实现扫码输入。仅移动app中扫码支持区分条形码、二维码，其他平台扫码不做区分。')}
          >
            <i className="icon-help Gray_9e Font16 pointer"></i>
          </Tooltip>
        </div>
        <Checkbox
          size="small"
          checked={!!+onlyRelateByScanCode}
          onClick={checked =>
            onChange({
              ...handleAdvancedSettingChange(data, { scancontrolid: checked ? '' : scancontrolid }),
              strDefault: updateConfig({
                config: strDefault,
                value: +!checked,
                index: 2,
              }),
            })
          }
          text={_l('扫码添加关联  ')}
        />
      </SettingItem>
      {!!+onlyRelateByScanCode && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle" style={{ fontWeight: 'normal' }}>
              {_l('扫码内容')}
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={scanlink === '1'}
                onClick={checked => onChange(handleAdvancedSettingChange(data, { scanlink: String(+!checked) }))}
                text={_l('记录链接')}
              />
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={scancontrol === '1'}
                onClick={checked =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      scancontrol: String(+!checked),
                      scancontrolid: checked ? '' : scancontrolid,
                    }),
                  )
                }
                text={_l('字段值')}
              />
            </div>
            {scancontrol === '1' && (
              <Dropdown
                border
                className="mTop8"
                cancelAble
                placeholder={isScanControlDelete ? <span className="Red">{_l('已删除')}</span> : _l('所有文本类型字段')}
                data={scanControls}
                value={isScanControlDelete ? undefined : scancontrolid || undefined}
                onChange={value => {
                  onChange(handleAdvancedSettingChange(data, { scancontrolid: value || '' }));
                }}
              />
            )}
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle" style={{ fontWeight: 'normal' }}>
              {_l('选项')}
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={dismanual === '1'}
                onClick={checked => onChange(handleAdvancedSettingChange(data, { dismanual: String(+!checked) }))}
                text={_l('禁止手动输入')}
              />
              <Tooltip placement={'bottom'} title={_l('勾选后禁止PC端和移动端手动添加关联记录')}>
                <i className="icon-help Gray_9e Font16 pointer mLeft8"></i>
              </Tooltip>
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={!!+disableAlbum}
                onClick={checked =>
                  onChange({
                    strDefault: updateConfig({
                      config: strDefault,
                      value: +!checked,
                      index: 1,
                    }),
                  })
                }
                text={_l('禁用相册')}
              />
            </div>
            <SheetDealDataType {...props} />
          </SettingItem>
        </Fragment>
      )}
    </Fragment>
  );
}
