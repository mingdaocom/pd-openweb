import React from 'react';
import styled from 'styled-components';
import { Input } from 'antd';
import { SettingItem } from '../../styled';

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
  const { dot } = data;

  const dealValue = value => {
    const parsedValue = parseFloat(value);
    if (isNaN(value)) return 0;
    const fixedValue = Number(parsedValue).toFixed(0);
    return Math.max(0, Math.min(14, fixedValue));
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
    onChange({ dot: Math.min(14, dot + 1) });
  };

  const reduceNumber = () => {
    onChange({ dot: Math.max(0, dot - 1) });
  };

  return (
    <PointerConfigWrap>
      <div className="settingItemTitle">{_l('保留小数位数')}</div>
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
    </PointerConfigWrap>
  );
}
