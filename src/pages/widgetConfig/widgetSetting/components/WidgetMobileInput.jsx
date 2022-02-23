import React, { Fragment, useEffect } from 'react';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import SheetDealDataType from './SheetDealDataType';
import { SettingItem } from '../../styled';
import { updateConfig, handleAdvancedSettingChange } from '../../util/setting';

const SCAN_CODE_CONFIG = [
  {
    text: _l('扫描条形码'),
    value: '1',
  },
  {
    text: _l('扫描二维码'),
    value: '2',
  },
];

export default ({ data, onChange }) => {
  let { strDefault, advancedSetting = {} } = data;
  strDefault = strDefault || '00';
  const { scantype, dismanual = 0 } = advancedSetting;
  const [disableAlbum] = strDefault.split('');

  useEffect(() => {
    if (!_.includes(['0', '1', '2'], scantype)) {
      onChange({
        ...handleAdvancedSettingChange(data, { dismanual: '0', getinput: '0', getsave: '0' }),
        strDefault: updateConfig({ config: strDefault, value: 0, index: 0 }),
      });
    }
  }, [data.controlId]);

  return (
    <Fragment>
      <SettingItem className="withSplitLine">
        <div className="settingItemTitle">
          {_l('限制移动端输入')}
          <Tooltip
            placement={'bottom'}
            title={_l(
              '支持移动app和在钉钉，微信，welink中使用的web移动端应用；暂不支持企业微信，和其他方式使用的web移动端应用',
            )}
          >
            <i className="icon-help Gray_9e Font16 pointer"></i>
          </Tooltip>
        </div>
        {SCAN_CODE_CONFIG.map(i => {
          return (
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={_.includes(['0', i.value], scantype)}
                onClick={checked => {
                  let newScanType;
                  const filterValue = _.get(
                    _.find(SCAN_CODE_CONFIG, o => o.value !== i.value),
                    'value',
                  );
                  if (checked) {
                    newScanType = scantype === '0' ? filterValue : '';
                  } else {
                    newScanType = scantype ? '0' : i.value;
                  }
                  onChange({
                    ...handleAdvancedSettingChange(data, { scantype: newScanType }),
                    strDefault: updateConfig({ config: strDefault, value: +!checked, index: 1 }),
                  });
                }}
                text={i.text}
              />
            </div>
          );
        })}
      </SettingItem>
      {_.includes(['0', '1', '2'], scantype) && (
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
          </div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={disableAlbum === '1'}
              onClick={checked =>
                onChange({ strDefault: updateConfig({ config: strDefault, value: +!checked, index: 0 }) })
              }
              text={_l('禁用相册')}
            />
          </div>
          <SheetDealDataType data={data} onChange={onChange} />
        </SettingItem>
      )}
    </Fragment>
  );
};
