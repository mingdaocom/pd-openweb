import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { transitions } from '../ui/tokens';

// 搭建中状态点呼吸动画：不透明度 1 ↔ 0.3，周期 1s
const dotBreath = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

// plan 产出的 appIcon 是 HAP customIcon 字体类（sys_ 前缀），按 URL 渲染 SVG。
const customIconUrl = fileName => `https://fp1.mingdaoyun.cn/customIcon/${fileName}.svg`;

const Wrap = styled.div`
  width: 238px;
  min-width: 238px;
  background: var(--color-background-secondary);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

// 状态盒：36 高 / 5 圆角 / 1px 灰描边 / 白底；左对齐文字 + 右侧 8px 颜色点
// building=橙点(#FF9800)、completed=绿点(#43A047)、failed=红点(#E53935)
const StatusBox = styled.button`
  position: relative;
  margin: 0 10px 12px;
  height: 36px;
  padding: 0 17px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 5px;
  background: var(--color-background-card);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: ${p => (p.$clickable ? 'pointer' : 'default')};
  transition: background ${transitions.hover};

  &:hover {
    ${p => p.$clickable && 'background: var(--color-background-hover);'}
  }
`;

const StatusLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusDot = styled.span`
  position: absolute;
  right: 17px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${p => {
    if (p.$variant === 'building') return '#FF9800';
    if (p.$variant === 'completed') return '#43A047';
    return '#E53935';
  }};
  ${p =>
    p.$variant === 'building' &&
    css`
      animation: ${dotBreath} 1s ease-in-out infinite;
    `}
`;

const AppInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 18px 20px;
`;

// 落地页三栏 + 左栏收起态：应用 icon 左侧的「展开会话列表」按钮（页面最左上角）
const ExpandSidebarBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 2px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all ${transitions.hover};

  .icon {
    font-size: 20px;
    line-height: 1;
  }

  &:hover {
    background: var(--color-background-hover);
    color: var(--color-text-primary);
  }
`;

const AppIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${p => p.$color || 'var(--color-mingo)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  /* SvgIcon 外层 ReactSVG 包了一层 div，统一压成 flex 居中、消除行高基线偏移 */
  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  svg {
    display: block;
  }
`;

const AppName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 10px;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  transition: background ${transitions.hover};
  background: ${p => (p.$active ? 'var(--color-mingo-transparent)' : 'transparent')};

  &:hover {
    background: ${p => (p.$active ? 'var(--color-mingo-transparent)' : 'var(--color-background-hover)')};
  }
`;

const IconCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-background-card);
  border: 1px solid var(--color-border-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  /* 颜色由容器的 $active 驱动并下传给内部 Icon 的 .icon——避免给 styled(Icon) 传 $active
     （styled-components v4 不支持 transient props，会把 $active 透传到 <i> DOM 触发报错） */
  .icon {
    font-size: 18px !important;
    color: ${p => (p.$active ? 'var(--color-mingo)' : 'var(--color-text-tertiary)')};
  }
`;

const NavLabel = styled.div`
  flex: 1;
  min-width: 0;
`;

const NavTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${p => (p.$active ? 'var(--color-mingo)' : 'var(--color-text-primary)')};
  line-height: 20px;

  > span:first-child {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const NavDesc = styled.div`
  font-size: 12px;
  color: var(--color-text-tertiary);
  line-height: 17px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NavCount = styled.span`
  font-size: 12px;
  margin-right: 5px;
  font-weight: 400;
  color: var(--color-text-disabled);
  flex-shrink: 0;
`;

const AppEmblem = styled(Icon)`
  font-size: 20px !important;
  color: var(--color-text-inverse);
`;

// 空窗骨架：与右侧 SkeletonPanel 同款扫光配色，渲染成与 NavItem 等高的占位行，
// 避免重写重置 / 首次生成起步时左侧出现空白列表。
const navShimmer = keyframes`
  from { background-position: 100% 50%; }
  to { background-position: 0 50%; }
`;

const SkelShimmer = styled.div`
  background: linear-gradient(90deg, var(--skeleton-start), var(--skeleton-middle), var(--skeleton-end));
  background-size: 400% 100%;
  animation: ${navShimmer} 2s ease infinite;
`;

const SkelItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
`;

const SkelCircle = styled(SkelShimmer)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const SkelLines = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const SkelBar = styled(SkelShimmer)`
  height: 12px;
  border-radius: 6px;
  width: ${({ $w }) => $w || '100%'};
`;

function StatusBoxContent({ buildStatus, onStatusClick }) {
  if (!buildStatus || buildStatus === 'idle') return null;

  let label = _l('搭建失败');
  if (buildStatus === 'building') label = _l('搭建中…');
  else if (buildStatus === 'completed') label = _l('打开应用');
  const clickable = buildStatus !== 'failed' && !!onStatusClick;

  return (
    <StatusBox
      type="button"
      $clickable={clickable}
      onClick={clickable ? onStatusClick : undefined}
      disabled={!clickable}
    >
      <StatusLabel>{label}</StatusLabel>
      <StatusDot $variant={buildStatus} />
    </StatusBox>
  );
}

export default function Sidebar({
  appName,
  appIcon,
  appColor,
  items,
  loading,
  activeKey,
  onSelect,
  buildStatus,
  onStatusClick,
  showSidebarExpand = false,
  onExpandSidebar,
}) {
  return (
    <Wrap>
      <AppInfo>
        {showSidebarExpand && (
          <ExpandSidebarBtn type="button" onClick={onExpandSidebar} aria-label={_l('展开会话列表')}>
            <Icon icon="menu_right" />
          </ExpandSidebarBtn>
        )}
        <AppIcon $color={appColor}>
          {appIcon ? <SvgIcon url={customIconUrl(appIcon)} fill="#fff" size={22} /> : <AppEmblem icon="book" />}
        </AppIcon>
        <AppName title={appName}>{appName}</AppName>
      </AppInfo>
      <StatusBoxContent buildStatus={buildStatus} onStatusClick={onStatusClick} />
      <NavList>
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <SkelItem key={`skel-${i}`}>
              <SkelCircle />
              <SkelLines>
                <SkelBar $w="55%" />
                <SkelBar $w="80%" />
              </SkelLines>
            </SkelItem>
          ))}
        {!loading &&
          items.map(item => {
            const active = activeKey === item.key;
            return (
              <NavItem key={item.key} $active={active} onClick={() => onSelect(item.key)}>
                <IconCircle $active={active}>
                  <Icon icon={item.icon} />
                </IconCircle>
                <NavLabel>
                  <NavTitle $active={active}>
                    <span>{item.title}</span>
                    {item.count != null && <NavCount>{item.count}</NavCount>}
                  </NavTitle>
                  {item.description && <NavDesc>{item.description}</NavDesc>}
                </NavLabel>
              </NavItem>
            );
          })}
      </NavList>
    </Wrap>
  );
}
