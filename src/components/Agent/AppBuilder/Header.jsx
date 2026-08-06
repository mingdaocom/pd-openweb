import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Icon } from 'ming-ui';
import { transitions } from '../ui/tokens';

// 流光：白色高光条从左侧扫过按钮。前 60% 完成横扫，后 40% 停留，合计 3s 一次循环。
const shine = keyframes`
  0% { left: -120px; }
  60% { left: 100%; }
  100% { left: 100%; }
`;

const Wrap = styled.div`
  position: relative;
  height: 58px;
  min-height: 58px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  /* 预览 overlay 的蒙层背景是半透明白（--color-background-overlay-white），头部需自带不透明底，
     否则会透出底层 AppBuilder 的 Sidebar logo / 主头部（标题、版本号），头部内容叠在一起。 */
  ${p => p.$inOverlay && 'background: var(--color-background-secondary);'}
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
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

const Right = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
`;

const Center = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-tertiary);
  min-width: 0;
`;

const BreadcrumbItem = styled.span`
  color: ${p => (p.$active ? 'var(--color-mingo)' : 'var(--color-text-secondary)')};
  font-weight: ${p => (p.$active ? 600 : 400)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TitleText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const BreadcrumbSep = styled(Icon)`
  font-size: 18px !important;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
`;

// 「生成应用」左侧的 build 费用预估：13px / 次要色；未返回（加载中或取不到）时显示「计算中…」
const EstimateText = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  margin-right: 16px;
`;

const CHIP_THEME = {
  building: { bg: 'rgba(255,152,0,0.12)', border: '#FFB74D', color: '#B36B00' },
  completed: { bg: 'rgba(76,175,80,0.12)', border: '#81C784', color: '#2E7D32' },
  failed: { bg: 'rgba(244,67,54,0.10)', border: '#EF9A9A', color: '#C62828' },
};

// overlay 顶部状态 chip：60×22 完全胶囊；浅橙(building)/浅绿(completed)/浅红(failed)
const StatusChip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 22px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  background: ${p => (CHIP_THEME[p.$variant] || CHIP_THEME.building).bg};
  border: 1px solid ${p => (CHIP_THEME[p.$variant] || CHIP_THEME.building).border};
  color: ${p => (CHIP_THEME[p.$variant] || CHIP_THEME.building).color};
`;

const GenerateBtn = styled.button`
  position: relative;
  overflow: hidden;
  height: 36px;
  padding: 0 24px;
  border-radius: 5px;
  border: none;
  background: var(--color-mingo);
  color: var(--color-text-inverse);
  font-size: 14px;
  font-weight: 500;
  /* 文案在窄头部下不折行：英文「Create Application」较长，需保持单行并不被压缩 */
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition:
    background ${transitions.hover},
    box-shadow ${transitions.hover};

  &:hover {
    background: var(--color-mingo-dark);
  }

  /* 方案生成完毕（按钮可点）：高亮投影 + 白色高光条循环扫过，引导用户「生成应用」 */
  &:not(:disabled) {
    box-shadow: 0 4px 16px var(--color-mingo-transparent);
  }
  &:not(:disabled)::before {
    content: '';
    position: absolute;
    /* 加高并超出按钮上下，斜边由 skewX 提供；上下被按钮水平裁切（不产生竖直直边），整条扫光均匀斜向 */
    top: -20%;
    left: -120px;
    width: 80px;
    height: 140%;
    transform: skewX(-20deg);
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0) 70%
    );
    opacity: 0.35;
    pointer-events: none;
    animation: ${shine} 3s linear infinite;
  }

  &:disabled {
    background: var(--color-background-disabled);
    color: var(--color-text-tertiary);
    cursor: not-allowed;
  }
`;

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all ${transitions.hover};

  .icon {
    font-size: 18px;
    line-height: 1;
  }

  &:hover {
    background: var(--color-background-hover);
    color: var(--color-text-primary);
  }
`;

function overlayChipLabel(buildStatus) {
  if (buildStatus === 'completed') return _l('已完成');
  if (buildStatus === 'failed') return _l('搭建失败');
  return _l('搭建中…');
}

export default function Header({
  activeTitle,
  onGenerate,
  generateDisabled,
  builtVersionLabel,
  onClose,
  appName,
  inBuild,
  inOverlay,
  onBack,
  buildStatus,
  estimateCredits,
  estimateLoading,
  isSingleMingoPlan = false,
}) {
  const hasOverlayChip = inOverlay && buildStatus && buildStatus !== 'idle';
  // 仅在「生成应用」按钮真正可点时展示预估费用：未搭建、非 build 视图，且按钮未禁用（plan 已就绪、有工作表、无在途流）。
  // 与拉取预估的 canEstimate 门控一致；计算中显示「计算中…」，拿到结果显示信用点；
  // 若计算结束仍无结果（取不到 / 失败），则不显示，避免一直卡在「计算中…」。
  const showEstimate =
    !inBuild && !builtVersionLabel && !generateDisabled && (estimateLoading || estimateCredits != null);
  const estimateText = estimateLoading ? _l('预估消耗：计算中…') : _l('预估消耗：%0 信用点', estimateCredits);

  return (
    <Wrap $inOverlay={inOverlay}>
      <Left>
        {inOverlay && (
          <BackBtn type="button" onClick={onBack} aria-label={_l('返回')}>
            <Icon icon="arrow_back" />
          </BackBtn>
        )}
        {inBuild ? (
          <TitleText>{_l('%0 搭建计划', appName || '')}</TitleText>
        ) : (
          <Breadcrumb>
            <BreadcrumbItem>{_l('搭建计划')}</BreadcrumbItem>
            <BreadcrumbSep icon="navigate_next" />
            <BreadcrumbItem $active>{activeTitle}</BreadcrumbItem>
          </Breadcrumb>
        )}
      </Left>
      {hasOverlayChip && (
        <Center>
          <StatusChip $variant={buildStatus}>{overlayChipLabel(buildStatus)}</StatusChip>
        </Center>
      )}
      <Right>
        {showEstimate && <EstimateText>{estimateText}</EstimateText>}
        {builtVersionLabel ? (
          // 当前查看的方案版本已用于搭建：按钮转为已搭建态（禁用），明示用的是哪个版本
          <GenerateBtn type="button" disabled>
            {_l('已使用 %0 搭建', builtVersionLabel)}
          </GenerateBtn>
        ) : (
          !inBuild && (
            <GenerateBtn type="button" onClick={onGenerate} disabled={generateDisabled}>
              {_l('生成应用')}
            </GenerateBtn>
          )
        )}
        {!isSingleMingoPlan && (
          <CloseBtn type="button" onClick={onClose}>
            <Icon icon="close" />
          </CloseBtn>
        )}
      </Right>
    </Wrap>
  );
}
