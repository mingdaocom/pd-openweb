import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Input } from 'antd';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

const PointerConfigWrap = styled.div`
  display: flex;
  position: relative;
  margin: 10px 0;
  input {
    width: 70px;
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

export default function AttachmentConfig({ data = {}, onChange }) {
  const { maxcount } = getAdvanceSetting(data);
  const [count, setCount] = useState();

  useEffect(() => {
    setCount(maxcount);
  }, [maxcount]);

  const dealValue = value => {
    const parsedValue = parseFloat(value);
    if (!value) return 1;
    const fixedValue = Number(parsedValue).toFixed(0);
    return Math.max(1, Math.min(20, fixedValue));
  };

  const handleChange = event => {
    const value = event.target.value.trim();
    setCount(value.replace(/[^\d]/g, ''));
  };

  const handleBlur = () => {
    setCount(dealValue(count));
    onChange(handleAdvancedSettingChange(data, { maxcount: dealValue(count) }));
  };

  const addNumber = () => {
    onChange(handleAdvancedSettingChange(data, { maxcount: Math.min(20, maxcount + 1) }));
  };

  const reduceNumber = () => {
    onChange(handleAdvancedSettingChange(data, { maxcount: Math.max(1, maxcount - 1) }));
  };

  return (
    <PointerConfigWrap>
      <Input value={count} onChange={handleChange} onBlur={handleBlur} />
      <div className="numberControlBox">
        <div className="iconWrap addIcon" onClick={addNumber}>
          <i className="icon-arrow-up-border pointer" />
        </div>
        <div className="iconWrap subIcon" onClick={reduceNumber}>
          <i className="icon-arrow-down-border pointer" />
        </div>
      </div>
    </PointerConfigWrap>
  );
}
