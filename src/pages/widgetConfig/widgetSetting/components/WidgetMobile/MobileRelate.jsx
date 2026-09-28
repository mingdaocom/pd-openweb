import React, { Fragment } from 'react';
import _ from 'lodash';
import { Checkbox, Select, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { updateConfig } from 'src/utils/domain/control/editorSetting';
import { formatControlsToDropdown } from 'src/utils/domain/control/filters';
import { SettingItem } from '../../../styled';
import SheetDealDataType from '../SheetDealDataType';

const TEXT_TYPE_CONTROL = [2, 3, 4, 5, 7, 32, 33];
const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

// 移动端设置
export default function WidgetRelate(props) {
  const { data, onChange } = props;
  const { strDefault, relationControls = [] } = data;
  let { dismanual = 0, scanlink = '1', scancontrol = '1', scancontrolid } = getAdvanceSetting(data);
  const [, disableAlbum, onlyRelateByScanCode] = strDefault.split('');

  const scanControls = formatControlsToDropdown(relationControls.filter(item => TEXT_TYPE_CONTROL.includes(item.type)));
  const isScanControlDelete = scancontrolid && _.find(scanControls, s => s.value === scancontrolid) === -1;

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('移动端输入')}
          <Tooltip
            placement="bottom"
            title={_l('通过启用设备摄像头实现扫码输入。仅移动app中扫码支持区分条形码、二维码，其他平台扫码不做区分。')}
          >
            <i className="icon-help textTertiary Font16 pointer"></i>
          </Tooltip>
        </div>
        <Checkbox
          checked={!!+onlyRelateByScanCode}
          onChange={event => {
            const checked = !event.target.checked;
            return onChange({
              ...handleAdvancedSettingChange(data, {
                scancontrolid: checked ? '' : scancontrolid,
              }),
              strDefault: updateConfig({
                config: strDefault,
                value: +!checked,
                index: 2,
              }),
            });
          }}
          size="small"
        >
          {_l('扫码添加关联')}
        </Checkbox>
      </SettingItem>
      {!!+onlyRelateByScanCode && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle" style={{ fontWeight: 'normal' }}>
              {_l('扫码内容')}
            </div>
            <div className="labelWrap">
              <Checkbox
                checked={scanlink === '1'}
                onChange={event =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      scanlink: String(+event.target.checked),
                    }),
                  )
                }
                size="small"
              >
                {_l('记录链接')}
              </Checkbox>
            </div>
            <div className="labelWrap">
              <Checkbox
                checked={scancontrol === '1'}
                onChange={event => {
                  const checked = !event.target.checked;
                  return onChange(
                    handleAdvancedSettingChange(data, {
                      scancontrol: String(+!checked),
                      scancontrolid: checked ? '' : scancontrolid,
                    }),
                  );
                }}
                size="small"
              >
                {_l('字段值')}
              </Checkbox>
            </div>
            {scancontrol === '1' && (
              <Select
                className="mTop8 w100"
                allowClear
                placeholder={isScanControlDelete ? <span className="Red">{_l('已删除')}</span> : _l('所有文本类型字段')}
                options={scanControls}
                fieldNames={SELECT_FIELD_NAMES}
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
                checked={dismanual === '1'}
                onChange={event =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      dismanual: String(+event.target.checked),
                    }),
                  )
                }
                size="small"
              >
                {_l('禁止手动输入')}
              </Checkbox>
              <Tooltip placement="bottom" title={_l('勾选后禁止PC端和移动端手动添加关联记录')}>
                <i className="icon-help textTertiary Font16 pointer mLeft8"></i>
              </Tooltip>
            </div>
            <div className="labelWrap">
              <Checkbox
                checked={!!+disableAlbum}
                onChange={event =>
                  onChange({
                    strDefault: updateConfig({
                      config: strDefault,
                      value: +event.target.checked,
                      index: 1,
                    }),
                  })
                }
                size="small"
              >
                {_l('禁用相册')}
              </Checkbox>
            </div>
            <SheetDealDataType {...props} />
          </SettingItem>
        </Fragment>
      )}
    </Fragment>
  );
}
