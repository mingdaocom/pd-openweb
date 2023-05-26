import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Input, Tooltip } from 'antd';
import { Checkbox } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import { SettingItem } from '../../styled';
import _ from 'lodash';

const POINTER_TYPES = [
  {
    value: '0',
    text: _l('显示完整位数'),
  },
  {
    value: '1',
    text: _l('自动'),
  },
];

const PointerConfigWrap = styled(SettingItem)`
  input {
    width: 70px;
  }
  .settingContent {
    display: flex;
  }
  .numberControlBox {
    display: flex;
    flex-direction: column;
    .iconWrap {
      padding: 0 6px;
      border: 1px solid #e0e0e0;
      border-left: none;
      height: 18px;
      &:first-child {
        border-bottom: none;
      }
      i {
        color: #9e9e9e;
      }
    }
  }
`;

export default function PointConfig({ data = {}, onChange }) {
  const { dot = 2 } = data;
  const { numshow, dotformat = '0' } = getAdvanceSetting(data);
  const maxDot = _.includes([6, 31, 37], data.type) && numshow === '1' ? 12 : 14;

  // 百分比配置小数点最大12
  useEffect(() => {
    if (dot > maxDot) {
      onChange({ dot: 12 });
    }
  }, [data.controlId, numshow]);

  const dealValue = value => {
    const parsedValue = parseFloat(value);
    if (isNaN(value)) return 0;
    const fixedValue = Number(parsedValue).toFixed(0);
    return Math.max(0, Math.min(maxDot, fixedValue));
  };

  const handleChange = event => {
    const value = event.target.value;
    if (!value) {
      onChange({ dot: '' });
      return;
    }
    onChange({ dot: dealValue(value) });
  };

  const addNumber = () => {
    onChange({ dot: Math.min(maxDot, dot + 1) });
  };

  const reduceNumber = () => {
    onChange({ dot: Math.max(0, dot - 1) });
  };

  return (
    <PointerConfigWrap>
      <div className="settingItemTitle">{_l('小数位数')}</div>
      <div className="flexCenter">
        <div className="settingContent">
          <Input value={dot} onChange={handleChange} />
          <div className="numberControlBox">
            <div className="iconWrap addIcon" onClick={addNumber}>
              <i className="icon-arrow-up-border pointer" />
            </div>
            <div className="iconWrap subIcon" onClick={reduceNumber}>
              <i className="icon-arrow-down-border pointer" />
            </div>
          </div>
        </div>
        {dot ? (
          <Checkbox
            size="small"
            className="mLeft20"
            checked={dotformat === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { dotformat: checked ? '0' : '1' }))}
          >
            <span style={{ marginRight: '4px' }}>{_l('省略末尾的0')}</span>
            <Tooltip
              title={_l('勾选后，不足小数位数时省略末尾的0。如设置4位小数时，默认显示完整精度2.800，勾选后显示为2.8')}
            >
              <i className="icon-help Gray_bd Font15"></i>
            </Tooltip>
          </Checkbox>
        ) : null}
      </div>
    </PointerConfigWrap>
  );
}
