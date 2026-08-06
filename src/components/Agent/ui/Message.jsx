import React from 'react';
import moment from 'moment';
import styled, { css } from 'styled-components';
import { Icon, PreferenceTime } from 'ming-ui';
import { MarkdownText } from './MarkdownText';
import { colors, radii, spacing, transitions, typography } from './tokens';

const Root = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'stretch')};
  margin-bottom: 0;
  max-width: 100%;
`;

const Header = styled.div`
  display: inline-flex;
  align-items: center;
  margin-bottom: ${spacing.sm};
`;

const Avatar = styled.div`
  display: inline-flex;
  width: ${({ $size }) => ($size === 'large' ? '36px' : '28px')};
  height: ${({ $size }) => ($size === 'large' ? '36px' : '28px')};
  align-items: center;
  justify-content: center;
  border: 1px solid ${colors.border};
  border-radius: ${radii.pill};
  background: ${colors.backgroundMuted};
  overflow: hidden;
  color: ${colors.textMuted};
  font-size: 13px;
  font-weight: 600;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Name = styled.span`
  margin-left: ${({ $strong }) => ($strong ? '10px' : '5px')};
  color: ${colors.text};
  font-size: ${({ $strong }) => ($strong ? '17px' : '15px')};
  font-weight: 600;
  line-height: 24px;
`;

const Content = styled.div`
  max-width: ${({ $role }) => ($role === 'user' ? 'min(100%, 680px)' : '100%')};
  color: ${colors.text};
  font-size: 14px;
  line-height: 24px;

  ${({ $role }) =>
    $role === 'user'
      ? css`
          padding: 8px 10px;
          border-radius: ${radii.userBubble};
          background: ${colors.brandSoftLight};
        `
      : css`
          padding: 0;
        `}
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  height: 32px;
  margin-top: ${spacing.sm};
  opacity: 0;
  transition: opacity ${transitions.hover};

  ${Root}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const Action = styled.button`
  display: inline-flex;
  min-width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: ${radii.item};
  background: transparent;
  padding: 0 10px;
  color: ${colors.textMuted};
  font-family: ${typography.fontFamily};
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  transition:
    color ${transitions.hover},
    background ${transitions.hover};

  &:hover {
    background: ${colors.backgroundHover};
    color: ${colors.text};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Response = styled.div`
  color: ${colors.text};
  margin-top: ${({ $role }) => ($role === 'assistant' ? '12px' : '0')};
`;

// 信用点用量：贴在 assistant 气泡下方的一行小字。最新一条始终显示（$always），旧消息默认透明、hover 整条消息才显现。
// 元信息行（消息时间 + 信用点）：最新一条常驻、旧消息 hover 才显现、移动端常显
const Meta = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  line-height: 24px;
  color: ${colors.textDisabled};
  opacity: ${({ $always }) => ($always ? 1 : 0)};
  transition: opacity ${transitions.hover};

  ${Root}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

// 「费用计算中…」右侧的小刷新按钮：点击重新拉取本轮用量
const CreditsRefresh = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  border: 0;
  padding: 0;
  background: transparent;
  color: ${colors.textDisabled};
  cursor: pointer;
  transition: color ${transitions.hover};

  &:hover {
    color: ${colors.textMuted};
  }

  .icon {
    font-size: 12px;
  }
`;

function formatCredits(credits) {
  return String(credits);
}

// 消息时间：数值为毫秒时间戳，字符串为后端 createTime（兼容 Safari 把 - 换成 /）
// 归一化成 PreferenceTime 可消费的值，非法时间返回 null
function normalizeMessageTime(time) {
  if (!time) return null;
  const normalized = typeof time === 'number' ? time : String(time).replace(/-/g, '/');

  return moment(normalized).isValid() ? normalized : null;
}

// 信用点用量，与时间同一行（间距由 Meta 的 gap 控制）
const MessageCost = styled.span`
  display: inline-flex;
  align-items: center;
`;

export function Message({ role = 'assistant', children, ...props }) {
  return (
    <Root $role={role} {...props}>
      {children}
    </Root>
  );
}

export function MessageHeader({ name, avatarLabel, avatarSrc, strong = false }) {
  return (
    <Header>
      <Avatar $size={strong ? 'large' : 'default'}>
        {avatarSrc ? <AvatarImage src={avatarSrc} alt={name} /> : (avatarLabel ?? name.slice(0, 1))}
      </Avatar>
      <Name $strong={strong}>{name}</Name>
    </Header>
  );
}

export function MessageContent({ role = 'assistant', children, className }) {
  return (
    <Content className={className} $role={role}>
      {children}
    </Content>
  );
}

export function MessageActions({ children, className }) {
  return <Actions className={className}>{children}</Actions>;
}

export function MessageAction(props) {
  return <Action type="button" {...props} />;
}

// assistant 气泡下方的元信息行：消息时间 + 本轮费用。整行最新一条常驻、旧消息 hover 才显现。
// pending=true（用量未结算，a2a 后台还在扣）时费用显示「费用计算中…」+ 刷新按钮，点击重查；否则显示「X 信用点」。
// credits 为 null 且非 pending（如 help-agent 不计费）时只显示时间。
export function MessageMeta({ time, credits, pending = false, always = false, onRefresh }) {
  const timeValue = normalizeMessageTime(time);
  const hasCost = pending || credits != null;

  if (!timeValue && !hasCost) return null;

  return (
    <Meta $always={always || pending}>
      {/* 时间显示与记录消息讨论一致：默认相对时间，点击在「相对/完整」间切换并全局同步 + 用户时区转换 */}
      {!!timeValue && <PreferenceTime value={timeValue} />}
      {hasCost && (
        <MessageCost>
          {pending ? (
            <>
              {_l('费用计算中...')}
              <CreditsRefresh type="button" onClick={onRefresh} title={_l('重新获取')}>
                <Icon icon="refresh1" />
              </CreditsRefresh>
            </>
          ) : (
            _l('%0 信用点', formatCredits(credits))
          )}
        </MessageCost>
      )}
    </Meta>
  );
}

export function MessageResponse({ children, className, role, streaming }) {
  return (
    <Response className={className} $role={role}>
      {typeof children === 'string' ? <MarkdownText streaming={streaming}>{children}</MarkdownText> : children}
    </Response>
  );
}
