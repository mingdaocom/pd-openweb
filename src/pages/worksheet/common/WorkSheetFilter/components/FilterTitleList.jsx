import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { Menu, MenuItem, Icon, Tooltip } from 'ming-ui';
import { sortableContainer, sortableElement, sortableHandle, arrayMove } from 'react-sortable-hoc';
import { VerticalMiddle } from 'worksheet/components/Basics';
import { FILTER_TYPE } from '../enum';
import _ from 'lodash';

const Con = styled.div`
  .title {
    font-size: 14px;
    color: #9e9e9e;
    padding: 8px 18px;
  }
`;

const MenuCon = styled(Menu)`
  width: 160px;
  position: relative !important;
  hr {
    border: none;
    margin: 4px 0;
    border-top: 1px solid #e0e0e0 !important;
  }
  .ming.Item .Item-content {
    padding-left: 50px !important;
    .Icon {
      left: 15px;
    }
  }
  .red {
    color: #f44336;
    &.ming.MenuItem .icon {
      color: #f44336;
    }
  }
`;

const FilterTitleItemCon = styled(VerticalMiddle)`
  cursor: pointer;
  height: 36px;
  border-radius: 4px;
  padding: 0 18px;
  justify-content: space-between;
  position: relative;
  .content {
    overflow: hidden;
  }
  .icon.dragger {
    cursor: pointer;
    font-size: 12px;
    transform: translateX(-14px);
    position: absolute;
    top: 12px;
    left: 18px;
  }
  .icon {
    font-size: 18px;
    color: #999;
  }
  .hoverShow {
    display: none;
  }
  &.active {
    background: #e5f3fe;
    color: #2196f3;
    .filterIcon {
      color: #2196f3;
    }
  }
  &:hover:not(.active):not(.isDragging) {
    background: #f5f5f5;
  }
  &:hover:not(.isDragging) {
    .hoverShow {
      display: inline-block;
    }
  }
  &.moreMenuActive {
    .moreMenu {
      display: inline-block;
    }
  }
  &.draggingItem {
    z-index: 9999;
    background: #f5f5f5;
    .dragger {
      display: inline-block;
    }
  }
`;

const DragHandle = sortableHandle(() => <i className="icon icon-drag dragger hoverShow ThemeHoverColor3"></i>);

function FilterTitleItem(props) {
  const {
    error,
    isCharge,
    className,
    active,
    filter,
    onEditFilter,
    onCopy,
    onDelete,
    onToggleFilterType,
    triggerFilter,
    onHideFilterPopup,
  } = props;
  const { name } = filter;
  const [moreMenuActive, setMoreMenuActive] = useState(false);
  const canEdit = isCharge || filter.createAccountId === md.global.Account.accountId;
  return (
    <FilterTitleItemCon
      className={cx(className, { active, moreMenuActive })}
      onClick={() => {
        triggerFilter(filter);
        onHideFilterPopup();
      }}
    >
      <VerticalMiddle className="content">
        <DragHandle />
        <i className="icon icon-worksheet_filter filterIcon"></i>
        <span title={name} className="Font14 mLeft10 ellipsis">
          {name}
        </span>
        {error && (
          <Tooltip text={_l('该筛选器中的筛选条件出错')}>
            <i className="icon icon-error1 Font16 mLeft6" style={{ color: '#F44336' }}></i>
          </Tooltip>
        )}
      </VerticalMiddle>
      <div onClick={e => e.stopPropagation()}>
        <Trigger
          popupVisible={moreMenuActive}
          action={['click']}
          popupAlign={{
            points: ['tr', 'br'],
            offset: [0, 4],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          }}
          popup={
            <MenuCon>
              {canEdit && (
                <MenuItem icon={<Icon icon="settings" className="Font18" />} onClick={() => onEditFilter(filter)}>
                  {_l('编辑')}
                </MenuItem>
              )}
              <MenuItem
                icon={<Icon icon="copy" className="Font18" />}
                onClick={() => {
                  setMoreMenuActive(false);
                  onCopy(filter);
                }}
              >
                {_l('复制')}
              </MenuItem>
              {canEdit && (
                <MenuItem
                  icon={<Icon icon="edit" className="Font18" />}
                  onClick={() => {
                    onEditFilter(filter);
                    setTimeout(() => {
                      document.querySelector('.filterDetailName .name').click();
                    }, 40);
                  }}
                >
                  {_l('重命名')}
                </MenuItem>
              )}
              {isCharge && (
                <MenuItem
                  icon={<Icon icon="group-members" className="Font18" />}
                  onClick={() => {
                    setMoreMenuActive(false);
                    onToggleFilterType(filter);
                  }}
                >
                  {filter.type === FILTER_TYPE.PUBLIC ? _l('设为个人筛选') : _l('设为公共筛选')}
                </MenuItem>
              )}
              {canEdit && (
                <Fragment>
                  <hr />
                  <MenuItem
                    className="red"
                    icon={<Icon icon="trash" className="Font18" />}
                    onClick={() => {
                      setMoreMenuActive(false);
                      onDelete(filter);
                    }}
                  >
                    {_l('删除')}
                  </MenuItem>
                </Fragment>
              )}
            </MenuCon>
          }
          onPopupVisibleChange={setMoreMenuActive}
        >
          <i className="icon icon-more_horiz Hand moreMenu hoverShow ThemeHoverColor3"></i>
        </Trigger>
      </div>
    </FilterTitleItemCon>
  );
}

const SortableFilterTitleItem = sortableElement(props => <FilterTitleItem {...props} />);

const SortableContainer = sortableContainer(({ children }) => {
  return <div>{children}</div>;
});

function filterHasError(filter, controls) {
  if (filter.conditionsGroups) {
    return _.some(filter.conditionsGroups.map(gf => filterHasError(gf, controls)));
  }
  return !!(_.get(filter, 'conditions') || []).filter(c => !_.find(controls, { controlId: c.controlId })).length;
}

export default function FilterTitleList(props) {
  const {
    isCharge,
    title,
    activeFilter = {},
    controls = [],
    filters = [],
    onSortEnd = () => {},
    onEditFilter = () => {},
    onCopy = () => {},
    onDelete = () => {},
    onToggleFilterType = () => {},
    triggerFilter = () => {},
    onHideFilterPopup = () => {},
  } = props;
  const [isDragging, setIsDragging] = useState(false);
  return (
    <Con>
      <div className="title">{title}</div>
      <SortableContainer
        useDragHandle
        filters={filters}
        axis={'y'}
        // hideSortableGhost
        helperClass="draggingItem"
        transitionDuration={0}
        distance={3}
        onSortStart={() => setIsDragging(true)}
        onSortEnd={({ oldIndex, newIndex }) => {
          setIsDragging(false);
          onSortEnd(arrayMove(filters, oldIndex, newIndex).map(f => f.id));
        }}
      >
        {filters.map((filter, i) => (
          <SortableFilterTitleItem
            error={filterHasError(filter, controls)}
            active={activeFilter.id === filter.id}
            isCharge={isCharge}
            className={cx({ isDragging })}
            key={filter.id}
            index={i}
            filter={filter}
            onEditFilter={onEditFilter}
            onCopy={onCopy}
            onDelete={onDelete}
            onToggleFilterType={onToggleFilterType}
            triggerFilter={triggerFilter}
            onHideFilterPopup={onHideFilterPopup}
          />
        ))}
      </SortableContainer>
    </Con>
  );
}
