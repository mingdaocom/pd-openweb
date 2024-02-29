import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Input } from 'antd';

const PointerConfigWrap = styled.div`
  display: flex;
  position: relative;
  border-bottom-left-radius: 3px;
  border-top-left-radius: 3px;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
  input {
    width: 100%;
  }
  .addIcon {
    border-top-right-radius: 3px;
  }
  .subIcon {
    border-bottom-right-radius: 3px;
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

export default function NumInput(props) {
  const { onChange, maxNum, minNum } = props;
  const [countNum, setCount] = useState(props.value);

  useEffect(() => {
    setCount(props.value);
  }, [props.value]);

  const handleChange = event => {
    const value = event.target.value.trim();
    setCount((value || '0').replace(/[^\d]/g, ''));
  };
  const changeNum = num => {
    setCount(num);
    onChange(num);
  };
  const handleBlur = () => {
    changeNum(parseInt(countNum) > maxNum ? maxNum : parseInt(countNum) < minNum ? minNum : parseInt(countNum));
  };

  const addNumber = () => {
    if (parseInt(countNum + 1) > maxNum) {
      return;
    }
    changeNum(parseInt(countNum + 1));
  };

  const reduceNumber = () => {
    if (parseInt(countNum - 1) < minNum) {
      return;
    }
    changeNum(parseInt(countNum - 1));
  };

  return (
    <PointerConfigWrap className={props.className}>
      <Input value={countNum} onChange={handleChange} onBlur={handleBlur} />
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
