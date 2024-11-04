import React, { useRef, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import 'rc-trigger/assets/index.css';
import _ from 'lodash';

const SelectCountWrap = styled.div`
  display: flex;
  cursor: pointer;
  margin-right: 10px;
  position: relative;
  .countWrap {
    box-sizing: border-box;
    line-height: 30px;
    padding: 0 25px 0 10px;
    background: #fff;
    border-radius: 3px;
  }
  .operateWrap {
    position: absolute;
    top: 0;
    right: 0;
    .item {
      color: #9e9e9e;
      display: flex;
      width: 26px;
      height: 15px;
      justify-content: center;
      align-items: center;
      &:hover {
        color: #2196f3;
      }
    }
    .add {
      padding-top: 1px;
    }
    .sub {
      padding-bottom: 3px;
    }
  }
  .disabled {
    color: #dddddd !important;
    &:hover {
    }
  }
`;

const CountList = styled.ul`
  padding: 6px 0;
  flex-direction: column;
  min-width: 60px;
  max-height: 300px;
  overflow-y: auto;
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
const CLOSE_SECTION = {
  label: _l('关闭'),
  value: false,
};
export default function SelectCount({
  count = 5,
  maxCount = 10,
  minCount = 0,
  onChange,
  needCloseSelect = false,
  suffix = '',
  mode = 'default',
}) {
  const $ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const getList = () =>
    (needCloseSelect ? [CLOSE_SECTION.value] : []).concat(
      Array.from({ length: maxCount - minCount + 1 }).map((v, i) => i + minCount),
    );
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
        getPopupContainer={() => $ref.current}
        popup={
          <CountList style={{ minWidth: _.get($ref, 'current.clientWidth') }}>
            {getList().map(item => (
              <li
                key={item}
                className={cx({ active: item === count })}
                onClick={() => {
                  onChange(item);
                  setVisible(false);
                }}
              >
                {CLOSE_SECTION.value === item ? CLOSE_SECTION.label : `${item}${suffix}`}
              </li>
            ))}
          </CountList>
        }
      >
        <div className="countWrap">{CLOSE_SECTION.value === count ? CLOSE_SECTION.label : `${count}${suffix}`}</div>
      </Trigger>
      {mode === 'default' ? (
        <div className="operateWrap">
          <div
            className={cx('add item', { disabled: count === maxCount })}
            onClick={() => onChange(Math.min(maxCount, count + 1))}
          >
            <i className="icon-arrow-up-border"></i>
          </div>
          <div
            className={cx('sub item', { disabled: count === minCount })}
            onClick={() => onChange(Math.max(minCount, count - 1))}
          >
            <i className="icon-arrow-down-border"></i>
          </div>
        </div>
      ) : (
        <div className="operateWrap h100 flexColumn justifyContentCenter">
          <div className="item" onClick={() => setVisible(true)}>
            <i className="icon-arrow-down-border"></i>
          </div>
        </div>
      )}
    </SelectCountWrap>
  );
}
