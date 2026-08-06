import React, { useCallback, useMemo, useState } from 'react';
import cx from 'classnames';
import _, { get } from 'lodash';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Menu, SvgIcon } from 'ming-ui';
import autoSize from 'ming-ui/components/AutoSize';
import CustomButtons from 'worksheet/common/recordInfo/RecordForm/CustomButtons';
import GroupedMenuItem, {
  EmptyGroupTip,
  getGroupMenuStyle,
  POPUP_CLICK_AWAY_EXCEPTIONS,
} from 'worksheet/common/recordInfo/RecordForm/groupedMenu/GroupedMenuItem';
import { segmentsFromView } from 'worksheet/common/ViewConfig/components/customBtn/groupedLayout/layoutUtils';

const Con = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
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
  padding: 0 !important;
  text-align: center;
  background-color: transparent !important;
  border: 1px solid var(--color-border-primary) !important;
  color: var(--color-text-primary) !important;
  .dropIcon {
    display: inline-block;
  }
  &.active .dropIcon {
    transform: rotate(180deg);
  }
  &:hover {
    background-color: var(--color-background-hover) !important;
  }
  ${props =>
    props.operateHeight &&
    `&.ming.Button.isOperates {
    height: ${props.operateHeight}px !important;
    line-height: ${props.operateHeight - 2}px !important;
    padding: 0 !important;
    font-size: 12px !important;
    width: auto;
    min-width: ${props.moreWidth || 26}px;
    min-height: ${props.operateHeight}px;
    .icon {
      margin: 0;
      line-height: ${props.operateHeight - 2}px;
    }
    &:hover {
      &::before {
        display: none;
      }
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

const GroupedHoverButton = styled(Button)`
  /* 详情 / 批量（基础形态，第一位）：填充 bg-tertiary + 深色文字，无边框；
     尺寸/边距/行高沿用全局 .recordCustomButton.ming.Button 的 34/0 16/32。 */
  &.recordCustomButton.ming.Button {
    background-color: var(--color-background-tertiary) !important;
    color: var(--color-text-primary) !important;
    font-weight: normal !important;
    &:hover,
    &.active {
      background-color: var(--color-background-secondary) !important;
    }
    .groupedContent {
      display: flex;
      align-items: center;
      max-width: 100%;
      height: 100%;
      .groupedIcon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        font-size: 16px;
        flex-shrink: 0;
        margin-left: -2px;
        margin-right: 6px;
      }
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
    props.operateHeight &&
    `&.recordCustomButton.ming.Button {
      height: ${props.operateHeight}px !important;
      line-height: ${props.operateHeight - 2}px !important;
      min-height: ${props.operateHeight}px !important;
      max-height: ${props.operateHeight}px !important;
      min-width: 0 !important;
      padding: 0 8px !important;
      font-size: 12px !important;
      background-color: #FFFFFF !important;
      border: 1px solid #DDDDDD !important;
      &:hover,
      &.active {
        background-color: var(--color-background-secondary) !important;
      }
    }
    &.recordCustomButton.ming.Button.groupStyle-text {
      background-color: transparent !important;
      border-color: transparent !important;
      &:hover,
      &.active {
        background-color: var(--color-background-secondary) !important;
        border-color: transparent !important;
      }
    }
    &.recordCustomButton.ming.Button.groupStyle-icon {
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
      .groupedContent {
        justify-content: center;
        .groupedIcon {
          margin-left: 0;
          margin-right: 0;
        }
      }
      .groupedName,
      .groupedChevron {
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
  if (!document.body) return 0;
  const isDebug = window.isDebug;
  let result;
  const div = document.createElement('div');
  // 分组名渲染受 .groupedName max-width 截断，测量也要同样 cap，否则超长分组名会让自动折叠/布局判断偏大
  const nameClamp = maxNameWidth
    ? `display:inline-block;max-width:${maxNameWidth}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:top;`
    : '';

  if (type === 'iconText') {
    const { name } = button;

    if (!isDebug) {
      div.style.visibility = 'hidden';
    } else {
      div.style.position = 'absolute';
      div.style.left = '200px';
      div.style.top = '200px';
      div.style.zIndex = '99999';
      div.style.backgroundColor = '#ffffff';
    }

    div.style.display = 'inline-block';
    div.innerHTML = `<div style="display: inline-block; margin: 0 12px; white-space: nowrap;">
      <span style="display: inline-block; margin: 0 2px; width:18px;"></span>
      <span style="font-size: 13px;${nameClamp}">${name}</span>
    </div>`;
  } else {
    div.style.position = 'absolute';
    if (!isDebug) {
      div.style.left = '-10000px';
      div.style.top = '-10000px';
    } else {
      div.style.left = '200px';
      div.style.top = '200px';
    }

    div.style.zIndex = '99999';
    div.style.border = '1px solid';
    div.innerHTML = `<span class="InlineBlock borderBox"><button type="button" class="ming Button--small Button--ghost Button recordCustomButton overflowHidden"><div class="content ellipsis"><i class="${`icon icon-${
      button.icon || 'custom_actions'
    }`}"></i><span class="breakAll overflow_ellipsis" style="${nameClamp}">${button.name}</span></div></button></span>`;
  }

  document.body.appendChild(div);
  result = div.clientWidth;
  if (type === 'button') {
    result += 6;
  }

  document.body.removeChild(div);
  return result;
}

