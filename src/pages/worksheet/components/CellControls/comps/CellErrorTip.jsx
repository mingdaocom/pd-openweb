import React, { useState } from 'react';
import _ from 'lodash';
import { bool, func, node, oneOf, oneOfType, string } from 'prop-types';
import styled from 'styled-components';
import { Popover } from 'ming-ui/antd-components';

const Con = styled.div`
  position: ${({ $inPopup }) => ($inPopup ? 'relative' : 'absolute')};
  z-index: 1002;
  ${({ $inPopup, $pos }) => !$inPopup && `${$pos === 'top' ? 'top' : 'bottom'}: -26px;`}
  left: 0;
  white-space: nowrap;
  padding: 0 8px;
  height: 26px;
  line-height: 26px;
  font-size: 12px;
  color: var(--color-white);
  background-color: ${({ $color }) => $color || 'var(--color-error)'};
  .delIcon {
    cursor: pointer;
    color: rgba(0, 0, 0, 0.24);
    margin-left: 8px;
    &:hover {
      color: rgba(0, 0, 0, 0.5);
    }
  }
`;

const ERROR_TIP_POPOVER_STYLES = {
  container: {
    padding: 0,
    background: 'transparent',
    boxShadow: 'none',
  },
};

// 提示要像原来内联渲染时那样紧贴单元格边缘（三角压在单元格边框上），因此去掉浮层默认的间距；
// 朝上、朝下由调用方按行位置指定，不做自动翻转，否则三角方向会和提示位置相反
const ERROR_TIP_POPOVER_PLACEMENTS = {
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, 0],
    overflow: { adjustX: true },
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 0],
    overflow: { adjustX: true },
  },
};

const Angle = styled.div`
  position: absolute;
  ${({ $pos }) => `${$pos === 'top' ? 'bottom' : 'top'}: -6px;`}
  left: 0;
  border: 3px solid transparent;
  border-left-color: ${({ $color }) => $color || 'var(--color-error)'};
  ${({ $pos, $color }) =>
    $pos === 'top'
      ? `border-top-color: ${$color || 'var(--color-error)'};`
      : `border-bottom-color: ${$color || 'var(--color-error)'};`}
`;

function CellErrorTipContent(props) {
  const { pos = 'top', error, color, inPopup } = props;
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <Con $pos={pos} $color={color} $inPopup={inPopup}>
      <Angle $color={color} $pos={pos} />
      {error}
      <i className="icon-close mLeft8 delIcon" onClick={() => setClosed(true)} />
    </Con>
  );
}

export default function CellErrorTip(props) {
  const { error } = props;

  if (!error) return null;

  // 用 error 做 key，错误变化时重新挂载，手动关掉的提示不会影响下一个错误的展示
  return <CellErrorTipContent key={error} {...props} />;
}

CellErrorTip.propTypes = {
  pos: oneOf(['top', 'bottom']),
  error: string,
  inPopup: bool,
  updateErrorState: func,
};

// 表格 main 区域由 react-window 渲染，带 will-change: transform 会形成层叠上下文，且 overflow: hidden，
// 挂在其中的错误提示既会被裁剪，也盖不过之后渲染的底部统计行（bottom-*）。
// 表格根容器（.sheetViewTable）没有裁剪也不在该层叠上下文内，提示挂到这里可以同时绕开两者。
function getErrorTipContainer(popupContainer) {
  const con = _.isFunction(popupContainer) ? popupContainer() : popupContainer;

  return (con && _.isFunction(con.closest) && con.closest('.sheetViewTable')) || con || document.body;
}

/**
 * 把错误提示以浮层方式渲染在表格根容器上。
 * 单元格编辑浮层自身是 overflow: hidden 的，提示不论朝上还是朝下都会溢出被裁剪，因此表格内的提示都走这里
 */
export function CellErrorTipTrigger(props) {
  const { visible, error, color, pos = 'bottom', popupContainer, children } = props;

  return (
    <Popover
      noPadding
      builtinPlacements={ERROR_TIP_POPOVER_PLACEMENTS}
      trigger={[]}
      open={!!visible && !!error}
      content={<CellErrorTip inPopup error={error} color={color} pos={pos} />}
      getPopupContainer={() => getErrorTipContainer(popupContainer)}
      placement={pos === 'top' ? 'topLeft' : 'bottomLeft'}
      styles={ERROR_TIP_POPOVER_STYLES}
    >
      {children}
    </Popover>
  );
}

CellErrorTipTrigger.propTypes = {
  visible: bool,
  error: string,
  color: string,
  pos: oneOf(['top', 'bottom']),
  popupContainer: oneOfType([func, node]),
  children: node,
};
