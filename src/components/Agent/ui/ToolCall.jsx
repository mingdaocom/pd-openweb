import React, { isValidElement, useState } from 'react';
import { CheckCircleIcon, CircleIcon, Clock3Icon, XCircleIcon } from 'lucide-react';
import styled from 'styled-components';
import { CodeBlock } from './CodeBlock';
import { IconChevronDown, IconTool } from './icons';
import { colors, spacing, transitions } from './tokens';

const statusMap = {
  pending: { text: colors.textSubtle, label: _l('等待中'), icon: <CircleIcon size={13} /> },
  running: { text: colors.info, label: _l('运行中'), icon: <Clock3Icon size={13} /> },
  completed: { text: colors.success, label: _l('已完成'), icon: <CheckCircleIcon size={13} /> },
  denied: { text: colors.warning, label: _l('已拒绝'), icon: <XCircleIcon size={13} /> },
  error: { text: colors.error, label: _l('出错'), icon: <XCircleIcon size={13} /> },
};

const Root = styled.section`
  margin-top: 10px;
`;

const Header = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md};
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
`;

const Title = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  overflow: hidden;
  min-width: 0;
  color: ${colors.textMuted};
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;

  svg {
    width: 14px;
    height: 14px;
    color: ${colors.textMuted};
    flex: 0 0 auto;
  }
`;

const Meta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

// 用 span 承载 $open 旋转：styled(lucide 图标) 在 styled-components v4 下会把 $open 透传到 <svg>
// 触发「Invalid attribute name」；包一层 DOM 元素由其过滤掉 $open，图标本身保持纯净。
const Chevron = styled.span`
  display: inline-flex;
  width: 16px;
  height: 16px;
  color: ${colors.textMuted};
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  transition: transform ${transitions.expand};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${colors.textMuted};
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;

  svg {
    color: ${({ $status }) => statusMap[$status].text};
  }
`;

const Content = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 8px;
  padding-left: 20px;
  border-left: 1px solid ${colors.border};
`;

const Section = styled.div`
  display: grid;
  gap: 6px;
`;

const Label = styled.div`
  color: ${colors.textMuted};
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
`;

const Plain = styled.div`
  color: ${({ $tone }) => ($tone === 'error' ? colors.error : colors.textMuted)};
  font-size: 13px;
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const RunningState = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  color: ${colors.textMuted};
  font-size: 13px;
  line-height: 20px;

  span {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: currentColor;
    opacity: 0.28;
    animation: toolcall-loading 1.2s ease-in-out infinite;
  }

  span:nth-child(2) {
    animation-delay: 0.16s;
  }

  span:nth-child(3) {
    animation-delay: 0.32s;
  }

  @keyframes toolcall-loading {
    0%,
    80%,
    100% {
      opacity: 0.28;
      transform: translateY(0);
    }

    40% {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }
`;

function inferLanguage(value) {
  const normalized = value.trim();

  if (!normalized) return 'text';
  if (normalized.startsWith('{') || normalized.startsWith('[')) return 'json';
  if (normalized.includes('$ ') || normalized.includes('curl ') || normalized.includes('ping ')) return 'bash';
  return 'text';
}

function renderValue(value, tone = 'default') {
  if (value == null || value === '') return null;
  if (isValidElement(value)) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const hasStructuredShape = value.includes('\n') || trimmed.startsWith('{') || trimmed.startsWith('[');

    if (hasStructuredShape) {
      return <CodeBlock code={value} language={inferLanguage(value)} />;
    }
    return <Plain $tone={tone}>{value}</Plain>;
  }

  if (typeof value === 'object') {
    return <CodeBlock code={JSON.stringify(value, null, 2)} language="json" />;
  }
  return <Plain $tone={tone}>{String(value)}</Plain>;
}

export function ToolCall({ title, status, input, output, error, defaultOpen = false, className }) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = statusMap[status];

  return (
    <Root className={className}>
      <Header type="button" onClick={() => setOpen(v => !v)}>
        <Title>
          <IconTool />
          {title}
        </Title>
        <Meta>
          {meta && (
            <Status $status={status}>
              {meta.icon}
              {meta.label}
            </Status>
          )}
          <Chevron $open={open}>
            <IconChevronDown />
          </Chevron>
        </Meta>
      </Header>
      {open && (
        <Content>
          {input && (
            <Section>
              <Label>{_l('输入')}</Label>
              {renderValue(input)}
            </Section>
          )}
          {status === 'running' && !output && !error && (
            <Section>
              <Label>{_l('输出')}</Label>
              <RunningState aria-label={_l('执行中')}>
                <span />
                <span />
                <span />
              </RunningState>
            </Section>
          )}
          {output && (
            <Section>
              <Label>{_l('输出')}</Label>
              {renderValue(output)}
            </Section>
          )}
          {error && (
            <Section>
              <Label>{_l('错误')}</Label>
              {renderValue(error, 'error')}
            </Section>
          )}
        </Content>
      )}
    </Root>
  );
}
