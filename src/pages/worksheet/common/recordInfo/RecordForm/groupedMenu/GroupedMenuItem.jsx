import React, { useCallback, useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Menu, SvgIcon } from 'ming-ui';
import CustomButtons, { MenuItemWrap } from 'worksheet/common/recordInfo/RecordForm/CustomButtons';

export const POPUP_CLICK_AWAY_EXCEPTIONS = [
  '.mdModalWrap',
  '.mui-dialog-container',
  '.dropdownTrigger',
  '.addFilterPopup',
  '.filterControlOptionsList',
  '.mui-datetimepicker',
  '.mui-datetimerangepicker',
  '.selectUserBox',
  '.worksheetFilterOperateList',
  '.ant-select-dropdown',
  '.ant-picker-dropdown',
  '.rc-trigger-popup',
  '#dialogSelectDept_container',
  '.CityPicker',
  '.CityPicker-wrapper',
  '.rightRecord',
];

const GROUP_MENU_STYLE = { position: 'relative', maxHeight: 500, overflowY: 'auto', minWidth: 180 };

export function getGroupMenuStyle(type) {
  return type === 'button' ? { ...GROUP_MENU_STYLE, width: 240 } : GROUP_MENU_STYLE;
}

export function renderGroupMenuIcon(group) {
  const { icon, iconUrl, iconColor } = group || {};
  const color = iconColor || 'var(--color-text-primary)';
  const useSvg = !!iconUrl && !!icon && (String(icon).endsWith('_svg') || String(icon).startsWith('sys_'));

  if (useSvg) {
    return (
      <SvgIcon
        className="InlineBlock TxtTop mLeft5 Icon"
        addClassName="TxtMiddle"
        url={iconUrl}
        fill={color}
        size={16}
      />
    );
  }

  return <Icon style={{ color }} icon={icon || 'custom_actions'} className="Font17 mLeft5" />;
}

export const EmptyGroupTip = styled.div`
  padding: 8px 16px;
  color: var(--color-text-tertiary);
  font-size: 13px;
  white-space: nowrap;
`;

export default function GroupedMenuItem(props) {
  const { group, buttons, buttonsProps } = props;
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const parentSetCustomButtonActive = buttonsProps.setCustomButtonActive;
  const parentTriggerCallback = buttonsProps.triggerCallback;
  // 填写动作打开 FillRecordControls 时关闭子菜单弹层，并向上冒泡通知父级溢出弹层一起关；
  // Trigger 去掉 destroyPopupOnHide，避免连带卸载 CustomButtons 内部的 FillRecordControls Modal。
  const handleCustomButtonActive = useCallback(
    active => {
      if (active) setSubmenuVisible(false);
      if (parentSetCustomButtonActive) parentSetCustomButtonActive(active);
    },
    [parentSetCustomButtonActive],
  );
  // 动作执行后（含二次确认/填写完成）父级只关闭了根弹层，子菜单是独立 portal 弹层，需在此一并关闭，
  // 否则自定义动作列表弹窗会残留。
  const handleTriggerCallback = useCallback(() => {
    setSubmenuVisible(false);
    if (parentTriggerCallback) parentTriggerCallback();
  }, [parentTriggerCallback]);

  return (
    <Trigger
      popupVisible={submenuVisible}
      zIndex={1001}
      action={['click']}
      popupAlign={{
        points: ['tl', 'tr'],
        offset: [4, 0],
        overflow: { adjustX: true, adjustY: true },
      }}
      popupClassName="groupedMenuPopup"
      onPopupVisibleChange={setSubmenuVisible}
      popup={
        <Menu
          style={getGroupMenuStyle(buttonsProps.type)}
          onClickAway={() => setSubmenuVisible(false)}
          onClickAwayExceptions={POPUP_CLICK_AWAY_EXCEPTIONS}
        >
          {buttons.length ? (
            <CustomButtons
              {...buttonsProps}
              type="menu"
              icon
              buttons={buttons}
              setCustomButtonActive={handleCustomButtonActive}
              triggerCallback={handleTriggerCallback}
            />
          ) : (
            <EmptyGroupTip>{_l('暂无自定义动作')}</EmptyGroupTip>
          )}
        </Menu>
      }
    >
      <MenuItemWrap title={group.name} icon={renderGroupMenuIcon(group)}>
        <span className="btnName mLeft15 ellipsis">{group.name}</span>
        <i
          className="icon icon-arrow-right-tip"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
          }}
        />
      </MenuItemWrap>
    </Trigger>
  );
}
