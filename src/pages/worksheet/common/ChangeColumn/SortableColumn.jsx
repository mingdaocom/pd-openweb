import React, { useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, SortableList, Tooltip } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';

export default function SortableColumn(props) {
  const {
    items = [],
    isShowColumns,
    canDrag,
    sortAutoChange,
    focusControlId,
    maxHeight,
    selected = [],
    search,
    retractTabControlIds,
    onClearSearch,
    setRetractTabControlIds,
    handleItemClick,
    handleSortEnd,
  } = props;
  let list = items;
  let filteredShowColumns = [];
  let filteredHideColumns = [];
  if (sortAutoChange && isShowColumns) {
    filteredShowColumns = items.filter(l => selected.includes(l.controlId));
    filteredHideColumns = items.filter(l => !selected.includes(l.controlId));
    list = _.concat(
      filteredShowColumns,
      [{ controlId: 'hideListCount', isTab: true, controlName: _l('隐藏'), type: 'hide' }],
      filteredHideColumns,
    );
  }

  const listRef = useRef(null);

  const onItemClick = item => {
    handleItemClick(item, !canDrag && !search);
  };

  const renderSortCon = item => {
    return (
      <div
        className={cx('flex dragCon overflow_ellipsis', { HandImportant: !canDrag })}
        onClick={() => {
          if (canDrag || !search) return;
          onClearSearch(item.controlId);
        }}
      >
        <i className={cx('icon focusColor Gray_9e mRight6 Font16', 'icon-' + getIconByType(item.type))}></i>
        <span className="flex overflow_ellipsis focusColor">
          {item.controlName || (item.type === 22 ? _l('分段') : _l('备注'))}
        </span>
        <Tooltip popupPlacement="bottom" text={canDrag ? null : _l('前往')}>
          <i
            className={cx('icon Gray_9e Font16 Right ThemeHoverColor3 dragHandle', {
              'icon-drag': canDrag,
              'icon-backspace searchIcon': search && !canDrag,
            })}
          ></i>
        </Tooltip>
      </div>
    );
  };

  const renderItem = options => {
    const { item, DragHandle } = options;
    const tabColumns = item.type === 52 ? items.filter(l => l.sectionId === item.controlId) : undefined;
    const isRetract = retractTabControlIds.includes(item.controlId);
    const filteredColumnsLength = filteredHideColumns.length;

    if (item.isTab) {
      return (
        (!search || !!filteredColumnsLength) && (
          <React.Fragment>
            <div className="Gray_75 Font13 bold mBottom14 mTop12 pLeft9 columnCheckListTitle showColumnCheckListTitle">{`${item.controlName} ${filteredColumnsLength}`}</div>
            {!filteredColumnsLength && canDrag && (
              <div className="pLeft9 dragListEmptyTip showDrafListEmptyCon">{_l('关闭或拖拽到这里')}</div>
            )}
          </React.Fragment>
        )
      );
    }

    return (
      <div className={cx('showControlsColumnDrageble noSelect', { tabColumn: item.type === 52 })}>
        <div
          className={cx('showControlsColumnCheckItem flexRow', {
            focusColumnItem: focusControlId === item.controlId,
          })}
        >
          <Icon
            icon={selected.indexOf(item.controlId) > -1 ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="switchIcon Font30 mRight8 Hand"
            onClick={() => onItemClick(item)}
          />
          {canDrag ? <DragHandle className="overflow_ellipsis">{renderSortCon(item)}</DragHandle> : renderSortCon(item)}
          {tabColumns && tabColumns.length !== 0 && !search && (
            <Icon
              onClick={() => setRetractTabControlIds(item.controlId, isRetract)}
              className="Font22 Gray_9e expendIcon"
              icon={isRetract ? 'expand_more' : 'expand_less'}
            />
          )}
        </div>
        {!canDrag && tabColumns && !isRetract && !search && (
          <div className="subColumns">{tabColumns.map(l => renderItem({ ...options, item: l }))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="columnCheckList" style={{ overflow: 'auto', maxHeight }} ref={listRef}>
      {!items.length && <div className="emptyTip TxtCenter">{_l('没有搜索结果')}</div>}
      {sortAutoChange && isShowColumns && (!search || !!filteredShowColumns.length) && (
        <React.Fragment>
          <div className="Gray_75 Font13 bold mBottom14 mTop12 pLeft9 columnCheckListTitle showColumnCheckListTitle">{`${_l(
            '显示',
          )} ${filteredShowColumns.length}`}</div>
          {!filteredShowColumns.length && canDrag && (
            <div className="pLeft9 dragListEmptyTip showDrafListEmptyCon">{_l('开启或拖拽到这里')}</div>
          )}
        </React.Fragment>
      )}
      <SortableList
        useDragHandle
        items={list.filter(l => !l.sectionId || sortAutoChange || search)}
        itemKey="controlId"
        onSortEnd={handleSortEnd}
        renderItem={renderItem}
      />
    </div>
  );
}
