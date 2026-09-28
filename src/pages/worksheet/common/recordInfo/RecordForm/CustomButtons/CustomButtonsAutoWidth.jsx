import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import _, { get } from 'lodash';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { SvgIcon } from 'ming-ui';
import { Button, Dropdown } from 'ming-ui/antd-components';
import autoSize from 'ming-ui/components/AutoSize';
import { segmentsFromView } from 'worksheet/common/ViewConfig/components/customBtn/groupedLayout/layoutUtils';
import { BUTTON_PADDING_INLINE } from 'src/common/config/theme/antdTheme';
import { getTranslateInfo } from 'src/utils/services/app';
import CustomButtons from './index';
import useCustomButtonMenuItems, { getCustomButtonMenuStyle } from './useCustomButtonMenuItems';

const CLICK_TRIGGER = ['click'];
const HOVER_TRIGGER = ['hover'];
const GROUP_DROPDOWN_ALIGN = { offset: [0, 4] };
const BUTTON_MORE_DROPDOWN_ALIGN = { offset: [0, 6] };
const DEFAULT_DROPDOWN_ALIGN = { offset: [0, 0] };
const EMPTY_BUTTONS = [];
const BUTTON_WIDTH_CACHE_LIMIT = 500;
const buttonWidthCache = new Map();
const useBrowserLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
const GROUPED_BUTTON_STYLE = {
  maxWidth: '100%',
};
// Width measurement cannot rely on Ant Design's runtime hash class. Keep the sizing rules in sync with the Button theme.
const BUTTON_MEASURE_STYLE = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  height: '36px',
  padding: `0 ${BUTTON_PADDING_INLINE}px`,
  border: '1px solid transparent',
  borderRadius: '4px',
  fontFamily: 'inherit',
  fontSize: '13px',
  fontWeight: '700',
  whiteSpace: 'nowrap',
};

const Con = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  /* 行内操作列列宽取所有行的最大值，按钮少的行会有富余宽度，靠左会显得没对齐；
     safe 保证万一测量偏差导致按钮溢出时退回左对齐，不会两端都被裁掉 */
  ${({ $center }) =>
    $center &&
    `justify-content: center;
     justify-content: safe center;`}
`;

const MoreButtonTrigger = styled.div`
  display: inline-flex;
  flex-shrink: 0;
`;

const MoreBtn = styled.span`
  height: 28px;
  padding: 0 11px;
  line-height: 30px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  .icon {
    color: var(--color-text-tertiary);
    margin-left: 3px;
  }
  &:hover {
    background: var(--color-background-hover);
  }
`;

const DropButton = styled(Button)`
  flex-shrink: 0;
  text-align: center;
  .dropIcon {
    display: inline-block;
  }
  &.active .dropIcon {
    transform: rotate(180deg);
  }
  ${props =>
    props.$operateHeight &&
    `&.isOperates {
    height: ${props.$operateHeight}px !important;
    padding: 0 !important;
    width: ${props.$moreWidth || 26}px !important;
    min-width: ${props.$moreWidth || 26}px;
    .hap-btn-icon .icon {
      margin: 0;
    }
  }
    `}
  &.operates-icon {
    border-color: transparent !important;
    &:hover {
      background: var(--color-background-secondary) !important;
    }
  }
  &.operates-text {
    border-color: transparent !important;
    background: transparent !important;
    &:hover {
      border-color: transparent !important;
      background: var(--color-background-secondary) !important;
    }
  }
  &.operates-standard {
    background: var(--color-background-primary) !important;
    &:hover {
      background: var(--color-background-secondary) !important;
    }
  }