/** 与配置侧 renderCustomBtnStyleIcon 一致：sys_/_svg 开头走 SvgIcon，其余字体图标 */
function renderGroupIcon(group) {
  const { icon, iconUrl, iconColor, showIcon, style } = group || {};
  // 仅图标 (style==='icon') 时强制保留图标，否则跟随 acstyle.icon（showIcon）开关
  if (showIcon === false && style !== 'icon') return null;
  const color = iconColor || '#757575';
  const useSvg = !!iconUrl && !!icon && (String(icon).endsWith('_svg') || String(icon).startsWith('sys_'));

  if (useSvg) {
    return <SvgIcon className="groupedIcon" url={iconUrl} fill={color} size={16} />;
  }

  return <i className={`icon icon-${icon || 'custom_actions'} groupedIcon`} style={{ color }} />;
}

/** 把布局段平铺为可渲染单元；组内动作全部停用/不可见后无按钮的空组直接过滤，不再渲染占位 */
function buildItems(buttons, layoutGroupRaw, layoutFlatRaw, btnDisable, hideDisabled) {
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

          // 组内动作全部停用/不可见时，过滤掉空分组（与行内、批量保持一致）
          if (!members.length) {
            return null;
          }

          return {
            kind: 'group',
            group: {
              id: btn.id || btn.btnId,
              name: btn.name,
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
          name: seg.name,
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

function getItemWidth(item, type) {
  if (item.kind === 'btn') {
    return getButtonWidth(item.button, type);
  }

  // 分组名最大 200px（与 .groupedName 渲染一致），测量同样 cap，保证自动折叠/布局计算准确
  return getButtonWidth({ name: item.group.name, icon: item.group.icon }, type, 200) + GROUP_CHEVRON_WIDTH;
}

function GroupedIconTextButton(props) {
  const { group, buttons, buttonsProps } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  // 填写动作打开 FillRecordControls 时，主动关掉分组弹层；
  // Trigger 去掉 destroyPopupOnHide，弹层关闭后仍保留 CustomButtons 挂载，
  // 否则 CustomButtons 卸载会把它内部的 FillRecordControls Modal 一并销毁。
  const handleCustomButtonActive = useCallback(active => {
    if (active) setPopupVisible(false);
  }, []);

  return (
    <Trigger
      popupVisible={popupVisible}
      zIndex={1000}
      action={['click']}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 4],
        overflow: { adjustX: true, adjustY: true },
      }}
      onPopupVisibleChange={setPopupVisible}
      popup={
        <Menu
          style={getGroupMenuStyle(buttonsProps.type)}
          onClickAway={() => setPopupVisible(false)}
          onClickAwayExceptions={POPUP_CLICK_AWAY_EXCEPTIONS}
        >
          {buttons.length ? (
            <CustomButtons
              {...buttonsProps}
              type="menu"
              icon
              buttons={buttons}
              setCustomButtonActive={handleCustomButtonActive}
            />
          ) : (
            <EmptyGroupTip>{_l('暂无自定义动作')}</EmptyGroupTip>
          )}
        </Menu>
      }
    >
      <GroupedIconTextCon className={cx({ active: popupVisible })} title={group.name}>
        {(() => {
          const { icon, iconUrl, iconColor, showIcon, style } = group;
          // 仅图标 (style==='icon') 时强制保留，否则跟随 acstyle.icon 开关
          if (showIcon === false && style !== 'icon') return null;
          const color = iconColor || '#757575';
          const useSvg = !!iconUrl && !!icon && (String(icon).endsWith('_svg') || String(icon).startsWith('sys_'));

          if (useSvg) {
            return (
              <SvgIcon
                className="groupedIcon InlineBlock"
                addClassName="TxtMiddle"
                url={iconUrl}
                fill={color}
                size={18}
              />
            );
          }

          return <span className={cx('groupedIcon icon icon-' + (icon || 'custom_actions'))} style={{ color }} />;
        })()}
        <span className="groupedName">{group.name}</span>
        <i className="groupedChevron icon icon-arrow-down" />
      </GroupedIconTextCon>
    </Trigger>
  );
}

