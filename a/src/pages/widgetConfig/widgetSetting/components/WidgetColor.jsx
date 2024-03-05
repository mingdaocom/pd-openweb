import React from 'react';
import { Icon, ColorPicker } from 'ming-ui';
import styled from 'styled-components';
import { getColorCountByBg } from 'src/util';

const SelectIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color};
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  margin-right: 4px;
  .hoverMask {
    display: none;
    font-size: 16px;
  }
  .text {
    color: ${props => (props.textColor >= 192 ? '#333' : '#fff')};
  }
  &:hover {
    .text {
      display: none;
    }
    .hoverMask {
      display: block;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      text-align: center;
      line-height: 32px;
      color: #fff;
      z-index: 1;
    }
  }
`;

const NormalIconStyle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 3px;
  cursor: pointer;
  text-align: center;
  line-height: 34px;
  border: 1px solid #e0e0e0;
  background: #f5f5f5;
  span {
    display: inline-block;
    width: 24px;
    height: 24px;
    text-align: center;
    line-height: 26px;
    background: ${props => props.color};
    color: #fff;
  }
`;

export default function WidgetColor({ handleChange, color, text, type, fromWidget }) {
  return (
    <ColorPicker
      sysColor
      isPopupBody
      value={color}
      fromWidget={fromWidget}
      onChange={handleChange}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [-260, 0],
      }}
    >
      {type === 'normal' ? (
        <NormalIconStyle color={color}>
          <span>
            <Icon icon="task_custom_btn_unfold" />
          </span>
        </NormalIconStyle>
      ) : (
        <SelectIcon color={color} textColor={getColorCountByBg(color)}>
          <span className="text">{text}</span>
          <div className="hoverMask">
            <Icon icon="task_custom_btn_unfold" />
          </div>
        </SelectIcon>
      )}
    </ColorPicker>
  );
}
