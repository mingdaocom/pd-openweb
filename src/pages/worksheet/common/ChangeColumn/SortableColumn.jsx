import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, SortableList } from 'ming-ui';
import { Switch, Tooltip } from 'ming-ui/antd-components';
import { getIconByType } from 'src/utils/domain/control/metadata';

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
    forbiddenScroll,
    disabled,
    columnTexts = {},
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
  const scrollTopRef = useRef(null);

  useEffect(() => {
    if (forbiddenScroll && scrollTopRef.current && listRef.current) {
      setTimeout(() => {
        listRef.current.scrollTop = scrollTopRef.current;
        scrollTopRef.current = null;
      }, 0);
    }
  }, [forbiddenScroll, selected]);

  const onItemClick = item => {
    if (disabled) return;
    if (forbiddenScroll && listRef.current) {
      scrollTopRef.current = listRef.current.scrollTop;
    }

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
        <i className={cx('icon focusColor textTertiary mRight6 Font16', 'icon-' + getIconByType(item.type))}></i>
        <span className="flex overflow_ellipsis focusColor">
          {item.controlName || (item.type === 22 ? _l('分段') : _l('备注'))}
        </span>
        <Tooltip placement="bottom" title={canDrag ? null : _l('前往')}>
          <i
            className={cx('icon textTertiary Font16 Right hoverColorPrimary dragHandle', {
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
    const hiddenTitle = columnTexts.unselectedTitle
      ? columnTexts.unselectedTitle(filteredColumnsLength)
      : `${item.controlName} ${filteredColumnsLength}`;

    if (item.isTab) {
      return (
        (!search || !!filteredColumnsLength) && (
          <React.Fragment>
            <div className="textSecondary Font13 bold mBottom14 mTop12 pLeft9 columnCheckListTitle showColumnCheckListTitle">
              {hiddenTitle}
            </div>
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
          <div
            className={cx('switchIcon flexRow alignItemsCenter', { cursorNotAllowed: disabled })}
            onClick={() => onItemClick(item)}
          >
            <Switch
              size="mini"
              checked={selected.indexOf(item.controlId) > -1}
              onClick={(_, event) => event.stopPropagation()}
              onChange={() => onItemClick(item)}
            />
          </div>
          {canDrag ? <DragHandle className="overflow_ellipsis">{renderSortCon(item)}</DragHandle> : renderSortCon(item)}
          {tabColumns && tabColumns.length !== 0 && !search && (
            <Icon
              onClick={() => setRetractTabControlIds(item.controlId, isRetract)}
              className="Font22 textTertiary expendIcon"
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
      {search && !items.length && <div className="emptyTip TxtCenter">{_l('没有搜索结果')}</div>}
      {sortAutoChange && isShowColumns && (!search || !!filteredShowColumns.length) && (
        <React.Fragment>
          <div className="textSecondary Font13 bold mBottom14 mTop12 pLeft9 columnCheckListTitle showColumnCheckListTitle">
            {columnTexts.selectedTitle
              ? columnTexts.selectedTitle(filteredShowColumns.length)
              : `${_l('显示')} ${filteredShowColumns.length}`}
          </div>
          {!filteredShowColumns.length && canDrag && (
            <div className="pLeft9 dragListEmptyTip showDrafListEmptyCon">{_l('开启或拖拽到这里')}</div>
          )}
        </React.Fragment>
      )}
      <SortableList
        renderBody
        useDragHandle
        items={list.filter(l => !l.sectionId || sortAutoChange || search)}
        itemKey="controlId"
        onSortEnd={handleSortEnd}
        renderItem={renderItem}
      />
    </div>
  );
}
