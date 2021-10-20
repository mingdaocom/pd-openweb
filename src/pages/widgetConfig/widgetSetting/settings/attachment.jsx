import React, { Fragment } from 'react';
import { Dropdown, Checkbox } from 'ming-ui';
import { SettingItem } from '../../styled';
import Components from '../components';
import { updateConfig } from '../../util/setting';

const SORT_TYPE = [
  {
    value: 1,
    text: _l('新的在前'),
  },
  { value: 2, text: _l('旧的在前') },
];

const MOBILE_INPUT = [
  { value: 0, text: _l('不限制') },
  { value: 1, text: _l('拍摄照片') },
  { value: 2, text: _l('拍摄小视频') },
  { value: 3, text: _l('拍摄照片或小视频') },
];
export default function Attachment({ from, data, onChange }) {
  const { enumDefault, enumDefault2, strDefault = '' } = data;
  const [disableAlbum, onlyAllowMobileInput] = strDefault.split('');
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('排序')}</div>
        <Dropdown
          border
          data={SORT_TYPE}
          value={enumDefault || 1}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
      {from !== 'subList' && (
        <SettingItem className="settingItem withSplitLine">
          <div className="settingItemTitle">{_l('移动端输入')}</div>
          <Dropdown
            border
            data={MOBILE_INPUT}
            value={enumDefault2}
            onChange={value => {
              if (value === enumDefault2) return;
              if (!value) {
                onChange({ enumDefault2: value, strDefault: '00' });
              } else {
                onChange({ enumDefault2: value });
              }
            }}
          />
          {_.includes([1, 2, 3], data.enumDefault2) && (
            <Fragment>
              <div className="labelWrap">
                <Checkbox
                  size="small"
                  checked={onlyAllowMobileInput === '1'}
                  onClick={checked =>
                    onChange({ strDefault: updateConfig({ config: strDefault, value: +!checked, index: 1 }) })
                  }
                  text={'只允许移动端输入'}
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
              <Components.SheetDealDataType data={data} onChange={onChange} />
            </Fragment>
          )}
        </SettingItem>
      )}
    </Fragment>
  );
}
