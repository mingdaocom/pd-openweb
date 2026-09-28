import React, { Fragment } from 'react';
import _ from 'lodash';
import { Checkbox, Input, Select, Space } from 'ming-ui/antd-components';
import { getStrBytesLength, getStringBytes } from 'src/utils/core/string';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { DEFAULT_TEXT, SWITCH_TYPES } from 'src/utils/domain/control/setting';
import { SettingItem } from '../../styled';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

export default function Switch({ data, onChange }) {
  const { showtype = '0' } = getAdvanceSetting(data);
  const itemnames = getAdvanceSetting(data, 'itemnames') || [];

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <div className="labelWrap">
          <Select
            className="w100"
            options={SWITCH_TYPES}
            fieldNames={SELECT_FIELD_NAMES}
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
                  checked={itemnames.length > 0}
                  onChange={event => {
                    onChange(
                      handleAdvancedSettingChange(data, {
                        itemnames: !event.target.checked ? '' : JSON.stringify(DEFAULT_TEXT[showtype]),
                      }),
                    );
                  }}
                  size="small"
                >
                  {_l('显示开关文字')}
                </Checkbox>
              </div>
            )}
            {itemnames.length > 0 && (
              <Fragment>
                {(DEFAULT_TEXT[showtype] || []).map((item, index) => {
                  return (
                    <Space.Compact key={item.value} block style={{ marginTop: 10 }}>
                      <Input
                        readOnly
                        tabIndex={-1}
                        value={item.value}
                        style={{ width: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}
                      />
                      <Input
                        style={{ flex: 1 }}
                        value={_.get(itemnames[index], 'value')}
                        onChange={e => {
                          const tempValue =
                            getStringBytes(e.target.value) <= 60 //30个中文字符
                              ? e.target.value
                              : getStrBytesLength(e.target.value, 60);
                          const newItemNames = itemnames.map((i, idx) =>
                            idx === index ? Object.assign({}, i, { value: tempValue }) : i,
                          );
                          onChange(handleAdvancedSettingChange(data, { itemnames: JSON.stringify(newItemNames) }));
                        }}
                      />
                    </Space.Compact>
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
            onChange={e => onChange({ hint: e.target.value })}
          />
        </SettingItem>
      )}
    </Fragment>
  );
}
