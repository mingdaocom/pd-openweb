import React from 'react';
import styled, { css } from 'styled-components';
import { Icon } from 'ming-ui';
import { colors, radii, spacing } from './tokens';

// 意图弹层确认卡片（路径 E）：build "继续"/模糊表达时，后端对「有进度」会话跑意图分类器，
// 判 rebuild / 低置信 / unrelated 后经 completed{status:awaiting_rebuild_confirmation} 弹层让用户定夺。
// action 取值对应后端 confirmation.action：resume / rebuild / none_of_these。
// options 由后端按 build 状态动态下发（未完成给 resume，已完成不给；rebuild 始终给；逃生口给 none_of_these）。
const ACTION_LABELS = {
  resume: _l('继续生成'),
  rebuild: _l('重新生成'),
  none_of_these: _l('都不是'),
};

const ACTION_HINTS = {
  resume: _l('从上次中断处接着搭建'),
  rebuild: _l('放弃已建内容，重新搭建'),
  none_of_these: _l('我想做点别的'),
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
export default function RebuildConfirmCard({ part, disabled, onConfirm }) {
  const options = Array.isArray(part.options) && part.options.length ? part.options : ['resume', 'rebuild'];

  if (part.status === 'resolved') {
    const label = ACTION_LABELS[part.chosenAction] || part.chosenAction;

    return (
      <Card>
        <IconBox>
          <Icon icon="info" />
        </IconBox>
        <Body>
          <Title>{_l('请确认下一步操作')}</Title>
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
        <Title>{_l('请确认下一步操作')}</Title>
        <Desc>{_l('请选择你想如何继续：')}</Desc>
        <Actions>
          {options.map(action => (
            <ActionPill
              key={action}
              $primary={action === 'resume'}
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
