import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { bool, func, number, string } from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, MdLink, Menu, MenuItem, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { FlexSpacer, VerticalMiddle } from 'worksheet/components/Basics';

const GroupItemLink = styled(MdLink)`
  display: block;
  &.draggingItem > div {
    background: var(--color-background-disabled);
  }
  &.isDragging:not(.draggingItem) {
    transition: ease 0.3s;
  }
`;

const GroupItemCon = styled.div`
  display: block;
  color: var(--color-text-title);
  font-size: 14px;
  cursor: pointer;
  height: 36px;
  padding: 0 14px;
  margin: 0 -14px;
  border-radius: 6px;
  background: var(--color-background-primary);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  .name {
    margin-right: 4px;
  }
  .operate {
    display: none;
  }
  .num {
    min-width: 18px;
    text-align: center;
  }
  .star {
    &.isMarked,
    &:hover {
      color: var(--color-yellow-dark) !important;
    }
  }
  .visibleStar {
    color: var(--color-yellow-dark);
  }
  &.hover:not(.isDragging),
  &:hover:not(.isDragging) {
    .name {
      max-width: 88px;
    }
    .operate {
      display: flex;
    }
    .num {
      display: none;
    }
    .visibleStar {
      display: none;
    }
  }
  &.hover:not(.isDragging):not(.active),
  &:hover:not(.isDragging):not(.active) {
    background-color: var(--color-background-hover);
  }
  &.active {
    color: ${({ themeColor }) => themeColor};
    background-color: ${({ activeColor }) => activeColor};
    .fontIcon {
      color: ${({ themeColor }) => `${themeColor} !important`};
    }
    svg {
      fill: ${({ themeColor }) => themeColor};
    }
    .name {
      font-weight: 500;
    }
  }
  > div {
    height: 100%;
  }
`;

const MenuWrap = styled(Menu)`
  position: relative !important;
  overflow: auto;
  padding: 6px 0 !important;
  width: 200px !important;
  .ming.MenuItem.red .Item-content {
    color: var(--color-error) !important;
    .Icon {
      color: var(--color-error) !important;
    }
  }
`;

const MenuItemWrap = styled(MenuItem)`
  .Item-content {
    padding-left: 47px !important;
  }
`;

const MoreBtnCon = styled(VerticalMiddle)`
  display: inline-flex;
  border-radius: 24px;
  justify-content: center;
  width: 24px;
  height: 24px;
  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const GroupItemIcon = styled(SvgIcon)`
  font-size: 0px;
  margin-right: 8px;
`;

export default function GroupItem(props) {
  const {
    hasManageAppAuth,
    isDragging,
    activeGroupId,
    projectId,
    className,
    active,
    itemType,
    id,
    to,
    groupType,
    fontIcon,
    icon,
    iconUrl,
    name,
    count,
    isMarked,
    onClick = () => {},
    onEdit = () => {},
    onDelete = () => {},
    onMark = () => {},
    dashboardColor,
  } = props;
  const [menuVisible, setMenuVisible] = useState();
  const content = (
    <GroupItemCon
      themeColor={dashboardColor.themeColor}
      activeColor={dashboardColor.activeColor}
      className={cx(className, {
        hover: menuVisible,
        isDragging,
        active:
          active ||
          (activeGroupId &&
            activeGroupId === id &&
            (location.hash.startsWith('#star') ? itemType === 'star' : itemType !== 'star')),
      })}
      onClick={onClick}
    >
      <VerticalMiddle>
        {fontIcon ? (
          <i className={`fontIcon icon icon-${fontIcon} Font16 textSecondary mRight8`} />
        ) : (
          <GroupItemIcon
            size={18}
            url={iconUrl || `${md.global.FileStoreConfig.pubHost}/customIcon/${icon}.svg`}
            fill="var(--color-text-secondary)"
          />
        )}
        <span className="name ellipsis">{name}</span>
        {!_.includes(['static'], itemType) && (
          <React.Fragment>
            <FlexSpacer />
            <VerticalMiddle
              className="operate stopPropagation"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {(groupType === 0 || (groupType === 1 && hasManageAppAuth)) && itemType !== 'star' && (
                <Trigger
                  popupVisible={menuVisible}
                  onPopupVisibleChange={setMenuVisible}
                  action={['click']}
                  popupAlign={{
                    points: ['tl', 'bl'],
                    overflow: { adjustY: true },
                  }}
                  popup={
                    <MenuWrap>
                      <MenuItemWrap
                        onClick={() => {
                          setMenuVisible(false);
                          onEdit(id);
                        }}
                        icon={<Icon icon="edit" className="Font18 mLeft5" />}
                      >
                        {_l('编辑')}
                      </MenuItemWrap>
                      <MenuItemWrap
                        className="red"
                        icon={<Icon icon="trash" className="Font18 mLeft5" />}
                        onClick={() => {
                          setMenuVisible(false);
                          onDelete(id, groupType);
                        }}
                      >
                        {_l('删除')}
                      </MenuItemWrap>
                    </MenuWrap>
                  }
                >
                  <MoreBtnCon>
                    <i className="icon icon-more_horiz Font18 textTertiary Hand" />
                  </MoreBtnCon>
                </Trigger>
              )}

              <Tooltip placement="right" title={isMarked ? _l('取消标星') : _l('标星')}>
                <i
                  className={cx(
                    `star icon icon-${isMarked ? 'task-star' : 'star_outline'} Font18 textTertiary mLeft5 stopPropagation`,
                    {
                      isMarked,
                    },
                  )}
                  onClick={() => onMark(id)}
                />
              </Tooltip>
            </VerticalMiddle>
            {itemType !== 'star' && count !== 0 && <span className="num textTertiary">{count}</span>}
            {itemType !== 'star' && isMarked && <i className={cx('visibleStar icon-task-star Font18  mLeft8')} />}
          </React.Fragment>
        )}
      </VerticalMiddle>
    </GroupItemCon>
  );
  if (id || to) {
    return (
      <GroupItemLink
        className={cx({ isDragging })}
        to={to || `/app/my/group/${projectId}/${groupType}/${id}${itemType === 'star' ? '#star' : ''}`}
      >
        {content}
      </GroupItemLink>
    );
  } else {
    return content;
  }
}

GroupItem.propTypes = {
  className: string,
  itemType: string,
  id: string,
  groupType: number,
  icon: string,
  fontIcon: string,
  iconUrl: string,
  count: number,
  isMarked: bool,
  onClick: func,
  onEdit: func,
  onDelete: func,
  onMark: func,
};
