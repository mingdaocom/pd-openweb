import React, { useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Menu, MenuItem } from 'ming-ui';

const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const MenuCon = styled.div`
  > .Menu {
    position: relative !important;
  }
`;

export const Button = styled.div`
  overflow: hidden;
  display: inline-flex;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  color: #151515;
  border: 1px solid #dddddd;
  font-size: 13px;
  .content {
    padding: 0 16px;
    display: inline-flex;
    align-items: center;
    font-weight: bold;
    > .icon {
      color: #9e9e9e;
      font-weight: normal;
    }
  }
  &:not(.disabled) {
    .content:hover {
      background-color: #f5f5f5;
    }
  }
  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: transparent;
  }
`;

const DropIcon = styled.span`
  position: relative;
  display: inline-block;
  width: 36px;
  text-align: center;
  cursor: pointer;
  color: #151515;
  height: 34px;
  &:hover {
    background-color: #f5f5f5;
  }
  &:before {
    position: absolute;
    content: '';
    width: 1px;
    height: 16px;
    top: 10px;
    left: -0.5px;
    background-color: #ddd;
  }
`;

/**
 * 通用下拉按钮组件
 * @param {string} buttonText - 按钮显示的文本
 * @param {string} icon - 按钮图标类名
 * @param {Array} dropdownItems - 下拉菜单项数组，每项包含text和onClick
 * @param {Function} onClick - 按钮点击事件
 * @param {boolean} disabled - 是否禁用按钮
 * @param {string} className - 附加的CSS类名
 */
const GenericDropdownButton = ({ buttonText, icon, dropdownItems, onClick, disabled, className }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const conRef = useRef();

  const hasDropdown = dropdownItems && dropdownItems.length > 0;

  return (
    <Con ref={conRef}>
      <Trigger
        zIndex={999}
        popupVisible={menuVisible}
        actions={['click']}
        getPopupContainer={() => conRef.current}
        onPopupVisibleChange={setMenuVisible}
        popup={
          <MenuCon>
            <Menu
              style={{ top: 0 }}
              onClickAwayExceptions={['.dropdownButtonIcon']}
              onClickAway={() => setMenuVisible(false)}
            >
              {dropdownItems &&
                dropdownItems.map((item, index) => (
                  <MenuItem key={index} onClick={item.onClick}>
                    {item.text}
                  </MenuItem>
                ))}
            </Menu>
          </MenuCon>
        }
        popupClassName="filterTrigger"
        destroyPopupOnHide
        popupAlign={{
          offset: [0, 4],
          points: ['tl', 'bl'],
          overflow: { adjustY: true },
        }}
      >
        <Button className={cx(className, { disabled })} onClick={!disabled ? onClick : undefined}>
          <div className="content">
            {icon && <i className={`icon ${icon} mRight5 Font16`}></i>}
            {buttonText || _l('按钮')}
          </div>
          {hasDropdown && (
            <DropIcon
              className="dropdownButtonIcon"
              onClick={e => {
                e.stopPropagation();
                setMenuVisible(true);
              }}
            >
              <i className="icon icon-arrow-down"></i>
            </DropIcon>
          )}
        </Button>
      </Trigger>
    </Con>
  );
};

GenericDropdownButton.propTypes = {
  buttonText: PropTypes.string,
  icon: PropTypes.string,
  dropdownItems: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  ),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default GenericDropdownButton;
