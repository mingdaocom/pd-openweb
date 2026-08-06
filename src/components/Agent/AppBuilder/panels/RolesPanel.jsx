import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { CardEditButton, PanelWrap } from './_shared';

// 权限 tag 类型图标色：与「类型 badge」语义色统一（工作表=warning / 仪表盘=info / AI助手=mingo）
const WORKSHEET_COLOR = 'var(--color-warning)';
const DASHBOARD_COLOR = 'var(--color-info)';
const AI_ASSISTANT_COLOR = 'var(--color-mingo-dark)';
const TAG_BORDER = 'var(--color-border-primary)';

const RoleCard = styled.div`
  position: relative;
  background: var(--color-background-card);
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  padding: 20px;
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

  /* Checkbox 内部已有 margin-right: 8px，gap 7px → 总间距 15px 对齐设计稿 */
  .Checkbox-box {
    margin-right: 0;
  }
`;

const RoleName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 24px;
`;

// 外部门户角色标签（设计稿「外部」药丸：#1E1E1E 底、白字 12 粗体、圆角全）
const ExternalBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 10px;
  background: var(--color-background-inverse);
  color: var(--color-text-inverse);
  font-size: 12px;
  font-weight: 700;
  line-height: 20px;
  white-space: nowrap;
`;

const Description = styled.div`
  font-size: 13px;
  color: var(--color-text-title);
  line-height: 20px;
  margin-top: 8px;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const PermTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px 0 7px;
  border-radius: 5px;
  border: 1px solid ${TAG_BORDER};
  /* 卡片内标签统一：12px + 灰底（保留彩色图标作类型识别） */
  background: var(--color-background-secondary);
  font-size: 12px;
  color: var(--color-text-primary);
  white-space: nowrap;

  .icon {
    font-size: 16px !important;
    color: ${p => p.$iconColor || 'var(--color-text-primary)'};
  }
`;

// type → { iconColor, icon }；背景统一走灰底，仅图标按类型着色
// 后端权限模型：worksheet 引用工作表，customPage 引用仪表盘（UI 概念叫 dashboard），aiAssistant 引用 AI 助手
const TAG_CONFIG = {
  customPage: {
    iconColor: DASHBOARD_COLOR,
    icon: 'dashboard',
  },
  worksheet: {
    iconColor: WORKSHEET_COLOR,
    icon: 'table',
  },
  aiAssistant: {
    iconColor: AI_ASSISTANT_COLOR,
    // 用单色的 AI_Agent 字形（与 AI 助手 tab 一致）；'ai' 是多色渐变图标，CSS color 盖不住会保留颜色
    icon: 'AI_Agent',
  },
};

function parsePermission(str) {
  const match = typeof str === 'string' ? str.match(/^(.+)\((\w+)\)$/) : null;

  if (match) return { name: match[1].trim(), type: match[2] };
  return { name: String(str), type: 'other' };
}

export default function RolesPanel({ roles }) {
  const list = Array.isArray(roles) ? roles : [];

  return (
    <PanelWrap>
      {list.map((role, i) => {
        const name = role.name || role.roleName || '';
        const perms = Array.isArray(role.permissions) ? role.permissions : [];

        return (
          <RoleCard key={role.roleId || name || i}>
            <CardEditButton moduleLabel={_l('角色')} cardName={name} />
            <CardTop>
              <RoleName>{name}</RoleName>
              {role.roleScope === 'externalPortal' && <ExternalBadge>{_l('外部')}</ExternalBadge>}
            </CardTop>
            {role.description && <Description>{role.description}</Description>}
            {perms.length > 0 && (
              <TagList>
                {perms.map((p, j) => {
                  const { name: pName, type } = parsePermission(p);
                  const cfg = TAG_CONFIG[type] || {};

                  return (
                    <PermTag key={j} $iconColor={cfg.iconColor}>
                      {cfg.icon && <Icon icon={cfg.icon} />}
                      {pName}
                    </PermTag>
                  );
                })}
              </TagList>
            )}
          </RoleCard>
        );
      })}
    </PanelWrap>
  );
}
