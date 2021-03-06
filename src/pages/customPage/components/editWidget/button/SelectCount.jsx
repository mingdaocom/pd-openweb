import React, { useRef, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import 'rc-trigger/assets/index.css';

const SelectCountWrap = styled.div`
  display: flex;
  cursor: pointer;
  margin-right: 10px;
  position: relative;
  .countWrap {
    box-sizing: border-box;
    line-height: 30px;
    width: 60px;
    padding: 0 10px;
    background: #fff;
    border-radius: 3px;
  }
  .operateWrap {
    position: absolute;
    top: 0;
    right: 0;
    .item {
      display: flex;
      width: 26px;
      height: 15px;
      justify-content: center;
      align-items: center;
    }
    .add {
      padding-top: 1px;
    }
    .sub {
      padding-bottom: 3px;
    }
  }
`;

const CountList = styled.ul`
  padding: 6px 0;
  flex-direction: column;
  width: 60px;
  border-radius: 2px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.29);
  li {
    box-sizing: border-box;
    padding: 0 12px;
    line-height: 32px;
    transition: all 0.25s;
    cursor: pointer;
    border: none;
    width: 100%;
    &.active,
    &:hover {
      background-color: #2196f3;
      color: #fff;
    }
  }
`;
export default function SelectCount({ count = 5, maxCount = 10, minCount = 0, onChange }) {
  const $ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const getList = () => Array.from({ length: maxCount - minCount + 1 }).map((v, i) => i + minCount);
  return (
    <SelectCountWrap ref={$ref}>
      <Trigger
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 2],
        }}
        popupVisible={visible}
        onPopupVisibleChange={value => setVisible(value)}
        // getPopupContainer={() => $ref.current}
        popup={
          <CountList>
            {getList().map(item => (
              <li
                key={item}
                className={cx({ active: item === count })}
                onClick={() => {
                  onChange(item);
                  setVisible(false);
                }}
              >
                {item}
              </li>
            ))}
          </CountList>
        }
      >
        <div className="countWrap">{count}</div>
      </Trigger>
      <div className="operateWrap">
        <div className={cx('add item Gray_75', { disabled: count === maxCount })} onClick={() => onChange(Math.min(maxCount, count + 1))}>
          <i className="icon-arrow-up-border"></i>
        </div>
        <div className={cx('sub item Gray_75', { disabled: count === minCount })} onClick={() => onChange(Math.max(minCount, count - 1))}>
          <i className="icon-arrow-down-border"></i>
        </div>
      </div>
    </SelectCountWrap>
  );
}
