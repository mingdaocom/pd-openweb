import React from 'react';
import styled, { keyframes } from 'styled-components';

// common
const commonInput = `
  border: 1px solid #ddd;
  border-radius: 3px;
  background: #fff;
  resize: none;
  width: 100%;
  padding: 10px;
  font-size: 13px;
  &::placeholder {
    color: #bdbdbd;
  }
`;

export const commonShadow = `
  box-shadow: 0px 4px 18px rgba(0, 0, 0, 0.16);
`;

// 函数
const numberToPx = number => (number ? `${number}px` : '');

// 基础形状
export const Circle = styled.div(
  ({ width = 20 }) => `
  display: inline-block;
  width: ${width}px;
  height: ${width}px;
  border-radius: ${width / 2}px;
`,
);
export const CustomButton = styled.div(
  ({
    fontSize = 13,
    height = 36,
    borderRadius = 3,
    padding = '0 16px',
    bg = '#F8F8F8',
    color = '#757575',
    hoverBg,
    hoverColor,
  }) => `
  cursor: pointer;
  font-size: ${fontSize}px;
  height: ${height}px;
  line-height: ${height}px;
  border-radius: ${borderRadius}px;
  padding: ${padding};
  background-color: ${bg};
  color: ${color};
  &:hover {
    background-color: ${hoverBg || bg};
    color: ${hoverColor || color};
  }
`,
);

// html 元素
export const Hr = styled.div(
  ({ color = '#E8E8E8' }) => `border: none; border-top: 1px solid ${color}; margin: 20px 0;`,
);
const H = styled.div`
  color: #333;
  font-weight: bold;
  vertical-align: middle;
  margin: 16px 0;
`;
export const H1 = styled(H)`
  font-size: 17px;
`;
export const H2 = styled(H)`
  font-size: 15px;
`;
export const H3 = styled(H)`
  font-size: 13px;
  margin: 20px 0 10px;
`;

export const Bold600 = styled.div`
  font-weight: 600;
`;

// 组件
export const Tip75 = styled.div`
  color: #757575;
  font-size: 13px;
`;
export const Tip9e = styled.div`
  color: #9e9e9e;
  font-size: 13px;
`;
export const Tip99 = styled.div`
  color: #999999;
  font-size: 13px;
`;
export const Tipbd = styled.div`
  color: #bdbdbd;
  font-size: 13px;
`;
export const TipBlock = styled.div(
  ({ color = '#9e9e9e', bgcolor = '#f5f5f5' }) => `
  color: ${color};
  font-size: 13px;
  background-color: ${bgcolor};
  padding: 12px;
`,
);

export const TextBlock = styled.div`
  border-radius: 3px;
  height: 36px;
  line-height: 36px;
  background-color: #f1f1f1;
  color: #333;
  font-size: 14px;
  padding: 0 10px;
`;

export const BorderBox = styled(TextBlock)`
  ${commonInput}
  input {
    border: none;
    background: inherit;
    font-size: inherit;
    width: 100%;
    margin-left: -1px;
  }
`;

export const Textarea = styled.textarea`
  ${commonInput}
`;

export const Absolute = styled.div(
  ({ top, bottom, left, right, children }) => `
  position: absolute;
  top: ${numberToPx(top)};
  bottom: ${numberToPx(bottom)};
  left: ${numberToPx(left)};
  right: ${numberToPx(right)};
`,
);

export const Fixed = styled.div(
  ({ top, bottom, left, right, children }) => `
  position: fixed;
  top: ${numberToPx(top)};
  bottom: ${numberToPx(bottom)};
  left: ${numberToPx(left)};
  right: ${numberToPx(right)};
`,
);

export const BlackBtn = styled.span`
  display: inline-block;
  cursor: pointer;
  font-size: 13px;
  margin-left: 16px;
  border-radius: 17px;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2);
  .icon {
    position: relative;
    top: 2px;
    font-size: 18px;
    margin-right: 6px;
  }
  :hover {
    background-color: rgba(0, 0, 0, 0.25);
  }
`;

// 居中

export const VerticalMiddle = styled.div`
  display: flex;
  align-items: center;
`;

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FlexSpacer = styled.div`
  flex: 1;
`;

// animations

export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;
