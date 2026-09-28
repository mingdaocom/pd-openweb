import React, { useState } from 'react';
import { findLastIndex } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ReactRemarkable from './ReactRemarkable';
import Reasoning from './Reasoning';

const Root = styled.div`
  margin: 6px 0 8px;
`;

const Trigger = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  user-select: none;
  .chev {
    width: 16px;
    font-size: 16px;
    color: var(--color-text-tertiary);
  }
  .workLabel {
    font-weight: 600;
    color: var(--color-text-secondary);
  }
`;

// 展开内容：左竖线 + 一层缩进，与「已思考」保持一致，把过程叙述/推理/工具调用缩进收纳其中
const Content = styled.div`
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid var(--color-border-secondary);
`;

// 工作阶段折叠块：最后一条模型消息之前的推理 / 过程叙述 / 工具调用作为有序子部件收纳进来，
// 点击「已工作」展开。参考 Agent 的 WorkPhase：正式回答之前的过程统一折叠，突出最终答案。
export default function WorkPhase({ items = [], renderToolCalls, defaultOpen = false, appId, isCharge }) {
  // 展开态默认跟随 defaultOpen（等待确认时要把确认入口露出来，确认完成后再自动收起），
  // 用户点过之后一律以用户的选择为准
  const [openByUser, setOpenByUser] = useState(null);
  const open = openByUser === null ? defaultOpen : openByUser;
  // 折叠区里最后一个工具调用可能正等着用户确认，渲染时要能把「是不是最后一个」告诉调用方
  const lastToolCallIndex = findLastIndex(items, item => item.type === 'tool_calls');

  return (
    <Root>
      <Trigger onClick={() => setOpenByUser(!open)}>
        <i className={`chev icon icon-arrow-${open ? 'down' : 'right'}-border`} />
        <span className="workLabel">{_l('已工作')}</span>
      </Trigger>
      {open && (
        <Content>
          {items.map((child, idx) => {
            if (child.type === 'reasoning') {
              return <Reasoning key={idx}>{child.text}</Reasoning>;
            }

            if (child.type === 'tool_calls') {
              return (
                <React.Fragment key={idx}>
                  {renderToolCalls
                    ? renderToolCalls(child.toolCalls, { isLastToolCall: idx === lastToolCallIndex })
                    : null}
                </React.Fragment>
              );
            }

            if (child.type === 'text') {
              return child.text && child.text.trim() ? (
                <ReactRemarkable key={idx} markdown={child.text} appId={appId} isCharge={isCharge} />
              ) : null;
            }

            return null;
          })}
        </Content>
      )}
    </Root>
  );
}

WorkPhase.propTypes = {
  items: PropTypes.array,
  renderToolCalls: PropTypes.func,
  defaultOpen: PropTypes.bool,
  appId: PropTypes.string,
  isCharge: PropTypes.bool,
};