`;

const GROUP_CHEVRON_WIDTH = 16;
/** 相邻按钮之间的间距（.mRight6） */
const ITEM_MARGIN_RIGHT = 6;
/** 行内操作列「更多」按钮宽度，列宽预算与折叠判断共用 */
export const OPERATES_MORE_BUTTON_WIDTH = 26;
const OPERATES_MORE_BUTTON_WIDTH_IN_CARD = 32;

const GroupedHoverButton = styled(Button)`
  &.recordCustomButton {
    background-color: var(--color-background-tertiary) !important;
    color: var(--color-text-primary) !important;
    font-weight: normal !important;
    &:hover,
    &.active {
      background-color: var(--color-background-secondary) !important;
    }
    .hap-btn-icon .groupedIcon {
      line-height: 1;
      font-size: 16px;
    }
    .groupedContent {
      display: flex;
      align-items: center;
      max-width: 100%;
      height: 100%;
      .groupedName {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1;
      }
      .groupedChevron {
        color: #9d9d9d;
        font-size: 12px;
        line-height: 1;
        flex-shrink: 0;
        margin: 0 -3px 0 3px;
      }
    }
  }
  /* 视图行操作（isOperates）：基于详情样式的覆盖层 —— 白底 + #DDD 边、26/32 高、8px 横向 padding */
  ${props =>
    props.$operateHeight &&
    `&.recordCustomButton {
      height: ${props.$operateHeight}px !important;
      min-width: 0 !important;
      background-color: #FFFFFF !important;
      border: 1px solid #DDDDDD !important;
      &:hover,
      &.active {
        background-color: var(--color-background-secondary) !important;
      }
    }
    &.recordCustomButton.groupStyle-text {
      background-color: transparent !important;
      border-color: transparent !important;
      &:hover,
      &.active {
        background-color: var(--color-background-secondary) !important;
        border-color: transparent !important;
      }
    }
    &.recordCustomButton.groupStyle-icon {
      width: 28px !important;
      min-width: 28px !important;
      padding: 0 !important;
      background-color: transparent !important;
      border-color: transparent !important;
      &:hover,
      &.active {
        background-color: var(--color-background-hover) !important;
        border-color: transparent !important;
      }
      .hap-btn-icon {
        margin: 0;
      }
      .groupedContent {
        display: none;
      }
    }`}
`;

const GroupedIconTextCon = styled.div`
  display: inline-block;
  cursor: pointer;
  color: var(--color-text-title);
  padding: 0 12px;
  height: 28px;
  line-height: 28px;
  border-radius: 4px;
  white-space: nowrap;
  &:hover,
  &.active {
    background: var(--color-background-hover);
  }
  .groupedIcon {
    margin-right: 6px;
    font-size: 18px;
    vertical-align: middle;
  }
  .groupedName {
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    font-size: 13px;
  }
  .groupedChevron {
    margin-left: 3px;
    font-size: 12px;
    color: #9d9d9d;
    vertical-align: middle;
  }
