import React, { useCallback, useEffect, useRef } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend-latest';
import { useDrag } from 'react-dnd-latest';
import { Dropdown, Menu } from 'antd';
import cx from 'classnames';
import { Dialog, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getNextOpenMoreKey, ITEM_TYPE } from './constants';
import { renderCustomBtnStyleIcon } from './icon';

const confirm = Dialog.confirm;

function ActionItemRow({ btn, editBtn, deleteBtn, handleCopy, toggleEnable, disable, openMoreKey, setOpenMoreKey }) {
  const { name = '', icon = '', color = '', btnId = '', iconUrl, isAllView, status } = btn;
  const isDisabled = status === 0;
  const moreKey = `btn:${btnId}`;

  const handleDropdownVisibleChange = visible => {
    setOpenMoreKey(prev => getNextOpenMoreKey(prev, visible, moreKey));
  };

  const moreMenu = (
    <Menu className="customBtnGroupedGroupDropdownMenu" onClick={() => setOpenMoreKey(null)}>
      <Menu.Item
        key="edit"
        className="customBtnGroupedGroupMenuItem"
        onClick={() => {
          editBtn(btnId);
        }}
      >
        <Icon icon="edit" className="Font16 mRight8 textSecondary" />
        {_l('编辑')}
      </Menu.Item>
      <Menu.Item
        key="copy"
        className="customBtnGroupedGroupMenuItem"
        onClick={() => {
          confirm({
            title: <span className="WordBreak Block">{_l('复制自定义动作“%0”', name)}</span>,
            onOk: () => {
              handleCopy(btnId);
            },
          });
        }}
      >
        <Icon icon="copy" className="Font16 mRight8 textSecondary" />
        {_l('复制')}
      </Menu.Item>
      <Menu.Item
        key="enable"
        danger={!isDisabled}
        className={cx('customBtnGroupedGroupMenuItem', { customBtnGroupedGroupMenuItemDanger: !isDisabled })}
        onClick={() => {
          toggleEnable(btnId, isDisabled ? 1 : 0);
        }}
      >
        <Icon icon={isDisabled ? 'arrow-right-tip' : 'rounded_square'} className="Font16 mRight8 textSecondary" />
        {isDisabled ? _l('启用') : _l('停用')}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="del"
        danger
        className="customBtnGroupedGroupMenuItem customBtnGroupedGroupMenuItemDanger"
        onClick={() => {
          deleteBtn(btnId, isAllView);
        }}
      >
        <Icon icon="trash" className="Font18 mRight8" />
        {_l('删除')}
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={cx('customBtn alignItemsCenter', 'customBtnGroupedRow', { disabledCustomBtn: isDisabled })}>
      <span
        className="Hand con overflow_ellipsis alignItemsCenter"
        onClick={() => {
          if (!isDisabled) {
            editBtn(btnId);
          }
        }}
      >
        <span className="Font13 WordBreak textPrimary Bold flexRow alignItemsCenter">
          {disable ? (
            <Tooltip placement="bottom" title={_l('批量操作的按钮不支持关联形态表单填写')}>
              <Icon icon="error1" style={{ color: 'red' }} className={cx('mRight12 Font18')} />
            </Tooltip>
          ) : (
            renderCustomBtnStyleIcon(icon, iconUrl, isDisabled ? 'var(--color-text-disabled)' : color)
          )}
          <span className={cx('flex overflow_ellipsis', { textTertiary: disable || isDisabled })}>
            {name || ''}
            {isDisabled && <span className="Normal mLeft5">{`[${_l('停用')}]`}</span>}
          </span>
        </span>
      </span>
      <Dropdown
        overlay={moreMenu}
        trigger={['click']}
        placement="bottomRight"
        align={{ overflow: { adjustX: true, adjustY: true } }}
        getPopupContainer={() => document.body}
        visible={openMoreKey === moreKey}
        onVisibleChange={handleDropdownVisibleChange}
      >
        <span
          className="customBtnGroupedRowMore Hand InlineFlex alignItemsCenter justifyContentCenter"
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          <Icon className="Font18 textTertiary hoverColorPrimary" icon="more_horiz" />
        </span>
      </Dropdown>
    </div>
  );
}

export function DraggableBtnRow({
  btn,
  segmentIndex,
  idIndex,
  layoutId,
  editBtn,
  deleteBtn,
  handleCopy,
  toggleEnable,
  disable,
  openMoreKey,
  setOpenMoreKey,
}) {
  const rowRef = useRef(null);
  const [{ isDragging }, drag, dragPreview] = useDrag({
    item: { type: ITEM_TYPE, segmentIndex, idIndex, btnId: btn.btnId, layoutId },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
    begin: () => {
      const el = rowRef.current;

      if (el) {
        window.MD_DRAG_ITEM = {
          width: el.offsetWidth,
          height: el.offsetHeight,
        };
      }
    },
    end: () => {
      window.MD_DRAG_ITEM = undefined;
    },
  });
  const attachRowRef = useCallback(
    node => {
      rowRef.current = node;
      drag(node);
    },
    [drag],
  );

  useEffect(() => {
    dragPreview(getEmptyImage());
  }, [dragPreview]);

  return (
    <div ref={attachRowRef} className="customBtnGroupedDragRow" style={{ opacity: isDragging ? 0 : 1 }}>
      <ActionItemRow
        btn={btn}
        editBtn={editBtn}
        deleteBtn={deleteBtn}
        handleCopy={handleCopy}
        toggleEnable={toggleEnable}
        disable={disable}
        openMoreKey={openMoreKey}
        setOpenMoreKey={setOpenMoreKey}
      />
    </div>
  );
}
