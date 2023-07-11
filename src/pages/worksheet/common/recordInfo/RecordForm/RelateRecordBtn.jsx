import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { Menu, MenuItem } from 'ming-ui';

const Con = styled.div`
  position: relative;
`;

const MenuCon = styled.div`
  position: absolute;
`;

export const Button = styled.div`
  display: inline-flex;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  color: #333;
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
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

const DropIcon = styled.span`
  position: relative;
  display: inline-block;
  width: 36px;
  text-align: center;
  cursor: pointer;
  color: #333;
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

export default function RelateRecordBtn(props) {
  const { entityName, addVisible, selectVisible, onNew, onSelect } = props;
  const [menuVisible, setMenuVisible] = useState();
  const conRef = useRef();
  const btnText = addVisible ? _l('新建%0', entityName) : _l('选择%0', entityName);
  const iconName = addVisible ? 'icon-plus' : 'icon-link_record';
  const btnClick = addVisible ? onNew : onSelect;
  return (
    <Con ref={conRef}>
      <Trigger
        popupVisible={menuVisible && addVisible && selectVisible}
        actions={['click']}
        getPopupContainer={() => conRef.current}
        onPopupVisibleChange={setMenuVisible}
        popup={
          <MenuCon>
            <Menu
              style={{ top: 0 }}
              onClickAwayExceptions={['.relateRecordBtnDropIcon']}
              onClickAway={() => setMenuVisible(false)}
            >
              <MenuItem onClick={onNew}>{_l('新建%0', entityName)}</MenuItem>
              <MenuItem onClick={onSelect}>{_l('关联已有%0', entityName)}</MenuItem>
            </Menu>
          </MenuCon>
        }
        popupClassName="filterTrigger"
        destroyPopupOnHide
        popupAlign={{
          offset: [0, 4],
          points: ['tl', 'bl'],
        }}
      >
        <Button onClick={btnClick}>
          <div className="content">
            <i className={`icon ${iconName} mRight5 Font16`}></i>
            {btnText}
          </div>
          {addVisible && selectVisible && (
            <DropIcon
              className="relateRecordBtnDropIcon"
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
}

RelateRecordBtn.propTypes = {
  entityName: PropTypes.string,
  addVisible: PropTypes.bool,
  selectVisible: PropTypes.bool,
  onNew: PropTypes.func,
  onSelect: PropTypes.func,
};
