import React, { useState } from 'react';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { Menu, MenuItem } from 'ming-ui';
import _ from 'lodash';

const Con = styled.div`
  display: flex;
  flex-direction: row;
  height: 32px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e6e6e6;
  color: #757575;
  font-weight: bold;
  font-size: 13px;
  user-select: none;
  .content {
    flex: 1;
    line-height: 30px;
    padding: 0 16px;
  }
  &:not(.disabled) {
    .content {
      cursor: pointer;
    }
    &:hover {
      color: #2196f3;
      border-color: #2196f3;
    }
  }
  &.disabled {
    .content {
      cursor: not-allowed;
      color: #ccc;
    }
  }
  &.hasDownList {
    .content {
      padding-right: 8px;
    }
  }
`;

const DropdownIcon = styled.div`
  position: relative;
  display: inline-block;
  padding: 0 12px 0 8px;
  cursor: pointer;
  text-align: center;
  line-height: 30px;
  .icon {
    font-size: 12px;
    color: #757575;
  }
  &::before {
    content: '';
    height: 13px;
    position: absolute;
    left: 0px;
    top: 8.5px;
    border-left: 1px solid #ededed;
  }
  &:hover {
    .icon {
      color: #2196f3;
    }
  }
`;

export default function SaveButton(props) {
  const { disabled, downList, onClick } = props;
  const [popupVisible, setPopupVisible] = useState();
  const hasDownList = _.isArray(downList) && !_.isEmpty(downList);
  const content = (
    <Con className={cx({ hasDownList, disabled })}>
      <div className="content" onClick={!disabled && onClick}>
        {_l('保存')}
      </div>
      {hasDownList && (
        <DropdownIcon onClick={() => setPopupVisible(true)}>
          <i className="icon icon-arrow-down"></i>
        </DropdownIcon>
      )}
    </Con>
  );
  if (hasDownList) {
    return (
      <Trigger
        action={['click']}
        popupVisible={popupVisible}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 4],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
        popup={
          <Menu className="Relative" style={{ width: 140 }}>
            {downList.map((item, i) => (
              <MenuItem
                key={i}
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) {
                    return;
                  }
                  item.onClick();
                  setPopupVisible(false);
                }}
              >
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        }
        onPopupVisibleChange={newVisible => {
          if (!newVisible) {
            setPopupVisible(false);
          }
        }}
      >
        {content}
      </Trigger>
    );
  }
  return content;
}
