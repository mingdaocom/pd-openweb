import React, { Fragment, useState, useEffect } from 'react';
import { Dialog } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import WidgetColor from './WidgetColor';
import _ from 'lodash';

const DynamicColorWrap = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  input {
    width: 140px;
    height: 36px;
    border-radius: 3px;
    padding: 0 12px;
    box-sizing: border-box;
    border: 1px solid #e0e0e0;
    margin-left: 12px;
    &.disabled {
      background: #f5f5f5;
      border: 1px solid #f5f5f5;
    }
  }
  .iconOp {
    color: #9e9e9e;
    cursor: pointer;
    font-size: 18px;
    &:hover {
      color: #757575;
    }
    &.disabled {
      color: #dddddd !important;
      cursor: not-allowed;
    }
  }
`;

const defaultColor = '#2196f3';

export default function NumberDynamicColor(props) {
  const { colors = [], max, handleChange, onClose } = props;
  const [dynamicColor, setDynamicColor] = useState(colors);

  useEffect(() => {
    if (!colors.length) {
      setDynamicColor([{ key: max, value: defaultColor }]);
    }
  }, []);

  const onChange = (obj, index) => {
    const newColors = dynamicColor.map((co, idx) => (idx === index ? Object.assign({}, co, obj) : co));
    setDynamicColor(newColors);
  };

  return (
    <Dialog
      visible
      width={500}
      title={_l('动态颜色')}
      okText={_l('确定')}
      cancelText={_l('取消')}
      onCancel={onClose}
      onOk={() => {
        handleChange(dynamicColor.filter(i => i.key));
        onClose();
      }}
    >
      <Fragment>
        <div className="Gray_9e mBottom24">
          {_l('为进度区间设置颜色。当鼠标悬停或字段值在对应区间，显示该区间设置的颜色。')}
        </div>
        {dynamicColor.map((item, index) => {
          const deleteDisabled = dynamicColor.length === 1;
          return (
            <DynamicColorWrap>
              <span>{_l('当数值≤')}</span>
              <input
                value={item.key}
                disabled={item.key === max}
                onChange={e => onChange({ key: e.target.value }, index)}
                onBlur={() => {
                  const sortColor = _.orderBy(
                    dynamicColor,
                    function (o) {
                      return Number(o.key);
                    },
                    ['desc'],
                  );
                  setDynamicColor(sortColor);
                }}
              />
              <span className="mLeft12 mRight12">{_l('颜色为')}</span>
              <WidgetColor type="normal" color={item.value} handleChange={color => onChange({ value: color }, index)} />
              <span
                className={cx('icon-remove_circle_outline1 iconOp mLeft20', { disabled: deleteDisabled })}
                onClick={() => {
                  if (deleteDisabled) return;
                  setDynamicColor(dynamicColor.filter((i, dx) => dx !== index));
                }}
              ></span>
              <span
                className="icon-add_circle_outline iconOp mLeft12"
                onClick={() => {
                  setDynamicColor([
                    ...dynamicColor.slice(0, index + 1),
                    { key: '', value: defaultColor },
                    ...dynamicColor.slice(index + 1),
                  ]);
                }}
              ></span>
            </DynamicColorWrap>
          );
        })}
      </Fragment>
    </Dialog>
  );
}
