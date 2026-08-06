import React, { Fragment, memo, useState } from 'react';
import styled from 'styled-components';
import { Icon, PopupWrapper, SvgIcon } from 'ming-ui';

const GroupButtonInCard = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
  height: 32px;
  border-radius: 3px;
  color: var(--color-text-primary);
  ${props => props.disabled && 'opacity: 0.5;'}
  &.operates-standard {
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-primary);
  }
  &.operates-text,
  &.operates-icon {
    border: none !important;
    background: transparent !important;
  }
  &.operates-icon {
    .icon {
      color: var(--color-text-secondary) !important;
    }
  }
  .icon {
    font-size: 18px;
  }
  .operateButtonText {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .groupArrow {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--color-text-tertiary);
  }
`;

const GroupButtonInPopup = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  ${props => props.disabled && 'opacity: 0.5;'}
  .icon {
    font-size: 20px;
  }
  .operateButtonText {
    flex: 1;
    min-width: 0;
    margin-left: 25px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .groupArrow {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--color-text-tertiary);
  }
`;

const GroupPopupContent = styled.div`
  padding: 0 18px 12px;
  .emptyGroupTip {
    height: 50px;
    line-height: 50px;
    color: var(--color-text-tertiary);
    font-size: 14px;
  }
`;

function GroupIcon({ group = {}, isInCard, showType }) {
  const { icon, iconUrl, iconColor } = group;
  const color = iconColor || (isInCard ? 'var(--color-text-secondary)' : 'var(--color-text-primary)');
  const useSvg = !!iconUrl && !!icon && (String(icon).endsWith('_svg') || String(icon).startsWith('sys_'));

  if (useSvg) {
    return (
      <SvgIcon className="InlineBlock icon svgIcon" addClassName="TxtMiddle" url={iconUrl} fill={color} size={18} />
    );
  }

  if (icon || !isInCard || showType === 'icon') {
    return <Icon icon={icon || 'custom_actions'} style={{ color }} />;
  }

  return null;
}

function GroupButton({ button, disabled, isInCard, showType, children }) {
  const [visible, setVisible] = useState(false);
  const TriggerButton = isInCard ? GroupButtonInCard : GroupButtonInPopup;
  const hasButtons = !!(button.buttons || []).length;

  const handleClick = e => {
    e.stopPropagation();
    if (disabled) return;
    setVisible(true);
  };

  return (
    <Fragment>
      <TriggerButton className={`operates-${showType}`} disabled={disabled} onClick={handleClick}>
        {(showType === 'icon' || button.showIcon || !isInCard) && (
          <GroupIcon group={button} isInCard={isInCard} showType={showType} />
        )}
        {(!isInCard || showType !== 'icon') && <div className="operateButtonText">{button.name}</div>}
        <Icon icon="arrow-right-tip" className="groupArrow" />
      </TriggerButton>
      <PopupWrapper
        bodyClassName="autoHeightPopupBody"
        title={button.name}
        visible={visible}
        headerType="withIcon"
        headerTitleAlign="left"
        onClose={() => setVisible(false)}
      >
        <GroupPopupContent>
          {hasButtons ? children : <div className="emptyGroupTip">{_l('暂无自定义动作')}</div>}
        </GroupPopupContent>
      </PopupWrapper>
    </Fragment>
  );
}

export default memo(GroupButton);
