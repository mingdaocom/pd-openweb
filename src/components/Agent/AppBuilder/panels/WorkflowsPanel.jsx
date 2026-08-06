import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { CardEditButton, PanelWrap } from './_shared';

// workflows.json schema：
//   { name, description,
//     trigger: { type: worksheet_event|schedule|date_field, source, label },
//     intentHints: [{ label }] }

const TRIGGER_CONFIG = {
  worksheet_event: {
    label: _l('工作表事件触发'),
    badgeBorder: 'var(--color-warning-border)',
    badgeColor: 'var(--color-warning)',
    badgeBg: 'var(--color-warning-bg)',
    iconName: 'table',
    iconColor: 'var(--color-warning)',
  },
  schedule: {
    label: _l('定时触发'),
    badgeBorder: 'var(--color-success-border)',
    badgeColor: 'var(--color-success)',
    badgeBg: 'var(--color-success-bg)',
    iconName: 'access_alarm',
    iconColor: 'var(--color-success)',
  },
  date_field: {
    label: _l('日期触发'),
    badgeBorder: 'var(--color-info-border)',
    badgeColor: 'var(--color-info)',
    badgeBg: 'var(--color-info-bg)',
    iconName: 'event',
    iconColor: 'var(--color-info)',
  },
  custom_action: {
    label: _l('自定义动作触发'),
    badgeBorder: 'var(--color-mingo-light)',
    badgeColor: 'var(--color-mingo-dark)',
    badgeBg: 'var(--color-mingo-transparent-light)',
    iconName: 'custom_actions',
    iconColor: 'var(--color-mingo-dark)',
  },
};

const WfCard = styled.div`
  position: relative;
  background: var(--color-background-card);
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  padding: 16px 20px;
  padding-right: 40px;
  box-shadow: var(--shadow-sm);

  /* 「修改」icon 默认隐藏，hover 卡片时显示 */
  &:hover .card-edit-btn {
    opacity: 1;
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const WfName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 24px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TriggerBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  border: 1px solid ${p => p.$border || 'var(--color-border-secondary)'};
  background: ${p => p.$bg || 'var(--color-background-card)'};
  font-size: 12px;
  color: ${p => p.$color || 'var(--color-text-tertiary)'};
  white-space: nowrap;
  flex-shrink: 0;
`;

const Description = styled.div`
  font-size: 13px;
  color: var(--color-text-title);
  line-height: 20px;
  margin-top: 8px;
`;

const StepsRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const StepChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border-radius: 5px;
  border: 1px solid var(--color-border-secondary);
  /* 卡片内标签统一：12px + 灰底 */
  background: var(--color-background-secondary);
  font-size: 12px;
  color: var(--color-text-primary);
  max-width: 340px;
  overflow: hidden;

  .icon {
    font-size: 16px !important;
    flex-shrink: 0;
  }
`;

const StepText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;

const ArrowIcon = styled(Icon)`
  font-size: 16px !important;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
`;

export default function WorkflowsPanel({ workflows }) {
  const list = Array.isArray(workflows) ? workflows : [];

  return (
    <PanelWrap>
      {list.map((wf, i) => {
        const trigger = wf.trigger || {};
        const cfg = TRIGGER_CONFIG[trigger.type] || {
          label: trigger.type || _l('未知触发'),
          badgeBorder: 'var(--color-border-secondary)',
          badgeColor: 'var(--color-text-tertiary)',
          iconName: 'workflow',
          iconColor: 'var(--color-text-tertiary)',
        };
        const hints = Array.isArray(wf.intentHints) ? wf.intentHints : [];
        // Trigger chip 文本：worksheet_event/date_field 拼 source + label；schedule 只用 label
        const triggerChipText =
          (trigger.type === 'worksheet_event' || trigger.type === 'date_field') && trigger.source
            ? `${trigger.source} · ${trigger.label || ''}`
            : trigger.label || cfg.label;

        return (
          <WfCard key={wf.name || i}>
            <CardEditButton moduleLabel={_l('工作流')} cardName={wf.name || _l('（未命名）')} />
            <CardTop>
              <WfName>{wf.name || _l('（未命名）')}</WfName>
              <TriggerBadge $border={cfg.badgeBorder} $color={cfg.badgeColor} $bg={cfg.badgeBg}>
                {cfg.label}
              </TriggerBadge>
            </CardTop>

            {wf.description && <Description>{wf.description}</Description>}

            {(triggerChipText || hints.length > 0) && (
              <StepsRow>
                {triggerChipText && (
                  <StepChip title={triggerChipText}>
                    <Icon icon={cfg.iconName} style={{ color: cfg.iconColor }} />
                    <StepText>{triggerChipText}</StepText>
                  </StepChip>
                )}
                {hints.map((hint, hi) => {
                  const text = hint.label || '';

                  return (
                    <Fragment key={hi}>
                      <ArrowIcon icon="navigate_next" />
                      <StepChip title={text}>
                        <StepText>{text}</StepText>
                      </StepChip>
                    </Fragment>
                  );
                })}
              </StepsRow>
            )}
          </WfCard>
        );
      })}
    </PanelWrap>
  );
}
