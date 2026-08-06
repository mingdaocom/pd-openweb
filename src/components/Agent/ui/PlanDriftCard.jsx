import React from 'react';
import styled, { css } from 'styled-components';
import { Icon } from 'ming-ui';
import { colors, radii, spacing } from './tokens';

// plan 漂移确认卡片：build "继续" 时后端检测到本次方案与上次中断时的方案不一致（plan hash 不同），
// 暂停主流程等用户二选一。action 取值对应后端 WorkflowConstants.PlanDriftActions。
// 视觉语言对齐 PlanCard：左侧 IconBox + 右侧 Body，操作走 pill 描边风格（与 BuildProgress 的 DonePill 一致）。
const ACTION_LABELS = {
  rebuild: _l('重新搭建'),
  resume_with_old_plan: _l('按原方案继续'),
};

const ACTION_HINTS = {
  rebuild: _l('放弃已建内容，按新方案从头创建一个新应用'),
  resume_with_old_plan: _l('忽略本次方案改动，沿用上次方案接着搭建'),
};

const Card = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  margin-top: 12px;
  border-radius: ${radii.card};
  border: 1px solid ${colors.border};
  background: ${colors.background};
`;

const IconBox = styled.div`
  flex-shrink: 0;
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${colors.warning};
  color: #fff;

  i {
    font-size: 18px;
    color: #fff;
  }
`;

const Body = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
`;

const Desc = styled.div`
  font-size: 13px;
  color: ${colors.textMuted};
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.md};
  margin-top: ${spacing.sm};
`;

const ActionPill = styled.span`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: ${radii.pill};
  border: 1px solid ${colors.borderStrong};
  background: ${colors.background};
  color: ${colors.textMuted};
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: ${colors.borderHover};
    color: ${colors.text};
  }

  ${({ $primary }) =>
    $primary &&
    css`
      border-color: ${colors.brand};
      color: ${colors.brand};

      &:hover {
        border-color: ${colors.brand};
        color: ${colors.brand};
        background: ${colors.brandSoft};
      }
    `}

  ${({ $disabled }) =>
    $disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none;
    `}
`;

const Resolved = styled.div`
  font-size: 13px;
  color: ${colors.textSubtle};
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
`;

// part：{ options: string[], status: 'pending' | 'resolved', chosenAction?: string }
// disabled：流式进行中或本卡片已被其它操作占用时禁用按钮
// onConfirm(action)：用户点选后回传选择的 action
export default function PlanDriftCard({ part, disabled, onConfirm }) {
  const options =
    Array.isArray(part.options) && part.options.length ? part.options : ['resume_with_old_plan', 'rebuild'];

  if (part.status === 'resolved') {
    const label = ACTION_LABELS[part.chosenAction] || part.chosenAction;

    return (
      <Card>
        <IconBox>
          <Icon icon="info" />
        </IconBox>
        <Body>
          <Title>{_l('搭建方案有变化')}</Title>
          <Resolved>{_l('已选择：%0', label)}</Resolved>
        </Body>
      </Card>
    );
  }

  return (
    <Card>
      <IconBox>
        <Icon icon="info" />
      </IconBox>
      <Body>
        <Title>{_l('检测到搭建方案有变化')}</Title>
        <Desc>{_l('本次的方案与上次中断时不一致，请选择如何继续：')}</Desc>
        <Actions>
          {options.map(action => (
            <ActionPill
              key={action}
              $primary={action === 'resume_with_old_plan'}
              $disabled={disabled}
              title={ACTION_HINTS[action] || ''}
              onClick={() => !disabled && onConfirm(action)}
            >
              {ACTION_LABELS[action] || action}
            </ActionPill>
          ))}
        </Actions>
      </Body>
    </Card>
  );
}