function GroupedTopButton(props) {
  const { group, buttons, mRight6, isOperates, operateHeight, isInCard, buttonsProps } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  // 填写动作打开 FillRecordControls 时，主动关掉分组弹层；
  // Trigger 去掉 destroyPopupOnHide，弹层关闭后仍保留 CustomButtons 挂载，
  // 否则 CustomButtons 卸载会把它内部的 FillRecordControls Modal 一并销毁。
  const handleCustomButtonActive = useCallback(active => {
    if (active) setPopupVisible(false);
  }, []);

  const groupStyle = group.style || 'standard';
  const triggerNode = (
    <span className={cx('InlineBlock borderBox', { mRight6 })}>
      <GroupedHoverButton
        operateHeight={isOperates && operateHeight}
        className={cx('recordCustomButton overflowHidden', `groupStyle-${groupStyle}`, {
          isOperates,
          isInCard,
          active: popupVisible,
        })}
        size="small"
        type="primary"
        title={group.name}
        style={{ maxWidth: '100%', minWidth: 'inherit' }}
      >
        <div className="groupedContent">
          {renderGroupIcon(group)}
          <span className="groupedName">{group.name}</span>
          <i className="groupedChevron icon icon-arrow-down" />
        </div>
      </GroupedHoverButton>
    </span>
  );

  return (
    <Trigger
      popupVisible={popupVisible}
      zIndex={1000}
      action={['click']}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 4],
        overflow: { adjustX: true, adjustY: true },
      }}
      onPopupVisibleChange={setPopupVisible}
      popup={
        <Menu
          style={getGroupMenuStyle(buttonsProps.type)}
          onClickAway={() => setPopupVisible(false)}
          onClickAwayExceptions={POPUP_CLICK_AWAY_EXCEPTIONS}
        >
          {buttons.length ? (
            <CustomButtons
              {...buttonsProps}
              type="menu"
              icon
              buttons={buttons}
              setCustomButtonActive={handleCustomButtonActive}
            />
          ) : (
            <EmptyGroupTip>{_l('暂无自定义动作')}</EmptyGroupTip>
          )}
        </Menu>
      }
    >
      {triggerNode}
    </Trigger>
  );
}

