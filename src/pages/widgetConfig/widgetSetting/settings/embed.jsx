import React from 'react';
import { SettingItem } from '../../styled';
import { Checkbox } from 'ming-ui';
import { Input } from 'antd';
import TextInput from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/inputTypes/TextInput';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { handleAdvancedSettingChange } from '../../util/setting';
import styled from 'styled-components';

const EmbedSettingWrap = styled.div`
  .tagInputareaIuput {
    min-height: 90px !important;
  }
`;

export default function Embed(props) {
  const { data = {}, allControls, onChange } = props;
  const { dataSource = '', advancedSetting = {} } = data;
  const { height, allowlink } = advancedSetting;

  const handleDynamicValueChange = (value = []) => {
    let formatValue = '';
    value.forEach(item => {
      const { cid, rcid, staticValue } = item;
      if (cid) {
        formatValue += rcid ? `$${cid}~${rcid}$` : `$${cid}$`;
      } else {
        formatValue += staticValue;
      }
    });
    onChange({ ...data, dataSource: formatValue });
  };

  return (
    <EmbedSettingWrap>
      <SettingItem>
        <div className="settingItemTitle">{_l('URL')}</div>
        <TextInput
          {...props}
          controls={allControls.filter(i => !_.includes([29, 35], i.type))}
          dynamicValue={transferValue(dataSource)}
          hideSearchAndFun
          propFiledVisible
          onDynamicValueChange={handleDynamicValueChange}
        />
      </SettingItem>
      <SettingItem>
        <div className="labelWrap flexCenter mBottom15">
          <span>{_l('高度')}</span>
          <Input
            value={height}
            style={{ width: 100, margin: '0 10px 0 10px' }}
            onChange={e => {
              const value = e.target.value.trim();
              onChange(handleAdvancedSettingChange(data, { height: value.replace(/[^\d]/g, '') }));
            }}
            onBlur={e => {
              let value = e.target.value.trim();
              if (value > 1000) {
                value = 1000;
              }
              if (value < 100) {
                value = 100;
              }
              onChange(handleAdvancedSettingChange(data, { height: value }));
            }}
          />
          <span>{_l('px')}</span>
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowlink === '1'}
            text={_l('允许新页面打开链接')}
            onClick={checked => {
              onChange(
                handleAdvancedSettingChange(data, {
                  allowlink: checked ? '0' : '1',
                }),
              );
            }}
          />
        </div>
      </SettingItem>
    </EmbedSettingWrap>
  );
}
