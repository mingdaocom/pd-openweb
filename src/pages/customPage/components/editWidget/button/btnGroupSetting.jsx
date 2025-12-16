import React, { Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Button } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import BtnListSort from './BtnListSort';
import SelectCount from './SelectCount';

const BTN_TYPE = [
  {
    value: 1,
    text: _l('按钮'),
  },
  {
    value: 2,
    text: _l('图形'),
  },
];
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
const BTN_STYLE2 = [
  {
    icon: 'rounded_square',
    value: 1,
    tip: _l('圆角矩形'),
  },
  {
    icon: 'circle',
    value: 2,
    tip: _l('实心圆形'),
  },
  {
    icon: 'dotted_line',
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
const BTN_DIRECTION = [
  {
    icon: 'up_down',
    value: 1,
    tip: _l('上下'),
  },
  {
    icon: 'left_right',
    value: 2,
    tip: _l('左右'),
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
    color: #1677ff;
    &:hover {
      background-color: rgba(255, 255, 255, 1);
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
      padding: 3px;
      background-color: #e7e7e7;
      li {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 0 10px;
        width: max-content;
        height: 30px;
        line-height: 30px;
        color: #9e9e9e;
        font-size: 20px;
        cursor: pointer;
        &:last-child {
          border: none;
        }
        &.active {
          color: #1677ff;
          border-radius: 3px;
          background-color: #fff;
        }
      }
    }
  }
`;
export default function BtnGroupSetting(props) {
  const { style = 2, width, setSetting, addBtn, count, config } = props;
  const { btnType = 1, direction = 1 } = config || {};
  return (
    <SettingWrap>
      <div className="btnGroupSettingWrap">
        <div className="itemTitle overflow_ellipsis mLeft0">{_l('样式')}</div>
        <ul className="btnStyle mRight20">
          {BTN_TYPE.map(({ value, text }) => (
            <li
              className={cx({ active: value === btnType })}
              key={value}
              onClick={() => {
                setSetting({ config: { ...config, btnType: value } });
              }}
            >
              <div className="Font14 bold">{text}</div>
            </li>
          ))}
        </ul>
        <ul className="btnStyle">
          {(btnType === 1 ? BTN_STYLE : BTN_STYLE2).map(({ icon, value, tip }) => (
            <Tooltip title={tip}>
              <li className={cx({ active: value === style })} key={value} onClick={() => setSetting({ style: value })}>
                <i className={`icon-${icon}`}></i>
              </li>
            </Tooltip>
          ))}
        </ul>
        {btnType === 1 ? (
          <Fragment>
            <div className="itemTitle overflow_ellipsis">{_l('宽度')}</div>
            <ul className="btnWidth">
              {BTN_WIDTH.map(({ icon, value, tip }) => (
                <Tooltip title={tip}>
                  <li
                    className={cx({ active: value === width })}
                    key={value}
                    onClick={() => setSetting({ width: value })}
                  >
                    <i className={`icon-${icon}`}></i>
                  </li>
                </Tooltip>
              ))}
            </ul>
          </Fragment>
        ) : (
          <Fragment>
            <div className="itemTitle overflow_ellipsis">{_l('方向')}</div>
            <ul className="btnWidth">
              {BTN_DIRECTION.map(({ icon, value, tip }) => (
                <Tooltip title={tip}>
                  <li
                    className={cx({ active: value === direction })}
                    key={value}
                    onClick={() => {
                      setSetting({
                        config: { ...config, direction: value },
                        mobileCount: value === 1 ? 4 : 2,
                      });
                    }}
                  >
                    <i className={`icon-${icon}`}></i>
                  </li>
                </Tooltip>
              ))}
            </ul>
          </Fragment>
        )}
        <div className="itemTitle overflow_ellipsis">{_l('每行')}</div>
        <SelectCount maxCount={8} minCount={1} count={count} onChange={value => setSetting({ count: value })} />
        <div>{_l('个')}</div>
        <BtnListSort {...props} onSortEnd={list => setSetting({ buttonList: list })} />
      </div>
      <Button icon="add" className="addBtn overflow_ellipsis" onClick={addBtn}>
        {_l('添加按钮')}
      </Button>
    </SettingWrap>
  );
}
