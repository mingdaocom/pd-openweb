import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { CardEditButton, PanelWrap } from './_shared';

// custom-actions.json schema：
//   [{ worksheet, actions: [{ name, description, type, targetWorksheet?, intentHints?: [{ label }] }] }]
// type ∈ updateCurrentRecord / createRelatedRecord / triggerWorkflow

const TYPE_CONFIG = {
  updateCurrentRecord: {
    label: _l('更新当前记录'),
    color: 'var(--color-info)',
    border: 'var(--color-info-border)',
    bg: 'var(--color-info-bg)',
    iconName: 'edit',
  },
  createRelatedRecord: {
    label: _l('新建关联记录'),
    color: 'var(--color-warning)',
    border: 'var(--color-warning-border)',
    bg: 'var(--color-warning-bg)',
    iconName: 'add_circle_outline',
  },
  triggerWorkflow: {
    label: _l('触发工作流'),
    color: 'var(--color-mingo-dark)',
    border: 'var(--color-mingo-light)',
    bg: 'var(--color-mingo-transparent-light)',
    iconName: 'bolt',
  },
};

const WorksheetGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-title);
  line-height: 24px;
  margin-top: 4px;

  .icon {
    font-size: 20px !important;
    color: var(--color-text-tertiary);
  }
`;

const ActionCard = styled.div`
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
  gap: 8px;
`;

const ActionName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 22px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  border: 1px solid ${p => p.$border || 'var(--color-border-secondary)'};
  /* 同色淡底：用类型语义色的浅底变量，胶囊与文字/描边色系统一 */
  background: ${p => p.$bg || 'transparent'};
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
  border: 1px solid var(--color-border-primary);
  /* 卡片内标签统一：12px + 灰底 */
  background: var(--color-background-secondary);
  font-size: 12px;
  color: var(--color-text-primary);
  max-width: 340px;
  overflow: hidden;

  .icon {
    font-size: 16px !important;
    flex-shrink: 0;
    /* 卡片胶囊标签图标统一中性灰，不按类型着色 */
    color: var(--color-text-tertiary);
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

// 目标表跟在动作类型 badge 后常驻卡片 header；保留指向箭头，名称过长省略
const TargetTable = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-primary);
  max-width: 180px;
  flex-shrink: 0;

  .icon {
    font-size: 14px !important;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export default function CustomActionsPanel({ customActions }) {
  const list = Array.isArray(customActions) ? customActions : [];

  if (list.length === 0) {
    return (
      <PanelWrap>
        <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 14, padding: '40px 0' }}>
          {_l('暂无自定义动作')}
        </div>
      </PanelWrap>
    );
  }

  return (
    <PanelWrap>
      {list.map((group, gi) => {
        const actions = Array.isArray(group.actions) ? group.actions : [];

        return (
          <WorksheetGroup key={group.worksheet || gi}>
            <GroupHeader>
              <Icon icon="expand_more" />
              {group.worksheet || _l('（未指定工作表）')}
            </GroupHeader>
            {actions.map((action, ai) => {
              const cfg = TYPE_CONFIG[action.type] || {
                label: action.type || _l('未知类型'),
                color: 'var(--color-text-tertiary)',
                border: 'var(--color-border-secondary)',
                iconName: 'touch_app',
              };
              const hints = Array.isArray(action.intentHints) ? action.intentHints : [];
              const isTriggerWorkflow = action.type === 'triggerWorkflow';
              const triggerChipText = action.name || cfg.label;

              return (
                <ActionCard key={action.name || `${gi}-${ai}`}>
                  <CardEditButton moduleLabel={_l('自定义动作')} cardName={action.name || _l('（未命名）')} />
                  <CardTop>
                    <ActionName>{action.name || _l('（未命名）')}</ActionName>
                    <TypeBadge $border={cfg.border} $color={cfg.color} $bg={cfg.bg}>
                      {cfg.label}
                    </TypeBadge>
                    {!isTriggerWorkflow && action.targetWorksheet && (
                      <TargetTable title={action.targetWorksheet}>
                        <Icon icon="arrow_forward" />
                        <span className="text">{_l('目标表：%0', action.targetWorksheet)}</span>
                      </TargetTable>
                    )}
                  </CardTop>
                  {action.description && <Description>{action.description}</Description>}

                  {/* triggerWorkflow：动作本身当 trigger，后跟 intentHints 箭头链；与 WorkflowsPanel 视觉一致 */}
                  {isTriggerWorkflow && (triggerChipText || hints.length > 0) && (
                    <StepsRow>
                      <StepChip title={triggerChipText}>
                        <Icon icon={cfg.iconName} />
                        <StepText>{triggerChipText}</StepText>
                      </StepChip>
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
                </ActionCard>
              );
            })}
          </WorksheetGroup>
        );
      })}
    </PanelWrap>
  );
}
