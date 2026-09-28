import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend-latest';
import { useDrag } from 'react-dnd-latest';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Dropdown, Input, Modal } from 'ming-ui/antd-components';
import { getNextOpenMoreKey, ITEM_TYPE_GROUP } from './constants';
import { renderCustomBtnStyleIcon } from './icon';

export default function GroupHeader({
  segmentIndex,
  layoutId,
  name,
  icon,
  iconUrl,
  iconColor,
  collapsed,
  listExpanded = false,
  onToggleCollapsed,
  onRename,
  onRemoveGroup,
  onEditFromMenu,
  moreKey,
  openMoreKey,
  setOpenMoreKey,
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const headerRef = useRef(null);
  const titleToggleTimerRef = useRef(null);
  const [{ isDragging }, drag, dragPreview] = useDrag({
    item: { type: ITEM_TYPE_GROUP, segmentIndex, layoutId },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
    begin: () => {
      const el = headerRef.current;
      const block = el?.closest('.customBtnGroupedBlock');
      const w = block?.offsetWidth || el?.offsetWidth || 320;
      const headerH = el?.offsetHeight || 44;
      window.MD_DRAG_ITEM = {
        width: w,
        height: headerH + 12,
      };
    },
    end: () => {
      window.MD_DRAG_ITEM = undefined;
    },
  });
  const attachHeaderRef = useCallback(
    node => {
      headerRef.current = node;
      drag(node);
    },
    [drag],
  );

  useEffect(() => {
    dragPreview(getEmptyImage());
  }, [dragPreview]);

  useEffect(() => {
    return () => {
      if (titleToggleTimerRef.current) {
        clearTimeout(titleToggleTimerRef.current);
      }
    };
  }, []);

  const handleDropdownVisibleChange = visible => {
    setOpenMoreKey(prev => getNextOpenMoreKey(prev, visible, moreKey));
  };

  const moreMenuItems = [
    {
      key: 'edit',
      icon: <Icon icon="edit" className="Font16 textSecondary" />,
      label: _l('编辑'),
      onClick: onEditFromMenu,
    },
    {
      key: 'del',
      danger: true,
      icon: <Icon icon="trash" className="Font16" />,
      label: _l('删除'),
      onClick: () => {
        Modal.confirm({
          title: <span className="textError">{_l('确认删除分组？')}</span>,
          content: _l('此操作不会删除分组下的自定义动作，将移至列表末尾'),
          okButtonProps: {
            danger: true,
          },
          okText: _l('确认'),
          cancelText: _l('取消'),
          onOk: () => onRemoveGroup(),
        });
      },
    },
  ];

  const handleHeaderClick = e => {
    if (
      editing ||
      e.target.closest('.customBtnGroupedGroupMore') ||
      e.target.closest('.customBtnGroupedGroupCaret') ||
      e.target.closest('.customBtnGroupedGroupTitleInput') ||
      e.target.closest('.hap-dropdown') ||
      e.target.closest('.customBtnGroupedGroupTitle')
    ) {
      return;
    }

    onToggleCollapsed();
  };

  const handleTitleClick = e => {
    e.stopPropagation();

    if (editing) {
      return;
    }

    if (titleToggleTimerRef.current) {
      clearTimeout(titleToggleTimerRef.current);
    }

    titleToggleTimerRef.current = setTimeout(() => {
      titleToggleTimerRef.current = null;
      onToggleCollapsed();
    }, 280);
  };

  const handleTitleDoubleClick = e => {
    e.stopPropagation();

    if (titleToggleTimerRef.current) {
      clearTimeout(titleToggleTimerRef.current);
      titleToggleTimerRef.current = null;
    }

    setDraftName(name);
    setEditing(true);
  };

  return (
    <div
      ref={attachHeaderRef}
      className={cx('customBtnGroupedGroupHeader flexRow alignItemsCenter', {
        isDragging,
        customBtnGroupedGroupHeaderExpanded: listExpanded,
      })}
      style={{ opacity: isDragging ? 0 : 1 }}
      onClick={handleHeaderClick}
    >
      <span className="customBtnGroupedGroupIconSlot InlineFlex alignItemsCenter justifyContentCenter">
        {renderCustomBtnStyleIcon(icon || 'adds', iconUrl, iconColor)}
      </span>
      {editing ? (
        <Input
          className="flex customBtnGroupedGroupTitleInput"
          value={draftName}
          autoFocus
          onChange={e => setDraftName(e.target.value)}
          onBlur={() => {
            setEditing(false);
            onRename(draftName.trim() || _l('分组'));
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.target.blur();
            }
          }}
        />
      ) : (
        <span
          className="flex Font13 textPrimary overflow_ellipsis Hand customBtnGroupedGroupTitle"
          title={name}
          onClick={handleTitleClick}
          onDoubleClick={handleTitleDoubleClick}
        >
          {name}
        </span>
      )}
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        align={{ overflow: { adjustX: true, adjustY: true } }}
        getPopupContainer={() => document.body}
        open={openMoreKey === moreKey}
        onOpenChange={handleDropdownVisibleChange}
        menu={{
          items: moreMenuItems,
          style: { minWidth: 180 },
          onClick: () => setOpenMoreKey(null),
        }}
      >
        <span
          className="customBtnGroupedGroupMore Hand InlineFlex alignItemsCenter justifyContentCenter"
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          <Icon icon="more_horiz" className="Font18 colorPrimary" />
        </span>
      </Dropdown>
      <span
        className="customBtnGroupedGroupCaret Hand InlineFlex alignItemsCenter justifyContentCenter"
        onClick={e => {
          e.stopPropagation();
          onToggleCollapsed();
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <Icon
          icon={collapsed ? 'arrow-up' : 'arrow-down'}
          className="Font14 textTertiary customBtnGroupedGroupCaretIcon"
        />
      </span>
    </div>
  );
}