function Buttons(props) {
  const {
    type = 'iconText',
    isOperates,
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
  const operateHeight = (props.rowHeight && props.rowHeight) > 34 || props.isInCard ? 32 : 26;
  const moreWidth = props.isInCard ? 32 : 26;
  const hideDisabled = type === 'iconText' || !viewId;

  if (hideDisabled) {
    buttons = buttons.filter(button => !(btnDisable[button.btnId] || button.disabled));
  }

  const items = useMemo(
    () =>
      type === 'button' || type === 'iconText'
        ? buildItems(buttons, layoutGroupRaw, layoutFlatRaw, btnDisable, hideDisabled)
        : buttons.map(button => ({ kind: 'btn', button })),
    [buttons, layoutGroupRaw, layoutFlatRaw, btnDisable, hideDisabled, type],
  );

  let itemShowNum = 1;

  if (typeof visibleNum === 'number') {
    itemShowNum = Math.min(visibleNum, items.length);
  } else {
    const sumWidth = _.sum(items.map(item => getItemWidth(item, type)));
    const moreButtonWidth = getButtonWidth({ name: _l('更多') }, type) - 6;

    if (sumWidth < width) {
      itemShowNum = items.length;
    } else {
      while (true) {
        if (
          itemShowNum <= items.length &&
          _.sum(items.slice(0, itemShowNum + 1).map(item => getItemWidth(item, type))) < width - moreButtonWidth
        ) {
          itemShowNum += 1;
        } else {
          break;
        }
      }
    }
  }

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
  // 填写动作打开 FillRecordControls 时主动关溢出弹层；
  // Trigger 去掉 destroyPopupOnHide，弹层关闭后 CustomButtons 仍挂载，
  // 避免连带卸载内部的 FillRecordControls Modal。
  const handleOverflowCustomButtonActive = useCallback(active => {
    if (active) setPopupVisible(false);
  }, []);
  let moreContent;

  if (isOperates) {
    moreContent = (
      <DropButton
        className={cx(
          'recordCustomButton overflowHidden transparentButton moreButtons',
          {
            active: popupVisible,
            isOperates,
          },
          get(buttons, '0.className', ''),
        )}
        operateHeight={operateHeight}
        moreWidth={moreWidth}
      >
        <i className="icon icon-more_horiz Font20"></i>
      </DropButton>
    );
  } else if (type === 'button') {
    moreContent = (
      <DropButton
        className={cx('recordCustomButton overflowHidden transparentButton moreButtons', {
          active: popupVisible,
          isOperates,
        })}
        size="small"
        type="ghost"
      >
        <span className="breakAll overflow_ellipsis">{_l('更多')}</span>
        <i className="dropIcon icon icon-arrow-down-border Font12 mLeft6 mRight0" />
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
              isInCard={props.isInCard}
              buttonsProps={sharedButtonsProps}
            />,
          );
        }

        i += 1;
      }
    }

    return elements;
  }

  function renderOverflowMenu() {
    if (type !== 'button' && type !== 'iconText') {
      return (
        <CustomButtons
          {...buttonsProps}
          isCharge={isCharge}
          hideDisabled={hideDisabled}
          isBatchOperate={selectedRows.length > 1 || isAll}
          type="menu"
          icon
          buttons={overflowItems.map(it => it.button).filter(Boolean)}
          setCustomButtonActive={handleOverflowCustomButtonActive}
        />
      );
    }

    const nodes = [];
    const menuButtonsProps = {
      ...buttonsProps,
      isCharge,
      hideDisabled,
      isBatchOperate: selectedRows.length > 1 || isAll,
      setCustomButtonActive: handleOverflowCustomButtonActive,
    };
    let i = 0;

    while (i < overflowItems.length) {
      const item = overflowItems[i];

      if (item.kind === 'btn') {
        const run = [];
        let j = i;

        while (j < overflowItems.length && overflowItems[j].kind === 'btn') {
          run.push(overflowItems[j].button);
          j += 1;
        }

        nodes.push(<CustomButtons key={`mrun-${i}`} {...menuButtonsProps} type="menu" icon buttons={run} />);
        i = j;
      } else {
        nodes.push(
          <GroupedMenuItem
            key={`mgroup-${item.group.id || i}`}
            group={item.group}
            buttons={item.buttons}
            buttonsProps={menuButtonsProps}
          />,
        );
        i += 1;
      }
    }

    return nodes;
  }

  return (
    <Con className={cx('customButtonsCon')}>
      {renderVisibleItems()}
      {showMore && (
        <Trigger
          popupVisible={popupVisible}
          zIndex={1000}
          action={[isOperates ? 'click' : 'hover']}
          popupAlign={{
            points: ['tl', 'bl'],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
            offset: type === 'button' ? [0, 6] : [],
          }}
          onPopupVisibleChange={setPopupVisible}
          popup={
            <Menu
              style={{
                position: 'relative',
                maxHeight: 500,
                overflowY: 'auto',
                ...(type === 'button' ? { width: 240 } : {}),
              }}
              onClickAway={() => setPopupVisible(false)}
              onClickAwayExceptions={POPUP_CLICK_AWAY_EXCEPTIONS}
            >
              {renderOverflowMenu()}
            </Menu>
          }
        >
          {moreContent}
        </Trigger>
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
