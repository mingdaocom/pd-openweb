import React from 'react';
import { string } from 'prop-types';
import { Button } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import SelectCount from './SelectCount';
import BtnListSort from './BtnListSort';

const BTN_STYLE = [
  {
    icon: 'Rectangle',
    value: 1,
    tip: _l('实心矩形'),
  },
  {
    icon: 'capsule',
    value: 2,
    tip: _l('圆角矩形'),
  },
  {
    icon: 'Empty',
    value: 3,
    tip: _l('虚线'),
  },
];
const BTN_WIDTH = [
  {
    icon: 'Adaptive',
    value: 2,
    tip: _l('自适应文字'),
  },
  {
    icon: 'padding',
    value: 1,
    tip: _l('等分'),
  },
];
const SettingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  .addBtn {
    width: 120px;
    box-sizing: border-box;
    height: 32px;
    line-height: 32px;
    padding: 0 20px 0 16px;
    border-radius: 18px;
    background-color: #fff;
    font-weight: bold;
    color: #2196f3;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.24);
    &:hover {
      background-color: rgba(255, 255, 255, 0.8);
      color: #1079cc;
    }
  }
  .btnGroupSettingWrap {
    display: flex;
    align-items: center;
    .itemTitle {
      margin: 0 10px 0 24px;
      font-size: 13px;
    }
    .btnStyle,
    .btnWidth {
      display: flex;
      border-radius: 3px;
      border: 1px solid #ddd;
      li {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 40px;
        height: 30px;
        border-right: 1px solid #ddd;
        color: #9e9e9e;
        font-size: 20px;
        cursor: pointer;
        &:last-child {
          border: none;
        }
        &.active {
          background-color: #fff;
          color: #2196f3;
        }
      }
    }
  }
`;
export default function BtnGroupSetting(props) {
  const { style = 2, width, setSetting, addBtn, count } = props;
  return (
    <SettingWrap>
      <Button icon="add" className="addBtn overflow_ellipsis" onClick={addBtn}>
        {_l('添加按钮')}
      </Button>
      <div className="btnGroupSettingWrap">
        <BtnListSort {...props} onSortEnd={list => setSetting({ buttonList: list })} />
        <div className="itemTitle overflow_ellipsis">{_l('风格')}</div>
        <ul className="btnStyle">
          {BTN_STYLE.map(({ icon, value, tip }) => (
            <li
              className={cx({ active: value === style })}
              key={value}
              data-tip={tip}
              onClick={() => setSetting({ style: value })}>
              <i className={`icon-${icon}`}></i>
            </li>
          ))}
        </ul>
        <div className="itemTitle overflow_ellipsis">{_l('宽度')}</div>
        <ul className="btnWidth">
          {BTN_WIDTH.map(({ icon, value, tip }) => (
            <li
              className={cx({ active: value === width })}
              key={value}
              data-tip={tip}
              onClick={() => setSetting({ width: value })}>
              <i className={`icon-${icon}`}></i>
            </li>
          ))}
        </ul>
        <div className="itemTitle overflow_ellipsis">{_l('每行最多')}</div>
        <SelectCount maxCount={8} minCount={1} count={count} onChange={value => setSetting({ count: value })} />
        <div>{_l('个')}</div>
      </div>
    </SettingWrap>
  );
}
