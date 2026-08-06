import React, { useState } from 'react';
import styled from 'styled-components';
import { IconChevronDown, IconChevronRight } from './icons';
import { MarkdownText } from './MarkdownText';
import { Reasoning } from './Reasoning';
import { colors, spacing } from './tokens';

const Root = styled.section`
  margin: ${p => (p.$open ? '8px 0' : '8px 0 0')};
`;

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  border: 0;
  background: transparent;
  padding: 0;
  color: ${colors.textMuted};
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;

  svg.chev {
    width: 16px;
    height: 16px;
    color: ${colors.textSubtle};
  }
`;

const Label = styled.span`
  font-weight: 600;
  color: ${colors.textMuted};
`;

const Duration = styled.span`
  color: ${colors.textSubtle};
`;

// 展开内容：左竖线 + 一层缩进，与「已思考」交互保持一致
const Content = styled.div`
  margin-top: 8px;
  padding-left: 20px;
  border-left: 1px solid ${colors.border};
  color: ${colors.text};
`;

function formatDuration(ms) {
  if (!ms || ms < 0) return '';
  // 有测得耗时但不足 1 秒时按 1 秒计，避免出现无意义的「0秒」
  const sec = Math.max(1, Math.floor(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;

  if (m > 0) return _l('%0分%1秒', m, s);
  return _l('%0秒', s);
}

// 工作阶段：<workEnd /> 之前的所有部件折叠成「已工作」，点击展开。items 为有序子部件，
// reasoning 嵌成可再次展开的「已思考」折叠块（限高、用切分时算好的真实时长），text 为正文叙述，
// 一并缩进收纳在「已工作」里。时长由流式层捕获的 startedAt / finishedAt 计算（组件出现时该阶段已结束）。
export function WorkPhase({ items = [], startedAt, finishedAt, defaultOpen = false, className }) {
  const [open, setOpen] = useState(defaultOpen);
  const duration = startedAt && finishedAt ? formatDuration(finishedAt - startedAt) : '';

  return (
    <Root className={className} $open={open}>
      <Trigger type="button" onClick={() => setOpen(v => !v)}>
        {open ? <IconChevronDown className="chev" /> : <IconChevronRight className="chev" />}
        <Label>{_l('已工作')}</Label>
        {duration && <Duration>{duration}</Duration>}
      </Trigger>
      {open && (
        <Content>
          {items.map((child, idx) =>
            child.kind === 'reasoning' ? (
              <Reasoning key={`wr-${idx}`} startedAt={child.ts} finishedAt={child.finishedAt}>
                {child.text}
              </Reasoning>
            ) : (
              <MarkdownText key={`wt-${idx}`}>{child.text || ''}</MarkdownText>
            ),
          )}
        </Content>
      )}
    </Root>
  );
}

export default WorkPhase;