`;

function getButtonWidth(button, type, maxNameWidth) {
  if (typeof document === 'undefined' || !document.body) return 0;
  const isDebug = window.isDebug;
  const cacheKey = JSON.stringify([type, button.name || '', !!button.icon, button.iconSize || 16, maxNameWidth || 0]);

  if (!isDebug && buttonWidthCache.has(cacheKey)) {
    return buttonWidthCache.get(cacheKey);
  }

  let result;
  const div = document.createElement('div');

  const applyNameClamp = element => {
    if (!maxNameWidth) return;

    element.style.display = 'inline-block';
    element.style.maxWidth = `${maxNameWidth}px`;
    element.style.overflow = 'hidden';
    element.style.textOverflow = 'ellipsis';
    element.style.whiteSpace = 'nowrap';
    element.style.verticalAlign = 'top';
  };

  div.style.position = 'absolute';
  div.style.left = isDebug ? '200px' : '-10000px';
  div.style.top = isDebug ? '200px' : '-10000px';
  div.style.zIndex = '99999';

  if (type === 'iconText') {
    const { name } = button;
    const content = document.createElement('div');
    const iconPlaceholder = document.createElement('span');
    const nameElement = document.createElement('span');

    if (isDebug) {
      div.style.backgroundColor = '#ffffff';
    }

    div.style.display = 'inline-block';
    content.style.display = 'inline-block';
    content.style.margin = '0 12px';
    content.style.whiteSpace = 'nowrap';
    iconPlaceholder.style.display = 'inline-block';
    iconPlaceholder.style.margin = '0 2px';
    iconPlaceholder.style.width = '18px';
    nameElement.style.fontSize = '13px';
    nameElement.textContent = name || '';
    applyNameClamp(nameElement);
    content.append(iconPlaceholder, nameElement);
    div.appendChild(content);
  } else {
    const buttonWrap = document.createElement('span');
    const buttonElement = document.createElement('button');
    const iconWrap = document.createElement('span');
    const iconElement = document.createElement('i');
    const nameElement = document.createElement('span');

    buttonWrap.className = 'InlineBlock borderBox';
    buttonElement.type = 'button';
    buttonElement.className =
      'hap-btn hap-btn-color-primary hap-btn-variant-outlined recordCustomButton overflowHidden';
    Object.assign(buttonElement.style, BUTTON_MEASURE_STYLE);
    nameElement.className = 'buttonText breakAll overflow_ellipsis';
    nameElement.textContent = button.name || '';
    applyNameClamp(nameElement);

    if (button.icon) {
      const iconSize = button.iconSize || 16;

      iconWrap.className = 'hap-btn-icon';
      iconWrap.style.display = 'inline-flex';
      iconWrap.style.alignItems = 'center';
      iconWrap.style.justifyContent = 'center';
      iconWrap.style.width = `${iconSize}px`;
      iconWrap.style.flexShrink = '0';
      iconElement.className = `icon icon-${button.icon}`;
      iconElement.style.fontSize = `${iconSize}px`;
      iconWrap.appendChild(iconElement);
      buttonElement.append(iconWrap);
    }

    buttonElement.append(nameElement);
    buttonWrap.appendChild(buttonElement);
    div.appendChild(buttonWrap);
  }

  document.body.appendChild(div);
  result = div.clientWidth;
  if (type === 'button') {
    result += ITEM_MARGIN_RIGHT;
  }

  document.body.removeChild(div);

  if (!isDebug) {
    if (buttonWidthCache.size >= BUTTON_WIDTH_CACHE_LIMIT) {
      buttonWidthCache.delete(buttonWidthCache.keys().next().value);
    }

    buttonWidthCache.set(cacheKey, result);
  }

  return result;
}

/** 与配置侧 renderCustomBtnStyleIcon 一致：sys_/_svg 开头走 SvgIcon，其余字体图标 */
export function renderGroupIcon(
  group,
  { size = 16, className = 'groupedIcon', addClassName, element: IconElement = 'i' } = {},
) {
  const { icon, iconUrl, iconColor, showIcon, style } = group || {};
  // 仅图标 (style==='icon') 时强制保留图标，否则跟随 acstyle.icon（showIcon）开关
  if (showIcon === false && style !== 'icon') return null;
  const color = iconColor || '#757575';
  const useSvg = !!iconUrl && !!icon && (String(icon).endsWith('_svg') || String(icon).startsWith('sys_'));

  if (useSvg) {
    return <SvgIcon className={className} addClassName={addClassName} url={iconUrl} fill={color} size={size} />;
  }

  return <IconElement className={cx(className, 'icon', `icon-${icon || 'custom_actions'}`)} style={{ color }} />;
}

/** 把布局段平铺为可渲染单元；组内动作全部停用/不可见后无按钮的空组直接过滤，不再渲染占位 */
function buildItems(buttons, layoutGroupRaw, layoutFlatRaw, btnDisable, hideDisabled, translateParams = {}) {
  const { appId, worksheetId, viewId } = translateParams;
  const visibleButtons = hideDisabled
    ? buttons.filter(button => !(btnDisable[button.btnId] || button.disabled))
    : buttons;

  /** 视图按钮（OperateButtons）会直接传入带 type:'group_ref' 的扁平项，分组成员已预解析 */
  if (visibleButtons.some(btn => btn && btn.type === 'group_ref')) {
    return _.compact(
      visibleButtons.map(btn => {
        if (btn.type === 'group_ref') {
          const members = hideDisabled
            ? (btn.buttons || []).filter(b => !(btnDisable[b.btnId] || b.disabled))
            : btn.buttons || [];
          const groupId = btn.id || btn.btnId;

          // 组内动作全部停用/不可见时，过滤掉空分组（与行内、批量保持一致）
          if (!members.length) {
            return null;
          }

          return {
            kind: 'group',
            group: {
              id: groupId,
              name: getTranslateInfo(appId, worksheetId, viewId)[groupId] || btn.name,
              icon: btn.icon,
              iconUrl: btn.iconUrl,
              iconColor: btn.iconColor,
              style: btn.style,
              showIcon: btn.showIcon,
            },
            buttons: members,
          };
        }

        return { kind: 'btn', button: btn };
      }),
    );
  }

  const segments = segmentsFromView(visibleButtons, layoutFlatRaw, layoutGroupRaw);
  const visibleById = _.keyBy(visibleButtons, 'btnId');
  const items = [];

  for (const seg of segments) {
    if (seg.type === 'group') {
      const groupButtons = (seg.ids || []).map(id => visibleById[id]).filter(Boolean);

      // 组内动作全部停用/不可见时，过滤掉空分组（与行内、批量保持一致）
      if (!groupButtons.length) {
        continue;
      }

      items.push({
        kind: 'group',
        group: {
          id: seg.id,
          name: getTranslateInfo(appId, worksheetId, viewId)[seg.id] || seg.name,
          icon: seg.icon,
          iconUrl: seg.iconUrl,
          iconColor: seg.iconColor,
        },
        buttons: groupButtons,
      });
    } else {
      for (const id of seg.ids || []) {
        const btn = visibleById[id];

        if (btn) {
          items.push({ kind: 'btn', button: btn });
        }
      }
    }
  }

  return items;
}

function getItemWidth(item, type, isOperates) {
  const itemStyle = item.kind === 'btn' ? item.button.style : item.group.style;

  if (isOperates && itemStyle === 'icon') {
    return 28 + 6;
  }

  if (item.kind === 'btn') {
    const button = isOperates && item.button.showIcon === false ? { ...item.button, icon: undefined } : item.button;
    const buttonWidth = getButtonWidth(button, type);

    // 行内普通按钮会覆盖为 8px 横向 padding，测量节点使用的是 Button 默认的 16px。
    return isOperates ? Math.max(0, buttonWidth - BUTTON_PADDING_INLINE) : buttonWidth;
  }

  // 分组名最大 200px（与 .groupedName 渲染一致），测量同样 cap，保证自动折叠/布局计算准确
  const showGroupIcon = item.group.showIcon !== false || item.group.style === 'icon';
  return (
    getButtonWidth(
      {
        name: item.group.name,
        icon: showGroupIcon ? item.group.icon || 'custom_actions' : undefined,
      },
      type,
      200,
    ) + GROUP_CHEVRON_WIDTH
  );
}

function getItemMeasureSpec(item) {
  if (item.kind === 'btn') {
    return {
      kind: item.kind,
      button: _.pick(item.button, ['name', 'icon', 'iconSize', 'showIcon', 'style']),
    };
  }

  return {
    kind: item.kind,
    group: _.pick(item.group, ['name', 'icon', 'showIcon', 'style']),
  };
}

/** 行内操作按钮里影响宽度的展示字段，列宽预算与实际渲染必须基于同一份注入结果 */
export function decorateOperatesButton(button, { style, showIcon } = {}) {
  return {
    ...button,
    icon: button.icon || (style === 'icon' ? 'custom_actions' : ''),
    style,
    showIcon,
  };
}

/**
 * 行内操作列每个渲染单元的宽度（含单元之间的 6px 间距）。
 * 操作列列宽（SheetView）和列内自动折叠（getFittingItemCount）必须使用这里的同一份测量，
 * 否则会出现列宽够却把按钮收进「更多」、或者按钮被裁掉的偏差。
 */
export function getOperatesItemWidths(buttons = [], { style, showIcon, appId, worksheetId, viewId } = {}) {
  const items = buildItems(
    buttons.map(button => decorateOperatesButton(button, { style, showIcon })),
    undefined,
    undefined,
    {},
    false,
    { appId, worksheetId, viewId },
  );

  return items.map(item => getItemWidth(item, 'button', true));
}

export function getFittingItemCount(itemWidths = [], { width, visibleNum, moreButtonWidth = 0 } = {}) {
  const maxVisibleCount =
    typeof visibleNum === 'number' ? Math.min(Math.max(visibleNum, 0), itemWidths.length) : itemWidths.length;

  if (!width || maxVisibleCount === 0) {
    return maxVisibleCount;
  }

  for (let count = maxVisibleCount; count > 0; count -= 1) {
    const hasOverflow = count < itemWidths.length;
    const occupiedWidth = _.sum(itemWidths.slice(0, count)) + (hasOverflow ? moreButtonWidth : 0);

    if (occupiedWidth <= width) {
      return count;
    }
  }

  // 连一个按钮都放不下时全部收进「更多」，强行留一个只会溢出容器或被裁掉
  return 0;
}

function GroupedIconTextButton(props) {
  const { group, buttons, buttonsProps } = props;
  const [popupVisible, setPopupVisible] = useState(false);

  return (
    <CustomButtonDropdown
      buttons={buttons}
      buttonsProps={buttonsProps}
      open={popupVisible}
      onOpenChange={setPopupVisible}
      trigger={CLICK_TRIGGER}
      type={buttonsProps.type}
      align={GROUP_DROPDOWN_ALIGN}
      triggerNode={
        <GroupedIconTextCon className={cx({ active: popupVisible })} title={group.name}>
          {renderGroupIcon(group, {
            size: 18,
            className: 'groupedIcon InlineBlock',
            addClassName: 'TxtMiddle',
            element: 'span',
          })}
          <span className="groupedName">{group.name}</span>
          <i className="groupedChevron icon icon-arrow-down" />
        </GroupedIconTextCon>
      }
    />
  );
}

function GroupedTopButton(props) {
  const { group, buttons, mRight6, isOperates, operateHeight, isInCard, buttonsProps } = props;
  const [popupVisible, setPopupVisible] = useState(false);

  const groupStyle = group.style || 'standard';
  const triggerNode = (
    <span className={cx('InlineBlock borderBox', { mRight6 })}>
      <GroupedHoverButton
        $operateHeight={isOperates && operateHeight}
        className={cx('recordCustomButton overflowHidden', `groupStyle-${groupStyle}`, {
          isOperates,
          isInCard,
          active: popupVisible,
        })}
        color="default"
        variant="filled"
        icon={renderGroupIcon(group)}
        title={group.name}
        style={GROUPED_BUTTON_STYLE}
      >
        <span className="groupedContent">
          <span className="groupedName">{group.name}</span>
          <i className="groupedChevron icon icon-arrow-down" />
        </span>
      </GroupedHoverButton>
    </span>
  );

  return (
    <CustomButtonDropdown
      buttons={buttons}
      buttonsProps={buttonsProps}
      open={popupVisible}
      onOpenChange={setPopupVisible}
      trigger={CLICK_TRIGGER}
      triggerNode={triggerNode}
      type={buttonsProps.type}
      align={GROUP_DROPDOWN_ALIGN}
    />
  );
}

function CustomButtonDropdown(props) {
  const {
    buttons = EMPTY_BUTTONS,
    segments,
    buttonsProps,
    open,
    onOpenChange,
    triggerNode,
    trigger,
    type,
    align,
  } = props;
  const { items, holder } = useCustomButtonMenuItems({
    ...buttonsProps,
    buttons,
    segments,
  });

  return (
    <React.Fragment>
      {holder}
      <Dropdown
        open={open}
        trigger={trigger}
        placement="bottomLeft"
        align={align}
        onOpenChange={onOpenChange}
        menu={{ items, selectable: false, style: getCustomButtonMenuStyle(type) }}
      >
        {triggerNode}
      </Dropdown>
    </React.Fragment>
  );
}

function Buttons(props) {
  const {
    type = 'iconText',
    isOperates,
    isInCard,
    isCharge,
    count,
    width,
    appId,
    viewId,
    recordId,
    projectId,
    worksheetId,
    selectedRows = [],
    btnDisable = {},
    isAll,
    visibleNum,
    handleTriggerCustomBtn,
    handleUpdateWorksheetRow,
    onUpdateRow,
    detailgroup,
    detailbtns,
    listgroup,
    listbtns,
  } = props;
  const layoutGroupRaw = detailgroup || listgroup;
  const layoutFlatRaw = detailbtns || listbtns;
  let { buttons } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  const operateHeight = (props.rowHeight && props.rowHeight) > 34 || isInCard ? 32 : 26;
  const moreWidth = isInCard ? OPERATES_MORE_BUTTON_WIDTH_IN_CARD : OPERATES_MORE_BUTTON_WIDTH;
  const hideDisabled = type === 'iconText' || !viewId;

  if (hideDisabled) {
    buttons = buttons.filter(button => !(btnDisable[button.btnId] || button.disabled));
  }

  const items = useMemo(
    () =>
      type === 'button' || type === 'iconText'
        ? buildItems(buttons, layoutGroupRaw, layoutFlatRaw, btnDisable, hideDisabled, {
            appId,
            worksheetId,
            viewId,
          })
        : buttons.map(button => ({ kind: 'btn', button })),
    [buttons, layoutGroupRaw, layoutFlatRaw, btnDisable, hideDisabled, type, appId, worksheetId, viewId],
  );

  const measurementKey = JSON.stringify({
    type,
    isOperates: !!isOperates,
    moreWidth,
    moreButtonName: isOperates ? '' : _l('更多'),
    items: items.map(getItemMeasureSpec),
  });
  const [buttonMeasurement, setButtonMeasurement] = useState(() => ({
    key: '',
    itemWidths: [],
    moreButtonWidth: 0,
  }));

  useBrowserLayoutEffect(() => {
    // 卡片里的按钮按配置数量等分整行，不做基于宽度的折叠，省掉每张卡片的 DOM 测量
    if (isInCard) {
      return;
    }

    const measurement = JSON.parse(measurementKey);
    const itemWidths = measurement.items.map(item => getItemWidth(item, measurement.type, measurement.isOperates));
    const moreButtonWidth = measurement.isOperates
      ? measurement.moreWidth
      : getButtonWidth(
          { name: measurement.moreButtonName, icon: 'arrow-down-border', iconSize: 12 },
          measurement.type,
        ) - 6;

    setButtonMeasurement({ key: measurementKey, itemWidths, moreButtonWidth });
  }, [measurementKey]);

  const currentMeasurement = buttonMeasurement.key === measurementKey ? buttonMeasurement : null;
  const configuredShowNum =
    typeof visibleNum === 'number' ? Math.min(Math.max(visibleNum, 0), items.length) : Math.min(1, items.length);
  // 卡片宽度固定且窄，按宽度折叠会让配置的按钮几乎都收进「更多」；
  // 卡片里改为配置几个就显示几个，按钮等分整行、文字放不下走省略号。
  const itemShowNum =
    isInCard || !currentMeasurement
      ? configuredShowNum
      : getFittingItemCount(currentMeasurement.itemWidths, {
          width,
          visibleNum,
          moreButtonWidth: currentMeasurement.moreButtonWidth,
        });

  const buttonsProps = {
    isFromBatchEdit: true,
    operateHeight,
    count,
    appId,
    viewId,
    recordId,
    projectId,
    worksheetId,
    selectedRows,
    isAll,
    handleTriggerCustomBtn,
    handleUpdateWorksheetRow,
    onUpdateRow,
    ...props,
  };
  const visibleItems = items.slice(0, itemShowNum);
  const overflowItems = items.slice(itemShowNum);
  const showMore = overflowItems.length > 0;
  // 卡片里的按钮等分整行宽度。每个按钮都自带 mRight6，「更多」按钮不带，
  // 所以间距个数恒等于按钮个数；少算一个间距会让行尾被裁掉 6px。
  const cardItemMaxWidth =
    isInCard && width && itemShowNum
      ? Math.max(Math.floor((width - (showMore ? moreWidth : 0) - ITEM_MARGIN_RIGHT * itemShowNum) / itemShowNum), 0)
      : undefined;
  let moreContent;

  if (isOperates) {
    moreContent = (
      <DropButton
        color="default"
        variant="textBordered"
        className={cx(
          'recordCustomButton overflowHidden moreButtons',
          {
            active: popupVisible,
            isOperates,
          },
          get(buttons, '0.className', ''),
        )}
        $operateHeight={operateHeight}
        $moreWidth={moreWidth}
        icon={<i className="icon icon-more_horiz" />}
      />
    );
  } else if (type === 'button') {
    moreContent = (
      <DropButton
        className={cx('recordCustomButton overflowHidden moreButtons', {
          active: popupVisible,
          isOperates,
        })}
        color="default"
        variant="textBordered"
        icon={<i className="dropIcon icon icon-arrow-down-border Font12" />}
        iconPlacement="end"
      >
        <span className="breakAll overflow_ellipsis textPrimary">{_l('更多')}</span>
      </DropButton>
    );
  } else {
    moreContent = (
      <MoreBtn>
        {_l('更多')}
        <i className="icon icon-arrow-down-border"></i>
      </MoreBtn>
    );
  }

  function renderVisibleItems() {
    if (type !== 'button' && type !== 'iconText') {
      return (
        <CustomButtons
          {...buttonsProps}
          showMore={showMore}
          className={type}
          isCharge={isCharge}
          hideDisabled={hideDisabled}
          isBatchOperate={selectedRows.length > 1 || isAll}
          type={type}
          buttons={visibleItems.map(it => it.button).filter(Boolean)}
        />
      );
    }

    const sharedButtonsProps = {
      ...buttonsProps,
      isCharge,
      hideDisabled,
      isBatchOperate: selectedRows.length > 1 || isAll,
    };
    const elements = [];
    let i = 0;

    while (i < visibleItems.length) {
      const item = visibleItems[i];

      if (item.kind === 'btn') {
        const run = [];
        let j = i;

        while (j < visibleItems.length && visibleItems[j].kind === 'btn') {
          run.push(visibleItems[j].button);
          j += 1;
        }

        const followedBySomething = j < visibleItems.length || showMore;
        elements.push(
          <CustomButtons
            key={`run-${i}`}
            {...buttonsProps}
            showMore={followedBySomething}
            className={type}
            isCharge={isCharge}
            hideDisabled={hideDisabled}
            isBatchOperate={selectedRows.length > 1 || isAll}
            type={type}
            buttons={run}
          />,
        );
        i = j;
      } else {
        const followedBySomething = i + 1 < visibleItems.length || showMore;

        if (type === 'iconText') {
          elements.push(
            <GroupedIconTextButton
              key={`group-${item.group.id || i}`}
              group={item.group}
              buttons={item.buttons}
              buttonsProps={sharedButtonsProps}
            />,
          );
        } else {
          elements.push(
            <GroupedTopButton
              key={`group-${item.group.id || i}`}
              group={item.group}
              buttons={item.buttons}
              mRight6={followedBySomething}
              isOperates={isOperates}
              operateHeight={operateHeight}
              isInCard={isInCard}
              buttonsProps={sharedButtonsProps}
            />,
          );
        }

        i += 1;
      }
    }

    return elements;
  }

  return (
    <Con
      className={cx('customButtonsCon', { showMore })}
      $center={!!isOperates}
      style={cardItemMaxWidth ? { '--operates-card-item-max-width': `${cardItemMaxWidth}px` } : undefined}
    >
      {renderVisibleItems()}
      {showMore && (
        <CustomButtonDropdown
          segments={overflowItems}
          buttonsProps={{
            ...buttonsProps,
            isCharge,
            hideDisabled,
            isBatchOperate: selectedRows.length > 1 || isAll,
          }}
          open={popupVisible}
          onOpenChange={setPopupVisible}
          trigger={isOperates ? CLICK_TRIGGER : HOVER_TRIGGER}
          triggerNode={<MoreButtonTrigger>{moreContent}</MoreButtonTrigger>}
          type={type}
          align={type === 'button' ? BUTTON_MORE_DROPDOWN_ALIGN : DEFAULT_DROPDOWN_ALIGN}
        />
      )}
    </Con>
  );
}

Buttons.propTypes = {
  width: number,
  count: number,
  appId: string,
  viewId: string,
  projectId: string,
  worksheetId: string,
  recordId: string,
  selectedRows: arrayOf(shape({})),
  isAll: bool,
  buttons: arrayOf(shape({})),
  detailgroup: string,
  detailbtns: string,
  listgroup: string,
  listbtns: string,
  onUpdateRow: func,
  handleTriggerCustomBtn: func,
  handleUpdateWorksheetRow: func,
};

export default autoSize(Buttons);
