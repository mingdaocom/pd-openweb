import React, { useCallback, useEffect, useRef } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend-latest';
import { useDrag } from 'react-dnd-latest';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Dropdown, Modal, Tooltip } from 'ming-ui/antd-components';
import { getNextOpenMoreKey, ITEM_TYPE } from './constants';
import { renderCustomBtnStyleIcon } from './icon';

function ActionItemRow({ btn, editBtn, deleteBtn, handleCopy, toggleEnable, disable, openMoreKey, setOpenMoreKey }) {
  const { name = '', icon = '', color = '', btnId = '', iconUrl, isAllView, status } = btn;
  const isDisabled = status === 0;
  const moreKey = `btn:${btnId}`;

  const handleDropdownVisibleChange = visible => {
    setOpenMoreKey(prev => getNextOpenMoreKey(prev, visible, moreKey));
  };

  const moreMenuItems = [
    {
      key: 'edit',
      icon: <Icon icon="edit" className="Font16 textSecondary" />,
      label: _l('编辑'),
      onClick: () => {
        editBtn(btnId);
      },
    },
    {
      key: 'copy',
      icon: <Icon icon="copy" className="Font16 textSecondary" />,
      label: _l('复制'),
      onClick: () => {
        Modal.confirm({
          title: <span className="WordBreak Block">{_l('复制自定义动作“%0”', name)}</span>,
          content: _l('将复制该自定义动作及其对应工作流，复制后的工作流与原工作流配置一致'),
          onOk: () => {
            handleCopy(btnId);
          },
        });
      },
    },
    {
      key: 'enable',
      icon: <Icon icon={isDisabled ? 'arrow-right-tip' : 'rounded_square'} className="Font16" />,
      label: isDisabled ? _l('启用') : _l('停用'),
      onClick: () => {
        toggleEnable(btnId, isDisabled ? 1 : 0);
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'del',
      danger: true,
      icon: <Icon icon="trash" className="Font18" />,
      label: _l('删除'),
      onClick: () => {
        deleteBtn(btnId, isAllView);
      },
    },
  ];

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
