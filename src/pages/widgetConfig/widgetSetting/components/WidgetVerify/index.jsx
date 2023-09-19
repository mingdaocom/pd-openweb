import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import InputValue from './InputValue';
import DateVerify from './DateVerify';
import TextVerify from './TextVerify';
import AttachmentVerify from './AttachmentVerify';
import _ from 'lodash';

const CompConfig = {
  2: TextVerify,
  14: AttachmentVerify,
  15: DateVerify,
  16: DateVerify,
  46: DateVerify,
};

const SETTING_TO_TEXT = {
  required: _l('必填'),
  unique: _l('不允许重复'),
};

const TYPES_SETTING = {
  2: ['required', 'unique'],
  3: ['required', 'unique'],
  4: ['required', 'unique'],
  5: ['required', 'unique'],
  7: ['required', 'unique'],
};

const TYPES_SETTING_PORTAL = {
  2: ['required'],
  3: ['required'],
  4: ['required'],
  5: ['required'],
  7: ['required'],
};

const TYPE_TO_TEXT = {
  2: { title: _l('限定字数'), placeholder: [_l('最少'), _l('最多')] },
  6: { title: _l('限定数值范围'), placeholder: [_l('最小'), _l('最大')] },
  8: { title: _l('限定金额范围'), placeholder: [_l('最小'), _l('最大')] },
  10: { title: _l('限定可选项数'), placeholder: [_l('最少'), _l('最多')] },
};

const SWITCH_TYPE_TO_TEXT = {
  0: _l('必须选中'),
  1: _l('必须开启'),
  2: _l('必须选是'),
};

const NumberRange = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    margin: 0 8px;
    color: #9e9e9e;
  }
  input {
    width: 100%;
  }
`;

const VerifySettingItem = styled(SettingItem)`
  .widgetDisplaySettingWrap {
    display: flex;
    flex-direction: column;
    .checkboxLabel {
      display: flex;
      align-self: baseline;
      width: auto;
    }
  }
  .timeFieldWrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    span {
      padding: 0 12px;
      margin-top: 12px;
    }
  }
  .dropLabel {
    .Checkbox {
      white-space: normal;
      align-items: flex-start;
    }
    .Checkbox-box {
      flex-shrink: 0;
      margin-top: 3px;
    }
  }
`;

export default function WidgetVerify(props) {
  const { data = {}, onChange, fromPortal } = props;
  const { type, options = [] } = data;
  const Comp = CompConfig[type] || null;
  const settings = fromPortal ? TYPES_SETTING_PORTAL[type] || ['required'] : TYPES_SETTING[type] || ['required'];
  const { max = '', min = '', checkrange = '0', showtype, otherrequired = '0' } = getAdvanceSetting(data);
  const { title, placeholder = [] } = TYPE_TO_TEXT[type] || {};
  return (
    <VerifySettingItem>
      <div className="settingItemTitle">{_l('验证')}</div>
      <div className="widgetDisplaySettingWrap">
        {settings.map(item => (
          <div key={item} className="labelWrap">
            <Checkbox
              size="small"
              key={item}
              checked={data[item] || false}
              onClick={checked => onChange({ [item]: !checked })}
              text={type === 36 ? SWITCH_TYPE_TO_TEXT[showtype || '0'] : SETTING_TO_TEXT[item]}
            />
          </div>
        ))}
        {(_.includes([2, 8, 10], type) || (type === 6 && !_.includes(['1', '2'], showtype))) && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={checkrange === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { checkrange: checked ? '0' : '1' }))}
              text={title}
            />
          </div>
        )}

        {checkrange === '1' && (
          <NumberRange>
            <InputValue
              type={type}
              value={min}
              onChange={value => {
                if (type === 2) {
                  if (value === '0' || (max && +value > +max)) {
                    onChange(handleAdvancedSettingChange(data, { min: '' }));
                    return;
                  }
                }
                onChange(handleAdvancedSettingChange(data, { min: value }));
              }}
              placeholder={placeholder[0]}
            />
            <span>~</span>
            <InputValue
              type={type}
              value={max}
              onChange={value => {
                if (type === 2) {
                  if (value === '0') {
                    onChange(handleAdvancedSettingChange(data, { max: '' }));
                    return;
                  }
                }
                onChange(handleAdvancedSettingChange(data, { max: value }));
              }}
              onBlur={() => {
                if (type === 2 && min && +max < +min) {
                  onChange(handleAdvancedSettingChange(data, { max: '' }));
                  return;
                }
              }}
              placeholder={placeholder[1]}
            />
          </NumberRange>
        )}
      </div>

      {_.includes([9, 10, 11], type) && showtype !== '2' && _.find(options, i => i.key === 'other' && !i.isDeleted) && (
        <div className="labelWrap dropLabel">
          <Checkbox
            size="small"
            checked={otherrequired === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { otherrequired: checked ? '0' : '1' }))}
          >
            <span>
              {_l(
                '选择“%0”时，补充信息必填',
                _.get(
                  _.find(options, i => i.key === 'other' && !i.isDeleted),
                  'value',
                ) || '其他',
              )}
              <Tooltip placement={'bottom'} title={_l('勾选后，当用户选中“其他”时，必须在后面的文本框中填写内容。')}>
                <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
              </Tooltip>
            </span>
          </Checkbox>
        </div>
      )}
      {Comp && <Comp {...props} />}
    </VerifySettingItem>
  );
}
