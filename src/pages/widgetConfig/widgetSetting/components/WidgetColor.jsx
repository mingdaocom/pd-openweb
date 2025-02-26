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
    color: ${props => (props.textColor >= 192 ? '#151515' : '#fff')};
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
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 34px;
  border: 1px solid #e0e0e0;
  background: #fff;
  & > div {
    position: relative;
    width: 24px;
    height: 24px;
    background: ${props => props.color};
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    .line {
      position: absolute;
      width: 135%;
      height: 1px;
      background: #ff0000;
      transform: rotate(45deg);
      transform-origin: left;
    }
  }
`;

export default function WidgetColor({ handleChange, color, text, isNormal = true, fromWidget }) {
  return (
    <ColorPicker
      sysColor
      isPopupBody
      lightBefore
      value={color}
      fromWidget={fromWidget}
      onChange={handleChange}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [-260, 0],
      }}
    >
      {isNormal ? (
        <NormalIconStyle color={color}>
          <div>{!color && <div className="line"></div>}</div>
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
