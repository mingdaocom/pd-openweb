import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, InputNumber, Segmented } from 'ming-ui/antd-components';
import BtnListSort from './BtnListSort';

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

const getSegmentedOptions = options => options.map(({ value, text }) => ({ label: text, value }));
const getIconSegmentedOptions = options =>
  options.map(({ icon, value, tip }) => ({ icon: <i className={`icon-${icon} Font20`} />, tooltip: tip, value }));

const SettingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  .btnGroupSettingWrap {
    display: flex;
    align-items: center;
    .itemTitle {
      margin: 0 10px 0 24px;
      font-size: 13px;
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
        <Segmented
          className="bgDisabled mRight20"
          options={getSegmentedOptions(BTN_TYPE)}
          value={btnType}
          onChange={value => setSetting({ config: { ...config, btnType: value } })}
        />
        <Segmented
          className="bgDisabled"
          options={getIconSegmentedOptions(btnType === 1 ? BTN_STYLE : BTN_STYLE2)}
          value={style}
          onChange={value => setSetting({ style: value })}
        />
        {btnType === 1 ? (
          <Fragment>
            <div className="itemTitle overflow_ellipsis">{_l('宽度')}</div>
            <Segmented
              className="bgDisabled"
              options={getIconSegmentedOptions(BTN_WIDTH)}
              value={width}
              onChange={value => setSetting({ width: value })}
            />
          </Fragment>
        ) : (
          <Fragment>
            <div className="itemTitle overflow_ellipsis">{_l('方向')}</div>
            <Segmented
              className="bgDisabled"
              options={getIconSegmentedOptions(BTN_DIRECTION)}
              value={direction}
              onChange={value =>
                setSetting({
                  config: { ...config, direction: value },
                  mobileCount: value === 1 ? 4 : 2,
                })
              }
            />
          </Fragment>
        )}
        <div className="itemTitle overflow_ellipsis">{_l('每行')}</div>
        <InputNumber
          className="mRight10"
          style={{ width: 60 }}
          min={1}
          max={8}
          value={count}
          onChange={value => value !== null && setSetting({ count: value })}
        />
        <div>{_l('个')}</div>
        <BtnListSort {...props} onSortEnd={list => setSetting({ buttonList: list })} />
      </div>
      <Button
        classNames={{ content: 'colorPrimary' }}
        styles={{ root: { border: 'none', boxShadow: 'var(--shadow-sm)' } }}
        shape="round"
        icon={<Icon icon="add" className="colorPrimary" />}
        onClick={addBtn}
      >
        {_l('添加按钮')}
      </Button>
    </SettingWrap>
  );
}
