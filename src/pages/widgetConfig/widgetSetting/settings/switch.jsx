import React, { Fragment } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import { Checkbox, Dropdown } from 'ming-ui';
import { getStrBytesLength } from 'src/pages/Role/PortalCon/tabCon/util-pure.js';
import { DEFAULT_TEXT, SWITCH_TYPES } from 'src/pages/widgetConfig/config/setting.js';
import { getStringBytes } from 'src/utils/common';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

export default function Switch({ data, onChange }) {
  const { showtype = '0' } = getAdvanceSetting(data);
  const itemnames = getAdvanceSetting(data, 'itemnames') || [];

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <div className="labelWrap">
          <Dropdown
            border
            isAppendToBody
            data={SWITCH_TYPES}
            value={showtype}
            onChange={value =>
              onChange(
                handleAdvancedSettingChange(data, {
                  showtype: value,
                  itemnames: value === '2' ? JSON.stringify(DEFAULT_TEXT[value]) : '',
                }),
              )
            }
          />
        </div>
        {_.includes(['1', '2'], showtype) && (
          <SettingItem>
            {showtype === '2' ? (
              <div className="Bold">{_l('选项')}</div>
            ) : (
              <div className="labelWrap">
                <Checkbox
                  size="small"
                  checked={itemnames.length > 0}
                  onClick={checked => {
                    onChange(
                      handleAdvancedSettingChange(data, {
                        itemnames: checked ? '' : JSON.stringify(DEFAULT_TEXT[showtype]),
                      }),
                    );
                  }}
                  text={_l('显示开关文字')}
                />
              </div>
            )}
            {itemnames.length > 0 && (
              <Fragment>
                {(DEFAULT_TEXT[showtype] || []).map((item, index) => {
                  return (
                    <Input
                      style={{ marginTop: 10 }}
                      addonBefore={<span>{item.value}</span>}
                      value={_.get(itemnames[index], 'value')}
                      onChange={e => {
                        const tempValue =
                          getStringBytes(e.target.value.trim()) <= 60 //30个中文字符
                            ? e.target.value.trim()
                            : getStrBytesLength(e.target.value.trim(), 60);
                        const newItemNames = itemnames.map((i, idx) =>
                          idx === index ? Object.assign({}, i, { value: tempValue }) : i,
                        );
                        onChange(handleAdvancedSettingChange(data, { itemnames: JSON.stringify(newItemNames) }));
                      }}
                    />
                  );
                })}
              </Fragment>
            )}
          </SettingItem>
        )}
      </SettingItem>
      {!_.includes(['1', '2'], showtype) && (
        <SettingItem>
          <div className="settingItemTitle">{_l('内容')}</div>
          <Input.TextArea
            autoSize
            value={data.hint}
            placeholder={_l('输入检查内容')}
            onChange={e => onChange({ hint: e.target.value.trim() })}
          />
        </SettingItem>
      )}
    </Fragment>
  );
}
