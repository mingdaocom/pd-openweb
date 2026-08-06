import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { SvgIcon } from 'ming-ui';
import { colors, radii, spacing } from './tokens';

// plan 产出的 appIcon 是 HAP customIcon 字体类（sys_ 前缀），按 URL 渲染 SVG。
const customIconUrl = fileName => `https://fp1.mingdaoyun.cn/customIcon/${fileName}.svg`;

const flow = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const baseBorder = css`
  position: relative;
  border-radius: ${radii.card};
  border: 1px solid ${colors.borderStrong};
  background: ${colors.backgroundCard};
`;

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-top: 12px;
  min-height: 66px;

  ${baseBorder}

  /* 可点击（带 onClick）时 hover 显示手型，提示卡片可选中 */
  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
    `}

  /* 方案生成全过程（撰写总览 / 生成详情 / 保存版本）外框都跑流动动画，仅 committed 完成后停 */
  ${({ $status }) =>
    $status !== 'committed' &&
    css`
      border: 1px solid transparent;
      background:
        linear-gradient(${colors.background}, ${colors.background}) padding-box,
        linear-gradient(120deg, ${colors.brand}, ${colors.border}, ${colors.brand}) border-box;
      background-size:
        100% 100%,
        200% 100%;
      animation: ${flow} 2.4s linear infinite;
    `}

  /* 选中态仅在生成完成后体现（生成中由动画外框接管） */
  ${({ $selected, $status }) =>
    $selected &&
    $status === 'committed' &&
    css`
      border-color: ${colors.brand};
      background: ${colors.brandSoftLight};
    `}
`;

const IconBox = styled.div`
  flex-shrink: 0;
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${p => p.$color || 'var(--color-success)'};
  color: #fff;

  i {
    font-size: 20px;
    color: #fff;
  }

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

const Body = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Status = styled.div`
  font-size: 12px;
  color: ${colors.textSubtle};
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const VersionBadge = styled.span`
  font-size: 12px;
  color: ${colors.textMuted};
`;

function statusLabel(status) {
  if (status === 'writing-overview') return _l('正在撰写总览...');
  if (status === 'writing-details') return _l('正在生成详细配置');
  if (status === 'committing') return _l('正在保存版本...');
  return '';
}

export function PlanCard({
  status = 'writing-overview',
  selected = false,
  title,
  appIcon,
  appColor,
  versionLabel,
  built = false,
  onClick,
}) {
  const displayTitle = title || _l('应用搭建方案');
  const isDone = status === 'committed';
  // 没有真实 appIcon 时（生成中 / 无数据）一律留空，不显示默认 book 图标，避免误导
  const showPlaceholder = !appIcon;

  return (
    <Card
      $status={status}
      $selected={selected}
      $clickable={!!onClick}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <IconBox $color={showPlaceholder ? 'var(--color-background-disabled)' : appColor}>
        {appIcon ? <SvgIcon url={customIconUrl(appIcon)} fill="#fff" size={22} /> : null}
      </IconBox>
      <Body>
        <Title title={displayTitle}>{displayTitle}</Title>
        {isDone ? (
          // 该方案版本已用于搭建：不再显示版本号，改显示「已搭建」
          <VersionBadge>{built ? _l('已搭建') : versionLabel || 'v1'}</VersionBadge>
        ) : (
          <Status>{statusLabel(status)}</Status>
        )}
      </Body>
    </Card>
  );
}

export default PlanCard;
